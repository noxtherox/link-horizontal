# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Vite, port 8080)
pnpm build        # Production build
pnpm build:dev    # Development mode build
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

This project uses **pnpm** as its package manager.

## Tech Stack Rules

- **React + TypeScript** — all source in `src/`, pages in `src/pages/`, components in `src/components/`
- **Routing** — React Router v6; keep all routes in `src/App.tsx`
- **UI** — shadcn/ui components are pre-installed; do not re-install. Do not edit files under `src/components/ui/` — create new wrapper components instead.
- **Styling** — Tailwind CSS only; dark theme with near-black backgrounds (`bg-[#0f0f0f]`, `border-[#2a2a2a]`) and yellow accents (`yellow-500`)
- **Icons** — lucide-react
- **Always update `src/pages/Index.tsx`** when adding new components, otherwise they won't be visible

## Architecture

This is a single-page welding operations management app with mock data (`src/data/mockData.ts`) and no backend API.

### State Machine

The app models a welder workflow as a state machine managed entirely by `src/hooks/useWeldFlow.ts` (~372 lines):

```
taskQueue → weldActive (setup → arc) → reviewAndSign
```

- **taskQueue** — welder picks a weld from the part queue
- **weldActive** — two sub-modes: `setup` (verify consumables, gas check) and `arc` (active timer, arc passes)
- **reviewAndSign** — review completed arcs, add deviations, sign off

There is also a **supervisor** view mode (`FloorStatus.tsx`) showing a heatmap of all welding stations — toggled via `ViewMode` in the header.

### Data Flow

`src/pages/Index.tsx` is the root layout. It calls `useWeldFlow()` and passes all state and callbacks down to child components via props (prop drilling — no Context API). Components do not manage their own weld state.

Key callbacks from `useWeldFlow`:
- `selectWeld(weld)` → enters weld active
- `verifyConsumable(id)` → marks consumable verified
- `startArc()` / `toggleArcPause()` / `completeWeld()` → arc lifecycle
- `signWeld()` → finalizes, removes from queue
- `sendToInspection()` → locks all completed welds

### Key Types (`src/types/weldcloud.ts`)

- `Weld` — joint with `process` (GTAW | GMAW | SMAW | FCAW), WPS reference
- `Part` — assembly containing multiple `Weld`s
- `Arc` — single arc pass with timing, voltage, current, heat input
- `Consumable` — wire/gas with lot number traceability
- `CompletedWeld` — finalized weld + arcs + sign-off metadata

### Component Map

| Component | Role |
|---|---|
| `Header.tsx` | Step tracker, view mode toggle (welder/supervisor) |
| `TaskQueue.tsx` | Parts and weld list; select work |
| `WeldActive.tsx` | Setup and arc welding modes |
| `ReviewAndSign.tsx` | Sign-off, deviation tracking |
| `FloorStatus.tsx` | Supervisor heatmap of all stations |
| `VoicePanel.tsx` | Voice command sidebar |
| `StatusBar.tsx` | Bottom context hint bar |
| `DrawingWithHighlight.tsx` | Weld location diagram |
