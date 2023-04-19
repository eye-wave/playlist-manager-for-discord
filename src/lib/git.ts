import "dotenv/config"
import { spawn } from "node:child_process"

export async function commitChanges() {
  const songFile =process.env.EXPORT_FILE as string
  if ( !songFile ) throw new Error("No export file provided")
  
  const commands =[
    "cd download",
    `git add ${songFile}`,
    `git commit -m "${new Date().toDateString()}"`,
    "git push origin main --force"
  ]

  return new Promise<void>(resolve => {
    const gitProcess =spawn(commands.join(" && "),{ shell: true })
    
    gitProcess.stdout.pipe( process.stdout )
    gitProcess.stderr.pipe( process.stderr )

    gitProcess.on("close",() => resolve())
    gitProcess.on("disconnect",() => resolve())
    gitProcess.on("exit",() => resolve())    
  })
}
