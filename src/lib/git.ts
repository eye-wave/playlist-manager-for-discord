import "dotenv/config"
import { spawn } from "node:child_process"

export async function commitChanges(gitAdd: string) {
  const commands = [
    "cd download",
    `git add ${gitAdd}`,
    `git commit -m "${new Date().toDateString()}"`,
    "git push origin main --force",
  ]

  return new Promise<void>(resolve => {
    const gitProcess = spawn(commands.join(" && "), { shell: true })

    gitProcess.stdout.pipe(process.stdout)
    gitProcess.stderr.pipe(process.stderr)

    gitProcess.on("close", () => resolve())
    gitProcess.on("disconnect", () => resolve())
    gitProcess.on("exit", () => resolve())
  })
}
