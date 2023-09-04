export const weiToLocaleString = (number: bigint, decimals: number) => {
  return (Number(number) / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const toLocaleDateTimeString = (date: Date) => {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false,
  });
};
