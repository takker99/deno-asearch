const INITPATTERN = 0x80000000;
export const INITSTATE = [INITPATTERN, 0, 0, 0] as State;
const wildCard = " ";

/** masks used for Bitap algorithm */
export interface Mask {
  /** masks represented by occurrences of each charcter */
  shift: Map<string, number>;
  /** the wild mask */
  wild: number;
  /** the mask represented by accept state */
  accept: number;
}

/** options for search */
export interface SearchOption {
  /** turn false if you want to disable case insensitive search
   *
   * @default true
   */
  ignoreCase?: boolean;
}
/** あいまい検索に使うマスクを作成する
 *
 * @param source 検索対象の文字列
 */
export function makeMask(source: string, option?: SearchOption): Mask {
  const { ignoreCase = true } = option ?? {};
  const shift = new Map<string, number>();
  let wild = 0;
  let accept = INITPATTERN;
  for (const char of source) {
    if (char === wildCard) {
      wild |= accept;
    } else {
      for (
        const i of ignoreCase
          ? [char, char.toLowerCase(), char.toUpperCase()]
          : [char]
      ) {
        const pat = (shift.get(i) ?? 0) | accept;
        shift.set(i, pat);
      }
      accept >>>= 1;
    }
  }

  return { shift, wild, accept };
}

export type State = [number, number, number, number];
/** 状態遷移機械に文字列を入力する
 *
 * @param text 入力する文字列
 * @param mask bit masks
 * @param state 入力前の状態遷移機械
 */
export function moveState(
  text: string,
  mask: Omit<Mask, "accept">,
  state = INITSTATE,
): State {
  let [i0, i1, i2, i3] = state;
  const { shift, wild } = mask;
  for (const char of text) {
    const charMask = shift.get(char) ?? 0;
    i3 = (i3 & wild) | ((i3 & charMask) >>> 1) | (i2 >>> 1) | i2;
    i2 = (i2 & wild) | ((i2 & charMask) >>> 1) | (i1 >>> 1) | i1;
    i1 = (i1 & wild) | ((i1 & charMask) >>> 1) | (i0 >>> 1) | i0;
    i0 = (i0 & wild) | ((i0 & charMask) >>> 1);
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

  /** 与えた文字列が特定のLevenshtein距離でマッチするか判定する
   *
   * @param str 判定する文字列
   * @param distance 指定するLevenshtein距離
   */
  test: (str: string, distance: 0 | 1 | 2 | 3) => boolean;

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
 * @param option search options
 */
export function Asearch(source: string, option?: SearchOption): AsearchResult {
  const mask = makeMask(source, option);

  function test(str: string, distance: 0 | 1 | 2 | 3 = 0) {
    if (str === "") return distance === source.length;
    const state = moveState(str, mask);
    return (state[distance] & mask.accept) !== 0;
  }

  function match(
    str: string,
  ): MatchResult {
    if (str === "") {
      return 3 < source.length
        ? { found: false }
        : { found: true, distance: source.length as 0 | 1 | 2 | 3 };
    }
    const state = moveState(str, mask);
    return (state[0] & mask.accept) !== 0
      ? { found: true, distance: 0 }
      : (state[1] & mask.accept) !== 0
      ? { found: true, distance: 1 }
      : (state[2] & mask.accept) !== 0
      ? { found: true, distance: 2 }
      : (state[3] & mask.accept) !== 0
      ? { found: true, distance: 3 }
      : { found: false };
  }

  return {
    test,
    match,
    source,
  };
}
