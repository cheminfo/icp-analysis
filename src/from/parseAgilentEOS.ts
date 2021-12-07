import XLSX from 'xlsx';

export function parseAgilentEOS(binary: ArrayBuffer | Uint8Array) {
  const workbook = XLSX.read(binary, { type: 'array' });

  // summary is on Sheet2
  const matrix: (string | number)[][] = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[1]],
    {
      header: 1,
    },
  );
  const header = parseHeader(matrix[0]);
  const samples = [];
  for (let line of matrix.slice(1).filter((line) => line[2])) {
    const sample = { elements: [] as any, reference: line[2] };
    for (let i = 3; i < header.length; i++) {
      const result = JSON.parse(JSON.stringify(header[i]));
      if (result.quantity.value === 'undefined') {
        continue;
      }
      result.quantity.value = parseFloat(`${line[i]}`);
      sample.elements.push(result);
    }
    samples.push(sample);
  }
  return samples;
}

function parseHeader(header: any) {
  return header.map((item: string) => {
    if (item.includes('.')) {
      const parts = item.split(' ');
      return {
        element: parts[0],
        wavelength: {
          value: Number(parts[1]),
          units: parts[2],
        },
        quantity: {
          value: undefined,
          units: parts[3] === 'ppm' ? 'mg/l' : parts[3],
        },
      };
    }
    return { label: item };
  });
}
