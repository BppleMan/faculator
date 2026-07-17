# Faculator Grid-Based Material-Rail Design QA

## Comparison target

- Source visual truth: user browser annotation identifying parallel parent entrances and undersized transport components.
- Captured source state: `/tmp/faculator-material-rail-before-scale-and-grid.png`.
- Browser-rendered implementation: `/tmp/faculator-material-rail-grid-main-final.png`.
- Side-by-side comparison: `/tmp/faculator-material-rail-grid-comparison.png`.
- Focused T-junction evidence: `/tmp/faculator-material-rail-grid-t-junction-final.png`.
- DOM-inspectability source state: `/tmp/faculator-material-rail-grid-main-final.png`.
- DOM-inspectability implementation: `/tmp/faculator-transport-tile-inspectable-aligned.jpg`.
- DOM-inspectability side-by-side comparison: `/tmp/faculator-transport-tile-inspectability-comparison-aligned.png`.
- Port-alignment source examples: `codex-clipboard-8199aac9-dc22-486f-9e06-be00a15f5cf2.png` and `codex-clipboard-09e5a0bf-e011-480f-87bf-1b05c942be21.png`.
- Runtime one-tile evidence: `/tmp/faculator-port-qa-target.jpg`.
- Runtime three-tile parent evidence: `/tmp/faculator-port-qa-three-tile.jpg`.
- Runtime two-tile branch evidence: `/tmp/faculator-port-qa-branch.jpg`.
- Centerline source truth: `/var/folders/nn/m0nc5sjd7nz1657m3jgk7fw00000gn/T/codex-clipboard-6d57e2d4-96b2-4333-bcc3-b465f2f6b853.png`.
- Centerline topology board: `prototype/design-assets/transport/conveyor-seam-validation.png`.
- Final T-junction evidence: `/tmp/faculator-centerline-t-final.jpg`.
- Final tangent-curve evidence: `/tmp/faculator-centerline-curve-final.jpg`.
- Rounded-elbow source truth: `/var/folders/nn/m0nc5sjd7nz1657m3jgk7fw00000gn/T/codex-clipboard-42e16d0d-6874-4aab-9593-1b9408cf1c9c.png`.
- Rounded-elbow topology board: `prototype/design-assets/transport/conveyor-seam-validation.png`.
- Rounded-elbow browser evidence: `/tmp/faculator-rounded-elbow-final.jpg`.
- Viewports: `847 x 963` for the original grid comparison and `1280 x 720` for the canonical-port runtime captures.
- State: `zh-CN`, `生产区块 01`, material-rail view, `效能科技包（黄瓶）` at `60/min`, default recipe choices.

## Findings and comparison history

### Iteration 1 — source implementation

- [P1] A multi-input recipe emitted one horizontal entrance per ingredient row before reaching the vertical trunk. In the captured source this produced two parallel belts entering the parent card and made the bus hierarchy ambiguous.
- [P1] Transport tiles rendered at `24 x 24` beside `336 x 240` cards. Their detailed conveyor and pipe artwork became visually weak at the full-canvas scale.
- [P2] Cards and connector overlays used absolute coordinates. Card dimensions, route geometry, and the scroll surface were maintained separately and could visually drift after layout changes.

### Fixes applied

- Replaced the coordinate canvas with an explicit CSS Grid. Recipe cards, target/co-product cards, and every connector tile now participate as grid items.
- Enlarged the transport grid from `24px` to `40px` and normalized every card to `360 x 280`, both exact grid spans.
- Added one reusable `TransportTile` component. Each cell consumes a four-bit N/E/S/W mask from `0–15`; atlas position is derived directly from that state.
- Changed each parent/medium bundle to emit exactly one main connector from the parent card. Child recipes join the single vertical trunk through T or cross states.
- Preserved independent BOM demand links as metadata even when their observation routes share a trunk.

### Post-fix comparison

- The side-by-side comparison shows one horizontal main connector in the final state where the source had parallel entrances.
- Conveyor and pipe artwork is legible at the full `847 x 963` canvas scale without changing its industrial art direction.
- The focused branch capture shows a continuous 40px vertical trunk and a proper T-state tile entering the child recipe.
- No actionable P0, P1, or P2 findings remain.

### Iteration 2 — DOM inspectability

- [P1] Visible transport tiles inherited `pointer-events: none` from their `display: contents` route wrapper. A center-point hit test skipped the `40 x 40` tile and returned the material-rail stage, so browser inspection and annotation could not select the rendered connector component.

### Fixes applied

- Kept route wrappers as document-flow grouping nodes, but made every rendered tile an explicit hit-testable `span` with `pointer-events: auto`.
- Removed `aria-hidden` from the route wrappers and added stable DOM metadata to each tile: component name, route owner, transport medium, grid coordinate, four-bit mask, topology name, and N/E/S/W direction code.
- Preserved the raster atlas, four-direction state model, CSS Grid placement, route geometry, and all visual styling.

### Post-fix comparison

- `document.elementFromPoint()` at the center of a visible connector now returns the `TransportTile` itself as the topmost hit target.
- The verified tile retains a `40 x 40` hit area and reports `pointer-events: auto`, `data-component="TransportTile"`, its route owner, `mask=10`, `shape=straight`, and `directions=EW`.
- The aligned before/after comparison shows no visual, spacing, color, typography, image-quality, or copy regression from the DOM-only correction.
- No actionable P0, P1, or P2 findings remain.

### Iteration 3 — canonical ports and compact belt topology

- [P1] The generated source examples treated every corner, T, cross, and endpoint as an independent illustration. Their edge centers and coupling profiles differed, so individually plausible cells could not form a legal sprite atlas.
- [P1] Separate item and fluid skins allowed one logical parent bundle to become two competing trunks. This contradicted the single-bus observation model and made mixed recipes visually ambiguous.
- [P2] Connector corridors consumed more cells than the actual relationship required, weakening the visual hierarchy between equal-sized cards.

### Fixes applied

- Rebuilt the runtime conveyor atlas as a native `160 x 160` four-by-four sheet with one `40 x 40` cell per N/E/S/W mask. Every open horizontal edge now copies the same canonical pixel column, every open vertical edge copies its exact rotation, and every closed edge is transparent.
- Added a build-time edge validator covering all 16 masks. The build fails if any legal neighboring edge differs byte-for-byte or if a closed edge exposes port pixels.
- Retained item/fluid identity on route metadata and recipe rows, but rendered every route through one belt skin and one parent trunk. No pipe route or item/fluid double trunk remains in the observation canvas.
- Reduced the target-to-root corridor to one straight tile. Reduced every aligned parent row to `straight | T | straight`; later branches from a continuing trunk use `T | straight`, while a terminating branch uses the matching corner plus straight tile.
- Kept every tile as a selectable DOM component with stable owner, material, grid, mask, shape, and direction metadata.

### Post-fix comparison

- The one-tile capture shows a single centered `EW` cell between the equal-sized target and root recipe cards.
- All 15 multi-input bundles use exactly three parent-row cells with `EW | ESW | EW` masks.
- All 24 non-primary branch rows use exactly two horizontal cells; continuing trunks read `T | straight`, and terminal trunks read `corner | straight` without a dangling port.
- Three mixed item/fluid bundles retain their material metadata while sharing one belt trunk.
- The paired source/runtime inspection shows no offset seam at straight-to-T, T-to-vertical, T-to-straight, or corner-to-straight boundaries.
- No actionable P0, P1, or P2 findings remain.

### Iteration 4 — topology centerline contract

- [P1] Matching only the pixels on neighboring cell edges was insufficient. The earlier curved corner artwork could enter through centered ports and still wander onto an independently drawn internal path, so the belt appeared off-axis inside the tile.
- [P2] Replacing every curve with a hard square turn over-corrected the problem and weakened the industrial motion language. The user clarified that curves are valid when their medial path is geometrically centered.

### Fixes applied

- Defined each tile as a topology skeleton rather than a set of unrelated pictures. Straight and junction arms sit on immutable horizontal/vertical port axes; their visible belt remains a constant-width envelope around those axes.
- Rebuilt each corner from one real straight-belt texture warped around an exact quarter-circle. Its endpoints land on the two port axes, its endpoint tangents match those axes, and the belt width stays constant around the full arc.
- Derived all four corners by exact 90-degree rotations of one canonical curve instead of drawing four variants independently.
- Locked the outer four pixels of every open port to the canonical horizontal or vertical tangent strip. Closed ports are cleared.
- Extended build validation beyond edge equality: all 16 masks are checked for byte-identical legal ports, transparent closed ports, uninterrupted centerline coverage, and artwork staying inside the permitted straight or quarter-annular corridor.

### Post-fix comparison

- The topology board places the same actual runtime cells over the user's blue center-axis construction. Horizontal and vertical strips cover their axes; T/cross centers are symmetric; each curved corner enters and exits tangentially on the black axes.
- The final T-junction capture shows the shared vertical trunk, parent T, and both horizontal arms centered on one grid intersection.
- The final terminal-branch capture shows the vertical trunk flowing into a smooth quarter-circle and then into the one-cell horizontal arm without a shifted port, width jump, or second route.
- No actionable P0, P1, or P2 findings remain.

### Iteration 5 — compact tangent radius

- [P2] The half-cell `20px` bend radius made a terminal turn consume almost the whole `40px` transport cell, so the curve read broader and less decisive than the surrounding straight belt and recipe card geometry.

### Fixes applied

- Reduced the canonical bend radius to `15px`, retaining the same `22px` belt envelope and immutable centered N/E/S/W ports.
- Added `5px` centered straight lead-ins before and after the quarter-circle. The arc begins and ends on those lead-in axes with matching tangents, so the tighter radius cannot pull either port away from the cell centerline.
- Rebuilt all four directional variants as exact rotations of that one compact N-to-E curve and bumped the runtime atlas version to `centerline-4`.
- Extended the allowed-corridor and centerline-continuity checks to cover the short lead-ins and the tighter mathematical arc rather than accepting an unconstrained full-cell annulus.

### Post-fix comparison

- The final terminal-branch capture at `/tmp/faculator-centerline-curve-radius15-final.jpg` shows the same single vertical trunk entering a visibly tighter bend and exiting through the one-cell horizontal branch without a seam, port shift, or width jump.
- The runtime still renders 15 inspectable corner components, all from the `centerline-4` conveyor atlas with `pointer-events: auto`; all 616 route cells retain the belt skin.
- The atlas builder passes byte-identical edge validation, transparent closed-edge validation, compact-arc corridor validation, and sampled centerline-continuity validation for all four rotated corner masks.
- Broken images and browser warning/error logs both remain zero. No actionable P0, P1, or P2 findings remain.

### Iteration 6 — game-authored rounded elbow

- [P2] Shrinking the mathematical quarter-circle still left the bend reading as a diagonally warped belt strip. It lacked the reference sprite's near-square 90-degree body, broad outer shell, and visibly tighter inner corner.

### Fixes applied

- Used the supplied rounded-corner sprite as the silhouette reference and reused the existing high-resolution industrial elbow from `conveyor-atlas.png`, preserving the prototype's established belt material and lighting instead of drawing a new approximation.
- Measured the authored sprite's south and east port centers from its alpha data, scaled its body to `0.16`, and fitted those measured centers to the runtime cell's immutable axes before producing any rotations.
- Overwrote every open edge with the same canonical centered port strip as the straight belt and cleared every closed edge. The visual body can therefore use different inner and outer radii without changing the legal grid connection contract.
- Derived N/E, E/S, S/W, and W/N from exact 90-degree rotations of one normalized elbow and bumped the runtime atlas version to `rounded-elbow-1`.

### Post-fix comparison

- The combined reference, topology-board, and browser comparison shows the requested broad outer radius and tight inner turn while the black axis guides still pass through the exact center of both open ports.
- `/tmp/faculator-rounded-elbow-final.jpg` shows the real terminal branch as one vertical trunk, one rounded-elbow cell, and one horizontal cell entering the recipe card with no duplicate route or visible seam.
- The atlas builder passes all 16 byte-edge checks, transparent closed-edge checks, centered-port checks, and compact-fillet continuity checks after the authored body is fitted.
- The browser renders 15 inspectable corner components from `rounded-elbow-1`, all with `pointer-events: auto`; broken images and warning/error logs remain zero. No actionable P0, P1, or P2 findings remain.

## Required fidelity surfaces

- Fonts and typography: existing Inter/system and monospace hierarchy is unchanged. Increasing card width/height removed pressure without altering weights, line heights, labels, truncation rules, or industrial UI density. No visible text was clipped by the grid conversion.
- Spacing and layout rhythm: cards occupy `9 x 7` grid cells; transport units occupy one cell; depth corridors and sibling rows use whole-cell increments. Target and root recipe remain exactly center-aligned.
- Colors and visual tokens: existing cyan, green, amber, graphite, border, shadow, and selected-state tokens are preserved. Only transport glow radius was increased in proportion to the larger tile.
- Image quality and asset fidelity: every route loads the native-resolution `conveyor-tiles-seamless.png` atlas. Item/fluid identity remains in data rather than producing a second visual lane. All 16 topology states share one canonical centered port profile; corners reuse the high-resolution game-authored industrial elbow, fitted by measured source-port centers and then edge-locked to the straight-belt profile. Broken image count is zero.
- Copy and content: target names, recipe names, material rates, machine settings, module controls, and view labels are unchanged and still come from game data and i18n.

## Browser verification

- Material-rail stage computed display: `grid`.
- Stage, target cards, recipe wrappers, and transport tiles use static grid positioning rather than absolute positioning.
- Card sizes: one unique size, `360 x 280`.
- Transport tile sizes: one unique size, `40 x 40`.
- Target/root centerline error: `0px`.
- Final default state: 57 rendered recipe cards, 92 solve instances, 57 logical demand links, 32 visual bundles, and 616 transport tiles.
- All 616 tiles use `data-transport-type="belt"`; item-style and fluid-style transport classes both count zero. Three mixed item/fluid bundles still expose both material types in metadata.
- Fifteen multi-input bundles use one parent connector row and one vertical trunk each. Every parent row is exactly three cells with `straight | T | straight`; all 24 later branch rows are exactly two cells.
- Rendered topology count: 577 straight, 24 T, 15 corner, and zero cross cells. Every rendered mask is within `0–15`, and every tile occupies one integer CSS Grid cell.
- All 616 rendered transport tiles are inspectable DOM elements with `pointer-events: auto` and complete component/owner/transport/grid/mask/direction metadata. Visible in-canvas tile centers resolve to `TransportTile` rather than the stage; partially clipped cells correctly remain behind the scroller or surrounding app chrome.
- Card sizes have one unique value, `360 x 280`. Target/root top and centerline errors are both `0px`.
- Floating connector badges: 0.
- Broken images: 0.
- Page-level horizontal overflow: 0px. Deep graph overflow remains inside the intended material-rail scroller.

## Interaction and regression verification

- Selected the yellow-science target through the real category/order encyclopedia and confirmed `60/min`; the BOM expanded to 57 recipe instances.
- Switched successfully among material rail, dependency ring, Finder columns, and Sankey, then returned to the material rail with solve state intact.
- Replaced a `1,600/min` basic-oil instance with advanced oil processing; two co-product cards and 59 logical routes rendered on the same grid. Reverted to basic oil to restore the source-comparison state.
- The target-origin control still returns the scroller to the grid origin; final browser handoff is focused on a real terminal branch so the rounded elbow and both centered seams can be inspected directly.
- Restarted the development server after adding the new public atlas, reopened the yellow-science scenario through the real target encyclopedia, and confirmed that the final browser tab reports zero warning or error log entries.

## Runtime verification

- Production build: passed with 31 transformed modules.
- Canonical atlas build and 16-mask byte-edge validation: passed.
- Straight-axis, authored-elbow, centered-port, closed-edge, and compact-fillet continuity validation: passed.
- Development URL: `http://127.0.0.1:4173/`.

## Iteration 7 — real-data recipe card and compact-density pass

### Reference and structural fidelity

- The DOM reference is captured at `/tmp/faculator-card-source.png`; the final real-data card is captured at `/tmp/faculator-compact-card-final.png` and its module encyclopedia at `/tmp/faculator-compact-module-picker-final.png`.
- Preserved the supplied skeleton's three-part contract: output materials on the left, recipe/machine/module configuration in the center, and input materials on the right. The source's temporary white styling and native selects were intentionally not copied.
- Recipe names, recipe icons, ingredients, products, machine compatibility, module slots, beacon slots, qualities, and rates continue to come from `game-data.json`, the real icon tree, and i18n labels.

### Compact-density fixes

- Reduced every target and recipe card from `480 x 280` to the transport-grid-aligned `400 x 200`, cutting visible card area by about 40% while preserving one equal size for every node.
- Reduced the vertical sibling pitch from `360px` to `280px`; horizontal and vertical connector ports remain on the same 40px transport grid.
- Removed the visible output title, input title, machine-module title row, and beacon-module title. Their accessible region labels remain without consuming layout space.
- Set material-row padding to `0`, reduced material icon housing to `18px`, and reduced real module-slot controls to `18 x 18`.
- Material rows now divide their column height by the actual product or ingredient count. A four-input recipe renders four `49px` rows with `clientHeight === scrollHeight === 196`, so the smaller card does not introduce a compensating scrollbar.
- Reflowed the center card into `48 / 40 / 28 / 52 / 28px` rows for recipe identity, machine selection, machine slots, beacon controls, and metrics.

### Real configuration behavior

- Machine module controls render the selected machine's real slot count and open an independent module encyclopedia for each slot.
- The picker exposes four module categories, tiers I–III, and five qualities with real icons. Quality-aware effects feed back into recipe cycles, input rates, productivity, quality, and required-machine counts.
- Beacon configuration renders its two actual slots and limits choices to the module categories accepted by beacons.
- Clicking the recipe identity opens replacement choices; no redundant replacement button remains.

### Final browser verification

- Recipe-card count: 57; sampled card sizes have one unique value, `400 x 200`.
- Target card and root recipe card are both `400 x 200`; centerline error remains `0px`.
- Visible title-node counts: output/input headers `0`, machine-module headers `0`, beacon-module title spans `0`.
- Material-row computed padding: `0px`; material icon: `16 x 16`; module slot: `18 x 18`.
- The compact module picker opens inside the selected card at `190 x 188`, remains fully contained, and exposes four category controls plus the current 3-by-5 option matrix.
- Material-rail stage remains CSS Grid; page-level horizontal overflow is `0px`; broken images are `0`; browser warning/error logs are empty.
- Production build passes with 31 transformed modules.

## Required fidelity surfaces — compact card

- Fonts and typography: retained the industrial monospace/system hierarchy while tightening only margins and metric sizes needed by the smaller frame.
- Spacing and layout rhythm: cards now occupy exactly `10 x 5` transport cells; all three semantic columns and five center rows remain explicit and aligned.
- Colors and visual tokens: graphite metal, cyan route state, green output state, amber interaction state, bevels, and inset shadows are unchanged.
- Image quality and asset fidelity: all recipe, item, fluid, entity, module, quality, and transport imagery uses the existing real icon/atlas pipeline; broken image count is zero.
- Copy and content: visible section headings requested for removal are gone, while recipe names, material names, rates, machine data, slot counts, and accessible labels remain data-driven and localized.

final result: passed
