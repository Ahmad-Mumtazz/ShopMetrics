export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const escapeCell = (value) => {
    const rawText = String(value ?? '');
    const text = typeof value === 'string' && /^[\t\r=+\-@]/.test(rawText) ? `'${rawText}` : rawText;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = rows.map(row => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
