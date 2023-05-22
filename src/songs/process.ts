import { spawn } from "node:child_process"

export function spawnProcess(command: string) {
  return new Promise<void>((resolve, reject) => {
    const spawnedProcess = spawn(command, { shell: true })

    spawnedProcess.stdout.pipe(process.stdout)
    spawnedProcess.stderr.pipe(process.stderr)

    spawnedProcess.on("close", () => resolve())
    spawnedProcess.on("disconnect", () => resolve())
    spawnedProcess.on("exit", () => resolve())

    spawnedProcess.on("error", reject)
  })
}
