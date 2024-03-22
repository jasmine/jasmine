getJasmineRequireObj().GlobalErrors = function(j$) {
  function GlobalErrors(global) {
    global = global || j$.getGlobal();

    const handlers = [];
    let overrideHandler = null,
      onRemoveOverrideHandler = null;

    function onBrowserError(event) {
      dispatchBrowserError(event.error, event);
    }

    function dispatchBrowserError(error, event) {
      if (overrideHandler) {
        // See discussion of spyOnGlobalErrorsAsync in base.js
        overrideHandler(error);
        return;
      }

      const handler = handlers[handlers.length - 1];

      if (handler) {
        handler(error, event);
      } else {
        throw error;
      }
    }

    this.originalHandlers = {};
    this.jasmineHandlers = {};
    this.installOne_ = function installOne_(errorType, jasmineMessage) {
      function taggedOnError(error) {
        if (j$.isError_(error)) {
          error.jasmineMessage = jasmineMessage + ': ' + error;
        } else {
          let substituteMsg;

          if (error) {
            substituteMsg = jasmineMessage + ': ' + error;
          } else {
            substituteMsg = jasmineMessage + ' with no error or message';
          }

          if (errorType === 'unhandledRejection') {
            substituteMsg +=
              '\n' +
              '(Tip: to get a useful stack trace, use ' +
              'Promise.reject(new Error(...)) instead of Promise.reject(' +
              (error ? '...' : '') +
              ').)';
          }

          error = new Error(substituteMsg);
        }

        const handler = handlers[handlers.length - 1];

        if (overrideHandler) {
          // See discussion of spyOnGlobalErrorsAsync in base.js
          overrideHandler(error);
          return;
        }

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
        const errorTypes = Object.keys(this.originalHandlers);
        for (const errorType of errorTypes) {
          global.process.removeListener(
            errorType,
            this.jasmineHandlers[errorType]
          );

          for (let i = 0; i < this.originalHandlers[errorType].length; i++) {
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
        global.addEventListener('error', onBrowserError);

        const browserRejectionHandler = function browserRejectionHandler(
          event
        ) {
          if (j$.isError_(event.reason)) {
            event.reason.jasmineMessage =
              'Unhandled promise rejection: ' + event.reason;
            dispatchBrowserError(event.reason, event);
          } else {
            dispatchBrowserError(
              'Unhandled promise rejection: ' + event.reason,
              event
            );
          }
        };

        global.addEventListener('unhandledrejection', browserRejectionHandler);

        this.uninstall = function uninstall() {
          global.removeEventListener('error', onBrowserError);
          global.removeEventListener(
            'unhandledrejection',
            browserRejectionHandler
          );
        };
      }
    };

    // The listener at the top of the stack will be called with two arguments:
    // the error and the event. Either of them may be falsy.
    // The error will normally be provided, but will be falsy in the case of
    // some browser load-time errors. The event will normally be provided in
    // browsers but will be falsy in Node.
    // Listeners that are pushed after spec files have been loaded should be
    // able to just use the error parameter.
    this.pushListener = function pushListener(listener) {
      handlers.push(listener);
    };

    this.popListener = function popListener(listener) {
      if (!listener) {
        throw new Error('popListener expects a listener');
      }

      handlers.pop();
    };

    this.setOverrideListener = function(listener, onRemove) {
      if (overrideHandler) {
        throw new Error("Can't set more than one override listener at a time");
      }

      overrideHandler = listener;
      onRemoveOverrideHandler = onRemove;
    };

    this.removeOverrideListener = function() {
      if (onRemoveOverrideHandler) {
        onRemoveOverrideHandler();
      }

      overrideHandler = null;
      onRemoveOverrideHandler = null;
    };
  }

  return GlobalErrors;
};
