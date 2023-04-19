import "dotenv/config"
import type { GaxiosResponse } from "gaxios"
import type { OAuth2Client } from "google-auth-library"
import { google, type youtube_v3 } from "googleapis"
import http from "node:http"
import url from "node:url"
import open from "open"
import { listDuplicates } from "./duplicates"
import type { SongEntry } from "./stores/songs"

export type ShortSongEntry ={
  id: string,
  title: string,
  videoId: string
}

const CLIENT_ID =process.env.YOUTUBE_CLIENT_ID as string
const CLIENT_KEY =process.env.YOUTUBE_CLIENT_KEY as string
const REDIRECT_URL =process.env.YOUTUBE_REDIRECT_URL as string
const PLAYLIST_ID =process.env.YOUTUBE_PLAYLIST_ID as string
const PORT =+(REDIRECT_URL?.match(/(?<=:)\d+/)?.[0] || "") || 3000

if (!CLIENT_ID ) throw new Error("Missing CLIENT_ID")
if (!CLIENT_KEY ) throw new Error("Missing CLIENT_KEY")
if (!REDIRECT_URL ) throw new Error("Missing REDIRECT_URL")

export async function getGoogleAuthToken() {
  return new Promise<OAuth2Client>(resolve => {
    const oauth2client =new google.auth.OAuth2(CLIENT_ID,CLIENT_KEY,REDIRECT_URL)
    const authUrl =oauth2client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/youtube"],
      redirect_uri: REDIRECT_URL,
      client_id: CLIENT_ID
    })

    const server =http.createServer(async(req,res) => {
      const parsedUrl =url.parse(req.url || "")
      const params =new URLSearchParams(parsedUrl.query || "")
      const code =params.get("code")

      if ( !code ) return res.end()
      const { tokens } =await oauth2client.getToken(code)
      oauth2client.setCredentials(tokens)

      res.end("Success!")
      server.close()
      return resolve(oauth2client)
    })

    server.on("connect",socket => socket.destroy())

    server.listen(PORT)
    open(authUrl)
  })
}


export async function listPlaylistItems( client: OAuth2Client ) {
  const results:ShortSongEntry[] =[]

  let page:GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>
  let nextPageToken =""

  do {
    page =await google.youtube("v3").playlistItems.list({
      auth: client,
      part: ["snippet"],
      playlistId: PLAYLIST_ID,
      pageToken: nextPageToken,
      maxResults: 50
    })


    results.push(...page.data.items?.map(item => ({
      id: item.id ?? "",
      videoId: item.snippet?.resourceId?.videoId ?? "",
      title: item.snippet?.title ?? ""
    })).filter(i => i.title !== "Deleted video") ?? [])

    nextPageToken =page.data.nextPageToken ?? ""
  }
  while ( nextPageToken )

  return results
}

export async function autoCleanPlaylist( client:OAuth2Client, fetchedSongs?:ShortSongEntry[] ) {
  const list =await (fetchedSongs ?? listPlaylistItems( client ))
  const duplicated =listDuplicates(list,"videoId")

  duplicated.length > 0 && console.log(`Found ${duplicated.length} songs to delete`)

  for ( const song of duplicated ) {
    console.log("Removing duplicated: " +song.videoId)

    await google.youtube("v3").playlistItems.delete({
      auth: client,
      id: song.id,
    })
  }
}

export async function addToPlaylist( client:OAuth2Client,songs:SongEntry[] ) {
  for ( const song of songs ) {
    const [ videoId ] =song.url.match(/[a-zA-Z0-9_-]{11}/) || []
    if ( !videoId ) continue

    console.log(`adding song: ${song.title} to playlist`)

    await google.youtube("v3").playlistItems.insert({
      auth:client,
      part:["snippet"],
      requestBody: {
        snippet: {
          playlistId:PLAYLIST_ID,
          resourceId: {
            kind:"youtube#video",
            videoId
          } 
        }
      }
    })
    
  }
}
