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
- Tabulky: competitors (sloupce: id, name, email, team, phase, start_order, final_order, created_at), scores, scans
- Storage bucket: scans (max 10MB, jpg/png/pdf)

## Public API
- Endpoint: https://barista-roku.vercel.app/api/results
- Bez autentizace, CORS *, vrací JSON s průběžnými výsledky semi + final
- Semi: seřazeno dle skóre (fallback start_order), Final: dle final_order (fallback skóre) + medal (gold/silver/bronze)

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

## Scoring (CBC 2026)
- Sensory per judge: I=49, II=33, III=42, IV=30, V=12 → max 166
- Technical per judge: I=6, II=17, III=22, IV=17, V=9 → max 71
- Total Impression: ×2 (max /12 per judge) — odchylka od WBC 2025 (×4)
- CB semi: 2 tech judges (mirror), 4 sensory judges → max 806
- Final: 2 tech judges (mirror), 4 sensory judges → max 806 (stejné jako semi)
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

## Soutěžící — Barista Junior (pořadí startu 18.04.2026)
1. Matěj Netik — matej.netik@horegas.cz
2. Adina Fraňková — lubor.havlik@soupolicka.cz
3. Tomáš Tran — lob.ino97@gmail.com
4. Tereza Váňová — vanovat1@hotelovkapodebrady.eu
5. Adéla Šmejkalová — smejkaa1@hotelovkapodebrady.eu

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
- [ ] Spustit v Supabase SQL editoru (Barista Junior — category sloupec + junioři):

      ALTER TABLE competitors ADD COLUMN IF NOT EXISTS category text DEFAULT 'senior';

      INSERT INTO competitors (name, email, phase, category, start_order) VALUES
        ('Matěj Netik',       'matej.netik@horegas.cz',              'junior', 'junior', 1),
        ('Adina Fraňková',    'lubor.havlik@soupolicka.cz',          'junior', 'junior', 2),
        ('Tomáš Tran',        'lob.ino97@gmail.com',                 'junior', 'junior', 3),
        ('Tereza Váňová',     'vanovat1@hotelovkapodebrady.eu',      'junior', 'junior', 4),
        ('Adéla Šmejkalová',  'smejkaa1@hotelovkapodebrady.eu',      'junior', 'junior', 5);

## Features (implementováno)
- Přihlášení přes Supabase Auth (email + heslo)
- Sidebar semi/final: soutěžící seřazeni podle start_order, zobrazeno číslo startu
- Záložka Final: auto top-6 ze semi (klikatelné, scoresheet dostupný) + start order input (final_order, DB) + judges checkboxy T1/T2/S1–S4 (localStorage)
- Záložka Final: pořadí top-6 dle final_order (nebo skóre), top 3 zvýrazněni medailemi (🥇🥈🥉) + barevné pozadí řádku
- Záložka Final: fin detekce podle aktivní záložky (ne phase v DB) → finalisté ze semi mají správnou final judges konfiguraci
- Scoring: sensory (4 judges) + tech (T1+T2 mirror) v obou záložkách semi i final; T1/T2 konfigurovatelné ve Final Judges
- Výpočet skóre: running total, ×násobek kalkulace vždy viditelná (i pro prázdná pole), time penalty, DQ
- Head Judge: input v scoresheet (localStorage), zobrazí se v HJ Summary panelu
- HJ Summary panel: T1, T2, S1–S4, celkový součet
- Scans: upload (jpg/png/pdf), download, delete; Send to competitor (Resend email se signed URLs)
- Edit Competitor modal: jméno, email, tým
- Pamatování pozice: přepnutí záložek obnoví posledního vybraného soutěžícího
- Results záložka: ranking semi + final, top-6 označeni FINALIST
- Toast notifikace, manual Save tlačítko

## Hotovo (chronologicky)
- [x] Všech 17 soutěžících vloženo do databáze (2026-04-16)
- [x] App funkční na https://barista-roku.vercel.app
- [x] Email funkce + Edit modal (2026-04-16)
- [x] Auto-finalisté panel, position memory, final judges config (2026-04-16)
- [x] start_order řazení, Total Impression ×2, tech judges ve finále, Head Judge input (2026-04-16)
- [x] T1/T2 checkboxy v Final Judges sekci, finalTechJudges localStorage (2026-04-16)
- [x] Multiplier kalkulace vždy viditelná u všech soutěžících v semi (2026-04-16)
- [x] Finalisté (top-6 ze semi) klikatelní v Final sidebaru, scoresheet dostupný (2026-04-16)
- [x] Medailové zvýraznění top 3 v Final sidebaru dle final_order nebo skóre (2026-04-16)

## Jak nasadit změny
Jakákoliv změna v index.html → commit → push → Vercel auto-deploy.
