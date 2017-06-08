getJasmineRequireObj().GlobalErrors = function(j$) {
  function GlobalErrors(global) {
    var handlers = [], installable = false, installed = false, originalHandler = null;
    global = global || j$.getGlobal();

    var onerror = function onerror() {
      var handler = handlers[handlers.length - 1];

      if (handler) {
        handler.apply(null, Array.prototype.slice.call(arguments, 0));
      } else {
        throw arguments[0];
      }
    };

    this.uninstall = function uninstall() {
      unregister();
      installable = false;
    };

    var unregister = function unregister() {
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
      installable = true;
    };

    var register = function register() {
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

      if (installable && !installed) {
        register();
      }
    };

    this.popListener = function popListener() {
      handlers.pop();

      if (handlers.length === 0) {
        unregister();
      }
    };
  }

  return GlobalErrors;
};
