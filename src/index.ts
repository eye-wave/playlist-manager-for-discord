import "dotenv/config"
import { argsInclude } from "./lib/args"
import { loadCsv, saveCsv } from "./lib/csv"
import { getBotId } from "./lib/discord"
import { commitChanges } from "./lib/git"
import { addToPlaylist, autoCleanPlaylist, getGoogleAuthToken, listPlaylistItems } from "./lib/google"
import { getNewSongs } from "./lib/messages"
import { SongEntry, otherSongsStore, songsStore } from "./lib/stores/songs"
import { User, userStore } from "./lib/stores/users"

export async function syncSongs( messageLimit =100 ) {

  const songFile =process.env.EXPORT_FILE as string
  if ( !songFile ) throw new Error("No export file provided")

  const [ oldUsers, oldSongs, oldOtherSongs ] =await Promise.all([
    loadCsv("./download/users.csv") as unknown as User[],
    loadCsv("./download/download.csv") as unknown as SongEntry[],
    loadCsv("./download/download_other.csv") as unknown as SongEntry[],
  ])

  oldUsers.forEach(user => userStore.addFromCache(user))
  oldSongs.forEach(song => songsStore.addFromCache(song))
  oldOtherSongs.forEach(song => otherSongsStore.addFromCache(song))

  await getNewSongs( messageLimit )
  
  if ( songsStore.newSongsCount > 0  && !argsInclude("--offline","-o") ) {
    const authClient =await getGoogleAuthToken()
    const botId =await getBotId()
    
    if ( botId ) userStore.add( botId )

    const fetchedSongsYoutube =await listPlaylistItems( authClient )
    fetchedSongsYoutube.forEach(s => {
      const url =`https://www.youtube.com/watch?v=${s.videoId}`
      const song =songsStore.allSongs.filter(s => s.url === url)?.[0] || {
        authorId: botId,
        date: -1,
        title: s.title,
        url
      }

      songsStore.addFromCache( song )
    })

    await Promise.all([
      addToPlaylist( authClient,songsStore.newSongs ),
      argsInclude("--autoclean","-a") && autoCleanPlaylist( authClient, fetchedSongsYoutube ),
    ])

  }
    
  if ( !userStore.allFetched ) await userStore.fetch()

  await Promise.all([
    saveCsv("./download/download.csv",songsStore.allSongs),
    saveCsv("./download/download_other.csv",otherSongsStore.allSongs),
    saveCsv("./download/users.csv",userStore.users),
    saveCsv(`./download/${songFile}`,songsStore.allSongs.concat(otherSongsStore.allSongs)
      .map(song => {
        return {
          author: userStore.getUser( song.authorId )?.name || null,
          title: song.title,
          url: song.url
        }
      })
      .sort((a,b) => 
        a.author?.localeCompare(b?.author || "") ||
        a.title.localeCompare(b.title) ||
        a.url.localeCompare(b.url)
      )
    )
  ])

  if ( argsInclude("--gist") ) await commitChanges(songFile)
}

