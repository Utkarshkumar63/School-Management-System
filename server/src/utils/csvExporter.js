export function jsonToCsv(data, fields) {
  if (!data || !data.length) {
    return fields.map((f) => f.label || f.key).join(',') + '\n';
  }

  const header = fields.map((f) => `"${(f.label || f.key).replace(/"/g, '""')}"`).join(',');
  const rows = data.map((item) => {
    return fields
      .map((f) => {
        let val = typeof f.getValue === 'function' ? f.getValue(item) : item[f.key];
        if (val === null || val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString().split('T')[0];
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

export function sendCsv(res, filename, csvString) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvString);
}

