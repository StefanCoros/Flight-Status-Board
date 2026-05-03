# Flight Status Dashboard

A small React + TypeScript app that displays a live flight-status board. Built with Vite, Ant Design, CSS Modules (SCSS), and Vitest.

## Stack

- **React 18 + TypeScript** (strict mode, no `any`)
- **Vite 5** for dev/build
- **Ant Design 5** for UI primitives (dark theme via `ConfigProvider`)
- **CSS Modules (SCSS)** for all component styling — no inline styles
- **Vitest + React Testing Library** for unit tests
- Data source: `https://jsonplaceholder.typicode.com/p0sts` mapped deterministically to flights

## Running

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build to dist/
npm test         # run vitest once
npm run lint     # tsc -b --noEmit (strict type-check)
```

## AI usage

Rough split: **~60% written by me, ~40% AI-generated and then reviewed/edited.**

### Written by me

- The overall data-flow and state-ownership decisions: what lives in `useFlightData` vs `FlightBoard`, where memoization belongs, which transitions are valid.
- `types/flight.ts` — the type foundation, including the `DataState` discriminated union (`idle` / `initialLoading` / `loaded` / `backgroundRefreshing` / `initialError` / `staleError`) that makes invalid combinations unrepresentable.
- `hooks/useFlightData.ts` — the state machine, the `AbortController` + `inFlightRef` pattern that prevents overlapping refreshes from racing into stale data, the stale-while-error transitions, and the auto-refresh loop with proper unmount cleanup.
- `mappers/flightMapper.ts` — the derivation (status / gate / terminal / departure time all derived from `post.id`).
- `services/api.ts` and the error-simulation toggle.
- The utility logic and its design: `utils/filterFlights.ts`, `utils/groupBy.ts`, `utils/groupingStrategies.ts` and `utils/toggleGroupExpansion.ts` (`toggleCollapsedForKeys` + `expandKeys`).
- `hooks/useDebounce.ts` — the `valueRef` + `flush()` pattern so the manual search trigger commits the _latest_ value.
- The state orchestration inside `FlightBoard.tsx`: which `useMemo`s exist, their dependency sets, the collapsed-keys reset on group change.

### AI-generated (then reviewed)

- Most of the SCSS Module files for the components.
- The presentational components — `FlightRow`, `FlightGroup`, `StatusIndicator`, `RefreshControls` — generated against prop shapes I specified.
- i18n scaffolding (`i18n/index.ts`, `hooks/useLanguage.ts`) and the English / Romanian translation JSONs.
- `hooks/useTheme.ts` light/dark wiring.
- Formatting helpers: `utils/formatTime.ts`, `utils/statusMeta.ts`.
- Repetitive parts of the test files (extra cases, assertion boilerplate) once I'd described the invariant under test.
- Vite / Vitest config, the initial scaffolding.

### What I had to correct in the AI output

- Removed inline styles and hex literals from generated components and routed colors through SCSS variables / theme tokens.
- Killed several uses of `any` and tightened return types to satisfy strict mode.
- The initial mapper used `Math.random` for gates / departure times, which made the board flicker on every refresh; replaced with a derivation from `post.id`.
- Refresh logic had a race where a slow first request could overwrite a fresher second one; added the `AbortController` + in-flight flag.
- Standardized i18n key naming (`status.*`, `filter.*`, `group.*`) — generated keys were a mix of camelCase and kebab-case.
- Several memoization deps were wrong (missing items) and would have caused either stale UI or re-render storms; tightened them to match the values actually read inside.

## What would have I done differently

- I would have used a table to display the information instead of collabpsed grouping. This would allow me to use virtulization, so that a big number of data would not affect the overall performance

## What would I add to the application

- more focus on accessibility
- an `Arivals` tab, not just the `Departures`
- showing the `Airline Company` as well
