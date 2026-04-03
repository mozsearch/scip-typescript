// < definition pure-js 1.0.0 src/`exports.cjs`/

exports.SomeExportedClass = class LocalClassName {
//^^^^^ reference local 2
//      ^^^^^^^^^^^^^^^^^ definition local 3
//                                ^^^^^^^^^^^^^^ reference local 2
  method() {}
//^^^^^^ definition local 4
}

module.exports.SomeAnonymousClass = class /*anonymous*/ {
//^^^^ reference local 9
//     ^^^^^^^ reference pure-js 1.0.0 src/`exports.cjs`/
//             ^^^^^^^^^^^^^^^^^^ definition local 7
  method() {}
//^^^^^^ definition local 11
}

exports.someFunc = function localFuncName() {}
//^^^^^ reference local 14
//      ^^^^^^^^ definition local 14
//                          ^^^^^^^^^^^^^ reference local 15
exports.someAnonymousFunc = function () /*anonymous*/ {}
//^^^^^ reference local 18
//      ^^^^^^^^^^^^^^^^^ definition local 18

exports.someArrowFunc = () => {}
//^^^^^ reference local 21
//      ^^^^^^^^^^^^^ definition local 21

exports.someValue = 4
//^^^^^ reference local 24
//      ^^^^^^^^^ definition local 24

exports.someObject = {
//^^^^^ reference local 27
//      ^^^^^^^^^^ definition local 27
  value: 5,
//^^^^^ definition pure-js 1.0.0 src/`exports.cjs`/value0:
  method() {},
//^^^^^^ definition local 29
  get prop() {
//    ^^^^ definition local 30
    return true
  },
  set prop(val) {},
//    ^^^^ definition local 31
//         ^^^ definition local 32
}

