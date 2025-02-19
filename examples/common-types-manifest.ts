import type { nanoid as nsNanoid } from 'nanoid/non-secure'; // tidelift curated

export type NID = ReturnType<typeof nsNanoid>;  // non-secure id, @TODO reuse from fevmi rather
