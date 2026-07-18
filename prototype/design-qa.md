# Faculator exact-reference design QA

- visual truth: `/Users/bppleman/Downloads/已生成图像 1.png`
- empty-state implementation: `/private/tmp/faculator-reference-pass3-1440.png`
- normalized side-by-side comparison: `/private/tmp/faculator-reference-exact-comparison.png`
- target encyclopedia: `/private/tmp/faculator-reference-modal.png`
- populated material rail: `/private/tmp/faculator-reference-populated.png`
- viewport: `1440 × 1024`
- checked states: empty Root Line, target encyclopedia, and Basic Transport Belt at 60/min

## Correction made after user review

The preceding implementation was not an acceptable match. It borrowed black, amber, and blue from the mock but flattened the defining physical construction into a conventional web-app shell. The earlier QA statement that bolts and vent grilles were intentionally omitted was wrong: in this reference they are structural cues, and omitting them changes the whole design language.

The correction rebuilds the shared shell and component skin around the reference's actual cabinet anatomy:

- thick nested steel frames with hard bevels and deep recessed work bays;
- reference-derived corner fasteners, ribbed header rails, vent grilles, and gunmetal texture;
- cast amber active controls, tactile dark buttons, warm ivory labels, green live state, and blue game-data accents;
- reference-like header, sidebar, right rail, bottom drawer, and status-bar proportions;
- one visual system shared by empty, modal, populated, and observation-view content while preserving the approved business layout.

## Evidence and findings

The normalized comparison places the exact user-provided image beside the browser-rendered application. The implementation now carries the same heavy equipment-console silhouette at full-view scale rather than merely sharing its color palette. The existing Plan tabs, Block sidebar, four observation views, card geometry, and conveyor behavior remain intact as requested.

The UI chrome uses four small raster crops taken from the exact reference for material fidelity: a corner bolt, ribbed rail, framed vent, and subtle panel texture. Product icons and conveyor imagery continue to use the real exported Factorio assets. No emoji, placeholder imagery, inline SVG approximation, or CSS-drawn substitute was introduced.

The target encyclopedia and populated production state retain the same cabinet construction, button states, recessed fields, and component hierarchy. Dense business data remains readable at the target viewport and the central empty work bay expands to the available height instead of collapsing into a generic card.

## Verification

- [x] Exact reference used as visual truth
- [x] Heavy shell, nested bevels, bolts, ribs, vents, and textures implemented
- [x] Tabs, sidebar, four-view selector, cards, controls, modal, drawer, and status bar use the new shared system
- [x] Approved information architecture and production interactions preserved
- [x] Empty, modal, and populated states visually inspected at `1440 × 1024`
- [x] Vite production build passes
- [x] `git diff --check` passes

## Remaining non-blocking variance

- P3: Chinese/system font metrics differ slightly from the generated reference lettering.
- P3: ornamental micro-scratches and unique wear marks are intentionally not repeated on every individual control; the major cabinet materials and hardware are present.

final result: passed

## Browser annotation correction pass

The first density pass was rejected because its completion claims were based mainly on source changes instead of the rendered result. The follow-up pass was verified in the browser at the original `1247 × 1234` annotation viewport.

- Plan tabs render at 63px inside an 82px header without clipping; tabs contain names only and hug their content while the tab rail fills the remaining header width.
- The four observation controls render as one segmented control; the add-Line action is 14px and does not wrap.
- The summary rail is a four-cell grid with 12px labels and 16px values; the clipped explanatory sentence was removed.
- The draft state is rendered directly beneath the view stage instead of through the material-view/lane/header wrapper stack.
- The status bar uses a 25px horizontal fastener safety zone, 12px status copy, 11px labels, and 13px values.
- The redundant data-source badge and sidebar isolation note are absent from the rendered DOM.
- The Block card uses an explicit three-column grid and was visually checked without overlap.
- Empty and populated Basic Transport Belt states were both browser-verified; no console errors were present.
- Plan tabs were reduced to a measured 54px control inside a 76px header; the text center differs from the control center by only 1px. A separate close action was tested by creating and closing the active second Plan, then verifying focus returned to the remaining Plan.
- The collapsed result drawer now reserves 28px between both outer cabinet edges and its first/last child controls, clearing the 18px corner fasteners.
- The Block list was measured with equal 12px left/right card insets and `scrollWidth === clientWidth === 252px`; horizontal scrolling is disabled.
- Material-rail and dependency-ring Line headers plus the rail origin control were removed from the rendered DOM. The target connector tile and target card centers were measured at the same Y coordinate with a 0px delta.
- The Goal rate-field unit renders as `分钟` in Chinese instead of `/ 分钟`.
- The observation switcher now uses four purpose-built material-rail, dependency-ring, Finder-column, and Sankey SVG pictograms. Each control measures `50 × 42px`, the complete selector measures 216px, and every icon button retains an accessible Chinese/English name plus a hover/focus tooltip.
- Browser-computed typography confirms the three-level system: `Avenir Next / PingFang SC` for body copy, `Avenir Next Condensed / PingFang SC` for headings, and `DIN Alternate / Avenir Next Condensed / PingFang SC` for instrument metadata.

## ProductionLine/root semantic correction pass

- source visual truth: `/Users/bppleman/Downloads/已生成图像 1.png`
- Finder implementation: `/Users/bppleman/factorio/faculator/prototype/qa-artifacts/production-line-finder-columns-1268x1234.png`
- shared material canvas implementation: `/Users/bppleman/factorio/faculator/prototype/qa-artifacts/production-line-shared-canvas-1268x1234.png`
- normalized three-up comparison: `/Users/bppleman/factorio/faculator/prototype/qa-artifacts/production-line-annotation-comparison.png`
- viewport: `1268 × 1234`
- state: two populated ProductionLines (Basic Transport Belt and Iron Chest), Finder columns and material rail

### Earlier findings and fixes

- P1: Finder rendered `Root Lines` and `交付目标` as peer columns even though one delivery target defines one ProductionLine. The first column now lists ProductionLines with their target and rate, followed directly by the root LineNode and upstream dependency columns. Browser evidence: headers are `生产线`, `Root 节点`, and the first input column; `.finder-column.is-targets` count is `0` for a populated Line.
- P1: the material rail nested a Block scroll surface, per-Line lane, root wrapper, frame, and inner scroll surface. It now renders one direct `.material-rail-stage` child inside one `.material-rail-view` with `overflow-x: auto` and `overflow-y: auto`. With two populated Lines, the single canvas measured `579 × 774` client area and `1840 × 1280` scroll area; legacy nested lane/scroll/root-wrapper count is `0`.
- P2: Block cards had no delete action. Each card now has a separate 26px delete control. Adding Block 02, deleting the active Block, and returning focus to Block 01 was tested; the sole remaining Block disables deletion and the Block list retains `scrollWidth === clientWidth`.
- P2: the old target-promotion interaction appended another target to the current ProductionLine. It now creates a new ProductionLine with one target, matching the corrected conceptual relationship.

### Required fidelity surfaces

- Fonts and typography: unchanged from the approved industrial typography system; shortened Chinese labels fit the compact controls without clipping.
- Spacing and layout rhythm: the Finder removes one redundant full-height column; the material rail removes all nested frame padding and uses the full recessed work bay as one canvas.
- Colors and visual tokens: existing gunmetal, amber, ivory, and green tokens remain unchanged.
- Image quality and asset fidelity: exported Factorio product/recipe icons and the approved cabinet raster materials remain intact.
- Copy and content: Root is now used only for the graph node concept; visible navigation and counts use ProductionLine/生产线 terminology.

### Final verification

- [x] `npm run build`
- [x] `git diff --check`
- [x] Finder redundant target column absent for populated Lines
- [x] One bidirectionally scrollable material canvas for two populated Lines
- [x] Active Block deletion and adjacent-Block fallback tested
- [x] No new console errors during post-fix view switching
- [x] Full-view and focused structural evidence compared in the normalized three-up image
- [x] Finder column header ordinal, title, and count each compute to `12px / 12px` at `1268 × 1234`; their visual center is `355.5px` inside the header center at `356px`

final result: passed
