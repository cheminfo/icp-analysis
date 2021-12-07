import { ICPResult, ICPDilution } from 'cheminfo-types';
import XLSX from 'xlsx';

interface SampleResult {
  elements: ICPResult[];
  reference: string;
}

interface ParseAgilentEOSOptions {
  dilution?: ICPDilution;
}

/**
 * Parse an excel spreadsheet generate by Agilent EOS
 * @param binary
 * @returns
 */
export function parseAgilentEOS(
  binary: ArrayBuffer | Uint8Array,
  options: ParseAgilentEOSOptions = {},
): SampleResult[] {
  const workbook = XLSX.read(binary, { type: 'array' });

  const { dilution = {} } = options;
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
    const sample = { elements: [] as any, reference: line[2] as string };
    for (let i = 3; i < header.length; i++) {
      const result = JSON.parse(JSON.stringify(header[i]));
      result.experimentalConcentration.value = parseFloat(`${line[i]}`);
      if (dilution.factor) {
        result.sampleConcentration = {
          value: result.experimentalConcentration.value * dilution.factor,
          units: result.experimentalConcentration.units,
        };
      }
      if (dilution.factor || dilution.solvent) {
        result.dilution = dilution;
      }
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
        experimentalConcentration: {
          value: undefined,
          units: parts[3] === 'ppm' ? 'mg/l' : parts[3],
        },
      };
    }
    return { label: item };
  });
}
