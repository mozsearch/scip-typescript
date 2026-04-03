// < definition pure-js 1.0.0 src/`imports.cjs`/

const {
  SomeExportedClass,
//^^^^^^^^^^^^^^^^^ definition local 0
//^^^^^^^^^^^^^^^^^ reference local 2
  SomeAnonymousClass,
//^^^^^^^^^^^^^^^^^^ definition local 3
//^^^^^^^^^^^^^^^^^^ reference local 5
  someFunc,
//^^^^^^^^ definition local 6
//^^^^^^^^ reference local 8
  someAnonymousFunc,
//^^^^^^^^^^^^^^^^^ definition local 9
//^^^^^^^^^^^^^^^^^ reference local 11
  someArrowFunc,
//^^^^^^^^^^^^^ definition local 12
//^^^^^^^^^^^^^ reference local 14
  someValue,
//^^^^^^^^^ definition local 15
//^^^^^^^^^ reference local 17
  someObject,
//^^^^^^^^^^ definition local 18
//^^^^^^^^^^ reference local 20
} = require('./exports.cjs')
//  ^^^^^^^ reference @types/node 20.16.10 `globals.d.ts`/global/require.
//          ^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/

new SomeExportedClass().method()
//  ^^^^^^^^^^^^^^^^^ reference local 21
//                      ^^^^^^ reference local 22
new SomeAnonymousClass().method()
//  ^^^^^^^^^^^^^^^^^^ reference local 23
//                       ^^^^^^ reference local 24
someFunc()
//^^^^^^ reference local 8
someAnonymousFunc()
//^^^^^^^^^^^^^^^ reference local 11
someArrowFunc()
//^^^^^^^^^^^ reference local 14
someValue
//^^^^^^^ reference local 17
someObject.value
//^^^^^^^^ reference local 20
//         ^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/value0:
someObject.method()
//^^^^^^^^ reference local 20
//         ^^^^^^ reference local 26
someObject.prop
//^^^^^^^^ reference local 20
//         ^^^^ reference local 27
//         ^^^^ reference local 28
someObject.prop = 3
//^^^^^^^^ reference local 20
//         ^^^^ reference local 27
//         ^^^^ reference local 28

