# Barista Roku — HANDOFF

## Projekt
Scorekeeping appka pro Czech Barista Championship 2026.

## URLs
- Live: https://barista-roku.vercel.app
- GitHub: https://github.com/Tomino88/barista-roku
- Vercel: https://vercel.com/tomino88s-projects/barista-roku
- Supabase: https://supabase.com → projekt barista-roku

## Supabase
- URL: https://cggujadkrrrbeuuxitmm.supabase.co
- Publishable key: sb_publishable_ekXbKIfiSWnRcw8dcjsNCg_pH1OO5qs
- Tabulky: competitors (+ sloupec email), scores, scans
- Storage bucket: scans (max 10MB, jpg/png/pdf)
- SQL pro přidání email sloupce (spustit jednou v SQL editoru):
  ALTER TABLE competitors ADD COLUMN IF NOT EXISTS email text;

## Email (Resend)
- Edge function: /api/send-email.js
- From: noreply@uctotom.cz
- Env vars nastaveny ve Vercel (Production + Preview + Development): ✅
  RESEND_API_KEY — nastaveno
  SUPABASE_SERVICE_ROLE_KEY — nastaveno

## Stack
- Frontend: vanilla HTML/JS, single file index.html
- Hosting: Vercel (auto-deploy z GitHub main branch)
- Backend: Supabase (Postgres + Auth + Storage)
- Region: West EU Paris

## Scoring (WBC 2025 originál)
- Sensory per judge: I=49, II=33, III=42, IV=30, V=24 → max 178
- Technical per judge: I=6, II=17, III=22, IV=17, V=9 → max 71
- Total Impression: ×4
- CB semi: 2 tech judges (mirror), 4 sensory judges → max 854
- Final: bez tech judge, 4 sensory → max 712
- Penalizace: 1 bod/sekunda nad 15:00, max 60, DQ při >16:00

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

## TODO před soutěží
- [ ] Přiřadit soutěžící do Tým 1/2/3 podle rozpisu judžů — SQL UPDATE těsně před soutěží:
      UPDATE competitors SET team = 'X' WHERE name = 'Jméno';
- [ ] Spustit v Supabase SQL editoru (start_order + final_order sloupce + hodnoty):

      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS start_order int;
      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS final_order int;

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

- [ ] Finalisté: záložka Finál auto-zobrazí top 6 ze semi. Ručně přiřadit startovní pořadí 1–6.
      Případně přidat finalisty jako nové záznamy (phase='final') přes tlačítko "+ Add Competitor".

## Hotovo
- [x] Všech 17 soutěžících vloženo do databáze přes Supabase SQL editor (2026-04-16)
- [x] App funkční na https://barista-roku.vercel.app
- [x] Email funkce: /api/send-email.js, pole email v Add/Edit modalu, tlačítko "Send to competitor" ve scans panelu (2026-04-16)
- [x] Edit Competitor modal — úprava jména, emailu, týmu (2026-04-16)

## Jak nasadit změny
Jakákoliv změna v index.html → commit → push → Vercel auto-deploy.
