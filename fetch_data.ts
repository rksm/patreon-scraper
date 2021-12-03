import { existsSync, mkdirSync, PathLike, readFileSync, writeFileSync } from "fs";
import { get, RequestOptions } from "https";
import { resolve } from "path";
import puppeteer from "puppeteer";
import { format, parse, Url } from "url";
import { DataEntity, PostData } from "./PostDataInterface";
import { Args, formatDateAndTime, parseArgs } from "./util";

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

const PATREON_URL = parse("https://www.patreon.com/api/posts");

function dataFileJson(dataDir: string): string {
  return `./${dataDir}/data.json`;
}

function makeQuery(campaignId: string): { [key: string]: string } {
  return {
    sort: "-published_at",
    "filter[campaign_id]": campaignId,
    "filter[is_draft]": "false",
    "filter[contains_exclusive_posts]": "true",
    "fields[user]": "image_url,full_name,url",
    "json-api-use-default-includes": "false",
    "json-api-version": "1.0  ",
    include:
      "user,attachments,user_defined_tags,campaign,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,access_rules.tier.null",
    "fields[post]":
      "change_visibility_at,comment_count,content,current_user_can_delete,current_user_can_view,current_user_has_liked,embed,image,is_paid,like_count,min_cents_pledged_to_view,post_file,published_at,patron_count,patreon_url,post_type,pledge_url,thumbnail_url,teaser_text,title,upgrade_url,url",
    "fields[campaign]": "earnings_visibility,is_nsfw,is_monthly",
    "fields[access_rule]": "access_rule_type,amount_cents",
  };
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function getOldData(postDataFile: string) {
  if (!existsSync(postDataFile as PathLike)) {
    return [];
  }
  return JSON.parse(readFileSync(postDataFile as PathLike).toString()) as DataEntity[];
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function makeReq(
  url: Url,
  query: { [key: string]: any },
  pageCursor?: string,
  cookies: { name: string; value: string }[] = []
) {
  if (pageCursor) {
    query = { ...query, "page[cursor]": pageCursor };
  }

  const opts = parse(format({ ...url, query })) as RequestOptions;
  opts.headers = {
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
    "content-type": "application/json",
    cookie: cookies.map((ea) => `${ea.name}=${ea.value};`).join(" "),
  };
  return opts;
}

function requestData(opts: RequestOptions): Promise<PostData> {
  return new Promise((resolve, reject) => {
    get(opts, (res) => {
      let rawData = "";
      // A chunk of data has been recieved.
      res.on("data", (chunk) => {
        rawData += chunk;
      });

      // The whole resonse has been received. Print out
      // the result.
      res.on("end", () => {
        const data = JSON.parse(rawData) as PostData;
        resolve(data);
        // console.log(JSON.stringify(data, null, 2));
      });
    }).on("error", reject);
  });
}

async function getPatreonCookies() {
  let browser: puppeteer.Browser;
  try {
    browser = await puppeteer.launch({ userDataDir: "./user_data", headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.patreon.com/noclip/");
    return await page.cookies("https://patreon.com");
  } finally {
    try {
      browser!.close();
    } catch (err) {}
  }
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
  const cookies = await getPatreonCookies();
  const sessionId = cookies.find((ea) => ea.name === "session_id");
  if (!sessionId) {
    throw new Error("no session_id cookie found!");
  }
  console.log(`got session_id ${sessionId.value}`);

  const postDataFile = dataFileJson(args.dataDir);
  const oldPosts = getOldData(postDataFile);
  const oldPostIds = oldPosts.reduce<Set<DataEntity["id"]>>((ids, ea) => ids.add(ea.id), new Set());

  let step = 0;
  let nextCursor: string = "";
  const newPosts: DataEntity[] = [];

  while (true) {
    const data = await requestData(
      makeReq(PATREON_URL, makeQuery(args.campaignId), nextCursor, cookies)
    );
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
