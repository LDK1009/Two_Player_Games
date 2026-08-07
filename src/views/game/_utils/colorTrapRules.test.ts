import assert from 'node:assert/strict';
import test from 'node:test';

import { createColorTrapRound, scoreColorAnswer } from './colorTrapRules';

test('같은 시드는 같은 색깔 함정을 만든다', () => {
  assert.deepEqual(createColorTrapRound(42), createColorTrapRound(42));
});

test('글자색을 맞히면 1점, 틀리면 -1점이다', () => {
  const round = createColorTrapRound(7);
  assert.equal(scoreColorAnswer(round, round.inkColor), 1);
  const wrongColor = round.inkColor === 'red' ? 'blue' : 'red';
  assert.equal(scoreColorAnswer(round, wrongColor), -1);
});
