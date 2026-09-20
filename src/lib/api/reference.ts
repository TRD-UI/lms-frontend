import { supabase } from "@/lib/supabase";

/**
 * Reference data behind the course form and the class scheduler.
 *
 * Both are admin-owned: an instructor picks from the list, an admin decides
 * what is on it. Reads are public so the catalog can render for a visitor.
 */

export interface Venue {
    id: string;
    name: string;
    capacity: number;
}

export async function fetchCategories(): Promise<string[]> {
    const { data, error } = await supabase.from("course_categories").select("name").order("name");
    if (error) throw error;
    return (data ?? []).map((c) => c.name);
}

export async function addCategory(name: string): Promise<void> {
    const { error } = await supabase.from("course_categories").insert({ name });
    if (error) throw error;
}

export async function deleteCategory(name: string): Promise<void> {
    const { error } = await supabase.from("course_categories").delete().eq("name", name);
    if (error) throw error;
}

export async function fetchVenues(): Promise<Venue[]> {
    const { data, error } = await supabase.from("venues").select("id, name, capacity").order("name");
    if (error) throw error;
    return data ?? [];
}

export async function addVenue(name: string, capacity: number): Promise<void> {
    const { error } = await supabase.from("venues").insert({ name, capacity });
    if (error) throw error;
}

export async function updateVenue(id: string, patch: Partial<Omit<Venue, "id">>): Promise<void> {
    const { error } = await supabase.from("venues").update(patch).eq("id", id);
    if (error) throw error;
}

export async function deleteVenue(id: string): Promise<void> {
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) throw error;
}
