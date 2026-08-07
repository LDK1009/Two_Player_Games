# Two Player Games Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 실험 저장소와 분리된 Expo SDK 57 기반 2인용 미니게임 배포 프로젝트를 만들고 확정 기술 스택을 설치·연결한다.

**Architecture:** Expo Router의 `src/app`은 라우트 진입만 담당하고 실제 화면은 `src/views`, 공통 저장소·테마는 `src/shared`에 둔다. 실시간 게임 좌표는 Reanimated SharedValue와 게임별 엔진에서 관리하며, Zustand는 설정·전적만 MMKV에 영구 저장한다.

**Tech Stack:** Expo SDK 57 and the React / React Native / TypeScript versions selected by its official template, Expo Router, React Native Skia, Reanimated, Gesture Handler, Planck.js, expo-audio, expo-haptics, Zustand, react-native-mmkv

## Global Constraints

- 기존 `One_Day_One_App` 소스·의존성·Git 기록을 변경하지 않는다.
- 새 프로젝트 경로는 `C:\Users\m3088\development\business\app\Two_Player_Games`이다.
- `AsyncStorage`를 설치하지 않는다.
- MMKV는 native module이므로 개발은 Expo Go가 아닌 dev build를 사용한다.
- Android package는 스토어 등록 전까지 app config에 확정하지 않는다.
- 앱 표시 이름은 `둘이 하는 게임`, slug는 `two-player-games`로 설정한다.
- 빌드와 푸시는 실행하지 않는다.

---

### Task 1: Expo SDK 57 프로젝트 생성과 정리

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `src/app/_layout.tsx`
- Create: `src/app/index.tsx`
- Create: `src/views/home/HomeView.tsx`
- Create: `TASKS.md`

**Interfaces:**
- Consumes: Node.js 20.19 이상과 npm
- Produces: `expo-router/entry`를 사용하는 SDK 57 TypeScript 앱

- [x] **Step 1: SDK 57 기본 프로젝트 생성**

Run: `npx create-expo-app@latest Two_Player_Games --template default@sdk-57 --yes`

Expected: `expo ~57`과 SDK 57 템플릿이 선택한 React, React Native, Expo Router가 포함된 프로젝트가 생성된다.

- [x] **Step 2: 예제 라우트와 예제 자원 제거**

기본 템플릿의 탭 예제·샘플 컴포넌트·샘플 이미지를 제거하고 `src/app/_layout.tsx`, `src/app/index.tsx`, `src/views/home/HomeView.tsx`만 남긴다.

- [x] **Step 3: 앱 설정 확정**

`app.json`의 `name`, `slug`, `scheme`, orientation을 각각 `둘이 하는 게임`, `two-player-games`, `twoplayergames`, `portrait`로 설정한다. Android package는 추가하지 않는다.

- [x] **Step 4: 홈 화면 진입 검증**

`src/app/index.tsx`는 `HomeView`만 반환하고, `HomeView`는 앱 이름과 `게임을 준비하고 있어요` 문구를 렌더한다.

### Task 2: 확정 기술 스택 설치와 기반 연결

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/shared/storage/mmkvStorage.ts`
- Create: `src/shared/store/useSettingsStore.ts`
- Create: `src/shared/theme/tokens.ts`
- Modify: `src/app/_layout.tsx`
- Modify: `src/views/home/HomeView.tsx`

**Interfaces:**
- Consumes: SDK 57 Expo 프로젝트
- Produces: `storage`, `useSettingsStore`, Gesture Handler root, Skia/Reanimated/Planck import 검증 화면

- [x] **Step 1: Expo 호환 네이티브 패키지 설치**

Run: `npx expo install @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler expo-audio expo-haptics expo-dev-client react-native-mmkv react-native-nitro-modules`

Expected: SDK 57 호환 버전이 package manifest와 lockfile에 기록된다.

- [x] **Step 2: 순수 JavaScript 패키지 설치**

Run: `npm install planck zustand`

Expected: `planck`, `zustand`가 설치되고 `@react-native-async-storage/async-storage`는 존재하지 않는다.

- [x] **Step 3: MMKV 기반 Zustand persist 구현**

`mmkvStorage.ts`는 앱 전체에서 재사용할 MMKV 인스턴스와 Zustand용 `StateStorage` 어댑터를 export한다. `useSettingsStore.ts`는 `isSoundEnabled`, `isHapticsEnabled`, 각 toggle action을 `two-player-games-settings` 키로 persist한다.

- [x] **Step 4: 런타임 기반 연결**

루트는 `GestureHandlerRootView`로 감싼다. 홈 화면은 Skia `Canvas`와 Reanimated 진입 애니메이션을 사용하고, 탭하면 Gesture Handler가 햅틱 설정에 따라 `expo-haptics`를 호출한다. Planck는 작은 검증 월드를 생성해 중력 상수가 정상인지 화면 배지로 표시한다.

- [x] **Step 5: 오디오 서비스 경계 생성**

`src/shared/audio/gameAudio.ts`는 `expo-audio`의 preload/play 생명주기를 게임 화면에서 직접 반복하지 않도록 `preloadGameAudio`, `createGameAudioPlayer`를 export한다. 실제 음원 자산은 첫 게임에서 추가한다.

### Task 3: 정적 검증과 저장소 인계

**Files:**
- Modify: `TASKS.md`
- Modify: `docs/superpowers/plans/2026-08-07-two-player-games-bootstrap.md`

**Interfaces:**
- Consumes: Task 1~2 결과
- Produces: 검증된 새 Git 저장소와 완료 기록

- [x] **Step 1: 의존성 검증**

Run: `npm ls --depth=0`

Expected: 확정 스택이 한 번씩 설치되고 missing/invalid package가 없다.

- [x] **Step 2: Expo·타입·린트 검증**

Run: `npx expo-doctor`

Run: `npm run typecheck`

Run: `npm run lint`

Expected: 모든 명령 exit 0.

- [x] **Step 3: 저장소 상태 검증**

Run: `git diff --check`

Expected: whitespace 오류가 없고 기존 실험 프로젝트에는 변경 파일이 없다.

- [x] **Step 4: 작업 브랜치 커밋**

```bash
git add .
git commit -m "🌱 2인용 게임 앱 기술 스택 초기화"
```

- [x] **Step 5: 프로젝트 이동**

검증된 staging 프로젝트를 `C:\Users\m3088\development\business\app\Two_Player_Games`로 이동하고 최종 경로와 실행 명령 `npx expo start --dev-client`을 안내한다.
