import {readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';

import {formatDate} from './util';
import {DataEntity} from './PostDataInterface';

// const dataDir = 'data_vi';
const dataDir = 'noclip_data';

const htmlFile = `./noclip_data/${formatDate()}_index.html`;
let html = `
<style>
.date {}
.count {
  font-weight: bold;
}
img {
  max-width: 500px;
  max-height: 400px;
}
</style>

`;

const data: DataEntity[] =
    JSON.parse(readFileSync(`./${dataDir}/data.json`).toString());

for (const post of data) {
  const {content, title, like_count, url, comment_count, published_at} =
      post.attributes;
  html += `<h2><a href="${url}">${title}</a></h2>
<div class="date">${published_at}</div>
<div class="count">likes: ${like_count}</div>
<div class="count">comments: ${comment_count}</div>
<div>
  ${content}
</div>
<hr />
  `;
}


writeFileSync(htmlFile, html);
console.log(`file://${resolve(htmlFile)}`);
