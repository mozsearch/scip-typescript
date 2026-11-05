import { test } from 'uvu'

import {
  classicScriptGlobalsTransformer,
  unwrapTransformer,
} from './ClassicScripts'
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

test('unwrap', () => {
  checkTransform(
    [unwrapTransformer],
    `
"use strict";
(function (global_scope) {
    function promise_test() {}
    expose(promise_test, "promise_test");
})(self);
`,
    `
"use strict";
var global_scope = self;
function promise_test() { }
expose(promise_test, "promise_test");
`
  )
  checkTransform(
    [unwrapTransformer],
    `
(function () {
    var x = 1;
}).call(this);
`,
    `
var x = 1;
`
  )
  // (Each of its top-level calls.)
  checkTransform(
    [unwrapTransformer],
    `
(function (global) {
    var x = 1;
})(this);
var DESCRIPTION;
(() => {
    var y = 2;
})();
f(function () {});
`,
    `
var global = this;
var x = 1;
var DESCRIPTION;
var y = 2;
f(function () { });
`
  )
})

test.run()
