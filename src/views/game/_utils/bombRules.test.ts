import assert from 'node:assert/strict';
import test from 'node:test';

import { createBombPuzzle, validateBombStep } from './bombRules';

test('같은 시드는 같은 폭탄을 만든다', () => {
  assert.deepEqual(createBombPuzzle(17), createBombPuzzle(17));
});

test('폭탄은 세 단계 정답을 가진다', () => {
  const puzzle = createBombPuzzle(21);
  assert.equal(puzzle.steps.length, 3);
  puzzle.steps.forEach((step, index) => {
    assert.equal(validateBombStep(puzzle, index, step.answer), true);
  });
});

test('잘못된 정답과 단계는 실패한다', () => {
  const puzzle = createBombPuzzle(8);
  assert.equal(validateBombStep(puzzle, 0, '없는 답'), false);
  assert.equal(validateBombStep(puzzle, 99, '없는 답'), false);
});
