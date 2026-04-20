import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  console.log("Navigating to home page...");
  await page.goto("https://tiemtruyenchu.com/", { waitUntil: "networkidle2" });
  
  const content = await page.content();
  fs.writeFileSync("testHome.html", content, "utf-8");
  console.log("Saved home page to testHome.html");
  console.log("Title:", await page.title());
  
  await browser.close();
}

run();
