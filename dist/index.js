import"dotenv/config";import{u as t,s as e,a as o,o as a,b as s,l as n,c as r,d as i,e as l,f as d}from"./songs-77a8e17e.js";import{google as c}from"googleapis";import u from"node:http";import p from"node:url";import m from"open";import{Collection as w,SnowflakeUtil as h}from"discord.js";import"csv-parser";import"d3-dsv";import"node:fs";import"node:path";import"node:child_process";const f=process.env.YOUTUBE_CLIENT_ID,g=process.env.YOUTUBE_CLIENT_KEY,v=process.env.YOUTUBE_REDIRECT_URL,y=process.env.YOUTUBE_PLAYLIST_ID,I=+(v?.match(/(?<=:)\d+/)?.[0]||"")||3e3;if(!f)throw new Error("Missing CLIENT_ID");if(!g)throw new Error("Missing CLIENT_KEY");if(!v)throw new Error("Missing REDIRECT_URL");async function E(t){const e=[];let o,a="";do{o=await c.youtube("v3").playlistItems.list({auth:t,part:["snippet"],playlistId:y,pageToken:a,maxResults:50}),e.push(...o.data.items?.map((t=>({id:t.id??"",videoId:t.snippet?.resourceId?.videoId??"",title:t.snippet?.title??""}))).filter((t=>"Deleted video"!==t.title))??[]),a=o.data.nextPageToken??""}while(a);return e}async function _(t,e){const o=function(t,e){const o=new Map,a=new Map;return t.forEach((t=>{const s=String(t[e]),n=(o.get(s)||0)+1;o.set(s,n),n>1&&a.set(s,[...a.get(s)??[],{...t}])})),Array.from(a).map((([,t])=>t)).flat()}(await(e??E(t)),"videoId");o.length>0&&console.log(`Found ${o.length} songs to delete`);for(const e of o)console.log("Removing duplicated: "+e.videoId),await c.youtube("v3").playlistItems.delete({auth:t,id:e.id})}async function T(t,e){for(const o of e){const[e]=o.url.match(/[a-zA-Z0-9_-]{11}/)||[];e&&(console.log(`adding song: ${o.title} to playlist`),await c.youtube("v3").playlistItems.insert({auth:t,part:["snippet"],requestBody:{snippet:{playlistId:y,resourceId:{kind:"youtube#video",videoId:e}}}}))}}const C="[0m",U="[33m";async function b(y=100){const b=process.env.EXPORT_FILE;if(!b)throw new Error("No export file provided");const[$,S,L]=await Promise.all([n("./download/users.csv"),n("./download/download.csv"),n("./download/download_other.csv")]);if($.forEach((t=>o.addFromCache(t))),S.forEach((t=>e.addFromCache(t))),L.forEach((t=>a.addFromCache(t))),await async function(n=100,r){if(n<1)return[0,0];let i=n<100?n:100,l=0;const d=process.env.YOUTUBE_API_KEY;return t((async(t,c)=>{for(;;){const t=await c.messages.fetch({limit:i,before:r}).catch((t=>console.log(t)))||new w;l=[...t].length,r=t.last()?.id;let u=0,p=0;t.forEach((t=>{t.content.match(/https:\/\/(www\.)?youtu(\.be|be\.com\/watch\?).*/g)?.map((t=>t.match(/[a-zA-Z0-9-_]{11}/)?.[0]||null)).filter((t=>t)).map((async a=>{const s=`https://www.youtube.com/watch?v=${a}`;if(e.has(s))return;const[n]=t.embeds.filter((t=>t.url===s)),r=n?.title?.endsWith("...")||!n?.title;let i=n?.title||"";if(r&&d){const t=await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${a}&part=snippet&fields=items(snippet(title))&key=${d}`),e=await t.json();i=e?.items?.[0]?.snippet?.title||n?.title||""}u++,o.add(t.author.id),e.add({authorId:t.author.id,date:h.timestampFrom(t.id),title:i,url:s})})),t.content.match(/https:\/\/(?:www|open)?\.?(?:spotify|soundcloud)\.com\/.*/g)?.map((e=>{if(a.has(e))return;const[s]=t.embeds.filter((t=>t.url===e));p++,o.add(t.author.id),a.add({authorId:t.author.id,date:h.timestampFrom(t.id),title:s?.title||"",url:e||""})}))}));const m=s(t.at(-1)?.id||""),f=s(t.at(0)?.id||"");if(console.log(`Got messages from: ${U}${m}${C} - ${U}${f}${C}`),i=(n-=100)<100?n:100,l<100||i<1)return[u,p]}}))}(y),e.newSongsCount>0&&!r("--offline","-o")){const t=await async function(){return new Promise((t=>{const e=new c.auth.OAuth2(f,g,v),o=e.generateAuthUrl({access_type:"offline",prompt:"consent",scope:["https://www.googleapis.com/auth/youtube"],redirect_uri:v,client_id:f}),a=u.createServer((async(o,s)=>{const n=p.parse(o.url||""),r=new URLSearchParams(n.query||"").get("code");if(!r)return s.end();const{tokens:i}=await e.getToken(r);return e.setCredentials(i),s.end("Success!"),a.close(),t(e)}));a.on("connect",(t=>t.destroy())),a.listen(I),m(o)}))}(),a=await i();a&&o.add(a);const s=await E(t);s.forEach((t=>{const o=`https://www.youtube.com/watch?v=${t.videoId}`,s=e.allSongs.filter((t=>t.url===o))?.[0]||{authorId:a,date:-1,title:t.title,url:o};e.addFromCache(s)})),await Promise.all([T(t,e.newSongs),r("--autoclean","-a")&&_(t,s)])}o.allFetched||await o.fetch(),await Promise.all([l("./download/download.csv",e.allSongs),l("./download/download_other.csv",a.allSongs),l("./download/users.csv",o.users),l(`./download/${b}`,e.allSongs.concat(a.allSongs).map((t=>({author:o.getUser(t.authorId)?.name||null,title:t.title,url:t.url}))).sort(((t,e)=>t.author?.localeCompare(e?.author||"")||t.title.localeCompare(e.title)||t.url.localeCompare(e.url))))]),r("--gist")&&await d(b)}export{b as syncSongs};