import { Asearch } from "./mod_charmap.ts";
import {
  describe,
  expect,
  it,
  run,
} from "https://deno.land/x/tincan@1.0.0/mod.ts";

const createTest = ({ test }: ReturnType<typeof Asearch>) =>
  (target: string, result = true, ambig = 0) =>
    it(`shoud ${result ? "" : "not "}match "${target}"`, () =>
      expect(test(target, ambig)).toBe(result));
const createMatch = ({ match }: ReturnType<typeof Asearch>) =>
  (left: string, right: ReturnType<ReturnType<typeof Asearch>["match"]>) =>
    it(
      `shoud ${right.found ? "" : "not "}match "${left}" ${
        right.found ? `whose Levenshtein distance is ${right.distance}` : ""
      }`,
      () => expect(match(left)).toEqual(right),
    );

describe('pattern "abcde"', () => {
  const asearch = Asearch("abcde");
  it('shoud have property "source"', () =>
    expect(asearch.source).toBe("abcde"));

  const test = createTest(asearch);
  test("abcde");
  test("aBCDe");
  test("abXcde", true, 1);
  test("abXcde", false);
  test("ab?de", true, 1);
  test("ab?de", false);
  test("abXXde", true, 2);
  test("abXXde", false, 1);
  test("abde", true, 1);
  test("abde", false);
  test("ae", true, 3);
  test("ae", false, 2);
  test("ae", false, 1);
  test("ae", false);
  test("aedcb", false, 3);
  test("aedcb", false, 2);
  test("aedcb", false, 1);
  test("aedcb", false);

  const match = createMatch(asearch);
  match("abcde", { found: true, distance: 0 });
  match("aBCDe", { found: true, distance: 0 });
  match("abXcde", { found: true, distance: 1 });
  match("ab?de", { found: true, distance: 1 });
  match("abde", { found: true, distance: 1 });
  match("abXXde", { found: true, distance: 2 });
  match("ae", { found: true, distance: 3 });
  match("aedcb", { found: false });
});

describe('pattern "ab de"', () => {
  const asearch = Asearch("ab de");

  const test = createTest(asearch);
  test("abcde");
  test("abccde");
  test("abXXXXXXXde", true);
  test("abcccccxe", true, 1);
  test("abcccccxe", false);

  const match = createMatch(asearch);
  match("abcde", { found: true, distance: 0 });
  match("abccde", { found: true, distance: 0 });
  match("abXXXXXXXde", { found: true, distance: 0 });
  match("abcccccxe", { found: true, distance: 1 });
});

describe('pattern "abcde"', () => {
  const asearch = Asearch("abcde");

  const test = createTest(asearch);
  test("abcde");
  test("abcde", true, 1);
  test("abcd", false);
  test("abcd", true, 1);
});

describe('pattern "漢字文字列"', () => {
  const asearch = Asearch("漢字文字列");

  const test = createTest(asearch);
  test("漢字文字列");
  test("漢字の文字列", false);
  test("漢字の文字列", true, 1);
  test("漢字文字", false);
  test("漢字文字", true, 1);
  test("漢字文字烈", false);
  test("漢字文字烈", true, 1);
  test("漢和辞典", false, 2);

  const match = createMatch(asearch);
  match("漢字文字列", { found: true, distance: 0 });
  match("漢字の文字列", { found: true, distance: 1 });
  match("漢字文字", { found: true, distance: 1 });
  match("漢字文字烈", { found: true, distance: 1 });
  match("漢和辞典", { found: false });
});

run();
