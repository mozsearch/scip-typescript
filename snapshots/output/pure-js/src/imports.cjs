// < definition pure-js 1.0.0 src/`imports.cjs`/

const {
  SomeExportedClass,
//^^^^^^^^^^^^^^^^^ definition local 0
//^^^^^^^^^^^^^^^^^ reference local 3
  SomeAnonymousClass,
//^^^^^^^^^^^^^^^^^^ definition local 4
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
//  ^^^^^^^^^^^^^^^^^ reference local 2
//                      ^^^^^^ reference local 30
new SomeAnonymousClass().method()
//  ^^^^^^^^^^^^^^^^^^ reference local 31
//                       ^^^^^^ reference local 34
someFunc()
//^^^^^^ reference local 35
someAnonymousFunc()
//^^^^^^^^^^^^^^^ reference local 36
someArrowFunc()
//^^^^^^^^^^^ reference local 37
someValue
//^^^^^^^ reference local 38
someObject.value
//^^^^^^^^ reference local 39
//         ^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/value0:
someObject.method()
//^^^^^^^^ reference local 40
//         ^^^^^^ reference local 42
someObject.prop
//^^^^^^^^ reference local 43
//         ^^^^ reference local 45
//         ^^^^ reference local 47
someObject.prop = 3
//^^^^^^^^ reference local 48
//         ^^^^ reference local 45
//         ^^^^ reference local 47

