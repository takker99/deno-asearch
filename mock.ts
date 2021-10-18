export function getRandomChar(start = 0, end = 0x10FFFF) {
  return String.fromCodePoint(
    Math.floor(Math.random() * (end - start) + start),
  );
}
