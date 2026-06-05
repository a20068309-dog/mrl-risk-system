export function normalizeFoodData(items, categories) {

  // 1. 建立 category 基本資訊 + 羅馬數字
  function toRoman(num) {
    const roman = [
      ["XL", 40],
      ["X", 10],
      ["IX", 9],
      ["V", 5],
      ["IV", 4],
      ["I", 1],
    ]

    let result = ""

    for (const [letter, value] of roman) {
      while (num >= value) {
        result += letter
        num -= value
      }
    }

  return result
}

  const categoryMap = Object.fromEntries(
    categories.map((cat, index) => [
      cat.category_id,
      {
        category_t1: cat["類別"],
        LOQ: Number(cat.LOQ),
        roman: toRoman(index + 1)
      }
    ])
  )

  // 2. t2 明細 + 每個類別內的流水號
  const counters = {}

  const detailRows = items.map(item => {
    const parent = categoryMap[item.category_id]

    counters[item.category_id] = (counters[item.category_id] || 0) + 1
    const idx = counters[item.category_id]

    return {
      total_id: `item_${item.item_id}`,
      category_id: item.category_id,

      category_t1: parent.category_t1,
      category_t2: item["類別"],

      intake: Number(item["平均值19-65(kg/person/day)"]) || 0,
      LOQ: parent.LOQ,

      level: "t2",

      // ⭐ 新增 label：I-1, I-2, II-1...
      label: `${parent.roman}-${idx}`
    }
  })

  // 3. t1 加總 + 羅馬數字 label
  const summaryRows = categories.map((cat, index) => {
    const sum = detailRows
      .filter(row => row.category_id === cat.category_id)
      .reduce((acc, row) => acc + row.intake, 0)

    const roman = categoryMap[cat.category_id].roman

    return {
      total_id: `cat_${cat.category_id}`,
      category_id: cat.category_id,

      category_t1: cat["類別"],
      category_t2: "",

      intake: sum,
      LOQ: Number(cat.LOQ),

      level: "t1",

      // ⭐ t1 label：I / II / III
      label: roman
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
//   label: "I-1"
// }
// {
//   total_id: "cat_t1_1",
//   category_id: "t1_1",
//   category_t1: "米類及其製品",
//   category_t2: "",
//   intake: 0.098711647,
//   LOQ: 0.02,
//   level: "t1"
//   label: "I"
// }