import resolve from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import * as fs from "node:fs"
import * as path from "node:path"
import shebang from "rollup-plugin-add-shebang"

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))

const prod = process.env.NODE_ENV === "production"

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/index.ts",
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
    shebang({ include: "dist/index.js" }),
  ],
}
