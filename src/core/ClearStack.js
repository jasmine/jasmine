getJasmineRequireObj().clearStack = function(j$) {
  const maxInlineCallCount = 10;

  function browserQueueMicrotaskImpl(global) {
    const unclampedSetTimeout = getUnclampedSetTimeout(global);
    const { queueMicrotask } = global;
    let currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        queueMicrotask(fn);
      } else {
        currentCallCount = 0;
        unclampedSetTimeout(fn);
      }
    };
  }

  function nodeQueueMicrotaskImpl(global) {
    const { queueMicrotask } = global;

    return function(fn) {
      queueMicrotask(fn);
    };
  }

  function messageChannelImpl(global) {
    const { setTimeout } = global;
    const postMessage = getPostMessage(global);

    let currentCallCount = 0;
    return function clearStack(fn) {
      currentCallCount++;

      if (currentCallCount < maxInlineCallCount) {
        postMessage(fn);
      } else {
        currentCallCount = 0;
        setTimeout(fn);
      }
    };
  }

  function getUnclampedSetTimeout(global) {
    const { setTimeout } = global;
    if (j$.util.isUndefined(global.MessageChannel)) {
      return setTimeout;
    }

    const postMessage = getPostMessage(global);
    return function unclampedSetTimeout(fn) {
      postMessage(function() {
        setTimeout(fn);
      });
    };
  }

  function getPostMessage(global) {
    const { MessageChannel, setTimeout } = global;
    const channel = new MessageChannel();
    let head = {};
    let tail = head;

    let taskRunning = false;
    channel.port1.onmessage = function() {
      head = head.next;
      const task = head.task;
      delete head.task;

      if (taskRunning) {
        setTimeout(task, 0);
      } else {
        try {
          taskRunning = true;
          task();
        } finally {
          taskRunning = false;
        }
      }
    };

    return function postMessage(fn) {
      tail = tail.next = { task: fn };
      channel.port2.postMessage(0);
    };
  }

  function getClearStack(global) {
    const NODE_JS =
      global.process &&
      global.process.versions &&
      typeof global.process.versions.node === 'string';

    // Windows builds of WebKit have a fairly generic user agent string when no application name is provided:
    // e.g. "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    const SAFARI_OR_WIN_WEBKIT =
      global.navigator &&
      /(^((?!chrome|android).)*safari)|(Win64; x64\) AppleWebKit\/[0-9.]+ \(KHTML, like Gecko\)$)/i.test(
        global.navigator.userAgent
      );

    if (NODE_JS) {
      // Unlike browsers, Node doesn't require us to do a periodic setTimeout
      // so we avoid the overhead.
      return nodeQueueMicrotaskImpl(global);
    } else if (
      SAFARI_OR_WIN_WEBKIT ||
      j$.util.isUndefined(global.MessageChannel) /* tests */
    ) {
      // queueMicrotask is dramatically faster than MessageChannel in Safari
      // and other WebKit-based browsers, such as the one distributed by Playwright
      // to test Safari-like behavior on Windows.
      // Some of our own integration tests provide a mock queueMicrotask in all
      // environments because it's simpler to mock than MessageChannel.
      return browserQueueMicrotaskImpl(global);
    } else {
      // MessageChannel is faster than queueMicrotask in supported browsers
      // other than Safari.
      return messageChannelImpl(global);
    }
  }

  return getClearStack;
};
