export function normalizeFoodData(items, categories) {

  const categoryMap = Object.fromEntries(
    categories.map(cat => [
      cat.category_id,
      {
        category_t1: cat["類別"],
        LOQ: Number(cat.LOQ)
      }
    ])
  )

  // t2資料
  const detailRows = items.map(item => {

    const parent = categoryMap[item.category_id]

    return {
      total_id: `item_${item.item_id}`,
      category_id: item.category_id,

      category_t1: parent.category_t1,
      category_t2: item["類別"],

      intake:
        Number(item["平均值19-65(kg/person/day)"]) || 0,

      LOQ: parent.LOQ,

      level: "t2"
    }
  })

  // t1加總
  const summaryRows = categories.map(cat => {

    const sum = detailRows
      .filter(row => row.category_id === cat.category_id)
      .reduce(
        (acc, row) => acc + row.intake,
        0
      )

    return {
      total_id: `cat_${cat.category_id}`,
      category_id: cat.category_id,

      category_t1: cat["類別"],
      category_t2: "",

      intake: sum,

      LOQ: Number(cat.LOQ),

      level: "t1"
    }
  })

  return [
    ...detailRows,
    ...summaryRows
  ]
}



// {
//   total_id: "item_1",
//   category_id: "t1_1",
//   category_t1: "米類及其製品",
//   category_t2: "米類",
//   intake: 0.084860713,
//   LOQ: 0.02,
//   level: "t2"
// }
// {
//   total_id: "cat_t1_1",
//   category_id: "t1_1",
//   category_t1: "米類及其製品",
//   category_t2: "",
//   intake: 0.098711647,
//   LOQ: 0.02,
//   level: "t1"
// }