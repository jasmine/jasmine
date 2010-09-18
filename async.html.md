---
  layout: default
  title: Asynchronous Specs with Jasmine
---

### Asynchronous Specs

You may be thinking, "That's all very nice, but what's this about asynchronous tests?"

Well, say you need to make a call that is asynchronous - an AJAX API, event callback, or some other JavaScript library.  That is, the call returns immediately, yet you want to make expectations 'at some point in the future' after some magic happens in the background.

Jasmine allows you to do this with `runs()`, `waits()` and `waitsFor()` blocks.

#### `runs(function)`

`runs()` blocks by themselves simply run as if they were called directly. The following snippets of code provide similar results:

    it('should be a test', function () {
      var foo = 0
      foo++;

      expect(foo).toEqual(1);
    });

and

    it('should be a test', function () {
      runs( function () {
        var foo = 0
        foo++;

        expect(foo).toEqual(1);
      });
    });

Multiple `runs()` blocks in a spec will run serially. For example,

    it('should be a test', function () {
      runs( function () {
        var foo = 0
        foo++;

        expect(foo).toEqual(1);
      });
      runs( function () {
        var bar = 0
        bar++;

        expect(bar).toEqual(1);
      });
    });

`runs()` blocks share functional scope -- `this` properties will be common to all blocks, but declared `var`'s will not!

    it('should be a test', function () {
      runs( function () {
        this.foo = 0
        this.foo++;
        var bar = 0;
        bar++;

        expect(this.foo).toEqual(1);
        expect(bar).toEqual(1);
      });
      runs( function () {
        this.foo++;
        var bar = 0
        bar++;

        expect(foo).toEqual(2);
        expect(bar).toEqual(1);
      });
    });

#### `waits(timeout)`

`runs()` blocks exist so you can test asynchronous processes. The function `waits()` works with `runs()` to provide a naive
timeout before the next block is run. You supply a time to wait before the next `runs()` function is executed.  For example:

    it('should be a test', function () {
      runs(function () {
        this.foo = 0;
        var that = this;
        setTimeout(function () {
          that.foo++;
        }, 250);
      });

      runs(function () {
        expect(this.foo).toEqual(0);
      });

      waits(500);

      runs(function () {
        expect(this.foo).toEqual(1);
      });
    });

What's happening here?

* The first call to `runs()` sets call for 1/4 of a second in the future that increments `this.foo`.
* The second `runs()` is executed immediately and then verifies that `this.foo` was indeed initialized to zero in the previous `runs()`.
* Then we wait for half a second.
* Then the last call to `runs()` expects that `this.foo` was incremented by the `setTimeout`.

`waits()` allows you to pause the spec for a fixed period of time, in order to give your code the opportunity to perform
some other operation. But what if you don't know exactly how long you need to wait?

#### `waitsFor(function, optional message, optional timeout)`

`waitsFor()` provides a better interface for pausing your spec until some other work has completed. Jasmine will wait until
the provided function returns `true` before continuing with the next block. This may mean waiting an arbitrary period of
time, or you may specify a maxiumum period in milliseconds before timing out:

    describe('Spreadsheet', function() {
      it('should calculate the total asynchronously', function () {
        var spreadsheet = new Spreadsheet();
        spreadsheet.fillWith(lotsOfFixureDataValues());
        spreadsheet.asynchronouslyCalculateTotal();

        waitsFor(function() {
          return spreadsheet.calculationIsComplete();
        }, "Spreadsheet calculation never completed", 10000);

        runs(function () {
          expect(spreadsheet.total).toEqual(123456);
        });
      });
    });

In this example, we create a spreadsheet and fill it with some sample data. We then ask the spreadsheet to start calculating
its total, which presumably is a slow operation and therefore happens asynchronously. We ask Jasmine to wait until the
spreadsheet's calculation work is complete (or up to 10 seconds, whichever comes first) before continuing with the rest of
the spec. If the calculation finishes within the allotted 10 seconds, Jasmine continues on to the final `runs()` block, where
it validates the calculation. If the spreadsheet hasn't finished calculations within 10 seconds, the spec stops and reports
a spec failure with the message given in the `waitsFor()` block.

