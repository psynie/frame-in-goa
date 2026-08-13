// Generates the "builder title" on the ID card. Deterministic from the name so
// the card is stable across reloads, with a salt for the reroll button.

const ADJECTIVES = [
  'MIDNIGHT',
  'SALTWATER',
  'BAREFOOT',
  'SUNBURNT',
  'MONSOON',
  'OFFLINE',
  'CAFFEINATED',
  'SUNRISE',
  'LOW-LATENCY',
  'UNSTOPPABLE',
  'FERAL',
  'SANDY-KEYBOARD',
  'LAST-MINUTE',
  'HIGH-TIDE',
  'NO-SLEEP',
  'DEEP-END',
];

const NOUNS = [
  'SHIPPER',
  'PROTOTYPER',
  'DEMO WIZARD',
  'COMMIT MACHINE',
  'ARCHITECT',
  'PIXEL PUSHER',
  'EDGE-CASE HUNTER',
  'BUG WHISPERER',
  'SYSTEMS POET',
  'HACKATHON VETERAN',
  'IDEA MACHINE',
  'MERGE CONFLICT SURVIVOR',
  'STACK BENDER',
  'FIRST-DRAFT FINISHER',
  'BEACH DEPLOYER',
  'ALWAYS-ON BUILDER',
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateTitle(seed: string, salt = 0): string {
  const base = hash(`${seed.trim().toLowerCase()}::${salt}`);
  const adjective = ADJECTIVES[base % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(base / ADJECTIVES.length) % NOUNS.length];
  return `THE ${adjective} ${noun}`;
}
