import useExcel from "./useExcel"

export default function useIntakeData() {

  const {
    data: intakeData,
    loading: intakeLoading,
    error: intakeError
  } = useExcel("fooditem.xlsx")

  const {
    data: categories,
    loading: categoryLoading,
    error: categoryError
  } = useExcel("foodcategories.xlsx")

  if (
    intakeLoading ||
    categoryLoading
  ) {

    return {
      data: null,
      loading: true,
      error: null
    }
  }

  if (
    intakeError ||
    categoryError
  ) {

    return {
      data: null,
      loading: false,
      error: intakeError || categoryError
    }
  }

  const formatted = {}

  // category_id -> 大類名稱
  const categoryMap = {}

  categories.forEach((item) => {

    categoryMap[item.category_id] =
      item.類別
  })

  intakeData.forEach((item) => {

    const itemName = item.類別

    const categoryName =
      categoryMap[item.category_id]

    const value =
      parseFloat(
        item["平均值19-65(kg/person/day)"]
      ) || 0

    // 1. 保留原始項目
    formatted[itemName] = value

    // 2. 累加大類
    formatted[categoryName] =
      (formatted[categoryName] || 0)
      + value
  })

  return {
    data: formatted,
    loading: false,
    error: null
  }
}