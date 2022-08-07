//异步转同步
export function cb2promise(fn) {
  function getArgs(argsObj) {
    return Array.prototype.slice.call(argsObj)
  }
  let args = getArgs(arguments)
  let restArgs = args.slice(1)

  function createCallback(resolve, reject) {
    return function (firstArg) {
      if (firstArg && firstArg instanceof Error) return reject(firstArg)

      let args = getArgs(arguments)
      return resolve.apply(null, args)
    }
  }

  const promise = new Promise((resolve, reject) => {
    const cb = createCallback(resolve, reject)
    restArgs.push(cb)
    fn.apply(null, restArgs)
  })

  return promise
}
