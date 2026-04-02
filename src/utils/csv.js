function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  // Quote if contains comma, quote, or newline
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCsv(rows, headers) {
  // headers: [{ key, label }]
  const lines = [];
  lines.push(headers.map((h) => escapeCsv(h.label)).join(','));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h.key])).join(','));
  }
  return lines.join('\n') + '\n';
}

module.exports = {
  toCsv,
};
