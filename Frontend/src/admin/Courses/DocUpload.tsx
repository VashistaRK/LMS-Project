import { useState } from "react";
const baseURL= import.meta.env.VITE_API_URL;

function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);

  const uploadPDF = async () => {
    if (!file) return alert("Please select a PDF first.");
    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch(`${baseURL}/docs/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    alert(`Uploaded! docId: ${data.docId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={uploadPDF}>Upload PDF</button>
    </div>
  );
}

export default PDFUploader;
