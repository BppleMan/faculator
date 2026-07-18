# Angular workflow

## Bootstrap the workspace

Run the standard CLI command from the repository root only when the task explicitly asks to create the application:

```shell
ng new faculator-web \
    --directory ui/faculator-web \
    --package-manager pnpm \
    --style scss \
    --routing \
    --standalone \
    --strict \
    --zoneless \
    --test-runner vitest \
    --ai-config agents \
    --prefix app \
    --ssr=false \
    --skip-git \
    --defaults
```

Do not pass `--view-encapsulation`; retain Emulated encapsulation. Do not override the component schematic's OnPush default. Retain the CLI's current 2025 filename style instead of renaming generated files to legacy suffixes.

After generation:

1. Work from `ui/faculator-web`.
2. Confirm that pnpm produced the only package-manager lockfile.
3. Confirm that TypeScript remains in Angular 22's supported `>=6.0.0 <6.1.0` range.
4. Retain the CLI-generated TypeScript target and browser support instead of forcing `ESNext`.
5. Update project-owned generated files to four-space indentation, double quotes where strings are legal, semicolons in TypeScript, and the component SCSS rules.
6. Configure `.editorconfig` for four-space indentation and a soft 160-column guide. Do not add ESLint or Prettier unless the user later changes the decision.

## Load version-aligned Angular guidance

Before modifying Angular code:

1. Use the Angular CLI MCP `list_projects` tool to identify the workspace and installed framework version when the MCP server is available.
2. Call `get_best_practices` with the returned workspace path before generating or editing Angular code.
3. Use `search_documentation` for version-sensitive Angular APIs instead of relying on a static rules snapshot.
4. If the MCP server is unavailable, inspect the workspace-local Angular version and consult the matching `angular-developer` references.

## Generate Angular artifacts

Use the workspace-local CLI after bootstrapping:

```shell
pnpm exec ng generate component components/ui/row
pnpm exec ng generate component components/shared/recipe-picker
pnpm exec ng generate component planner
pnpm exec ng generate service planner/planner-state
pnpm exec ng generate directive common/focus-management/focus-target
pnpm exec ng generate pipe common/text-formatting/display-name
pnpm exec ng generate guard planner/planner-exit
pnpm exec ng generate interceptor common/http/api-error
pnpm exec ng generate resolver planner/planner-data
pnpm exec ng generate class core/recipe/recipe
pnpm exec ng generate enum core/calculation/calculation-state
pnpm exec ng generate interface core/solver/solver-contract
```

Choose a semantic service name such as `planner-state`, `recipe-loader`, or `calculation-runner` so the CLI's concise filename does not collide with the owning component. Generate a behavioral interface only when an interface is allowed by the type rules; model data with classes.

Retain a generated service's root provider by default. Replace it with a component, route, or business-boundary provider only when the service must have one instance per owner, must be destroyed with that owner, or is an implementation detail of a reusable component.

Never hand-create a component, service, directive, pipe, guard, interceptor, resolver, class, enum, interface, environment config, or another artifact for which the installed CLI exposes a schematic. Inspect `pnpm exec ng generate --help` when uncertain. Generate the artifact first, then adjust DI scope, implementation, comments, and formatting.

### Component tests

- Retain the generated spec for services, shared business components, and any component with behavior.
- Use `--skip-tests` only for a genuinely pure layout or display component.
- If a previously testless component later gains behavior and the CLI has no spec-only schematic, add the colocated spec as an explicit CLI-gap exception.

### Routes

Angular CLI 22 has no standalone route-config schematic. Follow this order:

1. Create the route target with `pnpm exec ng generate component`.
2. Modify the CLI-created `app.routes.ts` for a top-level route.
3. Lazy-load at a meaningful routed business boundary when it materially reduces initial work or isolates ownership; do not create routes solely to mirror directories.
4. Create a new feature `*.routes.ts` manually only when a feature genuinely owns child routes. Record this as the approved narrow schematic exception.
5. Do not use `ng generate module --route`; the application remains standalone.

## Manage dependencies

- Use Angular built-ins first.
- Prefer `pnpm exec ng add <package>` when a mature Angular integration provides a schematic; otherwise use `pnpm add` or `pnpm add -D` as appropriate.
- Introduce a mature runtime dependency without another approval only when it is necessary and materially safer or simpler than an in-house implementation. Explain the need and ownership at handoff.
- Do not introduce NgRx or another third-party state library.
- Do not add ESLint, Prettier, a boundary plugin, or a second formatter under the current governance decision.

## Validate proportionately

- Run only the tests associated with the changed service, component, rule, or integration by default. Use the test runner's supported file or name filtering after checking `pnpm exec ng test --help`.
- Expand to neighboring tests when changing a shared contract or service.
- Consider the full suite for changes under `common`, `core`, `components/ui`, `components/shared`, or global test setup when the blast radius is broad.
- Run `pnpm exec ng build` when changing routes, providers, Angular configuration, dependencies, template wiring across components, or another compilation-wide surface.
- Do not impose a coverage threshold. Do not run the entire test suite mechanically for every task.
- Always report exactly which checks ran and which broader checks did not run.
