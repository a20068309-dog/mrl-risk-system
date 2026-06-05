export function buildCategoryChart(
  categoryMaxExposure,
  labelMap = {}
) {

  const chartData = Object.entries(categoryMaxExposure).map(
    ([category, value]) => ({
      category,
      label: labelMap[category] ?? "",
      value
    })
  )

  const total = chartData.reduce(
    (sum, d) => sum + d.value,
    0
  )

  const chartDataWithPercent = chartData.map(d => ({
    ...d,
    percent: total
      ? (d.value / total) * 100
      : 0
  }))

  return {
    chartData: chartDataWithPercent,
    total
  }
}