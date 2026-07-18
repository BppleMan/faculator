# Code and style rules

## Contents

- Formatting scope
- TypeScript formatting
- Type modeling
- Angular and RxJS
- Templates and accessibility
- Comments and errors
- Component SCSS

## Formatting scope

- Use four spaces for every indentation level in project-owned TypeScript, JavaScript, HTML, SCSS, JSON, YAML, and Markdown.
- Use double quotes for project-owned string literals and HTML attributes. End TypeScript statements with semicolons.
- Treat 160 columns as a soft line width. Keep a coherent expression on one line when a small overrun is clearer than fragmentation.
- Reformat Angular schematic output immediately after generation.
- Do not reformat `pnpm-lock.yaml`, exported game data, generated atlases or manifests, vendored code, or third-party files.
- Rely on `.editorconfig` and deliberate edits under the current decision. Do not add ESLint or Prettier.

## TypeScript formatting

Keep one to four arguments or parameters on one line when the complete expression remains readable near the soft width:

```ts
public execute(first: Input, second: Context, third: Options, fourth: State): Result {
    return this.processor.process(first, second, third, fourth);
}
```

When a signature or call must wrap, put every parameter or argument on its own line. Always do so for five or more parameters or arguments:

```ts
public execute(
    first: Input,
    second: Context,
    third: Options,
    fourth: State,
    fifth: Metadata
): Result {
    return this.processor.process(
        first,
        second,
        third,
        fourth,
        fifth
    );
}
```

Do not require a trailing comma for the last multiline parameter. Keep a chain's first call on the expression's first line and put each later call on its own line:

```ts
const result = values.filter(predicate)
    .map(mapper)
    .sort(compare);
```

Use `??`, `?.`, and other nullable-safety syntax when they express the intended fallback or access semantics. Do not replace `??` with `||` when valid falsy values must be preserved.

## Type modeling

- Use TypeScript 6.0.x and syntax supported by that compiler. Keep TypeScript below 6.1 while Angular 22.0.x requires that range.
- Retain the Angular CLI-generated compilation target; do not force `ESNext` merely to use current TypeScript syntax.
- Model application-owned data objects, DTOs, and domain entities with classes. Use constructors, static factories, or mappers to turn raw JSON into instances.
- Do not assert raw JSON into a class type. Validate or map external data at the boundary.
- Use an interface only for a behavioral contract. Do not use an interface to model a plain object shape.
- Use a type alias only for function types, generic or mapped type operations, and framework adapters that cannot reasonably be represented by a class, abstract class, or enum.
- Do not create string or numeric literal unions for closed value sets. Use an enum.
- Allow nullable unions such as `T | null` and `T | undefined`, and consume Angular, RxJS, browser, or third-party unions without copying their declarations.
- Model owned business failures with enums, classes, or class hierarchies instead of a discriminated union.
- Prefer string enums. Use PascalCase member names and stable kebab-case values, or preserve an external protocol's exact value. Use numeric enums only when an external protocol requires them.

```ts
export enum CalculationState {
    Idle = "idle",
    Calculating = "calculating",
    Completed = "completed",
    Failed = "failed"
}
```

## Angular and RxJS

- Use standalone artifacts, `inject()`, Signal inputs and outputs, and built-in control flow (`@if`, `@for`, `@switch`).
- In Angular 22, do not write `standalone: true` or `changeDetection: ChangeDetectionStrategy.OnPush`; preserve the framework and CLI defaults.
- Prefer Signal Forms for new forms. Use typed Reactive Forms when compatibility, an existing form strategy, or a genuinely complex integration makes them the clearer choice. Do not introduce Template-driven Forms for owned application forms.
- Do not introduce legacy `@Input`, `@Output`, constructor injection, `*ngIf`, or `*ngFor` in owned code unless third-party compatibility requires it.
- Use Signals first for synchronous view and module state. Use `computed()` for pure derived state and update writable Signals with `set()` or `update()`; do not use `mutate()`.
- Use RxJS in components as well as services when a stream is the clearer abstraction.
- Keep business behavior, side effects, state transitions, and orchestration in services. Components may coordinate templates, view-only state, and lifecycle-safe stream bindings.
- Do not add a third-party state library.
- Preserve zoneless compatibility: update template-read Signals, use `AsyncPipe`, mark views through supported Angular APIs, and avoid relying on ZoneJS timing.

## Templates and accessibility

- Use `class` and `style` bindings instead of `ngClass` and `ngStyle` in owned templates.
- Put host bindings and listeners in the `host` object of `@Component` or `@Directive`; do not use `@HostBinding` or `@HostListener`.
- Use `NgOptimizedImage` for static images. Do not use it for inline base64 images, which the directive does not support.
- Do not assume JavaScript globals such as `Date` are available in a template. Expose the required value or operation through the component or an injected service.
- Import every Angular pipe used by a standalone component, including built-in pipes.
- Meet WCAG AA for interactive components and pages, including keyboard operation, focus management, semantic structure, contrast, and appropriate ARIA.
- Run AXE checks for affected interactive UI components and pages when accessibility behavior is introduced or changed. Do not run AXE mechanically for unrelated tasks.

## Comments and errors

- Add a concise comment to critical functions explaining purpose, invariants, ownership, or non-obvious tradeoffs.
- Comment critical steps inside a function when the ordering, failure behavior, algorithm, or domain reason is not evident from the code.
- Explain why; do not narrate syntax or repeat a clear method name.
- Represent expected failures as typed business states and translate technical failures in the responsible service.
- Never leave an empty catch block or silently discard an Observable error.

## Component SCSS

Start every component stylesheet with `:host {}` and nest descendant selectors with SCSS syntax:

```scss
:host {
    display: flex;
    position: relative;
    flex-direction: column;
    overflow: hidden;
    font-family: var(--fac-typography-body-font-family);
    line-height: var(--fac-typography-body-line-height);
    color: var(--fac-color-text-primary);
    box-sizing: border-box;
    width: 100%;
    gap: var(--fac-space-md);
    padding: var(--fac-space-md);
    border: 1px solid var(--fac-color-border-default);
    border-radius: var(--fac-radius-md);
    background: var(--fac-color-surface-primary);
    box-shadow: var(--fac-shadow-panel);
    cursor: default;
    transition: background 160ms ease;

    .content {
        display: flex;
        flex: 1 1 auto;
        gap: var(--fac-space-sm);
    }
}
```

Order properties consistently:

1. Layout and positioning: display, position, inset, z-index, flex, grid, overflow.
2. Typography: font, line-height, text, white-space, color.
3. Dimensions and box model: box-sizing, width and height, min and max sizes, gap, margin, padding, border, border-radius.
4. Visual treatment: background, box-shadow, opacity, filter.
5. Interaction and motion: cursor, pointer-events, user-select, transform, transition, animation.

Additional rules:

- Prefer flex layout. Use grid or another layout only when the problem clearly requires it or the user requests it.
- Prefer reusable, decoration-free row, column, and container components after the third-use extraction threshold.
- Use theme, typography, spacing, radius, and other common tokens for repeated values. Write a one-off specific color as a full six-digit hex value.
- Prefer `gap` over child margins. Prefer complete or two-value margin and padding shorthands and complete borders.
- Avoid single-side margin, padding, or border declarations. Use a logical single-side property only when it represents a genuine edge-specific semantic requirement.
- Keep global styles in `src/styles.scss` and `src/styles/` for resets, scrollbars, overlay containers, popup infrastructure, and other unavoidable global behavior.
- Use `::ng-deep` deliberately for Angular overlay or third-party internals that cannot otherwise be reached. Keep the rule near its owner and never use it as a default escape from component encapsulation.
