import assert from 'node:assert/strict';
import test from 'node:test';

import { hasReachedCheckpoint, nextCheckpointIndex } from './mazeRules';

test('공이 체크포인트 반경 안에 있을 때만 도착으로 판단한다', () => {
  const checkpoint = { x: 100, y: 100, radius: 20 };
  assert.equal(hasReachedCheckpoint({ x: 112, y: 108, radius: 8 }, checkpoint), true);
  assert.equal(hasReachedCheckpoint({ x: 145, y: 100, radius: 8 }, checkpoint), false);
});

test('마지막 체크포인트 이후에는 전체 개수를 유지한다', () => {
  assert.equal(nextCheckpointIndex(0, 3), 1);
  assert.equal(nextCheckpointIndex(2, 3), 3);
  assert.equal(nextCheckpointIndex(3, 3), 3);
});
