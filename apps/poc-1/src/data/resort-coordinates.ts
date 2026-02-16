// Static coordinate mapping for resorts.
// Inputs: none (static data)
// Outputs: lat/lon lookup by resort slug
// Side effects: none
// Error behavior: returns undefined for unknown slugs
//
// The API backend has coordinates in its data model but the client types
// don't expose them. This static map bridges the gap for the map view.

export interface ResortCoordinate {
  lat: number;
  lon: number;
}

export const RESORT_COORDINATES: Record<string, ResortCoordinate> = {
  // Colorado — I-70 Corridor
  "vail": { lat: 39.6403, lon: -106.3742 },
  "beaver-creek": { lat: 39.6042, lon: -106.5165 },
  "breckenridge": { lat: 39.4817, lon: -106.0384 },
  "keystone": { lat: 39.6069, lon: -105.9497 },
  "copper-mountain": { lat: 39.5022, lon: -106.1497 },
  "arapahoe-basin": { lat: 39.6426, lon: -105.8718 },
  "loveland": { lat: 39.6800, lon: -105.8978 },
  "winter-park": { lat: 39.8868, lon: -105.7625 },
  "eldora": { lat: 39.9372, lon: -105.5828 },
  // Colorado — Other
  "steamboat": { lat: 40.4572, lon: -106.8045 },
  "aspen-snowmass": { lat: 39.2084, lon: -106.9490 },
  "aspen-mountain": { lat: 39.1869, lon: -106.8187 },
  "aspen-highlands": { lat: 39.1781, lon: -106.8558 },
  "buttermilk": { lat: 39.1690, lon: -106.8684 },
  "telluride": { lat: 37.9375, lon: -107.8123 },
  "crested-butte": { lat: 38.8990, lon: -106.9650 },
  "purgatory": { lat: 37.6301, lon: -107.8135 },
  "monarch": { lat: 38.5124, lon: -106.3323 },
  "wolf-creek": { lat: 37.4731, lon: -106.7934 },
  "powderhorn": { lat: 39.0690, lon: -108.1508 },

  // Utah — Cottonwoods/Wasatch
  "snowbird": { lat: 40.5830, lon: -111.6509 },
  "alta": { lat: 40.5884, lon: -111.6386 },
  "brighton": { lat: 40.5981, lon: -111.5833 },
  "solitude": { lat: 40.6199, lon: -111.5928 },
  // Utah — Park City
  "park-city": { lat: 40.6514, lon: -111.5080 },
  "deer-valley": { lat: 40.6375, lon: -111.4783 },
  // Utah — Other
  "snowbasin": { lat: 41.2160, lon: -111.8569 },
  "powder-mountain": { lat: 41.3789, lon: -111.7808 },
  "brian-head": { lat: 37.7021, lon: -112.8499 },
  "sundance": { lat: 40.3934, lon: -111.5878 },
  "nordic-valley": { lat: 41.3104, lon: -111.8648 },

  // California — Tahoe
  "palisades-tahoe": { lat: 39.1968, lon: -120.2354 },
  "heavenly": { lat: 38.9353, lon: -119.9400 },
  "northstar": { lat: 39.2746, lon: -120.1210 },
  "kirkwood": { lat: 38.6850, lon: -120.0653 },
  "sugar-bowl": { lat: 39.3045, lon: -120.3352 },
  "boreal": { lat: 39.3322, lon: -120.3488 },
  "diamond-peak": { lat: 39.2533, lon: -119.9218 },
  "sierra-at-tahoe": { lat: 38.8017, lon: -120.0801 },
  // California — Eastern Sierra
  "mammoth-mountain": { lat: 37.6308, lon: -119.0326 },
  "june-mountain": { lat: 37.7672, lon: -119.0893 },
  // California — Other
  "bear-mountain": { lat: 34.2275, lon: -116.8600 },
  "snow-summit": { lat: 34.2366, lon: -116.8906 },
  "mountain-high": { lat: 34.3723, lon: -117.6926 },

  // Pacific Northwest
  "crystal-mountain": { lat: 46.9352, lon: -121.5045 },
  "stevens-pass": { lat: 47.7453, lon: -121.0890 },
  "mt-baker": { lat: 48.8574, lon: -121.6650 },
  "mt-bachelor": { lat: 43.9794, lon: -121.6886 },
  "timberline": { lat: 45.3311, lon: -121.7113 },
  "meadows": { lat: 45.3311, lon: -121.6649 },
  "mission-ridge": { lat: 47.2928, lon: -120.3986 },
  "white-pass": { lat: 46.6372, lon: -121.3902 },
  "snoqualmie": { lat: 47.4206, lon: -121.4135 },

  // Alaska
  "alyeska": { lat: 60.9606, lon: -149.1000 },

  // Northeast
  "killington": { lat: 43.6045, lon: -72.8201 },
  "stowe": { lat: 44.5303, lon: -72.7815 },
  "sugarbush": { lat: 44.1358, lon: -72.9108 },
  "jay-peak": { lat: 44.9272, lon: -72.5048 },
  "sunday-river": { lat: 44.4731, lon: -70.8567 },
  "sugarloaf": { lat: 45.0314, lon: -70.3131 },
  "loon": { lat: 44.0364, lon: -71.6214 },
  "bretton-woods": { lat: 44.2547, lon: -71.4636 },
  "cannon": { lat: 44.1564, lon: -71.6989 },
  "wildcat": { lat: 44.2642, lon: -71.2394 },
  "stratton": { lat: 43.1134, lon: -72.9087 },
  "okemo": { lat: 43.4015, lon: -72.7173 },
  "mount-snow": { lat: 42.9603, lon: -72.9211 },
  "hunter-mountain": { lat: 42.2003, lon: -74.2256 },
  "windham-mountain": { lat: 42.2969, lon: -74.2539 },
  "whiteface": { lat: 44.3654, lon: -73.9026 },
  "gore-mountain": { lat: 43.6747, lon: -74.0064 },

  // Northern Rockies
  "jackson-hole": { lat: 43.5877, lon: -110.8279 },
  "big-sky": { lat: 45.2833, lon: -111.4014 },
  "sun-valley": { lat: 43.6975, lon: -114.3514 },
  "grand-targhee": { lat: 43.7897, lon: -110.9585 },
  "whitefish": { lat: 48.4816, lon: -114.3564 },
  "schweitzer": { lat: 48.3675, lon: -116.6221 },
  "brundage": { lat: 44.8614, lon: -116.1540 },
  "bogus-basin": { lat: 43.7643, lon: -116.1026 },
  "red-lodge": { lat: 45.1856, lon: -109.3354 },

  // Southwest / New Mexico
  "taos": { lat: 36.5969, lon: -105.4544 },
  "angel-fire": { lat: 36.3933, lon: -105.2850 },
  "ski-santa-fe": { lat: 35.7955, lon: -105.8019 },

  // Canada West
  "whistler-blackcomb": { lat: 50.1163, lon: -122.9574 },
  "revelstoke": { lat: 51.0000, lon: -118.1642 },
  "kicking-horse": { lat: 51.2975, lon: -117.0478 },
  "sunshine-village": { lat: 51.0715, lon: -115.7737 },
  "lake-louise": { lat: 51.4403, lon: -116.1518 },
  "fernie": { lat: 49.4622, lon: -115.0867 },
  "red-mountain": { lat: 49.1044, lon: -117.8456 },

  // Midwest
  "boyne-mountain": { lat: 45.1672, lon: -84.9414 },
  "crystal-mountain-mi": { lat: 44.5228, lon: -86.2514 },
  "nubs-nob": { lat: 45.4700, lon: -84.9031 },
  "lutsen": { lat: 47.6633, lon: -90.7140 },
  "granite-peak": { lat: 44.9486, lon: -89.6832 },

  // Southeast
  "snowshoe": { lat: 38.4098, lon: -79.9959 },
  "wintergreen": { lat: 37.9383, lon: -78.9447 },
  "beech-mountain": { lat: 36.1858, lon: -81.8757 },
  "sugar-mountain": { lat: 36.1203, lon: -81.8689 },
  "cataloochee": { lat: 35.5710, lon: -83.0943 },
};

export function getResortCoordinates(slug: string): ResortCoordinate | undefined {
  return RESORT_COORDINATES[slug];
}
