import { describe, expect, it } from "vitest";
import { extractSkills, matchScore } from "../services/ai";

describe("ai helpers", () => {
  it("extracts known skills", () => {
    expect(extractSkills("Built apps with React and Node.js")).toEqual(expect.arrayContaining(["react", "node.js"]));
  });
  it("computes match score", () => {
    expect(matchScore(["React", "Git"], ["react", "node.js"])).toBe(50);
    expect(matchScore([], [])).toBe(50);
  });
});
