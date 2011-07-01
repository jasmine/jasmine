describe('Context', function() {

  context('nesting', {subject: function(ctxt) { return ctxt.x() * ctxt.y(); },
     x: function() { return 5; },
     y: function() { return 2; }},  function(ctxt) {
    it("should equal 10", function() {
      expect(ctxt.subject()).toEqual(10);
    });

    context('y is 4', {y: function() { return 4; }}, function(ctxt) {
      it("should equal 20", function() {
        expect(ctxt.subject()).toEqual(20);
      });

      context('x is 10', {x: function() { return 10; }}, function(ctxt) {
        it("should display 40", function() {
          expect(ctxt.subject()).toEqual(40);
        });
      });
    });

    it("should display 10", function() {
      expect(ctxt.subject()).toEqual(10);
    });
  });

  var intermediateValue = 0;
  context('memozing', {subject: function() { return intermediateValue + 1; }}, function(ctxt) {
    it("should return 1", function () {
      expect(ctxt.subject()).toEqual(1);
    });
    it("should return 1, again", function () {
      expect(ctxt.subject()).toEqual(1);
    });
  });
  
});
