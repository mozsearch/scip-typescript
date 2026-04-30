import { test } from 'uvu'

import { definePropertiesTransformer } from './DefineProperties'
import { checkTransform as checkTransforms } from './testUtils'

function checkDefinePropertiesTransform(source: string, expected: string) {
  checkTransforms([definePropertiesTransformer], source, expected)
}

test('defineProperties', () => {
  checkDefinePropertiesTransform(
    `
const shorthand = "shorthand"
const computed = "computed"
const obj = {}
Object.defineProperties(obj, {
    data: 0,
    shorthand,
    prop: { value: 1 },
    [computed]: { get() { return true } },
})
`,
    `
const shorthand = "shorthand";
const computed = "computed";
const obj = {};
Object.defineProperty(obj, "data", 0);
Object.defineProperty(obj, "shorthand", shorthand);
Object.defineProperty(obj, "prop", { value: 1 });
Object.defineProperty(obj, computed, { get() { return true; } });
Object.defineProperties;
`
  )
})

test.run()
