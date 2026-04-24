import "dotenv/config";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());

async function run() {
  const cookiesJson = process.env.TTC_COOKIES_JSON;
  if (!cookiesJson) {
    console.log("No cookies in .env");
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  
  try {
    const cookies = JSON.parse(cookiesJson);
    console.log("Setting cookies...");
    await page.setCookie(...cookies);
    
    console.log("Navigating to home...");
    await page.goto("https://tiemtruyenchu.com/", { waitUntil: "networkidle2" });
    
    const html = await page.content();
    fs.writeFileSync("debug-cookie-result.html", html, "utf-8");
    console.log("Saved to debug-cookie-result.html");
    
    console.log("Page includes 'ĐĂNG XUẤT':", html.includes("ĐĂNG XUẤT"));
    console.log("Page includes 'ĐĂNG NHẬP':", html.includes("ĐĂNG NHẬP"));
    console.log("Page includes 'Tài khoản':", html.includes("Tài khoản"));
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
