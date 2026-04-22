// < definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/

const shorthand = 'shorthand'
//    ^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/shorthand.
const computed = 'computed'
//    ^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
const objectAssign = {}
//    ^^^^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
Object.assign(objectAssign, {
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object#
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object.
//     ^^^^^^ reference typescript 6.0.3 lib/`lib.es2015.core.d.ts`/ObjectConstructor#assign().
//            ^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
  prop: 0,
//^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/prop0:
  shorthand,
//^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/shorthand0:
  [computed]: computed,
// ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
//            ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
  method() {
//^^^^^^ reference local 2
    return [1, 2, 3]
  },
  get accessor() {
//    ^^^^^^^^ reference local 3
//    ^^^^^^^^ reference local 4
    return [1, 2]
  },
  set accessor(val) {
//    ^^^^^^^^ reference local 3
//    ^^^^^^^^ reference local 4
//             ^^^ definition local 5
    val
//  ^^^ reference local 5
  },
})
objectAssign.prop
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
objectAssign.shorthand
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
objectAssign[computed]
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
objectAssign.method().length
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
objectAssign.accessor.length
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.
//                    ^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/String#length.
objectAssign.accessor = 'val'
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.

