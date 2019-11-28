// save cookies as json:
// https://stackoverflow.com/questions/48608971/how-to-manage-log-in-session-through-headless-chrome

import {readdirSync, readFileSync, writeFileSync} from 'fs';
import {JSHandle, launch, Page} from 'puppeteer';


async function waitFor(
    conditionFn: () => any, timeout = 1000, poll = 100): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    while (true) {
      if (Date.now() - start > timeout) {
        reject(new Error('timeout'))
        break;
      }
      const result = await conditionFn();
      if (result) {
        resolve(result);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, poll));
    }
  });
}

async function findLoadMoreButton(page: Page) {
  const handle = await page.evaluateHandle(
      () => Array.from(document.querySelectorAll('button'))
                .find(ea => ea.textContent == 'Load more'));
  return handle.asElement();
}

async function findPosts(page: Page) {
  const posts = await page.evaluateHandle(
      () =>
          Array.from(document.querySelectorAll('div[data-tag=\'post-card\']')));
  return posts
}

async function withPostsDo(
    page: Page, posts: JSHandle, doFn: (posts: JSHandle) => any): Promise<any> {
  return (await page.evaluateHandle(doFn, posts)).jsonValue();
}

async function countPosts(page: Page): Promise<number> {
  const posts = await findPosts(page);
  return (await page.evaluateHandle((posts: [any]) => posts.length, posts)).jsonValue();
}

interface PostData {
  link: string;
  published: string;
  likes: number;
  content: string;
}

async function extractPostData(page: Page) {
  const posts = await findPosts(page);
  const data: PostData[] =
      await (await page.evaluateHandle((posts: HTMLDivElement[]) => {
        return posts.map(post => {
          const linkEl = post.querySelector('a[data-tag="post-published-at"]');
          const link = linkEl ? linkEl.getAttribute('href') : '';
          const published = linkEl ? (linkEl as any).innerText : '';
          const contentEl =
              post.querySelector('div[data-tag="post-content-collapse"]');
          const content = contentEl ? (contentEl as any).outerText : '';
          const likeEl =
              Array.from(post.querySelectorAll('a[role="button"]'))
                  .find(ea => (ea.textContent || '').includes('Like'));
          const likeMatch =
              likeEl ? (likeEl.textContent || '').match(/[0-9]+/) : null;
          const likes = Number(likeMatch && likeMatch[0]) || 0
          return {link, published, likes, content} as PostData;
        });
      }, posts)).jsonValue();

  return data;
}

function postsById(posts: PostData[]) {
  return posts.reduce<{[link: string]: PostData}>(
      (byLink, post) => Object.assign(byLink, {[post.link]: post}), {});
}

// skip posts in oldPosts that are also in newPosts
function concatPosts(newPosts: PostData[], oldPosts: PostData[]) {
  const byLink = newPosts.reduce<{[link: string]: PostData}>(
      (byLink, post) => Object.assign(byLink, {[post.link]: post}), {});

  const startOldIndex = oldPosts.findIndex((oldPost) => !byLink[oldPost.link]);
  return newPosts.concat(oldPosts.slice(startOldIndex));
}



const start = Date.now();
(async () => {
  const newestDataFile =
      readdirSync('.')
          .filter(ea => ea.match(/^[0-9]{4}-[0-9]+-[0-9]+.*\.json$/))
          .sort()
          .reverse()[0];

  const oldPosts: PostData[] =
      newestDataFile ? JSON.parse(readFileSync(newestDataFile).toString()) : [];
  const oldPostsById = postsById(oldPosts);

  // const browser = await launch({headless: false, userDataDir:
  // './user_data'});
  const browser = await launch({userDataDir: './user_data'});
  const page = await browser.newPage();
  await page.goto('https://www.patreon.com/noclip/');

  let postCount = 0;
  console.log(`found posts: ${postCount}`);

  await waitFor(() => findLoadMoreButton(page), 30 * 1000);
  console.log('found load more button');

  postCount = await countPosts(page);
  console.log(`found posts: ${postCount}`);

  const maxLoadMores = Infinity;

  try {
    for (let i = 0; i < maxLoadMores; i++) {
      const posts = await extractPostData(page);
      const seenBefore = posts.find(p => !!oldPostsById[p.link]);
      if (seenBefore) {
        console.log(`Found post ${
            seenBefore.link} we have seen before, stopping search`);
        break;
      }

      const loadMore = await findLoadMoreButton(page)!;
      if (!loadMore) {
        console.log(`no load more button found`);
        break;
      }

      console.log('loading more...');
      loadMore.click();

      postCount = await waitFor(async () => {
        const newPostCount = await countPosts(page);
        const newPosts = newPostCount > postCount;
        console.log(`Loaded new posts: ${newPosts}`);
        return newPosts ? newPostCount : null;
      }, 30 * 1000, 1000);

      console.log(`found posts: ${postCount} (after ${
          (Date.now() - start) / 1000} secs)`);
    }

  } catch (err) {
    console.error(err);
  }

  try {
    const newPosts = await extractPostData(page);
    const allPosts = concatPosts(newPosts, oldPosts);
    const date = new Date();
    const newPostCount = newPosts.filter(ea => !oldPostsById[ea.link]).length;
    console.log(`found ${newPostCount} new posts`);
    writeFileSync(
        `./${date.getFullYear()}-${date.getMonth() + 1}-${
            date.getDate()}_posts.json`,
        JSON.stringify(allPosts, null, 2));

    // console.log(JSON.stringify(newPosts, null, 2));
  } catch (err) {
    console.error(`Error extracting data: `, err);
  }
  await browser.close()
})().then(() => console.log(`done after ${(Date.now() - start) / 1000} secs`))
    .catch((err) => console.error(err));
