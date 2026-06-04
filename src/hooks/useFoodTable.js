import { useMemo } from "react"
import useExcel from "./useExcel"
import { normalizeFoodData } from "../data/normalizeFoodData"

export default function useFoodTable() {

  const { data: t2 = [] } = useExcel("fooditem.xlsx")
  const { data: t1 = [] } = useExcel("foodcategories.xlsx")

  const data = useMemo(() => {

    if (!t2.length || !t1.length) return []

    return normalizeFoodData(t2, t1)

  }, [t2, t1])

  return {
    data
  }
}