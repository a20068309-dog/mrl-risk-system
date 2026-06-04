import { useEffect, useState } from "react"
import { loadExcelFromPublic } from "../utils/loadExcel"

export default function useExcel(filename, formatter) {

  const [data, setData] = useState([])   // ✅ 改這裡
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    const load = async () => {

      try {
        setLoading(true)

        const excel = await loadExcelFromPublic(filename)

        const formatted = formatter
          ? formatter(excel)
          : excel

        setData(formatted ?? [])   // ✅ 防呆

      } catch (err) {
        console.error(err)
        setError(err)
        setData([])               // ✅ 避免殘留 null
      } finally {
        setLoading(false)
      }
    }

    load()

  }, [filename])

  return {
    data,
    loading,
    error
  }
}