# 네이티브 기능 팩과 개발 빌드 설계

## 목적

첫 번째 게임부터 이후 미니게임까지 네이티브 모듈 추가로 development build를 반복하지 않도록 공통 기능을 한 번에 포함한다. 이번 산출물은 Android 내부 배포용 development APK이며 스토어 제출용 바이너리는 아니다.

## 포함 범위

### 기존 게임 엔진

- React Native Skia
- Reanimated와 Worklets
- Gesture Handler
- Planck.js
- expo-audio와 expo-haptics
- Zustand persist와 MMKV

### 추가 공통 기능

- `expo-sensors`: 기울이기·흔들기 게임
- `expo-keep-awake`: 경기 중 화면 꺼짐 방지
- `expo-notifications`: 로컬 알림과 향후 푸시 알림
- `react-native-view-shot`: 결과 화면 이미지 생성
- `expo-sharing`: 결과 파일 외부 공유
- `expo-media-library`: 결과 이미지 갤러리 저장
- `expo-updates`: 네이티브 변경 없는 게임을 OTA로 전달

### 수익화

- `react-native-google-mobile-ads`: 배너·전면·보상형 광고
- `react-native-purchases`: RevenueCat 기반 Google Play Billing
- `react-native-purchases-ui`: 네이티브 Paywall과 Customer Center

## 식별자와 환경

- Expo owner: `devpreneur_ko`
- development Android package: `com.devpreneur_ko.two_player_games.dev`
- development AdMob App ID: Google 공식 Android 샘플 `ca-app-pub-3940256099942544~3347511713`
- iOS 개발 설정에는 Google 공식 샘플 `ca-app-pub-3940256099942544~1458002511`을 사용한다.
- 광고 요청은 개발 중 패키지가 제공하는 `TestIds`만 사용한다.
- RevenueCat API key는 코드와 Git에 넣지 않는다. SDK만 빌드에 포함하고 실제 연결 시 EAS 환경변수로 주입한다.
- production package와 production AdMob App ID는 첫 스토어 빌드 시 별도 설정한다.

## EAS와 OTA

- `development` 프로필은 `developmentClient: true`, `distribution: internal`, Android `buildType: apk`를 사용한다.
- EAS 프로젝트를 `devpreneur_ko` 계정에 연결한다.
- `expo-updates`의 `runtimeVersion`은 `fingerprint` 정책을 사용한다. 네이티브 구성이 바뀐 업데이트가 기존 바이너리에 잘못 전달되지 않도록 런타임을 자동 분리한다.

## 권한 원칙

- 카메라·마이크·위치·블루투스 권한은 추가하지 않는다.
- 미디어 저장은 쓰기 목적의 최소 권한만 요청한다.
- 알림 권한은 실제 알림 기능을 켤 때 사용자 동작을 통해 요청한다.
- AdMob SDK는 운영 전 UMP 동의 흐름을 구현해야 하며 이번 작업에서는 SDK 포함과 테스트 준비까지만 한다.

## 검증

- 설치 트리에 missing/invalid 패키지가 없어야 한다.
- Expo Doctor 20개 검사가 통과해야 한다.
- TypeScript와 ESLint가 통과해야 한다.
- resolved Expo config에서 package, owner, AdMob App ID, updates runtime 정책을 확인한다.
- Android development APK EAS 빌드가 성공해야 한다.
