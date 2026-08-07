import assert from 'node:assert/strict';
import test from 'node:test';

import { GAME_DEFINITIONS, getGameDefinition } from './games';

test('게임 ID 10개가 중복 없이 등록된다', () => {
  assert.equal(GAME_DEFINITIONS.length, 10);
  assert.equal(new Set(GAME_DEFINITIONS.map(({ id }) => id)).size, 10);
});

test('알 수 없는 게임 ID는 undefined를 반환한다', () => {
  assert.equal(getGameDefinition('missing'), undefined);
});
