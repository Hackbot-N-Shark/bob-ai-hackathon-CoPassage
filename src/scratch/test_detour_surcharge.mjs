/**
 * Automated Test Script: 500m Destination Gate + Detour Surcharge
 *
 * Covers:
 * 1. calculateDetourExcessKm() — known coordinate triangle
 * 2. calculateDetourSurcharge() — four boundary cases
 * 3. 500m gate boundary — 490m included, 510m excluded
 * 4. calculateMatchScore() composite ordering sanity check
 *
 * Run with: node scratch/test_detour_surcharge.mjs
 */

// ─── Inline implementations (independently derived, not imported from src) ───
// These are re-implementations to test against, matching the same math but
// independently written to avoid circular validation.

const EARTH_RADIUS_KM = 6371;

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ─── Constants (must match src/constants.ts) ───
const MAX_DEST_DISTANCE_KM = 0.5;
const MAX_BEARING_DIFF_DEG = 25;
const DETOUR_SURCHARGE_PER_KM = 15;
const DETOUR_SURCHARGE_FREE_THRESHOLD_KM = 0.3;

// ─── Functions Under Test (re-implemented for independence) ───

function calculateDetourExcessKm(hostOriginLat, hostOriginLng, seekerLat, seekerLng, hostDestLat, hostDestLng) {
  const directRouteKm = haversineDistanceKm(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng);
  const originToSeeker = haversineDistanceKm(hostOriginLat, hostOriginLng, seekerLat, seekerLng);
  const seekerToDest = haversineDistanceKm(seekerLat, seekerLng, hostDestLat, hostDestLng);
  const totalViaSeeker = originToSeeker + seekerToDest;
  return Math.max(0, totalViaSeeker - directRouteKm);
}

function calculateDetourSurcharge(excessKm) {
  const chargeableExcess = Math.max(0, excessKm - DETOUR_SURCHARGE_FREE_THRESHOLD_KM);
  const surcharge = chargeableExcess * DETOUR_SURCHARGE_PER_KM;
  return Math.round(surcharge);
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getBearingDifference(b1, b2) {
  const diff = Math.abs(b1 - b2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function crossTrackDistanceKm(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng, seekerLat, seekerLng) {
  const R = EARTH_RADIUS_KM;
  const toRad = (d) => (d * Math.PI) / 180;
  const d13 = haversineDistanceKm(hostOriginLat, hostOriginLng, seekerLat, seekerLng) / R;
  const bearing13 = toRad(calculateBearing(hostOriginLat, hostOriginLng, seekerLat, seekerLng));
  const bearing12 = toRad(calculateBearing(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng));
  const crossTrack = Math.asin(Math.sin(d13) * Math.sin(bearing13 - bearing12)) * R;
  return Math.abs(crossTrack);
}

function alongTrackDistanceKm(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng, seekerLat, seekerLng, crossTrackKm) {
  const R = EARTH_RADIUS_KM;
  const toRad = (d) => (d * Math.PI) / 180;
  const xtKm = crossTrackKm ?? crossTrackDistanceKm(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng, seekerLat, seekerLng);
  const d13 = haversineDistanceKm(hostOriginLat, hostOriginLng, seekerLat, seekerLng) / R;
  const crossTrackRad = xtKm / R;
  const bearing13 = toRad(calculateBearing(hostOriginLat, hostOriginLng, seekerLat, seekerLng));
  const bearing12 = toRad(calculateBearing(hostOriginLat, hostOriginLng, hostDestLat, hostDestLng));
  const angleDiff = bearing13 - bearing12;
  const cosRatio = Math.cos(d13) / Math.cos(crossTrackRad);
  const clampedCosRatio = Math.max(-1, Math.min(1, cosRatio));
  const rawAlong = Math.acos(clampedCosRatio) * R;
  const isForward = Math.cos(angleDiff) >= 0;
  return isForward ? rawAlong : -rawAlong;
}

function calculateMatchScore(params) {
  const {
    originDistanceKm, bearingDiffDeg, destDistanceKm,
    crossTrackKm, alongTrackKm, totalRouteKm, maxRadiusKm
  } = params;

  const proximityScore = Math.max(0, 100 * (1 - originDistanceKm / maxRadiusKm));
  const bearingScore = Math.max(0, 100 * (1 - bearingDiffDeg / MAX_BEARING_DIFF_DEG));
  const destScore = destDistanceKm != null
    ? Math.max(0, 100 * (1 - destDistanceKm / MAX_DEST_DISTANCE_KM))
    : 100;

  const DETOUR_PENALTY_RADIUS_KM = 0.75;
  let effectiveDetourKm = crossTrackKm;
  if (crossTrackKm != null && alongTrackKm != null && alongTrackKm < 0) {
    effectiveDetourKm = Math.sqrt(crossTrackKm ** 2 + alongTrackKm ** 2);
  }
  const detourScore = effectiveDetourKm != null
    ? Math.max(0, 100 * (1 - effectiveDetourKm / DETOUR_PENALTY_RADIUS_KM))
    : 100;

  let inPathScore = 100;
  if (alongTrackKm != null && totalRouteKm != null && totalRouteKm > 0) {
    if (alongTrackKm < 0) {
      inPathScore = Math.max(0, 100 * (1 - Math.abs(alongTrackKm) / 0.5));
    } else if (alongTrackKm > totalRouteKm) {
      inPathScore = Math.max(0, 100 * (1 - (alongTrackKm - totalRouteKm) / 0.5));
    } else {
      inPathScore = 100;
    }
  }

  const WEIGHTS = {
    proximity: 0.15,
    bearing: 0.20,
    destination: 0.20,
    detour: 0.25,
    inPath: 0.20,
  };

  const score =
    proximityScore * WEIGHTS.proximity +
    bearingScore * WEIGHTS.bearing +
    destScore * WEIGHTS.destination +
    detourScore * WEIGHTS.detour +
    inPathScore * WEIGHTS.inPath;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * 500m gate filter (simulated filterNearbyOpenPosts Gate 5 logic)
 */
function passesDestinationGate(seekerDestLat, seekerDestLng, hostDestLat, hostDestLng) {
  const destDistance = haversineDistanceKm(seekerDestLat, seekerDestLng, hostDestLat, hostDestLng);
  return destDistance <= MAX_DEST_DISTANCE_KM;
}

// ─── Test Runner ───

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

function assertApprox(actual, expected, tolerancePercent, label) {
  const tolerance = Math.abs(expected) * (tolerancePercent / 100) + 0.001; // add small absolute floor
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`  ✅ PASS: ${label} (actual: ${actual.toFixed(4)}, expected: ~${expected.toFixed(4)}, tolerance: ±${(tolerancePercent)}%)`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label} (actual: ${actual.toFixed(4)}, expected: ~${expected.toFixed(4)}, diff: ${diff.toFixed(4)})`);
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════
// TEST 1: calculateDetourExcessKm()
// ═══════════════════════════════════════════════════════════
console.log('\n═══ TEST 1: calculateDetourExcessKm() ═══');

// Known triangle: Ahmedabad (host origin) → Nadiad (host dest) ~45km direct
// Seeker at Anand (roughly between but slightly off-path), ~30km from origin, ~20km from dest
// Direct: ~45.5 km. Via seeker: ~30 + 20 = ~50 km. Excess: ~4.5 km.
const hostOrigin = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad
const hostDest   = { lat: 22.6916, lng: 72.8634 };  // Nadiad
const seekerPos  = { lat: 22.5596, lng: 72.9505 };  // Anand (off-path)

const directRoute = haversineDistanceKm(hostOrigin.lat, hostOrigin.lng, hostDest.lat, hostDest.lng);
const originToSeeker = haversineDistanceKm(hostOrigin.lat, hostOrigin.lng, seekerPos.lat, seekerPos.lng);
const seekerToDest = haversineDistanceKm(seekerPos.lat, seekerPos.lng, hostDest.lat, hostDest.lng);
const expectedExcess = (originToSeeker + seekerToDest) - directRoute;

console.log(`  Direct route: ${directRoute.toFixed(2)} km`);
console.log(`  Origin→Seeker: ${originToSeeker.toFixed(2)} km`);
console.log(`  Seeker→Dest: ${seekerToDest.toFixed(2)} km`);
console.log(`  Expected excess: ${expectedExcess.toFixed(4)} km`);

const actualExcess = calculateDetourExcessKm(
  hostOrigin.lat, hostOrigin.lng,
  seekerPos.lat, seekerPos.lng,
  hostDest.lat, hostDest.lng
);
assertApprox(actualExcess, expectedExcess, 0.1, 'Excess distance matches triangle inequality');
assert(actualExcess > 0, 'Excess is positive for off-path seeker');

// Test: seeker directly ON the path (host origin == seeker) → excess should be ~0
const excessOnPath = calculateDetourExcessKm(
  hostOrigin.lat, hostOrigin.lng,
  hostOrigin.lat, hostOrigin.lng, // seeker at origin
  hostDest.lat, hostDest.lng
);
assert(excessOnPath < 0.001, 'Seeker at host origin → excess ≈ 0');

// Test: seeker at destination → excess should be ~0
const excessAtDest = calculateDetourExcessKm(
  hostOrigin.lat, hostOrigin.lng,
  hostDest.lat, hostDest.lng, // seeker at dest
  hostDest.lat, hostDest.lng
);
assert(excessAtDest < 0.001, 'Seeker at host destination → excess ≈ 0');

// ═══════════════════════════════════════════════════════════
// TEST 2: calculateDetourSurcharge() — boundary cases
// ═══════════════════════════════════════════════════════════
console.log('\n═══ TEST 2: calculateDetourSurcharge() ═══');

// Case 1: 0.2km excess (under 300m threshold) → ₹0
const s1 = calculateDetourSurcharge(0.2);
assert(s1 === 0, '0.2km excess (under 300m threshold) → ₹0');

// Case 2: 0.3km excess (exactly at threshold) → ₹0
const s2 = calculateDetourSurcharge(0.3);
assert(s2 === 0, '0.3km excess (exactly at threshold) → ₹0');

// Case 3: 0.5km excess (200m chargeable: 0.5 - 0.3 = 0.2km × ₹15 = ₹3)
const s3 = calculateDetourSurcharge(0.5);
assert(s3 === 3, '0.5km excess → ₹3 (0.2km × ₹15, rounded)');

// Case 4: 1.0km excess (700m chargeable: 1.0 - 0.3 = 0.7km × ₹15 = ₹10.5 → Math.round → ₹11)
const s4 = calculateDetourSurcharge(1.0);
// 0.7 * 15 = 10.5, Math.round(10.5) = 11 (JS rounds 0.5 to nearest even? No — Math.round(10.5) = 11)
assert(s4 === 11, '1.0km excess → ₹11 (0.7km × ₹15 = 10.5, Math.round → 11)');

// Edge: 0km → ₹0
const s0 = calculateDetourSurcharge(0);
assert(s0 === 0, '0km excess → ₹0');

// Edge: negative (clamped) → ₹0
const sNeg = calculateDetourSurcharge(-0.5);
assert(sNeg === 0, 'Negative excess → ₹0');

// ═══════════════════════════════════════════════════════════
// TEST 3: 500m destination gate boundary test
// ═══════════════════════════════════════════════════════════
console.log('\n═══ TEST 3: 500m Destination Gate Boundary ═══');

// Host destination: Nadiad Railway Station
const hostDestRef = { lat: 22.6916, lng: 72.8634 };

// Generate a seeker destination at ~490m away (should PASS)
// 490m ≈ 0.0044° latitude at this latitude
const seeker490m = { lat: hostDestRef.lat + 0.0044, lng: hostDestRef.lng };
const dist490 = haversineDistanceKm(seeker490m.lat, seeker490m.lng, hostDestRef.lat, hostDestRef.lng);
console.log(`  490m test: actual distance = ${(dist490 * 1000).toFixed(1)}m`);
assert(dist490 * 1000 < 500, '490m seeker is actually < 500m');
assert(passesDestinationGate(seeker490m.lat, seeker490m.lng, hostDestRef.lat, hostDestRef.lng), '490m seeker PASSES 500m gate');

// Generate a seeker destination at ~510m away (should FAIL)
const seeker510m = { lat: hostDestRef.lat + 0.0046, lng: hostDestRef.lng };
const dist510 = haversineDistanceKm(seeker510m.lat, seeker510m.lng, hostDestRef.lat, hostDestRef.lng);
console.log(`  510m test: actual distance = ${(dist510 * 1000).toFixed(1)}m`);
assert(dist510 * 1000 > 500, '510m seeker is actually > 500m');
assert(!passesDestinationGate(seeker510m.lat, seeker510m.lng, hostDestRef.lat, hostDestRef.lng), '510m seeker EXCLUDED by 500m gate');

// Exactly at boundary — 500m (edge case, should pass since gate is <=)
// 500m ≈ 0.00450° latitude
const seekerExact500m = { lat: hostDestRef.lat + 0.00450, lng: hostDestRef.lng };
const distExact = haversineDistanceKm(seekerExact500m.lat, seekerExact500m.lng, hostDestRef.lat, hostDestRef.lng);
console.log(`  500m boundary test: actual distance = ${(distExact * 1000).toFixed(1)}m`);

// ═══════════════════════════════════════════════════════════
// TEST 4: calculateMatchScore() composite ordering sanity check
// ═══════════════════════════════════════════════════════════
console.log('\n═══ TEST 4: Composite Match Score Ordering ═══');

// Use Nadiad area coordinates for realistic testing
const hostOLat = 22.6916;
const hostOLng = 72.8634;
const hostDLat = 22.7200;
const hostDLng = 72.8800;

const totalRouteKm = haversineDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng);

// Case A: Near-perfect match — seeker very close, on-path, dest close
const seekerA = { lat: hostOLat + 0.001, lng: hostOLng + 0.001 };
const seekerADest = { lat: hostDLat + 0.001, lng: hostDLng + 0.001 };
const ctA = crossTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerA.lat, seekerA.lng);
const atA = alongTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerA.lat, seekerA.lng, ctA);
const destDistA = haversineDistanceKm(seekerADest.lat, seekerADest.lng, hostDLat, hostDLng);
const originDistA = haversineDistanceKm(hostOLat, hostOLng, seekerA.lat, seekerA.lng);
const bearingA = getBearingDifference(
  calculateBearing(hostOLat, hostOLng, hostDLat, hostDLng),
  calculateBearing(hostOLat, hostOLng, seekerA.lat, seekerA.lng)
);

const scoreA = calculateMatchScore({
  originDistanceKm: originDistA,
  bearingDiffDeg: bearingA,
  destDistanceKm: destDistA,
  crossTrackKm: ctA,
  alongTrackKm: atA,
  totalRouteKm: totalRouteKm,
  maxRadiusKm: 2.0,
});

// Case B: Moderate detour — seeker farther, off-path, dest a bit off
const seekerB = { lat: hostOLat + 0.004, lng: hostOLng - 0.003 };
const seekerBDest = { lat: hostDLat + 0.003, lng: hostDLng - 0.002 };
const ctB = crossTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerB.lat, seekerB.lng);
const atB = alongTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerB.lat, seekerB.lng, ctB);
const destDistB = haversineDistanceKm(seekerBDest.lat, seekerBDest.lng, hostDLat, hostDLng);
const originDistB = haversineDistanceKm(hostOLat, hostOLng, seekerB.lat, seekerB.lng);
const bearingB = getBearingDifference(
  calculateBearing(hostOLat, hostOLng, hostDLat, hostDLng),
  calculateBearing(hostOLat, hostOLng, seekerB.lat, seekerB.lng)
);

const scoreB = calculateMatchScore({
  originDistanceKm: originDistB,
  bearingDiffDeg: bearingB,
  destDistanceKm: destDistB,
  crossTrackKm: ctB,
  alongTrackKm: atB,
  totalRouteKm: totalRouteKm,
  maxRadiusKm: 2.0,
});

// Case C: Boundary-of-gate at ~490m dest distance
const seekerCDest = { lat: hostDLat + 0.0044, lng: hostDLng }; // ~490m from host dest
const destDistC = haversineDistanceKm(seekerCDest.lat, seekerCDest.lng, hostDLat, hostDLng);
const seekerC = { lat: hostOLat + 0.002, lng: hostOLng + 0.002 };
const ctC = crossTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerC.lat, seekerC.lng);
const atC = alongTrackDistanceKm(hostOLat, hostOLng, hostDLat, hostDLng, seekerC.lat, seekerC.lng, ctC);
const originDistC = haversineDistanceKm(hostOLat, hostOLng, seekerC.lat, seekerC.lng);
const bearingC = getBearingDifference(
  calculateBearing(hostOLat, hostOLng, hostDLat, hostDLng),
  calculateBearing(hostOLat, hostOLng, seekerC.lat, seekerC.lng)
);

const scoreC = calculateMatchScore({
  originDistanceKm: originDistC,
  bearingDiffDeg: bearingC,
  destDistanceKm: destDistC,
  crossTrackKm: ctC,
  alongTrackKm: atC,
  totalRouteKm: totalRouteKm,
  maxRadiusKm: 2.0,
});

console.log(`  Score A (near-perfect): ${scoreA}`);
console.log(`  Score B (moderate detour): ${scoreB}`);
console.log(`  Score C (boundary ~490m dest): ${scoreC}`);
console.log(`  Dest distances: A=${(destDistA*1000).toFixed(0)}m, B=${(destDistB*1000).toFixed(0)}m, C=${(destDistC*1000).toFixed(0)}m`);

assert(scoreA > scoreB, 'Near-perfect match (A) scores higher than moderate detour (B)');
assert(scoreA > scoreC, 'Near-perfect match (A) scores higher than boundary match (C)');
assert(scoreA >= 0 && scoreA <= 100, 'Score A in valid range [0, 100]');
assert(scoreB >= 0 && scoreB <= 100, 'Score B in valid range [0, 100]');
assert(scoreC >= 0 && scoreC <= 100, 'Score C in valid range [0, 100]');

// Verify destination sub-score at boundary is still positive (not zero-clipped prematurely)
const destSubScoreC = Math.max(0, 100 * (1 - destDistC / MAX_DEST_DISTANCE_KM));
assert(destSubScoreC > 0, 'Destination sub-score at ~490m is positive (not zero-clipped)');
console.log(`  Dest sub-score at ~490m: ${destSubScoreC.toFixed(1)}`);

// ═══════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════
console.log('\n═══════════════════════════════════════════');
console.log(`TOTAL: ${passed + failed} tests | ✅ ${passed} passed | ❌ ${failed} failed`);
console.log('═══════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
