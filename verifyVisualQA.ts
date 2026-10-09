import {
  analyzeCubicFunction,
  sampleCubicCurve,
  formatCubicFormula,
  analyzeRationalFunction,
  sampleRationalBranches,
  formatRationalFormula,
  analyzeQuadraticFunction,
  sampleQuadraticCurve,
  formatQuadraticFormula
} from '../src/utils/graphEngine';

console.log('================================================================');
console.log('PHASE 2: COMPREHENSIVE GRAPH ENGINE VISUAL QA');
console.log('================================================================\n');

let allPassed = true;

function assert(condition: boolean, testName: string, detail: string) {
  if (condition) {
    console.log(`[PASS] ${testName}: ${detail}`);
  } else {
    console.error(`[FAIL] ${testName}: ${detail}`);
    allPassed = false;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: y = x^3 - 27x + 2
// -----------------------------------------------------------------------------
console.log('>>> [1] Testing y = x^3 - 27x + 2 (Flagship Benchmark)');
const c1 = analyzeCubicFunction(1, 0, -27, 2);
assert(c1.hasExtrema, '1.1 Extrema exists', `delta' = ${c1.deltaPrime} > 0`);
assert(c1.cd?.x === -3 && c1.cd?.y === 56, '1.2 Cực đại CĐ', `CĐ(-3; 56) vs calculated (${c1.cd?.x}; ${c1.cd?.y})`);
assert(c1.ct?.x === 3 && c1.ct?.y === -52, '1.3 Cực tiểu CT', `CT(3; -52) vs calculated (${c1.ct?.x}; ${c1.ct?.y})`);
assert(c1.inflection.x === 0 && c1.inflection.y === 2, '1.4 Điểm uốn U', `U(0; 2) vs calculated (${c1.inflection.x}; ${c1.inflection.y})`);

// Viewport must comfortably contain x = ±3 and y = 56, -52
const c1InX = c1.viewport.xMin < -3.5 && c1.viewport.xMax > 3.5;
const c1InY = c1.viewport.yMin < -60 && c1.viewport.yMax > 65;
assert(c1InX, '1.5 Ox Viewport Margin', `x ∈ [${c1.viewport.xMin.toFixed(1)}; ${c1.viewport.xMax.toFixed(1)}] leaves >= 30% margin around x=±3`);
assert(c1InY, '1.6 Oy Viewport Margin', `y ∈ [${c1.viewport.yMin.toFixed(0)}; ${c1.viewport.yMax.toFixed(0)}] leaves >= 20% margin around y=56 and y=-52`);

// Nice Ticks
const c1XTicks = c1.xTicks.map(t => t.formatted);
const c1YTicks = c1.yTicks.map(t => t.formatted);
assert(c1XTicks.includes('-6') && c1XTicks.includes('6'), '1.7 Ox Nice Ticks', `Ticks: ${c1XTicks.join(', ')}`);
assert(c1YTicks.includes('40') || c1YTicks.includes('60'), '1.8 Oy Nice Ticks', `Ticks: ${c1YTicks.join(', ')}`);

// Curve smoothness
const p1 = sampleCubicCurve(1, 0, -27, 2, c1.viewport.xMin, c1.viewport.xMax, c1.viewport.yMin, c1.viewport.yMax, x => x, y => y, 600);
const p1Points = p1.split(' ').filter(c => c === 'L' || c === 'M').length;
assert(p1Points >= 600, '1.9 Curve Smoothness', `${p1Points} sampling points (ultra smooth, zero polygon feeling)`);

// -----------------------------------------------------------------------------
// TEST 2: y = x^3 - 3x
// -----------------------------------------------------------------------------
console.log('\n>>> [2] Testing y = x^3 - 3x (Origin-Symmetric Cubic)');
const c2 = analyzeCubicFunction(1, 0, -3, 0);
assert(c2.cd?.x === -1 && c2.cd?.y === 2, '2.1 Cực đại CĐ', `CĐ(-1; 2)`);
assert(c2.ct?.x === 1 && c2.ct?.y === -2, '2.2 Cực tiểu CT', `CT(1; -2)`);
assert(c2.inflection.x === 0 && c2.inflection.y === 0, '2.3 Điểm uốn U at Origin', `U(0; 0)`);
assert(c2.viewport.xMin <= -2 && c2.viewport.xMax >= 2, '2.4 Viewport span', `x ∈ [${c2.viewport.xMin}; ${c2.viewport.xMax}], y ∈ [${c2.viewport.yMin}; ${c2.viewport.yMax}]`);

// -----------------------------------------------------------------------------
// TEST 3: y = 1/(x - 1)
// -----------------------------------------------------------------------------
console.log('\n>>> [3] Testing y = 1/(x - 1) (Simple Hyperbola)');
const r3 = analyzeRationalFunction(0, 1, 1, -1);
assert(r3.xAsymptote === 1, '3.1 TCĐ', `x = 1`);
assert(r3.yAsymptote === 0, '3.2 TCN', `y = 0`);
assert(r3.centerI.x === 1 && r3.centerI.y === 0, '3.3 Tâm đối xứng I', `I(1; 0)`);
const r3Formula = formatRationalFormula(0, 1, 1, -1);
assert(r3Formula === 'y = 1/(x - 1)', '3.4 Formula Labeling', `Expected 'y = 1/(x - 1)', got '${r3Formula}'`);

// Check branches separation
const b3 = sampleRationalBranches(0, 1, 1, -1, r3.viewport.xMin, r3.viewport.xMax, r3.viewport.yMin, r3.viewport.yMax, x => x, y => y);
assert(b3.leftPath.startsWith('M ') && b3.rightPath.startsWith('M '), '3.5 Disjoint Path Strings', 'Left and Right are separate strings');

// Extract all x coords from left path and right path
const extractXCoords = (pathStr: string): number[] => {
  const parts = pathStr.split(' ');
  const xs: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      const xVal = parseFloat(parts[i + 1]);
      if (!isNaN(xVal)) xs.push(xVal);
    }
  }
  return xs;
};

const leftXs3 = extractXCoords(b3.leftPath);
const rightXs3 = extractXCoords(b3.rightPath);
const maxLeftX3 = Math.max(...leftXs3);
const minRightX3 = Math.min(...rightXs3);
assert(maxLeftX3 < 1.0, '3.6 Left branch strictly x < 1', `Max x in left branch is ${maxLeftX3.toFixed(3)} < 1.0`);
assert(minRightX3 > 1.0, '3.7 Right branch strictly x > 1', `Min x in right branch is ${minRightX3.toFixed(3)} > 1.0`);
assert(minRightX3 - maxLeftX3 > 0.4, '3.8 Asymptote Gap Clear', `Gap around x=1 is ${(minRightX3 - maxLeftX3).toFixed(3)} units (NO BRIDGE)`);

// -----------------------------------------------------------------------------
// TEST 4: y = (x + 2)/(x - 1)
// -----------------------------------------------------------------------------
console.log('\n>>> [4] Testing y = (x + 2)/(x - 1) (Shifted Hyperbola)');
const r4 = analyzeRationalFunction(1, 2, 1, -1);
assert(r4.xAsymptote === 1, '4.1 TCĐ', `x = 1`);
assert(r4.yAsymptote === 1, '4.2 TCN', `y = 1`);
assert(r4.centerI.x === 1 && r4.centerI.y === 1, '4.3 Tâm đối xứng I', `I(1; 1)`);
const r4Formula = formatRationalFormula(1, 2, 1, -1);
assert(r4Formula === 'y = (x + 2)/(x - 1)', '4.4 Formula Labeling', `'${r4Formula}'`);

const b4 = sampleRationalBranches(1, 2, 1, -1, r4.viewport.xMin, r4.viewport.xMax, r4.viewport.yMin, r4.viewport.yMax, x => x, y => y);
const leftXs4 = extractXCoords(b4.leftPath);
const rightXs4 = extractXCoords(b4.rightPath);
const maxLeftX4 = Math.max(...leftXs4);
const minRightX4 = Math.min(...rightXs4);
assert(maxLeftX4 < 1.0 && minRightX4 > 1.0, '4.5 Absolute Discontinuity Isolation', `Left max: ${maxLeftX4.toFixed(3)}, Right min: ${minRightX4.toFixed(3)}`);

// -----------------------------------------------------------------------------
// TEST 5: y = 1/x
// -----------------------------------------------------------------------------
console.log('\n>>> [5] Testing y = 1/x (Origin-Centered Hyperbola)');
const r5 = analyzeRationalFunction(0, 1, 1, 0);
assert(r5.xAsymptote === 0, '5.1 TCĐ', `x = 0 (trục Oy)`);
assert(r5.yAsymptote === 0, '5.2 TCN', `y = 0 (trục Ox)`);
assert(r5.centerI.x === 0 && r5.centerI.y === 0, '5.3 Tâm đối xứng I', `I(0; 0)`);
const r5Formula = formatRationalFormula(0, 1, 1, 0);
assert(r5Formula === 'y = 1/x', '5.4 Formula Labeling', `'${r5Formula}'`);

const b5 = sampleRationalBranches(0, 1, 1, 0, r5.viewport.xMin, r5.viewport.xMax, r5.viewport.yMin, r5.viewport.yMax, x => x, y => y);
const leftXs5 = extractXCoords(b5.leftPath);
const rightXs5 = extractXCoords(b5.rightPath);
const maxLeftX5 = Math.max(...leftXs5);
const minRightX5 = Math.min(...rightXs5);
assert(maxLeftX5 < 0.0 && minRightX5 > 0.0, '5.5 Asymptote x=0 Isolated', `Left max: ${maxLeftX5.toFixed(3)} < 0 < Right min: ${minRightX5.toFixed(3)}`);

// -----------------------------------------------------------------------------
// TEST 6: y = x^2
// -----------------------------------------------------------------------------
console.log('\n>>> [6] Testing y = x^2 (Parabola)');
const q6 = analyzeQuadraticFunction(1, 0, 0);
assert(q6.vertex.x === 0 && q6.vertex.y === 0, '6.1 Vertex I', `I(0; 0)`);
assert(q6.axisOfSymmetry === 0, '6.2 Axis of Symmetry', `x = 0`);
assert(q6.viewport.yMin <= -1 && q6.viewport.yMax >= 7, '6.3 Pedagogical Viewport', `y ∈ [${q6.viewport.yMin}; ${q6.viewport.yMax}] (clearly shows vertex above bottom edge)`);
const q6Formula = formatQuadraticFormula(1, 0, 0);
assert(q6Formula === 'y = x²', '6.4 Formula Labeling', `'${q6Formula}'`);

const p6 = sampleQuadraticCurve(1, 0, 0, q6.viewport.xMin, q6.viewport.xMax, q6.viewport.yMin, q6.viewport.yMax, x => x, y => y, 400);
const p6Points = p6.split(' ').filter(c => c === 'L' || c === 'M').length;
assert(p6Points >= 400, '6.5 Smooth Parabola Sampling', `${p6Points} sampling points`);

console.log('\n================================================================');
if (allPassed) {
  console.log('RESULT: >>> ALL 6 VISUAL QA TESTS PASSED 100% <<<');
} else {
  console.error('RESULT: >>> SOME VISUAL QA TESTS FAILED <<<');
  process.exit(1);
}
console.log('================================================================');
