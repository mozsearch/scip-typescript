// < definition pure-js 1.0.0 src/property-assignments/`dot-equals.js`/

const dotEquals = {}
//    ^^^^^^^^^ definition pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.
dotEquals.prop = 0
//^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.
//        ^^^^ definition pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.prop.
dotEquals.prop
//^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.
//        ^^^^ reference pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.prop.
dotEquals['prop']
//^^^^^^^ reference pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.
//        ^^^^^^ reference pure-js 1.0.0 src/property-assignments/`dot-equals.js`/dotEquals.prop.

