import { discordLaunchDate } from "src/lib/discord"
import type { SongEntry } from "src/lib/stores/songs"
import { userStore } from "src/lib/stores/users"
import { days, getMinMaxDates, getMonthsBetweenDates, months, reduceTime } from "./date"

export type UserWithCount = ReturnType<typeof songsByUser>[number]
export function songsByUser(song: SongEntry[]) {
  const userCounts = song
    .filter(song => song.date > discordLaunchDate)
    .reduce((acc, song) => ({ ...acc, [song.authorId]: (acc[song.authorId] || 0) + 1 }), {} as { [key: string]: number })

  return Object.entries(userCounts).map(([id, count]) => {
    const user = userStore.getUser(id)
    return { user, count }
  })
}

export type SongsByUserAndTime = ReturnType<typeof songByUserTime>[number]
export function songByUserTime(input: SongEntry[]) {
  const songs = input.filter(song => song.date > discordLaunchDate)

  const [minTime, maxTime] = getMinMaxDates(songs.map(song => song.date))
  const numberOfmonths = getMonthsBetweenDates(minTime, maxTime)

  const minDate = reduceTime(minTime)
  // Map < number - Timestamp, Map < string - UserId, number - Count >>
  const songsByTime = new Map<number, Map<string, number>>(
    Array.from({ length: numberOfmonths }).map((_, i) => {
      const time = reduceTime(minDate + months * i + days * 3)
      return [time, new Map()]
    }),
  )

  songs.forEach(song => {
    const time = reduceTime(song.date)
    const map = songsByTime.get(time) || new Map<string, number>()

    const userId = song.authorId
    map.set(userId, (map.get(userId) || 0) + 1)
  })

  // Map < string - UserId, { ... }[] >
  const userMap = new Map<string, { timestamp: number; value: number }[]>()

  songsByTime.forEach((map, timestamp) => {
    map.forEach((count, user) => {
      const list = userMap.get(user) || [...songsByTime.keys()].map(timestamp => ({ timestamp, value: 0 }))
      const [item] = list.filter(i => i.timestamp === timestamp)

      if (!item) return
      item.value = count

      userMap.set(user, list)
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [...userMap.entries()].map(([id, list]) => ({ user: userStore.getUser(id)!, list, minTime, maxTime }))
}
