# Inspo & Resources

Zajednička biblioteka dizajn inspiracije i alata koje koristimo svaki dan.

- **Inspiration**: sajtovi sa screenshotovima, filteri po tipu sajta, stilu i sekciji, plus naši Pinterest moodboardovi
- **Resources**: galerije, AI alati, ikonice, fontovi, mockupi, komponente…

## Kako dodaješ stvari

**Najlakše:** dugme **„Add a link”** na sajtu (`/add`). Izabereš sajt, resurs ili moodboard, nalepiš link, klikneš tagove i upišeš timsku šifru. Sajt sam napravi commit na GitHub, a link se pojavi za par minuta.

Ručno ide i direktno preko fajlova u folderu [`data/`](data). Uputstvo je u **[CONTRIBUTING.md](CONTRIBUTING.md)**.

### Podešavanje forme (jednom, na Vercelu)

Vercel → projekat → *Settings* → *Environment Variables*, dodaj:

| Ime | Vrednost |
| --- | --- |
| `ADD_PASSWORD` | zajednička šifra koju daš drugarima |
| `GITHUB_TOKEN` | GitHub *fine-grained* token: github.com/settings/personal-access-tokens → *Generate new token* → *Only select repositories*: `inspo-resources` → *Repository permissions* → **Contents: Read and write**. Ništa drugo. |

Posle toga uradi *Redeploy*. Dok ovo nije podešeno, forma javlja da dodavanje još nije uključeno.

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
