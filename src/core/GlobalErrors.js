getJasmineRequireObj().GlobalErrors = function(j$) {
  function GlobalErrors(global) {
    var handlers = [];
    global = global || j$.getGlobal();

    var onerror = function onerror() {
      var handler = handlers[handlers.length - 1];

      if (handler) {
        handler.apply(null, Array.prototype.slice.call(arguments, 0));
      } else {
        throw arguments[0];
      }
    };

    this.uninstall = function noop() {};

    this.install = function install() {
      if (global.process && global.process.listeners && j$.isFunction_(global.process.on)) {
        var originalHandlers = global.process.listeners('uncaughtException');
        global.process.removeAllListeners('uncaughtException');
        global.process.on('uncaughtException', onerror);

        this.uninstall = function uninstall() {
          global.process.removeListener('uncaughtException', onerror);
          for (var i = 0; i < originalHandlers.length; i++) {
            global.process.on('uncaughtException', originalHandlers[i]);
          }
        };
      } else {
        var originalHandler = global.onerror;
        global.onerror = onerror;

        this.uninstall = function uninstall() {
          global.onerror = originalHandler;
        };
      }
    };

    this.pushListener = function pushListener(listener) {
      handlers.push(listener);
    };

    this.popListener = function popListener() {
      handlers.pop();
    };
  }

  return GlobalErrors;
};
