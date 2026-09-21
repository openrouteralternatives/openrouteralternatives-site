/**
 * Command-line flag parsing shared by every script under scripts/. Pure
 * functions with no I/O, so they are unit-tested in args.test.ts.
 */

/** `--gateway a,b` and `--gateway a --gateway b` are both accepted. */
export function parseSlugFilter(argv: string[]): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--gateway" && argv[i + 1]) {
      slugs.push(...splitList(argv[i + 1]));
      i += 1;
    } else if (argv[i].startsWith("--gateway=")) {
      slugs.push(...splitList(argv[i].slice("--gateway=".length)));
    }
  }
  return slugs;
}

/** `--limit 5` or `--limit=5`. Returns undefined when absent or not a number. */
export function parseNumberFlag(argv: string[], flag: string): number | undefined {
  const raw = parseStringFlag(argv, flag);
  const value = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** `--url https://…` or `--url=https://…`. The first occurrence wins. */
export function parseStringFlag(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index !== -1 && argv[index + 1] !== undefined && !argv[index + 1].startsWith("--")) {
    return argv[index + 1];
  }
  const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

/** Every occurrence of a repeatable flag, e.g. `--header "a: b" --header "c: d"`. */
export function parseStringFlags(argv: string[], flag: string): string[] {
  const values: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === flag && argv[i + 1] !== undefined) {
      values.push(argv[i + 1]);
      i += 1;
    } else if (argv[i].startsWith(`${flag}=`)) {
      values.push(argv[i].slice(flag.length + 1));
    }
  }
  return values;
}

/** A boolean switch such as `--skip-existing`. */
export function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
