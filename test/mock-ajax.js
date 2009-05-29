jasmine.AjaxRequests = {
  requests: $A(),

  activeRequest: function() {
    return this.requests.last();
  },

  add: function(request) {
    this.requests.push(request);
    var spec = jasmine.getEnv().currentSpec;
    spec.after(function() { jasmine.AjaxRequests.clear(); });
  },

  remove: function(request) {
    this.requests = this.requests.without(request);
  },

  clear: function() {
    this.requests.clear();
  }
};

jasmine.AjaxRequest = Class.create(Ajax.Request, {
  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    jasmine.AjaxRequests.add(this);
  },

  response: function(response) {
    if (!response.status || response.status == 200 || response.status == "200") {
      if (this.options.onSuccess) {this.options.onSuccess(response);}
    } else {
      if (this.options.onFailure) {this.options.onFailure(response);}
    }
    if (this.options.onComplete) {this.options.onComplete(response);}
    jasmine.AjaxRequests.remove(this);
  }
});
