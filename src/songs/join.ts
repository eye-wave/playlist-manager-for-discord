import type { SongEntry } from "src/lib/stores/songs"
import { userStore, type User } from "src/lib/stores/users"

export type SongEntryWithUser = { author: User | null } & Omit<SongEntry, "authorId">

export function joinSongWithUsers(songs: SongEntry[]) {
  return songs.map(song => {
    return {
      author: userStore.getUser(song.authorId) || null,
      date: song.date,
      title: song.title,
      url: song.url,
    }
  }) as SongEntryWithUser[]
}
