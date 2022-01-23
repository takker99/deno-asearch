import { Asearch } from "./mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.122.0/testing/asserts.ts";

Deno.test('shoud have property "source"', () => {
  const asearch = Asearch("abcde");
  assertEquals(asearch.source, "abcde");
});

Deno.test("check `test()`", () => {
  const { test } = Asearch("abcde");
  assert(test("abcde", 0));
  assert(test("abcde", 1));
  assert(test("abcde", 2));
  assert(test("abcde", 3));
  assert(!test("abccde", 0));
  assert(test("abccde", 1));
  assert(test("abccde", 2));
  assert(test("abccde", 3));
  assert(!test("abde", 0));
  assert(test("abde", 1));
  assert(test("abde", 2));
  assert(test("abde", 3));
  assert(!test("abdde", 0));
  assert(test("abdde", 1));
  assert(test("abdde", 2));
  assert(test("abdde", 3));
});

const testData: Record<string, [string, number][]> = {
  "": [
    ["", 0],
    ["a", 1],
    ["ab", 2],
    ["abc", 3],
    ["abcd", 4],
    ["abcde", 5],
  ],
  "a": [
    ["a", 0],
    ["", 1],
    ["b", 1],
    ["ab", 1],
    ["bab", 2],
    ["abcd", 3],
    ["bcde", 4],
    ["abcde", 4],
  ],
  "ab": [
    ["ab", 0],
    ["a", 1],
    ["aa", 1],
    ["abc", 1],
    ["", 2],
    ["bac", 2],
    ["bcd", 3],
    ["bcde", 4],
  ],
  "abc": [
    ["abc", 0],
    ["ac", 1],
    ["abb", 1],
    ["aabc", 1],
    ["a", 2],
    ["acb", 2],
    ["aabcd", 2],
    ["", 3],
    ["bca", 3],
  ],
  "abcde": [
    ["abcde", 0],
    ["aBCDe", 0],
    ["abcd", 1],
    ["aabcde", 1],
    ["abcdee", 1],
    ["ab?de", 1],
    ["abXXde", 2],
    ["ae", 3],
    ["aedcb", 4],
    ["", 4],
  ],
  "ab de": [
    ["abcde", 0],
    ["abccde", 0],
    ["abXXXXXXXde", 0],
    ["abcccccxe", 1],
    ["", 4],
  ],
  "漢字文字列": [
    ["漢字文字列", 0],
    ["漢字の文字列", 1],
    ["漢字文字", 1],
    ["漢字文字烈", 1],
    ["漢字辞典", 3],
    ["漢和辞典", 4],
    ["", 4],
  ],
  "emoji✅": [
    ["emoji✅", 0],
    ["emoj✅", 1],
    ["emojji✅", 1],
    ["emoji⬜", 1],
    ["emmoji⬜", 2],
    ["emoji⬜✅❌", 2],
    ["", 4],
  ],
};
Deno.test("check `match()`", async (t) => {
  for (const [pattern, candidates] of Object.entries(testData)) {
    await t.step(`pattern ${pattern}`, async ({ step }) => {
      const { match } = Asearch(pattern);
      for (const [text, distance] of candidates) {
        if (distance < 4) {
          await step(
            `Levenshtein distance from "${text}" should be ${distance}`,
            () => assertEquals(match(text), { found: true, distance }),
          );
        } else {
          await step(
            `Levenshtein distance from "${text}" should be more than 3`,
            () => assertEquals(match(text), { found: false }),
          );
        }
      }
    });
  }
});
