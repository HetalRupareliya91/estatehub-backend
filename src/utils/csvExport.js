// Minimal CSV serializer - avoids pulling in an extra dependency for a simple job.
function toCsv(rows, columns) {
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...lines].join('\n');
}

module.exports = { toCsv };

