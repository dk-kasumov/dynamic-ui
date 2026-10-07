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
"@angular/forms": "^22.1.0",
"@angular/cdk": "^22.0.0",
"@angular/material": "^22.0.0",
"@angular/material-date-fns-adapter": "^22.0.0",
"date-fns": "^4.0.0",
"@codemirror/autocomplete": "^6.0.0",
"@codemirror/commands": "^6.0.0",
"@codemirror/lang-json": "^6.0.0",
"@codemirror/language": "^6.0.0",
"@codemirror/lint": "^6.0.0",
"@codemirror/state": "^6.0.0",
"@codemirror/view": "^6.0.0",
"@lezer/highlight": "^1.0.0"
```

The date, time and code fields bring their own date adapter and editor, so no global `provideDateFnsAdapter()` is needed. The Material datepicker, timepicker and tooltip do need animations/overlays, so provide `provideAnimationsAsync()` in the host app.

The consumer sets up Material theming (either prebuilt theme or custom `mat.theme(...)`) in their own styles. This package does not bundle a theme.


## Views

The studio edits on a **Canvas** and can show the same document through other views, switched from the header:

| View        | Shows                                                        | Available                         |
| ----------- | ------------------------------------------------------------ | --------------------------------- |
| **Canvas**  | The editor: palette, canvas, inspector                       | Always                            |
| **AST**     | The canonical AST as JSON, with Copy / Download              | Always                            |
| **Preview** | Your own UI, rendered from the AST and/or adapter outputs    | When a preview template is given  |
| **Output**  | What your adapters make of the AST, as one JSON document     | When at least one adapter is given |

The switcher only offers the views that exist, and the last choice is remembered (`localStorage`, `ds-studio:view`).

```ts
const reactProps = Studio.defineAdapter({ map: root => toReactTree(root) })
```

```html
<ds-ngx-studio [studio]="studio" [adapters]="{ reactProps }">
  <ng-template dsStudioPreview let-ast let-outputs="outputs">
    <my-form [schema]="outputs['reactProps']" />
  </ng-template>
</ds-ngx-studio>
```

An adapter is just `{ map(root) }` returning anything JSON-serialisable. The Output view shows one JSON document keyed by the name each adapter was registered under (`{ "reactProps": … }`) — the same `outputs` the preview receives. An adapter that throws is reported above the document and is left out of `outputs`, without affecting the others. The preview template receives the AST as `$implicit` and the outputs of all healthy adapters as `outputs`; errors thrown while rendering your own template are yours to handle.

---

## Color theme

The studio ships a light and a dark theme and follows the OS setting by default. The header has a switch for `system` (default), `light` and `dark`; the choice is saved in `localStorage` under `ds-studio:theme`.

The theme is available as the `StudioTheme` service, so a host app can read or drive it:

```ts
const theme = inject(StudioTheme)
theme.set('dark') // 'system' | 'light' | 'dark'
theme.resolved() // 'light' | 'dark' — what is actually rendered
```

The resolved theme is exposed as `data-theme` on `ds-ngx-studio`, and as `data-ds-theme` on the CDK overlay container so that datepicker, select and tooltip panels match. Override any `--ds-*` variable per theme, e.g. `ds-ngx-studio[data-theme='dark'] { --ds-accent: #818cf8 }`.
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
