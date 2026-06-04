import Select from "react-select"
import BodyWeightInput from "./BodyWeightInput"
import { customSelectStyles } from "../styles/selectorStyles"
import "../styles/selectors.css"


export default function Selectors({
  pesticideList,
  selectedPesticide,
  setSelectedPesticide,
  adiList,
  selectedADIIndex,
  setSelectedADIIndex,

  bodyWeight,
  setBodyWeight,

  tierMode,       
  setTierMode 
}) {

  // react-select 需要 { value, label } 格式
  const options = [...pesticideList]
    .sort((a, b) => a.localeCompare(b))
    .map(p => ({
      value: p,
      label: p
    }));

  const selectedOption = options.find(o => o.value === selectedPesticide) || null

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24
      }}
    >

      {/* LEFT COLUMN */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >

        {/* Pesticide */}
        <div>
          <label className="field-label">
            Pesticide
          </label>

          <Select
            inputId="pesticide-select-input"
            options={options}
            value={selectedOption}
            onChange={(option) =>
              setSelectedPesticide(option ? option.value : "")
            }
            placeholder="Search pesticide..."
            isClearable
            styles={customSelectStyles}
          />
        </div>

        {/* ADI */}
        <div>
          <label className="field-label">
            ADI Reference
          </label>

          {adiList.length > 0 && (
            <select
              value={selectedADIIndex}
              onChange={(e) =>
                setSelectedADIIndex(Number(e.target.value))
              }
              className="modern-select"
            >
              {adiList.map((a, i) => (
                <option key={i} value={i}>
                  {a.year} {a.org} - {a.adi}
                </option>
              ))}
            </select>            
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >

        {/* Category Mode */}
        <div>
          <label className="field-label">
            Category Mode
          </label>

          <select
            value={tierMode}
            onChange={(e) => setTierMode(e.target.value)}
            className="modern-select"
          >
            <option value="t1">Tier 1</option>
            <option value="t2">Tier 2</option>
          </select>
        </div>

        {/* Body Weight */}
        <div>
          <label className="field-label">
            Body Weight (kg)
          </label>

          <BodyWeightInput
            bodyWeight={bodyWeight}
            setBodyWeight={setBodyWeight}
            className="modern-select"
          />
        </div>

      </div>

    </div>
  )
}