import assert from 'node:assert/strict';
import test from 'node:test';

import { scorePredictionRound } from './predictionRules';

test('각 플레이어는 상대 선택을 맞히면 1점을 얻는다', () => {
  assert.deepEqual(scorePredictionRound('A', 'B', 'B', 'A'), { p1: 1, p2: 1 });
  assert.deepEqual(scorePredictionRound('B', 'B', 'A', 'A'), { p1: 0, p2: 0 });
});
