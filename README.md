# Playlist manager for Discord

<div align="center">
  <h2>Sync your Discord chat with Youtube, and Github Gist</h2>
  <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord" height=48>
  <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="Youtube" height=48>
  <img src="https://cdn-icons-png.flaticon.com/512/2111/2111432.png" alt="Github" height=48>
</div>

<div align="center">
  <p>Made with:</p>
  <img src="https://www.typescriptlang.org/favicon-32x32.png" alt="typescript" height=32>
  <img src="https://rollupjs.org/favicon.png" alt="rollup.js" height=32>
  <img src="https://pnpm.io/img/favicon.png" alt="pnpm" height=32>
  <img src="https://nodejs.org/static/images/favicons/favicon.png" alt="node.js" height=32>
</div>

## Usage

- **build** the project with

```
npm run build
pnpm run build
yarn build
```

- fill out necessary parameters in .env file
- _optionally_ create a empty gist on github and add it to .env acorgingly
- change file permissions with

```
chmod +x ./dist/index.js
```

and finally run with

```
./dist/index.js
```

## Things to note

sometimes it reuploads vidos for no particular reason that's why --autoclean exist, although it also doesn't work every time

## To do

- [ ] make better cli
- [ ] organise chaotic code
- [ ] allow for more directories _(also servers and chats)_
