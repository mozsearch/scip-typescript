import { test } from 'uvu'

import { classicScriptGlobalsTransformer } from './ClassicScripts'
import { checkTransform } from './testUtils'

test('globals of a classic script', () => {
  checkTransform(
    [classicScriptGlobalsTransformer],
    `
globalThis.assertDeepEq = function () {};
this.color = "red";
self.helper = 1;
obj.x = 1;
`,
    `
var assertDeepEq = function () { };
var color = "red";
var helper = 1;
obj.x = 1;
`
  )
})

test('globals of an alias of the global', () => {
  checkTransform(
    [classicScriptGlobalsTransformer],
    `
var global = this;
var undefined;
const undefined = void 0;
var Error = global.Error, other = global.other2;
function assertEqArray() {}
global.assertEqArray = assertEqArray;
global.XorShift = function () {};
`,
    `
var global = this;
void 0;
global.Error;
var other = global.other2;
function assertEqArray() { }
global.assertEqArray = assertEqArray;
var XorShift = function () { };
`
  )
})

test('globals of a module', () => {
  checkTransform(
    [classicScriptGlobalsTransformer],
    `
export {};
globalThis.x = 1;
`,
    `
export {};
globalThis.x = 1;
`
  )
})

test.run()
