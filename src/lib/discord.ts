import "dotenv/config"
import { Client, GatewayIntentBits, SnowflakeUtil, type TextChannel } from "discord.js"

export function useBot<T>(
  callback:((client:Client,channel:TextChannel) => Promise<T>),
  intents =[
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds
  ]
) {
  const CHANNEL_ID =process.env.DISCORD_CHANNEL_ID as string
  const TOKEN =process.env.DISCORD_TOKEN as string

  if ( !CHANNEL_ID ) throw new Error("CHANNEL_ID is required")
  if (!TOKEN ) throw new Error("TOKEN is required")

  const client =new Client({ intents })
  return new Promise<T>((resolve,reject) => {
    client.login(TOKEN)
    client.on("error",() => {
      client.destroy()
      reject()
    })
    client.on("ready", async () => {
      const channel =<TextChannel>client.channels.cache.get(CHANNEL_ID)
      if ( !channel ) throw new Error("Channel not found")
      
      const result =await callback(client,channel)
      client.destroy()
      resolve(result)
    })
  })
}

export const getBotId =async () => useBot(async client => client.user?.id || "")

export function getDateFromMessageId( id:string ) {

  const timestamp =SnowflakeUtil.timestampFrom(id)
  const date = new Date(timestamp)
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`

  return formattedDate
}
