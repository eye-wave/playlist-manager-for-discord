import { Collection, SnowflakeUtil } from "discord.js"
import { colReset, colYellow } from "./colors"
import { getDateFromMessageId, useBot } from "./discord"
import { otherSongsStore, songsStore } from "./stores/songs"
import { userStore } from "./stores/users"

export async function getNewSongs(trueLimit = 100, before?: string): Promise<[number, number]> {
  if (trueLimit < 1) return [0, 0]

  let limit = trueLimit < 100 ? trueLimit : 100
  let messages_fetched = 0

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

  return useBot(async (_, channel) => {
    for (;;) {
      const messages = (await channel.messages.fetch({ limit, before }).catch(err => console.log(err))) || new Collection()

      messages_fetched = [...messages].length
      before = messages.last()?.id

      let songsAdded = 0
      let otherSongsAdded = 0

      messages.forEach(message => {
        message.content
          .match(/https:\/\/(www\.)?youtu(\.be|be\.com\/watch\?).*/g)
          ?.map(song => song.match(/[a-zA-Z0-9-_]{11}/)?.[0] || null)
          .filter(i => i)
          .map(async id => {
            const url = `https://www.youtube.com/watch?v=${id}`
            if (songsStore.has(url)) return

            const [embed] = message.embeds.filter(embed => embed.url === url)

            const isTitleMissing = embed?.title?.endsWith("...") || !embed?.title
            let title = embed?.title || ""

            if (isTitleMissing && YOUTUBE_API_KEY) {
              const res = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet&fields=items(snippet(title))&key=${YOUTUBE_API_KEY}`,
              )
              const json = await res.json()

              title = json?.items?.[0]?.snippet?.title || embed?.title || ""
            }

            songsAdded++
            userStore.add(message.author.id)
            songsStore.add({
              authorId: message.author.id,
              date: SnowflakeUtil.timestampFrom(message.id),
              title,
              url,
            })
          })

        message.content.match(/https:\/\/(?:www|open)?\.?(?:spotify|soundcloud)\.com\/.*/g)?.map(songUrl => {
          if (otherSongsStore.has(songUrl)) return
          const [embed] = message.embeds.filter(embed => embed.url === songUrl)

          otherSongsAdded++
          userStore.add(message.author.id)
          otherSongsStore.add({
            authorId: message.author.id,
            date: SnowflakeUtil.timestampFrom(message.id),
            title: embed?.title || "",
            url: songUrl || "",
          })
        })
      })

      const firstMessageDate = getDateFromMessageId(messages.at(-1)?.id || "")
      const lastMessageDate = getDateFromMessageId(messages.at(0)?.id || "")

      console.log(`Got messages from: ${colYellow}${firstMessageDate}${colReset} - ${colYellow}${lastMessageDate}${colReset}`)

      trueLimit -= 100
      limit = trueLimit < 100 ? trueLimit : 100

      if (messages_fetched < 100 || limit < 1) return [songsAdded, otherSongsAdded]
    }
  })
}
