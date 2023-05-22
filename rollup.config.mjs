import resolve from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import * as fs from "node:fs"
import * as path from "node:path"

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
const srcFiles = fs.readdirSync("src")
const inputArray = srcFiles
  .filter(file => [".ts", ".cts", ".mts", ".tsx"].includes(path.parse(file).ext))
  .map(file => [path.parse(file).name, path.join("src", file)])

const input = Object.fromEntries(inputArray)

const prod = process.env.NODE_ENV === "production"

if (prod) {
  fs.readdirSync("./dist").forEach(file => {
    fs.rmSync("./dist/" + file, { recursive: true, force: true })
  })
}

/** @type {import('rollup').RollupOptions} */
export default {
  input,
  output: {
    format: "es",
    entryFileNames: "[name].js",
    dir: "dist",
    sourcemap: !prod,
  },
  external: ["dotenv/config", ...Object.keys(pkg?.dependencies || {})],
  plugins: [
    terser({
      compress: true,
      mangle: true,
    }),
    typescript(),
    resolve({ browser: false }),
  ],
}
