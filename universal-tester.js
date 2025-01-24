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