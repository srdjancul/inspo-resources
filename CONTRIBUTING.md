# Kako dodati inspiraciju ili resurs

Ne treba ti ništa da instaliraš. Sve se radi na GitHubu u browseru.

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

**Tagovi** su u [`data/taxonomy.json`](data/taxonomy.json), podeljeni u grupe:

- **Site type**: Agency, Product, Branding, Corporate, Shop, Real estate, Gallery, Blog
- **Style**: Modern, Playful, Grid, Luxury, Typography, Motion
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
