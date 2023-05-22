import fs from "node:fs"
import https from "node:https"
import path from "node:path"
import sharp from "sharp"
import { userStore } from "src/lib/stores/users"
import { CACHE_PATH } from "../paths"

export type AvatarWithId = { image: Buffer; id: string }
function createAvatarStore() {
  const avatarMap = new Map<string, Buffer>()
  if (!fs.existsSync(path.join(CACHE_PATH, "image"))) {
    fs.mkdirSync(path.join(CACHE_PATH, "image"))
  }

  return {
    async get(id: string, width = 128, height = 128, quality = 95) {
      if (this.hasInCache(id)) await this.addFromCache(id)
      if (!avatarMap.has(id)) await this.fetch(id)

      const buffer = avatarMap.get(id)

      return new Promise<string>(resolve => {
        return sharp(buffer)
          .resize(width, height)
          .webp({ quality })
          .toBuffer()
          .then(buffer => "data:image/jpeg;base64," + buffer.toString("base64"))
          .then(resolve)
          .finally(() => resolve(""))
      })
    },

    hasInCache(id: string) {
      return fs.readdirSync(path.join(CACHE_PATH, "image")).some(file => file.startsWith(id))
    },

    async addFromCache(id: string) {
      return new Promise<void>((resolve, reject) => {
        if (avatarMap.has(id)) return resolve()

        const user = userStore.getUser(id)

        if (!user?.avatarUrl) return reject(`User: ${user} has no avatar`)

        const filePath = path.join(CACHE_PATH, "image/", `${user.id}${path.extname(user.avatarUrl)}`)
        fs.readFile(filePath, (err, data) => {
          if (err) return reject(err)
          avatarMap.set(user.id, data)
          resolve()
        })
      })
    },

    async fetch(id: string) {
      return new Promise<void>((resolve, reject) => {
        if (avatarMap.has(id)) return resolve()

        const user = userStore.getUser(id)

        if (!user?.avatarUrl) return reject(`User: ${user} has no avatar`)

        let buffer = Buffer.alloc(0)
        const fileStream = fs.createWriteStream(path.join(CACHE_PATH, "image/", `${user.id}${path.extname(user.avatarUrl)}`))

        https.get(user.avatarUrl, res => {
          res.pipe(fileStream)
          res.on("data", chunk => (buffer = Buffer.concat([buffer, chunk])))

          fileStream.on("error", reject)
          fileStream.on("close", () => {
            avatarMap.set(user.id, buffer)
            resolve()
          })
        })
      })
    },
  }
}

export const avatarStore = createAvatarStore()
