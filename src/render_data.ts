import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { formatDate, parseArgs } from "./util";
import { DataEntity, PostFile, Embed } from "./PostDataInterface";
import { Comment, IncludedEntity } from "./Comments";

function renderPostFile(postFile: PostFile): String {
  const isImage = !!postFile.url.match(/\.(jpe?g|png|gif|bmp)/);
  if (isImage) {
    return `<div><a href="${postFile.url}"><img src="${postFile.url}"/></a></div>\n`;
  }
  return `<div class="post_file">linked file: <a href="${postFile.url}">${postFile.name}</a></div>\n`;
}

function renderEmbed(embed: Embed, post_type: String, index: number): String {
  let html = "";
  if (post_type === "video_embed") {
    let video = embed.html.replace('"//', '"https://');
    html += `<br><div>
        <button onclick="loadVideo(${index})">Load embed</button>
        <template class="video" id="video-${index}">${video}</template>
        </div>`;
  }
  if (embed.url) {
    html += `<br><a href="${embed.url}">${embed.url}</a>`;
  }
  return html;
}

function renderComment(comment: Comment, included: IncludedEntity[]): string {
  const {
    attributes: { body, created, is_by_creator, is_by_patron, vote_sum, deleted_at, reply_count },
    relationships,
  } = comment;
  const result: string[] = [`<div class="comment"><ul>`];

  if (relationships?.commenter && relationships?.commenter.data.id) {
    const commenter = included.find((ea) => ea.id == relationships?.commenter?.data.id);
    if (commenter && commenter.attributes.full_name) {
      result.push(
        `<li><image class="commenter" src="${commenter.attributes.image_url}"/><a href="${commenter.attributes.url}">${commenter.attributes.full_name}</a></li>`
      );
    }
  }

  result.push(
    `<li>created: ${created}</li>
<li>by creator: ${!!is_by_creator}</li>
<li>by patron: ${!!is_by_patron}</li>
<li>votes: ${vote_sum}</li>
<li>deleted: ${!!deleted_at}</li>
<li>replies: ${reply_count}</li>
</ul>
<div class="comment-body">${body}</div>`
  );

  if (relationships?.replies) {
    for (const { id, type } of relationships.replies.data) {
      const reply = type == "comment" && included.find((ea) => ea.id == id);
      if (reply) {
        result.push(renderComment(reply as Comment, included));
      }
    }
  }

  result.push(`</div>`);

  return result.join("\n");
}

function titleToId(title: string, i: number): string {
  return title.replace(/[^a-z0-9]/gi, "_").replace(/__+/g, "_") + "_" + i;
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

.comments {
  margin: 25px;
}
.comment {
  margin: 18px;
  border-bottom: 1px solid gray;
}
.comment img.commenter {
  max-width: 100px;
}

        </style>
        <script>
            function loadVideo(index) {
                let temp = document.getElementById(\`video-\${index}\`);
                temp.parentNode.appendChild(temp.content.cloneNode(true));
            }
        </script>
    `;

  const data: DataEntity[] = JSON.parse(readFileSync(`./${dataDir}/data.json`).toString());

  const toc = data
    .map((post, index) => {
      const { title, published_at } = post.attributes;
      return `<li><a href="#${titleToId(title, index)}">${title}</a> (${
        published_at.split("T")[0]
      })</li>`;
    })
    .join("\n");

  html += `<h3>Table of contents</h3><ul>${toc}</ul><hr>\n`;

  data.forEach((post, index) => {
    const {
      content,
      title,
      like_count,
      url,
      comment_count,
      published_at,
      post_file,
      embed,
      post_type,
    } = post.attributes;

    html += `<h2 id=${titleToId(title, index)}><a href="${url}">${title}</a></h2>
        <div class="date">${published_at}</div>
        <div class="count">likes: ${like_count}</div>
        <div class="count">comments: ${comment_count}</div>\n`;
    if (post_file) {
      html += renderPostFile(post_file);
    }
    if (embed) {
      html += renderEmbed(embed, post_type, index);
    }
    html += `<div>${content}</div>`;

    if (post.comments && post.comments.data?.length) {
      html += `<div class="comments"><h2>Comments</h2>`;
      for (const comment of post.comments.data ?? []) {
        html += renderComment(comment, post.comments.included ?? []);
      }
      html += `</div>`;
    }

    html += `<hr>`;
  });

  writeFileSync(htmlFile, html);
  console.log(`file://${resolve(htmlFile)}`);
}

main();
