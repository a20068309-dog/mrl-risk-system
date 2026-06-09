
import { useState, useEffect, useRef, useMemo } from "react"

import useMRLData from "./hooks/useMRLData"
import useADIData from "./hooks/useADIData"
import useFoodTable from "./hooks/useFoodTable"
import useResidueDefinition from "./hooks/useResidueDefinition"

import { buildExposure } from "./logic/calcExposure"
import { calcRisk } from "./logic/calcRisk"
import { getSelectedADI } from "./logic/useADI"
import { exportMRLTableToWord } from "./logic/exportWord"
import { exportPDF } from "./logic/exportPDF"

import RiskSummary from "./components/RiskSummary"
import MRLTable from "./components/MRLTable"
import Selectors from "./components/Selectors"
import { buildDefaultSelectedItems } from "./logic/buildDefaultSelectedItems"

function App() {
  const [mrlSource, setMrlSource] = useState("codex")

  const { data: codexData } = useMRLData("codex_mrl.xlsx")
  const { data: usData } = useMRLData("us_mrl.xlsx")

  const mrlData = mrlSource === "us" ? usData : codexData

  const { data: residueDefinitionData } = useResidueDefinition()
  const { data: adiData } = useADIData()
  const { data: intakeData } = useFoodTable()

  const [selectedPesticide, setSelectedPesticide] = useState("")
  const [selectedADIIndex, setSelectedADIIndex] = useState(0)
  const [tierMode, setTierMode] = useState("t1")

  const [bodyWeight, setBodyWeight] = useState(66.3)

  const [selectedItems, setSelectedItems] = useState([])
  const [openCategories, setOpenCategories] = useState([])

  const printRef = useRef()

  const TIER_MAP = {
    t1: "category_t1",
    t2: "category_t2"
  }

  const TIER_LABEL = {
    t1: "tier1",
    t2: "tier2"
  }

  const categoryKey = TIER_MAP[tierMode]
  const tierLabel = TIER_LABEL[tierMode]

  // =========================
  // pesticide reset
  useEffect(() => {
    if (!mrlData) return

    const exists = mrlData.some(
      x => x.pesticide_key === selectedPesticide
    )

    if (!exists) {
      setSelectedPesticide("")
      setSelectedADIIndex(0)
    }
  }, [mrlData])

  // =========================
  // reset ADI
  useEffect(() => {
    setSelectedADIIndex(0)
  }, [selectedPesticide])

  // =========================
  // category open init
  useEffect(() => {
    if (!intakeData) return

    const targetLevel = tierMode === "t1" ? "t1" : "t2"

    const categories = [
      ...new Set(
        intakeData
          .filter(d => d.level === targetLevel)
          .map(d =>
            targetLevel === "t1"
              ? d.category_t1
              : d.category_t2
          )
          .filter(Boolean)
      )
    ]

    setOpenCategories(categories)
  }, [intakeData, tierMode])

  // =========================
  // PURE EXPOSURE ENGINE
  const {
    enriched,
    totalExposure,
    categoryMaxExposure,
    chartData
  } = useMemo(() => {
    if (!mrlData || !intakeData) {
      return {
        enriched: [],
        totalExposure: 0,
        categoryMaxExposure: {},
        chartData: []
      }
    }

    return buildExposure(
      mrlData,
      intakeData,
      selectedPesticide,
      selectedItems,
      bodyWeight,
      categoryKey
    )
  }, [
    mrlData,
    intakeData,
    selectedPesticide,
    selectedItems,
    bodyWeight,
    categoryKey
  ])

  const defaultSelectedItems = useMemo(() => {
    if (!enriched?.length) return []

    return buildDefaultSelectedItems(enriched)
  }, [enriched])

  // =========================
  // INIT selectedItems 
  useEffect(() => {
    if (!defaultSelectedItems.length) return

    setSelectedItems(defaultSelectedItems)
  }, [
    selectedPesticide,
    tierMode,
    mrlSource
  ])

  // =========================
  // ADI
  const selectedADI = getSelectedADI(
    adiData,
    selectedPesticide,
    selectedADIIndex
  )

  const adiValue = selectedADI?.adi || 0

  const risk = calcRisk(totalExposure, adiValue)

  const pesticideList = useMemo(() => {
    const unique = new Map()

    ;(mrlData || []).forEach(item => {

      if (!unique.has(item.pesticide_key)) {

        unique.set(
          item.pesticide_key,
          item.pesticide_en
        )
      }
    })

    return Array.from(unique.entries()).map(
      ([value, label]) => ({
        value,
        label
      })
    )
  }, [mrlData])

  const selectedPesticideName =
    mrlData?.find(
      x => x.pesticide_key === selectedPesticide
    )?.pesticide_en || selectedPesticide

  const currentADIList = adiData?.[selectedPesticide] || []

  // =========================
  useEffect(() => {
    document.title =
      selectedPesticide && adiValue
        ? `${selectedPesticide}_${mrlSource}_${adiValue}_${bodyWeight}_${tierLabel}_MRL_Risk_Report`
        : "MRL Risk System"
  }, [selectedPesticide, adiValue, bodyWeight, tierLabel])

  // =========================
  const toggleItem = (crop) => {
    setSelectedItems(prev =>
      prev.includes(crop)
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    )
  }

  const toggleCategory = (cat) => {
    setOpenCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
  }

  // =========================
  if (!mrlData || !adiData || !intakeData || !residueDefinitionData) {
    return <div>Loading...</div>
  }

  // =========================
  const exportWord = async () => {
    await exportMRLTableToWord(
      enriched,
      categoryMaxExposure,
      chartData,
      `${selectedPesticide}_${adiValue}_${bodyWeight}_${categoryKey}.docx`
    )
  }

// console.log(chartData)
// console.log("selectedPesticide =", selectedPesticide)
// console.log("ADI data =", adiData?.[selectedPesticide])

  return (
    <div style={{ padding: 20 }}>
      <h1>MRL Risk System</h1>

      <Selectors
        mrlSource={mrlSource}
        setMrlSource={setMrlSource}

        pesticideList={pesticideList}
        selectedPesticide={selectedPesticide}
        setSelectedPesticide={setSelectedPesticide}

        adiList={currentADIList}
        selectedADIIndex={selectedADIIndex}
        setSelectedADIIndex={setSelectedADIIndex}

        bodyWeight={bodyWeight}
        setBodyWeight={setBodyWeight}

        tierMode={tierMode}
        setTierMode={setTierMode}
      />

      <div style={{ marginTop: 30 }} ref={printRef}>

        <RiskSummary
          selectedMrlSource={mrlSource}
          selectedPesticideKey={selectedPesticide}
          selectedPesticideName={selectedPesticideName}
          residueDefinitionData={
            residueDefinitionData?.[selectedPesticide] || []
          }
          adi={adiValue}
          adiData={currentADIList}
          bodyweight={bodyWeight}
          exposure={totalExposure}
          risk={risk}
          contribution={chartData}
        />

        {/* <div className="no-print">
          <button onClick={exportWord}>Export Word</button>
          <button onClick={() => window.print()}>Window Print</button>
          <button
            onClick={() =>
              exportPDF(
                printRef.current,
                `${selectedPesticide}_${adiValue}_${bodyWeight}.pdf`
              )
            }
          >
            Export PDF
          </button>
        </div> */}

        <div style={{ marginTop: 30 }} >
        <MRLTable
          selectedItems={selectedItems}
          toggleItem={toggleItem}
          data={enriched}
          categoryMaxExposure={categoryMaxExposure}
          chartData={chartData}
          openCategories={openCategories}
          toggleCategory={toggleCategory}
        />
        </div>
      </div>
    </div>
  )
}

export default App