export interface YearsMonths {
  years: number;
  months: number;
  short: string;  // "14a 3m"
  long: string;   // "14 anos 3 meses"
}

export function decimalYearsToYearsMonths(decimal: number): YearsMonths {
  const years = Math.floor(decimal);
  const months = Math.round((decimal - years) * 12);
  return {
    years,
    months,
    short: `${years}a ${months}m`,
    long: `${years} ${years === 1 ? 'ano' : 'anos'} ${months} ${months === 1 ? 'mês' : 'meses'}`,
  };
}
