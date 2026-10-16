import type { LabResult } from "@/app/types/labs";
import type { StructuredTextItem } from "unpdf";

const RESULT_REGEX =
  /^(.+?)\s+(-?\d+(?:[.,]\d+)?)\s*([a-zA-Zµμ/%^0-9./*-]+)?\s*(?:([\d.,]+\s*[-–]\s*[\d.,]+))?$/;

export function parseLabResults(pages: StructuredTextItem[][]): LabResult[] {
  const results: LabResult[] = [];

  for (const page of pages) {
    const lines = groupIntoLines(page);

    console.log("RECONSTRUCTED LINES:");

    for (const line of lines) {
      console.log(line);
    }

    for (const line of lines) {
      const result = parseLine(line);

      if (result) {
        results.push(result);
      }
    }
  }

  return results;
}

function groupIntoLines(items: StructuredTextItem[]): string[] {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) {
      return b.y - a.y;
    }

    return a.x - b.x;
  });

  const lines: StructuredTextItem[][] = [];

  for (const item of sorted) {
    const line = lines.find(
      (line) => Math.abs(line[0].y - item.y) <= 2
    );

    if (line) {
      line.push(item);
    } else {
      lines.push([item]);
    }
  }

  return lines.map((line) => {
    line.sort((a, b) => a.x - b.x);

    return line
      .map((item) => item.str)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  });
}

function parseLine(line: string): LabResult | null {
  const match = line.match(RESULT_REGEX);

  if (!match) {
    return null;
  }

  const [, name, rawValue, unit, referenceRange] = match;

  const value = Number(rawValue.replace(",", "."));

  if (Number.isNaN(value)) {
    return null;
  }

  return {
    name: name.trim(),
    value,
    unit: unit?.trim() || null,
    referenceRange: referenceRange?.trim() || null,
  };
}