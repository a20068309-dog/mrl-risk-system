import React from "react"
import { categoryDisplayOrder } from "../config/categoryOrder"

export default function MRLTable({
  data,
  categoryMaxExposure,
  chartData,
  openCategories,
  toggleCategory,
  selectedItems,
  toggleItem
}) {

  // 防呆：確保 data 是 array
  const safeData = Array.isArray(data) ? data : []

  // chart map
  const chartMap = Object.fromEntries(
    (chartData ?? []).map(d => [d.category, d])
  )

  // group + maintain order
  const grouped = {}

  safeData
    .sort((a, b) => (a.item_id ?? 0) - (b.item_id ?? 0))
    .forEach(item => {
      const cat = item.category

      if (!grouped[cat]) {
        grouped[cat] = {
          items: [],
          label: null,
          name: item.category
        }
      }

      grouped[cat].items.push(item)

      if (item.label && !grouped[cat].label) {
        grouped[cat].label = item.label
      }})



  const categoryOrder = [
    ...categoryDisplayOrder.filter(cat => grouped[cat]),
    ...Object.keys(grouped).filter(cat => !categoryDisplayOrder.includes(cat))
  ]  

  return (
    <table border="1" cellPadding="8" style={{ margin: "0 auto" }}>
      <thead>
        <tr>
          <th className="no-print">Select</th>
          <th>Pesticide</th>
          <th>Crop</th>
          <th>MRL</th>
          <th>Category</th>
          <th>Intake</th>
          <th>Exposure</th>
        </tr>
      </thead>

      <tbody>
        {categoryOrder.map(cat => {

          const items = grouped[cat]?.items || []
          const isOpen = openCategories.includes(cat)

          const maxExposure = categoryMaxExposure?.[cat]

          return (
            <React.Fragment key={cat}>

              {/* category header */}
              <tr
                onClick={() => toggleCategory(cat)}
                style={{
                  background: "#ddd",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                <td colSpan="7">
                  {isOpen ? "▼" : "▶"}  {grouped[cat].label} {grouped[cat].name}

                  <span style={{ marginLeft: 10, color: "#555", fontWeight: "normal" }}>
                    Max Exposure:{" "}
                    {typeof maxExposure === "number"
                      ? maxExposure.toFixed(6)
                      : "0.000000"
                    }
                    {" | "}
                    {chartMap?.[cat]?.percent != null
                      ? chartMap[cat].percent.toFixed(1) + "%"
                      : "0.0%"
                    }
                  </span>
                </td>
              </tr>

              {/* rows */}
              {isOpen && items.map((item, i) => {

                const isSelected = selectedItems.includes(item.crop)

                const categoryMax = categoryMaxExposure?.[item.category]

                const isMax =
                  typeof categoryMax === "number" &&
                  categoryMax > 0 && // 最大值必須大於 0
                  Math.abs(item.exposure - categoryMax) < 1e-10

                return (
                  <tr
                    key={`${item.item_id}-${i}`}
                    style={{
                      background: isMax ? "rgba(255,0,0,0.15)" : "transparent",
                      opacity: isSelected ? 1 : 0.35
                    }}
                  >
                    <td className="no-print">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.crop)}
                      />
                    </td>

                    <td>{item.pesticide_en}</td>
                    <td>{item.crop}</td>
                    <td>{item.limit}</td>
                    <td>{item.category}</td>
                    <td>{Number(item.intake).toFixed(6)}</td>
                    <td>{Number(item.exposure).toFixed(6)}</td>
                  </tr>
                )
              })}

            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}