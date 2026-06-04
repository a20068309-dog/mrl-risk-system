// 只負責把 Excel → JSON

import * as XLSX from "xlsx"

// 通用：讀 Excel 檔案（File 或 public fetch 都可改用）
export const readExcelFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet)

      resolve(json)
    }

    reader.readAsBinaryString(file)
  })
}

// 讀 public/Excel
export const loadExcelFromPublic = async (fileName) => {
  const res = await fetch(`/${fileName}`)
  const buffer = await res.arrayBuffer()

  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  return XLSX.utils.sheet_to_json(sheet)
}