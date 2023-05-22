import csvParser from "csv-parser"
import { csvFormat } from "d3-dsv"
import fs from "node:fs"
import path from "node:path"
import type { SongEntry } from "src/lib/stores/songs"

export async function loadCsv(filePath: string) {
  return new Promise<SongEntry[]>(resolve => {
    const result: SongEntry[] = []
    if (!fs.existsSync(filePath)) return resolve(result)

    const stream = fs.createReadStream(filePath)

    stream
      .pipe(csvParser({ mapValues: ({ header, value }) => (header === "date" ? +value : value) }))
      .on("data", data => result.push(data))
      .on("end", () => resolve(result))
  })
}

export async function saveCsv<T extends Record<string, unknown>>(filePath: string, input: T[]) {
  const dirName = path.dirname(filePath)
  if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true })

  return new Promise<void>((resolve, reject) => {
    const fileContent = csvFormat(input)
    fs.writeFile(filePath, fileContent, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
