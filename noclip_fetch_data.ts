import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {get, RequestOptions} from 'https';
import {resolve} from 'path';
import {Browser, Cookie, launch} from 'puppeteer';
import {format, parse, Url} from 'url';

import {formatDateAndTime} from './util';
import {DataEntity, PostData} from './PostDataInterface';

// const CAMPAIGN_ID_VI = '156286';
// const DATA_DIR = 'data_vi';
const CAMPAIGN_ID_NOCLIP = '486415';
const DATA_DIR = 'noclip_data';

const PATREON_URL = parse('https://www.patreon.com/api/posts');
const POST_DATA_FILE = `./${DATA_DIR}/data.json`;

const PROTO_QUERY = {
  'sort': '-published_at',
  'filter[campaign_id]': CAMPAIGN_ID_NOCLIP,
  'filter[is_draft]': 'false',
  'filter[contains_exclusive_posts]': 'true',
  'fields[user]': 'image_url,full_name,url',
  'json-api-use-default-includes': 'false',
  'json-api-version': '1.0  ',
  'include':
      'user,attachments,user_defined_tags,campaign,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,access_rules.tier.null',
  'fields[post]':
      'change_visibility_at,comment_count,content,current_user_can_delete,current_user_can_view,current_user_has_liked,embed,image,is_paid,like_count,min_cents_pledged_to_view,post_file,published_at,patron_count,patreon_url,post_type,pledge_url,thumbnail_url,teaser_text,title,upgrade_url,url',
  'fields[campaign]': 'earnings_visibility,is_nsfw,is_monthly',
  'fields[access_rule]': 'access_rule_type,amount_cents',
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function getOldData() {
  if (!existsSync(POST_DATA_FILE)) {
    return [];
  }
  return JSON.parse(readFileSync(POST_DATA_FILE).toString()) as DataEntity[];
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function makeReq(
    url: Url, query: {[key: string]: any}, pageCursor?: string,
    cookies: Cookie[] = []) {
  if (pageCursor) {
    query = {...query, 'page[cursor]': pageCursor};
  }

  const opts = parse(format({...url, query})) as RequestOptions;
  opts.headers = {
    'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'content-type': 'application/json',
    'cookie': cookies.map(ea => `${ea.name}=${ea.value};`).join(' '),
    //`session_id=${sessionId}`,
    // '__cfduid=dbb829dfa98360b1316e32dc8653fc9351547877162;
    // patreon_device_id=0f577409-64ea-406c-a98f-fd6a6a43d01b;
    // session_id=IM_mbj1wLw88Qq9Knq9I8Z32CT6B78Ce1EoyDlrqGaw;
    // _pendo_visitorId.84b39519-1e4c-483a-47ce-19bf730de8f7=8206404;
    // _pendo_meta.84b39519-1e4c-483a-47ce-19bf730de8f7=3332423499',
    // 'session_id=IM_mbj1wLw88Qq9Knq9I8Z32CT6B78Ce1EoyDlrqGaw;',
  };
  return opts;
}

function requestData(opts: RequestOptions): Promise<PostData> {
  return new Promise((resolve, reject) => {
    get(opts, res => {
      let rawData = '';
      // A chunk of data has been recieved.
      res.on('data', (chunk) => {
        rawData += chunk;
      });

      // The whole resonse has been received. Print out
      // the result.
      res.on('end', () => {
        const data = JSON.parse(rawData) as PostData;
        resolve(data);
        // console.log(JSON.stringify(data, null, 2));
      });
    }).on('error', reject);
  });
}

async function getPatreonCookies() {
  let browser: Browser;
  try {
    browser = await launch({userDataDir: './user_data', headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.patreon.com/noclip/');
    return await page.cookies('https://patreon.com');
  } finally {
    try {
      browser!.close();
    } catch (err) {
    }
  }
}

const baseDataName = formatDateAndTime();
function save(data: any, n: number) {
  if (!existsSync(`./${DATA_DIR}`)) {
    mkdirSync(`./${DATA_DIR}`);
  }
  writeFileSync(
      `./${DATA_DIR}/${baseDataName}_${n}_raw.json`,
      JSON.stringify(data, null, 2));
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

(async () => {
  const cookies = await getPatreonCookies();
  console.log(cookies);
  const sessionId = cookies.find(ea => ea.name === 'session_id');
  if (!sessionId) {
    throw new Error('no session_id cookie found!');
  }
  console.log(`got session_id ${sessionId.value}`);

  const oldPosts = getOldData();
  const oldPostIds = oldPosts.reduce<Set<DataEntity['id']>>(
      (ids, ea) => ids.add(ea.id), new Set());

  let step = 0;
  let nextCursor: string = '';
  const newPosts: DataEntity[] = [];

  while (true) {
    const data = await requestData(
        makeReq(PATREON_URL, PROTO_QUERY, nextCursor, cookies));
    if (data.data) {
      data.data.forEach(d => {
        console.log('%s: %s', d.attributes.published_at, d.attributes.title);
      });
      const existingPostIndex =
          data.data.findIndex(ea => oldPostIds.has(ea.id));
      if (existingPostIndex > -1) {
        newPosts.push(...data.data.slice(0, existingPostIndex));
        if (existingPostIndex > 0) {
          save(data, step++);
        }
        break;
      }
      newPosts.push(...data.data);
      save(data, step++);
    }

    try {
      nextCursor = data.meta.pagination.cursors.next;
    } catch (err) {
      nextCursor = '';
    }
    if (!nextCursor) break;
  }

  if (newPosts.length) {
    console.log(`found ${newPosts.length} new posts!`);
    writeFileSync(
        POST_DATA_FILE, JSON.stringify(newPosts.concat(oldPosts), null, 2));
    const fname = resolve(POST_DATA_FILE);
    console.log(`wrote ${fname}`);
  } else {
    console.log('found no new posts :(()');
  }
})().then(() => console.log('done'))
    .catch(err => console.error(err));
