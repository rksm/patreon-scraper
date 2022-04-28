import puppeteer from "puppeteer";

export function logRequests(page: puppeteer.Page) {
  page.on("requestfailed", (request) => {
    console.log(`<= ${request.url()} ${request.method()} FAILED ${request.failure()?.errorText}`);
  });
  page.on("requestfinished", (request) => {
    console.log(`<= ${request.url()} ${request.method()} OK`);
    const logHeaders = false;
    const response = request.response();
    if (logHeaders && response) {
      const headers = response.headers();
      for (const header in headers) {
        console.log(`  ${header}: ${headers[header]}`);
      }
    }
  });
}

export function forwardConsole(page: puppeteer.Page) {
  page.on("console", async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });
}
