export function calcRisk(totalExposure, adiValue) {
  if (!adiValue) return NaN
  return totalExposure / adiValue *100 //百分比顯示
}
