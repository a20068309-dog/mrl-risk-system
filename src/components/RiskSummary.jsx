export default function RiskSummary({
  selectedMrlSource,
  selectedPesticide,
  adi,
  adiData = [],
  residueDefinitionData = [],
  bodyweight,
  exposure,
  risk,
  contribution
}) {

  // 找出所有 adi 相同的資料
  const matchedSources = adiData.filter(
    item => item.adi === adi
  )

  const residueDefinition = residueDefinitionData.find(
    item =>
      item.org === selectedMrlSource
  )

  const SOURCE_LABEL = {
    codex: "Codex",
    us: "US"
  }

  // const Row = ({ label, children }) => (
  //   <>
  //     <div>{label}</div>
  //     <div>{children}</div>
  //   </>
  // )


  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto"
      }}
    >
      {/* Top Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          rowGap: "6px",
          columnGap: "12px",
          marginBottom: "24px",
          textAlign: "left"
        }}
      >
        <div>MRL Source:</div>
        <div>
          {SOURCE_LABEL[selectedMrlSource] || selectedMrlSource}
        </div>

        <div>Pesticide:</div>
        <div>{selectedPesticide}</div>

        <div>Residue Definition:</div>
        <div>
          {residueDefinition?.residueDefinition || "-"}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start"
        }}
      >

        {/* LEFT：Risk Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            rowGap: "6px",
            columnGap: "12px",
            justifyItems: "start",
            textAlign: "left"
          }}
        >
          <h3
            style={{
              gridColumn: "1 / -1",
              margin: 0,
              textAlign: "center"
            }}
          >
            Risk Summary
          </h3>

          <div>ADI:</div>
          <div>{adi}</div>

          <div>ADI Source:</div>
          <div>
            {matchedSources
              .map(
                item =>
                  `${SOURCE_LABEL[item.org] || item.org} (${item.year})`
              )
              .join(", ")}
          </div>

          <div>Body Weight:</div>
          <div>{bodyweight}</div>

          <div>Total Exposure:</div>
          <div>{exposure.toFixed(6)}</div>

          <div>Risk%ADI:</div>
          <div
            style={{
              color: risk > 70 ? "red" : "green"
            }}
          >
            {risk.toFixed(3)}
          </div>
        </div>

        {/* RIGHT：Category Contribution */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "max-content max-content",
            rowGap: "6px",
            columnGap: "12px",
            justifyItems: "start",
            textAlign: "left"
          }}
        >
          <h3
            style={{
              gridColumn: "1 / -1",
              margin: 0,
              textAlign: "center"
            }}
          >
            Category Contribution TOP5
          </h3>

          {[...contribution]
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5)
            .map((d) => (
              <div
                key={d.category}
                style={{ display: "contents" }}
              >
                <div>
                  {d.label} {d.category}:
                </div>
                <div style={{ textAlign: "right" }}>
                  {d.percent.toFixed(1)}%
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  )
}