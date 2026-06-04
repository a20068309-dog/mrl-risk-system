import useExcel from "./useExcel"

export default function useADIData() {

  return useExcel("aditest.xlsx", (excel) => {

    const formatted = {}

    excel.forEach((row) => {

      const name = row.Name

      if (!formatted[name]) {
        formatted[name] = []
      }

      formatted[name].push({
        year: row.Year,

        adi:
          parseFloat(row["ADI(mg/kg bw)"]) || 0,

        org: row.來源
          
      })
    })

    return formatted
  })
}