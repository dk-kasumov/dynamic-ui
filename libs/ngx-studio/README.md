# @dynamic-ui/ngx-studio

Angular UI implementation of the Dynamic UI studio editor.

Consumes [`@dynamic-ui/studio`](../studio/README.md) as its state source, renders the three-panel editor (palette · canvas · tree + gear) in standalone Angular components, uses Angular Material as the UI kit.

For the overall project vision, see the [root README](../../README.md).

---

## What's in this package

- **Studio shell** — three-panel editor layout (palette, canvas, layer tree, gear panel).
- **Feature folders** (`src/lib/canvas/`, `inspector/`, `folders-sidebar/`, `header/`) — standalone components built on top of Angular Material, wired to the `Studio` state class through `CanvasStore`.

Every component is **standalone** (no NgModules), uses the `ds-` selector prefix (e.g. `<ds-canvas>`, `<ds-palette>`), and participates in the Material theming system.

## Peer dependencies

The package expects the consumer to install:

```json
"@angular/common": "^22.1.0",
"@angular/core": "^22.1.0",
"@angular/cdk": "^22.0.0",
"@angular/material": "^22.0.0"
```

The consumer sets up Material theming (either prebuilt theme or custom `mat.theme(...)`) in their own styles. This package does not bundle a theme.

---

## Development

```bash
npm run test:ngx           # Vitest unit tests
npm run storybook          # Storybook dev server (port 4400)
npm run storybook:build    # static Storybook build
npx nx build ngx-studio    # produce the publishable artifact in dist/
```

### Project layout

```
libs/ngx-studio/
├── .storybook/
│   ├── main.ts              # Storybook config + static dirs for Material theme
│   ├── preview.ts           # applicationConfig with provideAnimationsAsync
│   ├── preview-head.html    # Roboto + Material theme <link>s
│   └── tsconfig.json
├── src/
│   ├── index.ts             # package public API
│   └── lib/
│       ├── canvas/          # canvas, nodes, palette, store, sortable
│       ├── folders-sidebar/ # generic folder tree used by the palette
│       ├── header/          # toolbar
│       ├── inspector/       # props / meta forms and field components
│       └── ngx-studio.*     # top-level studio component and its story
├── ng-package.json
├── package.json
├── project.json
└── tsconfig.*.json
```

---

## Angular 22 + Storybook 10 — temporary workarounds

Angular 22 is a very recent release, and `@storybook/angular@10.x` has not yet caught up with its peer dependencies or packaging changes. Three workarounds are currently in place at the **repo root**, not shipped to consumers:

1. **`.npmrc` with `legacy-peer-deps=true`** — Storybook's peer-dep ranges stop at Angular 21; without this, `npm install` fails on every subsequent install. Will be removed once `@storybook/angular` ships a version with Angular 22 peer deps.
2. **`@angular-devkit/build-angular@21` as a dev dependency** — Storybook's Angular builder (`framework-preset-angular-cli.js`) resolves this package by name. Angular 22 replaced it with `@angular/build`, but Storybook still requires the legacy name. Keeping an Angular 21 devkit alongside Angular 22 is harmless because Storybook only uses it for its own preview webpack config.
3. **Material prebuilt theme loaded via `staticDirs`** — Angular 22 Material declares its CSS files under the `exports.style` condition only, which webpack doesn't resolve by default. We serve the themes folder statically through Storybook and link to it in `preview-head.html`:

   ```ts
   // .storybook/main.ts
   staticDirs: [{ from: '../../../node_modules/@angular/material/prebuilt-themes', to: '/material-theme' }]
   ```

   ```html
   <!-- .storybook/preview-head.html -->
   <link rel="stylesheet" href="/material-theme/azure-blue.css" />
   ```

**None of these workarounds leak to consumers.** The published package has clean peer deps, and the repo root's `.npmrc` and dev dependencies are not part of the npm tarball.

Each item is marked for removal when the ecosystem catches up:

- Storybook 10 release with Angular 22 peer deps → remove `.npmrc` and the pinned `@angular-devkit/build-angular@21`.
- Webpack config supporting the `style` condition → import Material CSS directly from TS without the staticDirs dance.

---

## Status

Early. The public component API is not yet stable.

## License

MIT.
