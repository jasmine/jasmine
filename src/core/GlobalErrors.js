getJasmineRequireObj().GlobalErrors = function(j$) {
  function GlobalErrors(global) {
    var handlers = [], installed = false, originalHandler = null;
    global = global || j$.getGlobal();

    var onerror = function onerror() {
      var handler = handlers[handlers.length - 1];
      handler.apply(null, Array.prototype.slice.call(arguments, 0));
    };

    this.uninstall = function uninstall() {
      if (!installed) {
        return;
      }

      if (global.process && global.process.listeners && j$.isFunction_(global.process.on)) {
        global.process.removeListener('uncaughtException', onerror);
        for (var i = 0; i < originalHandler.length; i++) {
          global.process.on('uncaughtException', originalHandler[i]);
        }
      } else {
        global.onerror = originalHandler;
      }

      installed = false;
      originalHandler = null;
    };

    this.install = function install() {
      if (global.process && global.process.listeners && j$.isFunction_(global.process.on)) {
        originalHandler = global.process.listeners('uncaughtException');
        global.process.removeAllListeners('uncaughtException');
        global.process.on('uncaughtException', onerror);
      } else {
        originalHandler = global.onerror;
        global.onerror = onerror;
      }

      installed = true;
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
