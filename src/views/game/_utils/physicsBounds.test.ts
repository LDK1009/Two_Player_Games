import assert from 'node:assert/strict';
import test from 'node:test';

import { detectGoal, isCircleOutsideArena } from './physicsBounds';

test('원형 캐릭터가 경기장 안이나 경계에 닿아 있으면 탈락하지 않는다', () => {
  const arena = { x: 100, y: 100, radius: 80 };
  assert.equal(isCircleOutsideArena({ x: 100, y: 100, radius: 10 }, arena), false);
  assert.equal(isCircleOutsideArena({ x: 190, y: 100, radius: 10 }, arena), false);
});

test('캐릭터 전체가 원 밖으로 나가면 탈락한다', () => {
  assert.equal(
    isCircleOutsideArena(
      { x: 201, y: 100, radius: 20 },
      { x: 100, y: 100, radius: 80 },
    ),
    true,
  );
});

test('퍽이 위·아래 골라인을 완전히 통과하면 골이다', () => {
  const field = { height: 500 };
  assert.equal(detectGoal({ y: -11, radius: 10 }, field), 'top');
  assert.equal(detectGoal({ y: 511, radius: 10 }, field), 'bottom');
  assert.equal(detectGoal({ y: 250, radius: 10 }, field), undefined);
});
