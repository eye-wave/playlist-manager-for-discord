import sharp from "sharp"
import { userStore } from "src/lib/stores/users"

export type AvatarWithId = { image: Buffer; id: string }
function createAvatarStore() {
  const avatarMap = new Map<string, Buffer>()

  return {
    async get(id: string, width = 128, height = 128, quality = 95) {
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

    async fetch(id: string) {
      return new Promise<void>(resolve => {
        if (avatarMap.has(id)) return resolve()

        const user = userStore.getUser(id)

        if (!user?.avatarUrl) return resolve()

        fetch(user.avatarUrl)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => Buffer.from(arrayBuffer))
          .then(buffer => avatarMap.set(id, buffer))
          .finally(resolve)
      })
    },
  }
}

export const avatarStore = createAvatarStore()
