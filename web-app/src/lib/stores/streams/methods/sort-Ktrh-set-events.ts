import type { KtrhsSetEvent } from 'ktrh';

export default <T extends KtrhsSetEvent>(ktrhsSetEvents: T[]): T[] =>
  ktrhsSetEvents.sort((a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp));
