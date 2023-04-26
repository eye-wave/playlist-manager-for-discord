// import sharp from "sharp"
// import Vibrant from "node-vibrant"

// function fetchImageAsBuffer( url:string, width:number, height:number, quality =80 ) {
//   return new Promise<Buffer>((resolve,reject) => {
//     fetch( url )
//       .then( response => response.arrayBuffer() )
//       .then( arrayBuffer => Buffer.from( arrayBuffer ) )
//       .then(buffer => {
//         return sharp( buffer)
//           .resize( width, height )
//           .removeAlpha()
//           .jpeg( { quality })
//           .toBuffer()
//       })
//       // .then(buffer => `data:image/webp;base64,${buffer.toString("base64")}`)
//       .then(resolve)
//       .catch(reject)
//   })
// }

// export type ImageWithUserIdAndColor ={ image:string,id:string,colorLight:string,colorDark:string }
// export function fetchUserImage(user:User,width =36,height =36) {
//   return new Promise<ImageWithUserIdAndColor>(resolve => {
//     return fetchImageAsBuffer(user.avatarUrl || "",width,height)
//       .then(buffer => {
//         return new Promise<ImageWithUserIdAndColor>(resolv => {
//           Vibrant.from(buffer)
//             .getPalette()
//             .then(pallete => {
//               return resolv({
//                 image:"data:image/jpeg;base64,"+buffer.toString("base64"),
//                 id:user.id,
//                 colorLight: pallete.LightVibrant?.hex || "",
//                 colorDark: pallete.DarkVibrant?.hex || "",
//               })
//             })
//         })
//       })
//       .then(resolve)
//   })
// }

// export function fetchUsersImages(users:User[],width =36,height =36) {
//   return Promise.all(
//     users.map(user => {
//       return fetchUserImage(user,width,height)
//     })
//   )
// }
