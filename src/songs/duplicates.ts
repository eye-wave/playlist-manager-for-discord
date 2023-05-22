export function listDuplicates<T extends { [key: string]: unknown }>(arr: T[], prop: keyof T) {
  const map = new Map<string, number>()
  const results = new Map<string, T[]>()

  arr.forEach(item => {
    const id = String(item[prop])

    const count = (map.get(id) || 0) + 1
    map.set(id, count)

    if (count > 1) results.set(id, [...(results.get(id) ?? []), { ...item }])
  })

  return Array.from(results)
    .map(([, item]) => item)
    .flat()
}
