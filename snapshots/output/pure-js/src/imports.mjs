// < definition pure-js 1.0.0 src/`imports.mjs`/

import {
  SomeExportedClass,
//^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#
  SomeAnonymousClass,
//^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeAnonymousClass.
  someFunc,
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someFunc().
  someAnonymousFunc,
//^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someAnonymousFunc.
  someArrowFunc,
//^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someArrowFunc.
  someValue,
//^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someValue.
  someObject,
//^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.
} from './exports.mjs'
//     ^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/

new SomeExportedClass().method()
//  ^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#
//                      ^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#method().
new SomeAnonymousClass().method()
//  ^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeAnonymousClass.
//                       ^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/SomeAnonymousClass.method().
someFunc()
//^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someFunc().
someAnonymousFunc()
//^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someAnonymousFunc.
someArrowFunc()
//^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someArrowFunc.
someValue
//^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someValue.
someObject.value
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.
//         ^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/value0:
someObject.method()
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.
//         ^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.method().
someObject.prop
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.
//         ^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.`<get>prop`().
//         ^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.`<set>prop`().
someObject.prop = 3
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.
//         ^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.`<get>prop`().
//         ^^^^ reference pure-js 1.0.0 src/`exports.mjs`/someObject.`<set>prop`().

