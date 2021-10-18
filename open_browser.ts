import puppeteer from "puppeteer";

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

async function visitPatreon() {
  const browser = await puppeteer.launch({ userDataDir: "./user_data", headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.patreon.com/noclip/");
}

(async () => {
  const args = process.argv.slice(2);
  const check = args.includes("--check-cookies");

  if (check) {
    console.log("Patreon session cookie:");
    const cookies = await getPatreonCookies();
    const sessionId = cookies.find((ea) => ea.name === "session_id");
    console.log(sessionId);
  } else {
    await visitPatreon();
  }
})()
  .then(() => console.log("done"))
  .catch((err) => console.error(err));
