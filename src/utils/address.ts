export function formatAddress(
  address: string,
  start: number = 6,
  end: number = 4,
): string {
  if (!address || address.length < start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
