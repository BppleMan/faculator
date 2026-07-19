# Homepage visual fidelity QA

- Source visual truth: `/var/folders/lg/wh7xl0nx26d033d8kzyvknl00000gn/T/codex-clipboard-816e0a03-a708-4631-8974-be50abd48a49.png`
- Initial Angular evidence: `/var/folders/lg/wh7xl0nx26d033d8kzyvknl00000gn/T/codex-clipboard-8f96f5a2-82ef-4ad1-b644-dd5a5d3b5f56.png`
- Implementation URL: `http://127.0.0.1:4200/`
- Reference URL: `http://127.0.0.1:4174/`
- Intended viewport and state: same desktop viewport, Chinese locale, one Block with one draft Production Line and no selected target.

## Full-view comparison evidence

The two user-provided screenshots show the same empty-target homepage state at closely comparable desktop dimensions. The initial Angular implementation is visibly flatter: structural panels use inconsistent edge stacks, the header and toolbar bands lack the reference's pressed/raised hierarchy, the stage and goal wells lack depth, and local panel textures are overridden inconsistently.

## Focused region comparison evidence

- Header: the React reference uses a textured brand cell, a hard right divider, cast/notched plan tabs, and a framed locale control. The initial Angular capture uses a flatter rectangular shell and rounded tabs.
- Sidebar: the React reference uses a framed cabinet, a separately edged heading band, a textured selectable Block card, and a vented base. The initial Angular capture has weaker edge hierarchy and inconsistent shadows.
- Main column: the React reference visually joins the workspace header, toolbar, summary, and recessed stage as a machine deck. The initial Angular capture treats them as flatter independent bands.
- Goal rail: the React reference has a gridded, deeply inset empty-state well. The initial Angular capture has a nearly uniform dark surface.
- Result/status bars: the React reference uses the same cabinet material and edge grammar as the large panels; the initial Angular capture does not consistently share that grammar.

## Comparison history

### Iteration 1

Earlier findings:

- P1: large panel framing and texture responsibilities were duplicated across component SCSS, producing inconsistent surfaces.
- P1: header, toolbar, summary, stage, and goal well lacked the reference's elevation hierarchy.
- P2: brand divider, plan-tab silhouette, Block card surface, and selected-state rim visibly drifted from the reference.

Fixes made:

- Added the reusable `appPanelShell` visual primitive with cabinet, header, toolbar, summary, and brand variants.
- Migrated the app header, brand, sidebar, workspace header, observation workspace, goal rail, result drawer, and status bar to the shared primitive.
- Removed duplicated panel border, texture, and shell-shadow declarations from feature component SCSS.
- Restored local visual details that are not generic panel responsibilities: brand divider, cut-corner tabs, sidebar-heading edge shadow, textured Block card and active amber rim, hard toolbar/summary seams, recessed stage, and gridded goal well.
- Preserved the accepted observation-stage base color `#080c0d` and the accepted Faculator wordmark font.

Post-fix evidence:

- Angular production build passes.
- All 21 test files and 46 tests pass.
- Browser-rendered post-fix screenshot is unavailable because the in-app browser automation policy rejected localhost page control after the local servers restarted. No alternate browser or raw CDP workaround was used.

### Iteration 2

Earlier findings:

- P1: the center cabinet responsibility was still assigned to the observation component instead of the complete Line workspace, creating an extra inner cabinet frame.
- P2: the Angular header, sidebar heading, plan-tab deck, and status bar were taller and more loosely padded than the final React cascade.
- P2: sidebar content did not use the reference cabinet's inset content padding, while the Block list compensated with excessive local padding.

Fixes made:

- Moved the cabinet shell from `app-observation-workspace` to `.line-workspace`, matching the reference structural hierarchy.
- Applied the final React geometry for the 76px app header, 52px status bar, 5px header inset, 4px app-shell padding, 6px Line cabinet padding, and 6px upper-workspace gap.
- Reduced the sidebar heading to 76px, added the cabinet's 7px content inset, and normalized Block-list padding to `9px 12px 18px`.
- Aligned the plan-tab deck top padding and gap, workspace-header height, observation-toolbar height, and goal-rail content padding with the final reference rules.

Post-fix evidence:

- Angular production build passes after the structural move.
- All 21 test files and 46 tests pass after the structural move.

### Iteration 3

Earlier findings:

- P1: the generic segmented-control rules overrode the reference-specific locale and observation switchers, making selected segments dark instead of amber and introducing rounded geometry.
- P2: result navigation was 6px too short, status cells lacked the reference's double edge stack, and the brand/Block icons used simplified framing.
- P2: observation summary padding and typography drifted from the final React cascade.

Fixes made:

- Kept the generic raised-idle/pressed-selected interaction contract, while defining exact square, textured variants for the locale and observation switchers.
- Restored the amber pressed selected surface, exact observation switcher dimensions, and centered 25px icons.
- Matched the 58px result navigation, 34px status cells, 54px brand mark, 48px Block icon, and the Block-card typography hierarchy.
- Matched the observation toolbar at 66px and summary at 42px, including its 12px cell padding and 8px label/value gap.

Post-fix evidence:

- In-app browser computed-style probes at 1440x900 match the reference geometry for the primary shell, sidebar, Line cabinet, workspace header, 66px toolbar, 42px summary, stage, goal rail, 58px result navigation, and 52px status bar.
- The same browser probe at 1180x900 reports `document`, `body`, and app shell dimensions of exactly 1180x900 with no page overflow.
- Final Angular capture: `/private/tmp/faculator-angular-homepage-final.png`.
- Side-by-side visual evidence: `/private/tmp/faculator-homepage-final-comparison.png`.
- Angular production build passes. The six existing component-style budget warnings remain warnings only.
- All 21 test files and 46 tests pass.

## Required fidelity surfaces

- Fonts and typography: accepted Faculator display face is pinned; remaining post-fix visual comparison is required for exact wrapping and optical sizing.
- Spacing and layout rhythm: main desktop grid, fixed shell rows, panel gaps, and recessed wells were aligned from the reference CSS; post-fix screenshot comparison remains required.
- Colors and visual tokens: the reference cabinet texture, frame colors, amber state, and exact stage base color are used.
- Image quality and asset fidelity: original foundry panel, bolt, vent, game icon, and view icon assets are reused; no replacement CSS drawings or placeholder imagery were introduced.
- Copy and content: the compared Chinese empty-target state and labels remain unchanged.

## Final assessment

No open P1 or P2 visual-fidelity issue remains in the agreed homepage/no-target scope. The Angular implementation intentionally retains the pinned 22px Faculator wordmark and the explicitly requested textured brand cell. Planning-canvas content beyond the empty-target state remains outside this pass.

final result: passed
