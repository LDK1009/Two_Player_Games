export type CoupleQuestion = {
  prompt: string;
  optionA: string;
  optionB: string;
};

export const COUPLE_QUESTIONS: readonly CoupleQuestion[] = [
  { prompt: '쉬는 날 더 좋은 건?', optionA: '집에서 뒹굴기', optionB: '밖으로 나가기' },
  { prompt: '데이트 메뉴를 고른다면?', optionA: '늘 먹던 맛집', optionB: '처음 보는 메뉴' },
  { prompt: '여행 스타일은?', optionA: '계획표대로', optionB: '발길 닿는 대로' },
  { prompt: '연락은 어떻게?', optionA: '짧게 자주', optionB: '길게 한 번' },
  { prompt: '선물로 더 좋은 건?', optionA: '필요했던 물건', optionB: '깜짝 이벤트' },
  { prompt: '같이 보기 좋은 건?', optionA: '영화 정주행', optionB: '예능 몰아보기' },
  { prompt: '지금 당장 떠난다면?', optionA: '바다', optionB: '산' },
] as const;
