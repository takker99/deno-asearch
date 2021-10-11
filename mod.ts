const INITPAT = 0x80000000;
const MAXCHAR = 0x10000;
const INITSTATE = [INITPAT, 0, 0, 0];
const isupper = (c: number) => (c >= 0x41) && (c <= 0x5a);
const islower = (c: number) => (c >= 0x61) && (c <= 0x7a);
const tolower = (c: number) => isupper(c) ? (c + 0x20) : c;
const toupper = (c: number) => islower(c) ? (c - 0x20) : c;
const wildCard = 0x20;

export function Asearch(source: string) {
  const shiftpat = [] as number[];
  let epsilon = 0;
  let acceptpat = 0;
  let mask = INITPAT;
  for (let i = 0; i < MAXCHAR; i++) {
    shiftpat[i] = 0;
  }
  for (const i of unpack(source)) {
    if (i === wildCard) {
      epsilon |= mask;
    } else {
      shiftpat[i] |= mask;
      shiftpat[toupper(i)] |= mask;
      shiftpat[tolower(i)] |= mask;
      mask = mask >>> 1;
    }
  }
  acceptpat = mask;

  function getState(str = "") {
    let i0 = INITSTATE[0];
    let i1 = INITSTATE[1];
    let i2 = INITSTATE[2];
    let i3 = INITSTATE[3];
    for (const c of unpack(str)) {
      mask = shiftpat[c];
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

  function unpack(str: string) {
    return str.split("").map((char) => char.charCodeAt(0));
  }

  function match(str: string, ambig = 0) {
    const state = getState(str);
    ambig = Math.min(INITSTATE.length - 1, ambig);
    return (state[ambig] & acceptpat) !== 0;
  }

  match.source = source;

  return match;
}
