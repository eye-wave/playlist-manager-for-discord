export function argsInclude<T extends string>(flag: `--${T}`, shortFlag?: `-${T}`) {
  const [, , ...flags] = process.argv

  if (flags.includes(flag)) return true
  if (shortFlag && flags.includes(shortFlag)) return true
  return false
}

export function getValueFromArgs<T extends string>(flag: `--${T}`, shortFlag?: `-${T}`): unknown {
  const [, , ...flags] = process.argv

  if (flags.includes(flag)) {
    const value = flags.at(flags.indexOf(flag) + 1)
    return value?.startsWith("-") ? undefined : value
  }

  if (shortFlag && flags.includes(shortFlag)) {
    const value = flags.at(flags.indexOf(shortFlag) + 1)
    return value?.startsWith("-") ? undefined : value
  }

  return undefined
}
