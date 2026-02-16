// Static mapping of resort slugs to webcam information.
// Inputs: none (static data)
// Outputs: WebcamInfo lookup by slug, and helper function
// Side effects: none
// Error behavior: returns undefined for unknown slugs

export interface WebcamInfo {
  slug: string;
  webcamPageUrl: string;
  embedImageUrl?: string;
  source?: string;
}

const WEBCAM_DATA: WebcamInfo[] = [
  // Colorado
  { slug: "vail", webcamPageUrl: "https://www.vail.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "breckenridge", webcamPageUrl: "https://www.breckenridge.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "keystone", webcamPageUrl: "https://www.keystoneresort.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "copper-mountain", webcamPageUrl: "https://www.coppercolorado.com/the-mountain/conditions-weather/webcams", source: "Resort" },
  { slug: "winter-park", webcamPageUrl: "https://www.winterparkresort.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "steamboat", webcamPageUrl: "https://www.steamboat.com/the-mountain/mountain-cams", source: "Resort" },
  { slug: "aspen-snowmass", webcamPageUrl: "https://www.aspensnowmass.com/four-mountains/mountain-cams", source: "Resort" },
  { slug: "telluride", webcamPageUrl: "https://www.tellurideskiresort.com/webcams/", source: "Resort" },
  { slug: "crested-butte", webcamPageUrl: "https://www.skicb.com/the-mountain/mountain-conditions/webcams", source: "Resort" },
  { slug: "arapahoe-basin", webcamPageUrl: "https://www.arapahoebasin.com/snow-conditions/webcams/", source: "Resort" },
  { slug: "loveland", webcamPageUrl: "https://skiloveland.com/webcams/", source: "Resort" },
  // Utah
  { slug: "park-city", webcamPageUrl: "https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "snowbird", webcamPageUrl: "https://www.snowbird.com/mountain-cams/", source: "Resort" },
  { slug: "alta", webcamPageUrl: "https://www.alta.com/conditions/cameras", source: "Resort" },
  { slug: "deer-valley", webcamPageUrl: "https://www.deervalley.com/mountain/webcams", source: "Resort" },
  { slug: "brighton", webcamPageUrl: "https://brightonresort.com/mountain/webcams", source: "Resort" },
  { slug: "solitude", webcamPageUrl: "https://www.solitudemountain.com/mountain-conditions/webcams", source: "Resort" },
  { slug: "snowbasin", webcamPageUrl: "https://www.snowbasin.com/mountain-info/webcams/", source: "Resort" },
  // California
  { slug: "mammoth-mountain", webcamPageUrl: "https://www.mammothmountain.com/mountain-information/mountain-webcams", source: "Resort" },
  { slug: "palisades-tahoe", webcamPageUrl: "https://www.palisadestahoe.com/mountain-information/webcams", source: "Resort" },
  { slug: "heavenly", webcamPageUrl: "https://www.skiheavenly.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "northstar", webcamPageUrl: "https://www.northstarcalifornia.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "kirkwood", webcamPageUrl: "https://www.kirkwood.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "sugar-bowl", webcamPageUrl: "https://www.sugarbowl.com/conditions/webcams", source: "Resort" },
  // Pacific Northwest
  { slug: "crystal-mountain", webcamPageUrl: "https://www.crystalmountainresort.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "mt-bachelor", webcamPageUrl: "https://www.mtbachelor.com/conditions/webcams", source: "Resort" },
  { slug: "stevens-pass", webcamPageUrl: "https://www.stevenspass.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  // Northeast
  { slug: "killington", webcamPageUrl: "https://www.killington.com/the-mountain/mountain-conditions/mountain-cams", source: "Resort" },
  { slug: "stowe", webcamPageUrl: "https://www.stowe.com/the-mountain/mountain-conditions/mountain-cams.aspx", source: "Resort" },
  { slug: "sugarbush", webcamPageUrl: "https://www.sugarbush.com/mountain/webcams", source: "Resort" },
  { slug: "sunday-river", webcamPageUrl: "https://www.sundayriver.com/mountain/webcams", source: "Resort" },
  // Northern Rockies
  { slug: "jackson-hole", webcamPageUrl: "https://www.jacksonhole.com/webcams", source: "Resort" },
  { slug: "big-sky", webcamPageUrl: "https://bigskyresort.com/webcams", source: "Resort" },
  { slug: "sun-valley", webcamPageUrl: "https://www.sunvalley.com/mountain-info/webcams", source: "Resort" },
];

const WEBCAM_MAP = new Map(WEBCAM_DATA.map((w) => [w.slug, w]));

export function getWebcamInfo(slug: string): WebcamInfo | undefined {
  return WEBCAM_MAP.get(slug);
}
