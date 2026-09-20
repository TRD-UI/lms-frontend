/**
 * Seeded short id → the UUID that row has in Supabase.
 *
 * TEMPORARY BRIDGE. Courses, modules and lessons now load from Supabase with
 * real UUIDs, while assessments, attempts, classes and passes are still seeded
 * with short ids (1, as-3, 1-1). Without a single id space the two halves
 * cannot reference each other — a quiz lesson could not find its assessment,
 * and a seeded assessment could not find its course.
 *
 * Generated with the same UUID v5 derivation the seed generator uses, so it
 * cannot drift. Delete each map as its table moves to Supabase.
 */
export const COURSE_UUID: Record<string, string> = {
    "1": "577ea935-461d-53d4-b88b-52ee31473d1b", // Tech Odyssey
    "2": "a011cbb4-addf-58ac-b215-075d496c936f", // Web Development
    "3": "e56df1b0-d187-50bb-911c-a77deba8e2dd", // Python Programming
    "4": "556e576c-a311-5e54-bf14-34d9d37c7184", // Digital Literacy
    "5": "829f6967-e9a3-5172-9892-963a17018cb2", // ArcGIS & Spatial Analysis
    "6": "6c7571e3-9a65-5a1c-abf4-4161116d4da3", // Data Analysis / Data Analytics
    "7": "466129d2-af54-51a4-b4f4-41b16cee9eb9", // DATA PROCESSING
    "8": "d14b913d-d2d5-575b-a6d5-d9f012c0d6cf", // Digital Productivity Tools
    "9": "e4df4b90-8a0a-5e3c-9e30-a7c0d053a927", // Generative AI
    "10": "1297a671-9773-5184-b07d-5038714a7d33", // Routing & Wireless Networking
    "11": "e892e7df-1cfb-5379-9b12-924c9812a944", // Basic Computer Networking
    "13": "505771c5-aa1d-5a7b-9173-395eaee4fc14", // Data Science
    "14": "b4584a3f-bcd0-5a1e-be81-2577f820cbfc", // Cybersecurity
    "15": "1296b991-4846-55c9-bed5-a9d8a3a31ad4", // Digital Marketing
};

export const MODULE_UUID: Record<string, string> = {
    "1-1": "7d341255-a8ef-56ff-a45e-22795a1f2768", // Web Foundation (HTML/CSS/JS)
    "1-2": "8a903244-6a42-5a16-9a38-0a07757c97c1", // Styling & Layout Systems
    "1-3": "e435e266-3217-5981-93c8-139ce95ae822", // Programming with JavaScript & Python
    "2-1": "e3c86a31-a93b-5e58-9c9d-b2728d9dcbc6", // Frontend Mastery
    "3-1": "292b3965-f7bd-5506-b550-3ff5733632f5", // Python Basics
    "3-2": "6069c09e-8d12-57ec-abaf-0141671328ec", // Control Flow & Collections
    "3-3": "872c5ab2-5dec-5061-aa13-dec7f58cdeba", // Certification
    "4-1": "205cf578-2285-5f43-abbf-1d3eeaed7ac5", // Digital Foundations
    "5-1": "a877ed61-c220-5ce4-b952-9600471a2375", // ArcGIS Intro
    "6-1": "be221ce8-0591-5c71-9e40-4ee182565039", // Data Tools
    "7-1": "e7bec537-c63c-56ad-90c7-3c507c9256bd", // Word & Excel
    "8-1": "5e8f2db5-e5d9-5e2a-b0fc-0ee657528c98", // Collaboration
    "9-1": "a2ccde09-4ce1-56d1-93e6-9a6d2ed6b6b0", // AI Basics
    "10-1": "afcb7d0a-9910-52b9-ba55-4e27de994ab5", // MikroTik Setup
    "11-1": "c9fbe03f-bdfb-5cdc-acef-ef22b4de54ee", // Networking Basics
    "13-1": "fa4bd05a-5d66-5eea-ac1a-239a65739562", // Data Analysis
    "14-1": "968c97c3-d787-5525-afba-39ea278eea90", // Security Labs
    "15-1": "74b401bf-e3f9-5250-9c9b-f10ae868aaad", // SEO Strategy
};

export const ASSESSMENT_UUID: Record<string, string> = {
    "as-1": "ee51b273-4c43-55a7-a17a-10ab033fb324", // Digital Readiness Check
    "as-2": "873e4a25-652f-5e92-90aa-f729dd1fc890", // Web Foundation Checkpoint
    "as-3": "7a66d1aa-ca17-5d34-9f1d-54594cba3301", // Tech Odyssey Capstone
    "as-4": "afc4d8d1-7e06-5718-8212-10b34c6677eb", // Frontend Entry Test
    "as-5": "b3239c3f-027e-525a-8dee-e1284ea0c8ff", // Responsive Design Final
    "as-6": "fb3b8c2c-9f92-51d3-99d0-2a10bfb0c87b", // Python Readiness Check
    "as-7": "0da77ac4-5265-526e-a4ed-5fe3045df8e7", // Control Flow Checkpoint
    "as-8": "207e7804-3038-530d-8174-4d70e3325f35", // Python Certification Exam
    "as-9": "f6548efa-d28c-503b-81a5-b0804bfe2add", // Computer Basics Entry Test
    "as-10": "0a2d6c51-0499-5188-809f-d80fe71a12f1", // Productivity Tools Final
    "as-11": "bc2a0b09-a292-55cb-91c3-32b956306fa6", // AI Foundations Check
    "as-12": "9555d6f9-7e12-5802-8633-eaa5c6fb5793", // Statistics Readiness
    "as-13": "edf89185-a313-5b23-8d77-32d0847efb35", // Modelling Final Exam
    "as-14": "e1c10126-13e4-55fa-9ec2-6d1a67684782", // Security Fundamentals Gate
    "as-15": "2b5d39a2-2377-59b1-8e13-e29232e297f8", // Threat Modelling Checkpoint
    "as-16": "f761b6b3-706a-58db-ba68-9dcb9b23a964", // Cybersecurity Certification Exam
    "as-17": "f0e86781-bb94-5715-9ff5-fb7eeaa1119f", // Marketing Fundamentals Check
    "as-18": "4e09d118-38cb-5330-a540-f4fe75c676e0", // Cybersecurity Final Examination
};

const invert = (map: Record<string, string>) =>
    Object.fromEntries(Object.entries(map).map(([short, uuid]) => [uuid, short]));

/** UUID → the short id the seeded data still uses. */
export const ASSESSMENT_SHORT_ID = invert(ASSESSMENT_UUID);
export const COURSE_SHORT_ID = invert(COURSE_UUID);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_RE.test(value);

/** The id Supabase knows a course by. Passes real UUIDs straight through. */
export function toCourseUuid(courseId: string): string {
    return isUuid(courseId) ? courseId : COURSE_UUID[courseId] ?? courseId;
}

export function toModuleUuid(moduleId: string): string {
    return isUuid(moduleId) ? moduleId : MODULE_UUID[moduleId] ?? moduleId;
}

/** The id the seeded assessment list knows a row by. */
export function toAssessmentShortId(assessmentId: string): string {
    return ASSESSMENT_SHORT_ID[assessmentId] ?? assessmentId;
}

/** Storage paths and RLS key off the course UUID. Null when there is no row. */
export function storageCourseId(courseId: string): string | null {
    if (isUuid(courseId)) return courseId;
    return COURSE_UUID[courseId] ?? null;
}
