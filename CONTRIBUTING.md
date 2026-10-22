# Contributing — Clean Code Rules

All code in this repo must follow these rules. No exceptions unless explicitly agreed in a PR.

## 1. Naming

### Variables (camelCase, never generic)

```ts
// ❌ bad — generic names tell you nothing
const data = await getSpeakers();
const list = speakers.filter(isActive);
const x = 42;
const info = getUser();
const temp = a;
const flag = true;
const obj = {};
const item = rows[0];

// ✅ good — name says WHAT it is
const speakerRecords = await getSpeakers();
const activeSpeakers = speakers.filter(isActive);
const retryCount = 42;
const moderatorProfile = getUser();
const previousScore = currentScore;
const hasRegistrationClosed = true;
const registrationPayload = {};
const keynoteSpeaker = rows[0];
```

- Variables/params/functions: `camelCase`.
- Boolean variables MUST start with `is` / `has` / `can` / `should` / `was`.
- Event handlers MUST be `handleVerb` (e.g. `handleRegisterClick`).
- Fetch/API data: suffix with `Data`/`Records`/`Payload`/`Response`, not `data` alone (`registrationData`, not `data`).
- Collections: plural (`speakerIds`, not `speaker`).
- Module-level fixed values: `UPPER_SNAKE_CASE` (`MAX_WORKSHOP_SEATS = 200`).
- No abbreviations except the obvious (`id`, `url`, `props`, `ctx`).
- One concept = one name. Never reuse `info`/`item`/`thing` for different things.

### Files and folders (kebab-case)

```text
src/
  app/
  components/
    speaker-card.tsx        ✅
    registration-form.tsx   ❌ RegistrationForm.tsx
  hooks/
    use-speakers.ts
  lib/
    format-schedule.ts
  types/
    speaker.ts
```

- Every file/folder: `kebab-case.tsx` / `kebab-case.ts`.
- File name = the one thing it exports (`speaker-card.tsx` → `SpeakerCard`).
- One exported component per file. Helper subcomponents used only inside that file are allowed; anything reused → its own file.

### Components

```tsx
// file: src/components/speaker-card.tsx
export const SpeakerCard = ({ name, topic }: SpeakerCardProps) => { ... };
```

- Exported component identifier: `PascalCase` (JSX requires it — `<speaker-card>` would be treated as an HTML tag).
- Default exports: avoid. Use named exports.
- Props type: `<ComponentName>Props`, defined next to the component.
- Hooks: `useXyz`. Utilities: verb + noun (`formatScheduleTime`).

## 2. Arrow functions only

```ts
// ❌ never
function getSpeakers() {}
export default function Page() {}
const cb = function () {};

// ✅ always
const getSpeakers = () => {};
const Page = () => <main />;
export default Page; // when a default export is unavoidable (Next.js routes), export a named const
```

- All functions — components, handlers, utils, callbacks — are `const` arrow functions.
- No `function` keyword anywhere (including `async`): `const loadSpeakers = async () => {}`.
- No anonymous arrows passed deep into JSX; extract a named handler.
- Short bodies: implicit return. Multi-statement: braces + explicit `return`.

```ts
const isActive = (speaker: Speaker) => speaker.confirmedAt !== null;
const toggleAgenda = () => setIsAgendaOpen((wasOpen) => !wasOpen);
```

## 3. Component rules

- **Length**: a component must stay under **~50 lines** of JSX/logic (excluding imports/types). Over that → split.
- **Total components per file**: 1 exported component per file (plus private helpers it uses).
- **Params**: max **2 params**, use a props object. Max **3 params** for plain functions — beyond that, pass an options object.
- **Nesting**: JSX depth ≤ 3 levels. Deeper → extract a subcomponent.
- **No inline logic in JSX**: no ternaries/IIFEs longer than one line inside the return; compute a named value above.
- **Early return / guard clauses** instead of `else` ladders.

```tsx
// ❌
const SpeakerList = ({ speakers }: SpeakerListProps) =>
  speakers.length > 0 ? (speakers.map(...)) : <EmptyState />;

// ✅
const SpeakerList = ({ speakers }: SpeakerListProps) => {
  if (speakers.length === 0) {
    return <EmptyState />;
  }
  return <ul>...</ul>;
};
```

- **Props**: destructure in the signature, no `props.x` access, no prop drilling deeper than 2 levels (lift state or pass a callback).
- Client-only interactivity → `"use client"` at the top of that file only; keep everything else a server component.

## 4. Classes

Prefer functions/arrow functions. A class is allowed **only** for stateful domain objects or error types (not for React components).

```ts
// structure, in this order:
export class RegistrationError extends Error {
  // 1. static constants first
  static readonly CODE = "REGISTRATION_FULL";

  // 2. private fields
  #seatCount: number;

  // 3. constructor — assign only, no logic beyond validation
  constructor(seatCount: number) {
    super(RegistrationError.CODE);
    this.#seatCount = seatCount;
  }

  // 4. public methods (verb-named), 5. private helpers (#prefix)
  public getRemainingSeats = (): number => ...;
  #validateSeatCount = (): void => ...;
}
```

- `PascalCase` name, one class = one responsibility.
- Fields private by default (`#`), expose behavior not data.
- Methods are arrow-function class fields (`public getRemaining = () => ...`).
- No classes in `.tsx` files — components are functions.

## 5. Styling — Tailwind only

- Styling is done exclusively with Tailwind utility classes in `className`.
- No `style={{ ... }}` inline styles (exception: a value computed at runtime, e.g. `style={{ width: progress + "%" }}`).
- No CSS Modules, no styled-components, no `<style>` tags, no new global CSS rules (only `src/app/globals.css` theme tokens).
- Repeated class groups (3+ uses) → extract to a `const` in the same file:

```ts
const CARD_CLASSES = "rounded-2xl border border-zinc-200 p-6 shadow-sm";
```

## 6. Animations — motion

- Install-free rule: if animation is needed, import **only** from `motion/react`:

```ts
// ❌
import { motion } from "framer-motion";

// ✅
import { motion } from "motion/react";
```

- No other animation libraries.

## 7. TypeScript

- No `any` — use `unknown` + narrowing, or a real type.
- No type assertions (`as`) unless interop with a third-party API forces it.
- Always type function returns and props explicitly.
- Prefer `type` unions over `boolean` flag props: `<SpeakerCard variant="keynote" />`, not `isKeynote`.
- Enums: avoid — use `as const` objects.

## 8. Functions (general clean code)

- Do one thing; name says what that thing is.
- Max ~20 lines per function (excluding the component rule above).
- Pure where possible: same input → same output, no hidden mutation.
- No side effects in render/derive paths; effects live in `useEffect`/server actions.
- No boolean "flag" parameters — split into two functions or pass an options object.
- No nested callbacks 3 deep → extract a named function.
- DRY — but never abstract a coincidence; two rules that merely look alike stay duplicated until the third real use.

## 9. SOLID

- **S — Single responsibility**: a component renders one thing; a hook owns one piece of state; a lib file does one job (`formatScheduleTime.ts` formats, nothing else).
- **O — Open/closed**: extend via props/variants/composition, not by editing existing components with `if (mode === ...)` branches. Add a `variant` prop or a new component instead.
- **L — Liskov**: any `Speaker` implementation/subtype must be drop-in where `Speaker` is expected; never tighten a prop type in a subclass/extension.
- **I — Interface segregation**: don't force callers to pass 12 props. Split props: `SpeakerCardProps` = what the card needs; pass `onRegister` only to the button.
- **D — Dependency inversion**: components depend on abstractions (types, prop contracts, service interfaces in `src/lib`), not on concrete fetches scattered inline. Data access lives behind one function (`getSpeakers()`), so the source can change in one place.

## 10. Everything else

- **KISS** — the simplest working version wins; no speculative abstractions.
- **YAGNI** — build it when it's needed, not before.
- **Fail fast, fail loud** — handle errors at the boundary; never `catch {}` silently.
- **Comments**: comment the WHY, never the WHAT. If you need a "what" comment, rename the variable.
- **Imports**: ordered — std/built-in → npm → `@/` internal → relative; no deep `../../..` (use the `@/` alias).
- **Constants over magic numbers** — no raw `86400000` in code.
- **No dead code, no commented-out code, no `console.log` in committed code** (use proper error handling).
- **Files** stay under ~200 lines; over → split by responsibility.
- Run `npm run lint` before every commit — it must pass clean.
