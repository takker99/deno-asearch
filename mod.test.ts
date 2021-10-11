import { Asearch } from "./mod.ts";
import {
  describe,
  expect,
  it,
  run,
} from "https://deno.land/x/tincan@1.0.0/mod.ts";

const createTest = (match: ReturnType<typeof Asearch>) =>
  (target: string, result = true, ambig = 0) =>
    it(`shoud ${result ? "" : "not "}match "${target}"`, () =>
      expect(match(target, ambig)).toBe(result));

describe('pattern "abcde"', () => {
  const match = Asearch("abcde");
  it('shoud have property "source"', () => expect(match.source).toBe("abcde"));

  const test = createTest(match);
  test("abcde");
  test("aBCDe");
  test("abXcde", true, 1);
  test("ab?de", true, 1);
  test("ab?de", true, 1);
  test("abXXde", true, 2);
  test("abXcde", false);
  test("ab?de", false);
  test("abde", false);
  test("abXXde", false, 1);
});

describe('pattern "ab de"', () => {
  const match = Asearch("ab de");

  const test = createTest(match);
  test("abcde");
  test("abccde");
  test("abXXXXXXXde", true);
  test("abcccccxe", true, 1);
  test("abcccccxe", false);
});

describe('pattern "abcde"', () => {
  const match = Asearch("abcde");

  const test = createTest(match);
  test("abcde");
  test("abcde", true, 1);
  test("abcd", false);
  test("abcd", true, 1);
});

describe('pattern "漢字文字列"', () => {
  const match = Asearch("漢字文字列");

  const test = createTest(match);
  test("漢字文字列");
  test("漢字の文字列", false);
  test("漢字の文字列", true, 1);
  test("漢字文字", false);
  test("漢字文字", true, 1);
  test("漢字文字烈", false);
  test("漢字文字烈", true, 1);
  test("漢和辞典", false, 2);
});

run();
