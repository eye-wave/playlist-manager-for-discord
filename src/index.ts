import { clearCache, clearData } from "./lib/paths"
import { syncSongs } from "./songs"
import { argsInclude, getValueFromArgs } from "./songs/args"
import { commitChanges } from "./songs/git"
import { renderStatistics } from "./statsistics"

if (argsInclude("--rm-cache")) await clearCache()
if (argsInclude("--purge-data")) await clearData()

if (!argsInclude("--no-sync")) {
  const limit = parseInt(getValueFromArgs("--limit", "-l") as string) || undefined
  const offline = !argsInclude("--offline", "-o")
  const autoclean = !argsInclude("--autoclean", "-a")

  await syncSongs(limit, offline, autoclean)
}

if (argsInclude("--stats", "-s")) await renderStatistics()
if (argsInclude("--gist", "-g")) await commitChanges()
