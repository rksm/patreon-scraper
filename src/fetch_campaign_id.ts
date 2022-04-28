import puppeteer from "puppeteer";
import { format, Url, parse } from "url";

async function getCampaignId(url: Url) {
  console.log("Looking for campaign_id...");
  let browser: puppeteer.Browser;
  try {
    browser = await puppeteer.launch({ userDataDir: "./user_data", headless: false });
    const page = await browser.newPage();
    await page.goto(format(url));

    const creator = await page
      .waitForFunction(
        "window.patreon && window.patreon.bootstrap && window.patreon.bootstrap.creator",
        { timeout: 10000 }
      )
      .then((data) => data.jsonValue() as any);
    const campaignUrl = creator.data.attributes.url;
    const name = creator.data.attributes.name;
    const campaignId = creator.data.id;

    console.log(`The campaign_id of ${campaignUrl} (${name}) is ${campaignId}`);
  } finally {
    try {
      browser!.close();
    } catch (err) {}
  }
}

async function main(): Promise<void> {
  const urlArg = process.argv.slice(2)[0];
  if (!urlArg) {
    console.error("Please provide a url in the form of https://www.patreon.com/NAME");
    return;
  }
  let url: Url;
  try {
    url = parse(urlArg);
  } catch (err) {
    console.error(`Please provide a valid URL`);
    return;
  }

  await getCampaignId(url);
}

main().catch((err) => console.error(err));
