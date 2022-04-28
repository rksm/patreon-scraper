import { existsSync, mkdirSync, PathLike, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { DataEntity } from "./PostDataInterface";
import { Args, formatDateAndTime, parseArgs } from "./util";
import { GetPatreonPosts } from "./patreon-posts";

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function dataFileJson(dataDir: string): string {
  return `./${dataDir}/data.json`;
}

function getOldData(postDataFile: string) {
  if (!existsSync(postDataFile as PathLike)) {
    return [];
  }
  return JSON.parse(readFileSync(postDataFile as PathLike).toString()) as DataEntity[];
}

const baseDataName = formatDateAndTime();
function save(dataDir: String, data: any, n: number) {
  if (!existsSync(`./${dataDir}`)) {
    mkdirSync(`./${dataDir}`);
  }
  writeFileSync(`./${dataDir}/${baseDataName}_${n}_raw.json`, JSON.stringify(data, null, 2));
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

async function run(args: Args) {
  const posts = new GetPatreonPosts(args.campaignId, args.debug);

  try {
    const cookies = await posts.loadCookies();
    const sessionId = cookies.find((ea) => ea.name === "session_id");
    if (!sessionId) {
      throw new Error("no session_id cookie found!");
    }
    console.log(`got session_id ${sessionId.value}`);
  } catch (err) {
    console.error("error getting cookies");
  }

  const postDataFile = dataFileJson(args.dataDir);
  const oldPosts = getOldData(postDataFile);
  const oldPostIds = oldPosts.reduce<Set<DataEntity["id"]>>((ids, ea) => ids.add(ea.id), new Set());

  let step = 0;
  let nextCursor: string = "";
  const newPosts: DataEntity[] = [];

  try {
    while (true) {
      const data = await posts.loadPosts(nextCursor);
      if (data.data) {
        data.data.forEach((d) => {
          console.log("%s: %s", d.attributes.published_at, d.attributes.title);
        });
        const existingPostIndex = data.data.findIndex((ea) => oldPostIds.has(ea.id));
        if (existingPostIndex > -1) {
          newPosts.push(...data.data.slice(0, existingPostIndex));
          if (existingPostIndex > 0) {
            save(args.dataDir, data, step++);
          }
          break;
        }
        newPosts.push(...data.data);
        save(args.dataDir, data, step++);
      }

      try {
        nextCursor = data.meta.pagination.cursors.next;
      } catch (err) {
        nextCursor = "";
      }
      if (!nextCursor) break;
    }
  } catch (err) {
    console.error("error fetching posts:", err);
  }

  try {
    await posts.closeBrowser();
  } catch (err) {
    console.error("Error closing browser:", err);
  }

  if (newPosts.length) {
    console.log(`found ${newPosts.length} new posts!`);
    writeFileSync(postDataFile as PathLike, JSON.stringify(newPosts.concat(oldPosts), null, 2));
    const fname = resolve(postDataFile);
    console.log(`wrote ${fname}`);
  } else {
    console.log("found no new posts :(");
  }
}

function main(): Promise<any> {
  const args = parseArgs(process.argv.slice(2));
  return run(args);
}

main()
  .then(() => console.log("done"))
  .catch((err) => console.error(err));
