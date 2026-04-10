# Design System Specification
 
## 1. Creative North Star: The Precision Curator
This design system is built upon the principle of **Precision Curation**. In an environment dense with data and administrative complexity, our role is to provide a serene, authoritative space that prioritizes clarity over clutter. We move away from the "standard dashboard" aesthetic by replacing aggressive lines and heavy shadows with a sophisticated system of **Tonal Layering** and **Editorial Typography**.
 
The aesthetic is functional yet premium, utilizing deep, trustworthy blues and crisp grays to create an atmosphere of high-level intelligence. The UI is not a collection of boxes, but a series of intentional planes that guide the user through complex workflows with surgical precision.
 
---
 
## 2. Colors: Depth Through Tone
The palette relies on the interplay between cool-toned neutrals and a vibrant primary accent.
 
### Palette Tokens
*   **Primary (Action):** `#004596` (Deep Trust Blue)
*   **Primary Accent (High Energy):** `#005cc3` (Vibrant Indigo)
*   **Surface Base:** `#f9f9ff` (Soft Blue-Gray Tint)
*   **Surface Containers:**
    *   **Lowest:** `#ffffff` (Floating Elements)
    *   **Low:** `#f1f3ff` (Section Backgrounds)
    *   **High:** `#e3e8f9` (Subtle Recess)
*   **Typography:**
    *   **On-Surface:** `#161c27` (Deep Graphite)
    *   **On-Surface Variant:** `#424752` (Muted Slate)
 
### The "No-Line" Rule
To achieve a high-end feel, **1px solid borders are prohibited for sectioning.** Do not use borders to separate the top navigation or sidebar from the main content. Boundaries must be defined through tonal shifts. For example, the Navigation Bar sits on `surface`, while the main content area sits on `surface-container-low`.
 
### Glassmorphism & Texture
For floating modals or pop-over menus, use `surface-container-lowest` with a 15% opacity and a `backdrop-blur` of 20px. For primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` (Top-Left to Bottom-Right) to provide a "lit from within" professional polish.
 
---
 
## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance character with readability.
 
*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "editorial" feel. Use `display-md` (2.75rem) for major data milestones and `headline-sm` (1.5rem) for page headers.
*   **Body & Labels (Inter):** A crisp, highly legible sans-serif for functional data. Use `body-md` (0.875rem) for standard UI text and `label-md` (0.75rem) for metadata and table headers.
 
**The Hierarchy Rule:** Headlines should use `bold` or `semibold` weights to anchor the page, while body copy remains `regular` to maintain airiness.
 
---
 
## 4. Elevation & Depth: The Layering Principle
We reject traditional "drop shadows" in favor of natural ambient light.
 
*   **Tonal Stacking:** Depth is achieved by placing lighter surfaces on darker ones. A card (`surface-container-lowest`) placed on a workspace (`surface-container-low`) creates an immediate, soft "lift" without visual noise.
*   **Ambient Shadows:** For high-priority floating elements (like User Profile menus), use a "Ghost Shadow":
    *   `box-shadow: 0 12px 40px rgba(22, 28, 39, 0.06);`
*   **The Ghost Border Fallback:** If a container requires further definition (e.g., a search input), use the `outline_variant` (`#c2c6d4`) at **20% opacity**. It should be felt, not seen.
 
---
 
## 5. Components: Functional Minimalism
 
### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. Roundedness: `md` (0.375rem).
*   **Secondary:** No fill, `primary` text. Use a Ghost Border at 20% opacity.
*   **Icon-Only:** Minimalist. No container in idle state; `surface-container-high` on hover.
 
### Form Inputs
Inputs should feel integrated into the surface.
*   **Default:** `surface-container-lowest` background with a subtle Ghost Border.
*   **Focus:** Border color shifts to `primary` with a 2px outer "glow" using `primary` at 10% opacity.
*   **Labels:** Use `label-md` in `on_surface_variant`, positioned exactly `spacing-2` above the input.
 
### Tables & Lists (The Row-Block Pattern)
Avoid traditional grid lines. Following the reference wireframes, treat each table row as a discrete "block."
*   **Row Style:** A flat `surface-container-lowest` block with a soft `md` (0.375rem) corner radius.
*   **Spacing:** Use `spacing-3` (0.75rem) between rows to create "breathing room."
*   **Interaction:** On hover, the row background shifts to `surface-container-high`.
 
### File Upload (Drop Zone)
*   **Style:** A large `surface-container-low` area. Instead of a harsh dashed border, use a thick `2px` dashed line in `outline_variant` at 40% opacity.
*   **Typography:** Center-aligned `headline-sm` for the primary CTA ("Drag and Drop...").
 
---
 
## 6. Do's and Don'ts
 
### Do:
*   **Do** use asymmetrical spacing. Allow for larger margins on the left to create a sophisticated, editorial rhythm.
*   **Do** use `tertiary` (Teal) colors for success states or specialized "View" actions to differentiate from primary system navigation.
*   **Do** embrace vertical whitespace (`spacing-8` or `spacing-10`) to separate logically distinct functional areas.
 
### Don't:
*   **Don't** use pure black (`#000000`) for text. It creates too much vibration; always use `on_surface`.
*   **Don't** use high-contrast dividers. If a divider is required, use `outline_variant` at 10% opacity.
*   **Don't** use "Standard" blue. Ensure all blues are pulled from the specific `primary` or `primary_container` tokens to maintain the signature "Deep Blue" brand identity.
