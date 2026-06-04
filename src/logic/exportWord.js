import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun
} from "docx"

import { saveAs } from "file-saver"

export async function exportMRLTableToWord(
  enriched,
  categoryMaxExposure,
  chartData,
  filename = "MRL_Report.docx"
) {

  const chartMap = Object.fromEntries(
    (chartData ?? []).map(d => [d.category, d])
  )

  // group categories internally
  const groupedMap = enriched.reduce((acc, item) => {
    const cat = item.category_t1

    if (!acc[cat]) {
      acc[cat] = {
        category: cat,
        maxExposure: categoryMaxExposure[cat],
        percent: chartMap?.[cat]?.percent ?? 0,
        items: []
      }
    }

    acc[cat].items.push(item)

    return acc
  }, {})

  const groupedData = Object.values(groupedMap)

  const rows = []

  // header
  rows.push(
    new TableRow({
      children: [
        "Pesticide",
        "Crop",
        "Category",
        "MRL",
        "Intake",
        "Exposure"
      ].map(text =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: true
                })
              ]
            })
          ]
        })
      )
    })
  )

  // categories
  groupedData.forEach(group => {

    // category title row
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      `▼ ${group.category} ` +
                      `Max Exposure: ${group.maxExposure.toFixed(6)} ` +
                      `${group.percent.toFixed(1)}%`,
                    bold: true
                  })
                ]
              })
            ]
          })
        ]
      })
    )

    // item rows
    group.items.forEach(item => {

        const isMax =
            Number(item.exposure) ===
            Number(group.maxExposure)

        rows.push(
            new TableRow({
            children: [

                // pesticide
                new TableCell({
                children: [
                    new Paragraph(String(item.pesticide_en ?? ""))
                ]
                }),

                // crop
                new TableCell({
                children: [
                    new Paragraph(String(item.crop ?? ""))
                ]
                }),

                // category
                new TableCell({
                children: [
                    new Paragraph(String(item.category_t1 ?? ""))
                ]
                }),

                // mrl
                new TableCell({
                children: [
                    new Paragraph(String(item.limit ?? ""))
                ]
                }),

                // intake
                new TableCell({
                children: [
                    new Paragraph(String(item.intake.toFixed(6) ?? ""))
                ]
                }),

                // exposure
                new TableCell({

                shading: isMax
                    ? {
                        fill: "FF0000"
                    }
                    : undefined,

                children: [
                    new Paragraph(
                    String(item.exposure.toFixed(6) ?? "")
                    )
                ]
                })

            ]
            })
        )

    })

  })

  const table = new Table({
    rows
  })

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "MRL Risk Report",
                bold: true,
                size: 32
              })
            ]
          }),

          new Paragraph(""),

          table
        ]
      }
    ]
  })

  const blob = await Packer.toBlob(doc)

  saveAs(blob, filename)
}