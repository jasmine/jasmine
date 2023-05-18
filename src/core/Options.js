getJasmineRequireObj().options = function() {
  const options = {};

  options.CONSTANTS = {
    PARAMETERS_VALUES: 'parametersValues',
    REPEAT: 'repeat',
    ENABLE_IF: 'enableIf'
  };

  const ARGS = new Object();

  ARGS[options.CONSTANTS.ENABLE_IF] = {};

  ARGS[options.CONSTANTS.REPEAT] = {
    unifiedTest: {
      type: 'boolean',
      fn: function(args, repeatNumber) {
        let fns = [];
        for (let index = 0; index < args.unitTests.length; index++) {
          fns.push(args.unitTests[index].fn.bind({}));
        }

        let fn = () => {
          for (let fnIndex = 0; fnIndex < fns.length; fnIndex++) {
            let newFn = fns[fnIndex];
            for (let index = 0; index < repeatNumber; index++) {
              newFn();
            }
          }
        };

        let unitTest = args.unitTests[0];
        unitTest.fn = fn;
        unitTest.stopOnFailure = true;
        args.unitTests = [];
        args.unitTests.push(unitTest);

        return args.unitTests;
      }
    }
  };

  ARGS[options.CONSTANTS.PARAMETERS_VALUES] = {
    transposed: {
      type: 'boolean',
      fn: function(executionsArray) {
        if (executionsArray.length == 0) {
          return executionsArray;
        }
        return executionsArray[0].map((_, colIndex) =>
          executionsArray.map(row => row[colIndex])
        );
      }
    }
  };

  options[options.CONSTANTS.ENABLE_IF] = function(optionMap, args) {
    let optionKey = options.CONSTANTS.ENABLE_IF;
    validateObject(optionMap, optionKey);
    validateArgs(optionMap, optionKey);

    let value = getValue(optionMap, optionKey, isBoolean);

    let excludedMsg = value
      ? undefined
      : `test skipped by the condition in option ${optionKey}`;

    if (args.unitTests.length == 0) {
      args.unitTests.push({
        description: args.originalValues.description,
        timeout: args.originalValues.timeout,
        filename: args.originalValues.filename,
        fn: args.originalValues.fn,
        excludedMsg: excludedMsg
      });
    } else {
      for (let index = 0; index < args.unitTests.length; index++) {
        args.unitTests[index].excludedMsg = excludedMsg;
      }
    }

    return args.unitTests;
  };

  options[options.CONSTANTS.REPEAT] = function(optionMap, args) {
    let optionKey = options.CONSTANTS.REPEAT;
    validateObject(optionMap, optionKey);
    validateArgs(optionMap, optionKey);

    let repeatNumber = getValue(optionMap, optionKey, isInt);

    if (args.unitTests.length == 0) {
      args.unitTests.push({
        description: args.originalValues.description,
        timeout: args.originalValues.timeout,
        filename: args.originalValues.filename,
        fn: args.originalValues.fn,
        excludeMsg: undefined
      });
    }

    if (repeatNumber > 1) {
      if (
        'args' in optionMap &&
        'unifiedTest' in optionMap.args &&
        optionMap.args.unifiedTest
      ) {
        args.unitTests = ARGS[options.CONSTANTS.REPEAT].unifiedTest.fn(
          args,
          repeatNumber
        );
      } else {
        let newUnitTests = [];
        for (let index = 0; index < args.unitTests.length; index++) {
          let unitTest = args.unitTests[index];
          for (let index = 1; index < repeatNumber; index++) {
            newUnitTests.push({
              description: unitTest.description,
              timeout: unitTest.timeout,
              filename: unitTest.filename,
              fn: unitTest.fn,
              excludeMsg: unitTest.excludeMsg
            });
          }
        }

        args.unitTests.push(...newUnitTests);
      }
    }

    return args.unitTests;
  };

  options[options.CONSTANTS.PARAMETERS_VALUES] = function(optionMap, args) {
    let optionKey = options.CONSTANTS.PARAMETERS_VALUES;
    validateObject(optionMap, optionKey);
    validateArgs(optionMap, optionKey);

    let executionsArray = getValue(optionMap, optionKey, is2dArray);

    if (
      'args' in optionMap &&
      'transposed' in optionMap.args &&
      optionMap.args.transposed
    ) {
      executionsArray = ARGS[options.CONSTANTS.PARAMETERS_VALUES].transposed.fn(
        executionsArray
      );
    }

    for (let index = 0; index < executionsArray.length; index++) {
      let executionArray = executionsArray[index];
      args.unitTests.push({
        description: args.originalValues.description,
        timeout: args.originalValues.timeout,
        filename: args.originalValues.filename,
        fn: () => {
          args.originalValues.fn.apply(null, executionArray);
        },
        excludeMsg: undefined
      });
    }

    return args.unitTests;
  };

  options.checkKeys = function(keys) {
    for (let index = 0; index < keys.length; index++) {
      if (!(keys[index] in options)) {
        throw new Error(`unknown key in options: ${keys[index]}.`);
      }
    }
  };

  options.haveParametersValuesKey = function(keys) {
    return keys.includes(options.CONSTANTS.PARAMETERS_VALUES);
  };

  options.sortKeys = function(keys) {
    let returnList = [];
    let optionKeys = Object.keys(options.CONSTANTS);
    for (let index = 0; index < optionKeys.length; index++) {
      if (keys.includes(options.CONSTANTS[optionKeys[index]])) {
        returnList.push(options.CONSTANTS[optionKeys[index]]);
      }
    }

    return returnList;
  };

  // https://stackoverflow.com/a/14794066/3723543
  function isInt(value) {
    if (isNaN(value)) {
      return false;
    }
    let x = parseFloat(value);
    return (x | 0) === x;
  }

  function getValue(optionMap, optionKey, typeCheckFn) {
    let value = optionMap.value;
    let error = !typeCheckFn(value);
    if (error) {
      if (value instanceof Object && !(value instanceof Function)) {
        let fn = value.fn;
        let args = value.args;
        value = fn.apply(null, args);
      } else if (value instanceof Function) {
        value = value();
      }
      error = !typeCheckFn(value);
    }

    if (error) {
      throw new Error(
        `type error for "value" key on option ${optionKey}. ` +
          `value -> ${value}`
      );
    }

    return value;
  }

  function isBoolean(value) {
    return typeof value == 'boolean';
  }

  function is2dArray(value) {
    let error = !(value instanceof Array);
    if (!error) {
      let size = 0;
      for (let index = 0; index < value.length && !error; index++) {
        if (!error && size != 0 && value[index].length != size) {
          error = true;
        }

        size = value[index].length;
      }
      if (size == 0) {
        error = true;
      }
    }

    return !error;
  }

  function validateObject(object, optionKey) {
    let error = !(object instanceof Object) || !('value' in object);
    if (
      !error &&
      object.value instanceof Object &&
      !(object.value instanceof Function) &&
      !(object.value instanceof Array)
    ) {
      error = !('fn' in object.value) || !('args' in object.value);
      if (
        !error &&
        (!(object.value.fn instanceof Function) ||
          !(object.value.args instanceof Array))
      ) {
        error = true;
      }
    }

    if (error) {
      throw new Error(`The option ${optionKey} is invalid.`);
    }
  }

  function getAllArgs(optionsKey) {
    return ARGS[optionsKey];
  }

  function validateArgs(object, optionKey) {
    if (!('args' in object)) {
      return;
    }

    let error = !(object.args instanceof Object);

    if (!error) {
      let possibleArgs = getAllArgs(optionKey);
      let currentArgs = object.args;

      let keys = Object.keys(possibleArgs);
      for (let index = 0; index < keys.length && !error; index++) {
        if (keys[index] in currentArgs) {
          let argRealType = possibleArgs[keys[index]].type;
          let argType = currentArgs[keys[index]];
          error = typeof argType != argRealType;
        }
      }
    }

    if (error) {
      throw new Error(`The args of option ${optionKey} is invalid`);
    }
  }

  options.getOptionsProcessor = function(optionsObject, j$) {
    let instance = new Object();

    instance.args = optionsObject;

    instance.j$ = j$;

    instance.execute = function() {
      if (this.args.originalValues.options == undefined) {
        throw new Error('options argument cannot be undefined');
      }

      // check options map
      let optionKeys = Object.keys(this.args.originalValues.options);
      this.j$.options.checkKeys(optionKeys);

      // reorder option keys
      optionKeys = this.j$.options.sortKeys(optionKeys);
      // execute each option
      for (let index = 0; index < optionKeys.length; index++) {
        this.args.unitTests = this.j$.options[optionKeys[index]](
          this.args.originalValues.options[optionKeys[index]],
          this.args
        );
      }

      return this.args.unitTests;
    };

    return instance;
  };

  return options;
};
