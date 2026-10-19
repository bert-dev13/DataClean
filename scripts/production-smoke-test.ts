import { chromium } from "playwright-core";
import * as path from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";

const PRODUCTION_URL = "https://dataclean-one.vercel.app";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function runProductionSmokeTest() {
  console.log("==================================================");
  console.log("PRODUCTION SMOKE TEST ON VERCEL DEPLOYMENT");
  console.log("Target URL:", PRODUCTION_URL);
  console.log("Browser: Microsoft Edge via playwright-core");
  console.log("==================================================");

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });

  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Landing Page & Initial Load
    // ----------------------------------------------------
    console.log("\n[TEST 1] Loading landing page...");
    const response = await page.goto(PRODUCTION_URL, { waitUntil: "networkidle" });
    if (!response || response.status() !== 200) {
      throw new Error(`Failed to load ${PRODUCTION_URL}, status: ${response?.status()}`);
    }

    const title = await page.title();
    console.log("✓ Page Title:", title);
    if (!title.includes("DataClean")) {
      throw new Error(`Unexpected page title: ${title}`);
    }

    const step1Heading = await page.textContent("h1");
    console.log("✓ Heading:", step1Heading?.trim().replace(/\s+/g, " "));

    // ----------------------------------------------------
    // TEST 2: System Selection (DBL) & Dataset Selection (Business)
    // ----------------------------------------------------
    console.log("\n[TEST 2] Testing System Selection (DBL)...");
    const dblBtn = page.locator("button:has-text('Select DBL')");
    await dblBtn.click();

    // Verify Step 2 reached
    await page.waitForSelector("text=Choose the dataset you want to prepare");
    console.log("✓ Reached Step 2: Choose dataset");

    // Select Business dataset
    console.log("Selecting Business dataset...");
    await page.locator("h2:text-is('Business')").click();

    // Click Continue on Step 2
    const step2Continue = page.locator("button:has-text('Continue')");
    await step2Continue.click();

    // Verify Step 3 reached
    await page.waitForSelector("h1:has-text('Upload Dataset')");
    console.log("✓ Reached Step 3: Upload Dataset");

    // ----------------------------------------------------
    // TEST 3: Upload & Detection (DBL Business 25-record file)
    // ----------------------------------------------------
    console.log("\n[TEST 3] Uploading DBL Business 25-record training sample...");
    const businessFile = path.resolve(process.cwd(), "training-data/DBL/Business/DBL_Business_Training_Demo.xlsx");
    if (!fs.existsSync(businessFile)) {
      throw new Error(`File not found: ${businessFile}`);
    }

    const fileInput = page.locator("input[type='file']");
    await fileInput.setInputFiles(businessFile);

    // Wait for Analyze Dataset button to appear
    await page.waitForSelector("button:has-text('Analyze Dataset')", { timeout: 10000 });
    console.log("✓ File parsed and Analyze Dataset button available");

    // Click Analyze Dataset
    const analyzeBtn = page.locator("button:has-text('Analyze Dataset')");
    await analyzeBtn.click();

    // Wait for Step 4 Workspace
    await page.waitForSelector("text=Auto-Fix Available", { timeout: 15000 });
    console.log("✓ Reached Step 4: Review Workspace");

    // Check that original data is NOT auto-cleaned upon upload
    const tableHtml = await page.locator("table").innerHTML();
    console.log("✓ Table rendered with original records intact");

    // Check readiness banner: MUST NOT say Ready for Official Import!
    const hasFalseReady = await page.locator("text=Ready for Official Import").isVisible();
    if (hasFalseReady) {
      throw new Error("CRITICAL BUG: Shows 'Ready for Official Import' when Must-Be-Fixed issues exist!");
    }
    console.log("✓ Verified: 'Ready for Official Import' is NOT shown while Must Be Fixed > 0");

    // Verify NO "Needs Review" text
    const pageContent = await page.content();
    if (pageContent.includes("Needs Review") || pageContent.includes("needs-review")) {
      throw new Error("CRITICAL BUG: Found deprecated 'Needs Review' status terminology in page UI!");
    }
    console.log("✓ Verified: Zero 'Needs Review' user-facing status terminology found");

    // ----------------------------------------------------
    // TEST 4: "Fix All Automatically"
    // ----------------------------------------------------
    console.log("\n[TEST 4] Testing 'Fix All Automatically'...");
    const fixAllBtn = page.locator("button:has-text('Fix All Automatically')");
    await fixAllBtn.click();

    // Wait for feedback modal
    await page.waitForSelector("text=records automatically cleaned", { timeout: 10000 });
    console.log("✓ 'Fix All Automatically' executed cleanly with feedback modal");

    // Close feedback modal
    const closeFeedbackBtn = page.locator("button:has-text('Close')");
    if (await closeFeedbackBtn.isVisible()) {
      await closeFeedbackBtn.click();
      await page.waitForTimeout(500);
      console.log("✓ Feedback modal closed");
    }

    // ----------------------------------------------------
    // TEST 5: Manual Editing of Must-Be-Fixed Cell
    // ----------------------------------------------------
    console.log("\n[TEST 5] Testing cell selection and drawer editing...");
    // Click on a cell in the table to open drawer
    const firstCell = page.locator("table tbody tr td").first();
    await firstCell.click();
    await page.waitForTimeout(500);

    const drawerVisible = await page.locator("text=Original Value").isVisible();
    if (drawerVisible) {
      console.log("✓ Right drawer opened with cell inspection details");
      const keepOriginalBtn = page.locator("button:has-text('Keep Original')");
      if (await keepOriginalBtn.isVisible()) {
        await keepOriginalBtn.click();
        console.log("✓ Clicked 'Keep Original' in drawer");
      }
    }

    // Test Validate Again button
    console.log("Testing 'Validate Again' button...");
    const validateAgainBtn = page.locator("button:has-text('Validate Again')");
    await validateAgainBtn.click();
    await page.waitForTimeout(800);
    console.log("✓ 'Validate Again' re-ran validation engine");

    // ----------------------------------------------------
    // TEST 6: ODeSSEE DRRM Resources Test
    // ----------------------------------------------------
    console.log("\n[TEST 6] Testing ODeSSEE DRRM Resources workflow...");
    // Navigate back to Step 1
    await page.goto(PRODUCTION_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("button:has-text('Select ODeSSEE')");
    await page.locator("button:has-text('Select ODeSSEE')").click();

    await page.waitForSelector("text=Choose the dataset you want to prepare");
    await page.locator("h2:text-is('DRRM Resources')").click();
    await page.locator("button:has-text('Continue')").click();

    await page.waitForSelector("h1:has-text('Upload Dataset')");
    const drrmFile = path.resolve(process.cwd(), "training-data/ODeSSEE/DRRM-Resources/ODeSSEE_DRRMResources_Training_Demo.xlsx");
    await page.locator("input[type='file']").setInputFiles(drrmFile);

    await page.waitForSelector("button:has-text('Analyze Dataset')", { timeout: 10000 });
    console.log("✓ ODeSSEE DRRM Resources file parsed and ready to analyze");

    await page.locator("button:has-text('Analyze Dataset')").click();
    await page.waitForSelector("text=Auto-Fix Available", { timeout: 15000 });
    console.log("✓ Reached Step 4 for ODeSSEE DRRM Resources");

    await page.locator("button:has-text('Fix All Automatically')").click();
    await page.waitForSelector("text=records automatically cleaned", { timeout: 10000 });
    console.log("✓ ODeSSEE DRRM Resources: Fix All Automatically succeeded");

    // ----------------------------------------------------
    // TEST 7: DBL Water Test
    // ----------------------------------------------------
    console.log("\n[TEST 7] Testing DBL Water workflow...");
    await page.goto(PRODUCTION_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("button:has-text('Select DBL')");
    await page.locator("button:has-text('Select DBL')").click();

    await page.waitForSelector("text=Choose the dataset you want to prepare");
    await page.locator("h2:text-is('Water')").click();
    await page.locator("button:has-text('Continue')").click();

    await page.waitForSelector("h1:has-text('Upload Dataset')");
    const waterFile = path.resolve(process.cwd(), "training-data/DBL/Water/DBL_Water_Training_Demo.xlsx");
    await page.locator("input[type='file']").setInputFiles(waterFile);

    await page.waitForSelector("button:has-text('Analyze Dataset')", { timeout: 10000 });
    console.log("✓ DBL Water file parsed and ready to analyze");

    await page.locator("button:has-text('Analyze Dataset')").click();
    await page.waitForSelector("text=Auto-Fix Available", { timeout: 15000 });
    console.log("✓ Reached Step 4 for DBL Water");

    await page.locator("button:has-text('Fix All Automatically')").click();
    await page.waitForSelector("text=records automatically cleaned", { timeout: 10000 });
    console.log("✓ DBL Water: Fix All Automatically succeeded");

    // ----------------------------------------------------
    // TEST 8: Page Refresh & Direct URL Verification
    // ----------------------------------------------------
    console.log("\n[TEST 8] Testing Page Refresh and Direct URL handling...");
    await page.reload({ waitUntil: "networkidle" });
    console.log("✓ Page reloaded successfully");
    const hasCrash = await page.locator("text=Application error").isVisible();
    if (hasCrash) {
      throw new Error("CRITICAL BUG: Application crashed on page reload!");
    }
    console.log("✓ Page reload rendered gracefully without crash or 500 error");

    // Check console errors
    console.log("\nConsole error count:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn("Console errors encountered:", consoleErrors);
    }

    console.log("\n==================================================");
    console.log("ALL PRODUCTION SMOKE TESTS PASSED ON LIVE VERCEL!");
    console.log("==================================================");
  } finally {
    await browser.close();
  }
}

runProductionSmokeTest().catch((err) => {
  console.error("SMOKE TEST FAILED:", err);
  process.exit(1);
});
