"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportButtons({
  targetId,
  filenameHint,
}: {
  targetId: string;
  filenameHint?: string;
}) {
  const exportPNG = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
    const dataURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `${filenameHint || "flowmind"}.png`;
    a.click();
  };

  const exportPDF = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "l", unit: "pt", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${filenameHint || "flowmind"}.pdf`);
  };

  return (
    <div className="mb-3 flex items-center gap-2">
      <button onClick={exportPNG} className="rounded-lg px-3 py-2 text-sm bg-slate-800 text-white hover:bg-slate-700">
        Export PNG
      </button>
      <button onClick={exportPDF} className="rounded-lg px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-500">
        Export PDF
      </button>
    </div>
  );
}
