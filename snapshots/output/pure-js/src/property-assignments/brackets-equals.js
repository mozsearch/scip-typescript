// < definition pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/

const bracketEquals = {}
//    ^^^^^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.
bracketEquals['prop'] = 0
//^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.
//            ^^^^^^ definition pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.prop.
bracketEquals.prop
//^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.
//            ^^^^ reference pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.prop.
bracketEquals['prop']
//^^^^^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.
//            ^^^^^^ reference pure-js 1.0.0 src/property-assignments/`brackets-equals.js`/bracketEquals.prop.

