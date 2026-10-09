import {
  analyzeCubicFunction,
  sampleCubicCurve,
  analyzeRationalFunction,
  sampleRationalBranches,
  generateNiceTicks
} from '../src/utils/graphEngine';

console.log('====================================================');
console.log('PHASE 2: GRAPH VISUAL QA TEST SUITE');
console.log('====================================================\n');

// 1. y = x^3 - 27x + 2
console.log('--- TEST 1: y = x^3 - 27x + 2 ---');
const c1 = analyzeCubicFunction(1, 0, -27, 2);
console.log('Viewport:', c1.viewport);
console.log('Has Extrema:', c1.hasExtrema);
console.log('Cực đại CĐ:', c1.cd);
console.log('Cực tiểu CT:', c1.ct);
console.log('Điểm uốn U:', c1.inflection);
console.log('xTicks:', c1.xTicks.map(t => t.formatted));
console.log('yTicks:', c1.yTicks.map(t => t.formatted));
const path1 = sampleCubicCurve(1, 0, -27, 2, c1.viewport.xMin, c1.viewport.xMax, c1.viewport.yMin, c1.viewport.yMax, x => x, y => y, 500);
console.log('Path 1 length:', path1.length, 'Points count:', path1.split(' ').filter(c => c === 'L' || c === 'M').length);

// 2. y = x^3 - 3x
console.log('\n--- TEST 2: y = x^3 - 3x ---');
const c2 = analyzeCubicFunction(1, 0, -3, 0);
console.log('Viewport:', c2.viewport);
console.log('Has Extrema:', c2.hasExtrema);
console.log('Cực đại CĐ:', c2.cd);
console.log('Cực tiểu CT:', c2.ct);
console.log('Điểm uốn U:', c2.inflection);
console.log('xTicks:', c2.xTicks.map(t => t.formatted));
console.log('yTicks:', c2.yTicks.map(t => t.formatted));

// 3. y = 1/(x-1) -> a=0, b=1, c=1, d=-1
console.log('\n--- TEST 3: y = 1/(x-1) ---');
const r3 = analyzeRationalFunction(0, 1, 1, -1);
console.log('Viewport:', r3.viewport);
console.log('TCĐ xAsymptote:', r3.xAsymptote);
console.log('TCN yAsymptote:', r3.yAsymptote);
console.log('Tâm đối xứng I:', r3.centerI);
console.log('xTicks:', r3.xTicks.map(t => t.formatted));
console.log('yTicks:', r3.yTicks.map(t => t.formatted));
const branches3 = sampleRationalBranches(0, 1, 1, -1, r3.viewport.xMin, r3.viewport.xMax, r3.viewport.yMin, r3.viewport.yMax, x => x, y => y);
console.log('Left branch path length:', branches3.leftPath.length);
console.log('Right branch path length:', branches3.rightPath.length);
console.log('Does left branch contain asymptote x=1?', branches3.leftPath.includes('1.00'));
console.log('Are branches strictly separate?', branches3.leftPath !== '' && branches3.rightPath !== '' && !branches3.leftPath.includes(branches3.rightPath));

// 4. y = (x+2)/(x-1) -> a=1, b=2, c=1, d=-1
console.log('\n--- TEST 4: y = (x+2)/(x-1) ---');
const r4 = analyzeRationalFunction(1, 2, 1, -1);
console.log('Viewport:', r4.viewport);
console.log('TCĐ xAsymptote:', r4.xAsymptote);
console.log('TCN yAsymptote:', r4.yAsymptote);
console.log('Tâm đối xứng I:', r4.centerI);
console.log('xTicks:', r4.xTicks.map(t => t.formatted));
console.log('yTicks:', r4.yTicks.map(t => t.formatted));
const branches4 = sampleRationalBranches(1, 2, 1, -1, r4.viewport.xMin, r4.viewport.xMax, r4.viewport.yMin, r4.viewport.yMax, x => x, y => y);
console.log('Left branch path length:', branches4.leftPath.length);
console.log('Right branch path length:', branches4.rightPath.length);

// 5. y = 1/x -> a=0, b=1, c=1, d=0
console.log('\n--- TEST 5: y = 1/x ---');
const r5 = analyzeRationalFunction(0, 1, 1, 0);
console.log('Viewport:', r5.viewport);
console.log('TCĐ xAsymptote:', r5.xAsymptote);
console.log('TCN yAsymptote:', r5.yAsymptote);
console.log('Tâm đối xứng I:', r5.centerI);
console.log('xTicks:', r5.xTicks.map(t => t.formatted));
console.log('yTicks:', r5.yTicks.map(t => t.formatted));
const branches5 = sampleRationalBranches(0, 1, 1, 0, r5.viewport.xMin, r5.viewport.xMax, r5.viewport.yMin, r5.viewport.yMax, x => x, y => y);
console.log('Left branch path length:', branches5.leftPath.length);
console.log('Right branch path length:', branches5.rightPath.length);

console.log('\n====================================================');
console.log('QA SUITE EXECUTED');
console.log('====================================================');
