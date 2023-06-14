import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { GIST_PATH } from "../lib/paths"
import { spawnProcess } from "./process"

function initializeRepo() {
  const GIST_URI = process.env.GIST_URI

  if (!GIST_URI) throw new Error("No GIST URI specified")

  const commands = ["cd " + GIST_PATH, `git clone ${GIST_URI} .`]

  return spawnProcess(commands.join(" && "))
}

export async function commitChanges() {
  if (!fs.existsSync(path.join(GIST_PATH, ".git"))) {
    if (fs.readdirSync(GIST_PATH).length > 0) {
      fs.rmSync(GIST_PATH, { force: true, recursive: true })
      fs.mkdirSync(GIST_PATH)
    }
    await initializeRepo()
  }

  const commands = [
    "cd " + GIST_PATH,
    "git add .",
    `git commit -m "${new Date().toDateString()}"`,
    "git push origin main --force",
  ]

  return spawnProcess(commands.join(" && "))
}
