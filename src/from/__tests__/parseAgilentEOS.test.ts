import { readFileSync } from 'fs';
import { join } from 'path';

import { parseAgilentEOS } from '../parseAgilentEOS';

describe('parseAgilentEOS', () => {
  it('no dilution', () => {
    const binary = readFileSync(join(__dirname, 'data/agilent.xlsx'));
    const results = parseAgilentEOS(binary);
    expect(results).toHaveLength(19);
    expect(results[17]).toStrictEqual({
      elements: [
        {
          element: 'Al',
          wavelength: { value: 308.215, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 0.12 },
        },
        {
          element: 'Al',
          wavelength: { value: 309.271, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 0.1 },
        },
        {
          element: 'Al',
          wavelength: { value: 396.152, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 0.12 },
        },
        {
          element: 'Cu',
          wavelength: { value: 213.598, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 2.67 },
        },
        {
          element: 'Cu',
          wavelength: { value: 324.754, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 2.66 },
        },
        {
          element: 'Cu',
          wavelength: { value: 327.395, units: 'nm' },
          experimentalConcentration: { units: 'mg/l', value: 2.65 },
        },
      ],
      reference: 'patiny_TEST_F3',
    });
    expect(results).toMatchSnapshot();
  });
  it('dilution', () => {
    const binary = readFileSync(join(__dirname, 'data/agilent.xlsx'));
    const results = parseAgilentEOS(binary, {
      dilution: { factor: 10, solvent: 'Nitric acid 2%' },
    });
    expect(results).toHaveLength(19);
    expect(results[17].elements[0]).toStrictEqual({
      element: 'Al',
      wavelength: { value: 308.215, units: 'nm' },
      experimentalConcentration: { units: 'mg/l', value: 0.12 },
      sampleConcentration: { value: 1.2, units: 'mg/l' },
      dilution: { factor: 10, solvent: 'Nitric acid 2%' },
    });
  });
});
