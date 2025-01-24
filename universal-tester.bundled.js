(function (factory) {
  const mod = factory();
  if (typeof window !== 'undefined') {
    window["ensure"] = mod;
  }
  if (typeof global !== 'undefined') {
    global["ensure"] = mod;
  }
  if (typeof module !== 'undefined') {
    module.exports = mod;
  }
})(function () {
  const ensure = function (source) {
    return new Ensurement(source);
  };
  class Ensurement {
    constructor(source) {
      if(typeof source !== "object") {
        throw new Error("Ensurement only accepts 1 object");
      }
      const sourceKeys = Object.keys(source);
      if(sourceKeys.length !== 1) {
        throw new Error("Ensurement only accepts 1 object with 1 property");
      }
      const id = sourceKeys[0];
      this.$subjectId = id;
      this.$subject = source[id];
      this.$operation = undefined;
      this.$objectation = undefined;
      this.$can = undefined;
      this.$cant = undefined;
      this.$is = undefined;
      this.$isnt = undefined;
      this.$throws = undefined;
      this.$doesntThrow = undefined;
    }
    type(value) {
      return this.$resolveOperation("type", value);
    }
    notType(value) {
      return this.$resolveOperation("notType", value);
    }
    is(is) {
      return this.$resolveOperation("is", is);
    }
    isnt(isnt) {
      return this.$resolveOperation("isnt", isnt);
    }
    can(can) {
      return this.$resolveOperation("can", can);
    }
    cant(cant) {
      return this.$resolveOperation("cant", cant);
    }
    throws(throws) {
      return this.$resolveOperation("throws", throws);
    }
    doesntThrow(doesntThrow) {
      return this.$resolveOperation("doesntThrow", doesntThrow);
    }
    $throwError() {
      throw new Error("could not ensure «" + this.$subjectId + " " + this.$operation + " " + this.$objectation + "»");
    }
    $resolveOperation(op, objectation) {
      this.$operation = op;
      this.$objectation = objectation;
      if (op === "type") {
        if(typeof this.$subject !== objectation) {
          this.$throwError();
        }
      } else if (op === "notType") {
        if (typeof this.$subject === objectation) {
          this.$throwError();
        }
      } else if (op === "is") {
        if (this.$subject !== objectation) {
          this.$throwError();
        }
      } else if (op === "isnt") {
        if (this.$subject === objectation) {
          this.$throwError();
        }
      } else if (op === "can") {
        if (!objectation(this.$subject)) {
          this.$throwError();
        }
      } else if (op === "cant") {
        if (objectation(this.$subject)) {
          this.$throwError();
        }
      } else if (op === "throws") {
        try {
          objectation(this.$subject);
          this.$throwError();
        } catch (error) { }
      } else if (op === "doesntThrow") {
        try {
          objectation(this.$subject);
        } catch (error) {
          this.$throwError();
        }
      } else {
        throw new Error("Ensure operation not admited: " + op);
      }
      return this;
    }
  }
  return ensure;
});


(function (factory) {
  const mod = factory();
  if (typeof window !== 'undefined') {
    window['UniversalTester'] = mod;
    window['describe'] = mod.describe;
  }
  if (typeof global !== 'undefined') {
    global['UniversalTester'] = mod;
    global['describe'] = mod.describe;
  }
  if (typeof module !== 'undefined') {
    module.exports = mod;
  }
})(function () {

  const runQueue = async function(queue) {
      for (const test of queue) {
          await test();
      }
  }

  const describe = function(description, callback) {
      const queue = [];
      const state = { onlyExists: false };

      const it = (label, fn, type = "normal") => {
          queue.push(async () => {
              if (type === "never") return; // Nunca ejecutar "never"
              if (state.onlyExists && type !== "only" && type !== "always") return; // Prioridad de only/always

              console.log(`Running: ${label} (${type})`);

              let timeoutId;
              const context = {
                  timeout(ms) {
                      return new Promise((_, reject) => {
                          timeoutId = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
                      });
                  }
              };

              try {
                  await fn.call(context);
              } catch (err) {
                  console.error(err.message);
              } finally {
                  clearTimeout(timeoutId); // Limpiar el timeout al finalizar
              }
          });

          if (type === "only") state.onlyExists = true;
      };

      it.always = (label, fn) => it(label, fn, "always");
      it.never = (label, fn) => it(label, fn, "never");
      it.normally = (label, fn) => it(label, fn, "normal");
      it.only = (label, fn) => it(label, fn, "only");

      const context = { it };
      callback.call(context, context.it);

      runQueue(queue).then(() => console.log(`Finished describe: ${description}`));
  }

  return { describe };
  
});
