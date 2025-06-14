---

### **`PRD.md` (Updated)**

Here is the updated PRD reflecting the new name and story.

```markdown
# PRD: Unspec'd - The Internal Tooling Framework

**Version:** 0.1
**Last Updated:** June 10, 2025
**Status:** In Development

## 1. Vision & Story

Building internal tools often feels like a choice between two painful options: wrestling with complex frontend frameworks or waiting in line for a dedicated frontend team.

**Unspec'd** is a developer-first framework designed to solve this. Its vision is to empower backend and TypeScript developers to rapidly build robust internal UIs by defining a simple, typed **"spec"** for their tool. The framework translates this spec into a dynamic, production-ready interface, creating a development experience that is **unspec**tedly fast and intuitive.

## 2. Target Audience

- Backend developers who are proficient in TypeScript but are not frontend experts.
- "Lazy frontend developers" who want to build functional UIs without the ceremony of a full-blown frontend framework.
- Any developer who "knows the needs and the constraints" and wants to build a solution without being blocked by a traditional frontend development cycle.

## 3. MVP Core Principles

- **Simplicity Over Expressiveness:** The framework will be highly opinionated in favor of making common patterns easy.
- **Declarative First:** The primary developer interface is a declarative TypeScript object ("the spec").
- **Clear Separation of Concerns:** The UI spec is distinct from the data/business logic.
- **TypeScript-Native:** Leverage TypeScript's type system as a core feature for clarity, safety, and autocompletion.

## 4. MVP Feature Set & Scope

Here is the checklist of features for the initial versions of the framework.

### Phase 1: Framework Core & "Easy" Patterns

- [x] **DSL Schema (v2):** Define and type the core `ToolSpec` structure and the schemas for `displayRecord` and `actionButton`.
- [x] **Framework Runtime:** Implement the core logic that parses a `ToolSpec` object and mounts components.
- [x] **Data Source Handling (Promises):** Implement the mechanism to call developer-provided `dataLoader` and `action` functions and handle the `Promise` lifecycle.
- [x] **Component: `displayRecord`:** Build the "smart component" for displaying key-value data.
- [x] **Component: `actionButton`:** Build the component for the single-action tool, including confirmation dialogs.
- [x] **Basic Styling:** Integrate Tailwind CSS for a clean, default theme.

### Phase 2: "Medium" Patterns & Key Features

- [x] **Component: `SmartTable` (Core):**
  - [x] Read-Only Display: Render a table from a dataLoader that returns { items, totalItems }.
  - [x] Server-Side Pagination: Implement pagination controls that re-trigger the dataLoader with new page parameters.
  - [x] Server-Side Sorting: Implement clickable column headers that re-trigger the dataLoader with sort parameters.
  - [x] Inline Editing: Implement the logic to switch rows to an edit state, render the correct editorType, and call the itemUpdater function upon saving.
- [x] **Component: `SmartForm` (`editForm`):**
  - [x] Field rendering from a declarative schema.
  - [x] Data loading to pre-fill the form.
  - [x] Submission handling and state management.
  - [x] Dynamic options loading for select inputs.

### Phase 3: The Developer Experience (DX) Wrapper

[x] UnspecdUI Application Shell:
  - [x] Implement the UnspecdUI class that accepts a views array.
  - [x] Implement the init(targetElement?) method with the optional target logic (on-demand DOM creation).
  - [x] Implement automatic navigation generation (e.g., a sidebar) based on the views array.
  - [x] Implement the routing logic to render the selected tool in the content area.
[x] unspecd Command-Line Interface (CLI):
  - [x] Set up the basic structure for a CLI command using Bun.
  - [x] Implement the dev command (unspecd dev [file]).
  - [x] Integrate automatic .env file loading.
  - [x] Implement in-memory generation and serving of a boilerplate index.html.
  
### Phase 4: Advanced DX & "Zero-Config" Workflow
Goal: To build upon the core framework with auto-discovery and other features that create the ultimate "less is more" developer experience.

[x] unspecd Command-Line Interface (CLI) Enhancements:
  - [x] Implement init command: Create unspecd init to scaffold a new project with an example unspecd.config.ts.
  - [x] Enhance dev command: Add "Dashboard Mode" with auto-discovery of tool files.
  - [x] Implement exec command: Add "Focus Mode" for running a single tool file.
[x] UnspecdUI Application Shell Enhancements:
  - [x] Add "Copy Command" UI feature: When in dashboard mode, add a button to copy the unspecd exec command for the current tool.

### Phase 5: Architecture & Deployability
Goal: To refactor the project into a robust, scalable, and deployable architecture with a shared core logic layer.

[x] Create core Module:
  - [x] Create a new src/core directory.
  - [x] Create src/core/discovery.ts and move the file-finding/globbing logic there.
  - [x] Create src/core/server.ts to contain the main logic for creating and launching the Vite development server.
[x] Refactor lib and cli to use core:
  - [x] Update the lib/server.ts (startServer function) to be a thin wrapper that calls the new core/server.ts module.
  - [x] Update the cli/commands/dev.ts and exec.ts files to also be thin wrappers that call the core/server.ts module.
[x] Project Restructuring & Cleanup:
  - [x] Reorganize all other files into the final src/cli and src/lib/components structure.
  - [x] Update all internal imports across the project to reflect the new structure.
[x] Package Configuration:
  - [x] Update package.json with the final bin path and exports map for the dual entry points.
[x] Implement Advanced Discovery & Configuration Logic:
  - [x] Enhance core/discovery.ts to read unspecd.config.ts and use its path patterns.
  - [x] Enhance cli/commands/dev.ts to support the full configuration hierarchy (CLI flags > config file > defaults) and pass the cwd flag.
  - [x] Enhance lib/server.ts to also support the configuration object for consistency.

## 5. Non-Goals for MVP

- Complex Dashboards (`S1`) with inter-component communication.
- Advanced Search (`S2`).
- Batch Operations (`U3`, `D2`).
- File Management (`S3`).
- True real-time/streaming data sources via WebSockets/SSE.

## 6. Technology Stack

- Runtime / Bundler / Tester: Bun
- UI Dev Server (if needed): Vite
- Styling: Tailwind CSS (throw CDN)
- Language: TypeScript

## 7. Success Metrics

- Successful implementation of the "Easy" and "Medium" patterns defined in the MVP scope.
- Ability to build the `Feature Flag Dashboard` and `User Role Editor` example tools using the MVP framework.
- Positive feedback on the ease of use of the DSL from an initial internal developer review.
```
