import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveReactionWinner } from './reactionStopRules';

test('초록불 뒤 먼저 놓은 플레이어가 이긴다', () => {
  assert.equal(resolveReactionWinner('p1', 'green'), 'p1');
  assert.equal(resolveReactionWinner('p2', 'green'), 'p2');
});

test('초록불 전에 놓으면 상대가 이긴다', () => {
  assert.equal(resolveReactionWinner('p1', 'waiting'), 'p2');
  assert.equal(resolveReactionWinner('p2', 'waiting'), 'p1');
});

test('동시에 놓으면 무승부다', () => {
  assert.equal(resolveReactionWinner('both', 'green'), 'draw');
});
