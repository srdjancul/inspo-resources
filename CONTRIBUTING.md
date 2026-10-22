# Kako dodati inspiraciju ili resurs

Najbrže je preko dugmeta **„Add a link”** na sajtu: link, tagovi, timska šifra i gotovo.

Ako hoćeš ručno (npr. da ispraviš tag), sve se radi na GitHubu u browseru, bez instaliranja:

## 1. Sajt za inspiraciju

1. Otvori [`data/inspo.json`](data/inspo.json) i klikni ✏️ (*Edit this file*).
2. Odskroluj **do dna** i pre poslednje `]` dodaj novi blok. Ne zaboravi zarez posle prethodnog bloka:

```json
  {
    "title": "Basement Studio",
    "url": "https://basement.studio",
    "tags": ["Agency", "Playful", "Hero"]
  }
```

3. *Commit changes*, i to je to. Za par minuta sajt dobija screenshot i pojavljuje se **prvi** u listi.
   Ako se sajt ne može uslikati (Cloudflare provera, beskonačan loader), dodaj `"screenshot": false` i kartica će prikazati naziv domena umesto slike.
   Screenshot pravi GitHub Action „Screenshots”: sam klikne „Accept” na cookie banneru i sačeka intro loader. Ako slika ipak ispadne loše, pokreni lokalno `npm run shots -- https://link-sajta` i commituj sliku iz `public/shots/`.

**Tagovi** su u [`data/taxonomy.json`](data/taxonomy.json), podeljeni u grupe:

- **Site type**: Agency, Portfolio, Product, AI, Web3, Fintech, Health, Corporate, Branding, Shop, Real estate, Event, Gallery, Blog, App UI, Gaming, Cybersecurity, Fashion, Architecture, Education, Culture
- **Theme**: Dark, Light. Stavi jedan od ova dva na svaki sajt
- **Style**: Minimal, Bold, Modern, Playful, Grid, Luxury, Typography, 3D, Illustration, Colorful, Photography, Motion
- **Section**: Hero, Footer, Process, Metrics, Roadmap, Team
- **Collection**: Elements, Archive

Stavi koliko god tagova ima smisla. Ako ti treba novi tag (npr. `Pricing`), dodaj ga u odgovarajuću grupu u `taxonomy.json`. Ako ga ne dodaš tamo, svejedno radi, samo se pojavi pod „Other”.

## 2. Resurs / alat

U [`data/resources.json`](data/resources.json) dodaj u odgovarajuću kategoriju:

```json
  { "title": "Lucide", "url": "https://lucide.dev", "category": "Icons", "description": "Open-source line icons." }
```

Postojeće kategorije: Inspiration, AI tools, Icons, Fonts & type, Color, Mockups, UI components, Framer, Motion & 3D, Learning. Nova kategorija nastaje sama čim je upišeš.

## 3. Pinterest moodboard

U [`data/moodboards.json`](data/moodboards.json):

```json
  { "title": "Pricing", "url": "https://www.pinterest.com/korisnik/pricing/" }
```

Pinove u postojeće boardove dodaješ direktno na Pinterestu, sajt samo linkuje na board.

## Ako nešto pukne

Posle svakog commita GitHub proverava fajlove (tab *Actions* → „Check data”). Ako je crveno, tamo piše tačno koji red ne valja, najčešće zarez koji fali ili višak zareza.
Duplikati se odbijaju automatski.
