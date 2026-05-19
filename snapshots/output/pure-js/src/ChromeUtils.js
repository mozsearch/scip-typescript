// < definition pure-js 1.0.0 src/`ChromeUtils.js`/

const ChromeUtils = {
//    ^^^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.
  defineESModuleGetters(obj, props) {},
//^^^^^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineESModuleGetters().
//                      ^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineESModuleGetters().(obj)
//                           ^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineESModuleGetters().(props)
  importESModule(module) {},
//^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.importESModule().
//               ^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.importESModule().(module)
  defineLazyGetter(obj, prop, getter) {},
//^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineLazyGetter().
//                 ^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineLazyGetter().(obj)
//                      ^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineLazyGetter().(prop)
//                            ^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineLazyGetter().(getter)
}

const obj = {}
//    ^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/obj.
ChromeUtils.defineESModuleGetters(obj, {
//^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.
//          ^^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineESModuleGetters().
//                                ^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
  constants: 'node:fs',
//^^^^^^^^^ reference @types/node 20.16.10 `fs.d.ts`/`"fs"`/constants/
//^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/obj.constants.
//           ^^^^^^^^^ reference @types/node 20.16.10 `fs.d.ts`/`"node:fs"`/
  SomeExportedClass: './exports.mjs',
//^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/obj.SomeExportedClass.
//^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#
//                   ^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/
})
obj.assert = ChromeUtils.importESModule('node:assert')
//^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//  ^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/obj.assert.
//           ^^^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.
//                       ^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.importESModule().
//                                      ^^^^^^^^^^^^^ reference @types/node 20.16.10 `assert.d.ts`/`"node:assert"`/
ChromeUtils.defineLazyGetter(obj, 'prop', function () {
//^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.
//          ^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/ChromeUtils.defineLazyGetter().
//                           ^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//                                ^^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/obj.prop.
  return { inner: 0 }
//         ^^^^^ definition pure-js 1.0.0 src/`ChromeUtils.js`/inner0:
})

obj.constants.O_CREAT
//^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//  ^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.constants.
//            ^^^^^^^ reference @types/node 20.16.10 `fs.d.ts`/`"fs"`/constants/O_CREAT.
obj.assert.equal
//^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//  ^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.assert.
//         ^^^^^ reference @types/node 20.16.10 `assert.d.ts`/`"assert"`/assert/equal().
obj.prop.inner
//^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//  ^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.prop.
//       ^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/inner0:
new obj.SomeExportedClass().method()
//  ^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.
//      ^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`ChromeUtils.js`/obj.SomeExportedClass.
//                          ^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#method().

