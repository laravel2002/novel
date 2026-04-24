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
  
  console.log("Navigating to login...");
  await page.goto("https://tiemtruyenchu.com/login", { waitUntil: "networkidle2" });
  
  const content = await page.content();
  fs.writeFileSync("debug-login.html", content, "utf-8");
  console.log("Saved login page to debug-login.html");
  
  // Kiểm tra xem các thẻ input có tồn tại không
  const hasUser = await page.$("input[name='username']");
  const hasPass = await page.$("input[name='password']");
  console.log("Has username input:", !!hasUser);
  console.log("Has password input:", !!hasPass);
  
  await browser.close();
}

run();
