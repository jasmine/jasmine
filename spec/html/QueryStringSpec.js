describe("QueryString", function() {

  describe("#setParam", function() {

    it("sets the query string to include the given key/value pair", function() {
      var windowLocation = {
          search: ""
        },
        queryString = new j$.QueryString({
          getWindowLocation: function() { return windowLocation }
        });

      queryString.setParam("foo", "bar baz");

      expect(windowLocation.search).toMatch(/foo=bar%20baz/);
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
