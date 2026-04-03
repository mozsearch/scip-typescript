// < definition pure-js 1.0.0 src/`exports.cjs`/

exports.SomeExportedClass = class LocalClassName {
//^^^^^ reference local 1
//      ^^^^^^^^^^^^^^^^^ definition local 2
//                                ^^^^^^^^^^^^^^ reference local 1
  method() {}
//^^^^^^ definition local 3
}

module.exports.SomeAnonymousClass = class /*anonymous*/ {
//^^^^ reference local 7
//     ^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/
//             ^^^^^^^^^^^^^^^^^^ definition local 5
  method() {}
//^^^^^^ definition local 9
}

exports.someFunc = function localFuncName() {}
//^^^^^ reference local 11
//      ^^^^^^^^ definition local 11
//                          ^^^^^^^^^^^^^ reference local 12
exports.someAnonymousFunc = function () /*anonymous*/ {}
//^^^^^ reference local 14
//      ^^^^^^^^^^^^^^^^^ definition local 14

exports.someArrowFunc = () => {}
//^^^^^ reference local 16
//      ^^^^^^^^^^^^^ definition local 16

exports.someValue = 4
//^^^^^ reference local 18
//      ^^^^^^^^^ definition local 18

exports.someObject = {
//^^^^^ reference local 20
//      ^^^^^^^^^^ definition local 20
  value: 5,
//^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/value0:
  method() {},
//^^^^^^ definition local 22
  get prop() {
//    ^^^^ definition local 23
    return true
  },
  set prop(val) {},
//    ^^^^ definition local 24
//         ^^^ definition local 25
}

