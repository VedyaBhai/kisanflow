// KISANFLOW deterministic prototype demand forecast

const FORECAST_KG = [
  18400,
  19100,
  19700,
  20300,
  21000,
  21600,
  22200,
];

export function buildForecast(history = []) {
  return FORECAST_KG.map((demandKg, index) => ({
    label: `Day ${index + 1}`,
    demandKg,
  }));
}

export function summarizeForecast(forecast = [], supplyKg = 0) {
  const totalKg = forecast.reduce(
    (sum, item) => sum + Number(item.demandKg || 0),
    0
  );

  const forecastT = Number((totalKg / 7 / 1000).toFixed(1));
  const supplyT = Number((Number(supplyKg || 0) / 1000).toFixed(1));
  const gapT = Number(Math.max(0, forecastT - supplyT).toFixed(1));

  return {
    forecastT,
    supplyT,
    gapT,
    shortage: gapT > 0,
    riskLabel: gapT > 0 ? "SHORTAGE RISK" : "BALANCED",
    confidence: 77,
  };
}
