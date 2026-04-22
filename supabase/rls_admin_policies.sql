-- RLS policies: admin/viewer role system
-- Run this in Supabase Dashboard > SQL Editor
-- Admin role is stored in auth.users.raw_user_meta_data->>'role'
-- In JWT it is accessible as auth.jwt()->'user_metadata'->>'role'

-- ── COMPETITORS ───────────────────────────────────────────────
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitors_select" ON competitors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "competitors_insert_admin" ON competitors
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role')='admin');

CREATE POLICY "competitors_update_admin" ON competitors
  FOR UPDATE TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role')='admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role')='admin');

CREATE POLICY "competitors_delete_admin" ON competitors
  FOR DELETE TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role')='admin');

-- ── SCORES ────────────────────────────────────────────────────
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select" ON scores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "scores_insert_admin" ON scores
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role')='admin');

CREATE POLICY "scores_update_admin" ON scores
  FOR UPDATE TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role')='admin')
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role')='admin');

-- ── SCANS ─────────────────────────────────────────────────────
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scans_select" ON scans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "scans_insert_admin" ON scans
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()->'user_metadata'->>'role')='admin');

CREATE POLICY "scans_delete_admin" ON scans
  FOR DELETE TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'role')='admin');

-- ── JUDGES ────────────────────────────────────────────────────
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "judges_select" ON judges
  FOR SELECT TO authenticated USING (true);
