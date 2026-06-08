import useExcel from "./useExcel"

export default function useResidueDefinition() {

  return useExcel("residuedefinition.xlsx", (excel) => {

    const formatted = {}

    excel.forEach((row) => {

      const pesticide = row.Pesticide

      if (!formatted[pesticide]) {
        formatted[pesticide] = []
      }

      formatted[pesticide].push({
        org: row.org,
        residueDefinition: row.residue_definition
      })

    })

    return formatted
  })
}