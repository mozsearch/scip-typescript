// < definition pure-js 1.0.0 src/`imports.cjs`/

const {
  SomeExportedClass,
//^^^^^^^^^^^^^^^^^ definition local 0
//^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#
  SomeAnonymousClass,
//^^^^^^^^^^^^^^^^^^ definition local 1
//^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeAnonymousClass#
  someFunc,
//^^^^^^^^ definition local 2
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someFunc.
  someAnonymousFunc,
//^^^^^^^^^^^^^^^^^ definition local 3
//^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someAnonymousFunc.
  someArrowFunc,
//^^^^^^^^^^^^^ definition local 4
//^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someArrowFunc.
  someValue,
//^^^^^^^^^ definition local 5
//^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someValue.
  someObject,
//^^^^^^^^^^ definition local 6
//^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
} = require('./exports.cjs')
//  ^^^^^^^ reference @types/node 20.16.10 `globals.d.ts`/global/require.
//          ^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/

new SomeExportedClass().method()
//  ^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#
//                      ^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#method().
new SomeAnonymousClass().method()
//  ^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeAnonymousClass#
//                       ^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeAnonymousClass#method().
someFunc()
//^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someFunc.
someAnonymousFunc()
//^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someAnonymousFunc.
someArrowFunc()
//^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someArrowFunc.
someValue
//^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someValue.
someObject.value
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
//         ^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/value0:
someObject.method()
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
//         ^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.method().
someObject.prop
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
//         ^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<get>prop`().
//         ^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<set>prop`().
someObject.prop = 3
//^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
//         ^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<get>prop`().
//         ^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<set>prop`().

