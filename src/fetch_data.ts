import { existsSync, mkdirSync, PathLike, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { DataEntity } from "./PostDataInterface";
import { Args, parseArgs } from "./util";
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

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

async function run(args: Args) {
  const posts = new GetPatreonPosts(args.campaignId, args.withComments, args.debug);

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

  let newPosts: DataEntity[];
  try {
    newPosts = await posts.loadAllPosts();
  } catch (err) {
    console.error("error fetching posts:", err);
    await posts.closeBrowser();
    process.exit(1);
  }

  try {
    await posts.closeBrowser();
  } catch (err) {
    console.error("Error closing browser:", err);
  }

  if (newPosts.length) {
    console.log(`found ${newPosts.length} new posts!`);
    if (!existsSync(`./${args.dataDir}`)) {
      mkdirSync(`./${args.dataDir}`);
    }
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
