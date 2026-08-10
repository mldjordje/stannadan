# Stan na Dan Nis

Next.js aplikacija za stan na dan u Nisu sa:

- javnim sajtom za pregled apartmana i slanje upita
- admin panelom za upravljanje apartmanima, rezervacijama i kalendarom
- Google prijavom za posetioce i admine
- Booking.com iCal import/export sinhronizacijom

## Deploy

- Framework preset: `Next.js`
- Root Directory: repository root
- Environment variables: pogledaj `.env.example`

## Storage

- Neon Postgres cuva aplikativne podatke u tabeli `stay_state`. Tabela i pocetni podaci se kreiraju pri prvom citanju.
- SQL definicija je dostupna u `migrations/001_stay_state.sql` za rucno pokretanje iz Neon SQL Editora.
- Vercel Blob cuva slike apartmana uploadovane iz admin panela.
- Za lokalni rad kopiraj potrebne tajne u `.env.local`; `.env.example` sadrzi samo primere.
- Bez `DATABASE_URL` lokalni razvoj koristi `data/stay-data.json`. Na Vercelu je baza obavezna.

## Napomena

Folderi `frontend` i `wetransfer_*` ostaju samo kao lokalna referenca i nisu deo deploy aplikacije.
