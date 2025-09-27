getJasmineRequireObj().GlobalErrors = function(j$) {
  class GlobalErrors {
    #getConfig;
    #adapter;
    #handlers;
    #overrideHandler;
    #onRemoveOverrideHandler;
    #pendingUnhandledRejections;

    constructor(global, getConfig) {
      global = global || j$.getGlobal();
      this.#getConfig = getConfig;
      this.#pendingUnhandledRejections = new Map();
      this.#handlers = [];
      this.#overrideHandler = null;
      this.#onRemoveOverrideHandler = null;

      const dispatch = {
        onUncaughtException: this.#onUncaughtException.bind(this),
        onUnhandledRejection: this.#onUnhandledRejection.bind(this),
        onRejectionHandled: this.#onRejectionHandled.bind(this)
      };

      if (
        global.process &&
        global.process.listeners &&
        j$.private.isFunction(global.process.on)
      ) {
        this.#adapter = new NodeAdapter(global, dispatch);
      } else {
        this.#adapter = new BrowserAdapter(global, dispatch);
      }
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

    reportUnhandledRejections() {
      for (const {
        reason,
        event
      } of this.#pendingUnhandledRejections.values()) {
        this.#dispatchError(reason, event);
      }

      this.#pendingUnhandledRejections.clear();
    }

    // Either error or event may be undefined
    #onUncaughtException(error, event) {
      this.#dispatchError(error, event);
    }

    // event or promise may be undefined
    // event is passed through for backwards compatibility reasons. It's probably
    // unnecessary, but user code could depend on it.
    #onUnhandledRejection(reason, promise, event) {
      if (this.#detectLateRejectionHandling() && promise) {
        this.#pendingUnhandledRejections.set(promise, { reason, event });
      } else {
        this.#dispatchError(reason, event);
      }
    }

    #detectLateRejectionHandling() {
      return this.#getConfig().detectLateRejectionHandling;
    }

    #onRejectionHandled(promise) {
      this.#pendingUnhandledRejections.delete(promise);
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
    #dispatch;
    #onError;
    #onUnhandledRejection;
    #onRejectionHandled;

    constructor(global, dispatch) {
      this.#global = global;
      this.#dispatch = dispatch;
      this.#onError = event => dispatch.onUncaughtException(event.error, event);
      this.#onUnhandledRejection = this.#unhandledRejectionHandler.bind(this);
      this.#onRejectionHandled = this.#rejectionHandledHandler.bind(this);
    }

    install() {
      this.#global.addEventListener('error', this.#onError);
      this.#global.addEventListener(
        'unhandledrejection',
        this.#onUnhandledRejection
      );
      this.#global.addEventListener(
        'rejectionhandled',
        this.#onRejectionHandled
      );
    }

    uninstall() {
      this.#global.removeEventListener('error', this.#onError);
      this.#global.removeEventListener(
        'unhandledrejection',
        this.#onUnhandledRejection
      );
      this.#global.removeEventListener(
        'rejectionhandled',
        this.#onRejectionHandled
      );
    }

    #unhandledRejectionHandler(event) {
      const jasmineMessage = 'Unhandled promise rejection: ' + event.reason;
      let reason;

      if (j$.private.isError(event.reason)) {
        reason = event.reason;
        reason.jasmineMessage = jasmineMessage;
      } else {
        reason = jasmineMessage;
      }

      this.#dispatch.onUnhandledRejection(reason, event.promise, event);
    }

    #rejectionHandledHandler(event) {
      this.#dispatch.onRejectionHandled(event.promise);
    }
  }

  class NodeAdapter {
    #global;
    #dispatch;
    #originalHandlers;
    #jasmineHandlers;

    constructor(global, dispatch) {
      this.#global = global;
      this.#dispatch = dispatch;

      this.#jasmineHandlers = {};
      this.#originalHandlers = {};

      this.onError = this.onError.bind(this);
      this.onUnhandledRejection = this.onUnhandledRejection.bind(this);
    }

    install() {
      this.#installHandler('uncaughtException', this.onError);
      this.#installHandler('unhandledRejection', this.onUnhandledRejection);
      this.#installHandler(
        'rejectionHandled',
        this.#dispatch.onRejectionHandled
      );
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

    #augmentError(error, isUnhandledRejection) {
      let jasmineMessagePrefix;

      if (isUnhandledRejection) {
        jasmineMessagePrefix = 'Unhandled promise rejection';
      } else {
        jasmineMessagePrefix = 'Uncaught exception';
      }

      if (j$.private.isError(error)) {
        error.jasmineMessage = jasmineMessagePrefix + ': ' + error;
        return error;
      } else {
        let substituteMsg;

        if (error) {
          substituteMsg = jasmineMessagePrefix + ': ' + error;
        } else {
          substituteMsg = jasmineMessagePrefix + ' with no error or message';
        }

        if (isUnhandledRejection) {
          substituteMsg +=
            '\n' +
            '(Tip: to get a useful stack trace, use ' +
            'Promise.reject(n' +
            'ew Error(...)) instead of Promise.reject(' +
            (error ? '...' : '') +
            ').)';
        }

        return new Error(substituteMsg);
      }
    }

    onError(error) {
      error = this.#augmentError(error, false);
      this.#dispatch.onUncaughtException(error);
    }

    onUnhandledRejection(reason, promise) {
      reason = this.#augmentError(reason, true);
      this.#dispatch.onUnhandledRejection(reason, promise);
    }
  }

  return GlobalErrors;
};
