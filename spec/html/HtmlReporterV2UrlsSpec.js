describe('HtmlReporterV2Urls', function() {
  describe('#configFromCurrentUrl', function() {
    passesThroughQueryParam('stopOnSpecFailure');
    passesThroughQueryParam('stopSpecOnExpectationFailure');
    passesThroughQueryParam('random');
    ignoresEmpty('random');
    passesThroughQueryParam('seed');
    ignoresEmpty('seed');

    it('configures a matching spec filter', function() {
      const queryString = mockQueryString();
      queryString.getParam.withArgs('path').and.returnValue('["foo","bar"]');
      const subject = new jasmineUnderTest.HtmlReporterV2Urls({ queryString });
      const config = subject.configFromCurrentUrl();
      const matching = {
        getPath() {
          return ['foo', 'bar'];
        }
      };
      const nonMatching = {
        getPath() {
          return ['foobar'];
        }
      };
      expect(config.specFilter(matching)).toEqual(true);
      expect(config.specFilter(nonMatching)).toEqual(false);
    });

    function passesThroughQueryParam(k) {
      it(`sets config.${k} to undefined when ${k} is not in the query string`, function() {
        const queryString = mockQueryString();
        queryString.getParam.withArgs(k).and.returnValue(undefined);
        const subject = new jasmineUnderTest.HtmlReporterV2Urls({
          queryString
        });
        expect(subject.configFromCurrentUrl()[k]).toBeUndefined();
      });

      it(`sets config.${k} to the ${k} query param`, function() {
        const queryString = mockQueryString();
        queryString.getParam.withArgs(k).and.returnValue('someval');
        const subject = new jasmineUnderTest.HtmlReporterV2Urls({
          queryString
        });
        expect(subject.configFromCurrentUrl()[k]).toEqual('someval');
      });
    }

    function ignoresEmpty(k) {
      it(`sets config.${k} to undefined when the ${k} query param is empty`, function() {
        const queryString = mockQueryString();
        queryString.getParam.withArgs(k).and.returnValue(undefined);
        const subject = new jasmineUnderTest.HtmlReporterV2Urls({
          queryString
        });
        expect(subject.configFromCurrentUrl()[k]).toBeUndefined();
      });
    }

    function mockQueryString() {
      const qs = jasmine.createSpyObj('queryString', ['getParam']);
      qs.getParam.and.returnValue('NOT STUBBED');
      return qs;
    }
  });
});
