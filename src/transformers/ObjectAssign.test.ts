import { test } from 'uvu'

import { objectAssignTransformer } from './ObjectAssign'
import { checkTransform } from './testUtils'

function checkAssignTransform(source: string, expected: string) {
  checkTransform([objectAssignTransformer], source, expected)
}

test('properties', () => {
  checkAssignTransform(
    `
const shorthand = "shorthand";
const computed = "computed";
const obj = {};
Object.assign(obj, {
    prop0: 1,
    "prop1": true,
    [computed]: "computed",
    shorthand,
});
`,
    `
const shorthand = "shorthand";
const computed = "computed";
const obj = {};
obj["prop0"] = 1;
obj["prop1"] = true;
obj[computed] = "computed";
obj["shorthand"] = shorthand;
Object.assign;
`
  )
})

test('methods', () => {
  checkAssignTransform(
    `
const obj = {};
Object.assign(obj, {
    private privateMethod() { console.log("private") },
    ["public method"]() { console.log("public") }
});
`,
    `
const obj = {};
obj["privateMethod"] = private function () { console.log("private"); };
obj["public method"] = function () { console.log("public"); };
Object.assign;
`
  )
})

test('accessors', () => {
  checkAssignTransform(
    `
const obj = {};
Object.assign(obj, {
    get prop() { return true; },
    set prop(val) { console.log(val); },
});
`,
    `
const obj = {};
Object.defineProperty(obj, "prop", { get() { return true; }, set(val) { console.log(val); } });
obj["prop"];
Object.assign;
`
  )
})

test('multiple sources', () => {
  checkAssignTransform(
    `
const obj = {};
Object.assign(obj, { prop0: 0 }, { prop1: 1 });
`,
    `
const obj = {};
obj["prop0"] = 0;
obj["prop1"] = 1;
Object.assign;
`
  )
})

test.run()
