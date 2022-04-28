import puppeteer from "puppeteer";
import { forwardConsole, logRequests } from "./util-puppeteer";
import { PostData } from "./PostDataInterface";

function makeQuery(campaignId: string, cursor: string): { [key: string]: string } {
  return {
    "page[cursor]": cursor,
    sort: "-published_at",
    "filter[campaign_id]": campaignId,
    "filter[is_draft]": "false",
    "filter[contains_exclusive_posts]": "true",
    "fields[user]": "image_url,full_name,url",
    "json-api-use-default-includes": "false",
    "json-api-version": "1.0",
    include:
      "campaign,access_rules,attachments,audio,images,media,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,user,user_defined_tags,ti_checks",
    "fields[post]":
      "change_visibility_at,comment_count,content,current_user_can_comment,current_user_can_delete,current_user_can_view,current_user_has_liked,embed,image,is_paid,like_count,meta_image_url,min_cents_pledged_to_view,post_file,post_metadata,published_at,patreon_url,post_type,pledge_url,thumbnail_url,teaser_text,title,upgrade_url,url,was_posted_by_campaign_owner,has_ti_violation",
    "fields[post_tag]": "tag_type,value",
    "fields[campaign]":
      "currency,show_audio_post_download_links,avatar_photo_url,earnings_visibility,is_nsfw,is_monthly,name,url",
    "fields[access_rule]": "access_rule_type,amount_cents",
    "fields[media]": "id,image_urls,download_url,metadata,file_name",
  };
}

export class GetPatreonPosts {
  private browser?: puppeteer.Browser;
  private page?: puppeteer.Page;

  constructor(private campaignId: string, private debug = false) {}

  public async setup() {
    await this.ensureBrowser();
    await this.loadPage();
  }

  public async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async ensureBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ userDataDir: "./user_data", headless: false });
    }
    return this.browser;
  }

  private async loadPage(): Promise<puppeteer.Page> {
    if (this.page) {
      return this.page;
    }
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();
    await page.goto("https://www.patreon.com/");
    if (this.debug) {
      logRequests(page);
      forwardConsole(page);
    }
    return (this.page = page);
  }

  public async loadCookies(): Promise<puppeteer.Protocol.Network.Cookie[]> {
    return await (await this.loadPage()).cookies("https://patreon.com");
  }

  public async loadPosts(cursor = ""): Promise<PostData> {
    const page = await this.loadPage();
    const query = makeQuery(this.campaignId, cursor);
    const queryString = Object.keys(query)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
      .join("&");
    const url = `https://www.patreon.com/api/posts?${queryString}`;
    const data = await page.evaluate<(arg: string) => Promise<PostData>>(async (url) => {
      const req = {
        headers: {
          "content-type": "application/vnd.api+json",
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
        },
      };
      try {
        const result = await (globalThis as any).fetch(url, req);
        return await result.json();
      } catch (err) {
        console.error(err);
      }
    }, url);

    // console.log(JSON.stringify(data, null, 2));

    return data;
  }
}
