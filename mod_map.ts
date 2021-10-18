const INITPAT = 0x80000000;
const MAXCHAR = 0x10000;
const INITSTATE = [INITPAT, 0, 0, 0];
const isupper = (c: number) => (c >= 0x41) && (c <= 0x5a);
const islower = (c: number) => (c >= 0x61) && (c <= 0x7a);
const tolower = (c: number) => isupper(c) ? (c + 0x20) : c;
const toupper = (c: number) => islower(c) ? (c - 0x20) : c;
const wildCard = 0x20;

export function Asearch(source: string) {
  const shiftpat = new Map<number, number>();
  let epsilon = 0;
  let mask = INITPAT;
  for (const i of unpack(source)) {
    if (i === wildCard) {
      epsilon |= mask;
    } else {
      const pat0 = (shiftpat.get(i) ?? 0) | mask;
      const pat1 = (shiftpat.get(toupper(i)) ?? 0) | mask;
      const pat2 = (shiftpat.get(tolower(i)) ?? 0) | mask;
      shiftpat.set(i, pat0);
      shiftpat.set(toupper(i), pat1);
      shiftpat.set(tolower(i), pat2);

      mask >>>= 1;
    }
  }
  const acceptpat = mask;

  function getState(str = "") {
    let [i0, i1, i2, i3] = INITSTATE;
    for (const c of unpack(str)) {
      mask = shiftpat.get(c) ?? 0;
      i3 = (i3 & epsilon) | ((i3 & mask) >>> 1) | (i2 >>> 1) | i2;
      i2 = (i2 & epsilon) | ((i2 & mask) >>> 1) | (i1 >>> 1) | i1;
      i1 = (i1 & epsilon) | ((i1 & mask) >>> 1) | (i0 >>> 1) | i0;
      i0 = (i0 & epsilon) | ((i0 & mask) >>> 1);
      i1 |= (i0 >>> 1);
      i2 |= (i1 >>> 1);
      i3 |= (i2 >>> 1);
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

function* unpack(str: string) {
  for (const char of str) {
    yield char.charCodeAt(0);
  }
}
