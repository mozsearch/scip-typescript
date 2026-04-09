// < definition pure-js 1.0.0 src/`imports.cjs`/

const {
  SomeExportedClass,
//^^^^^^^^^^^^^^^^^ definition local 1
//^^^^^^^^^^^^^^^^^ reference local 4
  SomeAnonymousClass,
//^^^^^^^^^^^^^^^^^^ definition local 5
//^^^^^^^^^^^^^^^^^^ reference local 8
  someFunc,
//^^^^^^^^ definition local 9
//^^^^^^^^ reference local 12
  someAnonymousFunc,
//^^^^^^^^^^^^^^^^^ definition local 13
//^^^^^^^^^^^^^^^^^ reference local 16
  someArrowFunc,
//^^^^^^^^^^^^^ definition local 17
//^^^^^^^^^^^^^ reference local 20
  someValue,
//^^^^^^^^^ definition local 21
//^^^^^^^^^ reference local 24
  someObject,
//^^^^^^^^^^ definition local 25
//^^^^^^^^^^ reference local 28
} = require('./exports.cjs')
//  ^^^^^^^ reference @types/node 20.16.10 `globals.d.ts`/global/require.
//          ^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/

new SomeExportedClass().method()
//  ^^^^^^^^^^^^^^^^^ reference local 29
//                      ^^^^^^ reference local 30
new SomeAnonymousClass().method()
//  ^^^^^^^^^^^^^^^^^^ reference local 31
//                       ^^^^^^ reference local 32
someFunc()
//^^^^^^ reference local 12
someAnonymousFunc()
//^^^^^^^^^^^^^^^ reference local 16
someArrowFunc()
//^^^^^^^^^^^ reference local 20
someValue
//^^^^^^^ reference local 24
someObject.value
//^^^^^^^^ reference local 28
//         ^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/value0:
someObject.method()
//^^^^^^^^ reference local 28
//         ^^^^^^ reference local 34
someObject.prop
//^^^^^^^^ reference local 28
//         ^^^^ reference local 35
//         ^^^^ reference local 36
someObject.prop = 3
//^^^^^^^^ reference local 28
//         ^^^^ reference local 35
//         ^^^^ reference local 36

