// < definition pure-js 1.0.0 src/`constructor-properties.js`/

function Scope() {
//       ^^^^^ definition pure-js 1.0.0 src/`constructor-properties.js`/Scope().
  this.ok = function scope_ok(condition) {}
//     ^^ reference pure-js 1.0.0 src/`constructor-properties.js`/Scope().ok.
//                   ^^^^^^^^ reference pure-js 1.0.0 src/`constructor-properties.js`/Scope().ok.
//                            ^^^^^^^^^ definition pure-js 1.0.0 src/`constructor-properties.js`/Scope().ok.(condition)
}

const scope = new Scope()
//    ^^^^^ definition pure-js 1.0.0 src/`constructor-properties.js`/scope.
//                ^^^^^ reference pure-js 1.0.0 src/`constructor-properties.js`/Scope().
scope.ok(true)
//^^^ reference pure-js 1.0.0 src/`constructor-properties.js`/scope.
//    ^^ reference pure-js 1.0.0 src/`constructor-properties.js`/Scope().ok.

// (At a file's top level, `this` is the global.)
this.topLevelColor = 'red'
//   ^^^^^^^^^^^^^ reference local 0
const topLevel = this.topLevelColor
//    ^^^^^^^^ definition pure-js 1.0.0 src/`constructor-properties.js`/topLevel.
//                    ^^^^^^^^^^^^^ reference local 0

