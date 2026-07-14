export type ParsedCsvRow = {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
};

function detectDelimiter(headerLine: string) {
  const semis = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function splitLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseBrAmount(raw: string): number | null {
  const cleaned = raw.replace(/R\$\s?/gi, "").replace(/\s/g, "").trim();
  if (!cleaned) return null;
  // 1.234,56 or -1.234,56
  if (cleaned.includes(",") && cleaned.includes(".")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (cleaned.includes(",")) {
    return Number(cleaned.replace(",", "."));
  }
  return Number(cleaned);
}

function parseDate(raw: string): string | null {
  const v = raw.trim();
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  // dd/mm/yyyy
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

const DATE_KEYS = ["data", "date", "datatransacao", "datalancamento"];
const DESC_KEYS = ["descricao", "description", "titulo", "historico", "memo", "estabelecimento"];
const AMOUNT_KEYS = ["valor", "amount", "value", "montante"];

function findIndex(headers: string[], keys: string[]) {
  const normalized = headers.map(normalizeHeader);
  for (const key of keys) {
    const idx = normalized.indexOf(key);
    if (idx >= 0) return idx;
  }
  // fuzzy contains
  for (let i = 0; i < normalized.length; i += 1) {
    if (keys.some((k) => normalized[i].includes(k))) return i;
  }
  return -1;
}

/** Parse Nubank-friendly and generic bank CSV/OFX-ish text exports. */
export function parseBankCsv(text: string): ParsedCsvRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  // Minimal OFX support: <STMTTRN> blocks
  if (cleaned.includes("<STMTTRN>") || cleaned.includes("<OFX>")) {
    return parseOfx(cleaned);
  }

  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter);
  let dateIdx = findIndex(headers, DATE_KEYS);
  let descIdx = findIndex(headers, DESC_KEYS);
  let amountIdx = findIndex(headers, AMOUNT_KEYS);

  // Nubank often: Data,Valor,Identificador,Descrição
  if (dateIdx < 0 && headers.length >= 2) dateIdx = 0;
  if (amountIdx < 0 && headers.length >= 2) amountIdx = 1;
  if (descIdx < 0) descIdx = headers.length - 1;

  const rows: ParsedCsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitLine(line, delimiter);
    const date = parseDate(cells[dateIdx] ?? "");
    const amountRaw = parseBrAmount(cells[amountIdx] ?? "");
    const description = (cells[descIdx] ?? "").replace(/^"|"$/g, "").trim();
    if (!date || amountRaw == null || !Number.isFinite(amountRaw) || amountRaw === 0 || !description) {
      continue;
    }
    rows.push({
      date,
      description,
      amount: Math.abs(amountRaw),
      type: amountRaw < 0 ? "expense" : "income",
    });
  }
  return rows;
}

function parseOfx(text: string): ParsedCsvRow[] {
  const blocks = text.split(/<\/?STMTTRN>/i).filter((b) => /<TRNAMT>/i.test(b));
  const rows: ParsedCsvRow[] = [];
  for (const block of blocks) {
    const amountMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
    const dateMatch = block.match(/<DTPOSTED>(\d{8})/i);
    const memoMatch = block.match(/<(?:MEMO|NAME)>([^<\r\n]+)/i);
    if (!amountMatch || !dateMatch) continue;
    const amountRaw = Number(amountMatch[1]);
    const d = dateMatch[1];
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    const description = (memoMatch?.[1] ?? "Importação OFX").trim();
    if (!Number.isFinite(amountRaw) || amountRaw === 0) continue;
    rows.push({
      date,
      description,
      amount: Math.abs(amountRaw),
      type: amountRaw < 0 ? "expense" : "income",
    });
  }
  return rows;
}
