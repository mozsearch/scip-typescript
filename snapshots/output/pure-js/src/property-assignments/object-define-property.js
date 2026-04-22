// < definition pure-js 1.0.0 src/property-assignments/`object-define-property.js`/

const objectDefineProperty = {}
//    ^^^^^^^^^^^^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`object-define-property.js`/objectDefineProperty.
Object.defineProperty(objectDefineProperty, 'prop', 0)
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object#
//^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/Object.
//     ^^^^^^^^^^^^^^ reference typescript 6.0.3 lib/`lib.es5.d.ts`/ObjectConstructor#defineProperty().
//                    ^^^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-property.js`/objectDefineProperty.
//                                          ^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-property.js`/objectDefineProperty.prop.
objectDefineProperty.prop
//^^^^^^^^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-property.js`/objectDefineProperty.
//                   ^^^^ reference pure-js 1.0.0 src/property-assignments/`object-define-property.js`/objectDefineProperty.prop.

