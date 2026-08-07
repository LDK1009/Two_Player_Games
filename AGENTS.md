# Two_Player_Games 작업 규칙

## Expo 버전

Expo SDK 57 기반이다. 코드를 쓰기 전 정확한 버전 문서인 https://docs.expo.dev/versions/v57.0.0/ 또는 설치된 `node_modules/<package>/src`를 확인한다.

## 기술 스택

- Expo Router · React Native · TypeScript
- React Native Skia · Reanimated · Gesture Handler · Planck.js
- expo-audio · expo-haptics
- Zustand · react-native-mmkv

MMKV가 네이티브 모듈이므로 Expo Go가 아닌 development build를 사용한다. 네이티브 의존성이 바뀔 때만 development build를 다시 만든다.

## 아키텍처

- `src/app`: 라우트 진입점만 둔다.
- `src/views/<route>`: 화면과 해당 화면 전용 게임 로직을 둔다.
- `src/shared`: 두 화면 이상이 공유하는 상태, 저장소, 오디오, 테마를 둔다.
- 의존성은 `app → views → shared` 단방향으로 유지한다.
- 게임의 실시간 좌표는 Reanimated SharedValue 또는 게임별 물리 월드에서 관리하고 Zustand에 프레임 상태를 넣지 않는다.
- 영구 설정은 Zustand persist와 MMKV를 사용한다. AsyncStorage는 추가하지 않는다.

## 코드 규칙

- TypeScript strict를 유지하고 `any`를 사용하지 않는다.
- SharedValue는 `.value` 대입 대신 `.get()`과 `.set()`을 사용한다.
- 스타일은 `StyleSheet.create`에 모으고 색상·간격은 `src/shared/theme/tokens.ts`를 사용한다.
- `StyleSheet.absoluteFillObject` 대신 `StyleSheet.absoluteFill`을 스타일 배열로 조합한다.
- 오디오 플레이어는 사용 후 반드시 `remove()`한다.
