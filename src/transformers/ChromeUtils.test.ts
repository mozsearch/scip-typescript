import { test } from 'uvu'

import { chromeUtilsTransformer } from './ChromeUtils'
import { checkTransform as checkTransforms } from './testUtils'

function checkChromeUtilsTransform(source: string, expected: string) {
  checkTransforms([chromeUtilsTransformer], source, expected)
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
