export function parseCSV(csv: string): Record<string, string>[] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
      currentLine.push(currentVal.trim());
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  // Handle last line if no newline at EOF
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal.trim());
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const headers = lines[0];
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    // Allow lenient parsing if last field is empty/missing
    if (
      values.length === headers.length ||
      (values.length === headers.length - 1 && headers.length > values.length)
    ) {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      result.push(obj);
    }
  }

  return result;
}
