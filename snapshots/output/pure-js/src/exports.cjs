// < definition pure-js 1.0.0 src/`exports.cjs`/

exports.SomeExportedClass = class LocalClassName {
//^^^^^ reference local 2
//      ^^^^^^^^^^^^^^^^^ reference local 2
//                                ^^^^^^^^^^^^^^ reference local 2
  method() {}
//^^^^^^ definition local 3
}

module.exports.SomeAnonymousClass = class /*anonymous*/ {
//^^^^ reference local 8
//     ^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/
//             ^^^^^^^^^^^^^^^^^^ reference local 9
  method() {}
//^^^^^^ definition local 10
}

exports.someFunc = function localFuncName() {}
//^^^^^ reference local 13
//      ^^^^^^^^ reference local 13
//                          ^^^^^^^^^^^^^ reference local 14
exports.someAnonymousFunc = function () /*anonymous*/ {}
//^^^^^ reference local 17
//      ^^^^^^^^^^^^^^^^^ reference local 17

exports.someArrowFunc = () => {}
//^^^^^ reference local 20
//      ^^^^^^^^^^^^^ reference local 20

exports.someValue = 4
//^^^^^ reference local 23
//      ^^^^^^^^^ reference local 23

exports.someObject = {
//^^^^^ reference local 26
//      ^^^^^^^^^^ reference local 26
  value: 5,
//^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/value0:
  method() {},
//^^^^^^ definition local 28
  get prop() {
//    ^^^^ definition local 29
    return true
  },
  set prop(val) {},
//    ^^^^ definition local 30
//         ^^^ definition local 31
}

