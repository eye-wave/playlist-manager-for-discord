import type { SongEntry } from "./stores/songs"
import { userStore, type User } from "./stores/users"

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
