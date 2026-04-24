import * as cheerio from "cheerio";

async function run() {
  const url = "https://www.tiemtruyenchu.com/truyen/2192";
  console.log("Fetching", url);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  };
  const res = await fetch(url, { headers });
  const html = await res.text();
  console.log("Status:", res.status);
  console.log("HTML length:", html.length);
  console.log("Snippet:", html.substring(0, 500));
}

run();
