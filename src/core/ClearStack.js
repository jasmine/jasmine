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
    if (global && global.process && j$.isFunction_(global.process.nextTick)) {
      return global.process.nextTick;
    } else if (j$.isFunction_(global.setImmediate)) {
      return global.setImmediate;
    } else if (!j$.util.isUndefined(global.MessageChannel)) {
      return messageChannelImpl(global);
    } else if (j$.isFunction_(global.setTimeout)) {
      var realSetTimeout = global.setTimeout;
      return function clearStack(fn) {
        realSetTimeout(fn, 0);
      }
    }
  }

  return getClearStack;
};
