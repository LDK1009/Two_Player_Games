# Native Capability Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install and configure the shared native capability pack, monetization SDKs, OTA runtime, and one reusable Android development build.

**Architecture:** Expo config owns build-time native identifiers and plugins while runtime feature code remains uninitialized until a game uses it. EAS produces an internal development APK with a development-only package and Google sample AdMob App ID; RevenueCat credentials remain outside Git.

**Tech Stack:** Expo SDK 57, EAS Build, expo-updates, Expo native capability modules, React Native Google Mobile Ads, RevenueCat React Native SDK

## Global Constraints

- Android development package is `com.devpreneur_ko.two_player_games.dev`.
- Expo owner is `devpreneur_ko`.
- Development AdMob App ID is `ca-app-pub-3940256099942544~3347511713`.
- RevenueCat API keys and production monetization identifiers must not be committed.
- Do not add camera, microphone, location, or Bluetooth permissions.
- Do not run a production or store build.
- Do not push Git commits.

---

### Task 1: Install the native capability pack

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Expo SDK 57 dependency graph
- Produces: installed native modules available to CNG and EAS Build

- [x] **Step 1: Install Expo-compatible modules**

Run: `npx expo install expo-sensors expo-keep-awake expo-notifications react-native-view-shot expo-sharing expo-media-library expo-updates react-native-purchases react-native-purchases-ui`

Expected: Expo selects SDK 57 compatible package versions and updates the lockfile.

- [x] **Step 2: Install the AdMob SDK**

Run: `npm install react-native-google-mobile-ads`

Expected: the package and its config plugin are installed without peer dependency errors.

- [x] **Step 3: Inspect installed config plugin contracts**

Read the installed package config plugins and verify the exact AdMob option names before editing app config.

### Task 2: Configure native identifiers, plugins, and EAS

**Files:**
- Modify: `app.json`
- Create: `eas.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: installed config plugin schemas
- Produces: resolved Expo config with development package, AdMob sample App ID, plugins, and fingerprint runtime policy

- [x] **Step 1: Configure the static app config**

`app.json` keeps the existing app metadata and adds:

```ts
owner: 'devpreneur_ko',
runtimeVersion: { policy: 'fingerprint' },
android: { package: 'com.devpreneur_ko.two_player_games.dev' },
```

Configure AdMob with `ca-app-pub-3940256099942544~3347511713`, disable audio recording, and add notifications, media library, sharing, and updates plugins using their installed schemas.

- [x] **Step 2: Create the development build profile**

Create `eas.json` with:

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

- [x] **Step 3: Link the Expo project and configure updates**

Run: `npx eas-cli@latest init`

Run: `npx eas-cli@latest update:configure`

Expected: `extra.eas.projectId` and the EAS update URL are present while `runtimeVersion.policy` remains `fingerprint`.

### Task 3: Verify the native graph

**Files:**
- Modify: `docs/superpowers/plans/2026-08-07-native-capability-pack.md`

**Interfaces:**
- Consumes: installed packages and resolved Expo config
- Produces: evidence that the project is ready for EAS Build

- [x] **Step 1: Validate dependencies**

Run: `npm ls --depth=0`

Expected: exit 0 with no missing or invalid package.

- [x] **Step 2: Validate Expo compatibility**

Run: `npx expo-doctor`

Expected: all checks pass.

- [x] **Step 3: Validate code and configuration**

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npx expo config --type public`

Expected: all commands exit 0 and resolved config contains the required identifiers without forbidden permissions.

- [x] **Step 4: Commit the verified capability pack**

```bash
git add .
git commit -m "⚙ 공통 네이티브 기능과 수익화 모듈 추가"
```

### Task 4: Build and monitor the Android development client

**Files:**
- Modify: `TASKS.md`
- Modify: `docs/superpowers/plans/2026-08-07-native-capability-pack.md`

**Interfaces:**
- Consumes: clean committed feature branch and EAS development profile
- Produces: installable Android development APK URL and build ID

- [x] **Step 1: Start the cloud build**

Run: `npx eas-cli@latest build --platform android --profile development --non-interactive`

Expected: EAS accepts the project and returns a build ID.

- [x] **Step 2: Confirm the terminal state**

Run: `npx eas-cli@latest build:list --platform android --status finished --limit 1 --json --non-interactive`

Expected: the newest Android build is returned with status `finished`; if the build command failed, inspect its Gradle logs and fix the root cause before rebuilding.

Result: build `20d3aea0-2cc9-490e-958e-9a72ac1afacd` finished successfully. The first build exposed a Kotlin metadata mismatch in Google Mobile Ads 25.4.0; pinning `react-native-google-mobile-ads` to 16.3.0 selected Google Mobile Ads 25.0.0 and removed the mismatch.

- [x] **Step 3: Record completion**

Mark `TASKS.md` and this plan complete, commit the final status, and report the APK installation URL. Do not push or merge the branch.
