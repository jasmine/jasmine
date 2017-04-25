getJasmineRequireObj().clearStack = function(j$) {
  function messageChannelImpl(global) {
    var channel = new global.MessageChannel(),
        head = {},
        tail = head;

    channel.port1.onmessage = function() {
      head = head.next;
      var task = head.task;
      delete head.task;
      task();
    };

    return function clearStack(fn) {
      tail = tail.next = { task: fn };
      channel.port2.postMessage(0);
    };
  }

  function getClearStack(global) {
    if (j$.isFunction_(global.setImmediate)) {
      var realSetImmediate = global.setImmediate;
      return function(fn) {
        realSetImmediate(fn);
      };
    } else if (!j$.util.isUndefined(global.MessageChannel)) {
      return messageChannelImpl(global);
    } else {
      var realSetTimeout = global.setTimeout;
      return function clearStack(fn) {
        Function.prototype.apply.apply(realSetTimeout, [global, [fn, 0]]);
      };
    }
  }

  return getClearStack;
};
