import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateRocketForce } from './rocketRules';

test('같은 출력은 회전 없이 상승시킨다', () => {
  assert.deepEqual(calculateRocketForce(1, 1), { thrust: 2, torque: 0 });
});

test('왼쪽과 오른쪽 단독 출력은 반대 방향으로 회전시킨다', () => {
  assert.ok(calculateRocketForce(1, 0).torque < 0);
  assert.ok(calculateRocketForce(0, 1).torque > 0);
});

test('출력은 0과 1 사이로 제한한다', () => {
  assert.deepEqual(calculateRocketForce(2, -1), { thrust: 1, torque: -1 });
});
