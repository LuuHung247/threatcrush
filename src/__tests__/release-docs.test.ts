import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(__dirname, "..", "..");

describe("release docs and mobile workflow", () => {
  it("adds an Expo/EAS mobile release workflow", () => {
    const workflow = readFileSync(join(repoRoot, ".github/workflows/mobile-release.yml"), "utf8");

    expect(workflow).toContain("name: Mobile Release");
    expect(workflow).toContain("expo/expo-github-action@v8");
    expect(workflow).toContain("eas build");
    expect(workflow).toContain("EXPO_TOKEN");
  });

  it("documents release automation in /docs/releases", () => {
    const page = readFileSync(join(repoRoot, "src/app/docs/releases/page.tsx"), "utf8");

    expect(page).toContain("Release Automation");
    expect(page).toContain("Mobile Release");
    expect(page).toContain("Desktop Release");
    expect(page).toContain("EXPO_TOKEN");
    expect(page).toContain("workflow definitions");
  });
});
