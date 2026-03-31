import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RETAILERS_RANGE = "Retailers!A:BF";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key   = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendRetailerRow(row: string[]): Promise<void> {
  const auth   = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Retailers!A1",
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}

export async function getAllRetailers(): Promise<string[][]> {
  const auth   = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RETAILERS_RANGE,
  });
  return res.data.values ?? [];
}

// Column headers — matches the Google Sheet columns A→BF
export const SHEET_HEADERS = [
  "retailer_name","city","state","zone","industry_category",
  "primary_orientation","secondary_orientation","store_format",
  "display_structure","customer_type","selling_behavior",
  "store_size_band","brand_presence","category_depth","catchment_power",
  "environment_family","format_archetype","engagement_mode",
  "signature_key","final_environment_cluster","rule_source",
  "bajaj_overall_potential","bajaj_potential_tier",
  // FMR vars cols X–AQ (44 variables)
  "turnover_annual","sales_monthly","credit_stability","gst_status","business_age",
  "growth_3yr","footfall_day","avg_bill_value","category_mix",
  "tier1_presence","funding_history","national_brand_count","exclusivity",
  "road_facing","traffic_density","signage_scope","facade_width","corner_location",
  "fixture_condition","zoning_clarity","carpet_area","usable_wall_length","ceiling_height",
  "catchment_affluence","market_type","proximity_corridor","competition_density",
  "market_reputation","cluster_influence","b2b_base","branch_count","association_role",
  "decision_access","payment_discipline","owner_involvement","tech_adoption",
  "renovation_intent","cobrand_willingness","digital_interest","emi_openness",
  "signage_permissions","lease_stability","regulatory_risk","past_disputes",
  // Computed FMR
  "fmr_final_pct","fmr_score_band","fmr_business_category",
  "fmr_override_flag","fmr_final_category","fmr_opportunity_type",
  "recommend_external_branding","recommend_internal_branding",
  "recommend_fixtures","recommend_digital","recommend_premium","recommend_lite",
  "est_revenue_band","timestamp","submitted_by",
];

export type RetailerRecord = Record<string, string>;

export function rowsToRecords(rows: string[][]): RetailerRecord[] {
  if (rows.length === 0) return [];
  // If first row looks like headers (text, not data), skip it
  const firstIsHeader = rows[0][0]?.toLowerCase() === "retailer_name";
  const dataRows = firstIsHeader ? rows.slice(1) : rows;
  return dataRows.map(row => {
    const rec: RetailerRecord = {};
    SHEET_HEADERS.forEach((h, i) => { rec[h] = row[i] ?? ""; });
    return rec;
  });
}
