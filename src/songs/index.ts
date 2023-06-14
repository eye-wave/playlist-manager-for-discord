import "dotenv/config"
import path from "node:path"
import { SongEntry, otherSongsStore, songsStore } from "src/lib/stores/songs"
import { User, userStore } from "src/lib/stores/users"
import { getBotId } from "../lib/discord"
import { CSV_PATH, GIST_PATH } from "../lib/paths"
import { loadCsv, saveCsv } from "./csv"
import { addToPlaylist, autoCleanPlaylist, getGoogleAuthToken, listPlaylistItems } from "./google"
import { getNewSongs } from "./messages"

export async function syncSongs(messageLimit = 100, offline = false, autoclean = false) {
  const songFile = process.env.EXPORT_FILE as string
  if (!songFile) throw new Error("No export file provided")

  const [oldSongs, oldOtherSongs, oldUsers] = await Promise.all([
    loadCsv(path.join(CSV_PATH, "download.csv")) as unknown as SongEntry[],
    loadCsv(path.join(CSV_PATH, "download_other.csv")) as unknown as SongEntry[],
    loadCsv(path.join(CSV_PATH, "users.csv")) as unknown as User[],
  ])

  oldUsers.forEach(user => userStore.addFromCache(user))
  oldSongs.forEach(song => songsStore.addFromCache(song))
  oldOtherSongs.forEach(song => otherSongsStore.addFromCache(song))

  await getNewSongs(messageLimit)

  if (songsStore.newSongsCount > 0 && offline) {
    const authClient = await getGoogleAuthToken()
    const botId = await getBotId()

    if (botId) userStore.add(botId)

    const fetchedSongsYoutube = await listPlaylistItems(authClient)
    fetchedSongsYoutube.forEach(s => {
      const url = `https://www.youtube.com/watch?v=${s.videoId}`
      const song = songsStore.allSongs.filter(s => s.url === url)?.[0] || {
        authorId: botId,
        date: -1,
        title: s.title,
        url,
      }

      songsStore.addFromCache(song)
    })

    await Promise.all([
      addToPlaylist(authClient, songsStore.newSongs),
      autoclean && autoCleanPlaylist(authClient, fetchedSongsYoutube),
    ])
  }

  if (!userStore.allFetched) await userStore.fetch()

  await Promise.all([
    saveCsv(path.join(CSV_PATH, "download.csv"), songsStore.allSongs),
    saveCsv(path.join(CSV_PATH, "download_other.csv"), otherSongsStore.allSongs),
    saveCsv(path.join(CSV_PATH, "users.csv"), userStore.users),
    saveCsv(
      path.join(GIST_PATH, songFile),
      songsStore.allSongs
        .concat(otherSongsStore.allSongs)
        .map(song => {
          return {
            author: userStore.getUser(song.authorId)?.name || null,
            title: song.title,
            url: song.url,
          }
        })
        .sort(
          (a, b) => a.author?.localeCompare(b?.author || "") || a.title.localeCompare(b.title) || a.url.localeCompare(b.url),
        ),
    ),
  ])
}
