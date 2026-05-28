import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");
const MAX_RETRIES = 2;
const TIMEOUT = 30_000;

function ensureDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

export async function captureScreenshot(
  url: string,
  projectId: string
): Promise<string | null> {
  ensureDir();
  const filename = `${projectId}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: TIMEOUT });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: filepath, type: "png" });
      await browser.close();
      return `/screenshots/${filename}`;
    } catch (error) {
      if (browser) await browser.close().catch(() => {});
      if (attempt === MAX_RETRIES) {
        console.error(`Screenshot failed for ${url} after ${MAX_RETRIES + 1} attempts:`, error);
        return null;
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}
