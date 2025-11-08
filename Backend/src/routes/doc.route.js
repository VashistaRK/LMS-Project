import { Router } from "express";
import multer from "multer";
import zlib from "zlib";
import Doc from "../models/Doc.js";

const router = Router();

// 🧩 Multer setup — stores file in memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// 📤 Upload PDF Route: POST /docs/:docId/upload
router.post("/:docId/upload", upload.single("pdf"), async (req, res) => {
  try {
    const { docId } = req.params;
    if (!req.file)
      return res.status(400).json({ error: "PDF file is required" });

    const pdfBuffer = req.file.buffer;
    const originalSize = req.file.size || pdfBuffer.length;

    // 🧠 Compress small files before saving
    const compressedBuffer = zlib.gzipSync(pdfBuffer);

    let doc = await Doc.findOne({ docId });
    if (!doc) doc = new Doc({ docId });

    doc.pdfData = compressedBuffer;
    doc.pdfMime = req.file.mimetype || "application/pdf";
    doc.pdfGzipped = true;
    doc.pdfSize = originalSize;
    doc.pdfCompressedSize = compressedBuffer.length;

    await doc.save();

    return res.status(200).json({
      message: "✅ PDF uploaded successfully",
      docId: doc.docId,
      pdfSize: originalSize,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return res.status(500).json({ error: "Failed to upload PDF" });
  }
});

// 📥 Stream PDF bytes (for frontend rendering)
router.get("/:docId/pdf", async (req, res) => {
  try {
    const { docId } = req.params;
    const doc = await Doc.findOne({ docId });

    if (!doc || !doc.pdfData)
      return res.status(404).json({ error: "PDF not found" });

    const buffer = doc.pdfGzipped
      ? zlib.gunzipSync(doc.pdfData)
      : doc.pdfData;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${docId}.pdf"`);
    res.setHeader("Content-Length", buffer.length);

    res.status(200).send(buffer);
  } catch (err) {
    console.error("❌ Fetch PDF error:", err);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
});

// 📜 Fetch metadata (optional)
router.get("/:docId", async (req, res) => {
  try {
    const { docId } = req.params;
    const doc = await Doc.findOne({ docId }).lean();

    if (!doc)
      return res.status(404).json({ error: "Document not found" });

    // Provide direct PDF URL
    if (doc.pdfData)
      doc.pdfUrl = `/docs/${encodeURIComponent(docId)}/pdf`;

    res.json(doc);
  } catch (err) {
    console.error("❌ Fetch document error:", err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

export default router;
