describe('MismatchTree', function() {
  describe('#add', function() {
    describe('When the path is empty', function() {
      it('flags the root node as mismatched', function() {
        const tree = new privateUnderTest.MismatchTree();
        tree.add(new privateUnderTest.ObjectPath([]));
        expect(tree.isMismatch).toBe(true);
      });
    });

    describe('When the path is not empty', function() {
      it('flags the node as mismatched', function() {
        const tree = new privateUnderTest.MismatchTree();

        tree.add(new privateUnderTest.ObjectPath(['a', 'b']));

        expect(tree.child('a').child('b').isMismatch).toBe(true);
      });

      it('does not flag ancestors as mismatched', function() {
        const tree = new privateUnderTest.MismatchTree();

        tree.add(new privateUnderTest.ObjectPath(['a', 'b']));

        expect(tree.isMismatch).toBe(false);
        expect(tree.child('a').isMismatch).toBe(false);
      });
    });

    it('stores the formatter on only the target node', function() {
      const tree = new privateUnderTest.MismatchTree();

      tree.add(new privateUnderTest.ObjectPath(['a', 'b']), formatter);

      expect(tree.formatter).toBeFalsy();
      expect(tree.child('a').formatter).toBeFalsy();
      expect(tree.child('a').child('b').formatter).toBe(formatter);
    });

    it('stores the path to the node', function() {
      const tree = new privateUnderTest.MismatchTree();

      tree.add(new privateUnderTest.ObjectPath(['a', 'b']), formatter);

      expect(tree.child('a').child('b').path.components).toEqual(['a', 'b']);
    });
  });

  describe('#traverse', function() {
    it('calls the callback for all nodes that are or contain mismatches', function() {
      const tree = new privateUnderTest.MismatchTree();
      tree.add(new privateUnderTest.ObjectPath(['a', 'b']), formatter);
      tree.add(new privateUnderTest.ObjectPath(['c']));
      const visit = jasmine.createSpy('visit').and.returnValue(true);

      tree.traverse(visit);

      expect(visit).toHaveBeenCalledWith(
        new privateUnderTest.ObjectPath([]),
        false,
        undefined
      );
      expect(visit).toHaveBeenCalledWith(
        new privateUnderTest.ObjectPath(['a']),
        false,
        undefined
      );
      expect(visit).toHaveBeenCalledWith(
        new privateUnderTest.ObjectPath(['a', 'b']),
        true,
        formatter
      );
      expect(visit).toHaveBeenCalledWith(
        new privateUnderTest.ObjectPath(['c']),
        true,
        undefined
      );
    });

    it('does not call the callback if there are no mismatches', function() {
      const tree = new privateUnderTest.MismatchTree();
      const visit = jasmine.createSpy('visit');

      tree.traverse(visit);

      expect(visit).not.toHaveBeenCalled();
    });

    it('visits parents before children', function() {
      const tree = new privateUnderTest.MismatchTree();
      tree.add(new privateUnderTest.ObjectPath(['a', 'b']));
      const visited = [];

      tree.traverse(function(path) {
        visited.push(path);
        return true;
      });

      expect(visited).toEqual([
        new privateUnderTest.ObjectPath([]),
        new privateUnderTest.ObjectPath(['a']),
        new privateUnderTest.ObjectPath(['a', 'b'])
      ]);
    });

    it('visits children in the order they were recorded', function() {
      const tree = new privateUnderTest.MismatchTree();
      tree.add(new privateUnderTest.ObjectPath(['length']));
      tree.add(new privateUnderTest.ObjectPath([1]));
      const visited = [];

      tree.traverse(function(path) {
        visited.push(path);
        return true;
      });

      expect(visited).toEqual([
        new privateUnderTest.ObjectPath([]),
        new privateUnderTest.ObjectPath(['length']),
        new privateUnderTest.ObjectPath([1])
      ]);
    });

    it('does not visit children if the callback returns falsy', function() {
      const tree = new privateUnderTest.MismatchTree();
      tree.add(new privateUnderTest.ObjectPath(['a', 'b']));
      const visited = [];

      tree.traverse(function(path) {
        visited.push(path);
        return path.depth() === 0;
      });

      expect(visited).toEqual([
        new privateUnderTest.ObjectPath([]),
        new privateUnderTest.ObjectPath(['a'])
      ]);
    });
  });

  function formatter() {}
});
