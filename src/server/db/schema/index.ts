/**
 * Domain schema contracts (Phase 0+).
 *
 * Future tables MUST include:
 * - uuid primary key
 * - user_id uuid not null references profiles(id) / auth.users
 * - created_at, updated_at, deleted_at (soft delete)
 * - index on user_id
 * - RLS: user_id = auth.uid()
 */
export { auditColumns } from "./audit";
export { profiles, type Profile, type NewProfile } from "./profiles";
