import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

const PDF_MIME_TYPE = "application/pdf";
const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PLAIN_TEXT_MIME_TYPE = "text/plain";

const hasExtension = (fileName: string, extension: string) =>
  fileName.toLowerCase().endsWith(extension);

const normalizeExtractedText = (value: string) =>
  value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const ensureExtractedText = (value: string, fallbackMessage: string) => {
  const normalized = normalizeExtractedText(value);

  if (!normalized) {
    throw new Error(fallbackMessage);
  }

  return normalized;
};

export function isSupportedArticleFile(file: File) {
  const mimeType = file.type.toLowerCase();

  return (
    mimeType === PDF_MIME_TYPE ||
    mimeType === DOCX_MIME_TYPE ||
    mimeType === PLAIN_TEXT_MIME_TYPE ||
    hasExtension(file.name, ".pdf") ||
    hasExtension(file.name, ".docx") ||
    hasExtension(file.name, ".txt")
  );
}

async function parsePdfFile(file: File) {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    try {
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean)
          .join(" ");

        pages.push(pageText);
      }

      return ensureExtractedText(
        pages.join("\n\n"),
        "This PDF does not contain readable text. Please paste the article text or upload a text-based PDF.",
      );
    } finally {
      await pdf.destroy();
    }
  } catch {
    throw new Error(
      "We couldn't read this PDF. Please upload a text-based PDF/DOCX file or paste the article text.",
    );
  }
}

async function parseDocxFile(file: File) {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return ensureExtractedText(
      result.value,
      "This DOCX file does not contain readable text. Please paste the article text or upload a different file.",
    );
  } catch {
    throw new Error(
      "We couldn't read this DOCX file. Please upload another DOCX file or paste the article text.",
    );
  }
}

async function parsePlainTextFile(file: File) {
  return ensureExtractedText(
    await file.text(),
    "This TXT file is empty. Please upload a file with article content or paste the text.",
  );
}

export async function parseArticleFile(file: File) {
  if (hasExtension(file.name, ".pdf") || file.type === PDF_MIME_TYPE) {
    return parsePdfFile(file);
  }

  if (hasExtension(file.name, ".docx") || file.type === DOCX_MIME_TYPE) {
    return parseDocxFile(file);
  }

  if (hasExtension(file.name, ".txt") || file.type === PLAIN_TEXT_MIME_TYPE) {
    return parsePlainTextFile(file);
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}