# 둘이 하는 게임

한 화면을 마주 보고 즐기는 2인용 미니게임 컬렉션입니다.

## 기술 스택

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript 6
- Expo Router
- React Native Skia
- Reanimated · Gesture Handler
- Planck.js
- expo-audio · expo-haptics
- Zustand · MMKV

## 실행

MMKV가 네이티브 모듈이므로 Expo Go가 아닌 development build를 사용합니다.

```bash
npm install
npm start
```

Android development build가 설치된 기기 또는 에뮬레이터에서 접속합니다. 네이티브 의존성을 변경한 경우에만 development build를 다시 만듭니다.

## 구조

```text
src/
├── app/       # Expo Router 진입점
├── views/     # 라우트별 화면과 게임
└── shared/    # 공용 오디오·저장소·상태·테마
```
