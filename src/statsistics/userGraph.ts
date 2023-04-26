import fs from "node:fs"
import { UserWithCount } from "./lib/songsByUser"
import { arc, pie } from "d3-shape"
import { createNode, createSvgNode } from "./lib/svg"
import { avatarStore } from "./lib/stores/avatars"
import { pallete1 as colors } from "./lib/colors"

export async function createUserChart( input:UserWithCount[] ) {
  
  const width =600
  const height =input.length *60
  const margin ={ top: 20, right: 20, left: 20, bottom: 20 }
  const radius =(height -margin.top -margin.bottom) /2

  const svg =createSvgNode(width,height)
    .setAttribute("font-size",10)
    .appendChild(createNode("rect").setPosition({width,height}).setAttribute("fill","#222"))
  
  const circleGroup =createNode("g")
    .setAttribute("transform",`translate(${radius +margin.left},${radius +margin.top})`)
    .appendTo(svg)

  const formattedData =pie<UserWithCount>().value(d => d.count)(input)
  const arcGenerator =arc()
    .innerRadius(0)
    .outerRadius(radius)
  
  const sum =input.reduce((acc,i) => acc + i.count,0)

  const promiseArray =input.map(({ user, count },i) => new Promise<void>(resolve => {
    circleGroup.appendChild(createNode("path")
      //@ts-ignore
      .setAttribute("d",arcGenerator(formattedData[i]))
      .setAttribute("fill",colors[i])
      )
      
    //@ts-ignore
    let [ x1 ,y1 ] =arcGenerator.centroid(formattedData[i])
    x1 += radius +margin.left
    y1 += radius +margin.top

    const x2 =margin.left +radius *2 +20
    const y2 =margin.top +60 *i

    avatarStore.get(user!.id,32,32)
      .then(image => {
        svg.appendChild(
          createNode("image")
            .setAttribute("xlink:href",image)
            .setPosition({
              x: x2 +32,
              y: y2 +5,
              width:32,
              height:32
            })
        )
      })
      .then(resolve)

    svg
      .appendChild(
        createNode("path")
          .setAttribute("d",`M${x1} ${y1}l0 -10L${x2} ${y2}l20 0`)
          .setAttribute("stroke",user?.color || "red")
      )
      .appendChild(
        createNode("text")
          .setTextContent(`${user?.name} ${Math.floor(count /sum *1000)/10}% (${count})`)
          .setPosition({ x: x2 +30, y: y2 })
          .setAttribute("fill",user?.color || "red")
      )
  }))

  await Promise.all( promiseArray )

  fs.writeFile("download/pmstats-piechart.svg",svg.render(),err => err && console.log(err))
}



