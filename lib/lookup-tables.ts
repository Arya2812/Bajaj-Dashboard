// ─── Bajaj Environment Classification Dropdowns ───────────────────────────

export const PRIMARY_ORIENTATION = [
  { label: "Core Electricals",               code: "ELC", category_score: 4 },
  { label: "Appliances",                     code: "APL", category_score: 5 },
  { label: "Lighting",                       code: "LGT", category_score: 4 },
  { label: "Mixed Electrical + Appliances",  code: "HEA", category_score: 5 },
  { label: "Consumer Durables / Electronics",code: "CDE", category_score: 4 },
  { label: "Hardware + Electrical",          code: "HWE", category_score: 3 },
  { label: "Multi-category General Trade",   code: "MGT", category_score: 2 },
];

export const SECONDARY_ORIENTATION = [
  { label: "None",                           code: "N", category_score: 1, headroom_score: 1 },
  { label: "Electrical",                     code: "E", category_score: 3, headroom_score: 3 },
  { label: "Appliances",                     code: "A", category_score: 4, headroom_score: 4 },
  { label: "Lighting",                       code: "L", category_score: 3, headroom_score: 3 },
  { label: "Consumer Durables / Electronics",code: "C", category_score: 3, headroom_score: 3 },
  { label: "Kitchen Solutions",              code: "K", category_score: 4, headroom_score: 4 },
  { label: "Mixed",                          code: "M", category_score: 5, headroom_score: 5 },
];

export const STORE_FORMAT = [
  { label: "Counter-based",          code: "CTR", display_score: 1, visibility_score: 2 },
  { label: "Shelf-based",            code: "SHF", display_score: 2, visibility_score: 2 },
  { label: "Assisted Retail",        code: "AST", display_score: 3, visibility_score: 3 },
  { label: "Open Display Retail",    code: "OPN", display_score: 4, visibility_score: 4 },
  { label: "Experience-led Retail",  code: "EXP", display_score: 5, visibility_score: 5 },
  { label: "Warehouse + Retail Hybrid", code: "WAR", display_score: 2, visibility_score: 2 },
];

export const DISPLAY_STRUCTURE = [
  { label: "No structured display",    code: "NS",  display_score: 1 },
  { label: "Basic shelves",            code: "BS",  display_score: 2 },
  { label: "Branded shelves",          code: "BRS", display_score: 3 },
  { label: "Category blocks",          code: "CB",  display_score: 4 },
  { label: "Dedicated display zones",  code: "DDZ", display_score: 5 },
  { label: "Multi-category zoned layout", code: "MZL", display_score: 5 },
];

export const CUSTOMER_TYPE = [
  { label: "Electricians / Contractors", code: "ELEC", influence_score: 2 },
  { label: "Walk-in Consumers",          code: "WLK",  influence_score: 3 },
  { label: "Mixed",                      code: "MIX",  influence_score: 4 },
  { label: "Premium Consumers",          code: "PRM",  influence_score: 5 },
  { label: "Institutional Buyers",       code: "INS",  influence_score: 3 },
];

export const SELLING_BEHAVIOR = [
  { label: "Transactional (ask & buy)", code: "TRN",  influence_score: 1 },
  { label: "Retailer push-driven",      code: "PUS",  influence_score: 2 },
  { label: "Assisted selling",          code: "AST",  influence_score: 3 },
  { label: "Demo-led selling",          code: "DEM",  influence_score: 5 },
  { label: "Self-exploration",          code: "SELF", influence_score: 4 },
];

export const STORE_SIZE = [
  { label: "0-100 sqft",    code: "XS", display_score: 1 },
  { label: "100-300 sqft",  code: "SM", display_score: 2 },
  { label: "300-700 sqft",  code: "MD", display_score: 3 },
  { label: "700-1500 sqft", code: "LG", display_score: 4 },
  { label: "1500+ sqft",    code: "XL", display_score: 5 },
];

export const BRAND_PRESENCE = [
  { label: "No brand dominance",               code: "NBD", visibility_score: 1, headroom_score: 5 },
  { label: "Multi-brand cluttered",            code: "MBC", visibility_score: 2, headroom_score: 4 },
  { label: "Partial brand blocks",             code: "PBB", visibility_score: 3, headroom_score: 3 },
  { label: "Strong category ownership",        code: "SCO", visibility_score: 4, headroom_score: 2 },
  { label: "Exclusive / dominant brand presence", code: "EXC", visibility_score: 5, headroom_score: 1 },
];

export const CATEGORY_DEPTH = [
  { label: "Very Low",       code: "VL", category_score: 1 },
  { label: "Limited",        code: "LT", category_score: 2 },
  { label: "Moderate",       code: "MD", category_score: 3 },
  { label: "High",           code: "HI", category_score: 4 },
  { label: "Destination Level", code: "DL", category_score: 5 },
];

export const CATCHMENT_POWER = [
  { label: "Low-throughput neighborhood", code: "LTN", catchment_score: 1 },
  { label: "Local market",                code: "LM",  catchment_score: 2 },
  { label: "City market",                 code: "CM",  catchment_score: 3 },
  { label: "Destination market",          code: "DM",  catchment_score: 4 },
  { label: "Premium destination",         code: "PD",  catchment_score: 5 },
];

// ─── FMR Scoring Dimensions ────────────────────────────────────────────────

export const FMR_DIMENSIONS = [
  {
    id: "commercial",
    label: "Commercial Strength",
    weight: 0.18,
    variables: [
      { key: "turnover_annual",  label: "Annual Turnover",   weight: 0.35,
        options: ["< 10 Lakhs [1]","10-50 Lakhs [2]","50 Lakhs-1 Cr [3]","1-5 Cr [4]","5 Cr+ [5]"] },
      { key: "sales_monthly",    label: "Monthly Sales",     weight: 0.30,
        options: ["< 1 Lakh [1]","1-5 Lakhs [2]","5-10 Lakhs [3]","10-25 Lakhs [4]","25 Lakhs+ [5]"] },
      { key: "credit_stability", label: "Credit Stability",  weight: 0.20,
        options: ["Frequent delays [1]","Occasional delays [2]","Mostly stable [3]","Trusted dealer [4]","Preferred dealer [5]"] },
      { key: "gst_status",       label: "GST Active",        weight: 0.10,
        options: ["Not registered [1]","Registered/inactive [2]","Active - verbal [3]","Active - seen [4]","Active with regular billing [5]"] },
      { key: "business_age",     label: "Age of Business",   weight: 0.05,
        options: ["< 1 year [1]","1-3 years [2]","3-5 years [3]","5-10 years [4]","10+ years [5]"] },
    ],
  },
  {
    id: "sales_velocity",
    label: "Sales Velocity & Growth Trend",
    weight: 0.10,
    variables: [
      { key: "growth_3yr",      label: "3-year Growth Trend", weight: 0.40,
        options: ["Declining [1]","Flat [2]","Modest growth [3]","Strong growth [4]","Very strong growth [5]"] },
      { key: "footfall_day",    label: "Footfall / Day",       weight: 0.25,
        options: ["< 20/day [1]","20-50/day [2]","50-100/day [3]","100-200/day [4]","200+/day [5]"] },
      { key: "avg_bill_value",  label: "Average Bill Value",   weight: 0.20,
        options: ["< Rs 500 [1]","Rs 500-1,500 [2]","Rs 1,500-3,000 [3]","Rs 3,000-7,000 [4]","Rs 7,000+ [5]"] },
      { key: "category_mix",    label: "Category Mix Quality", weight: 0.15,
        options: ["Highly fragmented [1]","Low structure [2]","Moderate structure [3]","Focused mix [4]","Highly structured mix [5]"] },
    ],
  },
  {
    id: "brand_portfolio",
    label: "Brand Portfolio Strength",
    weight: 0.12,
    variables: [
      { key: "tier1_presence",       label: "Tier-1 Brand Presence",  weight: 0.35,
        options: ["None [1]","1 brand [2]","2-3 brands [3]","4-5 brands [4]","5+ brands [5]"] },
      { key: "funding_history",      label: "Brand Funding History",   weight: 0.30,
        options: ["Never funded [1]","One-time support [2]","Occasional funding [3]","Regular funding [4]","Structured brand program [5]"] },
      { key: "national_brand_count", label: "# of National Brands",    weight: 0.20,
        options: ["0-2 brands [1]","3-5 brands [2]","6-10 brands [3]","11-15 brands [4]","15+ brands [5]"] },
      { key: "exclusivity",          label: "Exclusivity",             weight: 0.15,
        options: ["None [1]","Preference only [2]","Semi-exclusive [3]","Exclusive with 1 brand [4]","Multi-exclusive ties [5]"] },
    ],
  },
  {
    id: "external_visibility",
    label: "External Visibility Potential",
    weight: 0.15,
    variables: [
      { key: "road_facing",      label: "Road-facing Quality",  weight: 0.30,
        options: ["Inside lane [1]","Local road [2]","Main road [3]","Arterial road [4]","Highway / prime frontage [5]"] },
      { key: "traffic_density",  label: "Traffic Density",      weight: 0.25,
        options: ["Low traffic [1]","Moderate traffic [2]","Good traffic [3]","High traffic [4]","Very high traffic [5]"] },
      { key: "signage_scope",    label: "Signage Scope Size",   weight: 0.20,
        options: ["Minimal scope [1]","Small scope [2]","Medium scope [3]","Large scope [4]","Multi-surface scope [5]"] },
      { key: "facade_width",     label: "Facade Width",         weight: 0.15,
        options: ["< 5 ft [1]","5-10 ft [2]","10-20 ft [3]","20-40 ft [4]","40+ ft [5]"] },
      { key: "corner_location",  label: "Corner Advantage",     weight: 0.10,
        options: ["No corner benefit [1]","Partial corner [2]","Clear corner [3]","2-side visibility [4]","3-side / landmark [5]"] },
    ],
  },
  {
    id: "internal_branding",
    label: "Internal Branding & Fixture Scope",
    weight: 0.12,
    variables: [
      { key: "fixture_condition",   label: "Fixture Condition",    weight: 0.35,
        options: ["No upgrade needed [1]","Minor refresh needed [2]","Moderate upgrade needed [3]","Major upgrade needed [4]","Full reset opportunity [5]"] },
      { key: "zoning_clarity",      label: "Zoning Clarity",       weight: 0.25,
        options: ["Already optimized [1]","Minor improvement possible [2]","Moderate improvement [3]","High improvement potential [4]","Full re-zoning opportunity [5]"] },
      { key: "carpet_area",         label: "Carpet Area",          weight: 0.20,
        options: ["< 200 sq ft [1]","200-500 sq ft [2]","500-1,000 sq ft [3]","1,000-2,000 sq ft [4]","> 2,000 sq ft [5]"] },
      { key: "usable_wall_length",  label: "Usable Wall Length",   weight: 0.15,
        options: ["< 10 ft [1]","10-30 ft [2]","30-60 ft [3]","60-100 ft [4]","100+ ft [5]"] },
      { key: "ceiling_height",      label: "Ceiling Height",       weight: 0.05,
        options: ["< 8 ft [1]","8-10 ft [2]","10-12 ft [3]","12-15 ft [4]","15+ ft [5]"] },
    ],
  },
  {
    id: "location",
    label: "Location & Catchment Power",
    weight: 0.08,
    variables: [
      { key: "catchment_affluence",  label: "Catchment Affluence",       weight: 0.40,
        options: ["Low income [1]","Lower-middle [2]","Middle [3]","Upper-middle [4]","Affluent [5]"] },
      { key: "market_type",          label: "High-street / Market Type", weight: 0.25,
        options: ["Village / remote [1]","Neighbourhood market [2]","City market [3]","High street [4]","Premium commercial / highway hub [5]"] },
      { key: "proximity_corridor",   label: "Proximity to Corridors",    weight: 0.20,
        options: ["> 5 km away [1]","2-5 km away [2]","1-2 km away [3]","< 1 km away [4]","On corridor / highway [5]"] },
      { key: "competition_density",  label: "Competition Density",       weight: 0.15,
        options: ["Isolated market [1]","Low competition [2]","Moderate competition [3]","High competition [4]","Very active cluster [5]"] },
    ],
  },
  {
    id: "strategic_influence",
    label: "Strategic Influence in Market",
    weight: 0.08,
    variables: [
      { key: "market_reputation",  label: "Market Reputation",      weight: 0.30,
        options: ["Weak [1]","Average [2]","Known [3]","Leader [4]","Dominant [5]"] },
      { key: "cluster_influence",  label: "Cluster Influence",      weight: 0.25,
        options: ["Low [1]","Moderate [2]","High [3]","Controls cluster [4]","Market driver [5]"] },
      { key: "b2b_base",           label: "B2B Base",                weight: 0.20,
        options: ["None [1]","Small [2]","Moderate [3]","Strong [4]","Institutional [5]"] },
      { key: "branch_count",       label: "Branch Count",            weight: 0.15,
        options: ["1 branch [1]","2 branches [2]","3-5 branches [3]","6-10 branches [4]","10+ branches [5]"] },
      { key: "association_role",   label: "Association Role",        weight: 0.10,
        options: ["None [1]","Member [2]","Active member [3]","Office bearer [4]","President / leader [5]"] },
    ],
  },
  {
    id: "operational_readiness",
    label: "Operational & Partnership Readiness",
    weight: 0.07,
    variables: [
      { key: "decision_access",    label: "Decision Access",    weight: 0.35,
        options: ["Difficult [1]","Indirect [2]","Moderate [3]","Direct [4]","Immediate [5]"] },
      { key: "payment_discipline", label: "Payment Discipline", weight: 0.30,
        options: ["Poor [1]","Average [2]","Stable [3]","Strong [4]","Preferred [5]"] },
      { key: "owner_involvement",  label: "Owner Involvement",  weight: 0.20,
        options: ["Rarely present [1]","Occasionally present [2]","Frequently present [3]","Daily active [4]","Fully involved [5]"] },
      { key: "tech_adoption",      label: "Tech Adoption",      weight: 0.15,
        options: ["Manual only [1]","Basic billing [2]","ERP / POS [3]","CRM-enabled [4]","Advanced digital [5]"] },
    ],
  },
  {
    id: "investment_readiness",
    label: "Investment & Monetization Readiness",
    weight: 0.05,
    variables: [
      { key: "renovation_intent",   label: "Renovation Intent",      weight: 0.40,
        options: ["No intent [1]","Maybe later [2]","Planning stage [3]","Within 12 months [4]","Immediate [5]"] },
      { key: "cobrand_willingness", label: "Co-branding Willingness", weight: 0.25,
        options: ["Not open [1]","Low interest [2]","Moderate [3]","High [4]","Proactive [5]"] },
      { key: "digital_interest",    label: "Digital Interest",        weight: 0.20,
        options: ["No interest [1]","Curious [2]","Interested [3]","Active [4]","Ready now [5]"] },
      { key: "emi_openness",        label: "EMI Openness",            weight: 0.15,
        options: ["Not open [1]","Hesitant [2]","Will consider [3]","Open [4]","Ready [5]"] },
    ],
  },
  {
    id: "compliance",
    label: "Compliance & Business Stability",
    weight: 0.05,
    variables: [
      { key: "signage_permissions", label: "Signage Permissions", weight: 0.35,
        options: ["Restricted / not allowed [1]","Difficult approval [2]","Possible with approvals [3]","Readily permitted [4]","Fully open / owner-controlled [5]"] },
      { key: "lease_stability",     label: "Lease Stability",     weight: 0.25,
        options: ["Unstable short-term [1]","Short lease [2]","Stable rental [3]","Long lease [4]","Owned / long-term control [5]"] },
      { key: "regulatory_risk",     label: "Regulatory Risk",     weight: 0.25,
        options: ["High [1]","Medium-high [2]","Medium [3]","Low [4]","Very low [5]"] },
      { key: "past_disputes",       label: "Past Disputes",       weight: 0.15,
        options: ["Multiple disputes [1]","Some disputes [2]","Minor issues [3]","None known [4]","Clean record [5]"] },
    ],
  },
];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export const STATE_TO_ZONE: Record<string, string> = {
  "Andhra Pradesh": "South","Arunachal Pradesh": "East","Assam": "East",
  "Bihar": "East","Chhattisgarh": "East","Goa": "West","Gujarat": "West",
  "Haryana": "North","Himachal Pradesh": "North","Jharkhand": "East",
  "Karnataka": "South","Kerala": "South","Madhya Pradesh": "West",
  "Maharashtra": "West","Manipur": "East","Meghalaya": "East","Mizoram": "East",
  "Nagaland": "East","Odisha": "East","Punjab": "North","Rajasthan": "North",
  "Sikkim": "East","Tamil Nadu": "South","Telangana": "South","Tripura": "East",
  "Uttar Pradesh": "North","Uttarakhand": "North","West Bengal": "East",
  "Andaman and Nicobar Islands": "East","Chandigarh": "North",
  "Dadra and Nagar Haveli": "West","Daman and Diu": "West","Delhi": "North",
  "Jammu and Kashmir": "North","Ladakh": "North","Lakshadweep": "South",
  "Puducherry": "South",
};

export const INDUSTRY_CATEGORIES = [
  "Electricals","Appliances","Lighting","Consumer Durables",
  "Electronics","Hardware","Kitchen Solutions","Mixed Retail",
  "B2B / Institutional","Other",
];
