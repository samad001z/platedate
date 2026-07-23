/**
 * Money is integer paise everywhere in this codebase. The ONLY place a
 * division by 100 may happen is here, at the display boundary.
 */
export function formatPaise(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error(`Money must be integer paise, got: ${paise}`);
  }
  const wholeRupees = paise % 100 === 0;
  return (
    "₹" +
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: wholeRupees ? 0 : 2,
      maximumFractionDigits: wholeRupees ? 0 : 2,
    }).format(paise / 100)
  );
}
