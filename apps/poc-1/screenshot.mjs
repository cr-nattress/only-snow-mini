import puppeteer from 'puppeteer';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const userProfile = JSON.stringify({
  home_location: { lat: 39.7392, lng: -104.9903, display_name: "Denver, CO" },
  max_drive_minutes: 120,
  passes: ["ikon"],
  specific_resort_pass: null,
  preferences: ["powder", "close_easy"],
  onboarding_complete: true,
  alert_settings: { frequency: "big_storms", timing: "night_before", min_snowfall_inches: 6, resort_filter: "all" },
  deferred_profile: {},
});

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    // Set localStorage before navigating
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate((profile) => {
      localStorage.setItem('onlysnow_user', profile);
    }, userProfile);

    // Now navigate to dashboard
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.waitForSelector('header', { timeout: 5000 }).catch(() => {});
    // Small delay for hydration
    await new Promise(r => setTimeout(r, 500));

    const filename = `/tmp/onlysnow-dashboard-${vp.name}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`Saved: ${filename} (${vp.width}x${vp.height})`);

    await page.close();
  }

  await browser.close();
})();
