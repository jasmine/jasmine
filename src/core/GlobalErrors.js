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
    this.jasmineHandlers = {};
    this.installOne_ = function installOne_(errorType, jasmineMessage) {
      function taggedOnError(error) {
        error.jasmineMessage = jasmineMessage + ': ' + error;

        var handler = handlers[handlers.length - 1];

        if (handler) {
          handler(error);
        } else {
          throw error;
        }
      }

      this.originalHandlers[errorType] = global.process.listeners(errorType);
      this.jasmineHandlers[errorType] = taggedOnError;

      global.process.removeAllListeners(errorType);
      global.process.on(errorType, taggedOnError);

      this.uninstall = function uninstall() {
        var errorTypes = Object.keys(this.originalHandlers);
        for (var iType = 0; iType < errorTypes.length; iType++) {
          var errorType = errorTypes[iType];
          global.process.removeListener(
            errorType,
            this.jasmineHandlers[errorType]
          );
          for (var i = 0; i < this.originalHandlers[errorType].length; i++) {
            global.process.on(errorType, this.originalHandlers[errorType][i]);
          }
          delete this.originalHandlers[errorType];
          delete this.jasmineHandlers[errorType];
        }
      };
    };

    this.install = function install() {
      if (
        global.process &&
        global.process.listeners &&
        j$.isFunction_(global.process.on)
      ) {
        this.installOne_('uncaughtException', 'Uncaught exception');
        this.installOne_('unhandledRejection', 'Unhandled promise rejection');
      } else {
        var originalHandler = global.onerror;
        global.onerror = onerror;

        var browserRejectionHandler = function browserRejectionHandler(event) {
          if (j$.isError_(event.reason)) {
            event.reason.jasmineMessage =
              'Unhandled promise rejection: ' + event.reason;
            global.onerror(event.reason);
          } else {
            global.onerror('Unhandled promise rejection: ' + event.reason);
          }
        };

        if (global.addEventListener) {
          global.addEventListener(
            'unhandledrejection',
            browserRejectionHandler
          );
        }

        this.uninstall = function uninstall() {
          global.onerror = originalHandler;
          if (global.removeEventListener) {
            global.removeEventListener(
              'unhandledrejection',
              browserRejectionHandler
            );
          }
        };
      }
    };

    this.pushListener = function pushListener(listener) {
      handlers.push(listener);
    };

    this.popListener = function popListener(listener) {
      if (!listener) {
        throw new Error('popListener expects a listener');
      }

      handlers.pop();
    };
  }

  return GlobalErrors;
};
