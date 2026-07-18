# Application architecture

## Contents

- Directory model
- Directory ownership
- Dependency direction
- Component extraction
- Services and DI
- State and errors
- Imports and routes

## Directory model

Treat this as an allowed ownership model, not a request to pre-create every empty directory. Create a directory only when it has owned code.

```text
ui/faculator-web/
├── angular.json
├── package.json
├── pnpm-lock.yaml
├── public/
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── styles/
    │   ├── _tokens.scss
    │   ├── _theme.scss
    │   ├── _typography.scss
    │   ├── _reset.scss
    │   └── _global.scss
    └── app/
        ├── app.ts
        ├── app.html
        ├── app.scss
        ├── app.spec.ts
        ├── app.config.ts
        ├── app.routes.ts
        ├── common/
        │   ├── error-handling/
        │   ├── http/
        │   ├── persistence/
        │   ├── runtime-config/
        │   └── <common-capability>/
        ├── core/
        │   └── <core-business-capability>/
        │       ├── models/
        │       ├── rules/
        │       └── services/
        ├── components/
        │   ├── ui/
        │   │   └── <ui-component>/
        │   └── shared/
        │       └── <component-name>/
        └── <business-module>/
            ├── <business-module component files>
            ├── <owned service files>
            ├── data-access/
            ├── models/
            └── <child-business-module>/
```

Retain the CLI's generated concise filenames. The placeholders describe roles, not legacy `.component.ts` or `.service.ts` suffix requirements.

## Directory ownership

### `app`

Keep the root component focused on application composition, global providers, and the top-level router outlet. Do not implement business behavior in `app.ts`.

### `common`

Place business-independent technical capabilities here: error translation, generic HTTP infrastructure, persistence adapters, runtime configuration, and reusable non-visual directives or pipes. Organize by capability, not generic `utils`, `helpers`, or `services` buckets.

### `core`

Place shared Faculator business capabilities here: domain classes, string enums, deterministic rules, and genuinely cross-module business services. Do not move a feature-owned service here merely because another module might someday use it. Services still default to root scope; directory placement does not create or remove that scope.

### `components/ui`

Place reusable components that do not know Faculator business terms here, including pure layout containers such as row, column, and container. They may depend on `common` and other UI components, never on `core`, `components/shared`, or a business module.

### `components/shared`

Place business-aware components reused by multiple business modules here. Name them directly after the business concept, such as `recipe-picker`; do not add a `business-` prefix. They may use `core`, `common`, and `components/ui`. Co-locate a component-owned service. Keep its generated root scope unless it must share the component's instance lifecycle; in that special case, provide it at the component or nearest shared boundary.

### Business-module tree

Place a one-off business module directly under `app` and nest meaningful child modules so the directory tree roughly reflects the application's business and DOM structure. Do not mirror wrapper-only DOM nodes. Create a child module when the region has a distinct responsibility, state, behavior, or lifecycle.

Keep module-specific models and data access under the owning module. Promote code only after it has a demonstrated shared owner.

## Dependency direction

Enforce these allowed edges:

```text
app and business modules
    -> components/shared
    -> components/ui
    -> core
    -> common

components/shared
    -> components/ui
    -> core
    -> common

components/ui
    -> common

core
    -> common
```

Never import in the reverse direction. Parent and child modules in the same owned business tree may collaborate through explicit inputs, outputs, and owner services. Sibling business modules must not deep-import each other's internals; move a truly shared capability to the nearest common parent, `components/shared`, or `core`.

## Component extraction

- Keep the first two occurrences local.
- Extract the third occurrence into a reusable component.
- Move business-independent UI structure to `components/ui`.
- Move business-aware repeated structure to `components/shared`.
- Do not extract a component solely to shorten a template; require an owned concept, contract, behavior, or repeated structure.
- Keep one-off components as business modules when they represent a meaningful application area even though they are never reused.

## Services and DI

- Generate at least one service for a business module when it owns business behavior, orchestration, state transitions, data access, or side effects.
- Keep view-only state, element references, and trivial interaction state in the component.
- Keep the service beside the component or module that owns it even when it uses root DI scope. File ownership and injector scope are separate decisions. Use a nested `data-access` directory only after data access becomes a separate responsibility.
- Retain `providedIn: "root"` as the default for generated services, including ordinary business-module services.
- Scope a module service with the owning component's `providers` only when each module instance needs independent state or teardown with the component.
- Scope a reusable component's co-located service to that component or shared boundary only when it is a private implementation detail or must share the component's lifecycle.
- Do not narrow scope merely because a service is stored beside a component or module; require an explicit lifecycle or isolation reason.
- Avoid service locators and manual injector access. Use `inject()` with explicit provider ownership.

## State and errors

- Use Signals for synchronous local and module state, `computed()` for derivations, and `effect()` only for real side effects.
- Use RxJS in services or components when stream composition, cancellation, multicasting, timing, or event semantics make it the clearer model.
- Avoid duplicate Signal and Observable sources of truth. Define the owner and adapt at the boundary.
- Use `AsyncPipe`, `takeUntilDestroyed()`, or another lifecycle-safe Angular mechanism. Avoid nested subscriptions and unmanaged manual subscriptions.
- Represent expected failures with typed state classes and enums. Throw only for programming errors or genuinely unrecoverable failures.
- Translate HTTP, persistence, and other technical errors before they reach a component. Never swallow errors silently.

## Imports and routes

- Import concrete files directly.
- Do not create broad `index.ts` barrels.
- Do not configure `@core`, `@common`, `@ui`, or similar path aliases initially.
- Add a stable public entry point only after a boundary has a real external consumer and hidden dependency cycles have been considered.
- Keep top-level routes in `app.routes.ts`; give a business module its own route config only when it owns child routes.
