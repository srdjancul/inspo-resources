# Inspo & Resources

Zajednička biblioteka dizajn inspiracije i alata koje koristimo svaki dan.

- **Inspiration**: sajtovi sa screenshotovima, filteri po tipu sajta, stilu i sekciji, plus naši Pinterest moodboardovi
- **Resources**: galerije, AI alati, ikonice, fontovi, mockupi, komponente…

## Kako dodaješ stvari

Sve je u folderu [`data/`](data). Najlakše: otvori fajl na GitHubu, klikni olovku (✏️ *Edit*), dodaj red i *Commit changes*.
Detaljno uputstvo sa primerima: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

| Fajl | Šta je u njemu |
| --- | --- |
| `data/inspo.json` | Sajtovi za inspiraciju (naslov, link, tagovi) |
| `data/moodboards.json` | Pinterest boardovi |
| `data/resources.json` | Alati i sajtovi, po kategorijama |
| `data/taxonomy.json` | Lista tagova i u koju grupu filtera spadaju |

Screenshot novog sajta pravi se sam: GitHub Action ga uslika i commituje par minuta posle tvog commita.

## Lokalno

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # proveri da li su data fajlovi ispravni
npm run shots        # uslikaj sajtove koji nemaju screenshot (treba Playwright Chromium)
npm run shots -- https://primer.com   # ponovo uslikaj jedan sajt
```

## Stack

Next.js (statički generisan), čist CSS, fontovi Instrument Serif / Geist / Geist Mono. Hostovano na Vercelu, svaki push na `main` = novi deploy.
