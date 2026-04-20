import { ExternalLink } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate mb-1">Settings</h1>
      <p className="text-sm text-slate-light mb-8">Configure Google Sheets connection and API keys</p>

      <div className="space-y-4">
        <div className="neu-card p-6">
          <h2 className="font-semibold text-slate mb-4 text-sm">Setup Guide</h2>
          <ol className="space-y-3 text-sm text-slate-light list-decimal list-inside">
            <li>Create a Google Cloud project and enable the <strong className="text-slate">Google Sheets API</strong></li>
            <li>Create a <strong className="text-slate">Service Account</strong> and download the JSON key</li>
            <li>Create a Google Sheet and <strong className="text-slate">share it</strong> with the service account email (Editor)</li>
            <li>Create a <code className="bg-[#EBEFF5] px-1.5 py-0.5 rounded text-xs">.env</code> file in the project root with these values:</li>
          </ol>
          <div className="mt-4 neu-inset rounded-xl p-4 font-mono text-xs text-slate space-y-1">
            <p><span className="text-cerulean">GOOGLE_SERVICE_ACCOUNT_EMAIL</span>=xxx@project.iam.gserviceaccount.com</p>
            <p><span className="text-cerulean">GOOGLE_PRIVATE_KEY</span>="-----BEGIN PRIVATE KEY-----\n..."</p>
            <p><span className="text-cerulean">GOOGLE_SHEET_ID</span>=your_sheet_id_here</p>
            <p><span className="text-cerulean">ANTHROPIC_API_KEY</span>=sk-ant-...</p>
          </div>
          <p className="text-xs text-slate-light mt-3">
            The Sheet ID is the long string in your Google Sheet URL between <code className="bg-[#EBEFF5] px-1 rounded">/d/</code> and <code className="bg-[#EBEFF5] px-1 rounded">/edit</code>
          </p>
        </div>

        <div className="neu-card p-6">
          <h2 className="font-semibold text-slate mb-4 text-sm">Required Sheet Structure</h2>
          <p className="text-sm text-slate-light mb-3">
            Your Google Sheet should have a tab named <strong className="text-slate">Retailers</strong>.
            The app writes all columns automatically — no manual setup required.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["Columns A–E",   "Retailer info (name, city, state, zone, category)"],
              ["Columns F–O",   "10 environment classification dropdowns"],
              ["Columns P–W",   "Computed environment outputs"],
              ["Columns X–AQ",  "44 FMR variable scores"],
              ["Columns AR–BB", "Computed FMR outputs"],
              ["Columns BC–BF", "Revenue band, timestamp, submitted_by"],
            ].map(([range, desc]) => (
              <div key={range} className="neu-inset rounded-xl p-3">
                <p className="font-bold text-cobalt">{range}</p>
                <p className="text-slate-light mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-card p-6">
          <h2 className="font-semibold text-slate mb-4 text-sm">Running the App</h2>
          <div className="neu-inset rounded-xl p-4 font-mono text-xs text-slate space-y-1">
            <p><span className="text-cerulean">npm install</span>         <span className="text-slate-light"># install dependencies</span></p>
            <p><span className="text-cerulean">npm run dev</span>          <span className="text-slate-light"># start frontend + backend together</span></p>
            <p><span className="text-cerulean">npm run build</span>        <span className="text-slate-light"># production build</span></p>
          </div>
          <p className="text-xs text-slate-light mt-3">
            Frontend runs on <strong className="text-slate">localhost:3000</strong> · Express API on <strong className="text-slate">localhost:3001</strong>
          </p>
        </div>

        <div className="neu-card p-6">
          <h2 className="font-semibold text-slate mb-4 text-sm">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ["Google Cloud Console", "https://console.cloud.google.com"],
              ["Google Sheets API",    "https://console.cloud.google.com/apis/library/sheets.googleapis.com"],
              ["Anthropic Console",    "https://console.anthropic.com"],
            ].map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="neu-btn-outline flex items-center gap-1.5 px-3 py-2 text-xs">
                {label} <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
