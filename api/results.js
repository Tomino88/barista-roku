export const config = { runtime: 'edge' };

const SUPA_URL = 'https://cggujadkrrrbeuuxitmm.supabase.co';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

// ── Scoring (mirrors index.html logic) ───────────────────────
const fv0 = v => {
  const n = parseFloat(v);
  return (v !== null && v !== '' && !isNaN(n)) ? n : 0;
};
const fy0 = v => (v === 1 ? 1 : v === 0 ? 0 : 0);

function sensoryScore(sj) {
  const p1 = fy0(sj.s_crema)
    + fv0(sj.s_esp_taste_desc) * 4 + fv0(sj.s_esp_tactile_desc) * 2
    + fv0(sj.s_esp_taste_exp) * 3 + fv0(sj.s_esp_tactile_exp) * 2;
  const p2 = fv0(sj.s_milk_visual)
    + fv0(sj.s_milk_taste_desc) * 4 + fv0(sj.s_milk_taste_exp) * 3;
  const p3 = fv0(sj.s_sig_acc_taste) * 4
    + fv0(sj.s_sig_well_explained) * 2 + fv0(sj.s_sig_taste_exp) * 3;
  const p4 = fv0(sj.s_attention) * 2
    + fv0(sj.s_presentation) * 3 + fv0(sj.s_coffee_knowledge) * 2;
  const p5 = fv0(sj.s_total_impression) * 2;
  return p1 + p2 + p3 + p4 + p5;
}

function techScore(s) {
  const p1 = fv0(s.t_clean_start);
  const p2 = fy0(s.t_esp_flush) + fy0(s.t_esp_dry) + fy0(s.t_esp_clean_pf)
    + fy0(s.t_esp_brew) + fy0(s.t_esp_time) + fv0(s.t_esp_waste) + fv0(s.t_esp_dose);
  const p3 = fy0(s.t_milk_flush) + fy0(s.t_milk_dry) + fy0(s.t_milk_clean_pf)
    + fy0(s.t_milk_brew) + fy0(s.t_milk_time) + fy0(s.t_milk_empty)
    + fy0(s.t_milk_purge_before) + fy0(s.t_milk_clean_wand) + fy0(s.t_milk_purge_after)
    + fy0(s.t_milk_waste_ml) + fv0(s.t_milk_waste_g) + fv0(s.t_milk_dose);
  const p4 = fy0(s.t_sig_flush) + fy0(s.t_sig_dry) + fy0(s.t_sig_clean_pf)
    + fy0(s.t_sig_brew) + fy0(s.t_sig_time) + fv0(s.t_sig_waste) + fv0(s.t_sig_dose);
  const p5 = fv0(s.t_station) + fy0(s.t_clean_pf_spouts) + fy0(s.t_hygiene) + fy0(s.t_cloths);
  return p1 + p2 + p3 + p4 + p5;
}

function timePen(t) {
  if (!t) return 0;
  const [m, s] = t.split(':').map(Number);
  if (isNaN(m) || isNaN(s)) return 0;
  return Math.max(0, Math.min((m * 60 + s) - 900, 60));
}
function isDQ(t) {
  if (!t) return false;
  const [m, s] = t.split(':').map(Number);
  return !isNaN(m) && !isNaN(s) && (m * 60 + s) > 960;
}

function calcScore(sd) {
  if (!sd) return { total: 0, dq: false };
  if (isDQ(sd.time)) return { total: null, dq: true };
  const pen = timePen(sd.time);
  const tech = techScore(sd) * 2;
  const sensory = (sd.sensory || []).reduce((sum, sj) => sum + sensoryScore(sj), 0);
  return { total: tech + sensory - pen, dq: false };
}

// ── Handler ───────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'Misconfiguration' }), { status: 500, headers: CORS });

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const [compsRes, scoresRes] = await Promise.all([
    fetch(`${SUPA_URL}/rest/v1/competitors?select=id,name,phase,start_order,final_order`, { headers }),
    fetch(`${SUPA_URL}/rest/v1/scores?select=competitor_id,data`, { headers }),
  ]);

  if (!compsRes.ok || !scoresRes.ok) {
    return new Response(JSON.stringify({ error: 'DB error' }), { status: 502, headers: CORS });
  }

  const competitors = await compsRes.json();
  const scoresRaw = await scoresRes.json();

  const scoresMap = {};
  for (const row of scoresRaw) scoresMap[row.competitor_id] = row.data;

  const score = c => calcScore(scoresMap[c.id]);

  // Semi — sort by score desc, fallback to start_order asc
  const semi = competitors
    .filter(c => c.phase === 'semi')
    .map(c => ({ ...c, s: score(c) }))
    .sort((a, b) => {
      if (a.s.dq && !b.s.dq) return 1;
      if (!a.s.dq && b.s.dq) return -1;
      if (b.s.total !== a.s.total) return (b.s.total || 0) - (a.s.total || 0);
      const ao = a.start_order != null ? a.start_order : 9999;
      const bo = b.start_order != null ? b.start_order : 9999;
      return ao - bo;
    })
    .map((c, i) => ({ rank: i + 1, name: c.name, score: c.s.dq ? null : +(c.s.total || 0).toFixed(1), dq: c.s.dq || undefined, phase: 'semi' }));

  // Final — sort by final_order, fallback to score
  const medals = ['gold', 'silver', 'bronze'];
  const final = competitors
    .filter(c => c.phase === 'final')
    .map(c => ({ ...c, s: score(c) }))
    .sort((a, b) => {
      const ao = a.final_order != null ? a.final_order : 9999;
      const bo = b.final_order != null ? b.final_order : 9999;
      if (ao !== bo) return ao - bo;
      return (b.s.total || 0) - (a.s.total || 0);
    })
    .map((c, i) => ({
      rank: i + 1,
      name: c.name,
      score: c.s.dq ? null : +(c.s.total || 0).toFixed(1),
      ...(c.s.dq ? { dq: true } : {}),
      ...(i < 3 ? { medal: medals[i] } : {}),
      phase: 'final',
    }));

  // Junior — sort by score desc, fallback to start_order
  const junior = competitors
    .filter(c => c.phase === 'junior')
    .map(c => ({ ...c, s: score(c) }))
    .sort((a, b) => {
      if (a.s.dq && !b.s.dq) return 1;
      if (!a.s.dq && b.s.dq) return -1;
      if (b.s.total !== a.s.total) return (b.s.total || 0) - (a.s.total || 0);
      const ao = a.start_order != null ? a.start_order : 9999;
      const bo = b.start_order != null ? b.start_order : 9999;
      return ao - bo;
    })
    .map((c, i) => ({ rank: i + 1, name: c.name, score: c.s.dq ? null : +(c.s.total || 0).toFixed(1), ...(c.s.dq ? { dq: true } : {}), phase: 'junior' }));

  return new Response(
    JSON.stringify({ updated_at: new Date().toISOString(), semi, final, junior }),
    { status: 200, headers: CORS }
  );
}
