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

    this.originalHandlers = {};
    this.installOne_ = function installOne_(errorType) {
      this.originalHandlers[errorType] = global.process.listeners(errorType);
      global.process.removeAllListeners(errorType);
      global.process.on(errorType, onerror);

      this.uninstall = function uninstall() {
        var errorTypes = Object.keys(this.originalHandlers);
        for (var iType = 0; iType < errorTypes.length; iType++) {
          var errorType = errorTypes[iType];
          global.process.removeListener(errorType, onerror);
          for (var i = 0; i < this.originalHandlers[errorType].length; i++) {
            global.process.on(errorType, this.originalHandlers[errorType][i]);
          }
          delete this.originalHandlers[errorType];
        }
      };
    };

    this.install = function install() {
      if (global.process && global.process.listeners && j$.isFunction_(global.process.on)) {
        this.installOne_('uncaughtException');
        this.installOne_('unhandledRejection');
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
