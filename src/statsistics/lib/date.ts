export const seconds = 1000
export const minutes = seconds * 60
export const hours = minutes * 60
export const days = hours * 24
export const months = days * 30.44

export function getMinMaxDates(dates: number[]) {
  if (dates.length < 1) return [0, 0]
  return [Math.min(...dates), Math.max(...dates)]
}

export function getMonthsBetweenDates(...dates: number[]) {
  const min = Math.min(...dates)
  const max = Math.max(...dates)

  return Math.ceil((max - min) / months) + 1
}

export function reduceTime(input: number) {
  const date = new Date(input)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()

  return Date.UTC(year, month, 1)
}
