import { NextResponse } from "next/server";
import { extractText, extractTextItems } from "unpdf";
import { parseLabResults } from "./parser";
import { exportData, pdfExportData } from "@/app/api/utils/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      if (file.type !== "application/pdf") {
        continue;
      }

      const buffer = await file.arrayBuffer();

      const { totalPages, items } = await extractTextItems(new Uint8Array(buffer));
      
      console.log(`Extracted text from ${file.name}:`, items);

      //pdfExportData(items, file.name, new Date().toLocaleDateString(), new Date().toLocaleTimeString());

      const labResults = parseLabResults(items);

      exportData(JSON.stringify(labResults, null, 2), file.name);

      results.push({
        filename: file.name,
        results: labResults,
      });
    }

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    return NextResponse.json(
      { error: "Failed to extract PDF text" },
      { status: 500 }
    );
  }
}