import "dotenv/config"
import fs from "node:fs"
import { GIST_PATH } from "../lib/paths"
import { spawnProcess } from "./process"

function initializeRepo() {
  const GIST_URI = process.env.GIST_URI

  if (!GIST_URI) throw new Error("No GIST URI specified")

  const commands = ["cd " + GIST_PATH, `git clone ${GIST_URI} .`]

  return spawnProcess(commands.join(" && "))
}

export async function commitChanges() {
  if (!fs.existsSync(GIST_PATH)) await initializeRepo()

  const commands = [
    "cd " + GIST_PATH,
    "git add .",
    `git commit -m "${new Date().toDateString()}"`,
    "git push origin main --force",
  ]

  return spawnProcess(commands.join(" && "))
}
