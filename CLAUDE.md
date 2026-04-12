# DataDrop Headless — Claude Code Guidelines

## Imports
- In `client/`, always use the `@/` alias for imports from `client/src/`. Never use relative paths across directory boundaries.
- In `server/`, always use the `@/` alias for imports from `server/src/`. Never use relative paths.
- Use inline type imports: `import { type Foo }` not `import type { Foo }`.

## Styling
- Never use inline styles. For styles that can't be expressed in Tailwind utility classes, create a `[component-name].module.css` file in the same directory as the component and import it there.
- Never use 1px solid borders to separate layout sections (nav, sidebar, content areas). Separation must be achieved through background color shifts (tonal layering), not borders.
- All colors must come from the design token palette defined in `DESIGN.MD`. Do not introduce new hex values.

## Design Tokens & Tailwind
- All design tokens (colors, shadows) are defined in `client/src/globals.css` under `@theme`. This is the single source of truth — add new tokens here when the design spec requires them.
- Always use semantic token class names instead of arbitrary values. Examples: `bg-surface` not `bg-[#f9f9ff]`, `text-primary` not `text-[#004596]`, `text-on-surface-variant` not `text-[#424752]`.
- Tailwind's opacity modifier syntax works with all color tokens: `border-outline-variant/20`, `bg-outline-variant/10`, `focus:border-primary/50`.
- Shadows defined as `--shadow-*` tokens are used via `shadow-ghost`, `shadow-card`, etc.
- Primary button gradients use `bg-linear-to-br from-primary to-primary-accent` (Tailwind v4 syntax — use `bg-linear-to-*` not `bg-gradient-to-*`).
- CSS modules are a last resort — only use them when Tailwind genuinely cannot express the style (e.g., `::before`/`::after` pseudo-elements, or styles that require complex selectors not covered by Tailwind variants). Do not use CSS modules for colors, spacing, shadows, or gradients.

## Data Mutations & API Calls
- Use React Query mutations for all data mutations (form submissions, sign out, etc.).
- Call Express API endpoints from the client via the `http` axios instance (configured with `withCredentials: true`).
- Auth operations use `authClient` from `better-auth/react` directly.
- Mutations should handle errors in the mutation's `onError` callback and update local state for display.
