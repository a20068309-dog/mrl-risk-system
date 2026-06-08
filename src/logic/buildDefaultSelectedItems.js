export function buildDefaultSelectedItems(data = []) {
  if (!Array.isArray(data)) return []

  const safeData = data.filter(Boolean)

  const grouped = {}

  safeData.forEach(item => {
    if (!item?.crop) return

    const cat = item.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  const selected = []

  Object.values(grouped).forEach(items => {
    if (!items?.length) return

    const isLOQ = (item) =>
      String(item.crop || "").startsWith("LOQ-")

    const getExposure = (i) => Number(i.exposure) || 0

    const maxExposure = Math.max(...items.map(getExposure))

    const maxItems = items.filter(
      item => Math.abs(getExposure(item) - maxExposure) < 1e-10
    )

    const isUniqueMax = maxItems.length === 1

    const allLOQ = items.every(isLOQ)

    items.forEach(item => {
      const isMax =
        Math.abs(getExposure(item) - maxExposure) < 1e-10

      // 🟡 如果整類都是 LOQ → 全選
      if (allLOQ) {
        selected.push(item.crop)
        return
      }

      // ❌ LOQ + 唯一max 才排除
      if (isLOQ(item) && isMax && isUniqueMax) return

      selected.push(item.crop)
    })
  })

  return [...new Set(selected)].filter(Boolean)
}