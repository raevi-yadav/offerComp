export interface VestingYear {
  year: number;
  percentage: number;
}

export interface OfferData {
  baseSalary: number;
  performanceBonusPercentage: number;
  joiningBonus: number;
  relocationBonus: number;
  stocksTotalValueUSD: number;
  usdToInrRate: number;
  stocksVestingYears: number;
  vestingPattern: 'equal' | 'custom';
  customVestingPattern: VestingYear[];
  isEmployerPFIncludedInBase: boolean;
  employerPFPercentage: number;
}

export interface CurrentSalaryData {
  baseSalary: number;
  variablePay: number;
}

export interface CalculationResult {
  firstYearBase: number;
  firstYearBonus: number;
  firstYearStocks: number;
  firstYearTotal: number;
  hikePercentage: number;
  totalCTCWithPF: number;
  totalCTCWithoutPF: number;
  yearlyBreakdown: {
    year: number;
    base: number;
    bonus: number;
    stocks: number;
    oneTime: number;
    totalWithPF: number;
    totalWithoutPF: number;
    total: number;
  }[];
  isVestingValid: boolean;
  vestingTotal: number;
}
