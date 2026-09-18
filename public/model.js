export function scenarioRank(sampleShareAbove, population, selectionRatio) {
  if (!(sampleShareAbove >= 0 && sampleShareAbove <= 1) ||
      !Number.isFinite(population) || population < 1 ||
      !Number.isFinite(selectionRatio) || selectionRatio <= 0) {
    throw new Error('Invalid ranking assumptions.');
  }
  const estimatedShareAbove = sampleShareAbove /
    (selectionRatio * (1 - sampleShareAbove) + sampleShareAbove);
  const above = (population - 1) * estimatedShareAbove;
  const tolerance = Number.EPSILON * Math.max(1, above) * 4;
  return Math.min(Math.floor(population), 1 + Math.floor(above + tolerance));
}

export function roundedRank(rank) {
  const step = rank >= 100000 ? 1000 : rank >= 10000 ? 100 : rank >= 1000 ? 10 : 1;
  return Math.max(1, Math.round(rank / step) * step);
}

export function estimate(share, config) {
  return {
    optimistic: scenarioRank(share, config.population, config.biasHigh),
    median: scenarioRank(share, config.population, config.biasMedian),
    conservative: scenarioRank(share, config.population, config.biasLow),
  };
}
