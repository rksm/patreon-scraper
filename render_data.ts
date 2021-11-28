import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { formatDate, parseArgs } from './util';
import { DataEntity, PostFile, Embed } from './PostDataInterface';

function renderPostFile(postFile: PostFile): String {
    const isImage = !!postFile.url.match(/\.(jpe?g|png|gif|bmp)/);
    if (isImage) {
        return `<div><a href="${postFile.url}"><img src="${postFile.url}"/></a></div>\n`;
    }
    return `<div class="post_file">linked file: <a href="${postFile.url}">${postFile.name}</a></div>\n`;
}

function renderEmbed(embed: Embed, post_type: String, index: number): String {
    let html = ''
    if (post_type === 'video_embed') {
        let video = embed.html.replace('"//', '"https://');
        html += `<br><div>
        <button onclick="loadVideo(${index})">Load embed</button>
        <template class="video" id="video-${index}">${video}</template>
        </div>`;
    }
    if (embed.url) {
        html += `<br><a href="${embed.url}">${embed.url}</a>`
    }
    return html
}

function main() {
    const { dataDir } = parseArgs(process.argv.slice(2));

    const htmlFile = `./${dataDir}/${formatDate()}_index.html`;
    let html = `
        <style>
            .date {}
            .count, .post_file {
                font-weight: bold;
            }
            img {
                max-width: 500px;
                max-height: 400px;
            }
            iframe {
                width: 720px;
                height: 480px;
            }
        </style>
        <script>
            function loadVideo(index) {
                let temp = document.getElementById(\`video-\${index}\`);
                temp.parentNode.appendChild(temp.content.cloneNode(true));
            }
        </script>
    `;

    const data: DataEntity[] =
        JSON.parse(readFileSync(`./${dataDir}/data.json`).toString());

    data.forEach((post, index) => {
        const { content, title, like_count, url, comment_count, published_at, post_file, embed, post_type } = post.attributes;
        html += `<h2><a href="${url}">${title}</a></h2>
        <div class="date">${published_at}</div>
        <div class="count">likes: ${like_count}</div>
        <div class="count">comments: ${comment_count}</div>\n`;
        if (post_file) {
            html += renderPostFile(post_file);
        }
        if (embed) {
            html += renderEmbed(embed, post_type, index);
        }
        html += `<div>
        ${content}
        </div>
        <hr />
        `;
    });

    writeFileSync(htmlFile, html);
    console.log(`file://${resolve(htmlFile)}`);
}

main();
