import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveChickenRound } from './chickenRules';

test('폭발 전에 더 오래 버틴 플레이어가 이긴다', () => {
  assert.equal(resolveChickenRound([2000, 3000], 4000), 'p2');
  assert.equal(resolveChickenRound([3500, 1200], 4000), 'p1');
});

test('한 명만 폭발하면 안전하게 놓은 플레이어가 이긴다', () => {
  assert.equal(resolveChickenRound([null, 2500], 4000), 'p2');
  assert.equal(resolveChickenRound([2000, null], 4000), 'p1');
});

test('둘 다 폭발하거나 같은 시점에 놓으면 무승부다', () => {
  assert.equal(resolveChickenRound([null, null], 4000), 'draw');
  assert.equal(resolveChickenRound([2500, 2500], 4000), 'draw');
});
