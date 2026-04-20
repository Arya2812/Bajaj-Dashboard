import {
  PRIMARY_ORIENTATION, SECONDARY_ORIENTATION, STORE_FORMAT,
  DISPLAY_STRUCTURE, CUSTOMER_TYPE, SELLING_BEHAVIOR,
  STORE_SIZE, BRAND_PRESENCE, CATEGORY_DEPTH, CATCHMENT_POWER,
  FMR_DIMENSIONS,
} from "./lookup-tables";
import {
  CLUSTER_RULES, PRIMARY_FAMILY_LABELS, SECONDARY_FAMILY_LABELS,
  SCORE_BANDS, UPGRADE_ORDER,
} from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────

export interface EnvClassificationInput {
  primary_orientation: string;   // label
  secondary_orientation: string;
  store_format: string;
  display_structure: string;
  customer_type: string;
  selling_behavior: string;
  store_size_band: string;
  brand_presence: string;
  category_depth: string;
  catchment_power: string;
}

export interface EnvClassificationOutput {
  [key: string]: string | number;
  environment_family: string;
  format_archetype: string;
  engagement_mode: string;
  signature_key: string;
  final_environment_cluster: string;
  rule_source: string;
  bajaj_overall_potential: number;
  bajaj_potential_tier: string;
}

export interface FmrInput {
  [key: string]: string; // variable key → label string containing [N]
}

export interface FmrOutput {
  [key: string]: string | number | Record<string, number>;
  dimension_scores: Record<string, number>;
  fmr_final_pct: number;
  fmr_score_band: string;
  fmr_business_category: string;
  fmr_override_flag: string;
  fmr_final_category: string;
  fmr_opportunity_type: string;
  recommend_external_branding: string;
  recommend_internal_branding: string;
  recommend_fixtures: string;
  recommend_digital: string;
  recommend_premium: string;
  recommend_lite: string;
  est_revenue_band: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function findByLabel<T extends { label: string }>(arr: T[], label: string): T | undefined {
  return arr.find(x => x.label === label);
}

export function extractScore(optionLabel: string): number {
  if (!optionLabel || optionLabel.trim() === "") return 0;
  const m = optionLabel.match(/\[(\d)\]/);
  if (m) return parseInt(m[1], 10);
  // Handle plain numeric scores stored by the sheet writer (e.g. "3")
  const n = parseInt(optionLabel.trim(), 10);
  if (!isNaN(n) && n >= 1 && n <= 5) return n;
  return 0;
}

// ─── Engine 1 ─────────────────────────────────────────────────────────────

export function computeEnvironmentClassification(
  input: EnvClassificationInput
): EnvClassificationOutput {
  const prim = findByLabel(PRIMARY_ORIENTATION, input.primary_orientation)!;
  const sec  = findByLabel(SECONDARY_ORIENTATION, input.secondary_orientation)!;
  const fmt  = findByLabel(STORE_FORMAT, input.store_format)!;
  const disp = findByLabel(DISPLAY_STRUCTURE, input.display_structure)!;
  const cust = findByLabel(CUSTOMER_TYPE, input.customer_type)!;
  const sell = findByLabel(SELLING_BEHAVIOR, input.selling_behavior)!;
  const size = findByLabel(STORE_SIZE, input.store_size_band)!;
  const brand = findByLabel(BRAND_PRESENCE, input.brand_presence)!;
  const catd  = findByLabel(CATEGORY_DEPTH, input.category_depth)!;
  const catch_ = findByLabel(CATCHMENT_POWER, input.catchment_power)!;

  // Step 1 — Environment Family
  let environment_family: string;
  if (prim.code === "HEA" || sec.code === "M") {
    environment_family = "Electrical + Appliances Hybrid";
  } else if (sec.code === "N") {
    environment_family = PRIMARY_FAMILY_LABELS[prim.code] ?? prim.label;
  } else {
    environment_family =
      (PRIMARY_FAMILY_LABELS[prim.code] ?? prim.label) +
      " + " +
      (SECONDARY_FAMILY_LABELS[sec.code] ?? sec.label);
  }

  // Step 2 — Format Archetype
  let format_archetype: string;
  if (fmt.code === "EXP" || sell.code === "DEM") {
    format_archetype = "Experience-led";
  } else if (fmt.code === "OPN" || ["CB","DDZ","MZL"].includes(disp.code)) {
    format_archetype = "Open-display";
  } else if (fmt.code === "AST") {
    format_archetype = "Assisted retail";
  } else if (fmt.code === "WAR") {
    format_archetype = "Warehouse-trade hybrid";
  } else {
    format_archetype = "Transactional counter";
  }

  // Step 3 — Engagement Mode
  let engagement_mode: string;
  if (cust.code === "PRM" || ["DEM","SELF"].includes(sell.code)) {
    engagement_mode = "Consumer-led discovery";
  } else if (["WLK","MIX"].includes(cust.code) || sell.code === "AST") {
    engagement_mode = "Assisted consumer purchase";
  } else if (cust.code === "INS") {
    engagement_mode = "Institutional / B2B buying";
  } else {
    engagement_mode = "Trade-influenced purchase";
  }

  // Step 4 — Signature Key
  const signature_key = `${prim.code}|${sec.code}|${fmt.code}|${disp.code}|${cust.code}|${sell.code}`;

  // Step 5 — Cluster Lookup
  let final_environment_cluster: string;
  let rule_source: string;
  if (CLUSTER_RULES[signature_key]) {
    final_environment_cluster = CLUSTER_RULES[signature_key];
    rule_source = "Mapped rule";
  } else {
    final_environment_cluster = `${environment_family} | ${format_archetype} | ${engagement_mode}`;
    rule_source = "Synthesized fallback";
  }

  // Step 6 — Bajaj Outlet Potential Score
  const category_opportunity =
    prim.category_score * 0.50 + sec.category_score * 0.20 + catd.category_score * 0.30;
  const display_potential =
    disp.display_score * 0.60 + size.display_score * 0.40;
  const visibility_potential =
    fmt.visibility_score * 0.50 + brand.visibility_score * 0.50;
  const consumer_influence =
    cust.influence_score * 0.45 + sell.influence_score * 0.55;
  const growth_headroom =
    sec.headroom_score * 0.35 + brand.headroom_score * 0.35 + (6 - catd.category_score) * 0.30;
  const catchment_power_score = catch_.catchment_score;

  const bajaj_overall_potential =
    (category_opportunity / 5) * 0.30 +
    (display_potential / 5) * 0.20 +
    (visibility_potential / 5) * 0.15 +
    (consumer_influence / 5) * 0.15 +
    (growth_headroom / 5) * 0.10 +
    (catchment_power_score / 5) * 0.10;

  let bajaj_potential_tier: string;
  if (bajaj_overall_potential >= 0.80) bajaj_potential_tier = "High Potential";
  else if (bajaj_overall_potential >= 0.65) bajaj_potential_tier = "Medium Potential";
  else if (bajaj_overall_potential >= 0.50) bajaj_potential_tier = "Selective Potential";
  else bajaj_potential_tier = "Low Potential";

  return {
    environment_family,
    format_archetype,
    engagement_mode,
    signature_key,
    final_environment_cluster,
    rule_source,
    bajaj_overall_potential: Math.round(bajaj_overall_potential * 10000) / 10000,
    bajaj_potential_tier,
  };
}

// ─── Engine 1b — Environment Dimension Scores (individual) ───────────────

export interface EnvDimensionScores {
  category_opportunity: number;  // 0–5
  display_potential:    number;
  visibility_potential: number;
  consumer_influence:   number;
  growth_headroom:      number;
  catchment_power:      number;
}

export function computeEnvDimensionScores(
  input: EnvClassificationInput
): EnvDimensionScores | null {
  const prim   = findByLabel(PRIMARY_ORIENTATION,   input.primary_orientation);
  const sec    = findByLabel(SECONDARY_ORIENTATION, input.secondary_orientation);
  const fmt    = findByLabel(STORE_FORMAT,          input.store_format);
  const disp   = findByLabel(DISPLAY_STRUCTURE,     input.display_structure);
  const cust   = findByLabel(CUSTOMER_TYPE,         input.customer_type);
  const sell   = findByLabel(SELLING_BEHAVIOR,      input.selling_behavior);
  const size   = findByLabel(STORE_SIZE,            input.store_size_band);
  const brand  = findByLabel(BRAND_PRESENCE,        input.brand_presence);
  const catd   = findByLabel(CATEGORY_DEPTH,        input.category_depth);
  const catch_ = findByLabel(CATCHMENT_POWER,       input.catchment_power);

  if (!prim || !sec || !fmt || !disp || !cust || !sell || !size || !brand || !catd || !catch_) {
    return null;
  }
  return {
    category_opportunity: prim.category_score * 0.50 + sec.category_score * 0.20 + catd.category_score * 0.30,
    display_potential:    disp.display_score   * 0.60 + size.display_score   * 0.40,
    visibility_potential: fmt.visibility_score * 0.50 + brand.visibility_score * 0.50,
    consumer_influence:   cust.influence_score * 0.45 + sell.influence_score   * 0.55,
    growth_headroom:      sec.headroom_score   * 0.35 + brand.headroom_score   * 0.35 + (6 - catd.category_score) * 0.30,
    catchment_power:      catch_.catchment_score,
  };
}

// ─── Engine 2 ─────────────────────────────────────────────────────────────

export function computeFmrScore(input: FmrInput): FmrOutput {
  const dimension_scores: Record<string, number> = {};

  for (const dim of FMR_DIMENSIONS) {
    let dim_score = 0;
    for (const v of dim.variables) {
      const raw = input[v.key] ?? "";
      const score = extractScore(raw);
      dim_score += score * v.weight;
    }
    dimension_scores[dim.id] = Math.round(dim_score * 100) / 100;
  }

  // Final percentage (0-1)
  let fmr_final_pct = 0;
  for (const dim of FMR_DIMENSIONS) {
    fmr_final_pct += (dimension_scores[dim.id] / 5) * dim.weight;
  }
  fmr_final_pct = Math.round(fmr_final_pct * 10000) / 10000;

  // Score band & base category
  let fmr_score_band = "C";
  let fmr_business_category = "Do Not Pursue";
  for (const sb of SCORE_BANDS) {
    if (fmr_final_pct >= sb.min) {
      fmr_score_band = sb.band;
      fmr_business_category = sb.category;
      break;
    }
  }

  // Override rules
  const commercial = dimension_scores["commercial"];
  const external   = dimension_scores["external_visibility"];
  const internal   = dimension_scores["internal_branding"];
  const compliance = dimension_scores["compliance"];
  const investment = dimension_scores["investment_readiness"];
  const location   = dimension_scores["location"];
  const velocity   = dimension_scores["sales_velocity"];

  let fmr_override_flag = "No override";
  let fmr_final_category = fmr_business_category;

  if (compliance <= 2) {
    fmr_override_flag = "Downgrade: weak compliance";
    const downgradeTargets = ["Strategic+","Strategic","Active Target","Selective Target"];
    if (downgradeTargets.includes(fmr_business_category)) fmr_final_category = "Conditional";
  } else if (commercial >= 4 && external >= 4) {
    fmr_override_flag = "Upgrade: strong commercial + visibility";
    const idx = UPGRADE_ORDER.indexOf(fmr_business_category);
    if (idx < UPGRADE_ORDER.length - 1) {
      fmr_final_category = UPGRADE_ORDER[idx + 1];
    }
  } else if (investment <= 2) {
    fmr_override_flag = "Restriction: low investment readiness";
    if (fmr_business_category === "Strategic+") fmr_final_category = "Strategic";
  }

  // Opportunity type
  let fmr_opportunity_type: string;
  if (commercial >= 4 && external >= 4 && internal >= 4 && investment >= 3) {
    fmr_opportunity_type = "CAT A";
  } else if (external >= 4 && commercial >= 3) {
    fmr_opportunity_type = "CAT B";
  } else if (commercial >= 4 && internal >= 3) {
    fmr_opportunity_type = "CAT C";
  } else if (location >= 4 && velocity >= 3) {
    fmr_opportunity_type = "CAT D";
  } else {
    fmr_opportunity_type = "CAT E";
  }

  const isA = fmr_opportunity_type === "CAT A";
  const isB = fmr_opportunity_type === "CAT B";
  const isC = fmr_opportunity_type === "CAT C";
  const isD = fmr_opportunity_type === "CAT D";

  const recommend_external_branding = (isA || isB || (external >= 3 && location >= 4)) ? "Yes" : "No";
  const recommend_internal_branding = (isA || isC || internal >= 3) ? "Yes" : "No";
  const recommend_fixtures          = (isA || isC || (internal >= 4 && commercial >= 3)) ? "Yes" : "No";
  const recommend_digital           = (isA || isB || commercial >= 4) ? "Yes" : "No";
  const recommend_premium           = (isA || (commercial >= 4 && external >= 4 && investment >= 3)) ? "Yes" : "No";
  const recommend_lite              = (isD || isB || fmr_final_pct < 0.68) ? "Yes" : "No";

  const revMap: Record<string, string> = {
    "CAT A": "₹5–15L", "CAT B": "₹2–8L", "CAT C": "₹3–10L", "CAT D": "₹0.5–3L",
  };
  const est_revenue_band = revMap[fmr_opportunity_type] ?? "-";

  return {
    dimension_scores,
    fmr_final_pct,
    fmr_score_band,
    fmr_business_category,
    fmr_override_flag,
    fmr_final_category,
    fmr_opportunity_type,
    recommend_external_branding,
    recommend_internal_branding,
    recommend_fixtures,
    recommend_digital,
    recommend_premium,
    recommend_lite,
    est_revenue_band,
  };
}
