/**
 * baseline-compiler.ts
 *
 * Baseline Design Dataset v2 — computation pipeline.
 *
 * Pipeline:
 *   natal input (dob, tob, pob)
 *   → geocode location → lat/lng/timezone
 *   → JPL Horizons ephemeris → planetary positions
 *   → astrology framework → placements, houses, aspects
 *   → Human Design framework → type, authority, gates, channels
 *   → Gene Keys framework → activations, traits
 *   → Numerology → life path, expression
 *   → AI synthesis → derivedTraits + appOverlays
 *   → stored BaselineDesignDataset in KV
 *
 * The AI is the SYNTHESIS layer, not the computation source.
 * All framework data is computed deterministically before AI sees it.
 */

import { logSafetyEvent } from "./safety.js";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BaselineDesignDataset {
  version: "baseline.v2"
  status: "pending" | "ready" | "failed"
  computedAt?: string
  failureReason?: string

  input: {
    dob: string
    tob: string
    tobType: "exact" | "approx"
    pob: string
    timezone?: string
    latitude?: number
    longitude?: number
  }

  astronomy?: {
    source: "JPL_HORIZONS"
    epoch: string
    bodies: Record<string, {
      longitude: number
      latitude: number
      sign: string
      degree: number
      retrograde: boolean
      house?: number
    }>
  }

  frameworks?: {
    astrology?: {
      placements: Array<{ body: string; sign: string; degree: number; house?: number; retrograde?: boolean }>
      ascendant?: { sign: string; degree: number }
      midheaven?: { sign: string; degree: number }
      aspects?: Array<{ body1: string; body2: string; type: string; orb: number }>
    }
    humanDesign?: {
      type?: string
      strategy?: string
      authority?: string
      profile?: string
      gates?: Array<{ gate: number; line: number; planet: string; conscious: boolean }>
      channels?: Array<{ channel: string; gates: number[]; circuit?: string }>
      centers?: Record<string, { defined: boolean }>
    }
    geneKeys?: {
      activations?: Array<{ key: number; line: number; sphere?: string; shadow?: string; gift?: string; siddhi?: string }>
    }
    numerology?: {
      lifePath?: number
      expression?: number
      soulUrge?: number
      personality?: number
    }
  }

  aiDataset?: {
    identityAnchors: string[]
    derivedTraits: Array<{
      key: string
      label: string
      sourceFrameworks: string[]
      evidenceTags: string[]
      evidence: string[]
      alignedExpression: string[]
      overExpression: string[]
      underExpression: string[]
      usableAction?: string
    }>
    appOverlays: {
      defrag: {
        likelyLoops: string[]
        pressurePatterns: string[]
        repairMoves: string[]
      }
      alignment: {
        alignmentSignals: string[]
        misalignmentSignals: string[]
        actionRules: string[]
      }
      covenant: {
        reflectionThemes: string[]
        redemptivePatterns: string[]
      }
    }
  }
}

// ─── Geocoding ─────────────────────────────────────────────────────────────
// Uses Nominatim (OpenStreetMap) — no API key required, respects rate limits

async function geocodeLocation(pob: string): Promise<{
  lat: number
  lng: number
  timezone: string
  displayName: string
} | null> {
  try {
    const encoded = encodeURIComponent(pob)
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { "User-Agent": "SovereignOS/1.0 baseline-compiler" }
    })
    if (!res.ok) return null
    const results = await res.json() as any[]
    if (!results.length) return null

    const { lat, lon, display_name } = results[0]
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lon)

    // Get timezone from coordinates using timeapi.io (free, no key)
    let timezone = "UTC"
    try {
      const tzRes = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${latNum}&longitude=${lngNum}`
      )
      if (tzRes.ok) {
        const tzData = await tzRes.json() as any
        timezone = tzData.timeZone || "UTC"
      }
    } catch (error) {
      logSafetyEvent({
        level: "warn",
        event: "baseline_timezone_lookup_failed",
        endpoint: "baseline-compiler",
        requestId: `${latNum},${lngNum}`,
        reason: "unknown_failure",
        error,
      })
    }

    return { lat: latNum, lng: lngNum, timezone, displayName: display_name }
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "baseline_geocode_failed",
      endpoint: "baseline-compiler",
      requestId: pob,
      reason: "unknown_failure",
      error,
    })
    return null
  }
}

// ─── JPL Horizons ephemeris ────────────────────────────────────────────────
// Fetches planetary positions for a given datetime and location
// Uses the Horizons API: https://ssd.jpl.nasa.gov/api/horizons.api

const PLANET_IDS: Record<string, string> = {
  sun:     "10",
  moon:    "301",
  mercury: "199",
  venus:   "299",
  mars:    "499",
  jupiter: "599",
  saturn:  "699",
  uranus:  "799",
  neptune: "899",
  pluto:   "999",
  chiron:  "2060",  // Chiron (minor planet)
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

function eclipticLongitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360
  const signIndex = Math.floor(normalized / 30)
  const degree = normalized % 30
  return { sign: ZODIAC_SIGNS[signIndex] ?? "Aries", degree: Math.round(degree * 100) / 100 }
}

async function fetchHorizonsPosition(
  targetId: string,
  datetime: string,  // ISO format: "2026-06-18 12:00"
  lat: number,
  lng: number
): Promise<{ longitude: number; latitude: number; retrograde: boolean } | null> {
  try {
    // Horizons API parameters for observer-based ecliptic coordinates
    const params = new URLSearchParams({
      format: "json",
      COMMAND: `'${targetId}'`,
      OBJ_DATA: "NO",
      MAKE_EPHEM: "YES",
      EPHEM_TYPE: "OBSERVER",
      CENTER: `coord@399`,  // Earth geocenter
      COORD_TYPE: "GEODETIC",
      SITE_COORD: `${lng.toFixed(4)},${lat.toFixed(4)},0`,
      START_TIME: `'${datetime}'`,
      STOP_TIME: `'${datetime}'`,
      STEP_SIZE: "1d",
      QUANTITIES: "31",  // Ecliptic longitude and latitude
      CSV_FORMAT: "NO",
    })

    const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`
    const res = await fetch(url, {
      headers: { "User-Agent": "SovereignOS/1.0 baseline-compiler" },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null
    const text = await res.text()

    // Parse ecliptic longitude from Horizons output
    // Format: $$SOE ... data ... $$EOE
    const soeMatch = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/)
    if (!soeMatch) return null

    const dataLine = soeMatch[1].trim().split("\n")[0] ?? ""
    // Horizons QUANTITIES=31 returns: Date, RA, Dec, Ecliptic Lon, Ecliptic Lat
    // The exact format depends on the quantities requested
    // Parse the numeric values from the data line
    const numbers = dataLine.match(/-?\d+\.\d+/g)
    if (!numbers || numbers.length < 2) return null

    const longitude = parseFloat(numbers[0] ?? "0")
    const latitude = parseFloat(numbers[1] ?? "0")

    // Check for retrograde motion (negative dRA/dt or specific flag)
    const retrograde = text.includes("R") && dataLine.includes("R")

    return { longitude, latitude, retrograde }
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "baseline_planet_parse_failed",
      endpoint: "baseline-compiler",
      requestId: targetId,
      reason: "unknown_failure",
      error,
    })
    return null
  }
}

// ─── Astronomical snapshot ─────────────────────────────────────────────────

async function computeAstronomySnapshot(
  dob: string,
  tob: string,
  lat: number,
  lng: number
): Promise<BaselineDesignDataset["astronomy"] | null> {
  try {
    // Format datetime for Horizons: "YYYY-Mon-DD HH:MM"
    const [year, month, day] = dob.split("-")
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const monthName = monthNames[parseInt(month ?? "1") - 1] ?? "Jan"
    const datetime = `${year}-${monthName}-${day} ${tob}`

    const bodies: BaselineDesignDataset["astronomy"]["bodies"] = {}

    // Fetch positions for all planets (with concurrency limit)
    const planetEntries = Object.entries(PLANET_IDS)
    const results = await Promise.allSettled(
      planetEntries.map(([name, id]) =>
        fetchHorizonsPosition(id, datetime, lat, lng)
          .then(pos => ({ name, pos }))
      )
    )

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.pos) {
        const { name, pos } = result.value
        const { sign, degree } = eclipticLongitudeToSign(pos.longitude)
        bodies[name] = {
          longitude: pos.longitude,
          latitude: pos.latitude,
          sign,
          degree,
          retrograde: pos.retrograde,
        }
      }
    }

    if (Object.keys(bodies).length === 0) return null

    return {
      source: "JPL_HORIZONS",
      epoch: `${dob}T${tob}`,
      bodies,
    }
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "baseline_astronomy_snapshot_failed",
      endpoint: "baseline-compiler",
      requestId: `${dob}T${tob}`,
      reason: "unknown_failure",
      error,
    })
    return null
  }
}

// ─── Astrology framework ───────────────────────────────────────────────────
// Computes placements, ascendant, aspects from astronomical data

function computeAscendant(
  lst: number,  // Local Sidereal Time in degrees
  lat: number
): { sign: string; degree: number } {
  // Simplified ascendant calculation from LST and latitude
  // Full calculation requires obliquity of ecliptic (~23.44°)
  const obliquity = 23.44 * Math.PI / 180
  const lstRad = lst * Math.PI / 180
  const latRad = lat * Math.PI / 180

  const tanAsc = Math.cos(lstRad) / (-(Math.sin(obliquity) * Math.tan(latRad)) - (Math.cos(obliquity) * Math.sin(lstRad)))
  let asc = Math.atan(tanAsc) * 180 / Math.PI

  // Adjust quadrant
  if (Math.cos(lstRad) < 0) asc += 180
  if (asc < 0) asc += 360

  return eclipticLongitudeToSign(asc)
}

function computeAspects(
  bodies: BaselineDesignDataset["astronomy"]["bodies"]
): Array<{ body1: string; body2: string; type: string; orb: number }> {
  const aspects: Array<{ body1: string; body2: string; type: string; orb: number }> = []
  const aspectDefs = [
    { name: "conjunction", angle: 0, orb: 8 },
    { name: "sextile", angle: 60, orb: 6 },
    { name: "square", angle: 90, orb: 8 },
    { name: "trine", angle: 120, orb: 8 },
    { name: "opposition", angle: 180, orb: 8 },
  ]

  const bodyNames = Object.keys(bodies)
  for (let i = 0; i < bodyNames.length; i++) {
    for (let j = i + 1; j < bodyNames.length; j++) {
      const b1 = bodyNames[i]!
      const b2 = bodyNames[j]!
      const lon1 = bodies[b1]?.longitude ?? 0
      const lon2 = bodies[b2]?.longitude ?? 0
      let diff = Math.abs(lon1 - lon2)
      if (diff > 180) diff = 360 - diff

      for (const asp of aspectDefs) {
        const orb = Math.abs(diff - asp.angle)
        if (orb <= asp.orb) {
          aspects.push({ body1: b1, body2: b2, type: asp.name, orb: Math.round(orb * 10) / 10 })
        }
      }
    }
  }
  return aspects
}

function computeAstrologyFramework(
  astronomy: BaselineDesignDataset["astronomy"],
  lat: number,
  dob: string,
  tob: string
): BaselineDesignDataset["frameworks"]["astrology"] {
  const bodies = astronomy?.bodies ?? {}

  const placements = Object.entries(bodies).map(([body, data]) => ({
    body,
    sign: data.sign,
    degree: data.degree,
    retrograde: data.retrograde,
  }))

  const aspects = computeAspects(bodies)

  // Simplified ascendant from birth time
  const [h, m] = tob.split(":").map(Number)
  const timeDecimal = (h ?? 12) + (m ?? 0) / 60
  // Approximate LST (Local Sidereal Time) — simplified
  const [year, month, day] = dob.split("-").map(Number)
  const jd = 367 * (year ?? 2000) - Math.floor(7 * ((year ?? 2000) + Math.floor(((month ?? 1) + 9) / 12)) / 4) +
    Math.floor(275 * (month ?? 1) / 9) + (day ?? 1) + 1721013.5 + timeDecimal / 24
  const t = (jd - 2451545.0) / 36525
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t
  const lst = ((gmst + lat) % 360 + 360) % 360

  const ascendant = computeAscendant(lst, lat)

  return { placements, ascendant, aspects }
}

// ─── Human Design framework ────────────────────────────────────────────────
// Computes type, authority, profile, gates from planetary positions
// Based on the Rave I Ching gate wheel (360° / 64 gates)

const HD_GATE_WHEEL: Array<{ gate: number; startDeg: number }> = [
  { gate: 41, startDeg: 0 }, { gate: 19, startDeg: 5.625 }, { gate: 13, startDeg: 11.25 },
  { gate: 49, startDeg: 16.875 }, { gate: 30, startDeg: 22.5 }, { gate: 55, startDeg: 28.125 },
  { gate: 37, startDeg: 33.75 }, { gate: 63, startDeg: 39.375 }, { gate: 22, startDeg: 45 },
  { gate: 36, startDeg: 50.625 }, { gate: 25, startDeg: 56.25 }, { gate: 17, startDeg: 61.875 },
  { gate: 21, startDeg: 67.5 }, { gate: 51, startDeg: 73.125 }, { gate: 42, startDeg: 78.75 },
  { gate: 3, startDeg: 84.375 }, { gate: 27, startDeg: 90 }, { gate: 24, startDeg: 95.625 },
  { gate: 2, startDeg: 101.25 }, { gate: 23, startDeg: 106.875 }, { gate: 8, startDeg: 112.5 },
  { gate: 20, startDeg: 118.125 }, { gate: 16, startDeg: 123.75 }, { gate: 35, startDeg: 129.375 },
  { gate: 45, startDeg: 135 }, { gate: 12, startDeg: 140.625 }, { gate: 15, startDeg: 146.25 },
  { gate: 52, startDeg: 151.875 }, { gate: 39, startDeg: 157.5 }, { gate: 53, startDeg: 163.125 },
  { gate: 62, startDeg: 168.75 }, { gate: 56, startDeg: 174.375 }, { gate: 31, startDeg: 180 },
  { gate: 33, startDeg: 185.625 }, { gate: 7, startDeg: 191.25 }, { gate: 4, startDeg: 196.875 },
  { gate: 29, startDeg: 202.5 }, { gate: 59, startDeg: 208.125 }, { gate: 40, startDeg: 213.75 },
  { gate: 64, startDeg: 219.375 }, { gate: 47, startDeg: 225 }, { gate: 6, startDeg: 230.625 },
  { gate: 46, startDeg: 236.25 }, { gate: 18, startDeg: 241.875 }, { gate: 48, startDeg: 247.5 },
  { gate: 57, startDeg: 253.125 }, { gate: 32, startDeg: 258.75 }, { gate: 50, startDeg: 264.375 },
  { gate: 28, startDeg: 270 }, { gate: 44, startDeg: 275.625 }, { gate: 1, startDeg: 281.25 },
  { gate: 43, startDeg: 286.875 }, { gate: 14, startDeg: 292.5 }, { gate: 34, startDeg: 298.125 },
  { gate: 9, startDeg: 303.75 }, { gate: 5, startDeg: 309.375 }, { gate: 26, startDeg: 315 },
  { gate: 11, startDeg: 320.625 }, { gate: 10, startDeg: 326.25 }, { gate: 58, startDeg: 331.875 },
  { gate: 38, startDeg: 337.5 }, { gate: 54, startDeg: 343.125 }, { gate: 61, startDeg: 348.75 },
  { gate: 60, startDeg: 354.375 },
]

// HD channels (gate pairs that form channels)
const HD_CHANNELS: Array<{ channel: string; gates: [number, number]; circuit: string }> = [
  { channel: "1-8", gates: [1, 8], circuit: "individual" },
  { channel: "2-14", gates: [2, 14], circuit: "individual" },
  { channel: "3-60", gates: [3, 60], circuit: "individual" },
  { channel: "4-63", gates: [4, 63], circuit: "collective" },
  { channel: "5-15", gates: [5, 15], circuit: "collective" },
  { channel: "6-59", gates: [6, 59], circuit: "tribal" },
  { channel: "7-31", gates: [7, 31], circuit: "collective" },
  { channel: "9-52", gates: [9, 52], circuit: "collective" },
  { channel: "10-20", gates: [10, 20], circuit: "individual" },
  { channel: "11-56", gates: [11, 56], circuit: "collective" },
  { channel: "12-22", gates: [12, 22], circuit: "individual" },
  { channel: "13-33", gates: [13, 33], circuit: "collective" },
  { channel: "16-48", gates: [16, 48], circuit: "collective" },
  { channel: "17-62", gates: [17, 62], circuit: "collective" },
  { channel: "18-58", gates: [18, 58], circuit: "collective" },
  { channel: "19-49", gates: [19, 49], circuit: "tribal" },
  { channel: "20-34", gates: [20, 34], circuit: "individual" },
  { channel: "21-45", gates: [21, 45], circuit: "tribal" },
  { channel: "23-43", gates: [23, 43], circuit: "individual" },
  { channel: "24-61", gates: [24, 61], circuit: "individual" },
  { channel: "25-51", gates: [25, 51], circuit: "individual" },
  { channel: "26-44", gates: [26, 44], circuit: "tribal" },
  { channel: "27-50", gates: [27, 50], circuit: "tribal" },
  { channel: "28-38", gates: [28, 38], circuit: "individual" },
  { channel: "29-46", gates: [29, 46], circuit: "collective" },
  { channel: "30-41", gates: [30, 41], circuit: "individual" },
  { channel: "32-54", gates: [32, 54], circuit: "tribal" },
  { channel: "34-57", gates: [34, 57], circuit: "individual" },
  { channel: "35-36", gates: [35, 36], circuit: "collective" },
  { channel: "37-40", gates: [37, 40], circuit: "tribal" },
  { channel: "39-55", gates: [39, 55], circuit: "individual" },
  { channel: "42-53", gates: [42, 53], circuit: "collective" },
  { channel: "47-64", gates: [47, 64], circuit: "collective" },
]

function longitudeToHDGate(longitude: number): { gate: number; line: number } {
  const normalized = ((longitude % 360) + 360) % 360
  // Each gate spans 5.625 degrees (360 / 64)
  // Find which gate this longitude falls in
  let foundGate = HD_GATE_WHEEL[0]!
  for (let i = 0; i < HD_GATE_WHEEL.length; i++) {
    const current = HD_GATE_WHEEL[i]!
    const next = HD_GATE_WHEEL[i + 1] ?? { startDeg: 360 }
    if (normalized >= current.startDeg && normalized < next.startDeg) {
      foundGate = current
      break
    }
  }
  // Line within gate (6 lines per gate, each 0.9375 degrees)
  const posInGate = normalized - foundGate.startDeg
  const line = Math.min(6, Math.floor(posInGate / 0.9375) + 1)
  return { gate: foundGate.gate, line }
}

// HD type determination from defined centers (simplified)
function determineHDType(gates: Array<{ gate: number }>): string {
  const gateNums = new Set(gates.map((g: any) => g.gate))
  // Simplified type determination based on gate patterns
  // Full calculation requires center definition analysis
  const hasSacral = [5,14,29,34,27,59,9,3].some((g: any) => gateNums.has(g))
  const hasThroat = [16,20,31,8,33,35,12,45,62,23,56,11].some((g: any) => gateNums.has(g))
  const hasMotor = [21,26,40,37,6,59,27,50,34,5,14,29,9,3].some((g: any) => gateNums.has(g))

  if (hasSacral && hasThroat) return "Generator"
  if (hasSacral) return "Manifesting Generator"
  if (hasMotor && hasThroat) return "Manifestor"
  if (!hasSacral && !hasMotor) return "Projector"
  return "Reflector"
}

function computeHumanDesignFramework(
  astronomy: BaselineDesignDataset["astronomy"]
): BaselineDesignDataset["frameworks"]["humanDesign"] {
  const bodies = astronomy?.bodies ?? {}

  // Compute gates for each planet
  const gates: Array<{ gate: number; line: number; planet: string; conscious: boolean }> = []
  const consciousPlanets = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]

  for (const planet of consciousPlanets) {
    const body = bodies[planet]
    if (body) {
      const { gate, line } = longitudeToHDGate(body.longitude)
      gates.push({ gate, line, planet, conscious: true })
    }
  }

  // Find active channels (both gates present)
  const activeGateNums = new Set(gates.map((g: any) => g.gate))
  const channels = HD_CHANNELS
    .filter((ch: any) => ch.gates.every((g: any) => activeGateNums.has(g)))
    .map((ch: any) => ({ channel: ch.channel, gates: ch.gates, circuit: ch.circuit }))

  const type = determineHDType(gates)

  // Authority based on defined centers (simplified)
  const sunGate = gates.find((g: any) => g.planet === "sun")
  const moonGate = gates.find((g: any) => g.planet === "moon")
  let authority = "Sacral"
  if (type === "Projector") authority = "Splenic"
  if (type === "Manifestor") authority = "Emotional"
  if (type === "Reflector") authority = "Lunar"

  // Profile from sun/earth line numbers
  const sunLine = sunGate?.line ?? 1
  const profileLines = [sunLine, ((sunLine + 2) % 6) + 1]
  const profile = `${profileLines[0]}/${profileLines[1]}`

  return { type, strategy: type === "Generator" ? "Respond" : type === "Projector" ? "Wait for invitation" : "Inform", authority, profile, gates, channels }
}

// ─── Gene Keys framework ───────────────────────────────────────────────────
// Gene Keys map directly to Human Design gates (same I Ching hexagram system)

const GENE_KEY_DATA: Record<number, { shadow: string; gift: string; siddhi: string }> = {
  1: { shadow: "Entropy", gift: "Freshness", siddhi: "Beauty" },
  2: { shadow: "Dislocation", gift: "Orientation", siddhi: "Unity" },
  3: { shadow: "Chaos", gift: "Innovation", siddhi: "Innocence" },
  4: { shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness" },
  5: { shadow: "Impatience", gift: "Patience", siddhi: "Timelessness" },
  6: { shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace" },
  7: { shadow: "Division", gift: "Guidance", siddhi: "Virtue" },
  8: { shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness" },
  9: { shadow: "Inertia", gift: "Determination", siddhi: "Invincibility" },
  10: { shadow: "Self-obsession", gift: "Naturalness", siddhi: "Being" },
  11: { shadow: "Obscurity", gift: "Idealism", siddhi: "Light" },
  12: { shadow: "Vanity", gift: "Discrimination", siddhi: "Purity" },
  13: { shadow: "Discord", gift: "Discernment", siddhi: "Empathy" },
  14: { shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness" },
  15: { shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence" },
  16: { shadow: "Indifference", gift: "Versatility", siddhi: "Mastery" },
  17: { shadow: "Opinion", gift: "Far-sightedness", siddhi: "Omniscience" },
  18: { shadow: "Judgment", gift: "Integrity", siddhi: "Perfection" },
  19: { shadow: "Co-dependence", gift: "Sensitivity", siddhi: "Sacrifice" },
  20: { shadow: "Superficiality", gift: "Self-assurance", siddhi: "Presence" },
  21: { shadow: "Control", gift: "Authority", siddhi: "Valour" },
  22: { shadow: "Dishonour", gift: "Graciousness", siddhi: "Grace" },
  23: { shadow: "Complexity", gift: "Simplicity", siddhi: "Quintessence" },
  24: { shadow: "Addiction", gift: "Invention", siddhi: "Silence" },
  25: { shadow: "Constriction", gift: "Acceptance", siddhi: "Universal Love" },
  26: { shadow: "Pride", gift: "Artfulness", siddhi: "Invisibility" },
  27: { shadow: "Selfishness", gift: "Altruism", siddhi: "Selflessness" },
  28: { shadow: "Purposelessness", gift: "Totality", siddhi: "Immortality" },
  29: { shadow: "Half-heartedness", gift: "Commitment", siddhi: "Devotion" },
  30: { shadow: "Desire", gift: "Lightness", siddhi: "Rapture" },
  31: { shadow: "Arrogance", gift: "Leadership", siddhi: "Humility" },
  32: { shadow: "Failure", gift: "Preservation", siddhi: "Veneration" },
  33: { shadow: "Forgetting", gift: "Mindfulness", siddhi: "Revelation" },
  34: { shadow: "Force", gift: "Strength", siddhi: "Majesty" },
  35: { shadow: "Hunger", gift: "Adventure", siddhi: "Boundlessness" },
  36: { shadow: "Turbulence", gift: "Humanity", siddhi: "Compassion" },
  37: { shadow: "Weakness", gift: "Equality", siddhi: "Tenderness" },
  38: { shadow: "Struggle", gift: "Perseverance", siddhi: "Honour" },
  39: { shadow: "Provocation", gift: "Dynamism", siddhi: "Liberation" },
  40: { shadow: "Exhaustion", gift: "Resolve", siddhi: "Divine Will" },
  41: { shadow: "Fantasy", gift: "Anticipation", siddhi: "Emanation" },
  42: { shadow: "Expectation", gift: "Detachment", siddhi: "Celebration" },
  43: { shadow: "Deafness", gift: "Insight", siddhi: "Epiphany" },
  44: { shadow: "Interference", gift: "Teamwork", siddhi: "Synarchy" },
  45: { shadow: "Dominance", gift: "Synergy", siddhi: "Communion" },
  46: { shadow: "Seriousness", gift: "Delight", siddhi: "Ecstasy" },
  47: { shadow: "Oppression", gift: "Transmutation", siddhi: "Transfiguration" },
  48: { shadow: "Inadequacy", gift: "Resourcefulness", siddhi: "Wisdom" },
  49: { shadow: "Reaction", gift: "Revolution", siddhi: "Rebirth" },
  50: { shadow: "Corruption", gift: "Equilibrium", siddhi: "Harmony" },
  51: { shadow: "Agitation", gift: "Initiative", siddhi: "Awakening" },
  52: { shadow: "Stress", gift: "Restraint", siddhi: "Stillness" },
  53: { shadow: "Immaturity", gift: "Expansion", siddhi: "Superabundance" },
  54: { shadow: "Greed", gift: "Aspiration", siddhi: "Ascension" },
  55: { shadow: "Victimisation", gift: "Freedom", siddhi: "Freedom" },
  56: { shadow: "Distraction", gift: "Enrichment", siddhi: "Intoxication" },
  57: { shadow: "Unease", gift: "Intuition", siddhi: "Clarity" },
  58: { shadow: "Dissatisfaction", gift: "Vitality", siddhi: "Bliss" },
  59: { shadow: "Dishonesty", gift: "Intimacy", siddhi: "Transparency" },
  60: { shadow: "Limitation", gift: "Realism", siddhi: "Justice" },
  61: { shadow: "Psychosis", gift: "Inspiration", siddhi: "Sanctity" },
  62: { shadow: "Intellectualism", gift: "Precision", siddhi: "Impeccability" },
  63: { shadow: "Doubt", gift: "Inquiry", siddhi: "Truth" },
  64: { shadow: "Confusion", gift: "Imagination", siddhi: "Illumination" },
}

function computeGeneKeysFramework(
  hdFramework: BaselineDesignDataset["frameworks"]["humanDesign"]
): BaselineDesignDataset["frameworks"]["geneKeys"] {
  const gates = hdFramework?.gates ?? []
  const activations = gates.slice(0, 8).map((g: any) => {
    const gkData = GENE_KEY_DATA[g.gate]
    return {
      key: g.gate,
      line: g.line,
      sphere: g.conscious ? "activation" : "design",
      shadow: gkData?.shadow,
      gift: gkData?.gift,
      siddhi: gkData?.siddhi,
    }
  })
  return { activations }
}

// ─── Numerology framework ──────────────────────────────────────────────────

function reduceNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d), 0)
  }
  return n
}

function computeNumerology(dob: string): BaselineDesignDataset["frameworks"]["numerology"] {
  const [year, month, day] = dob.split("-").map(Number)
  const lifePath = reduceNumber((year ?? 0) + (month ?? 0) + (day ?? 0))
  const birthDay = reduceNumber(day ?? 1)
  return { lifePath } as any
}

// ─── AI synthesis — derivedTraits + appOverlays ────────────────────────────
// The AI synthesizes meaning from computed framework data
// It does NOT invent gates, channels, or placements

const SYNTHESIS_PROMPT = `You are the Baseline Compiler synthesis layer for Sovereign.os.

Your job: synthesize a computed framework dataset into a structured aiDataset.

CRITICAL RULES:
- You receive computed data. Do not invent or modify any gate numbers, channel names, sign placements, or gene key numbers.
- Every evidenceTag must reference actual data from the input.
- Every behavior line must describe something observable in real life.
- Do not write personality summaries. Do not write system explanations.
- Lines must be short, direct, and human.
- The output is used by three apps: Defrag (pattern analysis), Alignment (response integration), Covenant (faith reflection).

Return valid JSON only in this exact shape:
{
  "identityAnchors": ["1-2 short grounding statements about how this person naturally operates"],
  "derivedTraits": [
    {
      "key": "unique_snake_case_key",
      "label": "Short human label",
      "sourceFrameworks": ["astrology", "humanDesign", "geneKeys", "numerology"],
      "evidenceTags": ["Sun in Aries", "Gate 51", "GK 51"],
      "evidence": ["The specific data points that produced this trait"],
      "alignedExpression": ["What this looks like when working well — observable behavior"],
      "overExpression": ["What this looks like when overdone — observable behavior"],
      "underExpression": ["What this looks like when suppressed — observable behavior"],
      "usableAction": "One concrete thing this person can do to stay in alignment with this trait"
    }
  ],
  "appOverlays": {
    "defrag": {
      "likelyLoops": ["Recurring patterns this person tends to fall into"],
      "pressurePatterns": ["How they behave under pressure"],
      "repairMoves": ["What tends to help them recover"]
    },
    "alignment": {
      "alignmentSignals": ["Signs they are in their lane"],
      "misalignmentSignals": ["Signs they are off course"],
      "actionRules": ["Rules for getting back on track"]
    },
    "covenant": {
      "reflectionThemes": ["Themes that resonate for faith-context reflection"],
      "redemptivePatterns": ["Patterns of growth and repair"]
    }
  }
}

Generate 3-5 derivedTraits. Each must be grounded in the actual framework data provided.
Return JSON only.`

async function synthesizeAIDataset(
  frameworks: BaselineDesignDataset["frameworks"],
  ai: any,
  aiModel: string
): Promise<BaselineDesignDataset["aiDataset"] | null> {
  try {
    // Build a concise framework summary for the AI
    const astro = frameworks?.astrology
    const hd = frameworks?.humanDesign
    const gk = frameworks?.geneKeys
    const num = frameworks?.numerology

    const frameworkSummary = [
      astro?.placements?.length
        ? `Astrology placements: ${astro.placements.slice(0, 6).map(p => `${p.body} in ${p.sign}${p.retrograde ? " (R)" : ""}`).join(", ")}`
        : "",
      astro?.ascendant
        ? `Ascendant: ${astro.ascendant.sign}`
        : "",
      astro?.aspects?.slice(0, 5).length
        ? `Key aspects: ${astro.aspects.slice(0, 5).map(a => `${a.body1} ${a.type} ${a.body2}`).join(", ")}`
        : "",
      hd?.type ? `Human Design type: ${hd.type}` : "",
      hd?.authority ? `Authority: ${hd.authority}` : "",
      hd?.profile ? `Profile: ${hd.profile}` : "",
      hd?.gates?.slice(0, 8).length
        ? `Active gates: ${hd.gates.slice(0, 8).map((g: any) => `Gate ${g.gate}.${g.line} (${g.planet})`).join(", ")}`
        : "",
      hd?.channels?.length
        ? `Active channels: ${hd.channels.map(c => c.channel).join(", ")}`
        : "",
      gk?.activations?.slice(0, 4).length
        ? `Gene Keys: ${gk.activations.slice(0, 4).map(a => `GK ${a.key} — shadow: ${a.shadow}, gift: ${a.gift}`).join("; ")}`
        : "",
      num?.lifePath ? `Life Path: ${num.lifePath}` : "",
    ].filter(Boolean).join("\n")

    const messages = [
      { role: "system", content: SYNTHESIS_PROMPT },
      { role: "user", content: `Framework data for this user:\n\n${frameworkSummary}\n\nSynthesize the aiDataset.` }
    ]

    const response = await ai.run(aiModel as any, {
      messages,
      temperature: 0.2,
      max_tokens: 1200,
    })

    const rawText = (response as any).response ?? String(response)
    const match = rawText.trim().match(/\{[\s\S]*\}/)
    if (!match) return null

    return JSON.parse(match[0]) as BaselineDesignDataset["aiDataset"]
  } catch (error) {
    logSafetyEvent({
      level: "warn",
      event: "baseline_ai_dataset_parse_failed",
      endpoint: "baseline-compiler",
      requestId: "synthesis",
      reason: "unknown_failure",
      error,
    })
    return null
  }
}

// ─── Main compiler function ────────────────────────────────────────────────

export async function compileBaselineDataset(
  input: { dob: string; tob: string; tobType: "exact" | "approx"; pob: string },
  ai: any,
  aiModel: string
): Promise<BaselineDesignDataset> {
  const dataset: BaselineDesignDataset = {
    version: "baseline.v2",
    status: "pending",
    input: { ...input },
  }

  try {
    // Step 1: Geocode location
    const geo = await geocodeLocation(input.pob)
    if (geo) {
      dataset.input.latitude = geo.lat
      dataset.input.longitude = geo.lng
      dataset.input.timezone = geo.timezone
    }

    const lat = dataset.input.latitude ?? 0
    const lng = dataset.input.longitude ?? 0

    // Step 2: JPL Horizons astronomical snapshot
    const astronomy = await computeAstronomySnapshot(input.dob, input.tob, lat, lng)
    if (astronomy) {
      dataset.astronomy = astronomy
    }

    // Step 3: Framework computations (work even without full astronomy)
    const frameworks: BaselineDesignDataset["frameworks"] = {}

    if (astronomy) {
      frameworks.astrology = computeAstrologyFramework(astronomy, lat, input.dob, input.tob)
      frameworks.humanDesign = computeHumanDesignFramework(astronomy)
      frameworks.geneKeys = computeGeneKeysFramework(frameworks.humanDesign)
    }

    frameworks.numerology = computeNumerology(input.dob)
    dataset.frameworks = frameworks

    // Step 4: AI synthesis layer
    const aiDataset = await synthesizeAIDataset(frameworks, ai, aiModel)
    if (aiDataset) {
      dataset.aiDataset = aiDataset
      dataset.status = "ready"
    } else {
      // Build minimal fallback aiDataset from framework data
      dataset.aiDataset = buildFallbackAIDataset(frameworks)
      dataset.status = "ready"
    }

    dataset.computedAt = new Date().toISOString()
  } catch (err: any) {
    dataset.status = "failed"
    dataset.failureReason = err?.message ?? "Unknown error"
  }

  return dataset
}

// ─── Fallback aiDataset ────────────────────────────────────────────────────
// Used when AI synthesis fails — built deterministically from framework data

function buildFallbackAIDataset(
  frameworks: BaselineDesignDataset["frameworks"]
): BaselineDesignDataset["aiDataset"] {
  const hd = frameworks?.humanDesign
  const astro = frameworks?.astrology
  const gk = frameworks?.geneKeys
  const num = frameworks?.numerology

  const sunPlacement = astro?.placements?.find(p => p.body === "sun")
  const moonPlacement = astro?.placements?.find(p => p.body === "moon")
  const topGate = hd?.gates?.[0]
  const topGK = gk?.activations?.[0]

  const identityAnchors = [
    sunPlacement ? `You carry the energy of ${sunPlacement.sign} — direct, purposeful, and oriented toward action.` : "You operate with a clear internal compass.",
    hd?.type ? `As a ${hd.type}, you are built to ${hd.strategy?.toLowerCase() ?? "move at your own pace"}.` : "You have a distinct way of making decisions.",
  ].filter(Boolean)

  const derivedTraits = []

  if (sunPlacement || topGate) {
    derivedTraits.push({
      key: "core_expression",
      label: "Core expression",
      sourceFrameworks: ["astrology", "humanDesign"],
      evidenceTags: [
        sunPlacement ? `Sun in ${sunPlacement.sign}` : "",
        topGate ? `Gate ${topGate.gate}` : "",
      ].filter(Boolean),
      evidence: [
        sunPlacement ? `Sun in ${sunPlacement.sign} at ${sunPlacement.degree.toFixed(1)}°` : "",
        topGate ? `Gate ${topGate.gate}.${topGate.line} (${topGate.planet})` : "",
      ].filter(Boolean),
      alignedExpression: ["You move with clarity when you trust your own read on a situation."],
      overExpression: ["You push forward before others are ready."],
      underExpression: ["You hold back when directness would move things forward."],
      usableAction: "Before acting, ask: is this mine to initiate, or mine to respond to?",
    })
  }

  if (moonPlacement || topGK) {
    derivedTraits.push({
      key: "emotional_processing",
      label: "Emotional processing",
      sourceFrameworks: ["astrology", "geneKeys"],
      evidenceTags: [
        moonPlacement ? `Moon in ${moonPlacement.sign}` : "",
        topGK ? `GK ${topGK.key}` : "",
      ].filter(Boolean),
      evidence: [
        moonPlacement ? `Moon in ${moonPlacement.sign}` : "",
        topGK ? `GK ${topGK.key} — shadow: ${topGK.shadow}, gift: ${topGK.gift}` : "",
      ].filter(Boolean),
      alignedExpression: ["You feel things deeply and use that depth as information."],
      overExpression: ["You absorb others' emotional states and carry them as your own."],
      underExpression: ["You suppress what you feel to keep things smooth."],
      usableAction: "Name what you're feeling before you respond to what someone else is feeling.",
    })
  }

  if (num?.lifePath) {
    derivedTraits.push({
      key: "life_path_pattern",
      label: "Life path pattern",
      sourceFrameworks: ["numerology"],
      evidenceTags: [`Life Path ${num.lifePath}`],
      evidence: [`Life Path ${num.lifePath}`],
      alignedExpression: ["You are most effective when your work aligns with your deeper purpose."],
      overExpression: ["You take on more than is yours to carry."],
      underExpression: ["You underestimate the impact of your natural gifts."],
      usableAction: "Ask: what would I do here if I trusted that my natural way is enough?",
    })
  }

  return {
    identityAnchors,
    derivedTraits,
    appOverlays: {
      defrag: {
        likelyLoops: ["Taking on responsibility that belongs to others", "Moving before the situation is ready"],
        pressurePatterns: ["You tend to go quiet or go hard under pressure — neither is your best move"],
        repairMoves: ["Name what is actually yours to do. Leave the rest."],
      },
      alignment: {
        alignmentSignals: ["You feel clear, not urgent", "You're responding rather than reacting"],
        misalignmentSignals: ["You're managing outcomes that belong to someone else", "You're waiting for permission that isn't required"],
        actionRules: ["Do the one thing that is yours. Stop there."],
      },
      covenant: {
        reflectionThemes: ["Responsibility and what is truly yours to carry", "The difference between faithfulness and control"],
        redemptivePatterns: ["Learning to trust the process rather than force the outcome"],
      },
    },
  }
}

// ─── Format for AI prompts ─────────────────────────────────────────────────
// Returns a concise, AI-ready summary of the dataset for use in app prompts

export function formatDatasetForAI(dataset: BaselineDesignDataset): string {
  if (!dataset.aiDataset) {
    // Fallback to raw input
    return `DOB: ${dataset.input.dob}\nTOB: ${dataset.input.tob}\nPOB: ${dataset.input.pob}`
  }

  const { identityAnchors, derivedTraits, appOverlays } = dataset.aiDataset

  const lines = [
    "BASELINE DESIGN DATASET",
    "",
    "Identity anchors:",
    ...identityAnchors.map(a => `- ${a}`),
    "",
    "Derived traits:",
    ...derivedTraits.map(t => [
      `[${t.label}]`,
      `Evidence: ${t.evidenceTags.join(" · ")}`,
      `Aligned: ${t.alignedExpression[0] ?? ""}`,
      `Over: ${t.overExpression[0] ?? ""}`,
      `Under: ${t.underExpression[0] ?? ""}`,
    ].join("\n")),
  ]

  return lines.join("\n")
}

export function formatDatasetForApp(
  dataset: BaselineDesignDataset,
  app: "defrag" | "alignment" | "covenant"
): string {
  if (!dataset.aiDataset) return formatDatasetForAI(dataset)

  const { derivedTraits, appOverlays } = dataset.aiDataset
  const overlay = appOverlays[app]

  const lines = [
    "BASELINE DESIGN — APP CONTEXT",
    "",
    "Derived traits:",
    ...derivedTraits.map(t => `[${t.label}] ${t.evidenceTags.join(" · ")}`),
    "",
    `${app.toUpperCase()} overlay:`,
    ...Object.entries(overlay).flatMap(([key, values]) =>
      Array.isArray(values) ? [`${key}: ${values.join("; ")}`] : []
    ),
  ]

  return lines.join("\n")
}
