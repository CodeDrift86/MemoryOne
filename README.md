# MemoryOne

Learn a passage by heart. Paste a speech, poem, verse or script, then press **Forward** to hide a random one in twenty of its letters at a time. Hidden letters keep their exact width, so every remaining letter stays where it was. **Back** brings the last batch back.

- **Hold to peek** (or hold Space) shows the hidden letters while held.
- **←** / **→** step back and forward; the slider jumps to any step.
- After 20 steps every letter is hidden.
- Your last passage is remembered in your browser.

Built with React, Vite, Tailwind CSS v4 and shadcn/ui.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build it

```bash
npm run build
```

The static site lands in `dist/`. It uses relative paths, so the folder can be hosted anywhere (GitHub Pages, Netlify, any web server).
