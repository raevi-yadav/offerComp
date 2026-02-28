import { OfferData, CurrentSalaryData, CalculationResult, VestingYear } from './types';

export const calculateOffer = (
  offer: OfferData,
  current: CurrentSalaryData
): CalculationResult => {
  const {
    baseSalary,
    performanceBonusPercentage,
    joiningBonus,
    relocationBonus,
    stocksTotalValueUSD,
    usdToInrRate,
    stocksVestingYears,
    vestingPattern,
    customVestingPattern,
    isEmployerPFIncludedInBase,
    employerPFPercentage,
  } = offer;

  const stocksTotalValueINR = stocksTotalValueUSD * usdToInrRate;
  
  // PF Calculation
  // If PF is included in base, the "Gross" is baseSalary.
  // If PF is NOT included, the "Gross" is baseSalary + PF.
  const employerPF = (baseSalary * employerPFPercentage) / 100;
  
  const yearlyBreakdown: CalculationResult['yearlyBreakdown'] = [];
  let vestingTotal = 0;

  for (let i = 1; i <= stocksVestingYears; i++) {
    let stockPercentage = 0;
    if (vestingPattern === 'equal') {
      stockPercentage = 100 / stocksVestingYears;
    } else {
      const customYear = customVestingPattern.find((v) => v.year === i);
      stockPercentage = customYear ? customYear.percentage : 0;
    }
    vestingTotal += stockPercentage;

    const yearBonus = (baseSalary * performanceBonusPercentage) / 100;
    const yearStocks = (stocksTotalValueINR * stockPercentage) / 100;
    const oneTime = i === 1 ? (joiningBonus + relocationBonus) : 0;

    let totalWithPF: number;
    let totalWithoutPF: number;

    if (isEmployerPFIncludedInBase) {
      // baseSalary already includes PF
      // We need to calculate the PF component to find the "without PF" value
      // If PF = 12% of "Basic", and Base = Basic + PF, then PF = Base * (12/112)
      const pfComponent = (baseSalary * employerPFPercentage) / (100 + employerPFPercentage);
      totalWithPF = baseSalary + yearBonus + yearStocks + oneTime;
      totalWithoutPF = totalWithPF - pfComponent;
    } else {
      // baseSalary is the gross base, PF is extra
      const pfComponent = (baseSalary * employerPFPercentage) / 100;
      totalWithoutPF = baseSalary + yearBonus + yearStocks + oneTime;
      totalWithPF = totalWithoutPF + pfComponent;
    }

    yearlyBreakdown.push({
      year: i,
      base: baseSalary,
      bonus: yearBonus,
      stocks: yearStocks,
      oneTime: oneTime,
      totalWithPF: totalWithPF,
      totalWithoutPF: totalWithoutPF,
      total: isEmployerPFIncludedInBase ? totalWithPF : totalWithPF, // The "Total" is always the full CTC
    });
  }

  const isVestingValid = Math.abs(vestingTotal - 100) < 0.01;
  const firstYear = yearlyBreakdown[0];
  const firstYearTotal = firstYear ? firstYear.totalWithPF : 0;
  
  const currentTotalCTC = current.baseSalary + current.variablePay;
  const hikePercentage = currentTotalCTC > 0 
    ? ((firstYearTotal - currentTotalCTC) / currentTotalCTC) * 100 
    : 0;

  return {
    firstYearBase: firstYear?.base || 0,
    firstYearBonus: (firstYear?.bonus || 0) + (joiningBonus + relocationBonus),
    firstYearStocks: firstYear?.stocks || 0,
    firstYearTotal,
    hikePercentage,
    totalCTCWithPF: firstYear?.totalWithPF || 0,
    totalCTCWithoutPF: firstYear?.totalWithoutPF || 0,
    yearlyBreakdown,
    isVestingValid,
    vestingTotal
  };
};
