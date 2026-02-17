// Static mapping of resort slugs to official website URLs.
// Inputs: none (static data)
// Outputs: URL lookup by slug via getResortWebsiteUrl()
// Side effects: none
// Error behavior: returns undefined for unknown slugs
//
// Same pattern as webcam-data.ts. When the API exposes websiteUrl,
// the ApiResortDetail field will take priority over this fallback.

const RESORT_WEBSITES: Record<string, string> = {
  // Colorado — I-70 Corridor
  "vail": "https://www.vail.com",
  "beaver-creek": "https://www.beavercreek.com",
  "breckenridge": "https://www.breckenridge.com",
  "keystone": "https://www.keystoneresort.com",
  "copper-mountain": "https://www.coppercolorado.com",
  "arapahoe-basin": "https://www.arapahoebasin.com",
  "loveland": "https://skiloveland.com",
  "winter-park": "https://www.winterparkresort.com",
  "eldora": "https://www.eldora.com",
  // Colorado — Other
  "steamboat": "https://www.steamboat.com",
  "aspen-snowmass": "https://www.aspensnowmass.com",
  "aspen-mountain": "https://www.aspensnowmass.com",
  "aspen-highlands": "https://www.aspensnowmass.com",
  "buttermilk": "https://www.aspensnowmass.com",
  "telluride": "https://www.tellurideskiresort.com",
  "crested-butte": "https://www.skicb.com",
  "purgatory": "https://www.purgatoryresort.com",
  "monarch": "https://www.skimonarch.com",
  "wolf-creek": "https://wolfcreekski.com",
  "powderhorn": "https://www.powderhorn.com",

  // Utah — Cottonwoods/Wasatch
  "snowbird": "https://www.snowbird.com",
  "alta": "https://www.alta.com",
  "brighton": "https://brightonresort.com",
  "solitude": "https://www.solitudemountain.com",
  // Utah — Park City
  "park-city": "https://www.parkcitymountain.com",
  "deer-valley": "https://www.deervalley.com",
  // Utah — Other
  "snowbasin": "https://www.snowbasin.com",
  "powder-mountain": "https://www.powdermountain.com",
  "brian-head": "https://www.brianhead.com",
  "sundance": "https://www.sundanceresort.com",
  "nordic-valley": "https://www.nordicvalley.com",

  // California — Tahoe
  "palisades-tahoe": "https://www.palisadestahoe.com",
  "heavenly": "https://www.skiheavenly.com",
  "northstar": "https://www.northstarcalifornia.com",
  "kirkwood": "https://www.kirkwood.com",
  "sugar-bowl": "https://www.sugarbowl.com",
  "boreal": "https://www.rideboreal.com",
  "diamond-peak": "https://www.diamondpeak.com",
  "sierra-at-tahoe": "https://www.sierraattahoe.com",
  // California — Eastern Sierra
  "mammoth-mountain": "https://www.mammothmountain.com",
  "june-mountain": "https://www.junemountain.com",
  // California — Other
  "bear-mountain": "https://www.bigbearmountainresort.com",
  "snow-summit": "https://www.bigbearmountainresort.com",
  "mountain-high": "https://www.mthigh.com",

  // Pacific Northwest
  "crystal-mountain": "https://www.crystalmountainresort.com",
  "stevens-pass": "https://www.stevenspass.com",
  "mt-baker": "https://www.mtbaker.us",
  "mt-bachelor": "https://www.mtbachelor.com",
  "timberline": "https://www.timberlinelodge.com",
  "meadows": "https://www.skihood.com",
  "mission-ridge": "https://www.missionridge.com",
  "white-pass": "https://skiwhitepass.com",
  "snoqualmie": "https://summitatsnoqualmie.com",

  // Alaska
  "alyeska": "https://www.alyeskaresort.com",

  // Northeast
  "killington": "https://www.killington.com",
  "stowe": "https://www.stowe.com",
  "sugarbush": "https://www.sugarbush.com",
  "jay-peak": "https://jaypeakresort.com",
  "sunday-river": "https://www.sundayriver.com",
  "sugarloaf": "https://www.sugarloaf.com",
  "loon": "https://www.loonmtn.com",
  "bretton-woods": "https://www.brettonwoods.com",
  "cannon": "https://www.cannonmt.com",
  "wildcat": "https://www.skiwildcat.com",
  "stratton": "https://www.stratton.com",
  "okemo": "https://www.okemo.com",
  "mount-snow": "https://www.mountsnow.com",
  "hunter-mountain": "https://www.huntermtn.com",
  "windham-mountain": "https://www.windhammountain.com",
  "whiteface": "https://www.whiteface.com",
  "gore-mountain": "https://www.goremountain.com",

  // Northern Rockies
  "jackson-hole": "https://www.jacksonhole.com",
  "big-sky": "https://bigskyresort.com",
  "sun-valley": "https://www.sunvalley.com",
  "grand-targhee": "https://www.grandtarghee.com",
  "whitefish": "https://skiwhitefish.com",
  "schweitzer": "https://www.schweitzer.com",
  "brundage": "https://brundage.com",
  "bogus-basin": "https://bogusbasin.org",
  "red-lodge": "https://www.redlodgemountain.com",

  // Southwest / New Mexico
  "taos": "https://www.skitaos.com",
  "angel-fire": "https://www.angelfireresort.com",
  "ski-santa-fe": "https://www.skisantafe.com",

  // Canada West
  "whistler-blackcomb": "https://www.whistlerblackcomb.com",
  "revelstoke": "https://www.revelstokemountainresort.com",
  "kicking-horse": "https://kickinghorseresort.com",
  "sunshine-village": "https://www.skibanff.com",
  "lake-louise": "https://www.skilouise.com",
  "fernie": "https://skifernie.com",
  "red-mountain": "https://www.redresort.com",

  // Midwest
  "boyne-mountain": "https://www.boynemountain.com",
  "crystal-mountain-mi": "https://www.crystalmountain.com",
  "nubs-nob": "https://www.nubsnob.com",
  "lutsen": "https://www.lutsen.com",
  "granite-peak": "https://www.skigranitepeak.com",

  // Southeast
  "snowshoe": "https://www.snowshoemtn.com",
  "wintergreen": "https://www.wintergreenresort.com",
  "beech-mountain": "https://www.beechmountainresort.com",
  "sugar-mountain": "https://www.skisugar.com",
  "cataloochee": "https://cataloochee.com",
};

export function getResortWebsiteUrl(slug: string): string | undefined {
  return RESORT_WEBSITES[slug];
}
