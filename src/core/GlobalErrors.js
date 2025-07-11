getJasmineRequireObj().GlobalErrors = function(j$) {
  class GlobalErrors {
    #global;
    #handlers;
    #originalHandlers;
    #jasmineHandlers;
    #overrideHandler;
    #onRemoveOverrideHandler;
    #onBrowserError;
    #onBrowserRejection;
    #onNodeError;
    #onNodeRejection;

    constructor(global) {
      this.#global = global || j$.getGlobal();

      this.#handlers = [];
      this.#overrideHandler = null;
      this.#onRemoveOverrideHandler = null;

      this.#onBrowserError = event =>
        this.#dispatchBrowserError(event.error, event);
      this.#onBrowserRejection = event => this.#browserRejectionHandler(event);

      this.#onNodeError = error =>
        this.#handleNodeEvent(error, 'uncaughtException', 'Uncaught exception');
      this.#onNodeRejection = error =>
        this.#handleNodeEvent(
          error,
          'unhandledRejection',
          'Unhandled promise rejection'
        );

      this.#originalHandlers = {};
      this.#jasmineHandlers = {};
    }

    install() {
      if (
        this.#global.process &&
        this.#global.process.listeners &&
        j$.isFunction_(this.#global.process.on)
      ) {
        this.#installNodeHandler('uncaughtException', this.#onNodeError);
        this.#installNodeHandler('unhandledRejection', this.#onNodeRejection);
      } else {
        this.#global.addEventListener('error', this.#onBrowserError);

        this.#global.addEventListener(
          'unhandledrejection',
          this.#onBrowserRejection
        );
      }
    }

    uninstall() {
      if (
        this.#global.process &&
        this.#global.process.listeners &&
        j$.isFunction_(this.#global.process.on)
      ) {
        this.#nodeUninstall();
      } else {
        this.#browserUninstall();
      }
    }

    // The listener at the top of the stack will be called with two arguments:
    // the error and the event. Either of them may be falsy.
    // The error will normally be provided, but will be falsy in the case of
    // some browser load-time errors. The event will normally be provided in
    // browsers but will be falsy in Node.
    // Listeners that are pushed after spec files have been loaded should be
    // able to just use the error parameter.
    pushListener(listener) {
      this.#handlers.push(listener);
    }

    popListener(listener) {
      if (!listener) {
        throw new Error('popListener expects a listener');
      }

      this.#handlers.pop();
    }

    setOverrideListener(listener, onRemove) {
      if (this.#overrideHandler) {
        throw new Error("Can't set more than one override listener at a time");
      }

      this.#overrideHandler = listener;
      this.#onRemoveOverrideHandler = onRemove;
    }

    removeOverrideListener() {
      if (this.#onRemoveOverrideHandler) {
        this.#onRemoveOverrideHandler();
      }

      this.#overrideHandler = null;
      this.#onRemoveOverrideHandler = null;
    }

    #nodeUninstall() {
      const errorTypes = Object.keys(this.#originalHandlers);
      for (const errorType of errorTypes) {
        this.#global.process.removeListener(
          errorType,
          this.#jasmineHandlers[errorType]
        );

        for (let i = 0; i < this.#originalHandlers[errorType].length; i++) {
          this.#global.process.on(
            errorType,
            this.#originalHandlers[errorType][i]
          );
        }
        delete this.#originalHandlers[errorType];
        delete this.#jasmineHandlers[errorType];
      }
    }

    #browserUninstall() {
      this.#global.removeEventListener('error', this.#onBrowserError);
      this.#global.removeEventListener(
        'unhandledrejection',
        this.#onBrowserRejection
      );
    }

    #dispatchBrowserError(error, event) {
      if (this.#overrideHandler) {
        // See discussion of spyOnGlobalErrorsAsync in base.js
        this.#overrideHandler(error);
        return;
      }

      const handler = this.#handlers[this.#handlers.length - 1];

      if (handler) {
        handler(error, event);
      } else {
        throw error;
      }
    }

    #browserRejectionHandler(event) {
      if (j$.isError_(event.reason)) {
        event.reason.jasmineMessage =
          'Unhandled promise rejection: ' + event.reason;
        this.#dispatchBrowserError(event.reason, event);
      } else {
        this.#dispatchBrowserError(
          'Unhandled promise rejection: ' + event.reason,
          event
        );
      }
    }

    #installNodeHandler(errorType, handler) {
      this.#originalHandlers[errorType] = this.#global.process.listeners(
        errorType
      );
      this.#jasmineHandlers[errorType] = handler;

      this.#global.process.removeAllListeners(errorType);
      this.#global.process.on(errorType, handler);
    }

    #handleNodeEvent(error, errorType, jasmineMessage) {
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

      const handler = this.#handlers[this.#handlers.length - 1];

      if (this.#overrideHandler) {
        // See discussion of spyOnGlobalErrorsAsync in base.js
        this.#overrideHandler(error);
        return;
      }

      if (handler) {
        handler(error);
      } else {
        throw error;
      }
    }
  }

  return GlobalErrors;
};
