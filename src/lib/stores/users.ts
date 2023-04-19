import { useBot } from "../discord"

export type User ={
  id: string,
  avatarUrl?: string,
  name: string,
  color: string
}

function createUserStore() {
  const ids =new Set<string>()
  const users:User[] =[]

  return {
    get allFetched() { return users.length === ids.size },
    get users() { return [...users] },
    
    add( id:string ) {
      ids.add(id)
      return this
    },
    addFromCache( user:User ) {
      if ( ids.has(user.id ) ) return this
      
      this.add(user.id)
      users.push(user)

      return this
    },

    async fetch() {
      return useBot(async(_,channel) => {
        const members =await channel.guild.members.fetch()
        members.forEach(member => {
          if ( !ids.has(member.id) ) return

          const { id, displayName:name, displayHexColor:color } =member
          const avatarUrl =member.displayAvatarURL()

          users.push({ id, color, name, avatarUrl })
        })})
    }
  }
}

export const userStore =createUserStore()
