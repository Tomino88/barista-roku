# Barista Roku — HANDOFF

## Projekt
Scorekeeping appka pro Czech Barista Championship 2026 (semi, final, junior).

## URLs
- Live: https://barista-roku.vercel.app
- GitHub: https://github.com/Tomino88/barista-roku
- Vercel: https://vercel.com/tomino88s-projects/barista-roku
- Supabase: https://supabase.com → projekt barista-roku

## Supabase
- URL: https://cggujadkrrrbeuuxitmm.supabase.co
- Publishable key: sb_publishable_ekXbKIfiSWnRcw8dcjsNCg_pH1OO5qs
- Tabulky:
  - competitors: id, name, email, team, tech_team, phase, category, start_order, final_order, created_at
  - scores: competitor_id, data (JSON), updated_by, updated_at
  - scans: id, competitor_id, judge_label, file_path, file_name, uploaded_at, uploaded_by
    - judges: id, name, role ('sensory'|'technical'|'head'), team ('1'|'2'|'3' pro sensory semi; 'blue'|'purple' pro tech semi; '1'|'2' pro junior), phase ('semi'|'junior')
- Storage bucket: scans (max 10MB, jpg/png/pdf)
- Signed URL expiry: 7 dní (604800s) — pro email linky

## Public API
- Endpoint: https://barista-roku.vercel.app/api/results
- Autentizace: `Authorization: Bearer <RESULTS_API_TOKEN>` — vrátí 401 bez platného tokenu
- CORS *, vrací JSON s průběžnými výsledky
- Pole: `updated_at`, `semi`, `final`, `junior`
- Semi: seřazeno dle skóre (fallback start_order)
- Final: dle final_order (fallback skóre) + medal (gold/silver/bronze pro top 3)
- Junior: seřazeno dle skóre (fallback start_order)

## Email (Resend)
- Edge function: /api/send-email.js
- From: noreply@uctotom.cz
- Env vars nastaveny ve Vercel (Production + Preview + Development): ✅
  RESEND_API_KEY — nastaveno
  SUPABASE_SERVICE_ROLE_KEY — nastaveno
  RESULTS_API_TOKEN — nastaveno (hodnota: `8b50bf0154c7632b50fa5a85b86361d4`)

## Stack
- Frontend: vanilla HTML/JS, single file index.html
- Hosting: Vercel (auto-deploy z GitHub main branch)
- Backend: Supabase (Postgres + Auth + Storage)
- Region: West EU Paris

## Scoring (CBC 2026)

### Senior — Semi-Final & Final
- Sensory per judge: I=49, II=33, III=42, IV=30, V=12 → max 166
- Technical per judge: I=6, II=17, III=22, IV=17, V=9 → max 71
- Total Impression: ×2 (max /12 per judge) — odchylka od WBC 2025 (×4)
- Semi: 2 tech judges (T1 mirror T2) + 4 sensory judges → max 806
- Final: 2 tech judges + 4 sensory judges → max 806 (stejné jako semi)
- Penalizace: 1 bod/sekunda nad 15:00, max 60s penalty, DQ při >16:00

### Barista Junior
- Technical per judge: stejná struktura jako senior → max 71
- Sensory per judge (2 judges): I Espresso=49, II Milk=33, III Barista Eval=6 → max 88
- Total: 71×2 (tech) + 88×2 (sensory) = max 318
- Penalizace: stejná jako senior

## Záložky aplikace
- **Semi-Final**: 17 soutěžících, phase='semi', scoring max 806
- **Final**: auto top-6 ze semi (klikatelní), scoring max 806, final_order, medaile
- **Junior**: 5 soutěžících, phase='junior', scoring max 318
- **Results**: Senior/Junior přepínač, ranking tabulky

## Judges konfigurace (localStorage)
- Semi: vždy S1–S4 + T1+T2 (bez checkboxů)
- Final: T1/T2/S1/S2/S3/S4 checkboxy — `finalTechJudges`, `finalJudges`
- Junior: T1/T2/S1/S2 checkboxy — `juniorTechJudges`, `juniorSensoryJudges`

## Soutěžící — semifinále (pořadí startu 18.04.2026)
1. Milan Nedoma
2. Vojtěch Růžička
3. Tomáš Navara
4. Ondřej Cihlář
5. Filip Vu
6. Volodymyr Petrina
7. Vojtěch Formánek
8. Kateřina Štoksová
9. Natalia Ai Espitia
10. Anastasiia Pushkova
11. Robert Gadylshin
12. Miriam Fišerová
13. Anastasia Kharitonova
14. Lukáš Svárovský
15. Ondřej Kurka
16. Kamila Chobotová
17. Almaz Murat

## Soutěžící — Barista Junior (pořadí startu 18.04.2026)
1. Matěj Netik — matej.netik@horegas.cz
2. Adina Fraňková — lubor.havlik@soupolicka.cz
3. Tomáš Tran — lob.ino97@gmail.com
4. Tereza Váňová — vanovat1@hotelovkapodebrady.eu
5. Adéla Šmejkalová — smejkaa1@hotelovkapodebrady.eu

## SQL — Judges tabulka (spustit v Supabase SQL editoru)

```sql
-- 1. Tabulka judžů
CREATE TABLE IF NOT EXISTS judges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null, -- 'sensory', 'technical', 'head'
  team text,          -- '1','2','3' pro sensory; 'blue','purple' pro tech
  phase text default 'semi'
);

-- 2. Judiči
INSERT INTO judges (name, role, team, phase) VALUES
('Katalina',    'head',      '1',      'semi'),
('Eliška',      'sensory',   '1',      'semi'),
('Tereza',      'sensory',   '1',      'semi'),
('Tiaran',      'sensory',   '1',      'semi'),
('Valeria',     'sensory',   '1',      'semi'),
('Davide',      'head',      '2',      'semi'),
('Dominik',     'sensory',   '2',      'semi'),
('Elizaveta',   'sensory',   '2',      'semi'),
('Aiste',       'sensory',   '2',      'semi'),
('Tomo Pavlov', 'sensory',   '2',      'semi'),
('Jim',         'head',      '3',      'semi'),
('Nikola',      'sensory',   '3',      'semi'),
('Kamila',      'sensory',   '3',      'semi'),
('Joanna',      'sensory',   '3',      'semi'),
('Alesya',      'sensory',   '3',      'semi'),
('Peter',       'technical', 'blue',   'semi'),
('Milosz',      'technical', 'blue',   'semi'),
('Adam',        'technical', 'purple', 'semi'),
('Daniel',      'technical', 'purple', 'semi');

-- 3. Přidat tech_team do competitors
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS tech_team text DEFAULT 'blue';

-- 4. Junior judges
INSERT INTO judges (name, role, team, phase) VALUES
('Tereza',   'head',      null, 'junior'),
('Kamila',   'sensory',   '1',  'junior'),
('Eliška',   'sensory',   '2',  'junior'),
('Sandy',    'technical', '1',  'junior'),
('Viktoria', 'technical', '2',  'junior');
```

## TODO před soutěží
- [ ] Přiřadit soutěžící do Tým 1/2/3 podle rozpisu judžů:
      UPDATE competitors SET team = 'X' WHERE name = 'Jméno';

- [ ] Spustit v Supabase SQL editoru — start_order + final_order + category + junioři:

      -- Sloupce (pokud ještě neexistují)
      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS start_order int;
      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS final_order int;
      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS category text DEFAULT 'senior';

      -- Start order semi
      UPDATE competitors SET start_order = 1  WHERE name = 'Milan Nedoma';
      UPDATE competitors SET start_order = 2  WHERE name = 'Vojtěch Růžička';
      UPDATE competitors SET start_order = 3  WHERE name = 'Tomáš Navara';
      UPDATE competitors SET start_order = 4  WHERE name = 'Ondřej Cihlář';
      UPDATE competitors SET start_order = 5  WHERE name = 'Filip Vu';
      UPDATE competitors SET start_order = 6  WHERE name = 'Volodymyr Petrina';
      UPDATE competitors SET start_order = 7  WHERE name = 'Vojtěch Formánek';
      UPDATE competitors SET start_order = 8  WHERE name = 'Kateřina Štoksová';
      UPDATE competitors SET start_order = 9  WHERE name = 'Natalia Ai Espitia';
      UPDATE competitors SET start_order = 10 WHERE name = 'Anastasiia Pushkova';
      UPDATE competitors SET start_order = 11 WHERE name = 'Robert Gadylshin';
      UPDATE competitors SET start_order = 12 WHERE name = 'Miriam Fišerová';
      UPDATE competitors SET start_order = 13 WHERE name = 'Anastasia Kharitonova';
      UPDATE competitors SET start_order = 14 WHERE name = 'Lukáš Svárovský';
      UPDATE competitors SET start_order = 15 WHERE name = 'Ondřej Kurka';
      UPDATE competitors SET start_order = 16 WHERE name = 'Kamila Chobotová';
      UPDATE competitors SET start_order = 17 WHERE name = 'Almaz Murat';

      -- Junior soutěžící (pokud ještě nejsou v DB)
      INSERT INTO competitors (name, email, phase, category, start_order) VALUES
        ('Matěj Netik',       'matej.netik@horegas.cz',              'junior', 'junior', 1),
        ('Adina Fraňková',    'lubor.havlik@soupolicka.cz',          'junior', 'junior', 2),
        ('Tomáš Tran',        'lob.ino97@gmail.com',                 'junior', 'junior', 3),
        ('Tereza Váňová',     'vanovat1@hotelovkapodebrady.eu',      'junior', 'junior', 4),
        ('Adéla Šmejkalová',  'smejkaa1@hotelovkapodebrady.eu',      'junior', 'junior', 5);

- [ ] Finalisté: záložka Final auto-zobrazí top 6 ze semi (klikatelní). Přiřadit start order 1–6 přes input v sidebaru.

## Features (implementováno)
- Přihlášení přes Supabase Auth (email + heslo)
- Záložka Semi: 17 soutěžících seřazeno dle start_order, scoring max 806
- Záložka Final: auto top-6 ze semi (klikatelní, scoresheet dostupný), judges checkboxy T1/T2/S1–S4, medaile top 3 (🥇🥈🥉), pořadí dle final_order nebo skóre
- Záložka Junior: 5 soutěžících, scoring max 318 (tech/71 × 2 + sensory/88 × 2), judges checkboxy T1/T2/S1/S2
- Scoring: ×násobek kalkulace vždy viditelná (i pro prázdná pole "0 × 4 = 0"), time penalty, DQ
- Total Impression: ×2 (CBC 2026, max /12 per judge)
- Head Judge: input v scoresheet (localStorage), HJ Summary panel (T1+T2+S1–S4 nebo T1+T2+S1+S2 pro junior)
- Reset score: tlačítko v hlavičce scoresheet (s confirm dialogem)
- Scans: upload (jpg/png/pdf), download, delete; Send to competitor (Resend email, signed URL 7 dní)
- Edit Competitor modal: jméno, email, tým
- Pamatování pozice: přepnutí záložek obnoví posledního vybraného soutěžícího
- Results záložka: Senior/Junior přepínač, ranking semi + final + junior, top-6 označeni FINALIST
- Public API /api/results: semi + final + junior JSON, Bearer token auth, CORS *
- Judges tabulka: jména judžů načtena z DB, zobrazena dynamicky v scoresheet (sensory dle comp.team, tech dle comp.tech_team)
- Toast notifikace, manual Save tlačítko

## Hotovo (chronologicky)
- [x] Všech 17 soutěžících vloženo do databáze (2026-04-16)
- [x] App funkční na https://barista-roku.vercel.app (2026-04-16)
- [x] Email funkce + Edit modal (2026-04-16)
- [x] Auto-finalisté panel, position memory, final judges config (2026-04-16)
- [x] start_order řazení, Total Impression ×2, Head Judge input (2026-04-16)
- [x] T1/T2 checkboxy v Final Judges + finalTechJudges localStorage (2026-04-16)
- [x] Multiplier kalkulace vždy viditelná u všech soutěžících (2026-04-16)
- [x] Finalisté (top-6 ze semi) klikatelní v Final sidebaru (2026-04-16)
- [x] Medailové zvýraznění top 3 v Final sidebaru (2026-04-16)
- [x] Reset score tlačítko (confirm dialog, uloží do DB) (2026-04-17)
- [x] Results: fallback řazení dle start_order při shodném skóre (2026-04-17)
- [x] Public API /api/results (semi + final + junior) (2026-04-17)
- [x] Signed URL expiry prodloužena na 7 dní (2026-04-17)
- [x] Záložka Junior: scoresheet, judges config, scoring /318 (2026-04-17)
- [x] Results: Senior/Junior přepínač, junior tabulka S1/S2 (2026-04-17)
- [x] /api/results zabezpečen Bearer tokenem (RESULTS_API_TOKEN) (2026-04-17)
- [x] Judges tabulka + dynamická jména v scoresheet (sensory/tech dle týmu) (2026-04-17)
- [x] Junior judges (Sandy/Viktoria tech, Kamila/Eliška sensory) — phase-aware lookup (2026-04-17)
- [x] Tech team derivován z start_order (liché=purple/Adam+Daniel, sudé=blue/Peter+Milosz) (2026-04-17)
- [x] Týmy soutěžících přiřazeny přes REST API — Team 1/2/3 dle rozpisu judžů (2026-04-17)
- [x] Head Judge jméno načteno z DB (judges.role='head') — read-only, dle comp.team (2026-04-17)
- [x] Sidebar: sensory jména judžů pod jménem soutěžícího (dle team+phase) (2026-04-17)
- [x] Final scoresheet: anonymní judži S1–S4/T1–T2 (DB judges pro finále TBD); HJ jako volný input (2026-04-17)

## Jak nasadit změny
Jakákoliv změna v index.html → commit → push → Vercel auto-deploy.
