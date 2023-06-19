import { build } from "esbuild"
import * as fs from "node:fs"

const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json","utf8"))
const alias = Object.fromEntries(Object.entries(tsconfig.compilerOptions.paths).map(i => i.flat(1)))

build({
  alias,
  bundle: true,
  minify: true,
  sourcemap: true,
  format: "esm",
  platform: "node",
  target: "node16",
  logLevel: "info",
  packages: "external",
  outfile: "dist/index.js",
  entryPoints: ["src/index.ts"],
  alias: {
    "src": "./src"
  },
})
