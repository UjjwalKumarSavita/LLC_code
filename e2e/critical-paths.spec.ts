import { expect, test } from "@playwright/test";

test.describe("public learner paths", () => {
  test("landing, problem discovery, and auth protection remain available", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LLC_code/);
    await page.getByRole("button", { name: "Start solving" }).click();
    await expect(page).toHaveURL(/\/problems$/);

    await expect(page.getByRole("heading", { name: /Choose the next/ })).toBeVisible();
    await expect(page.getByText(/5\d RESULTS/)).toHaveCount(1);
    await page.getByLabel("Search problems").fill("Two Sum");
    await expect(page.locator('a[href="/problems/two-sum"]')).toBeVisible();

    await page.goto("/submissions");
    await expect(page).toHaveURL(/\/login\?next=%2Fsubmissions|\/login\?next=\/submissions/);
    await expect(page.getByRole("heading", { name: "Log in to LLC_code" })).toBeVisible();
  });

  test("landing controls and legal links perform real actions", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Watch the system" }).click();
    await expect(page.locator("#visualizer")).toBeInViewport();

    await page.getByRole("button", { name: "Next step" }).click();
    await expect(page.getByText("STEP 02 / 07")).toBeVisible();

    await page.getByRole("link", { name: "Privacy" }).click();
    await expect(page.getByRole("heading", { name: "Your code stays under your control." })).toBeVisible();
  });

  test("workspace sample tabs update the visible sample input", async ({ page }) => {
    await page.goto("/problems/two-sum");
    const preview = page.getByLabel("SAMPLE INPUT PREVIEW");
    const firstInput = await preview.inputValue();
    await page.getByRole("button", { name: "Case 2" }).click();
    await expect(preview).not.toHaveValue(firstInput);
  });

  test("workspace opens an editable incomplete starter scaffold", async ({ page }) => {
    await page.goto("/problems/two-sum");
    const editorSurface = page.locator(".monaco-editor, .basic-code-editor");
    const basicEditor = page.locator(".basic-code-editor");
    await expect(editorSurface).toBeVisible();

    if (await basicEditor.isVisible()) {
      await expect(basicEditor).toHaveValue(/TODO/);
      await expect(basicEditor).not.toHaveValue(/complement/);
      await basicEditor.fill("print('editor works')");
      await expect(basicEditor).toHaveValue("print('editor works')");
    } else {
      await expect(page.locator(".view-lines")).toContainText("TODO");
      await expect(page.locator(".view-lines")).not.toContainText("complement");
      await page.locator(".view-lines").click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type("print('editor works')");
      await expect(page.locator(".view-lines")).toContainText("editor works");
    }
    await expect(page.getByRole("button", { name: "Run public tests" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit solution" })).toBeVisible();
  });

  test("roadmaps connect structured paths to real problem workspaces", async ({ page }) => {
    await page.goto("/roadmaps");
    await expect(page.getByRole("heading", { name: /Learn patterns/ })).toBeVisible();
    await expect(page.locator('a[href="/roadmaps/programming-foundations"]')).toBeVisible();

    await page.locator('a[href="/roadmaps/programming-foundations"]').click();
    await expect(page.getByRole("heading", { name: "Programming foundations" })).toBeVisible();
    const firstNode = page.locator(".roadmap-node").filter({ hasText: "Fizz Buzz" });
    await expect(firstNode).toBeVisible();
    await firstNode.getByRole("link", { name: "SOLVE →", exact: true }).click();
    await expect(page).toHaveURL(/\/problems\/fizz-buzz$/);
    await expect(page.locator(".problem-heading-row h1")).toHaveText("Fizz Buzz");
  });

  test("unknown routes render the designed recovery surface", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText("ROUTE NOT FOUND")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse problems" })).toBeVisible();
  });
});

test.describe("admin CMS critical path", () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  test.skip(
    !email || !password,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the CMS lifecycle check.",
  );

  test("creates, reviews, publishes, exposes, and archives a problem", async ({
    page,
    context,
    isMobile,
  }, testInfo) => {
    test.skip(isMobile, "The destructive CMS lifecycle runs once in desktop Chrome.");
    test.setTimeout(60_000);

    const suffix = `${Date.now()}-${testInfo.workerIndex}`;
    const title = `CMS Verification ${suffix}`;
    const slug = `cms-verification-${suffix}`;
    let problemId = "";

    await page.goto("/login?next=/admin/problems");
    await page.locator('input[name="email"]').fill(email!);
    await page.locator('input[name="password"]').fill(password!);
    const [loginResponse] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().endsWith("/api/auth/login"),
      ),
      page.getByRole("button", { name: /ENTER THE LAB/ }).click(),
    ]);
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = (await loginResponse.json()) as {
      user?: { role?: string };
    };
    expect(loginData.user?.role).toBe("SUPER_ADMIN");
    await expect
      .poll(async () => (await context.cookies()).map((cookie) => cookie.name))
      .toContain("llc_refresh");
    const sessionStatus = await page.evaluate(async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      return response.status;
    });
    expect(sessionStatus).toBe(200);
    await page.goto("/admin/problems");
    await expect(page.getByRole("heading", { name: "Problem CMS" })).toBeVisible();

    try {
      await page.getByRole("link", { name: /NEW PROBLEM/ }).click();
      await page.getByLabel("TITLE", { exact: true }).fill(title);
      await page.getByLabel("TITLE", { exact: true }).press("Tab");
      await expect(page.getByLabel("URL SLUG")).toHaveValue(slug);
      await page
        .getByRole("combobox", { name: "VISIBILITY" })
        .selectOption("PUBLIC");
      await page
        .getByLabel("SHORT DESCRIPTION")
        .fill("A disposable local problem that verifies the complete CMS publishing lifecycle.");
      await page.getByLabel(/TAGS/).fill("qa, cms");

      await page.getByRole("button", { name: /CONTENT$/ }).click();
      await page
        .getByLabel("PROBLEM STATEMENT")
        .fill("Given one integer, print the same integer. This problem verifies the local publishing workflow.");
      await page.getByLabel("INPUT FORMAT").fill("One integer.");
      await page.getByLabel("OUTPUT FORMAT").fill("Print the same integer.");
      await page.getByLabel("CONSTRAINTS").fill("-1000000 <= value <= 1000000");

      await page.getByRole("button", { name: /EXAMPLES$/ }).click();
      await page.getByLabel("INPUT", { exact: true }).fill("7");
      await page.getByLabel("EXPECTED OUTPUT", { exact: true }).fill("7");

      await page.getByRole("button", { name: /TESTS$/ }).click();
      await page.getByLabel("INPUT", { exact: true }).fill("42");
      await page.getByLabel("EXPECTED OUTPUT", { exact: true }).fill("42");

      await page.getByRole("button", { name: "SAVE DRAFT", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/problems\/[^/]+\/edit$/);
      problemId = page.url().match(/\/admin\/problems\/([^/]+)\/edit$/)?.[1] ?? "";
      expect(problemId).not.toBe("");

      await page.getByRole("button", { name: "SEND TO REVIEW", exact: true }).click();
      await expect(page.getByText("Submitted for review.")).toBeVisible();
      await page.getByRole("button", { name: "06 REVIEW", exact: true }).click();
      await page.getByRole("button", { name: "PUBLISH PROBLEM" }).click();
      await expect(page.getByText("Problem published.")).toBeVisible();

      await page.goto(`/problems/${slug}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    } finally {
      if (problemId) {
        await page.evaluate(async (id) => {
          await fetch(`/api/cms/problems/${id}`, { method: "DELETE" });
        }, problemId);
      }
    }
  });

  test("authors, reviews, publishes, exposes, and archives an editorial", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "The editorial mutation lifecycle runs once in desktop Chrome.");
    test.setTimeout(60_000);

    await page.goto("/login?next=/admin/editorials");
    await page.locator('input[name="email"]').fill(email!);
    await page.locator('input[name="password"]').fill(password!);
    const [loginResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/api/auth/login")),
      page.getByRole("button", { name: /ENTER THE LAB/ }).click(),
    ]);
    expect(loginResponse.ok()).toBeTruthy();
    await page.goto("/admin/editorials");
    await expect(page.getByRole("heading", { name: "Editorial CMS" })).toBeVisible();
    await expect(page.getByText("25 / 50")).toBeVisible();

    await page.getByLabel("Search editorial problems").fill("Power of Two");
    const row = page.getByRole("row").filter({ hasText: "Power of Two" });
    await row.getByRole("link", { name: /AUTHOR|EDIT/ }).click();
    await expect(page.getByRole("heading", { name: "Power of Two" })).toBeVisible();

    try {
      await page.getByLabel("INTUITION").fill(
        "Bit identity editorial verification: a positive power of two contains exactly one set bit.",
      );
      await page.getByLabel("BRUTE-FORCE BASELINE").fill(
        "Repeatedly divide the value by two and reject any odd intermediate value.",
      );
      await page.getByLabel(/OPTIMIZED APPROACH/).fill(
        "Reject non-positive values.\nSubtract one from the value.\nConfirm that n AND (n - 1) equals zero.",
      );
      await page.getByLabel("DRY RUN").fill(
        "For 16, binary 10000 AND binary 01111 equals zero, so the result is true.",
      );
      await page.getByLabel("COMPLEXITY").fill("O(1) time · O(1) space");
      await page.getByLabel("COMMON MISTAKES").fill(
        "Zero must be rejected even though the bit expression alone evaluates to zero.",
      );

      await page.getByRole("button", { name: "SAVE DRAFT", exact: true }).click();
      await expect(page.getByText("Editorial draft saved.")).toBeVisible();
      await page.getByRole("button", { name: "SEND TO REVIEW", exact: true }).click();
      await expect(page.getByText("Editorial submitted for review.")).toBeVisible();
      await page.getByRole("button", { name: "PUBLISH EDITORIAL" }).click();
      await expect(page.getByText("Editorial published to learners.")).toBeVisible();

      await page.goto("/problems/power-of-two");
      await page.getByRole("tab", { name: "Editorial" }).click();
      await expect(page.getByText(/Bit identity editorial verification/)).toBeVisible();
    } finally {
      await page.evaluate(async () => {
        const response = await fetch("/api/cms/editorials");
        const items = (await response.json()) as Array<{ id: string; slug: string }>;
        const problem = items.find((item) => item.slug === "power-of-two");
        if (problem) {
          await fetch(`/api/cms/editorials/${problem.id}`, { method: "DELETE" });
        }
      });
    }
  });
});

test.describe("authenticated critical paths", () => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated checks.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login?next=/submissions");
    await page.locator('input[name="email"]').fill(email!);
    await page.locator('input[name="password"]').fill(password!);
    await page.getByRole("button", { name: /ENTER THE LAB/ }).click();
    await expect(page).toHaveURL(/\/submissions$/);
  });

  test("submission archive and detail remain account-backed", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Every attempt/ })).toBeVisible();
    const records = page.locator('a[href^="/submissions/"]');
    if (await records.count()) {
      await records.first().click();
      await expect(page.getByText("SOURCE REVIEW")).toBeVisible();
      await expect(page.getByText("SAFE DIAGNOSTICS")).toBeVisible();
      await expect(page.getByText(/hidden case|hidden cases/)).toBeVisible();
    }
  });

  test("published editorial and visualizers respond to learner controls", async ({ page }) => {
    await page.goto("/problems/two-sum");
    await page.getByRole("tab", { name: "Editorial" }).click();
    await expect(
      page.getByText(/Every value needs one exact complement/),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Brute-force baseline" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dry run" })).toBeVisible();
    await expect(page.getByText("COMMON MISTAKES")).toBeVisible();
    await expect(page.getByText("O(n) time · O(n) space")).toBeVisible();

    await page.getByRole("tab", { name: "Visualizer" }).click();
    await expect(page.getByRole("heading", { name: "Initialize memory" })).toBeVisible();
    await page.getByRole("button", { name: "Next visualizer step" }).click();
    await expect(page.getByRole("heading", { name: "Inspect 2" })).toBeVisible();
    await expect(page.getByText("STEP 2 / 5")).toBeVisible();

    await page.goto("/problems/running-sum");
    await page.getByRole("tab", { name: "Visualizer" }).click();
    await expect(page.getByRole("heading", { name: "Start the prefix" })).toBeVisible();
    await page.getByRole("button", { name: "Next visualizer step" }).click();
    await expect(page.getByRole("heading", { name: "Include 2" })).toBeVisible();
  });
});
