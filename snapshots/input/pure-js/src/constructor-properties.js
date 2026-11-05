function Scope() {
  this.ok = function scope_ok(condition) {}
}

const scope = new Scope()
scope.ok(true)

// (At a file's top level, `this` is the global.)
this.topLevelColor = 'red'
const topLevel = this.topLevelColor
