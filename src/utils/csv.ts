export interface ParsedCsvFile {
  headers: string[];
  rows: Array<Record<string, string>>;
}

function normalizeCell(value: string) {
  return value.replace(/\r/g, '').trim();
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(normalizeCell(current));
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(normalizeCell(current));
  return cells;
}

function splitCsvText(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) {
        lines.push(current);
      }

      current = '';

      if (char === '\r' && next === '\n') {
        i += 1;
      }
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    lines.push(current);
  }

  return lines;
}

export function parseCsv(text: string): ParsedCsvFile {
  // Strip UTF-8 BOM (exported by Excel, Google Sheets on some locales)
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = splitCsvText(cleaned);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });

  return { headers, rows };
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildCsv(headers: string[], rows: string[][]) {
  const serializedHeaders = headers.map(escapeCsvCell).join(',');
  const serializedRows = rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(','));
  return [serializedHeaders, ...serializedRows].join('\n');
}
