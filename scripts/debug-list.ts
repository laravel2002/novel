import "dotenv/config";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());

async function run() {
  const cookiesJson = process.env.TTC_COOKIES_JSON;
  if (!cookiesJson) return console.log("No cookies");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  
  try {
    const cookies = JSON.parse(cookiesJson);
    await page.setCookie(...cookies);
    
    const url = "https://tiemtruyenchu.com/danh-sach";
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2" });
    
    const html = await page.content();
    fs.writeFileSync("debug-list-page.html", html, "utf-8");
    console.log("Saved to debug-list-page.html");
    
    console.log("URL after navigation:", page.url());
    console.log("Includes '/logout':", html.includes('href="/logout"'));
    console.log("Includes '/login':", html.includes('href="/login"'));
    
    // Check for story elements
    const storyCount = (html.match(/class="story"/g) || []).length;
    console.log("Story elements found (class='story'):", storyCount);
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
