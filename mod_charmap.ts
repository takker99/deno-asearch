const INITPAT = 0x80000000;
const INITSTATE = [INITPAT, 0, 0, 0];
const wildCard = " ";

export function Asearch(source: string) {
  const shiftpat = new Map<string, number>();
  let epsilon = 0;
  let mask = INITPAT;
  for (const char of source) {
    if (char === wildCard) {
      epsilon |= mask;
    } else {
      for (const i of [char, char.toLowerCase(), char.toUpperCase()]) {
        const pat = (shiftpat.get(i) ?? 0) | mask;
        shiftpat.set(i, pat);
      }

      mask >>>= 1;
    }
  }
  const acceptpat = mask;

  function getState(str = "") {
    let [i0, i1, i2, i3] = INITSTATE;
    for (const c of str) {
      mask = shiftpat.get(c) ?? 0;
      i3 = (i3 & epsilon) | ((i3 & mask) >>> 1) | (i2 >>> 1) | i2;
      i2 = (i2 & epsilon) | ((i2 & mask) >>> 1) | (i1 >>> 1) | i1;
      i1 = (i1 & epsilon) | ((i1 & mask) >>> 1) | (i0 >>> 1) | i0;
      i0 = (i0 & epsilon) | ((i0 & mask) >>> 1);
      i1 |= i0 >>> 1;
      i2 |= i1 >>> 1;
      i3 |= i2 >>> 1;
    }
    return [i0, i1, i2, i3];
  }

  function test(str: string, distance = 0) {
    const state = getState(str);
    distance = Math.min(INITSTATE.length - 1, distance);
    return (state[distance] & acceptpat) !== 0;
  }

  function match(str: string) {
    const state = getState(str);
    if ((state[INITSTATE.length - 1] & acceptpat) === 0) {
      return { found: false };
    }
    const distance = state.findIndex((i) => (i & acceptpat) !== 0);
    return { found: true, distance };
  }
  return {
    test,
    match,
    source,
  };
}
