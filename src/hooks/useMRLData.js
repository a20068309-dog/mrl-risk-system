import useExcel from "./useExcel"

export default function useMRLData(fileName = "mrl.xlsx") {

  return useExcel(fileName, (excel) => {

    return excel.map(row => ({

      pesticide_en: row.國際普通名稱,
      pesticide_ch: row.普通名稱,

      crop: row.作物類別,

      category_t1: row["食物類別(Tier1)"],
      category_t2: row["食物類別(Tier2)"],

      limit: parseFloat(row["容許量(ppm)"]) || 0

    }))
  })
}