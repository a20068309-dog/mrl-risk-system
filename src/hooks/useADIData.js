import useExcel from "./useExcel"

export default function useADIData() {

  return useExcel("aditest.xlsx", (excel) => {

    const formatted = {}

    excel.forEach((row) => {

      // lookup key
      const nameKey = String(row.Name || "")
        .trim()
        .toLowerCase()

      if (!formatted[nameKey]) {
        formatted[nameKey] = []
      }

      formatted[nameKey].push({

        // 顯示用原始名稱
        pesticideName: String(row.Name || "").trim(),

        year: row.Year,

        adi:
          parseFloat(row["ADI(mg/kg bw)"]) || 0,

        org: String(row.來源 || "")
          .trim()
          .toLowerCase()

      })
    })

    return formatted
  })
}