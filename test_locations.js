const fs = require('fs');

const STORE_LAT = 16.8352;
const STORE_LNG = 74.3151;
const MAX_DELIVERY_KM = 10;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const addresses = [
  "Shivaji Chowk, Peth Vadgaon", // Inside (close)
  "Bhairavnath Mandir, Peth Vadgaon", // Inside
  "Padmavati Super Bazar, Pethvadgaon", // Exact match
  "Wathar, Maharashtra", // Should be near 10km
  "Ashta, Maharashtra", // Should be outside (18-20km)
  "Kolhapur City, Maharashtra", // Outside (20+ km)
  "Mumbai, Maharashtra", // Way outside
  "Pune, Maharashtra", // Way outside
  "Kini, Maharashtra", // Borderline (~6-9 km)
  "Fake Unknown Place Xyzxyz" // Geocoding will fail completely
];

async function runTests() {
  let logOutput = "Starting Address Geocoding Tests (10 Demo Locations)...\n\n";

  for (let i = 0; i < addresses.length; i++) {
    const rawAddress = addresses[i];
    let query = encodeURIComponent(`${rawAddress}, Maharashtra, India`);
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'RamBazarLocalApp/1.0' }
      });
      const data = await response.json();

      let result = '';
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const dist = haversineDistance(lat, lon, STORE_LAT, STORE_LNG);
        const status = dist <= MAX_DELIVERY_KM ? "✅ ACCEPTED" : "❌ TOO FAR";
        result = `${status} (${dist.toFixed(1)} km)  - Located Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      } else {
        result = `⚠️ GEOCODING_FAILED (In App, this triggers GPS fallback)`;
      }

      logOutput += `[Test ${i + 1}] Address: "${rawAddress}"\n   Result: ${result}\n\n`;
    } catch (err) {
      logOutput += `[Test ${i + 1}] Address: "${rawAddress}"\n   Result: ERROR (${err.message})\n\n`;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  fs.writeFileSync('test_results.log', logOutput, 'utf8');
}

runTests();
