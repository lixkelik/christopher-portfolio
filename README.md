# Christopher's Portfolio

React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/christopher-portfolio/
npm run build    # type-check + production build into dist/
npm run preview  # serve the built dist/
```

## Adding a project

Projects live in [`src/data/projects.json`](src/data/projects.json) — no code changes needed for new entries.

1. Drop your images into `public/projects/` (e.g. `public/projects/my-app/cover.png`, `01.png`, `02.png`).
2. Append an entry to `projects.json`:

   ```jsonc
   {
     "id": "my-app",                     // URL slug → /projects/my-app
     "title": "My App",
     "tagline": "One-line elevator pitch",
     "summary": "1–2 sentence card blurb.",
     "cover": "projects/my-app/cover.png",
     "gallery": [
       { "src": "projects/my-app/cover.png", "caption": "Home screen" },
       { "src": "projects/my-app/01.png" }
     ],
     "tags": ["React", "TypeScript"],
     "category": "Web",
     "role": "Solo developer",
     "timeline": "Jan–Mar 2026",
     "status": "Live",                   // Live | In Progress | Archived | Concept
     "featured": true,
     "problem": "Long-form description. Supports\nmulti-line text.",
     "features": ["Feature one", "Feature two"],
     "techStack": [{ "name": "React" }, { "name": "Vite" }],
     "learnings": ["What I learned…"],
     "links": {
       "demo": "https://example.com",
       "github": "https://github.com/you/repo"
     },
     "metrics": [{ "label": "Users", "value": "1.2k" }],
     "videoUrl": "https://youtu.be/xxxx"
   }
   ```

   Full field reference: [`src/data/types.ts`](src/data/types.ts). Most fields are optional — only `id`, `title`, `tagline`, `summary`, `cover`, `gallery`, and `tags` are required.

3. Image paths are relative to `public/`. The `assetUrl()` helper in `src/lib/utils.ts` automatically prefixes the Vite base path so images resolve correctly under GitHub Pages.

## Deployment (GitHub Pages)

This repo ships with [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) which deploys automatically on every push to `main`.

One-time setup:

1. In GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
2. The Vite `base` is set to `/christopher-portfolio/` in [`vite.config.ts`](vite.config.ts). If you rename the repo, update that string (or set `VITE_BASE` in CI).
3. Push to `main`. The workflow builds, copies `dist/index.html → dist/404.html` (so deep links like `/projects/aura` survive a refresh), and publishes via `actions/deploy-pages`.

Site URL: `https://<your-github-username>.github.io/christopher-portfolio/`

### Custom domain

Set `VITE_BASE=/` in the workflow env (or as a repo variable) and add a `public/CNAME` file with your domain.

## Project structure

```
src/
  App.tsx                  Router + page transitions
  pages/
    Home.tsx               Landing page (hero, about, skills, projects, contact)
    ProjectDetail.tsx      Per-project case study (/projects/:slug)
    NotFound.tsx           404
  components/
    ProjectsSection.tsx    Card grid with tag filter + search
    ui/Reveal.tsx          Scroll-reveal wrapper
    ui/GithubStars.tsx     GitHub stars badge
    …
  data/
    projects.json          The "database" — edit this to add projects
    projects.ts            Typed re-export + helpers
    types.ts               Project schema
  lib/utils.ts             cn(), assetUrl(), parseGithubRepo()
```


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
