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
//^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.prop.
  shorthand,
//^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.shorthand.
//^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/shorthand.
  [computed]: computed,
// ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
//            ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
  method() {
//^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.method().
    return [1, 2, 3]
  },
  get accessor() {
//    ^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.
    return [1, 2]
  },
  set accessor(val) {
//    ^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.
//             ^^^ definition local 1
    val
//  ^^^ reference local 1
  },
})
objectAssign.prop
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.prop.
objectAssign.shorthand
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.shorthand.
objectAssign[computed]
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/computed.
objectAssign.method().length
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.method().
//                    ^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Array#length.
objectAssign.accessor.length
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.
//                    ^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Array#length.
//                    ^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/String#length.
objectAssign.accessor = 'val'
//^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.
//           ^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-assign.js`/objectAssign.accessor.

