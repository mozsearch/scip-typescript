// < definition pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/

const objectDefineProperties = {}
//    ^^^^^^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.
Object.defineProperties(objectDefineProperties, {
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object#
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object.
//     ^^^^^^^^^^^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/ObjectConstructor#defineProperties().
//                      ^^^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.
  prop: 0,
//^^^^ definition pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.prop.
  accessors: {
//^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.accessors.
    get() {
//  ^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/PropertyDescriptor#get().
      return true
    },
    set(val) {
//  ^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/PropertyDescriptor#set().
//      ^^^ definition local 1
      val
//    ^^^ reference local 1
    },
  },
})
objectDefineProperties.prop
//^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.
//                     ^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.prop.
objectDefineProperties.accessors
//^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.
//                     ^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.accessors.
objectDefineProperties.accessors = 1
//^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.
//                     ^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-properties.js`/objectDefineProperties.accessors.

