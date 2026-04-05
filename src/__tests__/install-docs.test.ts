import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(__dirname, "..", "..");

function read(relPath: string) {
  return readFileSync(join(repoRoot, relPath), "utf8");
}

describe("install/update docs messaging", () => {
  it("root README promotes curl pipe sh as the preferred install", () => {
    const readme = read("README.md");

    expect(readme).toContain("**Preferred install:**");
    expect(readme).toContain("curl -fsSL https://threatcrush.com/install.sh | sh");
    expect(readme).toContain("threatcrush update");
    expect(readme).toContain("threatcrush remove");
    expect(readme).toContain("bootstrap Node.js with `mise`");
    expect(readme).toContain("**Server** → installs the CLI");
    expect(readme).toContain("**Desktop** → installs the CLI + desktop app");
  });

  it("CLI README promotes curl pipe sh and threatcrush lifecycle commands", () => {
    const readme = read("cli/README.md");

    expect(readme).toContain("**Preferred install:**");
    expect(readme).toContain("curl -fsSL https://threatcrush.com/install.sh | sh");
    expect(readme).toContain("threatcrush update");
    expect(readme).toContain("threatcrush remove");
    expect(readme).toContain("bootstrap Node.js with `mise`");
    expect(readme).toContain("**Server** → installs the CLI");
    expect(readme).toContain("**Desktop** → installs the CLI + desktop app");
  });

  it("homepage copy uses installer URL and highlights server vs desktop lifecycle", () => {
    const homePage = read("src/app/page.tsx");

    expect(homePage).toContain("curl -fsSL https://threatcrush.com/install.sh | sh");
    expect(homePage).toContain("threatcrush update");
    expect(homePage).toContain("threatcrush remove");
    expect(homePage).toContain("server</span> or <span className=\"text-tc-green\">desktop");
    expect(homePage).toContain("CLI + desktop app");
    expect(homePage).toContain("bootstrap Node.js with");
    expect(homePage).toContain(">mise<");
  });
});
