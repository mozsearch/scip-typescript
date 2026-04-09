// < definition pure-js 1.0.0 src/`exports.cjs`/

exports.SomeExportedClass = class LocalClassName {
//      ^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#
//                                ^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#
  method() {}
//^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.SomeExportedClass#method().
}

module.exports.SomeAnonymousClass = class /*anonymous*/ {
//^^^^ reference local 1
//             ^^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.SomeAnonymousClass#
  method() {}
//^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.SomeAnonymousClass#method().
}

exports.someFunc = function localFuncName() {}
//      ^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someFunc.
//                          ^^^^^^^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/exports.someFunc.
exports.someAnonymousFunc = function () /*anonymous*/ {}
//      ^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someAnonymousFunc.

exports.someArrowFunc = () => {}
//      ^^^^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someArrowFunc.

exports.someValue = 4
//      ^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someValue.

exports.someObject = {
//      ^^^^^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someObject.
  value: 5,
//^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/value0:
  method() {},
//^^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someObject.method().
  get prop() {
//    ^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<get>prop`().
    return true
  },
  set prop(val) {},
//    ^^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<set>prop`().
//         ^^^ definition pure-js 1.0.0 src/`exports.cjs`/exports.someObject.`<set>prop`().(val)
}

