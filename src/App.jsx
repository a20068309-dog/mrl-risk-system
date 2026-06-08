

import { useState, useEffect, useRef } from "react"



import useMRLData from "./hooks/useMRLData"
import useADIData from "./hooks/useADIData"
import useFoodTable from "./hooks/useFoodTable"
import useResidueDefinition from "./hooks/useResidueDefinition"

import { buildExposure } from "./logic/calcExposure"
import { buildCategoryChart } from "./logic/calcChart"
import { calcRisk } from "./logic/calcRisk"
import { getSelectedADI } from "./logic/useADI"
import { exportMRLTableToWord } from "./logic/exportWord"
import { exportPDF } from "./logic/exportPDF"

import BodyWeightInput from "./components/BodyWeightInput"
import RiskSummary from "./components/RiskSummary"
import MRLTable from "./components/MRLTable"
import Selectors from "./components/Selectors"

function App() {
  const [mrlSource, setMrlSource] = useState("codex")
  const { data: codexData } =  useMRLData("codex_mrl.xlsx")
  const { data: usData } =  useMRLData("us_mrl.xlsx")
  const mrlData =
    mrlSource === "us"
      ? usData
      : codexData
  
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

  // 目前選到的 pesticide 不存在於新的 MRL 資料集時，就自動清空
  useEffect(() => {
    if (!mrlData) return

    const exists =
      mrlData.some(
        x => x.pesticide_en === selectedPesticide
      )

    if (!exists) {
      setSelectedPesticide("")
      setSelectedADIIndex(0)
    }
  }, [mrlData])

  // reset ADI
  useEffect(() => {
    setSelectedADIIndex(0)
  }, [selectedPesticide])



  // crop selection reset
  useEffect(() => {

    if (!mrlData || !intakeData) return

    const crops = [
      ...new Set(
        mrlData
          .filter(
            i => i.pesticide_en === selectedPesticide
          )
          .map(i => i.crop)
      )
    ]

    // 加入所有 LOQ
    const loqItems = intakeData
      .filter(d =>
        d.level === (
          tierMode === "t1"
            ? "t1"
            : "t2"
        )
      )
      .map(d => {

        const category =
          tierMode === "t1"
            ? d.category_t1
            : d.category_t2

        return `LOQ-${category}`
      })

    setSelectedItems([
      ...new Set([
        ...crops,
        ...loqItems
      ])
    ])

  }, [
    mrlData,
    intakeData,
    selectedPesticide,
    tierMode
  ])

  // category 展開初始化
  useEffect(() => {

    if (!intakeData) return

    const targetLevel =
      tierMode === "t1"
        ? "t1"
        : "t2"

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

  }, [
    intakeData,
    selectedPesticide,
    tierMode
  ])

  const selectedADI = getSelectedADI(
    adiData,
    selectedPesticide,
    selectedADIIndex
  )

  const adiValue = selectedADI?.adi || 0

  useEffect(() => {
    document.title =
      selectedPesticide && adiValue
        ? `${selectedPesticide}_${mrlSource}_${adiValue}_${bodyWeight}_${tierLabel}_MRL_Risk_Report`
        : "MRL Risk System"
  }, [selectedPesticide, adiValue, bodyWeight, tierLabel])  


  // =========================
  // Toggle
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

 

  if (!mrlData || !residueDefinitionData || !adiData || !intakeData) {
    return <div>Loading...</div>
  } 



  // =========================
  // Core calculation
  const { enriched, totalExposure, categoryMaxExposure, chartData} =
  buildExposure(
    mrlData,
    intakeData,
    selectedPesticide,
    selectedItems,
    bodyWeight,
    categoryKey
  )


    
  const pesticideList = [...new Set(mrlData.map(i => i.pesticide_en))]

  const currentADIList = adiData[selectedPesticide] || []

  const risk = calcRisk(totalExposure, adiValue)



  const exportWord = async () => {
    await exportMRLTableToWord(
      enriched,
      categoryMaxExposure,
      chartData,
      `${selectedPesticide}_${adiValue}_${bodyWeight}_${categoryKey}.docx`  //檔名
    )
  }



  return (
    <div style={{ padding: 20 }}>
      
        <h1>MRL Risk System</h1>
        
        
        <div className="no-print">
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
        </div>

      <div style={{ marginTop: 30 }} ref={printRef}>
        <RiskSummary
          selectedMrlSource={mrlSource}
          selectedPesticide={selectedPesticide}
          residueDefinitionData={residueDefinitionData[selectedPesticide] || [] }
          adi={adiValue}
          adiData={currentADIList}
          bodyweight={bodyWeight}
          exposure={totalExposure}
          risk={risk}
          contribution={chartData}
        />

        <div className="no-print">
        <button onClick={exportWord}>
          Export Word
        </button>
        <button onClick={() => window.print()}>
          Window Print
        </button>
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
        </div>

        <div style={{ marginTop: 20 }} >
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