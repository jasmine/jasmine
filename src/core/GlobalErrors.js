getJasmineRequireObj().GlobalErrors = function(j$) {
  class GlobalErrors {
    #adapter;
    #handlers;
    #overrideHandler;
    #onRemoveOverrideHandler;

    constructor(global) {
      global = global || j$.getGlobal();
      const dispatchError = this.#dispatchError.bind(this);

      if (
        global.process &&
        global.process.listeners &&
        j$.isFunction_(global.process.on)
      ) {
        this.#adapter = new NodeAdapter(global, dispatchError);
      } else {
        this.#adapter = new BrowserAdapter(global, dispatchError);
      }

      this.#handlers = [];
      this.#overrideHandler = null;
      this.#onRemoveOverrideHandler = null;
    }

    install() {
      this.#adapter.install();
    }

    uninstall() {
      this.#adapter.uninstall();
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

    // Either error or event may be undefined
    #dispatchError(error, event) {
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
  }

  class BrowserAdapter {
    #global;
    #dispatchError;
    #onError;
    #onUnhandledRejection;

    constructor(global, dispatchError) {
      this.#global = global;
      this.#dispatchError = dispatchError;
      this.#onError = event => this.#dispatchError(event.error, event);
      this.#onUnhandledRejection = this.#unhandledRejectionHandler.bind(this);
    }

    install() {
      this.#global.addEventListener('error', this.#onError);

      this.#global.addEventListener(
        'unhandledrejection',
        this.#onUnhandledRejection
      );
    }

    uninstall() {
      this.#global.removeEventListener('error', this.#onError);
      this.#global.removeEventListener(
        'unhandledrejection',
        this.#onUnhandledRejection
      );
    }

    #unhandledRejectionHandler(event) {
      if (j$.isError_(event.reason)) {
        event.reason.jasmineMessage =
          'Unhandled promise rejection: ' + event.reason;
        this.#dispatchError(event.reason, event);
      } else {
        this.#dispatchError(
          'Unhandled promise rejection: ' + event.reason,
          event
        );
      }
    }
  }

  class NodeAdapter {
    #global;
    #dispatchError;
    #originalHandlers;
    #jasmineHandlers;
    #onError;
    #onUnhandledRejection;

    constructor(global, dispatchError) {
      this.#global = global;
      this.#dispatchError = dispatchError;

      this.#jasmineHandlers = {};
      this.#originalHandlers = {};

      this.#onError = error =>
        this.#eventHandler(error, 'uncaughtException', 'Uncaught exception');
      this.#onUnhandledRejection = error =>
        this.#eventHandler(
          error,
          'unhandledRejection',
          'Unhandled promise rejection'
        );
    }

    install() {
      this.#installHandler('uncaughtException', this.#onError);
      this.#installHandler('unhandledRejection', this.#onUnhandledRejection);
    }

    uninstall() {
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

    #installHandler(errorType, handler) {
      this.#originalHandlers[errorType] = this.#global.process.listeners(
        errorType
      );
      this.#jasmineHandlers[errorType] = handler;

      this.#global.process.removeAllListeners(errorType);
      this.#global.process.on(errorType, handler);
    }

    #eventHandler(error, errorType, jasmineMessage) {
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

      this.#dispatchError(error);
    }
  }

  return GlobalErrors;
};
