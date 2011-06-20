describe('Context', function() {

  context({subject: function(ctxt) { return ctxt.x() * ctxt.y(); },
       x: function() { return 5; },
       y: function() { return 2; }},  function(ctxt) {
    it("should equal 10", function() {
      expect(ctxt.subject()).toEqual(10);
    });

    context(ctxt, {y: function() { return 4; }}, function(ctxt) {
      it("should equal 20", function() {
        expect(ctxt.subject()).toEqual(20);
      });

      context(ctxt, {x: function() { return 10; }}, function(ctxt) {
        it("should display 40", function() {
	  expect(ctxt.subject()).toEqual(40);
	});
      });
    });

    it("should display 10", function() {
      expect(ctxt.subject()).toEqual(10);
    });
  });
});
