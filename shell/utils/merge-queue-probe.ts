export function countUp(limit: number): number {
  let total = 0;

  for (let i = 0; i < limit; i++) {
    total += i;
  }

  return total;
}
