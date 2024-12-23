# @takker/bitap

[![JSR](https://jsr.io/badges/@takker/bitap)](https://jsr.io/@takker/bitap)
[![test](https://github.com/takker99/deno-asearch/workflows/ci/badge.svg)](https://github.com/takker99/deno-asearch/actions?query=workflow%3Aci)

Approximate pattern matching on Deno/Web browser, using
[Bitap algorithm](https://en.wikipedia.org/wiki/Bitap_algorithm).

## Usage

### `maxDistance = 0 (default)`

This acts as a complete matching.

```ts
import { makeFilter } from "@takker/bitap";
import { assertEquals } from "@std/assert/equals";

const filter = makeFilter("hello");
assertEquals(filter("hello"), 0);
assertEquals(filter("hellow"), Infinity);
assertEquals(filter("hllo"), Infinity);
assertEquals(filter("haloo"), Infinity);
```

### `maxDistance = 1`

```ts
import { makeFilter } from "@takker/bitap";
import { assertEquals } from "@std/assert/equals";

const filter = makeFilter("hello");
assertEquals(filter("hello", 1), 0);
assertEquals(filter("hellow", 1), 1);
assertEquals(filter("hllo", 1), 1);
assertEquals(filter("haloo", 1), Infinity);
```

### `maxDistance = 2`

```ts
import { makeFilter } from "@takker/bitap";
import { assertEquals } from "@std/assert/equals";

const filter = makeFilter("hello");
assertEquals(filter("hello", 2), 0);
assertEquals(filter("hellow", 2), 1);
assertEquals(filter("hllo", 2), 1);
assertEquals(filter("haloo", 2), 2);
```
