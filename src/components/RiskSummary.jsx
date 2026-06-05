export default function RiskSummary({
  selectedMrlSource,
  selectedPesticide,
  adi,
  adiData = [],
  bodyweight,
  exposure,
  risk,
  contribution
}) {

  // 找出所有 adi 相同的資料
  const matchedSources = adiData.filter(
    item => item.adi === adi
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Risk Summary</h3>

      <p>MRL Source: {selectedMrlSource}</p>
      <p>Pesticide: {selectedPesticide}</p>
      <p>ADI: {adi}</p>
      <p>ADI Source:
        {" "}
        {matchedSources.map(item =>
          `${item.org} (${item.year})`
        ).join(", ")}
      </p>
      <p>Body Weight: {bodyweight}</p>
      <p>Total Exposure: {exposure.toFixed(6)}</p>

      <p style={{ color: risk > 70 ? "red" : "green" }}>
        Risk%ADI: {risk.toFixed(3)}
      </p>

      {/* 各類別百分比*/}
      <div style={{ marginTop: 10 }}>
        <h4>Category Contribution TOP5</h4>

        {[...contribution]
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5)  //最高的5類
            .map((d) => (
                <div key={d.category} style={{ marginBottom: 4 }}>
                {d.category}: {d.percent.toFixed(1)}%
                </div>
            ))
            }
      </div>
    </div>
  )
}