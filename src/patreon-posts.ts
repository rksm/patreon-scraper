import puppeteer from "puppeteer";
import { forwardConsole, logRequests } from "./util-puppeteer";
import { DataEntity, PostData } from "./PostDataInterface";
import { Comments } from "./Comments";

export class GetPatreonPosts {
  private browser?: puppeteer.Browser;
  private page?: puppeteer.Page;

  constructor(private campaignId: string, private includeComments = true, private debug = false) {}

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

  public async loadAllPosts(): Promise<DataEntity[]> {
    let step = 0;
    let nextCursor: string = "";
    const newPosts: DataEntity[] = [];

    while (true) {
      const data = await this.loadPosts(nextCursor);
      if (data.data) {
        newPosts.push(...data.data);

        for (const d of data.data) {
          console.log("[%s] %s: %s", step, d.attributes.published_at, d.attributes.title);

          if (this.includeComments) {
            const comments = await new GetPatreonPostComments(
              d.id,
              this.page!,
              this.debug
            ).loadAllComments();
            d.comments = comments;
          }
        }

        step++;
      }

      try {
        nextCursor = data.meta.pagination.cursors.next;
      } catch (err) {
        nextCursor = "";
      }
      if (!nextCursor) break;
    }

    return newPosts;
  }

  private makeQuery(cursor: string): { [key: string]: string } {
    return {
      "page[cursor]": cursor,
      sort: "-published_at",
      "filter[campaign_id]": this.campaignId,
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

  private async loadPosts(cursor = ""): Promise<PostData> {
    const page = await this.loadPage();
    const query = this.makeQuery(cursor);
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

export class GetPatreonPostComments {
  constructor(private postId: string, private page: puppeteer.Page, private debug = false) {}

  private makeQuery(cursor = ""): Record<string, string> {
    return {
      "page[cursor]": cursor,
      include:
        "commenter.campaign.null,commenter.flairs.campaign,parent,post,first_reply.commenter.campaign.null,first_reply.parent,first_reply.post,exclude_replies,on_behalf_of_campaign.null,first_reply.on_behalf_of_campaign.null",
      "fields[comment]":
        "body,created,deleted_at,is_by_patron,is_by_creator,vote_sum,current_user_vote,reply_count",
      "fields[post]": "comment_count",
      "fields[user]": "image_url,full_name,url",
      "fields[flair]": "image_tiny_url,name",
      "page[count]": "50",
      sort: "-created",
      "json-api-use-default-includes": "false",
      "json-api-version": "1.0",
    };
  }

  public async loadAllComments(): Promise<Comments | undefined> {
    let nextCursor: string = "";
    const newComments: Comments[] = [];

    while (true) {
      const data = await this.loadComments(nextCursor);
      newComments.push(data);

      try {
        const nextURL = data.links?.next;
        if (!nextURL) break;
        const query = decodeURIComponent(nextURL.split("?")[1])
          .split("&")
          .map((ea) => {
            const [key, val] = ea.split("=");
            return [key, val];
          })
          .reduce<Record<string, string>>((all, [key, val]) => {
            all[key] = val;
            return all;
          }, {});
        if (!query["page[cursor]"]) break;

        nextCursor = query["page[cursor]"];
        continue;
      } catch (err) {
        break;
      }
    }

    // merge
    const result = newComments.pop();

    if (!result) {
      return undefined;
    }

    if (!result.data) result.data = [];
    if (!result.included) result.included = [];
    if (!result.meta) result.meta = { count: 0 };
    for (const ea of newComments) {
      if (ea.data) result.data.push(...ea.data);
      if (ea.included) result.included.push(...ea.included);
    }
    result.meta.count = result.data.length;
    return result;
  }

  private async loadComments(cursor = ""): Promise<Comments> {
    const query = this.makeQuery(cursor);
    const queryString = Object.keys(query)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
      .join("&");
    const url = `https://www.patreon.com/api/posts/${this.postId}/comments?${queryString}`;
    const data = await this.page.evaluate<(arg: string) => Promise<Comments>>(async (url) => {
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
