
export function getSelectedADI(adiData, pesticide, index = 0) {
  if (!adiData) return null
  if (!pesticide) return null

  const list = adiData[pesticide]

  if (!Array.isArray(list) || list.length === 0) return null

  return list[index] ?? list[0] ?? null
}