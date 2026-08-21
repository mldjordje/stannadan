# Puštanje u produkciju na nis-apartmani.rs

Redosled je bitan: prvo hosting, pa DNS, pa OAuth, pa sadržaj.

## 1. Vercel projekat

Aplikacija je Next.js 15 i na Vercelu radi bez dodatnog podešavanja. Baza je Neon
(`DATABASE_URL`); kod odbija da radi na Vercelu bez nje, jer se fajl-storage ne može koristiti.

```bash
npx vercel link
npx vercel --prod
```

## 2. Environment varijable (Vercel → Settings → Environment Variables, Production)

| Varijabla | Vrednost |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | `https://nis-apartmani.rs` |
| `AUTH_URL` | `https://nis-apartmani.rs` |
| `AUTH_SECRET` | novi tajni ključ: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | iz Google Cloud konzole |
| `DATABASE_URL` | Neon connection string (pooled) |
| `NEXT_PUBLIC_MAP_KEY` | Google Maps ključ, ograničen na domen |
| `BLOB_READ_WRITE_TOKEN` | ako se koristi Vercel Blob za slike apartmana |

`NEXT_PUBLIC_BASE_URL` određuje `metadataBase`, canonical linkove, `sitemap.xml`, `robots.txt`
i JSON-LD podatke — bez njega sve pokazuje na localhost.

## 3. DNS kod registrara (.rs domen, RNIDS registrar)

U Vercelu: Project → Settings → Domains → dodaj `nis-apartmani.rs` i `www.nis-apartmani.rs`.
Zatim kod registrara podesi:

| Tip | Ime | Vrednost |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel prikazuje tačne vrednosti u panelu — uzmi ih odatle ako se razlikuju.
Propagacija ide do 24h, obično par sati. HTTPS sertifikat Vercel izdaje sam kad DNS proradi.

Preporuka: `www` → redirect na goli domen (Vercel to nudi kao opciju kod domena).

## 4. Google OAuth

Google Cloud Console → Credentials → OAuth client:

- Authorized JavaScript origins: `https://nis-apartmani.rs`
- Authorized redirect URIs: `https://nis-apartmani.rs/auth/callback/google`

Bez ovoga prijava na produkciji vraća `redirect_uri_mismatch`.

## 5. Mejl na domenu

Za `rezervacije@nis-apartmani.rs` treba mail hosting (Google Workspace, Zoho Mail, ili
paket kod registrara). Dodaj MX zapise koje ti taj servis da, plus SPF (`TXT @ v=spf1 ...`)
i DKIM. Zatim promeni kontakt u podacima objekta (admin → apartmani/podešavanja) jer
`src/lib/stay/defaultData.ts` još nosi staru adresu `rezervacije@stannadannis.rs`.

## 6. Posle puštanja

- Google Search Console: dodaj domen (DNS TXT verifikacija), pošalji `https://nis-apartmani.rs/sitemap.xml`.
- Google Business Profile za lokalni SEO ("apartmani Niš").
- Booking.com extranet: iCal export URL sa novog domena (admin → Booking sync).
- Proveri `https://nis-apartmani.rs/robots.txt` — `/admin` i `/api/` moraju biti zabranjeni.
- Rich Results Test za JSON-LD: https://search.google.com/test/rich-results
