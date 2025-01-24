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
    const runQueue = async function (queue, errorHandler) {
        Iterating_tests:
        for (const test of queue) {
            try {
                await test();
            } catch (err) {
                if (errorHandler) {
                    try {
                        await errorHandler(err);
                    } catch (stopExecutionError) {
                        console.error("Execution halted due to:", stopExecutionError);
                        break Iterating_tests; // Interrumpir la ejecución de la cola
                    }
                } else {
                    console.error(err);
                }
            }
        }
    };
    const print = function (message, color = false) {
        if (typeof global !== "undefined") {
            if (color === "green") {
                console.log(`\x1b[32m${message}\x1b[0m`);
            } else if (color === "red") {
                console.log(`\x1b[31m${message}\x1b[0m`);
            } else {
                console.log(message);
            }
        } else {
            console.log(message);
        }
    };

    const describe = function (description, callback) {
        const queue = [];
        const state = { finished: false, onError: null, tests: {}, onlyActivated: false };
        const getStateReport = function (last = 0, nonStringified = false) {
            if (!last) {
                let report = "";
                report = JSON.stringify(state, null, 2);
                return report;
            } else {
                let report = "";
                state.passed = Object.keys(state.tests).filter(label => state.tests[label].state === "passed");
                state.failed = Object.keys(state.tests).filter(label => state.tests[label].state === "failed");
                if (nonStringified) {
                    return state;
                }
                report = JSON.stringify(state, null, 2);
                return report;
            }
        };
        const updateDOM = function () {
            Only_on_browsers:
            if (typeof window !== "undefined") {
                const matchedElements = Array.from(document.querySelectorAll("[data-test]")).filter(el => el.getAttribute("data-test") === description);
                if (matchedElements.length === 0) {
                    break Only_on_browsers;
                }
                const matchedElement = matchedElements[0];
                matchedElement.textContent = getStateReport(1);
            }
        };
        const updateUI = (is_on = "pass", force_on_nodejs = false, itModified = false, description = false) => {
            try {
                const is_starting_suite = is_on === "begin";
                const is_starting = is_on === "start";
                const is_passing = is_on === "pass";
                const is_failing = is_on === "fail";
                const is_finished = is_on === "finish";
                if (is_finished) {
                    state.finished = true;
                }
                On_both_browser_and_nodejs:
                if (itModified) {
                    const mark = itModified.state === "passed" ? "✔" : "✘";
                    if (mark === "✘") {
                        print(`  [${mark}] ${description} [${itModified.took_milliseconds}ms]`, "red");
                    } else {
                        print(`  [${mark}] ${description} [${itModified.took_milliseconds}ms]`, "green");
                    }
                } else if (is_finished) {
                    const r = getStateReport(1, 1);
                    if (r.failed.length) {
                        print(`[✘] Failed ${r.failed.length} check(s) on:`, "red");
                        r.failed.map((id, index) => {
                            return {
                                index: index + 1,
                                test: id,
                                error: r.tests[id].error
                            }
                        }).forEach(info => {
                            const { error, index } = info;
                            print(`  [✘] Fail ${index} on: «${info.test}» | ${error.name}: ${error.message}`, "red");
                            console.log(error);
                        });
                        console.log();
                    } else {
                        print(`[✔] All tests were passed successfully`, "green");
                    }
                } else if (is_starting_suite) {
                    print(`[!] Starting: ${description}`, "green");
                }
            } catch (error) {
                console.error(error);
            } finally {
                updateDOM();
            }
        };
        const startTest = (label) => {
            state.tests[label] = { state: "started", started_at: new Date() };
            return updateUI("start");
        };
        const passTest = (label, output) => {
            Object.assign(state.tests[label], { state: "passed", output, took_milliseconds: (new Date()) - state.tests[label].started_at });
            return updateUI("pass", 1, state.tests[label], label);
        };
        const failTest = (label, error) => {
            Object.assign(state.tests[label], { state: "failed", error, took_milliseconds: (new Date()) - state.tests[label].started_at });
            return updateUI("fail", 1, state.tests[label], label);
        };
        const it = (label, fn, type = "normal") => {
            queue.push(async () => {
                if (type === "never") return; // Nunca ejecutar "never"
                if (state.onlyActivated && type !== "only" && type !== "always") return; // Prioridad de only/always

                let timeoutId;
                const context = {
                    queue,
                    state,
                    timeout(ms) {
                        return new Promise((_, reject) => {
                            timeoutId = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
                        });
                    }
                };

                try {
                    startTest(label);
                    const result = await fn.call(context);
                    passTest(label, result);
                } catch (err) {
                    failTest(label, err);
                    throw err; // Re-lanzar el error para que runQueue lo capture
                } finally {
                    clearTimeout(timeoutId); // Limpiar el timeout al finalizar
                }
            });

            if (type === "only") state.onlyActivated = true;
        };

        it.always = (label, fn) => it(label, fn, "always");
        it.never = (label, fn) => it(label, fn, "never");
        it.normally = (label, fn) => it(label, fn, "normal");
        it.only = (label, fn) => it(label, fn, "only");

        it.onError = (callback) => {
            state.onError = (error) => {
                callback(error); // Configurar el manejador de errores
                return error;
            };
        };

        const context = { it };

        callback.call(context, context.it);
        updateUI("begin", 0, 0, description);

        return runQueue(queue, state.onError).finally(() => {
            updateUI("finish");
        });
    };

    return { describe };
});

