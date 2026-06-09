import useExcel from "./useExcel"

export default function useResidueDefinition() {

  return useExcel("residuedefinition.xlsx", (excel) => {

    const formatted = {}

    excel.forEach((row) => {

      // lookup key
      const pesticideKey = String(row.Pesticide || "")
        .trim()
        .toLowerCase()

      if (!formatted[pesticideKey]) {
        formatted[pesticideKey] = []
      }

      formatted[pesticideKey].push({

        // 顯示用原始名稱
        pesticideName: String(row.Pesticide || "").trim(),

        org: String(row.org || "")
          .trim()
          .toLowerCase(),

        residueDefinition: String(
          row.residue_definition || ""
        ).trim()
      })

    })

    return formatted
  })
}