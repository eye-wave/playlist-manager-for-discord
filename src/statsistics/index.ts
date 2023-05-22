import { songsStore, type SongEntry } from "src/lib/stores/songs"
import { userStore, type User } from "src/lib/stores/users"
import { loadCsv } from "src/songs/csv"
import { songByUserTime, songsByUser } from "./lib/songsByUser"
import { createTimeGraph } from "./timeGraph"
import { createUserChart } from "./userGraph"

export async function renderStatistics() {
  const [oldUsers, oldSongs, oldOtherSongs] = await Promise.all([
    loadCsv("./download/users.csv") as unknown as User[],
    loadCsv("./download/download.csv") as unknown as SongEntry[],
    loadCsv("./download/download_other.csv") as unknown as SongEntry[],
  ])

  oldUsers.forEach(user => userStore.addFromCache(user))
  oldSongs.forEach(song => songsStore.addFromCache(song))
  oldOtherSongs.forEach(song => songsStore.addFromCache(song))

  const songs = songsStore.allSongs

  const userData = songsByUser(songs)
  const timeData = songByUserTime(songs)

  await Promise.all([createUserChart(userData), createTimeGraph(timeData)])
}
