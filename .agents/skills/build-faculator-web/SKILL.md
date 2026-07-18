---
name: build-faculator-web
description: Govern creation and ongoing development of the Faculator Angular web application under ui/faculator-web, including Angular CLI generation, zoneless and pnpm setup, architecture and DI boundaries, Signals and RxJS state, focused testing, TypeScript 6 and formatting rules, and component SCSS conventions. Use whenever Codex creates, edits, refactors, reviews, tests, or adds Angular artifacts in faculator-web. Do not use it to decide the visual design system; a separate UI-focused skill owns that work.
---

# Build Faculator Web

Apply the repository's engineering rules to the Angular application while keeping product behavior and future visual-system decisions separate.

Use the official `angular-developer` skill as upstream Angular framework guidance when it is available. If that guidance conflicts with this repository skill, follow the user's explicit instructions first and this repository skill second.

## Load the required references

- Read [angular-workflow.md](references/angular-workflow.md) before creating the workspace, generating Angular artifacts, managing dependencies, or choosing validation commands.
- Read [architecture.md](references/architecture.md) before adding or moving components, services, routes, models, state, or providers.
- Read [code-style.md](references/code-style.md) before editing any project-owned TypeScript, HTML, SCSS, or configuration file.
- Read all three references for project creation, cross-layer refactors, or reviews of the complete application.

## Preserve the non-negotiable rules

- Create Angular artifacts with `ng new`, `ng generate`, or `ng add` whenever the Angular CLI provides a matching schematic. Generate first, then edit the result.
- Use pnpm exclusively inside the Angular workspace. Do not create npm or Yarn lockfiles.
- Keep the application standalone, strict, zoneless, client-side, SCSS-based, and routed. Use Angular's default `app-` selector prefix.
- Preserve the CLI's default Emulated encapsulation and OnPush behavior. Start every component stylesheet with `:host {}`; do not add Shadow DOM configuration.
- Keep business behavior in services. Retain the generated root scope by default; narrow a service to a component or business boundary only when it intentionally shares that owner's instance lifecycle.
- Enforce the dependency direction defined in [architecture.md](references/architecture.md). Do not bypass a boundary with a barrel, path alias, or deep sibling import.
- Use Signals first without forbidding RxJS in components. Do not introduce a third-party state library.
- Apply the TypeScript and SCSS rules in [code-style.md](references/code-style.md) after every schematic because generated output will need repository-specific formatting.
- Run tests related to the current change. Expand validation only when the change reaches shared foundations, routing, providers, configuration, or another broad risk surface.

## Work in this order

1. Inspect the existing workspace and nearby ownership boundaries before selecting a target path.
2. Identify whether the work belongs to `common`, `core`, `components/ui`, `components/shared`, or a one-off business-module tree.
3. Use the most specific Angular CLI schematic available. Treat unsupported route-config files as the narrow exception described in [angular-workflow.md](references/angular-workflow.md).
4. Move business behavior, state transitions, and side effects into a service; leave rendering and view-only state in the component. Keep root scope by default and use a narrower provider only for an explicit owner-lifecycle requirement.
5. Reformat generated and edited project-owned files to the repository rules without reformatting lockfiles, exported game data, or vendored files.
6. Add or update focused tests for affected behavior, then run proportionate compile or build checks when wiring or configuration changed.
7. Report generated artifacts, dependency or DI decisions, validation commands, and any deliberate exception.

## Keep UI-system decisions out of scope

Honor the existing token, componentization, `:host`, nesting, color, and flex-layout constraints, but do not invent the final theme taxonomy, visual language, interaction system, or component appearance. Defer those decisions to the future UI-focused repo-local skill or an explicit user request.
