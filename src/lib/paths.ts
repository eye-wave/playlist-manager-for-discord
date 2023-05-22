import envPaths from "env-paths"
import fs from "node:fs"
import path from "node:path"

// Discord playlist manager
const paths = envPaths("dpm-v1")

export const CSV_PATH = path.join(paths.data, "csv/")
export const GIST_PATH = path.join(paths.data, "gist/")
export const CACHE_PATH = paths.cache

if (!fs.existsSync(paths.data)) fs.mkdirSync(paths.data)

if (!fs.existsSync(CSV_PATH)) fs.mkdirSync(CSV_PATH)
if (!fs.existsSync(GIST_PATH)) fs.mkdirSync(GIST_PATH)

if (!fs.existsSync(CACHE_PATH)) fs.mkdirSync(CACHE_PATH)

export async function clearCache() {
  return new Promise<void>((resolve, reject) => {
    fs.rm(CACHE_PATH, { force: true, recursive: true }, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export async function clearData() {
  return Promise.all([
    clearCache(),
    new Promise<void>((resolve, reject) => {
      fs.rm(paths.data, { force: true, recursive: true }, err => {
        if (err) return reject(err)
        resolve()
      })
    }),
  ])
}
