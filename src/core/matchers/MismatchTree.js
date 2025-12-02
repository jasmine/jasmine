getJasmineRequireObj().MismatchTree = function(j$) {
  'use strict';

  /*
    To be able to apply custom object formatters at all possible levels of an
    object graph, DiffBuilder needs to be able to know not just where the
    mismatch occurred but also all ancestors of the mismatched value in both
    the expected and actual object graphs. MismatchTree maintains that context
    and provides it via the traverse method.
   */
  class MismatchTree {
    constructor(path) {
      this.path = path || new j$.private.ObjectPath([]);
      this.formatter = undefined;
      this.children = [];
      this.isMismatch = false;
    }

    add(path, formatter) {
      if (path.depth() === 0) {
        this.formatter = formatter;
        this.isMismatch = true;
      } else {
        const key = path.components[0];
        path = path.shift();
        let child = this.child(key);

        if (!child) {
          child = new MismatchTree(this.path.add(key));
          this.children.push(child);
        }

        child.add(path, formatter);
      }
    }

    traverse(visit) {
      const hasChildren = this.children.length > 0;

      if (this.isMismatch || hasChildren) {
        if (visit(this.path, !hasChildren, this.formatter)) {
          for (const child of this.children) {
            child.traverse(visit);
          }
        }
      }
    }

    child(key) {
      return this.children.find(child => {
        const pathEls = child.path.components;
        return pathEls[pathEls.length - 1] === key;
      });
    }
  }

  return MismatchTree;
};
