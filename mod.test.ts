import { type FilterOptions, makeFilter } from "./mod.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("check `match()`", async (t) => {
  await testMatch(t, {
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
      ["", 5],
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
      ["", 5],
    ],
    "emoji✅": [
      ["emoji✅", 0],
      ["emoj✅", 1],
      ["emojji✅", 1],
      ["emoji⬜", 1],
      ["emmoji⬜", 2],
      ["emoji⬜✅❌", 2],
      ["", 6],
    ],
  }, { maxDistance: 3 });
  await testMatch(t, {
    hamburger: [
      ["hamburger", 0],
      ["humbarger", 2],
      ["hamjarrger", 3],
      ["hamなんとかger", 4],
    ],
    "漢字文字列": [
      ["漢字文字列", 0],
      ["漢字の文字列", 1],
      ["漢字文字", 1],
      ["漢字文字烈", 1],
      ["漢字辞典", 3],
      ["漢和辞典", 4],
      ["漢字についての文字列？", 6],
      ["", 5],
      ["漢っていう文字だけ入った文章", 11],
    ],
  }, { maxDistance: 11 });
});

const testMatch = async (
  t: Deno.TestContext,
  data: Record<string, [string, number][]>,
  options?: FilterOptions & { maxDistance?: number },
) => {
  await t.step(`maxDistance <= ${options?.maxDistance ?? 0}`, async (t) => {
    for (const [pattern, candidates] of Object.entries(data)) {
      await t.step(`pattern ${pattern}`, async ({ step }) => {
        const match = makeFilter(pattern, options);
        for (const [text, distance] of candidates) {
          if (distance <= (options?.maxDistance ?? 0) || text === "") {
            await step(
              `Levenshtein distance from "${text}" should be ${distance}`,
              () => assertEquals(match(text, options?.maxDistance), distance),
            );
          } else {
            await step(
              `Levenshtein distance from "${text}" should be more than ${
                options?.maxDistance ?? 0
              }`,
              () => assertEquals(match(text, options?.maxDistance), Infinity),
            );
          }
        }
      });
    }
  });
};
