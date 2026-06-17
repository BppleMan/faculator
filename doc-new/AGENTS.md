# AGENTS.md

## Scope

This file applies to all work under `doc-new/`.

`doc-new/` is the current source-of-truth documentation area for the Faculator MVP discussion. Older files under `docs/` may contain useful background, but if an older document conflicts with `doc-new/`, prefer `doc-new/`.

## Directory Purpose

`doc-new/` is not a scratchpad. It is the structured MVP documentation set for Faculator:

```text
README.md
mvp-overview.md
mvp-production-model.md
mvp-solving-model.md
mvp-ui-spec.md
mvp-acceptance-cases.md
mvp-open-questions.md
production-balancing-principles.md
red-bottle-quality-lp-reference.md
red-bottle-quality-lp-reference.xlsx
```

These documents should stay mutually consistent and implementation-guiding.

## Core Project Context

Faculator is a Factorio / Space Age production-line quantification and planning tool.

The MVP is not centered on a UI page or on a specific LP solver. The core artifact is a stable production planning model:

```text
ProductionPlan
  ProductionBlock
    ProductionLine
```

The guiding principle is:

```text
让用户显式控制量化上下文。
```

Keep this sentence intact when the idea is referenced. It is one of the strongest product principles in this documentation set.

## Writing Rules

- Write in Chinese unless the user explicitly requests another language.
- Be detailed. The user explicitly prefers documentation that is too complete over documentation that is too compressed.
- Do not turn settled decisions into vague summaries. Capture definitions, semantics, boundaries, counterexamples, MVP tradeoffs, and future extension points.
- Keep documents closed-loop: a reader should understand the topic from the document itself, with links to related assets for deeper detail.
- Use `text` code blocks for conceptual structures, matrices, flows, and examples.
- Use exact model terms consistently: `ProductionPlan`, `ProductionBlock`, `ProductionLine`, `Level`, `BoundaryContract`, `link`, `LinearModel`, `LinearSolution`, `PlanningResult`.
- Avoid unresolved placeholder markers or ellipsis-style unfinished notes. If a decision is open, write it in `mvp-open-questions.md` as an explicit open question.

## Source-of-Truth Order

When editing or adding docs, use this priority order:

1. Current user instructions in the active conversation.
2. Existing `doc-new/` MVP documents.
3. Existing reference assets in `doc-new/`.
4. Older `docs/` files as background only.
5. Repo implementation details, only when the task is about implementation consistency.

Do not silently import old assumptions from `docs/` if they contradict the new MVP model.

## Required Reading Before Editing

Before making substantial edits in `doc-new/`, read:

```text
doc-new/README.md
```

Then read the target document and any directly related document:

```text
mvp-production-model.md   for plan/block/line/level/boundary/link changes
mvp-solving-model.md      for solver, matrix, objective, LP/MILP, machine conversion changes
mvp-ui-spec.md            for UI/rendering/debug panel changes
mvp-acceptance-cases.md   for validation case changes
mvp-open-questions.md     for unresolved quality strategy decisions
```

## Non-Negotiable Modeling Decisions

Do not contradict these without explicit user direction:

- `ProductionPlan = 一个 UI Tab = 一份独立生产规划文档`.
- `ProductionBlock = 左侧边栏 item = 一组 ProductionLine 树的容器`.
- `ProductionLine = 可展开、可折叠、可下沉、可上升的生产单元`.
- `Level` is a solving-domain boundary, not just visual indentation.
- A `ProductionBlock` can contain multiple first-level `ProductionLine` roots.
- Multiple first-level `ProductionLine` roots under the same `ProductionBlock` are independently solved in MVP.
- `ProductionBlock` instances are isolated by default.
- External supply and external output are declarations, not automatic bindings.
- `ProductionPlan` does not perform implicit global balancing in MVP.
- Down-sinking a line creates a local solving domain and exposes a boundary contract to the parent.
- `link = on` is the default after down-sinking; child target rate follows parent demand.
- `link = off` lets the child line use a user-defined rate.
- If `link = off` produces more than parent demand, the difference is extra output / surplus / external-output candidate.
- If `link = off` produces less than parent demand, the difference remains a parent-side gap.
- The core solver unknown is `过程执行次数/分钟`, not machine count.
- Machine count is derived after solving: theoretical machines first, then `ceil`.
- MVP does not use MILP.
- The default MVP objective is to satisfy targets and avoid shortages, then minimize total process execution count.
- Solver integration must stay solver-neutral; domain/planner docs must not make `good_lp`, HiGHS, or microlp a core abstraction.
- Web/PWA is the first product shape; solver work should be compatible with a Web Worker architecture.

## Quality Strategy Status

Quality-aware modeling matters, but the MVP user-facing quality strategy is not fully decided.

Settled:

- `物料@品质` is an important modeling direction.
- Different qualities of the same item are distinct materials in the model.
- Quality modules create multi-quality output distributions.
- Recycling can be represented as process columns in a linear model.
- Red-bottle quality and recycling math is captured in:

```text
red-bottle-quality-lp-reference.md
red-bottle-quality-lp-reference.xlsx
```

Open:

- Whether quality strategy binds to `ProductionLine`, individual process, or line default plus process override.
- Whether child lines inherit parent quality strategy.
- Whether low-quality outputs default to keep, recycle, or require explicit choice.
- Whether MVP permits mixed quality/productivity module configurations.
- Whether highest-quality stages suggest or switch to productivity modules.
- Whether recycling appears in normal UI as internal governance or as a visible child line.

When working on quality strategy, update:

```text
mvp-open-questions.md
mvp-production-model.md
mvp-solving-model.md
mvp-ui-spec.md
mvp-acceptance-cases.md
```

Do not resolve these open questions by implication.

## Document Maintenance Workflow

When adding or changing a concept:

1. Update the document where the concept belongs.
2. Update related documents if the concept changes cross-document behavior.
3. Update `README.md` if the document map or reading order changes.
4. Update `mvp-open-questions.md` if a decision remains unresolved.
5. Update `mvp-acceptance-cases.md` if the change affects what MVP must prove.

Examples:

- Changing `link` semantics requires updates to `mvp-production-model.md`, `mvp-ui-spec.md`, and likely `mvp-acceptance-cases.md`.
- Changing the default objective function requires updates to `mvp-solving-model.md` and any acceptance case that describes expected solution behavior.
- Deciding low-quality recycling defaults requires updates to `mvp-open-questions.md`, `mvp-ui-spec.md`, `mvp-solving-model.md`, and red-bottle acceptance wording.

## Reference Asset Rules

`red-bottle-quality-lp-reference.xlsx` is a calculation reference asset, not a casual attachment.

Only edit it when the task explicitly involves spreadsheet/calculation asset updates. If editing it:

- Preserve the corresponding markdown explanation in `red-bottle-quality-lp-reference.md`.
- Keep formulas auditable.
- Verify the workbook after generation or editing.
- Scan for formula errors.
- Keep the workbook and markdown conceptually aligned.

Do not update the Excel file just because a prose document references it.

## Validation Commands

Useful read-only checks after documentation edits:

```bash
find doc-new -maxdepth 1 -type f | sort
wc -l doc-new/*.md
PLACEHOLDER_PATTERN="$(printf 'TO%sDO|FIX%sME|TB%sD|占%s位|待%s写|\\.\\.\\.' '' '' '' '' '')"
rg -n "$PLACEHOLDER_PATTERN" doc-new --glob '!AGENTS.md'
rg -n "^#|^##" doc-new/*.md
git status --short
```

The placeholder scan should normally produce no matches. If it matches a real intentional phrase, rewrite it so it does not look like unfinished work.

## What Not To Do

- Do not collapse the MVP docs into a short summary.
- Do not make `README.md` the only source of detail.
- Do not move `doc-new` conclusions back into old `docs/` unless explicitly requested.
- Do not silently introduce implicit cross-block sharing.
- Do not describe UI as independent from the production model.
- Do not describe `level` as mere indentation.
- Do not describe machine count as the primary solver variable.
- Do not add MILP as an MVP requirement.
- Do not treat quality strategy open questions as already decided.

## Preferred Tone

Use calm, precise, implementation-guiding prose.

The docs should feel like a careful specification written after a long design discussion, not like meeting notes. They should preserve the nuance of the discussion while giving future implementers concrete rules to follow.
