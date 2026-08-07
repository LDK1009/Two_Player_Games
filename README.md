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
npm start -- --lan
```

Android development build가 설치된 기기 또는 에뮬레이터에서 접속합니다. 네이티브 의존성을 변경한 경우에만 development build를 다시 만듭니다.

## 미니게임 10종

1. 핑거 스모 — 드래그 충돌 물리 대전
2. 정지! 먼저 눌러 — 초록불 반응속도 대결
3. 미니 에어하키 — Planck.js 기반 5골 승부
4. 둘이서 로켓 — 엔진을 하나씩 맡는 협동 비행
5. 우리 얼마나 통할까 — 7문제 커플 텔레파시
6. 폭탄 설명서 — 설명자와 조작자의 협동 해체
7. 치킨 버튼 — 폭발 직전까지 버티는 심리전
8. 색깔 함정 — 글자색을 고르는 순발력 대결
9. 비밀 예측 — 상대 선택 맞히기
10. 기울기 미로 — 가속도 센서 협동 미로

## 검증

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
```

## 구조

```text
src/
├── app/       # Expo Router 진입점
├── views/     # 라우트별 화면과 게임
└── shared/    # 공용 오디오·저장소·상태·테마
```
