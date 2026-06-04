import html2pdf from "html2pdf.js"

export async function exportPDF(element, filename = "report.pdf") {

  const opt = {
    margin: 10,
    filename,

    image: {
      type: "jpeg",
      quality: 1
    },

    html2canvas: {
      scale: 2,
      useCORS: true
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "landscape"
    }
  }

  await html2pdf()
    .set(opt)
    .from(element)
    .save()
}