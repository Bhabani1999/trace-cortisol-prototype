'use strict';
const assert = require('node:assert/strict');
const model = require('./model.js');
const record = values => ({ name: 'Example', date: '2026-10-13', eveningHours: 14, ...values });
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} does not equal ${b}`);
const examples = [
  { w: 1.5, w2: 2.5, e: 1, stress: 40 },
  { w: 3, w2: 2.5, e: .8, stress: 38.4 },
  { w: 1, w2: 3, e: 2.4, stress: 80 },
  { w: 2, w2: 2, e: .6, stress: 30 },
  { w: 2, w2: 2, e: 2, stress: 100 }
];
examples.forEach(v => close(model.calculate(record(v)).stress, v.stress));
for (const [ratio, score] of [[1, 0], [1.5, 50 * Math.log2(1.5)], [2, 50], [3, 50 * Math.log2(3)], [4, 100], [8, 100], [.5, 0]])
  close(model.calculate(record({ w: 1, w2: ratio, e: 1 })).rhythm, score);
for (const [family, values] of Object.entries(model.presets)) assert.equal(model.calculate(record(values)).archetype, family);
// Equal scaling preserves both scores, independently of the draft archetype reference.
const a = model.calculate(record({ w: 3, w2: 2.5, e: .8 }));
const b = model.calculate(record({ w: 300, w2: 250, e: 80 }));
close(a.rhythm, b.rhythm); close(a.stress, b.stress);
assert.equal(model.calculate(record({ w: 10, w2: 2, e: 2 })).stress, 100);
for (const change of [{ w2: 0 }, { e: -1 }, { w: '' }, { w: Infinity }, { w: true }, { eveningHours: 2 }, { date: '2026-02-31' }, { name: '' }])
  assert.throws(() => model.calculate(record({ w: 20, w2: 40, e: 10, ...change })));
// Sample cubic segments directly: interpolation never adds an unobserved peak or dip.
for (const values of [[20, 40, 10], [40, 20, 10], [10, 20, 40], [40, 10, 20], [20, 20, 20], [1, 100, 2]]) {
  const path = model.curvePath(values, [0, 2, 14], v => v, v => v);
  const coords = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.deepEqual(coords.slice(0, 2), [0, values[0]]);
  for (let segment = 0; segment < 2; segment++) {
    const start = segment === 0 ? coords.slice(0, 2) : coords.slice(6, 8);
    const offset = 2 + segment * 6;
    const [, c1, , c2, endX, endY] = coords.slice(offset, offset + 6);
    assert.equal(endX, segment === 0 ? 2 : 14); assert.equal(endY, values[segment + 1]);
    for (let i = 0; i <= 100; i++) {
      const t = i / 100, z = 1 - t;
      const y = z ** 3 * start[1] + 3 * z ** 2 * t * c1 + 3 * z * t ** 2 * c2 + t ** 3 * endY;
      assert.ok(y >= Math.min(values[segment], values[segment + 1]) - 1e-3 && y <= Math.max(values[segment], values[segment + 1]) + 1e-3);
    }
  }
}
console.log('Passed: score examples, caps, invalid inputs, archetypes, scale invariance, and curve interpolation.');
