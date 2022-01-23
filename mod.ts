const INITPATTERN = 0x80000000;
export const INITSTATE = [INITPATTERN, 0, 0, 0] as State;
const wildCard = " ";

/** あいまい検索に使うマスクを作成する
 *
 * @param source 検索対象の文字列
 */
export function preparePatterns(source: string) {
  const shiftMasks = new Map<string, number>();
  let epsilonMask = 0;
  let acceptState = INITPATTERN;
  for (const char of source) {
    if (char === wildCard) {
      epsilonMask |= acceptState;
    } else {
      for (const i of [char, char.toLowerCase(), char.toUpperCase()]) {
        const pat = (shiftMasks.get(i) ?? 0) | acceptState;
        shiftMasks.set(i, pat);
      }
      acceptState >>>= 1;
    }
  }

  return [shiftMasks, epsilonMask, acceptState] as const;
}

export type State = [number, number, number, number];
/** 状態遷移機械に文字列を入力する
 *
 * @param text 入力する文字列
 * @param shiftMasks 遷移可能な場所を示したビットパタンのテーブル
 * @param epsilonMask 任意文字遷移が可能な場所を示したビットパタン
 * @param 入力前の状態遷移機械
 */
export function moveState(
  text: string,
  shiftMasks: Map<string, number>,
  epsilonMask: number,
  prevState = INITSTATE,
): State {
  let [i0, i1, i2, i3] = prevState;
  for (const char of text) {
    const mask = shiftMasks.get(char) ?? 0;
    i3 = (i3 & epsilonMask) | ((i3 & mask) >>> 1) | (i2 >>> 1) | i2;
    i2 = (i2 & epsilonMask) | ((i2 & mask) >>> 1) | (i1 >>> 1) | i1;
    i1 = (i1 & epsilonMask) | ((i1 & mask) >>> 1) | (i0 >>> 1) | i0;
    i0 = (i0 & epsilonMask) | ((i0 & mask) >>> 1);
    i1 |= i0 >>> 1;
    i2 |= i1 >>> 1;
    i3 |= i2 >>> 1;
  }
  return [i0, i1, i2, i3];
}

/** あいまい検索結果
 *
 * 見つかった場合はLevenshtein距離も格納する
 */
export type MatchResult = {
  found: false;
} | {
  found: true;
  distance: 0 | 1 | 2 | 3;
};
export interface AsearchResult {
  /** 検索対象の文字列 */ source: string;

  /** 与えた文字列がLevenshtein距離`maxDistance`以下でマッチするか判定する
   *
   * @param str 判定する文字列
   * @param maxDistance 許容する最大Levenshtein距離
   */
  test: (str: string, maxDistance: 0 | 1 | 2 | 3) => boolean;

  /** 与えた文字列と検索対象文字列とのLevenshtein距離を返す
   *
   * Levenshtein距離が4以上の場合はマッチしなかったとみなす
   *
   * @param str この文字列との距離を計算する
   */
  match: (str: string) => MatchResult;
}
/** あいまい検索を実行する函数を作る
 *
 * @param source 検索対象の文字列
 */
export function Asearch(source: string): AsearchResult {
  const [shiftMasks, epsilonMask, acceptState] = preparePatterns(source);

  function test(str: string, maxDistance: 0 | 1 | 2 | 3 = 0) {
    const state = moveState(str, shiftMasks, epsilonMask);
    return (state[maxDistance] & acceptState) !== 0;
  }

  function match(
    str: string,
  ): MatchResult {
    const state = moveState(
      str,
      shiftMasks,
      epsilonMask,
    );
    let flag = false;
    for (let i = INITSTATE.length - 1; i >= 0; i--) {
      if ((state[i] & acceptState) === 0) {
        if (flag) {
          return { found: true, distance: i + 1 as 0 | 1 | 2 | 3 };
        }
      } else {
        flag = true;
      }
    }
    return flag ? { found: true, distance: 0 } : { found: false };
  }

  return {
    test,
    match,
    source,
  };
}
