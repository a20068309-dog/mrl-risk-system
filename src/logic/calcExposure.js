import { buildCategoryChart } from "./calcChart"

export function buildExposure(
  mrlData,
  intakeData,
  selectedPesticide,
  selectedItems,
  bodyWeight = 60,
  categoryKey = "category_t1"
) {

  // =========================
  // 1. 依 level 過濾 intake
  // =========================

  const targetLevel =
    categoryKey === "category_t1"
      ? "t1"
      : "t2"

  const activeIntakeData =
    intakeData.filter(
      d => d.level === targetLevel
    )

  // =========================
  // 2. MRL 篩選
  // =========================

  const filtered =
    mrlData.filter(
      item =>
        item.pesticide_en ===
        selectedPesticide
    )

  // =========================
  // 3. 去重
  // =========================

  const uniqueFiltered =
    Array.from(
      new Map(
        filtered.map(item => [
          `${item.pesticide_en}_${item.crop}_${item.limit}_${item[categoryKey]}`,
          item
        ])
      ).values()
    )

  // =========================
  // 4. intake lookup
  // =========================

  const intakeMap = {}
  const labelMap = {}

  activeIntakeData.forEach(d => {

    const key =
      categoryKey === "category_t1"
        ? d.category_t1
        : d.category_t2

    if (!key) return

    intakeMap[key.trim()] =
      Number(d.intake) || 0

    labelMap[key.trim()] =
      d.label ?? ""  
  })

  // =========================
  // 5. 所有 category list
  // =========================

  const allCategories = Array.from(
    new Set(
      activeIntakeData.map(d =>
        categoryKey === "category_t1"
          ? d.category_t1
          : d.category_t2
      ).filter(Boolean)
    )
  )

  // =========================
  // 6. MRL rows
  // =========================

  const mrlRows = uniqueFiltered.map(item => {

    const category =
      (item[categoryKey] ?? "")
        .toString()
        .trim()

    const intake =
      intakeMap[category] ?? 0

    const limit =
      Number(item.limit) || 0

    return {
      ...item,
      category,
      intake,
      exposure:
        (limit * intake) / bodyWeight,
      isSelected:
        selectedItems.includes(item.crop),
      isLOQ: false,
      label: labelMap[category] ?? ""
    }
  })

  // =========================
  // 7. LOQ rows（每個 category 都補）
  // =========================

  const loqRows = allCategories.map(category => {

    const intake =
      intakeMap[category] ?? 0

    const loqLimit =
      activeIntakeData.find(d =>
        (categoryKey === "category_t1"
          ? d.category_t1
          : d.category_t2
        ) === category
      )?.LOQ ?? 0

    return {
      pesticide_en: selectedPesticide,
      crop: `LOQ-${category}`,
      limit: loqLimit,
      category,
      intake,
      exposure:
        (loqLimit * intake) / bodyWeight,
      isSelected: 
        selectedItems.includes(
          `LOQ-${category}`
        ),
      isLOQ: true,
      label: labelMap[category] ?? ""
    }
  })

  // =========================
  // 8. 合併
  // =========================

  const enriched = [
    ...mrlRows,
    ...loqRows
  ]

  // =========================
  // 9. 排序
  // =========================

  const sorted =
    [...enriched].sort((a, b) => {

      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }

      return (b.exposure ?? 0) - (a.exposure ?? 0)
    })

  // =========================
  // 10. selected
  // =========================

  const selectedEnriched =
    sorted.filter(
      item => item.isSelected
    )

  // =========================
  // 11. category max exposure
  // =========================

  const categoryMaxExposure =
    selectedEnriched.reduce(
      (acc, item) => {

        const cat = item.category
        const exp = item.exposure || 0

        acc[cat] = Math.max(
          acc[cat] || 0,
          exp
        )

        return acc
      },
      {}
    )

  // =========================
  // 12. total exposure
  // =========================

  const totalExposure =
    Object.values(
      categoryMaxExposure
    ).reduce(
      (sum, v) => sum + v,
      0
    )

  // =========================
  // 13. chart
  // =========================

  const { chartData } =
    buildCategoryChart(
      categoryMaxExposure,
      labelMap
    )

  return {
    enriched: sorted,
    totalExposure,
    categoryMaxExposure,
    chartData
  }
}