// Bundle entry for the seed generator. Re-exports exactly the seed data that
// scripts/gen-seed.mjs turns into SQL.
export { courses, courseMetadata, purchasedCourseIds, courseCategories } from "@/data/courses";
export { assessments, seedAttempts } from "@/data/assessments";
export { adminUsers, waitlistEntries, syncLogs, auditLogs, venueUsage } from "@/data/admin";
export { instructorCohorts } from "@/data/instructor";
export { entryPasses } from "@/data/entry-passes";
export { certificates } from "@/data/certificates";
export { notifications } from "@/data/notifications";
export { transactions, paymentMethods } from "@/data/analytics";
