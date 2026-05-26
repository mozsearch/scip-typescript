// < definition pure-js 1.0.0 src/`exports.mjs`/

export class SomeExportedClass {
//           ^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#
  method() {}
//^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/SomeExportedClass#method().
}

export const SomeAnonymousClass = class /*anonymous*/ {
//           ^^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/SomeAnonymousClass.
  method() {}
//^^^^^^ definition local 1
}

export function someFunc() {}
//              ^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/someFunc().
export const someAnonymousFunc = function () /*anonymous*/ {}
//           ^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/someAnonymousFunc.

export const someArrowFunc = () => {}
//           ^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/someArrowFunc.

export const someValue = 4
//           ^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/someValue.

export const someObject = {
//           ^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/someObject.
  value: 5,
//^^^^^ definition pure-js 1.0.0 src/`exports.mjs`/value0:
  method() {},
//^^^^^^ definition local 3
  get prop() {
//    ^^^^ definition local 4
    return true
  },
  set prop(val) {},
//    ^^^^ definition local 5
//         ^^^ definition local 6
}

