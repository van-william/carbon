export const getCurrencyFormatter = (
  baseCurrencyCode: string,
  locale: string,
  maximumFractionDigits?: number
) => {
  console.log({ baseCurrencyCode, locale, maximumFractionDigits });
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: baseCurrencyCode,
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });
};
