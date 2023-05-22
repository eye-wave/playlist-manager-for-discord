import { scaleLinear, scaleUtc } from "d3-scale"
import { curveBumpX as curve, line } from "d3-shape"
import fs from "node:fs"
import { SongsByUserAndTime } from "./lib/songsByUser"
import { avatarStore } from "./lib/stores/avatars"
import { createNode, createSvgNode } from "./lib/svg"

export async function createTimeGraph(input: SongsByUserAndTime[]) {
  const width = input[0].list.length * 25
  const height = 350
  const margin = { top: 20, right: 20, left: 20, bottom: 60 }

  const minTime = input[0].list.at(0)?.timestamp ?? 0
  const maxTime = input[0].list.at(-1)?.timestamp ?? 0

  const maxValue = Math.max(...input.map(i => Math.max(...i.list.map(i => i.value))))

  const x = scaleUtc()
    .domain([minTime, maxTime])
    .range([margin.left, width - margin.right])
  const y = scaleLinear()
    .domain([0, maxValue])
    .range([height - margin.bottom, margin.top])

  const lineGenerator = line<SongsByUserAndTime["list"][number]>()
    .x(d => x(d.timestamp))
    .y(d => y(d.value))
    .curve(curve)

  const svg = createSvgNode(width, height).setAttribute("font-size", 10)
  const bg = createNode("rect").setPosition({ width, height }).setAttribute("fill", "#222").appendTo(svg)
  const style = createNode("style")
  style
    .setTextContent(
      input
        .map(({ user }, i) => `.u-${user.id}{animation:h ${input.length * 4}s linear ${(i - 1) * 4}s infinite;opacity:0}`)
        .join("") +
        `@keyframes h{${[
          [0, 0],
          [1 / input.length - 0.002, 0],
          [1 / input.length - 0.001, 1],
          [2 / input.length + 0.001, 1],
          [2 / input.length + 0.002, 0],
          [1, 0],
        ]
          .map(([percent, value]) => `${percent * 100}%{opacity:${value}}`)
          .join("")}}`,
    )
    .appendTo(svg)

  const svgArray = [] as { fileName: string; content: string }[]

  // X axis
  const xAxis = createNode("g").appendTo(svg)
  input[0].list.forEach((item, i, list) => {
    const x = ((width - margin.right - margin.left) / (list.length - 1)) * i + margin.left - 3
    const y = height - margin.bottom + 4

    const formater = new Intl.DateTimeFormat("en-US", { month: "short" })
    const isJan = new Date(item.timestamp).getMonth() === 0
    const year = isJan ? new Date(item.timestamp).getFullYear() : 0

    const text = formater.format(item.timestamp)

    xAxis.appendChild(
      createNode("text")
        .setPosition({ x, y })
        .setAttribute("transform", `rotate(90 ${x} ${y})`)
        .setAttribute("fill", "#fff")
        .setTextContent(text + (isJan ? " " + year : "")),
    )
  })

  // Y axis
  const yAxis = createNode("g").appendTo(svg)
  for (let i = 0; i <= maxValue; i++) {
    if (!(i % 10 === 0 || i === maxValue)) continue

    const x = margin.left - 10
    const y = height - margin.bottom - ((height - margin.top - margin.bottom) / maxValue) * i

    yAxis.appendChild(createNode("text").setPosition({ x, y }).setAttribute("fill", "#fff").setTextContent(i))
  }

  // Graph + images
  for (const item of input) {
    const { list, user } = item
    if (!user) break

    const group = createNode("g").appendTo(svg)
    const imageSize = 52
    const image = await avatarStore.get(user.id, imageSize, imageSize)
    createNode("image")
      .setAttribute("xlink:href", image)
      .setPosition({
        x: margin.left + 20,
        y: margin.top + 20,
        width: 48,
        height: 48,
      })
      .appendTo(group)

    group.setAttribute("class", "u-" + user.id)
    createNode("path")
      .setAttribute("d", lineGenerator([{ timestamp: minTime, value: 0 }, ...list, { timestamp: maxTime, value: 0 }]) || "")
      .setAttribute("stroke-width", 1)
      .setAttribute("stroke", user?.color || "red")
      .setAttribute("fill", (user?.color || "#ff0000") + "40")
      .appendTo(group)

    createNode("text")
      .setPosition({
        x: margin.left + 25 + imageSize,
        y: margin.top + 20 + imageSize / 2,
      })
      .setAttribute("font-size", 20)
      .setAttribute("fill", user.color || "red")
      .setTextContent(user.name)
      .appendTo(group)

    const privateSvg = createSvgNode(width, height)
      .setAttribute("font-size", 10)
      .appendChild(bg)
      .appendChild(group)
      .appendChild(xAxis)
      .appendChild(yAxis)

    const scatterPlot = createNode("g").appendTo(privateSvg)
    const avg = list.reduce((acc, i) => acc + i.value, 0) / list.length

    list.forEach(item => {
      createNode("circle")
        .setAttribute("cx", x(item.timestamp))
        .setAttribute("cy", y(item.value))
        .setAttribute("r", 2)
        .setAttribute("fill", "#fff")
        .appendTo(scatterPlot)

      if (item.value > avg) {
        createNode("text")
          .setAttribute("x", x(item.timestamp) - 5)
          .setAttribute("y", y(item.value) - 6)
          .setAttribute("fill", "#fff")
          .setTextContent(item.value)
          .appendTo(scatterPlot)
      }
    })

    svgArray.push({
      content: privateSvg.render(),
      fileName: `${user.name}.svg`,
    })
  }

  fs.writeFile("download/pmstats-timegraph-animated.svg", svg.render(), err => err && console.log(err))
  svgArray.forEach(({ content, fileName }) =>
    fs.writeFile("download/pmstats-timegraph-user-" + fileName, content, err => err && console.log(err)),
  )
}
