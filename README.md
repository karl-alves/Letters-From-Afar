# Letters From Afar

A cute little project for long distance — send letters in a more interactive and authentic way instead of long texts.

**Live site (after Pages is enabled):** https://karl-alves.github.io/Letters-From-Afar/

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (with base path `/Letters-From-Afar/`).

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Stack

- Vite + React 19 + TypeScript
- Three.js via `@react-three/fiber` for the WebGL starfield
- Custom GLSL for twinkle + cursor gravitational lens
- Logo and buttons as a DOM overlay (they never warp)

## Deploy to GitHub Pages

This repo uses GitHub Actions (`.github/workflows/deploy.yml`) to build and publish on every push to `main`.

### One-time setup

1. Open the repo on GitHub: **Settings → Pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Push to `main` (or re-run the workflow from the Actions tab)

Site URL: `https://karl-alves.github.io/Letters-From-Afar/`

See [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) for more.
