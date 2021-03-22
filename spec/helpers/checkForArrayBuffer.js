/* eslint-disable compat/compat */
(function(env) {
  function hasFunctioningArrayBuffers() {
    if (typeof ArrayBuffer === 'undefined') {
      return false;
    }

    try {
      var buffer = new ArrayBuffer(2);
      var view8bit = new Uint8Array(buffer);
      var view16bit = new Uint16Array(buffer);
      view16bit[0] = 0xabcd;
      return view8bit[0] === 0xcd && view8bit[1] === 0xab;
    } catch (e) {
      return false;
    }
  }

  env.requireFunctioningArrayBuffers = function() {
    env.requireFunctioningTypedArrays();
    if (!hasFunctioningArrayBuffers()) {
      env.pending('Browser has incomplete or missing support for ArrayBuffer');
    }
  };
})(jasmine.getEnv());
