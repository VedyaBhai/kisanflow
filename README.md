# KISANFLOW

SIH prototype (Problem Statement 26033) — "Predict the Demand. Pool the Harvest. Optimize the Journey."

## Run locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Put it online (free options)

### Option A — Vercel (easiest, no command line needed)
1. Create a free account at vercel.com.
2. Push this folder to a new GitHub repo (or use Vercel's "drag and drop a folder" import).
3. In Vercel: **New Project → Import** your repo.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
5. Click **Deploy**. You'll get a live URL like `kisanflow.vercel.app` in about a minute.

### Option B — Netlify (drag-and-drop, no GitHub needed)
1. Run locally: `npm install && npm run build` — this creates a `dist/` folder.
2. Go to app.netlify.com/drop and drag the `dist` folder onto the page.
3. Netlify gives you a live URL immediately.

### Option C — GitHub Pages
1. `npm install gh-pages --save-dev`
2. Add to `package.json` scripts: `"deploy": "vite build && gh-pages -d dist"`
3. Add `base: "/your-repo-name/"` to `vite.config.js`.
4. `npm run deploy`

## Notes
- This is a frontend-only prototype with mock/deterministic data — no backend or database required, so any static host works.
- If you later add a real backend, keep the frontend on Vercel/Netlify and host the API separately (e.g. Render, Railway).
