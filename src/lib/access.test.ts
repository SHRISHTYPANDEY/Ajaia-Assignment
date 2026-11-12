import { describe, it, expect } from "vitest";
import { resolveAccess } from "./access";
import { textToHtml } from "./textToHtml";

describe("resolveAccess", () => {
  it("returns owner for the document owner", () => {
    expect(resolveAccess(1, [2], 1)).toBe("owner");
  });
  it("returns shared for a user the document is shared with", () => {
    expect(resolveAccess(1, [2], 2)).toBe("shared");
  });
  it("returns null for a user with no access", () => {
    expect(resolveAccess(1, [2], 3)).toBeNull();
  });
  it("owner wins even if also in the shares list", () => {
    expect(resolveAccess(1, [1], 1)).toBe("owner");
  });
});

describe("textToHtml", () => {
  it("splits blank-line separated blocks into paragraphs", () => {
    expect(textToHtml("a\n\nb")).toBe("<p>a</p><p>b</p>");
  });
  it("escapes HTML so imported text cannot inject markup", () => {
    expect(textToHtml("<script>x</script>")).toBe("<p>&lt;script&gt;x&lt;/script&gt;</p>");
  });
});