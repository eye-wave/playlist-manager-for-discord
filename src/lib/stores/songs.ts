export type SongEntry = {
  authorId: string
  date: number
  title: string
  url: string
}

function createSongStore() {
  const urls = new Set<string>()
  const songs = new Map<string, SongEntry>()
  const cache = new Map<string, SongEntry>()

  return {
    get newSongs() {
      return [...songs.values()]
    },
    get newSongsCount() {
      return songs.size
    },
    get allSongs() {
      return [...cache.values(), ...songs.values()]
    },

    has(url: string) {
      return urls.has(url)
    },

    add(song: SongEntry) {
      if (urls.has(song.url)) return this

      urls.add(song.url)
      songs.set(song.url, song)

      return this
    },
    addFromCache(song: SongEntry) {
      if (urls.has(song.url)) return this

      urls.add(song.url)
      cache.set(song.url, song)
      songs.delete(song.url)

      return this
    },
  }
}

export const songsStore = createSongStore()
export const otherSongsStore = createSongStore()
