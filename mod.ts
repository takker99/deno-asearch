const INITPATTERN = 0x80000000;
const wildCard = " ";

/** 初期状態の有限オートマトンを作る */
const makeInitState = (
  maxDistance: number,
): State => {
  const state: State = [INITPATTERN];
  for (let i = 1; i <= maxDistance; i++) {
    state.push(0);
  }
  return state;
};

/** masks used for Bitap algorithm */
interface Mask {
  /** masks represented by occurrences of each charcter */
  shift: Map<string, number>;
  /** the wild mask */
  wild: number;
  /** the mask represented by accept state */
  accept: number;
}

/** options for search */
export interface FilterOptions {
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
const makeMask = (source: string, option?: FilterOptions): Mask => {
  const { ignoreCase = true } = option ?? {};
  const shift = new Map<string, number>();
  let wild = 0;
  let accept = INITPATTERN;
  let prevChar = "";
  for (const char of source) {
    if (char === wildCard && char !== prevChar) {
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
    prevChar = char;
  }

  return { shift, wild, accept };
};

type State = [number, ...number[]];
/** 状態遷移機械に文字列を入力する
 *
 * @param text 入力する文字列
 * @param mask bit masks
 * @param state 入力前の状態遷移機械
 */
const moveState = (
  text: string,
  mask: Omit<Mask, "accept">,
  state: State,
): State => {
  const bits: State = [...state];
  const { shift, wild } = mask;
  for (const char of text) {
    const charMask = shift.get(char) ?? 0;
    if (bits.length > 1) {
      for (let i = bits.length - 1; i > 0; i--) {
        bits[i] = (bits[i] & wild) | ((bits[i] & charMask) >>> 1) |
          (bits[i - 1] >>> 1) | bits[i - 1];
      }
    }
    bits[0] = (bits[0] & wild) | ((bits[0] & charMask) >>> 1);
    if (bits.length > 1) {
      for (let i = 1; i < bits.length; i++) {
        bits[i] |= bits[i - 1] >>> 1;
      }
    }
  }
  return bits;
};

/** 与えた文字列と検索対象文字列とのLevenshtein距離を返す
 *
 * Levenshtein距離が`maxDistance`を超える場合は、マッチしなかったとみなす
 *
 * @param str この文字列との距離を計算する
 * @param [maxDistance=0] 許容するLevenshtein距離
 * @return 編集距離とマッチ結果を返す。マッチしなかったら`Infinity`を返す
 */
export type Filter = (str: string, maxDistance?: number) => number;

/** make a filter function which calculates Levenshtein distance by Bitap algorithm
 *
 * @param source 検索対象の文字列
 * @param option search options
 */
export const makeFilter = (
  source: string,
  option?: FilterOptions,
): Filter => {
  const mask = makeMask(source, option);
  const lengthWithoutWild = source.split(wildCard).join("").length;
  const sourceLength = [...source].length;
  const canPartiallyMatch = sourceLength !== lengthWithoutWild;

  return (str, maxDistance = 0) => {
    if (str === "") return lengthWithoutWild;
    const strLength = [...str].length;
    if (
      lengthWithoutWild > strLength + maxDistance ||
      (!canPartiallyMatch && (strLength > sourceLength + maxDistance))
    ) return Infinity;

    const initState = makeInitState(maxDistance);
    const state = moveState(str, mask, initState);
    const distance = state.findIndex((s) => (s & mask.accept) !== 0);
    return distance >= 0 ? distance : Infinity;
  };
};
