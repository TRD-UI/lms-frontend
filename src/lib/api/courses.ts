import { supabase } from "@/lib/supabase";
import { toKobo, toNaira } from "@/lib/money";
import type { Course, CourseModule, FeeStructure, ModuleItem } from "@/data/types";
import type { Database } from "@/types/database";

type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];

/**
 * Course data access.
 *
 * The app's domain type is `Course` from `src/data/types`. These functions are
 * the only place that knows the database shape, so pages and the store keep
 * working against the same interface the mock data used.
 *
 * Money crosses here too: the database holds kobo, the UI holds naira.
 */

type CourseRow = {
    id: string;
    title: string;
    description: string;
    duration: string;
    location: string;
    category: string;
    seats_total: number;
    fee_type: "flat" | "tiered";
    fee_amount: number | null;
    application_fee: number;
    status: "draft" | "published";
    image_url: string | null;
    instructor_id: string | null;
    instructor: { name: string } | null;
    course_fee_tiers: { name: string; amount: number; position: number }[];
    course_modules: {
        id: string;
        title: string;
        position: number;
        module_items: {
            id: string;
            title: string;
            type: ModuleItem["type"];
            storage_path: string | null;
            external_url: string | null;
            assessment_id: string | null;
            notes: string | null;
            position: number;
        }[];
    }[];
};

/**
 * Everything a Course needs in one round trip. Seats-taken and progress come
 * from separate aggregates — see `decorateCourses`.
 */
const COURSE_SELECT = `
  id, title, description, duration, location, category, seats_total,
  fee_type, fee_amount, application_fee, status, image_url, instructor_id,
  instructor:profiles!courses_instructor_id_fkey ( name ),
  course_fee_tiers ( name, amount, position ),
  course_modules (
    id, title, position,
    module_items ( id, title, type, storage_path, external_url, assessment_id, notes, position )
  )
`;

function toFees(row: CourseRow): FeeStructure {
    if (row.fee_type === "tiered") {
        return {
            type: "tiered",
            tiers: [...row.course_fee_tiers]
                .sort((a, b) => a.position - b.position)
                .map((t) => ({ name: t.name, amount: toNaira(t.amount) })),
        };
    }
    return { type: "flat", amount: toNaira(row.fee_amount ?? 0) };
}

function toModules(row: CourseRow): CourseModule[] {
    return [...(row.course_modules ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((m) => ({
            id: m.id,
            title: m.title,
            items: [...(m.module_items ?? [])]
                .sort((a, b) => a.position - b.position)
                .map((i) => ({
                    id: i.id,
                    title: i.title,
                    type: i.type,
                    // A stored object is read through a signed URL at play time;
                    // external_url covers content hosted elsewhere.
                    url: i.external_url ?? i.storage_path ?? undefined,
                    assessmentId: i.assessment_id ?? undefined,
                    notes: i.notes ?? undefined,
                })),
        }));
}

function toCourse(row: CourseRow, seatsTaken: number): Course {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        duration: row.duration,
        location: row.location,
        category: row.category,
        seats: { enrolled: seatsTaken, total: row.seats_total },
        fees: toFees(row),
        modules: toModules(row),
        imageUrl: row.image_url ?? undefined,
        instructorId: row.instructor_id ?? undefined,
        instructorName: row.instructor?.name ?? undefined,
        status: row.status,
    };
}

export async function fetchCourses(): Promise<Course[]> {
    const [{ data: rows, error }, { data: counts }] = await Promise.all([
        supabase.from("courses").select(COURSE_SELECT).order("created_at", { ascending: true }),
        supabase.from("course_seat_counts").select("course_id, seats_taken"),
    ]);
    if (error) throw error;

    const taken = new Map((counts ?? []).map((c) => [c.course_id, Number(c.seats_taken) || 0]));
    return ((rows ?? []) as unknown as CourseRow[]).map((r) => toCourse(r, taken.get(r.id) ?? 0));
}

// ─── Courses ─────────────────────────────────────────────────────────────────

/** Application fee for one course, in naira. */
export async function fetchApplicationFee(courseId: string): Promise<number> {
    const { data, error } = await supabase
        .from("courses")
        .select("application_fee")
        .eq("id", courseId)
        .single();
    if (error) throw error;
    return toNaira(data.application_fee ?? 0);
}

export interface CourseInput {
    /**
     * Chosen by the caller so the cover image can be uploaded under the
     * course's own folder before the row exists. Omit to let Postgres
     * generate one.
     */
    id?: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    location: string;
    seatsTotal: number;
    fees: FeeStructure;
    status: "draft" | "published";
    imageUrl?: string;
    instructorId?: string;
}

/** Fee tiers live in their own table, so they are rewritten whenever fees change. */
async function replaceFeeTiers(courseId: string, fees: FeeStructure) {
    await supabase.from("course_fee_tiers").delete().eq("course_id", courseId);
    if (fees.type !== "tiered" || !fees.tiers?.length) return;
    const { error } = await supabase.from("course_fee_tiers").insert(
        fees.tiers.map((t, i) => ({
            course_id: courseId,
            name: t.name,
            amount: toKobo(t.amount),
            position: i,
        }))
    );
    if (error) throw error;
}

export async function createCourse(input: CourseInput): Promise<string> {
    const { data, error } = await supabase
        .from("courses")
        .insert({
            ...(input.id ? { id: input.id } : {}),
            title: input.title,
            description: input.description,
            category: input.category,
            duration: input.duration,
            location: input.location,
            seats_total: input.seatsTotal,
            fee_type: input.fees.type,
            fee_amount: input.fees.type === "flat" ? toKobo(input.fees.amount ?? 0) : null,
            status: input.status,
            image_url: input.imageUrl ?? null,
            instructor_id: input.instructorId ?? null,
        })
        .select("id")
        .single();
    if (error) throw error;

    await replaceFeeTiers(data.id, input.fees);
    return data.id;
}

export async function updateCourse(id: string, patch: Partial<CourseInput>): Promise<void> {
    const row: CourseUpdate = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.duration !== undefined) row.duration = patch.duration;
    if (patch.location !== undefined) row.location = patch.location;
    if (patch.seatsTotal !== undefined) row.seats_total = patch.seatsTotal;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl || null;
    if (patch.instructorId !== undefined) row.instructor_id = patch.instructorId || null;
    if (patch.fees !== undefined) {
        row.fee_type = patch.fees.type;
        row.fee_amount = patch.fees.type === "flat" ? toKobo(patch.fees.amount ?? 0) : null;
    }

    if (Object.keys(row).length > 0) {
        const { error } = await supabase.from("courses").update(row).eq("id", id);
        if (error) throw error;
    }
    if (patch.fees !== undefined) await replaceFeeTiers(id, patch.fees);
}

export async function deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export async function addModule(courseId: string, title: string, position: number): Promise<string> {
    const { data, error } = await supabase
        .from("course_modules")
        .insert({ course_id: courseId, title, position })
        .select("id")
        .single();
    if (error) throw error;
    return data.id;
}

export async function updateModule(id: string, patch: { title?: string; position?: number }) {
    const { error } = await supabase.from("course_modules").update(patch).eq("id", id);
    if (error) throw error;
}

export async function deleteModule(id: string) {
    const { error } = await supabase.from("course_modules").delete().eq("id", id);
    if (error) throw error;
}

/** Reordering writes both rows, since `position` is what the player sorts on. */
export async function swapModulePositions(a: { id: string; position: number }, b: { id: string; position: number }) {
    await updateModule(a.id, { position: b.position });
    await updateModule(b.id, { position: a.position });
}

// ─── Module items ────────────────────────────────────────────────────────────

export interface ModuleItemInput {
    title: string;
    type: ModuleItem["type"];
    url?: string;
    assessmentId?: string;
    notes?: string;
}

/** Storage paths and absolute URLs land in different columns. */
function itemColumns(input: ModuleItemInput) {
    const isRemote = !!input.url && /^https?:\/\//i.test(input.url);
    return {
        title: input.title,
        type: input.type,
        external_url: input.type === "quiz" ? null : isRemote ? input.url : null,
        storage_path: input.type === "quiz" ? null : isRemote ? null : input.url ?? null,
        assessment_id: input.type === "quiz" ? input.assessmentId ?? null : null,
        notes: input.notes ?? null,
    };
}

export async function addModuleItem(moduleId: string, input: ModuleItemInput, position: number) {
    const { error } = await supabase
        .from("module_items")
        .insert({ module_id: moduleId, position, ...itemColumns(input) });
    if (error) throw error;
}

export async function updateModuleItem(id: string, input: ModuleItemInput) {
    const { error } = await supabase.from("module_items").update(itemColumns(input)).eq("id", id);
    if (error) throw error;
}

export async function deleteModuleItem(id: string) {
    const { error } = await supabase.from("module_items").delete().eq("id", id);
    if (error) throw error;
}

export async function swapItemPositions(a: { id: string; position: number }, b: { id: string; position: number }) {
    await supabase.from("module_items").update({ position: b.position }).eq("id", a.id);
    await supabase.from("module_items").update({ position: a.position }).eq("id", b.id);
}

// ─── Enrollment ──────────────────────────────────────────────────────────────

/** Course ids the signed-in learner is enrolled on. */
export async function fetchMyEnrolledCourseIds(): Promise<string[]> {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return [];

    const { data, error } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", me.user.id)
        .in("status", ["active", "completed"]);
    if (error) throw error;
    return (data ?? []).map((e) => e.course_id);
}

// ─── Cover image ─────────────────────────────────────────────────────────────

/**
 * Uploads a course cover and returns its public URL.
 *
 * `courseId` may be an id that does not exist yet — the form generates one so
 * the image can be chosen before the course is saved. The bucket is public, so
 * the returned URL needs no signing.
 */
/**
 * Removes every cover uploaded for a course.
 *
 * Must run while the course row still exists: the bucket's delete policy is
 * `owns_course(<first path segment>)`, and ownership cannot be established
 * once the row is gone.
 */
export async function deleteCourseImages(courseId: string): Promise<void> {
    const { data, error } = await supabase.storage.from("course-images").list(courseId);
    if (error || !data?.length) return;
    await supabase.storage
        .from("course-images")
        .remove(data.map((object) => `${courseId}/${object.name}`));
}

export async function uploadCourseImage(courseId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${courseId}/cover-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from("course-images")
        .upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw error;

    return supabase.storage.from("course-images").getPublicUrl(path).data.publicUrl;
}
