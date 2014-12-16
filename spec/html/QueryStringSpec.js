describe("QueryString", function() {

  describe("#navigateWithNewParam", function() {
    it("sets the query string to include the given key/value pair", function() {
      var windowLocation = {
          search: ""
        },
        queryString = new j$.QueryString({
          getWindowLocation: function() { return windowLocation }
        });

      queryString.navigateWithNewParam("foo", "bar baz");

      expect(windowLocation.search).toMatch(/foo=bar%20baz/);
    });

    it("leaves existing params alone", function() {
      var windowLocation = {
        search: "?foo=bar"
      },
      queryString = new j$.QueryString({
        getWindowLocation: function() { return windowLocation }
      });

      queryString.navigateWithNewParam("baz", "quux");

      expect(windowLocation.search).toMatch(/foo=bar/);
      expect(windowLocation.search).toMatch(/baz=quux/);
    });
  });

  describe('#fullStringWithNewParam', function() {
    it("gets the query string including the given key/value pair", function() {
      var windowLocation = {
        search: "?foo=bar"
      },
      queryString = new j$.QueryString({
        getWindowLocation: function() { return windowLocation }
      });

      var result = queryString.fullStringWithNewParam("baz", "quux");

      expect(result).toMatch(/foo=bar/);
      expect(result).toMatch(/baz=quux/);
    });
  });

  describe("#getParam", function() {

    it("returns the value of the requested key", function() {
      var windowLocation = {
          search: "?baz=quux%20corge"
        },
        queryString = new j$.QueryString({
          getWindowLocation: function() { return windowLocation }
        });

      expect(queryString.getParam("baz")).toEqual("quux corge");
    });

    it("returns null if the key is not present", function() {
      var windowLocation = {
          search: ""
        },
        queryString = new j$.QueryString({
          getWindowLocation: function() { return windowLocation }
        });

      expect(queryString.getParam("baz")).toBeFalsy();
    });
  });
});
