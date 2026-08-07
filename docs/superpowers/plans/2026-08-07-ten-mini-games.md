# Ten Two-Player Mini Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable arcade launcher and ten complete local two-player mini games with ready, countdown, play, result, replay, and record flows.

**Architecture:** A dynamic Expo Router route resolves a typed game registry and renders one self-contained game component inside a shared `GameShell`. Frame-level motion stays in Reanimated shared values, local component state, or Planck worlds; only durable records go through Zustand persist and MMKV. Deterministic rules are pure TypeScript functions covered by Node tests through `tsx`.

**Tech Stack:** Expo SDK 57, Expo Router, React Native, TypeScript, React Native Skia, Reanimated, Gesture Handler, Planck.js, expo-sensors, expo-haptics, Zustand, MMKV, Node test runner, tsx

## Global Constraints

- Android development build already contains every required native module; do not add a native dependency.
- P1 uses coral and P2 uses blue; P2-facing controls rotate 180 degrees when players sit opposite each other.
- Every game reaches a result in 15–60 seconds and supports replay without leaving the route.
- Games never import another game's code; reusable behavior belongs under `src/shared`.
- Frame coordinates and physics bodies never enter Zustand.
- Shared values use `.get()` and `.set()`, never `.value =`.
- Audio players and sensor subscriptions are removed on unmount.
- No online multiplayer, account, backend, real ad, or real purchase flow is included.

---

### Task 1: Test Harness, Registry, and Durable Records

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/shared/types/game.ts`
- Create: `src/shared/constants/games.ts`
- Create: `src/shared/store/useGameRecordsStore.ts`
- Test: `src/shared/constants/games.test.ts`

**Interfaces:**
- Produces: `GameId`, `GameDefinition`, `GameResult`, `GameComponentProps`
- Produces: `GAME_DEFINITIONS`, `getGameDefinition(gameId)`
- Produces: `useGameRecordsStore` with `saveResult(gameId, result)` and `recentGameId`

- [x] **Step 1: Install the TypeScript test runner**

Run: `npm install --save-dev tsx`

Add scripts:

```json
"test": "tsx --test \"src/**/*.test.ts\""
```

- [x] **Step 2: Write the failing registry tests**

```ts
test('registers exactly ten unique games', () => {
  assert.equal(GAME_DEFINITIONS.length, 10);
  assert.equal(new Set(GAME_DEFINITIONS.map(({ id }) => id)).size, 10);
});

test('returns undefined for an unknown game id', () => {
  assert.equal(getGameDefinition('missing'), undefined);
});
```

- [x] **Step 3: Run the tests and verify RED**

Run: `npm test`
Expected: FAIL because the registry module does not exist.

- [x] **Step 4: Implement the shared types and registry**

```ts
export type GameId =
  | 'finger-sumo' | 'reaction-stop' | 'air-hockey' | 'dual-rocket'
  | 'couple-sync' | 'bomb-manual' | 'chicken-button' | 'color-trap'
  | 'secret-prediction' | 'tilt-maze';

export type GameResult = {
  winner: 'p1' | 'p2' | 'draw' | 'team';
  title: string;
  subtitle: string;
  p1Score?: number;
  p2Score?: number;
  recordValue?: number;
};
```

Register all ten titles, modes, durations, icons, accents, and one-line rules. Persist only recent game ID, play count, win counts, and best numeric record.

- [x] **Step 5: Run tests and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all exit 0.

Commit: `🧪 게임 레지스트리와 테스트 기반 추가`

### Task 2: Shared Game Shell, Dynamic Route, and Launcher

**Files:**
- Create: `src/app/games/[gameId].tsx`
- Create: `src/views/game/GameRouteView.tsx`
- Create: `src/views/game/_components/GameComponentResolver.tsx`
- Create: `src/shared/components/game/GameShell.tsx`
- Create: `src/shared/components/game/PlayerBadge.tsx`
- Create: `src/shared/hooks/useGameCountdown.ts`
- Replace: `src/views/home/HomeView.tsx`
- Modify: `src/shared/theme/tokens.ts`

**Interfaces:**
- Consumes: `GameDefinition`, `GameResult`, `GAME_DEFINITIONS`
- Produces: common phase flow `ready → countdown → playing → result`
- Produces: `GameComponentResolver({ gameId, roundKey, onFinish })`

- [x] **Step 1: Write failing countdown reducer tests**

Test `advanceCountdown(3) === 2`, `advanceCountdown(1) === 0`, and that values never become negative.

- [x] **Step 2: Verify RED and implement the countdown utility/hook**

Run `npm test`, then implement a one-second interval that cleans up on phase change and unmount.

- [x] **Step 3: Implement `GameShell`**

The shell renders the rule card, start button, 3–2–1 overlay, game content, and a result card with replay/home controls. Incrementing `roundKey` remounts the game cleanly.

- [x] **Step 4: Implement dynamic routing and unknown-ID handling**

`[gameId].tsx` passes the string parameter to `GameRouteView`; unknown IDs show a Korean error message and a home button.

- [x] **Step 5: Replace the home view**

Render a two-column `ScrollView` card grid for all ten games, show mode/duration tags, recent game, and settings toggles. Route with `router.push({ pathname: '/games/[gameId]', params: { gameId } })`.

- [x] **Step 6: Verify and commit**

Run: `npm test && npm run typecheck && npm run lint`

Commit: `✨ 공통 게임 셸과 미니게임 런처 구현`

### Task 3: Reaction Stop and Color Trap

**Files:**
- Create: `src/views/game/_components/games/ReactionStopGame.tsx`
- Create: `src/views/game/_components/games/ColorTrapGame.tsx`
- Create: `src/views/game/_utils/reactionStopRules.ts`
- Create: `src/views/game/_utils/reactionStopRules.test.ts`
- Create: `src/views/game/_utils/colorTrapRules.ts`
- Create: `src/views/game/_utils/colorTrapRules.test.ts`
- Modify: `src/views/game/_components/GameComponentResolver.tsx`

**Interfaces:**
- Produces: `resolveReactionWinner(releasedPlayer, signalState)`
- Produces: `createColorTrapRound(randomValue)`, `scoreColorAnswer(round, answer)`

- [x] **Step 1: Write failing reaction tests**

Cover P1/P2 legal release, false start, and simultaneous draw.

- [x] **Step 2: Implement reaction rules and component**

Use a 1.5–4 second randomized signal timer. Pointer down arms each player; release before green loses, first legal release wins. Gate completion so one result is emitted.

- [x] **Step 3: Write failing color tests**

Verify generated display word and ink color can differ, correct ink choice awards one, and a wrong choice subtracts one.

- [x] **Step 4: Implement color rules and component**

Run ten rounds, rotate the P2 controls, emit score result after round ten, and haptically distinguish correct/wrong answers.

- [x] **Step 5: Verify and commit**

Run all tests, typecheck, and lint.

Commit: `✨ 반응속도와 색깔 함정 게임 구현`

### Task 4: Chicken Button and Secret Prediction

**Files:**
- Create: `src/views/game/_components/games/ChickenButtonGame.tsx`
- Create: `src/views/game/_components/games/SecretPredictionGame.tsx`
- Create: `src/views/game/_utils/chickenRules.ts`
- Create: `src/views/game/_utils/chickenRules.test.ts`
- Create: `src/views/game/_utils/predictionRules.ts`
- Create: `src/views/game/_utils/predictionRules.test.ts`
- Modify: `src/views/game/_components/GameComponentResolver.tsx`

**Interfaces:**
- Produces: `resolveChickenRound(releaseTimes, explosionTime)`
- Produces: `scorePredictionRound(p1Prediction, p1Choice, p2Prediction, p2Choice)`

- [x] **Step 1: Test and implement chicken round rules**

Cover both safe releases, one explosion, both explosion, and equal safe times. The component animates pressure without revealing the exact explosion point.

- [x] **Step 2: Test and implement prediction scoring**

P1 scores when predicting P2's choice; P2 scores when predicting P1's choice. Keep choices hidden until all four inputs exist, repeat five rounds, then finish.

- [x] **Step 3: Verify and commit**

Run all tests, typecheck, and lint.

Commit: `✨ 치킨 버튼과 비밀 예측 게임 구현`

### Task 5: Couple Sync and Bomb Manual

**Files:**
- Create: `src/views/game/_components/games/CoupleSyncGame.tsx`
- Create: `src/views/game/_components/games/BombManualGame.tsx`
- Create: `src/views/game/_constants/coupleQuestions.ts`
- Create: `src/views/game/_utils/bombRules.ts`
- Create: `src/views/game/_utils/bombRules.test.ts`
- Modify: `src/views/game/_components/GameComponentResolver.tsx`

**Interfaces:**
- Produces: seven fixed Korean two-choice questions
- Produces: `createBombPuzzle(seed)` and `validateBombStep(puzzle, stepIndex, input)`

- [x] **Step 1: Test and implement deterministic bomb puzzle generation**

The same numeric seed must return the same wire colors, symbol order, and three expected answers. Invalid step indexes return false.

- [x] **Step 2: Implement couple sync**

Collect both hidden answers, reveal simultaneously, advance through seven questions, and map matches to one of four result subtitles.

- [x] **Step 3: Implement bomb manual**

Render the manual upside down in P2's half and the interactive bomb in P1's half. Two mistakes or 45 seconds fail; three correct steps win.

- [x] **Step 4: Verify and commit**

Run all tests, typecheck, and lint.

Commit: `✨ 커플 궁합과 폭탄 설명서 게임 구현`

### Task 6: Finger Sumo and Air Hockey Physics

**Files:**
- Create: `src/views/game/_components/games/FingerSumoGame.tsx`
- Create: `src/views/game/_components/games/AirHockeyGame.tsx`
- Create: `src/views/game/_utils/physicsBounds.ts`
- Create: `src/views/game/_utils/physicsBounds.test.ts`
- Modify: `src/views/game/_components/GameComponentResolver.tsx`

**Interfaces:**
- Produces: `isCircleOutsideArena(circle, arena)` and `detectGoal(puck, field)`
- Uses Planck worlds locally inside each component; render coordinates are shared values.

- [x] **Step 1: Test physics boundary helpers**

Cover circles fully inside, touching, and fully outside the sumo arena; cover top goal, bottom goal, and no goal.

- [x] **Step 2: Implement finger sumo**

Create two dynamic circle bodies and static arena boundaries. Gesture velocity applies impulses. A 60 Hz loop steps physics, updates Skia positions, and ends when one body is fully outside.

- [x] **Step 3: Implement air hockey**

Create one dynamic puck, two kinematic paddles, walls with goal gaps, 45-second timer, and five-goal early finish. Reset the puck after each goal.

- [x] **Step 4: Verify and commit**

Run all tests, typecheck, and lint.

Commit: `✨ 핑거 스모와 에어하키 물리 게임 구현`

### Task 7: Dual Rocket and Tilt Maze

**Files:**
- Create: `src/views/game/_components/games/DualRocketGame.tsx`
- Create: `src/views/game/_components/games/TiltMazeGame.tsx`
- Create: `src/views/game/_utils/rocketRules.ts`
- Create: `src/views/game/_utils/rocketRules.test.ts`
- Create: `src/views/game/_utils/mazeRules.ts`
- Create: `src/views/game/_utils/mazeRules.test.ts`
- Modify: `src/views/game/_components/GameComponentResolver.tsx`

**Interfaces:**
- Produces: `calculateRocketForce(leftThrottle, rightThrottle)`
- Produces: `hasReachedCheckpoint(ball, checkpoint)` and `nextCheckpointIndex(current, total)`

- [x] **Step 1: Test and implement rocket force conversion**

Equal throttles produce vertical force with zero torque; left-only and right-only produce opposite torque signs.

- [x] **Step 2: Implement dual rocket**

Use two hold buttons, a simple fixed-step flight model, scrolling obstacles, collision reset, and a 30-second shared checkpoint score.

- [x] **Step 3: Test and implement maze checkpoint rules**

Only the active checkpoint advances. Reaching the third checkpoint produces completion; wall contacts increment collision count with a debounce.

- [x] **Step 4: Implement tilt maze**

Subscribe to `Accelerometer` at 30 Hz, smooth x/y values, move the ball through bounded corridors, and clean up the subscription on replay/unmount.

- [x] **Step 5: Verify and commit**

Run all tests, typecheck, and lint.

Commit: `✨ 협동 로켓과 기울기 미로 구현`

### Task 8: Integration, Device UX, and Completion

**Files:**
- Modify: `README.md`
- Modify: `TASKS.md`
- Modify: `docs/superpowers/plans/2026-08-07-ten-mini-games.md`
- Modify only as required by verification: files created in Tasks 1–7

**Interfaces:**
- Consumes all ten games and the shared shell
- Produces a clean feature branch ready for user device review

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`
Expected: all rule and registry tests pass with zero failures.

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npx expo-doctor`

Expected: all commands exit 0 and Expo Doctor reports every check passing.

- [ ] **Step 3: Verify all routes against the running development server**

Open every launcher card, start a round, reach a result, replay, and return home. Verify P2 rotation, safe areas, Android back behavior, timers, sensor cleanup, and no red error overlay.

- [ ] **Step 4: Update documentation and task status**

Document the ten games, dev-client start command, and test commands in `README.md`. Mark the task and every plan checkbox complete.

- [ ] **Step 5: Final commit**

Commit: `🌱 추천 미니게임 10개 구현 완료`

Do not merge this feature branch until the user approves the device result. Push the feature branch because the user explicitly requested remote synchronization.
