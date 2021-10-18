import {
  bench,
  runBenchmarks,
} from "https://deno.land/std@0.111.0/testing/bench.ts";
import { Asearch } from "./mod.ts";
import { Asearch as AsearchMap } from "./mod_map.ts";
import { Asearch as AsearchObject } from "./mod_object.ts";
import { Asearch as AsearchArray } from "./mod_array.ts";
import { getRandomChar } from "./mock.ts";

function getRandomText(length: number) {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += getRandomChar();
  }
  return text;
}
const chunkNum = 100;
const engines = [Asearch, AsearchArray, AsearchMap, AsearchObject];
for (const engine of engines) {
  for (let j = 1; j < 3; j++) {
    const { test } = engine(getRandomText(5 * j));
    for (let i = 0; i < 5; i++) {
      bench({
        name: `${5 * j} x ${10 ** i}`,
        runs: 100,
        func: (b) => {
          const texts = [...Array(chunkNum).keys()].map(() =>
            getRandomText(10 ** i)
          );
          b.start();
          texts.forEach((text) => test(text));
          b.stop();
        },
      });
    }
  }
}

const { results } = await runBenchmarks({ silent: false });
console.log("Summary:");
console.log("name\t\truns\tmin\tmid\tmax\tmax/min\tavg");
for (const { name, runsCount, measuredRunsMs, measuredRunsAvgMs } of results) {
  const sorted = measuredRunsMs.sort((a, b) => a - b);

  const min = sorted[0] / chunkNum;
  const mid = (sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2 + 1]) / 2
    : sorted[sorted.length / 2 + 0.5]) / chunkNum;
  const max = sorted[sorted.length - 1] / chunkNum;
  const avg = measuredRunsAvgMs / chunkNum;
  console.log(
    `${name.padEnd(10, " ")}\t${runsCount}\t${min.toExponential(2)}ms\t${
      mid.toExponential(2)
    }ms\t${max.toExponential(2)}ms\tx${(max / min).toFixed(2)}\t${
      avg.toExponential(2)
    }ms`,
  );
}
