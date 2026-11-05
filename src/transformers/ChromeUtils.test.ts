import { test } from 'uvu'

import {
  chromeUtilsTransformer,
  chromeUtilsTransformerFor,
} from './ChromeUtils'
import { checkTransform as checkTransforms } from './testUtils'

function checkChromeUtilsTransform(source: string, expected: string) {
  checkTransforms([chromeUtilsTransformer], source, expected)
}

// (With --classic-scripts.)
function checkClassicScriptTransform(source: string, expected: string) {
  checkTransforms([chromeUtilsTransformerFor(true)], source, expected)
}

test('importESModuleCall', () => {
  checkChromeUtilsTransform(
    `
const { chmod } = ChromeUtils.importESModule('node:fs');
const { constants } = ChromeUtils.importESModule('node:crypto');
`,
    `
const { chmod } = require('node:fs');
const { constants } = require('node:crypto');
import _fakeImport0 = require('node:fs');
import _fakeImport1 = require('node:crypto');
ChromeUtils.importESModule;
ChromeUtils.importESModule;
`
  )
})

test('defineESModuleGetters', () => {
  checkChromeUtilsTransform(
    `
const obj = {};
ChromeUtils.defineESModuleGetters(obj, {
    chmod: 'node:fs',
    constants: 'node:crypto',
});
`,
    `
const obj = {};
obj["chmod"] = require('node:fs')["chmod"];
obj["constants"] = require('node:crypto')["constants"];
import _fakeImport0 = require('node:fs');
import _fakeImport1 = require('node:crypto');
ChromeUtils.defineESModuleGetters;
`
  )
})

// (With --classic-scripts, a classic script isn't made a module, but a
// module is still transformed as one; see ChromeUtils.ts's top.)
test('importESModuleCall in a classic script', () => {
  checkClassicScriptTransform(
    `
const { chmod } = ChromeUtils.importESModule('node:fs');
`,
    `
const { chmod } = ChromeUtils.importESModule('node:fs');
`
  )
})

test('importESModuleCall in a module, with classic scripts', () => {
  checkClassicScriptTransform(
    `
export {};
const { chmod } = ChromeUtils.importESModule('node:fs');
`,
    `
export {};
const { chmod } = require('node:fs');
import _fakeImport0 = require('node:fs');
ChromeUtils.importESModule;
`
  )
})

test('defineESModuleGetters in a classic script', () => {
  checkClassicScriptTransform(
    `
const obj = {};
ChromeUtils.defineESModuleGetters(obj, {
    chmod: 'node:fs',
});
ChromeUtils.defineESModuleGetters(this, {
    constants: 'node:crypto',
});
`,
    `
const obj = {};
obj["chmod"] = ChromeUtils.importESModule('node:fs')["chmod"];
var constants = ChromeUtils.importESModule('node:crypto')["constants"];
ChromeUtils.defineESModuleGetters;
ChromeUtils.defineESModuleGetters;
`
  )
})

test('defineLazyGetter', () => {
  checkChromeUtilsTransform(
    `
const obj = {};
ChromeUtils.defineLazyGetter(obj, "prop", function () { return 0; });
`,
    `
const obj = {};
Object.defineProperty(obj, "prop", { get: function () { return 0; } });
ChromeUtils.defineLazyGetter;
`
  )
})

test.run()
