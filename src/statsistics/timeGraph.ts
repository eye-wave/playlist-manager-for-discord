import { scaleLinear, scaleUtc } from "d3-scale"
import { curveBumpX as curve, line } from "d3-shape"
import fs from "node:fs"
import path from "node:path"
import { GIST_PATH } from "src/lib/paths"
import { avatarStore } from "../lib/stores/avatars"
import { SongsByUserAndTime } from "./lib/songsByUser"
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

  const svg = createSvgNode(width, height).setAttr("font-size", 10)
  const bg = createNode("rect").setPosition({ width, height }).setAttr("fill", "#222").appendTo(svg)
  const style = createNode("style")
  style
    .setText(
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

    xAxis.append(
      createNode("text")
        .setPosition({ x, y })
        .setAttr("transform", `rotate(90 ${x} ${y})`)
        .setAttr("fill", "#fff")
        .setText(text + (isJan ? " " + year : "")),
    )
  })

  // Y axis
  const yAxis = createNode("g").appendTo(svg)
  for (let i = 0; i <= maxValue; i++) {
    if (!(i % 10 === 0 || i === maxValue)) continue

    const x = margin.left - 10
    const y = height - margin.bottom - ((height - margin.top - margin.bottom) / maxValue) * i

    yAxis.append(createNode("text").setPosition({ x, y }).setAttr("fill", "#fff").setText(i))
  }

  // Graph + images
  for (const item of input) {
    const { list, user } = item
    if (!user) break

    const group = createNode("g").appendTo(svg)
    const imageSize = 52
    const image = await avatarStore.get(user.id, imageSize, imageSize)
    createNode("image")
      .setAttr("xlink:href", image)
      .setPosition({
        x: margin.left + 20,
        y: margin.top + 20,
        width: 48,
        height: 48,
      })
      .appendTo(group)

    group.setAttr("class", "u-" + user.id)
    createNode("path")
      .setAttr("d", lineGenerator([{ timestamp: minTime, value: 0 }, ...list, { timestamp: maxTime, value: 0 }]) || "")
      .setAttr("stroke-width", 1)
      .setAttr("stroke", user?.color || "red")
      .setAttr("fill", (user?.color || "#ff0000") + "40")
      .appendTo(group)

    createNode("text")
      .setPosition({
        x: margin.left + 25 + imageSize,
        y: margin.top + 20 + imageSize / 2,
      })
      .setAttr("font-size", 20)
      .setAttr("fill", user.color || "red")
      .setText(user.name)
      .appendTo(group)

    const privateSvg = createSvgNode(width, height)
      .setAttr("font-size", 10)
      .append(bg)
      .append(group)
      .append(xAxis)
      .append(yAxis)

    const scatterPlot = createNode("g").appendTo(privateSvg)
    const avg = list.reduce((acc, i) => acc + i.value, 0) / list.length

    list.forEach(item => {
      createNode("circle")
        .setAttr("cx", x(item.timestamp))
        .setAttr("cy", y(item.value))
        .setAttr("r", 2)
        .setAttr("fill", "#fff")
        .appendTo(scatterPlot)

      if (item.value > avg) {
        createNode("text")
          .setAttr("x", x(item.timestamp) - 5)
          .setAttr("y", y(item.value) - 6)
          .setAttr("fill", "#fff")
          .setText(item.value)
          .appendTo(scatterPlot)
      }
    })

    svgArray.push({
      content: privateSvg.render(),
      fileName: `${user.name}.svg`,
    })
  }

  fs.writeFile(path.join(GIST_PATH, "pmstats-timegraph-animated.svg"), svg.render(), err => err && console.log(err))
  svgArray.forEach(({ content, fileName }) =>
    fs.writeFile(path.join(GIST_PATH, `pmstats-timegraph-user-${fileName}`), content, err => err && console.log(err)),
  )
}
