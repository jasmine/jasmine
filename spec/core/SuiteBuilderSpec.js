describe('SuiteBuilder', function() {
  beforeEach(function() {
    // Rethrow exceptions to ease debugging
    spyOn(jasmineUnderTest.Suite.prototype, 'handleException').and.callFake(
      function(e) {
        throw e;
      }
    );
    spyOn(jasmineUnderTest.Spec.prototype, 'handleException').and.callFake(
      function(e) {
        throw e;
      }
    );
  });

  it('creates the top suite', function() {
    const env = { configuration: () => ({}) };
    const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

    expect(suiteBuilder.topSuite).toBeInstanceOf(jasmineUnderTest.Suite);
    expect(suiteBuilder.topSuite.description).toEqual(
      'Jasmine__TopLevel__Suite'
    );
    expect(suiteBuilder.topSuite.parentSuite).toBeUndefined();
  });

  describe('#describe', function() {
    definesSuites('describe');
  });

  describe('#fdescribe', function() {
    definesSuites('fdescribe');

    it('focuses the suite', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      const suite = suiteBuilder.fdescribe('a suite', function() {
        suiteBuilder.it('a spec');
      });

      expect(suite.isFocused).toBeTrue();
      expect(suiteBuilder.focusedRunables).toEqual([suite.id]);
    });

    it('unfocuses any focused ancestor suite', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      const grandparent = suiteBuilder.fdescribe('a suite', function() {
        suiteBuilder.describe('another suite', function() {
          suiteBuilder.fdescribe('the focused suite', function() {
            suiteBuilder.it('a spec');
          });
        });
      });

      expect(suiteBuilder.focusedRunables).not.toContain(grandparent.id);
    });
  });

  describe('#xdescribe', function() {
    definesSuites('xdescribe');

    it('excludes the suite', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      const suite = suiteBuilder.xdescribe('a suite', function() {
        suiteBuilder.it('a spec');
      });

      expect(suite.markedExcluding).toBeTrue();
    });

    it('causes child suites to be marked excluded', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      let suite;
      suiteBuilder.xdescribe('a suite', function() {
        suite = suiteBuilder.describe('another suite', function() {
          suiteBuilder.it('a spec');
        });
      });

      expect(suite.markedExcluding).toBeTrue();
    });
  });

  describe('#it', function() {
    definesSpecs('it');
  });

  describe('#fit', function() {
    definesSpecs('fit');
  });

  describe('#xit', function() {
    definesSpecs('xit');
  });

  function definesSuites(fnName) {
    it('links suites to their parents and children', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      let child;
      const parent = suiteBuilder[fnName]('parent', function() {
        child = suiteBuilder[fnName]('child', function() {
          suiteBuilder.it('a spec');
        });
      });

      expect(suiteBuilder.topSuite.children).toEqual([sameInstanceAs(parent)]);
      expect(parent.children).toEqual([sameInstanceAs(child)]);
      expect(child.parentSuite).toBe(parent);
      expect(parent.parentSuite).toBe(suiteBuilder.topSuite);
    });

    it('gives each suite a unique ID', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      let child;
      const parent = suiteBuilder[fnName]('parent', function() {
        child = suiteBuilder[fnName]('child', function() {
          suiteBuilder.it('a spec');
        });
      });

      const ids = [suiteBuilder.topSuite.id, parent.id, child.id];

      for (const id of ids) {
        expect(id).toMatch(/^suite[0-9]$/);
      }

      expect(new Set(ids).size).toEqual(3);
    });
  }

  function definesSpecs(fnName) {
    it('adds the spec to its suite', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      let spec;
      const suite = suiteBuilder.describe('a suite', function() {
        spec = suiteBuilder[fnName]('a spec', function() {});
      });

      expect(suite.children).toEqual([sameInstanceAs(spec)]);
    });

    it('gives each spec a unique ID', function() {
      const env = { configuration: () => ({}) };
      const suiteBuilder = new jasmineUnderTest.SuiteBuilder({ env });

      const spec1 = suiteBuilder[fnName]('a spec', function() {});
      const spec2 = suiteBuilder[fnName]('another spec', function() {});

      expect(spec1.id).toMatch(/^spec[0-9]+$/);
      expect(spec2.id).toMatch(/^spec[0-9]+$/);
      expect(spec1.id).not.toEqual(spec2.id);
    });
  }

  function sameInstanceAs(expected) {
    return {
      asymmetricMatch: function(actual) {
        return actual === expected;
      },
      jasmineToString: function(pp) {
        return '<same instance as ' + pp(expected) + '>';
      }
    };
  }
});
