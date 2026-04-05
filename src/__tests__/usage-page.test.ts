import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(__dirname, "..", "..");

describe("usage page auth gating", () => {
  it("redirects unauthenticated users to login", () => {
    const page = readFileSync(join(repoRoot, "src/app/usage/page.tsx"), "utf8");

    expect(page).toContain('redirect("/auth/login?next=/usage")');
    expect(page).toContain("requireUsageAccess");
    expect(page).toContain("cookies");
  });
});
