/* ═══════════════════════════════════════════════════════════════
   AlethiaRx — PRODUCTION SCRIPT v3
   50-Drug Database · 3D Card Flip · Fintech Clearing Engine
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── GLOBAL STATE ───────────────────────────────────────────── */
const State = {
  user:           null,   // { name, email, avatar }
  vault:          {},     // All identity + insurance fields
  cabinet:        [],     // Saved medications
  currentDrug:    null,
  currentVariant: null,
  adminLoggedIn:  false,
  onboardStep:    1,
  activeFee:      2.50,
  drawerDrug:     null,
};

/* ═══════════════════════════════════════════════════════════════
   50-DRUG DATABASE
   5-point price matrix per variant:
   { label, fairplay, insurance, goodrx, costplus, retail }
═══════════════════════════════════════════════════════════════ */
const DRUGS = [
  {
    name: "Metformin", category: "Diabetes", icon: "Rx",
    variants: [
      { label: "500mg · 30 tabs",  fairplay: 4.87,  insurance: 15.00,  goodrx: 6.20,   costplus: 3.90,  retail: 42.00 },
      { label: "500mg · 90 tabs",  fairplay: 8.40,  insurance: 35.00,  goodrx: 11.50,  costplus: 7.20,  retail: 98.00 },
      { label: "1000mg · 30 tabs", fairplay: 5.50,  insurance: 18.00,  goodrx: 7.80,   costplus: 4.50,  retail: 52.00 },
      { label: "1000mg · 90 tabs", fairplay: 12.20, insurance: 42.00,  goodrx: 16.40,  costplus: 9.80,  retail: 118.00 },
    ]
  },
  {
    name: "Lisinopril", category: "Blood Pressure", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 3.50,  insurance: 12.00,  goodrx: 5.10,   costplus: 2.80,  retail: 28.00 },
      { label: "10mg · 30 tabs",  fairplay: 4.20,  insurance: 14.00,  goodrx: 6.00,   costplus: 3.30,  retail: 34.00 },
      { label: "20mg · 30 tabs",  fairplay: 4.80,  insurance: 16.00,  goodrx: 7.20,   costplus: 3.90,  retail: 40.00 },
      { label: "20mg · 90 tabs",  fairplay: 10.50, insurance: 38.00,  goodrx: 14.80,  costplus: 8.40,  retail: 92.00 },
    ]
  },
  {
    name: "Atorvastatin", category: "Cholesterol", icon: "Rx",
    variants: [
      { label: "10mg · 30 tabs",  fairplay: 7.40,  insurance: 22.00,  goodrx: 10.20,  costplus: 5.80,  retail: 68.00 },
      { label: "20mg · 30 tabs",  fairplay: 8.90,  insurance: 26.00,  goodrx: 12.50,  costplus: 6.90,  retail: 82.00 },
      { label: "40mg · 30 tabs",  fairplay: 10.20, insurance: 30.00,  goodrx: 14.80,  costplus: 8.10,  retail: 94.00 },
      { label: "80mg · 30 tabs",  fairplay: 12.60, insurance: 36.00,  goodrx: 17.20,  costplus: 9.80,  retail: 112.00 },
    ]
  },
  {
    name: "Ozempic", category: "Diabetes / Weight", icon: "Rx",
    variants: [
      { label: "0.25–0.5mg · 1 pen", fairplay: 89.00,  insurance: 178.00, goodrx: 136.50, costplus: 82.00,  retail: 935.00 },
      { label: "1mg · 1 pen",         fairplay: 112.00, insurance: 210.00, goodrx: 158.00, costplus: 98.00,  retail: 988.00 },
      { label: "2mg · 1 pen",         fairplay: 134.00, insurance: 245.00, goodrx: 188.00, costplus: 118.00, retail: 1036.00 },
    ]
  },
  {
    name: "Semaglutide", category: "Diabetes / Weight", icon: "Rx",
    variants: [
      { label: "2.4mg/wk · 4 pens",  fairplay: 210.00, insurance: 420.00, goodrx: 320.00, costplus: 195.00, retail: 1349.00 },
      { label: "Oral 7mg · 30 tabs",  fairplay: 88.00,  insurance: 185.00, goodrx: 140.00, costplus: 79.00,  retail: 995.00 },
      { label: "Oral 14mg · 30 tabs", fairplay: 110.00, insurance: 220.00, goodrx: 168.00, costplus: 98.00,  retail: 1048.00 },
    ]
  },
  {
    name: "Adderall", category: "ADHD", icon: "Rx",
    variants: [
      { label: "10mg IR · 30 tabs",  fairplay: 28.40, insurance: 55.00,  goodrx: 42.00,  costplus: 24.50, retail: 178.00 },
      { label: "20mg IR · 30 tabs",  fairplay: 34.80, insurance: 65.00,  goodrx: 52.00,  costplus: 29.00, retail: 204.00 },
      { label: "30mg XR · 30 caps",  fairplay: 48.20, insurance: 88.00,  goodrx: 68.00,  costplus: 42.00, retail: 284.00 },
    ]
  },
  {
    name: "Lexapro", category: "Antidepressant", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 9.80,  insurance: 25.00, goodrx: 14.20, costplus: 7.90,  retail: 112.00 },
      { label: "10mg · 30 tabs",  fairplay: 11.40, insurance: 28.00, goodrx: 16.80, costplus: 9.20,  retail: 128.00 },
      { label: "20mg · 30 tabs",  fairplay: 14.60, insurance: 34.00, goodrx: 20.40, costplus: 11.80, retail: 148.00 },
    ]
  },
  {
    name: "Omeprazole", category: "Acid Reflux", icon: "Rx",
    variants: [
      { label: "20mg · 30 caps",  fairplay: 5.20,  insurance: 14.00, goodrx: 8.40,  costplus: 4.10,  retail: 26.00 },
      { label: "40mg · 30 caps",  fairplay: 7.80,  insurance: 18.00, goodrx: 11.20, costplus: 5.90,  retail: 38.00 },
      { label: "20mg · 90 caps",  fairplay: 11.40, insurance: 32.00, goodrx: 18.00, costplus: 9.20,  retail: 58.00 },
    ]
  },
  {
    name: "Sertraline", category: "Antidepressant", icon: "Rx",
    variants: [
      { label: "50mg · 30 tabs",  fairplay: 6.40,  insurance: 18.00, goodrx: 10.20, costplus: 5.10,  retail: 88.00 },
      { label: "100mg · 30 tabs", fairplay: 8.20,  insurance: 22.00, goodrx: 12.80, costplus: 6.40,  retail: 104.00 },
      { label: "50mg · 90 tabs",  fairplay: 14.80, insurance: 42.00, goodrx: 22.00, costplus: 11.50, retail: 198.00 },
    ]
  },
  {
    name: "Amlodipine", category: "Blood Pressure", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 4.20, insurance: 12.00, goodrx: 6.80,  costplus: 3.40, retail: 24.00 },
      { label: "10mg · 30 tabs",  fairplay: 5.80, insurance: 15.00, goodrx: 8.90,  costplus: 4.60, retail: 32.00 },
    ]
  },
  {
    name: "Gabapentin", category: "Nerve Pain / Epilepsy", icon: "Rx",
    variants: [
      { label: "100mg · 90 caps",  fairplay: 9.20,  insurance: 22.00, goodrx: 14.00, costplus: 7.40,  retail: 62.00 },
      { label: "300mg · 90 caps",  fairplay: 12.80, insurance: 28.00, goodrx: 18.40, costplus: 10.20, retail: 84.00 },
      { label: "600mg · 60 tabs",  fairplay: 16.40, insurance: 36.00, goodrx: 23.00, costplus: 13.00, retail: 108.00 },
    ]
  },
  {
    name: "Losartan", category: "Blood Pressure", icon: "Rx",
    variants: [
      { label: "25mg · 30 tabs",  fairplay: 5.60, insurance: 14.00, goodrx: 8.20,  costplus: 4.40, retail: 36.00 },
      { label: "50mg · 30 tabs",  fairplay: 6.80, insurance: 17.00, goodrx: 10.00, costplus: 5.40, retail: 44.00 },
      { label: "100mg · 30 tabs", fairplay: 8.40, insurance: 21.00, goodrx: 12.20, costplus: 6.60, retail: 54.00 },
    ]
  },
  {
    name: "Levothyroxine", category: "Thyroid", icon: "Rx",
    variants: [
      { label: "25mcg · 30 tabs",  fairplay: 6.20, insurance: 16.00, goodrx: 9.40,  costplus: 4.90, retail: 48.00 },
      { label: "50mcg · 30 tabs",  fairplay: 7.40, insurance: 18.00, goodrx: 11.00, costplus: 5.80, retail: 56.00 },
      { label: "100mcg · 30 tabs", fairplay: 8.80, insurance: 22.00, goodrx: 13.20, costplus: 7.00, retail: 68.00 },
    ]
  },
  {
    name: "Alprazolam", category: "Anxiety", icon: "Rx",
    variants: [
      { label: "0.25mg · 30 tabs", fairplay: 8.40,  insurance: 20.00, goodrx: 13.00, costplus: 6.80, retail: 72.00 },
      { label: "0.5mg · 30 tabs",  fairplay: 9.80,  insurance: 24.00, goodrx: 15.20, costplus: 7.90, retail: 84.00 },
      { label: "1mg · 30 tabs",    fairplay: 11.60, insurance: 28.00, goodrx: 17.80, costplus: 9.20, retail: 98.00 },
    ]
  },
  {
    name: "Bupropion", category: "Antidepressant / Smoking", icon: "Rx",
    variants: [
      { label: "150mg SR · 60 tabs", fairplay: 14.20, insurance: 32.00, goodrx: 20.80, costplus: 11.40, retail: 148.00 },
      { label: "300mg XL · 30 tabs", fairplay: 18.60, insurance: 42.00, goodrx: 26.40, costplus: 14.80, retail: 192.00 },
    ]
  },
  {
    name: "Pantoprazole", category: "Acid Reflux", icon: "Rx",
    variants: [
      { label: "20mg · 30 tabs",  fairplay: 6.80,  insurance: 16.00, goodrx: 10.40, costplus: 5.40,  retail: 44.00 },
      { label: "40mg · 30 tabs",  fairplay: 8.60,  insurance: 20.00, goodrx: 13.00, costplus: 6.80,  retail: 58.00 },
      { label: "40mg · 90 tabs",  fairplay: 18.40, insurance: 42.00, goodrx: 26.80, costplus: 14.60, retail: 128.00 },
    ]
  },
  {
    name: "Furosemide", category: "Diuretic / Heart", icon: "Rx",
    variants: [
      { label: "20mg · 30 tabs",  fairplay: 4.40, insurance: 12.00, goodrx: 7.20, costplus: 3.60, retail: 22.00 },
      { label: "40mg · 30 tabs",  fairplay: 5.20, insurance: 14.00, goodrx: 8.40, costplus: 4.20, retail: 28.00 },
    ]
  },
  {
    name: "Trazodone", category: "Sleep / Depression", icon: "Rx",
    variants: [
      { label: "50mg · 30 tabs",  fairplay: 7.20, insurance: 18.00, goodrx: 11.40, costplus: 5.80, retail: 64.00 },
      { label: "100mg · 30 tabs", fairplay: 9.40, insurance: 22.00, goodrx: 14.80, costplus: 7.60, retail: 82.00 },
    ]
  },
  {
    name: "Clopidogrel", category: "Blood Thinners", icon: "Rx",
    variants: [
      { label: "75mg · 30 tabs",  fairplay: 11.80, insurance: 26.00, goodrx: 17.20, costplus: 9.40,  retail: 98.00 },
      { label: "75mg · 90 tabs",  fairplay: 28.40, insurance: 60.00, goodrx: 40.00, costplus: 22.80, retail: 228.00 },
    ]
  },
  {
    name: "Rosuvastatin", category: "Cholesterol", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 8.80,  insurance: 22.00, goodrx: 13.20, costplus: 6.90,  retail: 72.00 },
      { label: "10mg · 30 tabs",  fairplay: 10.40, insurance: 26.00, goodrx: 15.80, costplus: 8.20,  retail: 86.00 },
      { label: "20mg · 30 tabs",  fairplay: 13.20, insurance: 32.00, goodrx: 19.40, costplus: 10.40, retail: 108.00 },
    ]
  },
  {
    name: "Amoxicillin", category: "Antibiotic", icon: "Rx",
    variants: [
      { label: "250mg · 21 caps",  fairplay: 5.80,  insurance: 15.00, goodrx: 9.20,  costplus: 4.60, retail: 32.00 },
      { label: "500mg · 21 caps",  fairplay: 7.40,  insurance: 18.00, goodrx: 11.80, costplus: 5.90, retail: 42.00 },
      { label: "875mg · 20 tabs",  fairplay: 9.20,  insurance: 22.00, goodrx: 14.40, costplus: 7.40, retail: 56.00 },
    ]
  },
  {
    name: "Doxycycline", category: "Antibiotic", icon: "Rx",
    variants: [
      { label: "100mg · 14 caps",  fairplay: 8.40,  insurance: 20.00, goodrx: 12.80, costplus: 6.80,  retail: 48.00 },
      { label: "100mg · 30 caps",  fairplay: 14.20, insurance: 32.00, goodrx: 21.00, costplus: 11.40, retail: 82.00 },
    ]
  },
  {
    name: "Montelukast", category: "Allergy / Asthma", icon: "Rx",
    variants: [
      { label: "10mg · 30 tabs",  fairplay: 7.80,  insurance: 20.00, goodrx: 12.40, costplus: 6.20,  retail: 88.00 },
      { label: "10mg · 90 tabs",  fairplay: 18.40, insurance: 44.00, goodrx: 28.00, costplus: 14.80, retail: 198.00 },
    ]
  },
  {
    name: "Duloxetine", category: "Antidepressant / Pain", icon: "Rx",
    variants: [
      { label: "20mg · 30 caps",  fairplay: 12.40, insurance: 28.00, goodrx: 18.80, costplus: 9.80,  retail: 128.00 },
      { label: "60mg · 30 caps",  fairplay: 16.80, insurance: 36.00, goodrx: 24.40, costplus: 13.40, retail: 164.00 },
      { label: "60mg · 90 caps",  fairplay: 38.40, insurance: 82.00, goodrx: 56.00, costplus: 30.80, retail: 368.00 },
    ]
  },
  {
    name: "Clonazepam", category: "Anxiety / Seizures", icon: "Rx",
    variants: [
      { label: "0.5mg · 30 tabs",  fairplay: 9.20,  insurance: 22.00, goodrx: 14.80, costplus: 7.40,  retail: 78.00 },
      { label: "1mg · 30 tabs",    fairplay: 10.80, insurance: 26.00, goodrx: 17.20, costplus: 8.60,  retail: 92.00 },
    ]
  },
  {
    name: "Citalopram", category: "Antidepressant", icon: "Rx",
    variants: [
      { label: "10mg · 30 tabs",  fairplay: 6.20, insurance: 16.00, goodrx: 10.00, costplus: 4.90, retail: 72.00 },
      { label: "20mg · 30 tabs",  fairplay: 7.80, insurance: 20.00, goodrx: 12.40, costplus: 6.20, retail: 86.00 },
      { label: "40mg · 30 tabs",  fairplay: 9.40, insurance: 24.00, goodrx: 14.80, costplus: 7.40, retail: 98.00 },
    ]
  },
  {
    name: "Metoprolol", category: "Blood Pressure / Heart", icon: "Rx",
    variants: [
      { label: "25mg · 30 tabs",  fairplay: 5.40, insurance: 14.00, goodrx: 8.60,  costplus: 4.30, retail: 38.00 },
      { label: "50mg · 30 tabs",  fairplay: 6.80, insurance: 17.00, goodrx: 10.40, costplus: 5.40, retail: 48.00 },
      { label: "100mg · 30 tabs", fairplay: 8.40, insurance: 21.00, goodrx: 12.80, costplus: 6.60, retail: 60.00 },
    ]
  },
  {
    name: "Fluoxetine", category: "Antidepressant", icon: "Rx",
    variants: [
      { label: "10mg · 30 caps",  fairplay: 5.80, insurance: 16.00, goodrx: 9.40,  costplus: 4.60, retail: 68.00 },
      { label: "20mg · 30 caps",  fairplay: 7.20, insurance: 20.00, goodrx: 11.80, costplus: 5.80, retail: 82.00 },
      { label: "40mg · 30 caps",  fairplay: 9.80, insurance: 26.00, goodrx: 15.20, costplus: 7.80, retail: 104.00 },
    ]
  },
  {
    name: "Cyclobenzaprine", category: "Muscle Relaxer", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 7.60, insurance: 18.00, goodrx: 12.00, costplus: 6.00, retail: 62.00 },
      { label: "10mg · 30 tabs",  fairplay: 9.20, insurance: 22.00, goodrx: 14.60, costplus: 7.40, retail: 78.00 },
    ]
  },
  {
    name: "Hydrochlorothiazide", category: "Blood Pressure / Diuretic", icon: "Rx",
    variants: [
      { label: "12.5mg · 30 tabs", fairplay: 3.80, insurance: 10.00, goodrx: 6.40, costplus: 3.00, retail: 18.00 },
      { label: "25mg · 30 tabs",   fairplay: 4.60, insurance: 12.00, goodrx: 7.80, costplus: 3.70, retail: 22.00 },
    ]
  },
  {
    name: "Prednisone", category: "Corticosteroid", icon: "Rx",
    variants: [
      { label: "5mg · 21 tabs (pack)",  fairplay: 6.40, insurance: 16.00, goodrx: 10.20, costplus: 5.10, retail: 38.00 },
      { label: "10mg · 30 tabs",        fairplay: 7.80, insurance: 20.00, goodrx: 12.40, costplus: 6.20, retail: 46.00 },
      { label: "20mg · 30 tabs",        fairplay: 9.20, insurance: 24.00, goodrx: 14.80, costplus: 7.40, retail: 56.00 },
    ]
  },
  {
    name: "Zolpidem", category: "Sleep Aid", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 8.40,  insurance: 20.00, goodrx: 13.20, costplus: 6.80,  retail: 82.00 },
      { label: "10mg · 30 tabs",  fairplay: 10.20, insurance: 24.00, goodrx: 15.80, costplus: 8.20,  retail: 98.00 },
    ]
  },
  {
    name: "Warfarin", category: "Blood Thinners", icon: "Rx",
    variants: [
      { label: "2mg · 30 tabs",   fairplay: 5.20, insurance: 14.00, goodrx: 8.40,  costplus: 4.20, retail: 34.00 },
      { label: "5mg · 30 tabs",   fairplay: 6.80, insurance: 17.00, goodrx: 10.60, costplus: 5.40, retail: 42.00 },
    ]
  },
  {
    name: "Tamsulosin", category: "Urology / BPH", icon: "Rx",
    variants: [
      { label: "0.4mg · 30 caps",  fairplay: 7.80,  insurance: 20.00, goodrx: 12.20, costplus: 6.20,  retail: 68.00 },
      { label: "0.4mg · 90 caps",  fairplay: 18.40, insurance: 44.00, goodrx: 27.80, costplus: 14.60, retail: 152.00 },
    ]
  },
  {
    name: "Methylphenidate", category: "ADHD", icon: "Rx",
    variants: [
      { label: "10mg IR · 30 tabs",  fairplay: 24.60, insurance: 48.00, goodrx: 36.80, costplus: 20.40, retail: 162.00 },
      { label: "20mg IR · 30 tabs",  fairplay: 30.40, insurance: 58.00, goodrx: 44.00, costplus: 25.60, retail: 192.00 },
      { label: "36mg XR · 30 tabs",  fairplay: 44.80, insurance: 82.00, goodrx: 62.00, costplus: 38.20, retail: 264.00 },
    ]
  },
  {
    name: "Carvedilol", category: "Heart Failure / BP", icon: "Rx",
    variants: [
      { label: "6.25mg · 60 tabs",  fairplay: 8.40,  insurance: 20.00, goodrx: 13.00, costplus: 6.80,  retail: 58.00 },
      { label: "12.5mg · 60 tabs",  fairplay: 10.60, insurance: 24.00, goodrx: 16.20, costplus: 8.40,  retail: 72.00 },
      { label: "25mg · 60 tabs",    fairplay: 13.20, insurance: 30.00, goodrx: 19.80, costplus: 10.60, retail: 88.00 },
    ]
  },
  {
    name: "Quetiapine", category: "Antipsychotic / Mood", icon: "Rx",
    variants: [
      { label: "25mg · 30 tabs",   fairplay: 12.40, insurance: 28.00, goodrx: 18.60, costplus: 9.80,  retail: 128.00 },
      { label: "100mg · 30 tabs",  fairplay: 18.80, insurance: 38.00, goodrx: 26.40, costplus: 14.80, retail: 182.00 },
      { label: "200mg · 30 tabs",  fairplay: 24.60, insurance: 48.00, goodrx: 34.80, costplus: 19.40, retail: 228.00 },
    ]
  },
  {
    name: "Aripiprazole", category: "Antipsychotic", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",    fairplay: 14.20, insurance: 32.00, goodrx: 21.40, costplus: 11.40, retail: 148.00 },
      { label: "10mg · 30 tabs",   fairplay: 18.60, insurance: 40.00, goodrx: 26.80, costplus: 14.80, retail: 188.00 },
      { label: "15mg · 30 tabs",   fairplay: 22.40, insurance: 48.00, goodrx: 32.00, costplus: 17.80, retail: 224.00 },
    ]
  },
  {
    name: "Venlafaxine", category: "Antidepressant / Anxiety", icon: "Rx",
    variants: [
      { label: "37.5mg · 30 caps",   fairplay: 10.80, insurance: 24.00, goodrx: 16.40, costplus: 8.60,  retail: 112.00 },
      { label: "75mg ER · 30 caps",  fairplay: 14.20, insurance: 30.00, goodrx: 20.80, costplus: 11.40, retail: 142.00 },
      { label: "150mg ER · 30 caps", fairplay: 18.40, insurance: 38.00, goodrx: 26.40, costplus: 14.80, retail: 178.00 },
    ]
  },
  {
    name: "Lisinopril-HCTZ", category: "Blood Pressure (Combo)", icon: "Rx",
    variants: [
      { label: "10/12.5mg · 30 tabs", fairplay: 7.20,  insurance: 18.00, goodrx: 11.20, costplus: 5.80,  retail: 52.00 },
      { label: "20/12.5mg · 30 tabs", fairplay: 8.60,  insurance: 22.00, goodrx: 13.00, costplus: 6.80,  retail: 64.00 },
      { label: "20/25mg · 30 tabs",   fairplay: 10.20, insurance: 26.00, goodrx: 15.40, costplus: 8.20,  retail: 76.00 },
    ]
  },
  {
    name: "Meloxicam", category: "Anti-Inflammatory (NSAID)", icon: "Rx",
    variants: [
      { label: "7.5mg · 30 tabs",   fairplay: 6.80, insurance: 16.00, goodrx: 10.60, costplus: 5.40, retail: 48.00 },
      { label: "15mg · 30 tabs",    fairplay: 8.40, insurance: 20.00, goodrx: 12.80, costplus: 6.60, retail: 58.00 },
    ]
  },
  {
    name: "Spironolactone", category: "Diuretic / Hormonal", icon: "Rx",
    variants: [
      { label: "25mg · 30 tabs",   fairplay: 7.40,  insurance: 18.00, goodrx: 11.40, costplus: 5.80,  retail: 54.00 },
      { label: "50mg · 30 tabs",   fairplay: 9.60,  insurance: 22.00, goodrx: 14.20, costplus: 7.60,  retail: 68.00 },
      { label: "100mg · 30 tabs",  fairplay: 13.20, insurance: 30.00, goodrx: 19.00, costplus: 10.40, retail: 92.00 },
    ]
  },
  {
    name: "Oxycodone", category: "Pain (Opioid)", icon: "Rx",
    variants: [
      { label: "5mg IR · 30 tabs",   fairplay: 22.40, insurance: 44.00, goodrx: 32.80, costplus: 18.40, retail: 148.00 },
      { label: "10mg IR · 30 tabs",  fairplay: 28.60, insurance: 58.00, goodrx: 42.00, costplus: 23.40, retail: 184.00 },
    ]
  },
  {
    name: "Tramadol", category: "Pain (Opioid-Like)", icon: "Rx",
    variants: [
      { label: "50mg · 30 tabs",   fairplay: 8.40,  insurance: 20.00, goodrx: 13.20, costplus: 6.80,  retail: 72.00 },
      { label: "100mg ER · 30 tabs", fairplay: 14.20, insurance: 32.00, goodrx: 21.00, costplus: 11.40, retail: 118.00 },
    ]
  },
  {
    name: "Insulin Glargine", category: "Diabetes (Insulin)", icon: "Rx",
    variants: [
      { label: "100u/mL · 1 vial",   fairplay: 35.00, insurance: 72.00, goodrx: 58.00, costplus: 29.00, retail: 316.00 },
      { label: "300u/mL · 3 pens",   fairplay: 88.00, insurance: 160.00, goodrx: 132.00, costplus: 75.00, retail: 480.00 },
    ]
  },
  {
    name: "Albuterol", category: "Asthma / COPD", icon: "💨",
    variants: [
      { label: "90mcg · 1 inhaler",    fairplay: 18.40, insurance: 38.00, goodrx: 28.00, costplus: 14.80, retail: 82.00 },
      { label: "Nebulizer 2.5mg/3mL · 25", fairplay: 12.60, insurance: 28.00, goodrx: 19.40, costplus: 10.20, retail: 58.00 },
    ]
  },
  {
    name: "Fluticasone", category: "Allergy / Asthma", icon: "💨",
    variants: [
      { label: "50mcg nasal spray",     fairplay: 12.20, insurance: 26.00, goodrx: 18.40, costplus: 9.80,  retail: 62.00 },
      { label: "110mcg · 1 inhaler",    fairplay: 28.40, insurance: 56.00, goodrx: 42.00, costplus: 22.80, retail: 148.00 },
    ]
  },
  {
    name: "Triamcinolone", category: "Corticosteroid", icon: "Rx",
    variants: [
      { label: "0.1% cream 15g",   fairplay: 6.40, insurance: 16.00, goodrx: 10.20, costplus: 5.10, retail: 38.00 },
      { label: "0.1% cream 80g",   fairplay: 12.80, insurance: 28.00, goodrx: 18.80, costplus: 10.20, retail: 74.00 },
    ]
  },
  {
    name: "Escitalopram", category: "Antidepressant", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",   fairplay: 8.40,  insurance: 20.00, goodrx: 13.00, costplus: 6.80,  retail: 88.00 },
      { label: "10mg · 30 tabs",  fairplay: 10.20, insurance: 24.00, goodrx: 15.60, costplus: 8.20,  retail: 108.00 },
      { label: "20mg · 30 tabs",  fairplay: 13.60, insurance: 30.00, goodrx: 20.00, costplus: 10.80, retail: 134.00 },
    ]
  },
  {
    name: "Linagliptin", category: "Diabetes (DPP-4)", icon: "Rx",
    variants: [
      { label: "5mg · 30 tabs",  fairplay: 88.00,  insurance: 168.00, goodrx: 128.00, costplus: 78.00,  retail: 624.00 },
      { label: "5mg · 90 tabs",  fairplay: 198.00, insurance: 380.00, goodrx: 286.00, costplus: 174.00, retail: 1380.00 },
    ]
  },
  {
    name: "Empagliflozin", category: "Diabetes (SGLT2)", icon: "Rx",
    variants: [
      { label: "10mg · 30 tabs",  fairplay: 94.00,  insurance: 180.00, goodrx: 138.00, costplus: 84.00,  retail: 680.00 },
      { label: "25mg · 30 tabs",  fairplay: 112.00, insurance: 210.00, goodrx: 162.00, costplus: 98.00,  retail: 720.00 },
    ]
  },
  {
    name: "Celecoxib", category: "Anti-Inflammatory", icon: "Rx",
    variants: [
      { label: "100mg · 60 caps",  fairplay: 14.60, insurance: 32.00, goodrx: 22.00, costplus: 11.60, retail: 128.00 },
      { label: "200mg · 30 caps",  fairplay: 12.40, insurance: 28.00, goodrx: 18.60, costplus: 9.80,  retail: 108.00 },
    ]
  },
  {
    name: "Topiramate", category: "Epilepsy / Migraine", icon: "Rx",
    variants: [
      { label: "25mg · 60 tabs",   fairplay: 9.80,  insurance: 22.00, goodrx: 14.80, costplus: 7.80,  retail: 82.00 },
      { label: "100mg · 60 tabs",  fairplay: 18.40, insurance: 38.00, goodrx: 26.40, costplus: 14.60, retail: 148.00 },
    ]
  },
];

/* ─── UTILS ──────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => '$' + Number(n).toFixed(2);

function showToast(msg, type = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

function showWalletComingSoon() {
  const overlay = document.createElement('div');
  overlay.className = 'wallet-modal-overlay';
  overlay.innerHTML = `
    <div class="wallet-modal-box">
      <div class="wallet-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
          <rect x="2" y="6" width="20" height="14" rx="2.5" stroke="#00C896" stroke-width="1.6"/>
          <path d="M2 11h20" stroke="#00C896" stroke-width="1.6"/>
          <path d="M6 15.5h3" stroke="#00C896" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="wallet-modal-title">VITAL Intelligence</div>
      <div class="wallet-modal-msg">Wallet integration coming in v2.0.</div>
      <button class="btn-primary" onclick="this.closest('.wallet-modal-overlay').remove()">Got It</button>
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function loadState() {
  try {
    const u = localStorage.getItem('fp_user');
    const v = localStorage.getItem('fp_vault');
    const c = localStorage.getItem('fp_cabinet');
    if (u) State.user = JSON.parse(u);
    if (v) State.vault = JSON.parse(v);
    if (c) State.cabinet = JSON.parse(c);
  } catch(e) {}
}

const saveUser    = () => localStorage.setItem('fp_user',    JSON.stringify(State.user));
const saveVault   = () => localStorage.setItem('fp_vault',   JSON.stringify(State.vault));
const saveCabinet = () => localStorage.setItem('fp_cabinet', JSON.stringify(State.cabinet));

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════ */
function navigateTo(pageId) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${pageId}`);
  if (target) target.classList.add('active');

  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  $$('[data-sidebar-link]').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === 'cabinet') renderCabinet();
  if (pageId === 'vault')   renderVault();
  if (pageId === 'card')    renderCard();
  if (pageId === 'admin')   initAdmin();
  if (pageId === 'search')  showBrowseCatalog();
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebarOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('menu-open');
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebarOverlay').classList.remove('active');
  document.body.style.overflow = '';
  document.body.classList.remove('menu-open');
}

/* ═══════════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════════ */
function openAuthModal(mode = 'signin') {
  $('authModalOverlay').classList.add('open');
  mode === 'register' ? showRegView() : showSignInView();
}

function closeAuthModal() {
  $('authModalOverlay').classList.remove('open');
}

function showSignInView() {
  $('authSignInView').style.display = 'block';
  $('authRegisterView').style.display = 'none';
  $('authAdminCodeView').style.display = 'none';
  $('signInError').style.display = 'none';
}

function showAdminCodeView() {
  $('authSignInView').style.display = 'none';
  $('authRegisterView').style.display = 'none';
  $('authAdminCodeView').style.display = 'block';
  $('authAdminCode').value = '';
  $('authAdminCodeError').style.display = 'none';
  setTimeout(() => $('authAdminCode').focus(), 100);
}

function doAdminCodeVerify() {
  const code = $('authAdminCode').value.trim();
  if (code === 'ADMIN888') {
    State.adminLoggedIn = true;
    State.user = { name: 'admin', email: 'admin@vital.com', avatar: 'A' };
    saveUser();
    closeAuthModal();
    updateAuthUI();
    updateAdminSidebarVisibility();
    showToast('Welcome to the Partner Portal, Admin. 🔐');
  } else {
    $('authAdminCodeError').style.display = 'block';
    $('authAdminCode').value = '';
    $('authAdminCode').focus();
  }
}

function showRegView() {
  $('authSignInView').style.display = 'none';
  $('authRegisterView').style.display = 'block';
  goToOnboardStep(1);
}

function goToOnboardStep(step) {
  State.onboardStep = step;
  $$('.onboard-panel').forEach(p => p.classList.remove('active'));
  $(`onboardStep${step}`).classList.add('active');
  $$('.onboard-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n === step) s.classList.add('active');
    if (n < step)  s.classList.add('done');
  });
}

function doSignIn(email, password) {
  const e = email.trim().toLowerCase();
  const p = password.trim();
  if (!e.includes('@') || p.length < 3) {
    $('signInError').style.display = 'block';
    return;
  }
  // Admin credential detection — route to access code step (no code shown to other users)
  if (e === 'admin@vital.com' && p === 'ADMIN2026888') {
    showAdminCodeView();
    return;
  }
  // Regular sign-in
  const name = State.vault['vf-name'] || e.split('@')[0];
  State.user = { name, email: e, avatar: name[0].toUpperCase() };
  saveUser();
  closeAuthModal();
  updateAuthUI();
  showToast(`Welcome back, ${name.split(' ')[0]}!`);
}

function doRegister() {
  const name  = $('reg-name').value.trim();
  const email = $('reg-email').value.trim().toLowerCase();
  const pass  = $('reg-pass').value.trim();

  if (!name || !email.includes('@') || pass.length < 8) {
    showToast('Please complete all required fields (password min 8 chars).', 'error');
    return;
  }

  // Sync onboarding data to vault
  ['name','dob','carrier','member','group','bin','pcn','doctor','zip'].forEach(k => {
    const el = $(`reg-${k}`);
    if (el && el.value) State.vault[`vf-${k}`] = el.value;
  });
  saveVault();

  State.user = { name, email, avatar: name[0].toUpperCase() };
  saveUser();
  closeAuthModal();
  updateAuthUI();
  showToast(`Account created! Welcome, ${name.split(' ')[0]}.`);
}

function signOut() {
  State.user = null;
  localStorage.removeItem('fp_user');
  updateAuthUI();
  navigateTo('home');
  showToast('You have been signed out.');
}

function updateAuthUI() {
  const loggedIn = !!State.user;
  $('btnSignIn').style.display = loggedIn ? 'none' : 'inline-flex';
  $('btnJoin').textContent = loggedIn ? 'My Account' : 'Get Started';

  const su = $('sidebarUser');
  const signInRow = $('sidebarSignInRow');
  if (loggedIn) {
    su.style.display = 'flex';
    if (signInRow) signInRow.style.display = 'none';
    $('sidebarAvatar').textContent = State.user.avatar;
    $('sidebarUsername').textContent = State.user.name;
    $('sidebarEmail').textContent = State.user.email;
  } else {
    su.style.display = 'none';
    if (signInRow) signInRow.style.display = 'block';
  }
  // Private sidebar links — only visible when logged in
  const cabinetLink = $('cabinetSidebarLink');
  const profileLink = $('profileSidebarLink');
  const accountSection = $('accountSidebarSection');
  const navProfile = $('navMyProfile');
  if (cabinetLink) cabinetLink.style.display = loggedIn ? '' : 'none';
  if (profileLink) profileLink.style.display = loggedIn ? '' : 'none';
  if (accountSection) accountSection.style.display = loggedIn ? '' : 'none';
  if (navProfile) navProfile.style.display = loggedIn ? '' : 'none';
}

function updateAdminSidebarVisibility() {
  const show = !!State.adminLoggedIn;
  const sec  = $('adminSidebarSection');
  const link = $('adminSidebarLink');
  if (sec)  sec.style.display  = show ? '' : 'none';
  if (link) link.style.display = show ? '' : 'none';
}

/* ═══════════════════════════════════════════════════════════════
   GOLDEN RECORD — INSURANCE ROUTING
═══════════════════════════════════════════════════════════════ */
function getInsuranceRecord() {
  return {
    carrier:  State.vault['vf-carrier']  || null,
    member:   State.vault['vf-member']   || null,
    group:    State.vault['vf-group']    || null,
    bin:      State.vault['vf-bin']      || '610524',
    pcn:      State.vault['vf-pcn']      || 'FPLAY',
    plan:     State.vault['vf-plan']     || null,
  };
}

function updateInsuranceNotice() {
  const el = $('insuranceNoticeText');
  if (!el) return;
  const ins = getInsuranceRecord();
  if (State.user && ins.carrier) {
    el.innerHTML = `Showing estimated co-pay for <strong>${ins.carrier}</strong>. <a href="#" data-page="vault">Update in Vault</a>.`;
  } else if (State.user) {
    el.innerHTML = `No insurance on file. <a href="#" data-page="vault">Add in Security Vault</a> for personalized estimates.`;
  } else {
    el.innerHTML = `Showing national average insurance co-pay. <a href="#" data-page="vault">Add your insurance</a> for personalized estimates.`;
  }
  el.querySelectorAll('[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigateTo(a.dataset.page); });
  });
}

/* ═══════════════════════════════════════════════════════════════
   VAULT
═══════════════════════════════════════════════════════════════ */
function renderVault() {
  const loggedIn = !!State.user;
  $('vaultAuthGate').style.display = loggedIn ? 'none' : 'block';
  $('vaultContent').style.display  = loggedIn ? 'block' : 'none';
  if (!loggedIn) return;

  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => {
    const el = $(id);
    if (el) el.value = State.vault[id] || '';
  });
  $('secureEditToggle').checked = false;
  setVaultLocked(true);
}

function setVaultLocked(locked) {
  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => { const el = $(id); if (el) el.disabled = locked; });

  const dot = document.querySelector('.vault-status-dot');
  const txt = $('vaultStatusText');
  if (locked) {
    dot.className = 'vault-status-dot locked';
    txt.textContent = 'Vault Locked';
  } else {
    dot.className = 'vault-status-dot unlocked';
    txt.textContent = 'Edit Mode Active';
  }
  $('vaultActions').style.display = locked ? 'none' : 'flex';
}

function saveVaultData() {
  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => { const el = $(id); if (el) State.vault[id] = el.value; });
  saveVault();

  if (State.user && State.vault['vf-name']) {
    State.user.name   = State.vault['vf-name'];
    State.user.avatar = State.vault['vf-name'][0].toUpperCase();
    saveUser();
    updateAuthUI();
  }

  const overlay = $('vaultLockOverlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
    $('secureEditToggle').checked = false;
    setVaultLocked(true);
    document.querySelector('.vault-status-dot').className = 'vault-status-dot saved';
    $('vaultStatusText').textContent = 'Vault Secured';
    showToast('Vault Data Encrypted & Stored');
    updateInsuranceNotice();
    renderCard();
  }, 2000);
}

/* ═══════════════════════════════════════════════════════════════
   DIGITAL CARD — pulls live from vault
═══════════════════════════════════════════════════════════════ */
function renderCard() {
  const ins  = getInsuranceRecord();
  const name = State.vault['vf-name'] || (State.user && State.user.name) || 'MEMBER NAME';

  $('cardMemberName').textContent = name.toUpperCase();
  $('cardBIN').textContent   = ins.bin;
  $('cardPCN').textContent   = ins.pcn;
  $('cardGroup').textContent = ins.group || 'FP2026';
  $('cardMemberID').textContent = ins.member || '—';

  $('cardInsuranceCarrier').textContent = ins.carrier
    ? `${ins.carrier} · Member ID: ${ins.member || '—'}`
    : 'None — add in Security Vault for personalized estimates';
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH ENGINE
═══════════════════════════════════════════════════════════════ */
function initSearch() {
  // Populate popular tags
  const popularNames = ['Metformin','Ozempic','Lisinopril','Adderall','Atorvastatin','Lexapro','Gabapentin','Sertraline'];
  const popCont = $('popularTagsSearch');
  if (popCont) {
    popularNames.forEach(name => {
      const tag = document.createElement('span');
      tag.className = 'hero-tag';
      tag.textContent = name;
      tag.addEventListener('click', () => { navigateTo('search'); setTimeout(() => triggerSearch(name), 100); });
      popCont.appendChild(tag);
    });
  }

  // Hero quick-tags
  $$('.hero-tag[data-search]').forEach(tag => {
    tag.addEventListener('click', () => {
      navigateTo('search');
      setTimeout(() => triggerSearch(tag.dataset.search), 150);
    });
  });

  // Health condition cards
  $$('.health-condition-card[data-condition]').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo('search');
      setTimeout(() => triggerSearch(card.dataset.condition), 150);
    });
  });

  // Hero search box
  setupSearchBox($('heroSearchInput'), $('heroSearchDropdown'), $('heroSearchClear'), 'hero');

  // Page search box
  setupSearchBox($('pageSearchInput'), $('pageSearchDropdown'), $('pageSearchClear'), 'page');

  // Drawer search box
  setupDrawerSearch();
}

function setupSearchBox(input, dropdown, clearBtn, context) {
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
    if (q.length < 1) { dropdown.classList.remove('open'); return; }
    const results = DRUGS.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.category.toLowerCase().includes(q.toLowerCase()));
    renderDropdown(dropdown, results, context, input);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.classList.remove('open');
      if (context === 'page') resetSearchPage();
    });
  }

  document.addEventListener('click', e => {
    const wrap = input.closest('.hero-search-wrap, .search-page-wrap, .page-hero-small');
    if (wrap && !wrap.contains(e.target)) dropdown.classList.remove('open');
  });
}

function renderDropdown(dropdown, results, context, input) {
  if (!results.length) {
    dropdown.innerHTML = `<div class="dropdown-item" style="justify-content:center;color:var(--text-muted);font-size:13px;cursor:default">No results found</div>`;
  } else {
    dropdown.innerHTML = results.slice(0, 8).map(d => `
      <div class="dropdown-item" data-name="${d.name}">
        <div>
          <div class="dropdown-drug-name">${d.name}</div>
          <div class="dropdown-drug-cat">${d.category}</div>
        </div>
        <div class="dropdown-drug-price">from ${fmt(Math.min(...d.variants.map(v => v.fairplay)))}</div>
      </div>
    `).join('');

    dropdown.querySelectorAll('.dropdown-item[data-name]').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.dataset.name;
        input.value = name;
        dropdown.classList.remove('open');
        if (context === 'hero') {
          navigateTo('search');
          setTimeout(() => triggerSearch(name), 150);
        } else {
          triggerSearch(name);
        }
      });
    });
  }
  dropdown.classList.add('open');
}

function showSearchSkeletons() {
  hideBrowseCatalog();
  $('searchResultsPanel').style.display = 'block';
  $('searchEmptyState').style.display   = 'none';
  $('resultsTitle').textContent = 'Loading…';
  $('variantSelector').innerHTML = [1,2,3].map(() =>
    `<div class="skeleton skeleton-variant-btn"></div>`
  ).join('');
  $('priceComparisonGrid').innerHTML = [1,2,3,4,5].map(() => `
    <div class="price-card">
      <div class="skeleton skeleton-source-bar"></div>
      <div class="skeleton skeleton-amount-bar"></div>
      <div class="skeleton skeleton-unit-bar"></div>
      <div class="skeleton skeleton-action-bar"></div>
    </div>
  `).join('');
}

function triggerSearch(name) {
  const drug = DRUGS.find(d => d.name.toLowerCase() === name.toLowerCase());
  if (!drug) return;

  State.currentDrug    = drug;
  State.currentVariant = drug.variants[0];

  const pi = $('pageSearchInput');
  if (pi) { pi.value = drug.name; $('pageSearchClear').style.display = 'block'; }

  hideCardFlip();
  showSearchSkeletons();
  setTimeout(() => renderSearchResults(drug), 700);
}

function renderSearchResults(drug) {
  $('searchResultsPanel').style.display = 'block';
  $('searchEmptyState').style.display   = 'none';
  $('resultsTitle').textContent = `${drug.name} — Price Comparison`;

  // Variant selector
  const vs = $('variantSelector');
  vs.innerHTML = drug.variants.map((v, i) => `
    <button class="variant-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${v.label}</button>
  `).join('');

  vs.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      vs.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentVariant = drug.variants[parseInt(btn.dataset.index)];
      hideCardFlip();
      renderPriceCards(State.currentVariant, drug.name);
    });
  });

  renderPriceCards(drug.variants[0], drug.name);
  updateInsuranceNotice();
}

/* ─── Direct deep-links per drug: GoodRx and Cost Plus ─────── */
const DRUG_LINKS = {
  'Metformin':          { goodrx: 'https://www.goodrx.com/metformin',        costplus: 'https://costplusdrugs.com/medications/metformin-hcl-tablet/' },
  'Lisinopril':         { goodrx: 'https://www.goodrx.com/lisinopril',       costplus: 'https://costplusdrugs.com/medications/lisinopril-tablet/' },
  'Atorvastatin':       { goodrx: 'https://www.goodrx.com/atorvastatin',     costplus: 'https://costplusdrugs.com/medications/atorvastatin-tablet/' },
  'Ozempic':            { goodrx: 'https://www.goodrx.com/ozempic',          costplus: 'https://costplusdrugs.com' },
  'Semaglutide':        { goodrx: 'https://www.goodrx.com/semaglutide',      costplus: 'https://costplusdrugs.com' },
  'Tirzepatide':        { goodrx: 'https://www.goodrx.com/tirzepatide',      costplus: 'https://costplusdrugs.com' },
  'Adderall':           { goodrx: 'https://www.goodrx.com/adderall',         costplus: 'https://costplusdrugs.com/medications/amphetamine-salt-combo-tablet/' },
  'Lexapro':            { goodrx: 'https://www.goodrx.com/lexapro',          costplus: 'https://costplusdrugs.com/medications/escitalopram-tablet/' },
  'Omeprazole':         { goodrx: 'https://www.goodrx.com/omeprazole',       costplus: 'https://costplusdrugs.com/medications/omeprazole-capsule/' },
  'Sertraline':         { goodrx: 'https://www.goodrx.com/sertraline',       costplus: 'https://costplusdrugs.com/medications/sertraline-tablet/' },
  'Amlodipine':         { goodrx: 'https://www.goodrx.com/amlodipine',       costplus: 'https://costplusdrugs.com/medications/amlodipine-tablet/' },
  'Gabapentin':         { goodrx: 'https://www.goodrx.com/gabapentin',       costplus: 'https://costplusdrugs.com/medications/gabapentin-capsule/' },
  'Losartan':           { goodrx: 'https://www.goodrx.com/losartan',         costplus: 'https://costplusdrugs.com/medications/losartan-tablet/' },
  'Levothyroxine':      { goodrx: 'https://www.goodrx.com/levothyroxine',    costplus: 'https://costplusdrugs.com/medications/levothyroxine-tablet/' },
  'Alprazolam':         { goodrx: 'https://www.goodrx.com/alprazolam',       costplus: 'https://costplusdrugs.com/medications/alprazolam-tablet/' },
  'Bupropion':          { goodrx: 'https://www.goodrx.com/bupropion',        costplus: 'https://costplusdrugs.com/medications/bupropion-tablet/' },
  'Pantoprazole':       { goodrx: 'https://www.goodrx.com/pantoprazole',     costplus: 'https://costplusdrugs.com/medications/pantoprazole-sodium-tablet/' },
  'Furosemide':         { goodrx: 'https://www.goodrx.com/furosemide',       costplus: 'https://costplusdrugs.com/medications/furosemide-tablet/' },
  'Trazodone':          { goodrx: 'https://www.goodrx.com/trazodone',        costplus: 'https://costplusdrugs.com/medications/trazodone-tablet/' },
  'Clopidogrel':        { goodrx: 'https://www.goodrx.com/clopidogrel',      costplus: 'https://costplusdrugs.com/medications/clopidogrel-tablet/' },
  'Rosuvastatin':       { goodrx: 'https://www.goodrx.com/rosuvastatin',     costplus: 'https://costplusdrugs.com/medications/rosuvastatin-tablet/' },
  'Amoxicillin':        { goodrx: 'https://www.goodrx.com/amoxicillin',      costplus: 'https://costplusdrugs.com/medications/amoxicillin-capsule/' },
  'Doxycycline':        { goodrx: 'https://www.goodrx.com/doxycycline',      costplus: 'https://costplusdrugs.com/medications/doxycycline-hyclate-capsule/' },
  'Montelukast':        { goodrx: 'https://www.goodrx.com/montelukast',      costplus: 'https://costplusdrugs.com/medications/montelukast-tablet/' },
  'Duloxetine':         { goodrx: 'https://www.goodrx.com/duloxetine',       costplus: 'https://costplusdrugs.com/medications/duloxetine-capsule/' },
  'Clonazepam':         { goodrx: 'https://www.goodrx.com/clonazepam',       costplus: 'https://costplusdrugs.com/medications/clonazepam-tablet/' },
  'Citalopram':         { goodrx: 'https://www.goodrx.com/citalopram',       costplus: 'https://costplusdrugs.com/medications/citalopram-tablet/' },
  'Metoprolol':         { goodrx: 'https://www.goodrx.com/metoprolol',       costplus: 'https://costplusdrugs.com/medications/metoprolol-tartrate-tablet/' },
  'Fluoxetine':         { goodrx: 'https://www.goodrx.com/fluoxetine',       costplus: 'https://costplusdrugs.com/medications/fluoxetine-capsule/' },
  'Cyclobenzaprine':    { goodrx: 'https://www.goodrx.com/cyclobenzaprine',  costplus: 'https://costplusdrugs.com/medications/cyclobenzaprine-tablet/' },
  'Hydrochlorothiazide':{ goodrx: 'https://www.goodrx.com/hydrochlorothiazide', costplus: 'https://costplusdrugs.com/medications/hydrochlorothiazide-tablet/' },
  'Prednisone':         { goodrx: 'https://www.goodrx.com/prednisone',       costplus: 'https://costplusdrugs.com/medications/prednisone-tablet/' },
  'Zolpidem':           { goodrx: 'https://www.goodrx.com/zolpidem',         costplus: 'https://costplusdrugs.com/medications/zolpidem-tablet/' },
  'Warfarin':           { goodrx: 'https://www.goodrx.com/warfarin',         costplus: 'https://costplusdrugs.com/medications/warfarin-tablet/' },
  'Tamsulosin':         { goodrx: 'https://www.goodrx.com/tamsulosin',       costplus: 'https://costplusdrugs.com/medications/tamsulosin-capsule/' },
  'Methylphenidate':    { goodrx: 'https://www.goodrx.com/methylphenidate',  costplus: 'https://costplusdrugs.com/medications/methylphenidate-tablet/' },
  'Carvedilol':         { goodrx: 'https://www.goodrx.com/carvedilol',       costplus: 'https://costplusdrugs.com/medications/carvedilol-tablet/' },
  'Quetiapine':         { goodrx: 'https://www.goodrx.com/quetiapine',       costplus: 'https://costplusdrugs.com/medications/quetiapine-tablet/' },
  'Aripiprazole':       { goodrx: 'https://www.goodrx.com/aripiprazole',     costplus: 'https://costplusdrugs.com/medications/aripiprazole-tablet/' },
  'Venlafaxine':        { goodrx: 'https://www.goodrx.com/venlafaxine',      costplus: 'https://costplusdrugs.com/medications/venlafaxine-capsule/' },
  'Lisinopril-HCTZ':    { goodrx: 'https://www.goodrx.com/lisinopril-hydrochlorothiazide', costplus: 'https://costplusdrugs.com/medications/lisinopril-hctz-tablet/' },
  'Meloxicam':          { goodrx: 'https://www.goodrx.com/meloxicam',        costplus: 'https://costplusdrugs.com/medications/meloxicam-tablet/' },
  'Spironolactone':     { goodrx: 'https://www.goodrx.com/spironolactone',   costplus: 'https://costplusdrugs.com/medications/spironolactone-tablet/' },
  'Oxycodone':          { goodrx: 'https://www.goodrx.com/oxycodone',        costplus: 'https://costplusdrugs.com' },
  'Tramadol':           { goodrx: 'https://www.goodrx.com/tramadol',         costplus: 'https://costplusdrugs.com/medications/tramadol-tablet/' },
  'Insulin Glargine':   { goodrx: 'https://www.goodrx.com/insulin-glargine', costplus: 'https://costplusdrugs.com/medications/insulin-glargine-vial/' },
  'Albuterol':          { goodrx: 'https://www.goodrx.com/albuterol',        costplus: 'https://costplusdrugs.com/medications/albuterol-sulfate-hfa-inhaler/' },
  'Fluticasone':        { goodrx: 'https://www.goodrx.com/fluticasone',      costplus: 'https://costplusdrugs.com/medications/fluticasone-propionate-nasal-spray/' },
  'Triamcinolone':      { goodrx: 'https://www.goodrx.com/triamcinolone',    costplus: 'https://costplusdrugs.com/medications/triamcinolone-acetonide-cream/' },
  'Escitalopram':       { goodrx: 'https://www.goodrx.com/escitalopram',     costplus: 'https://costplusdrugs.com/medications/escitalopram-tablet/' },
  'Linagliptin':        { goodrx: 'https://www.goodrx.com/linagliptin',      costplus: 'https://costplusdrugs.com' },
  'Empagliflozin':      { goodrx: 'https://www.goodrx.com/empagliflozin',    costplus: 'https://costplusdrugs.com' },
  'Celecoxib':          { goodrx: 'https://www.goodrx.com/celecoxib',        costplus: 'https://costplusdrugs.com/medications/celecoxib-capsule/' },
  'Topiramate':         { goodrx: 'https://www.goodrx.com/topiramate',       costplus: 'https://costplusdrugs.com/medications/topiramate-tablet/' },
};

function renderPriceCards(variant, drugName) {
  const links = DRUG_LINKS[drugName] || {};

  const zip = ($('heroZipInput') || $('pageZipInput') || {}).value || '32256';
  const pharmTag = PHARMACY_TAGS[Math.floor(Math.random() * PHARMACY_TAGS.length)];
  const prices = [
    { id: 'fp',  source: 'Direct Cash Price',   amount: variant.fairplay, action: 'Use This Card',    isFP: true,  link: null },
    { id: 'grx', source: 'Third-Party · GoodRx', amount: variant.goodrx,  action: 'View on GoodRx',   isFP: false, link: links.goodrx  || 'https://www.goodrx.com/' + encodeURIComponent(drugName.toLowerCase()) },
    { id: 'cp',  source: 'Third-Party · Cost Plus', amount: variant.costplus, action: 'View on Cost Plus', isFP: false, link: links.costplus || 'https://costplusdrugs.com' },
    { id: 'ret', source: 'Retail Cash Baseline', amount: variant.retail,  action: 'Standard Retail',   isFP: false, link: null },
  ];

  const bestAmount = Math.min(...prices.map(p => p.amount));

  $('priceComparisonGrid').innerHTML = prices.map(p => {
    const isBest = p.amount === bestAmount;
    return `
      <div class="price-card ${isBest ? 'best-price' : ''}">
        ${isBest ? '<div class="price-card-badge">Lowest Price</div>' : ''}
        <div class="price-source">${p.source}</div>
        <div class="price-amount">${fmt(p.amount)}</div>
        <div class="price-per-unit">${variant.label}</div>
        <button class="price-action"
          data-source-id="${p.id}"
          data-source-label="${p.source}"
          data-price="${p.amount}"
          data-drug="${drugName}"
          data-variant="${variant.label}"
          data-retail="${variant.retail}"
          ${p.link ? `data-link="${p.link}"` : ''}
        >${p.action}</button>
        ${p.isFP ? `<button class="btn-save-to-phone" onclick="showWalletComingSoon()">
          <svg viewBox="0 0 20 20" fill="none" width="13" height="13"><rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M3 9h14" stroke="currentColor" stroke-width="1.4"/><path d="M7 13h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Save to Phone
        </button>` : ''}
      </div>
    `;
  }).join('');

  // Bind price action buttons
  $$('#priceComparisonGrid .price-action').forEach(btn => {
    btn.addEventListener('click', () => handlePriceAction(btn));
  });

  // Savings note
  const saved = variant.retail - bestAmount;
  const existing = $('priceComparisonGrid').nextElementSibling;
  if (existing && existing.classList.contains('savings-note')) existing.remove();
  if (saved > 1) {
    const note = document.createElement('div');
    note.className = 'detail-callout savings-note';
    note.style.marginBottom = '24px';
    note.innerHTML = `<strong>💰 Potential Savings:</strong> The lowest price saves you <strong style="color:var(--mint)">${fmt(saved)}</strong> vs. retail cash price for ${drugName}.`;
    $('priceComparisonGrid').after(note);
  }
}

/* ═══════════════════════════════════════════════════════════════
   LIVE PRICING MATRIX — Home page 3-column ledger
═══════════════════════════════════════════════════════════════ */
function renderPricingMatrix() {
  const container = $('pricingMatrix');
  if (!container) return;

  const zip = ($('heroZipInput') || {}).value || '32256';

  container.innerHTML = TRENDING_MATRIX.map((item, i) => {
    const tag = PHARMACY_TAGS[i % PHARMACY_TAGS.length];
    const savings = item.retail - item.rate;
    const pct = Math.round((savings / item.retail) * 100);
    return `
      <div class="pm-row" onclick="navigateTo('search'); setTimeout(() => triggerSearch('${item.drug}'), 120);">
        <div>
          <div class="pm-drug-name">${item.drug}</div>
          <div class="pm-drug-meta">${item.variant}</div>
        </div>
        <div class="pm-retail">$${item.retail.toFixed(2)}</div>
        <div class="pm-rate-cell">
          <div class="pm-rate-badge">
            <span class="pm-rate-price">$${item.rate.toFixed(2)}</span>
            <span class="pm-pharmacy-tag">${tag}</span>
          </div>
          <span class="pm-savings-pill">Save ${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════
   DRUG MANUFACTURER LOOKUP
   Each drug maps to the actual company that makes it.
═══════════════════════════════════════════════════════════════ */
const DRUG_MFR = {
  'Metformin':            'Various Generic Manufacturers',
  'Lisinopril':           'Various Generic Manufacturers',
  'Atorvastatin':         'Various Generic Manufacturers (brand: Lipitor® by Pfizer)',
  'Ozempic':              'Novo Nordisk A/S',
  'Semaglutide':          'Novo Nordisk A/S',
  'Tirzepatide':          'Eli Lilly and Company (Mounjaro® / Zepbound®)',
  'Adderall':             'Teva Pharmaceuticals / Shire',
  'Lexapro':              'Various Generic Manufacturers (brand: Lexapro® by Allergan)',
  'Omeprazole':           'Various Generic Manufacturers (brand: Prilosec® by AstraZeneca)',
  'Sertraline':           'Various Generic Manufacturers (brand: Zoloft® by Pfizer)',
  'Amlodipine':           'Various Generic Manufacturers (brand: Norvasc® by Pfizer)',
  'Gabapentin':           'Various Generic Manufacturers (brand: Neurontin® by Pfizer)',
  'Losartan':             'Various Generic Manufacturers (brand: Cozaar® by Merck)',
  'Levothyroxine':        'Various Generic Manufacturers (brand: Synthroid® by AbbVie)',
  'Alprazolam':           'Various Generic Manufacturers (brand: Xanax® by Pfizer)',
  'Bupropion':            'Various Generic Manufacturers (brand: Wellbutrin® by GSK)',
  'Pantoprazole':         'Various Generic Manufacturers (brand: Protonix® by Pfizer)',
  'Furosemide':           'Various Generic Manufacturers (brand: Lasix® by Sanofi)',
  'Trazodone':            'Various Generic Manufacturers',
  'Clopidogrel':          'Various Generic Manufacturers (brand: Plavix® by Sanofi/BMS)',
  'Rosuvastatin':         'Various Generic Manufacturers (brand: Crestor® by AstraZeneca)',
  'Amoxicillin':          'Various Generic Manufacturers',
  'Doxycycline':          'Various Generic Manufacturers',
  'Montelukast':          'Various Generic Manufacturers (brand: Singulair® by Merck)',
  'Duloxetine':           'Various Generic Manufacturers (brand: Cymbalta® by Eli Lilly)',
  'Clonazepam':           'Various Generic Manufacturers (brand: Klonopin® by Roche)',
  'Citalopram':           'Various Generic Manufacturers (brand: Celexa® by Allergan)',
  'Metoprolol':           'Various Generic Manufacturers (brand: Lopressor® by Novartis)',
  'Fluoxetine':           'Various Generic Manufacturers (brand: Prozac® by Eli Lilly)',
  'Cyclobenzaprine':      'Various Generic Manufacturers',
  'Hydrochlorothiazide':  'Various Generic Manufacturers',
  'Prednisone':           'Various Generic Manufacturers',
  'Zolpidem':             'Various Generic Manufacturers (brand: Ambien® by Sanofi)',
  'Warfarin':             'Various Generic Manufacturers (brand: Coumadin® by BMS)',
  'Tamsulosin':           'Various Generic Manufacturers (brand: Flomax® by Boehringer Ingelheim)',
  'Methylphenidate':      'Various Generic Manufacturers (brand: Ritalin® by Novartis)',
  'Carvedilol':           'Various Generic Manufacturers (brand: Coreg® by GSK)',
  'Quetiapine':           'Various Generic Manufacturers (brand: Seroquel® by AstraZeneca)',
  'Aripiprazole':         'Various Generic Manufacturers (brand: Abilify® by Otsuka/BMS)',
  'Venlafaxine':          'Various Generic Manufacturers (brand: Effexor® by Pfizer)',
  'Lisinopril-HCTZ':      'Various Generic Manufacturers',
  'Meloxicam':            'Various Generic Manufacturers (brand: Mobic® by Boehringer Ingelheim)',
  'Spironolactone':       'Various Generic Manufacturers (brand: Aldactone® by Pfizer)',
  'Oxycodone':            'Various Generic Manufacturers',
  'Tramadol':             'Various Generic Manufacturers',
  'Insulin Glargine':     'Sanofi (Lantus® / Toujeo®) and Eli Lilly (Basaglar®)',
  'Albuterol':            'Various Manufacturers (brand: ProAir®/Ventolin® by GSK)',
  'Fluticasone':          'Various Manufacturers (brand: Flovent®/Flonase® by GSK)',
  'Triamcinolone':        'Various Generic Manufacturers',
  'Escitalopram':         'Various Generic Manufacturers (brand: Lexapro® by Allergan/Lundbeck)',
  'Linagliptin':          'Boehringer Ingelheim / Eli Lilly (brand: Tradjenta®)',
  'Empagliflozin':        'Boehringer Ingelheim / Eli Lilly (brand: Jardiance®)',
  'Celecoxib':            'Various Generic Manufacturers (brand: Celebrex® by Pfizer)',
  'Topiramate':           'Various Generic Manufacturers (brand: Topamax® by Janssen)',
};

/* ═══════════════════════════════════════════════════════════════
   PHARMACY NETWORK TAGS — zip-based placeholder distances
═══════════════════════════════════════════════════════════════ */
const PHARMACY_TAGS = [
  'Walgreens · 0.8 mi',
  'CVS · 1.2 mi',
  'Walmart Pharmacy · 1.5 mi',
  'Costco Pharmacy · 2.1 mi',
  'Publix Pharmacy · 2.8 mi',
  'Winn-Dixie Pharmacy · 3.4 mi',
  'Rite Aid · 1.9 mi',
  'Kroger Pharmacy · 2.3 mi',
];

const TRENDING_MATRIX = [
  { drug: 'Tirzepatide',    variant: '5mg · Monthly Supply',    retail: 1086.37, rate: 399.00  },
  { drug: 'Ozempic',        variant: '0.25–0.5mg · 1 pen',      retail: 935.00,  rate: 89.00   },
  { drug: 'Semaglutide',    variant: 'Oral 14mg · 30 tabs',     retail: 1048.00, rate: 110.00  },
  { drug: 'Adderall',       variant: '30mg XR · 30 caps',       retail: 284.00,  rate: 48.20   },
  { drug: 'Lexapro',        variant: '20mg · 30 tabs',          retail: 148.00,  rate: 14.60   },
  { drug: 'Atorvastatin',   variant: '40mg · 30 tabs',          retail: 94.00,   rate: 10.20   },
  { drug: 'Metformin',      variant: '1000mg · 90 tabs',        retail: 118.00,  rate: 12.20   },
  { drug: 'Duloxetine',     variant: '60mg · 90 caps',          retail: 368.00,  rate: 38.40   },
];

const US_STATES = ['Select State','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','D.C.','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

/* ═══════════════════════════════════════════════════════════════
   COMPLIANCE GAUNTLET — 4-Screen Legal Flow
═══════════════════════════════════════════════════════════════ */
const ComplianceCtx = { drug: null, channel: null, screen: 1, form: {}, _pendingBtn: null };

function showComplianceGauntlet(drugName) {
  ComplianceCtx.drug    = drugName;
  ComplianceCtx.channel = null;
  ComplianceCtx.screen  = 1;
  ComplianceCtx.form    = {};
  $('complianceGauntlet').style.display = 'flex';
  document.body.classList.add('compliance-open');
  renderComplianceScreen();
}

function closeCompliance() {
  $('complianceGauntlet').style.display = 'none';
  document.body.classList.remove('compliance-open');
}

function _stepDots(total, current) {
  return '<div class="compliance-step-indicator">' +
    Array.from({length: total}, (_,i) =>
      '<div class="compliance-step-dot ' +
      (i < current-1 ? 'done' : i === current-1 ? 'active' : '') + '"></div>'
    ).join('') + '</div>';
}

function _getTCBox(drug) {
  const mfr = DRUG_MFR[drug] || 'the applicable manufacturer';
  return '<div class="compliance-tc-box">' +
    '<h4>Card Eligibility</h4><ol>' +
    '<li>You have been prescribed <strong>' + drug + '</strong> for an approved use consistent with FDA-approved product labeling;</li>' +
    '<li>You agree that the Card is for self-paying (cash) patients only and that you will not seek or accept reimbursement for any out-of-pocket costs for <strong>' + drug + '</strong> purchased with the Card from any third-party payer, including private insurance or state or federal healthcare programs, nor apply those costs toward any deductible or true out-of-pocket requirements;</li>' +
    '<li>You are a resident of the United States or Puerto Rico; and</li>' +
    '<li>You are 18 years of age or older.</li>' +
    '</ol>' +
    '<h4>Card Terms and Conditions</h4>' +
    '<p>You must have a valid prescription for <strong>' + drug + '</strong> for an approved use consistent with FDA-approved product labeling to use this savings card at participating pharmacies. Subject to AlethiaRx\'s right to terminate, rescind, revoke, or amend card eligibility criteria and/or terms and conditions at AlethiaRx\'s sole discretion, without notice, and for any reason. Card expires and savings end on 12/31/2026.</p>' +
    '<h4>Additional Terms and Conditions</h4>' +
    '<p>This Program and Card is for self-paying (cash) patients and operates outside of any health insurance program. You agree not to seek payment or accept reimbursement for any out-of-pocket costs for <strong>' + drug + '</strong> from any insurance plan, healthcare reimbursement account, or third-party payer — including any state or federal healthcare program. THIS CARD IS NOT INSURANCE. Card savings cannot be combined with any other program, discount, or coupon. Card benefits are non-transferable. Card void where prohibited by law.</p>' +
    '<p style="font-style:italic;color:var(--text-disabled);font-size:11px">Manufactured by: ' + mfr + '. Distributed by AlethiaRx Health Technologies. Questions? support@alethiarx.com</p>' +
    '</div>';
}

function renderComplianceScreen() {
  const drug = ComplianceCtx.drug;
  const ch   = ComplianceCtx.channel;
  const sc   = ComplianceCtx.screen;
  const box  = $('complianceContent');
  let html   = '';

  if (sc === 1) {
    // Screen 1: Eligibility
    html = '<div class="compliance-header">' +
      _stepDots(3, 1) +
      '<div class="compliance-step-label">Section 1 of 3 · Eligibility Check</div>' +
      '<div class="compliance-title">Which best describes you?</div>' +
      '<div class="compliance-subtitle">Federal law requires this disclosure for <strong>' + drug + '</strong> savings programs.</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      '<button class="compliance-channel-btn" onclick="complianceChoose(\'insured\')">' +
        '<span class="compliance-channel-icon">🏢</span>' +
        '<div>I am insured through my employer or have a private commercial insurance plan that covers <strong>' + drug + '</strong>.</div>' +
      '</button>' +
      '<button class="compliance-channel-btn danger" onclick="complianceChoose(\'govt\')">' +
        '<span class="compliance-channel-icon">🏛️</span>' +
        '<div>My prescription is paid for (partially or fully) by a state- or federally-funded program such as <strong>Medicare, Medicaid, Medigap, VA, or TRICARE®</strong>.</div>' +
      '</button>' +
      '<button class="compliance-channel-btn" onclick="complianceChoose(\'cash\')">' +
        '<span class="compliance-channel-icon">💵</span>' +
        '<div>I do <strong>not</strong> have insurance, want to pay cash, or my commercial insurance plan does <strong>not</strong> cover <strong>' + drug + '</strong>.</div>' +
      '</button>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<p class="compliance-not-insurance">NOT INSURANCE · Governmental beneficiaries excluded · Offer expires 12/31/2026</p>' +
      '</div>';

  } else if (sc === 'govt') {
    // Government hard stop
    html = '<div class="compliance-header">' +
      '<div class="compliance-title">Federal Law Exclusion</div>' +
      '<div class="compliance-subtitle">Savings card codes cannot be provided to government beneficiaries.</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      '<div class="compliance-hardstop">' +
        '<div class="compliance-hardstop-icon">⚠️</div>' +
        '<div class="compliance-hardstop-title">Government Beneficiaries Cannot Use This Offer</div>' +
        '<div class="compliance-hardstop-text">Federal law (42 U.S.C. § 1320a-7b — Anti-Kickback Statute) prohibits individuals enrolled in Medicare, Medicaid, VA, TRICARE®, or any federally-funded program from using manufacturer savings cards or PBM discount programs for covered medications. Violation can result in federal penalties.<br><br><strong>You are still protected.</strong> VITAL will show you the lowest available <em>cash prices</em> from Cost Plus Drugs and other transparent sources — without the coupon codes that would create compliance risk.</div>' +
      '</div>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<button class="compliance-btn-primary" onclick="closeCompliance(); navigateTo(\'search\'); setTimeout(function(){ triggerSearch(\'' + drug + '\'); }, 150);">Show Cash Prices for ' + drug + '</button>' +
      '<button class="compliance-btn-secondary" onclick="ComplianceCtx.screen=1; renderComplianceScreen()">← Back</button>' +
      '</div>';

  } else if (ch === 'insured' && sc === 2) {
    // Commercial insured: qualified screen
    html = '<div class="compliance-header">' +
      _stepDots(3, 2) +
      '<div class="compliance-step-label">Section 2 of 3 · Eligibility Confirmed</div>' +
      '<div class="compliance-title">You may qualify for this offer!</div>' +
      '<div class="compliance-subtitle">Governmental beneficiaries excluded. Terms apply. NOT INSURANCE.</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      '<div class="compliance-qualified-box">' +
        '<div class="compliance-qualified-title">✓ Commercial Insurance Pathway</div>' +
        '<div class="compliance-qualified-text">You may be eligible for a self-pay option for <strong>' + drug + '</strong>. Savings subject to monthly and annual limits. Taxes and fees may apply. Card expires and savings end on <strong>12/31/2026</strong>.</div>' +
      '</div>' +
      _getTCBox(drug) +
      '<div class="compliance-consent">' +
        '<input type="checkbox" id="insuredConsent" onchange="document.getElementById(\'insuredNext\').disabled=!this.checked">' +
        '<span class="compliance-consent-text">By checking this box, you agree that VITAL may collect, use, and share your personal information for the administration of the <strong>' + drug + '</strong> Savings Program in accordance with VITAL\'s Terms of Use and Privacy Policy.</span>' +
      '</div>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<button id="insuredNext" class="compliance-btn-primary" disabled onclick="complianceCompleteInsured()">Get Offer →</button>' +
      '<button class="compliance-btn-secondary" onclick="ComplianceCtx.screen=1; renderComplianceScreen()">← Back</button>' +
      '<p class="compliance-not-insurance">NOT INSURANCE · Card eligibility and terms for ' + drug + ' apply · Offer expires 12/31/2026</p>' +
      '</div>';

  } else if (ch === 'cash' && sc === 2) {
    // Cash: Registration form
    const f = ComplianceCtx.form;
    const stateOpts = US_STATES.map(function(s){ return '<option value="' + s + '"' + (f.state===s?' selected':'') + '>' + s + '</option>'; }).join('');
    html = '<div class="compliance-header">' +
      _stepDots(4, 2) +
      '<div class="compliance-step-label">Section 2 of 4 · Registration</div>' +
      '<div class="compliance-title">Register for savings</div>' +
      '<div class="compliance-subtitle">Enter your details to receive your <strong>' + drug + '</strong> Self-Pay Savings Card.</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      '<div class="compliance-form-row">' +
        '<div class="compliance-form-field"><label>First Name *</label><input class="compliance-input" id="cf_first" type="text" placeholder="John" value="' + (f.first||'') + '"></div>' +
        '<div class="compliance-form-field"><label>Last Name *</label><input class="compliance-input" id="cf_last" type="text" placeholder="Smith" value="' + (f.last||'') + '"></div>' +
      '</div>' +
      '<div class="compliance-form-field"><label>Date of Birth (MM/DD/YYYY) *</label><input class="compliance-input" id="cf_dob" type="text" placeholder="01/15/1985" value="' + (f.dob||'') + '"></div>' +
      '<div class="compliance-form-field"><label>Address Line 1 *</label><input class="compliance-input" id="cf_addr1" type="text" placeholder="123 Main Street" value="' + (f.addr1||'') + '"></div>' +
      '<div class="compliance-form-row">' +
        '<div class="compliance-form-field"><label>City *</label><input class="compliance-input" id="cf_city" type="text" placeholder="Miami" value="' + (f.city||'') + '"></div>' +
        '<div class="compliance-form-field"><label>State *</label><select class="compliance-input compliance-select" id="cf_state">' + stateOpts + '</select></div>' +
      '</div>' +
      '<div class="compliance-form-row">' +
        '<div class="compliance-form-field"><label>Zip Code *</label><input class="compliance-input" id="cf_zip" type="text" placeholder="33101" value="' + (f.zip||'') + '"></div>' +
        '<div class="compliance-form-field"><label>Mobile Phone *</label><input class="compliance-input" id="cf_phone" type="tel" placeholder="(305) 555-0100" value="' + (f.phone||'') + '"></div>' +
      '</div>' +
      '<div class="compliance-form-field"><label>Email Address *</label><input class="compliance-input" id="cf_email" type="email" placeholder="john@email.com" value="' + (f.email||'') + '"></div>' +
      '<div class="compliance-consent">' +
        '<input type="checkbox" id="cashConsent" ' + (f.consent?'checked':'') + '>' +
        '<span class="compliance-consent-text">By checking this box, you agree that VITAL may collect, use, and share your personal information for the administration of the <strong>' + drug + '</strong> Self-Pay Savings Card Program in accordance with VITAL\'s Terms of Use and Privacy Policy.</span>' +
      '</div>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<button class="compliance-btn-primary" onclick="complianceCashRegNext()">Next →</button>' +
      '<button class="compliance-btn-secondary" onclick="ComplianceCtx.screen=1; renderComplianceScreen()">← Back</button>' +
      '</div>';

  } else if (ch === 'cash' && sc === 3) {
    // Cash: T&C + e-signature
    const f = ComplianceCtx.form;
    html = '<div class="compliance-header">' +
      _stepDots(4, 3) +
      '<div class="compliance-step-label">Section 3 of 4 · Terms & Conditions</div>' +
      '<div class="compliance-title">' + drug + ' Self-Pay Savings Card Program Terms</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      _getTCBox(drug) +
      '<div class="compliance-esig-box">' +
        '<div class="compliance-esig-title">Electronic Signature — Review & Approve</div>' +
        '<p class="compliance-esig-note">By entering your name below, you are signing electronically. You confirm you have reviewed and agree to the Terms above and attest you are eligible to participate in this program.</p>' +
        '<div class="compliance-esig-row">' +
          '<div><label>First Name *</label><input class="compliance-input" id="sig_first" type="text" placeholder="John" value="' + (f.first||'') + '"></div>' +
          '<div><label>Last Name *</label><input class="compliance-input" id="sig_last" type="text" placeholder="Smith" value="' + (f.last||'') + '"></div>' +
        '</div>' +
      '</div>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<button class="compliance-btn-primary" onclick="complianceTCNext()">Next →</button>' +
      '<button class="compliance-btn-secondary" onclick="ComplianceCtx.screen=2; renderComplianceScreen()">← Back</button>' +
      '</div>';

  } else if (ch === 'cash' && sc === 4) {
    // Cash: HIPAA Authorization
    const f = ComplianceCtx.form;
    html = '<div class="compliance-header">' +
      _stepDots(4, 4) +
      '<div class="compliance-step-label">Section 4 of 4 · HIPAA Authorization</div>' +
      '<div class="compliance-title">Patient HIPAA Authorization</div>' +
      '<div class="compliance-subtitle">Authorize use of your protected health information to unlock your ' + drug + ' savings card.</div>' +
      '</div>' +
      '<div class="compliance-body">' +
      '<div class="compliance-tc-box">' +
        '<p>You have selected AlethiaRx to coordinate services related to your health and to provide information related to your <strong>' + drug + '</strong> prescription. In order for AlethiaRx to offer these savings programs, AlethiaRx may need to obtain or exchange your protected health information ("PHI") as defined under HIPAA.</p>' +
        '<h4>PHI Includes:</h4>' +
        '<p>Information about your health insurance or benefits; all relevant records about your treatment, including medication histories and prescriptions for <strong>' + drug + '</strong>; information about your payment for treatment; and whether you are staying on your medicine or treatment plan.</p>' +
        '<h4>How Your PHI Will Be Used</h4>' +
        '<p>Your PHI will be used to enroll you in, provide, and administer the <strong>' + drug + '</strong> Self-Pay Savings Program, including to: understand how much of your treatment is covered by insurance; help you find ways to afford such treatment; track the use of your AlethiaRx savings card; contact you about AlethiaRx programs; and measure program performance to make improvements.</p>' +
        '<h4>Your Rights</h4>' +
        '<p>You are not required to authorize sharing your PHI with AlethiaRx to receive treatment from your healthcare providers. However, AlethiaRx\'s savings programs may not be able to help you without your authorization. You may revoke this authorization at any time by emailing support@alethiarx.com. Revocation will not affect disclosures that occurred before AlethiaRx received notice. This authorization remains in effect for the duration of your participation in the AlethiaRx <strong>' + drug + '</strong> savings program.</p>' +
        '<h4>AUTHORIZATION TO USE AND DISCLOSE PHI</h4>' +
        '<p>I authorize my Health Care Entities to disclose my PHI and sensitive data for the purposes described in this HIPAA Authorization. This Authorization replaces any prior HIPAA Authorizations provided for this specific AlethiaRx program.</p>' +
      '</div>' +
      '<div class="compliance-esig-box">' +
        '<div class="compliance-esig-title">Electronic Signature — Submit</div>' +
        '<p class="compliance-esig-note">By selecting "Submit & Reveal Card," you are signing this HIPAA Authorization electronically. You have read, understand, and agree to its terms. You are entitled to a copy of this signed Authorization.</p>' +
        '<div class="compliance-esig-row">' +
          '<div><label>First Name *</label><input class="compliance-input" id="hipaa_first" type="text" placeholder="John" value="' + (f.first||'') + '"></div>' +
          '<div><label>Last Name *</label><input class="compliance-input" id="hipaa_last" type="text" placeholder="Smith" value="' + (f.last||'') + '"></div>' +
        '</div>' +
      '</div>' +
      '</div>' +
      '<div class="compliance-footer">' +
      '<button class="compliance-btn-primary" onclick="complianceSubmit()">Submit & Reveal Card →</button>' +
      '<button class="compliance-btn-secondary" onclick="ComplianceCtx.screen=3; renderComplianceScreen()">← Back</button>' +
      '<p class="compliance-not-insurance">NOT INSURANCE · Card eligibility and terms for ' + drug + ' apply · Offer expires 12/31/2026</p>' +
      '</div>';
  }

  box.innerHTML = html;
  const modalBox = $('complianceGauntlet') && $('complianceGauntlet').querySelector('.compliance-box');
  if (modalBox) modalBox.scrollTop = 0;
}

function complianceChoose(channel) {
  ComplianceCtx.channel = channel;
  ComplianceCtx.screen  = channel === 'govt' ? 'govt' : 2;
  renderComplianceScreen();
}

function complianceCompleteInsured() {
  const cb = document.getElementById('insuredConsent');
  if (!cb || !cb.checked) return showToast('Please accept the terms to continue.', 'error');
  _saveComplianceRecord('insured');
  const drug = ComplianceCtx.drug;
  const pendingBtn = ComplianceCtx._pendingBtn;
  ComplianceCtx._pendingBtn = null;
  closeCompliance();
  if (pendingBtn) {
    // Came from clicking "Use This Card" — replay the price action now that codes are unlocked
    setTimeout(function(){ handlePriceAction(pendingBtn); }, 120);
    setTimeout(function(){ showToast(drug + ' codes unlocked!', 'success'); }, 500);
  } else {
    // Came from a home-page medication card — navigate to Savings Finder
    navigateTo('search');
    setTimeout(function(){ triggerSearch(drug); }, 150);
    setTimeout(function(){ showToast(drug + ' savings unlocked.', 'success'); }, 400);
  }
}

function complianceCashRegNext() {
  const g = function(id){ return (document.getElementById(id)||{value:''}).value.trim(); };
  const first = g('cf_first'), last = g('cf_last'), dob = g('cf_dob');
  const addr1 = g('cf_addr1'), city = g('cf_city');
  const state = (document.getElementById('cf_state')||{value:''}).value;
  const zip   = g('cf_zip'),   phone = g('cf_phone'), email = g('cf_email');
  const consent = (document.getElementById('cashConsent')||{}).checked;
  if (!first || !last || !dob || !addr1 || !city || !state || state === 'Select State' || !zip || !phone || !email)
    return showToast('Please fill in all required fields.', 'error');
  if (!consent) return showToast('Please accept the consent to continue.', 'error');
  ComplianceCtx.form = { first, last, dob, addr1, city, state, zip, phone, email, consent };
  ComplianceCtx.screen = 3;
  renderComplianceScreen();
}

function complianceTCNext() {
  const first = (document.getElementById('sig_first')||{value:''}).value.trim();
  const last  = (document.getElementById('sig_last')||{value:''}).value.trim();
  const f = ComplianceCtx.form;
  if (!first || !last) return showToast('Please enter your name as your electronic signature.', 'error');
  if (first.toLowerCase() !== (f.first||'').toLowerCase() ||
      last.toLowerCase()  !== (f.last||'').toLowerCase())
    return showToast('Signature must match your registered name exactly.', 'error');
  ComplianceCtx.screen = 4;
  renderComplianceScreen();
}

function complianceSubmit() {
  const first = (document.getElementById('hipaa_first')||{value:''}).value.trim();
  const last  = (document.getElementById('hipaa_last')||{value:''}).value.trim();
  const f = ComplianceCtx.form;
  if (!first || !last) return showToast('Please enter your name to authorize.', 'error');
  if (first.toLowerCase() !== (f.first||'').toLowerCase() ||
      last.toLowerCase()  !== (f.last||'').toLowerCase())
    return showToast('Signature must match your registered name exactly.', 'error');
  _saveComplianceRecord('cash');
  const drug = ComplianceCtx.drug;
  const pendingBtn = ComplianceCtx._pendingBtn;
  ComplianceCtx._pendingBtn = null;
  closeCompliance();
  if (pendingBtn) {
    // Came from clicking "Use This Card" — replay the price action now that codes are unlocked
    setTimeout(function(){ handlePriceAction(pendingBtn); }, 120);
    setTimeout(function(){ showToast(drug + ' card unlocked. Show codes at checkout.', 'success'); }, 500);
  } else {
    // Came from a home-page medication card
    navigateTo('search');
    setTimeout(function(){ triggerSearch(drug); }, 150);
    setTimeout(function(){ showToast(drug + ' card unlocked. Show codes at checkout.', 'success'); }, 450);
  }
}

function _saveComplianceRecord(channel) {
  const record = {
    drug:      ComplianceCtx.drug,
    channel:   channel,
    timestamp: new Date().toISOString(),
    first:     ComplianceCtx.form.first,
    last:      ComplianceCtx.form.last,
    dob:       ComplianceCtx.form.dob,
    email:     ComplianceCtx.form.email,
    phone:     ComplianceCtx.form.phone,
    addr1:     ComplianceCtx.form.addr1,
    city:      ComplianceCtx.form.city,
    state:     ComplianceCtx.form.state,
    zip:       ComplianceCtx.form.zip,
  };
  // Persist cleared state so codes remain visible this session
  const cleared = JSON.parse(localStorage.getItem('vital_compliance') || '{}');
  cleared[ComplianceCtx.drug] = { channel: channel, timestamp: record.timestamp };
  localStorage.setItem('vital_compliance', JSON.stringify(cleared));
  // TODO: Replace with live Firebase write →
  // firebase.firestore().collection('legal_audit_trail').add({ ...record, ip: '(resolve server-side)' });
  console.log('[AlethiaRx Compliance Audit Trail]', record);
}

function isComplianceCleared(drugName) {
  const cleared = JSON.parse(localStorage.getItem('vital_compliance') || '{}');
  return !!cleared[drugName];
}

/* ═══════════════════════════════════════════════════════════════
   PRICE ACTION → 3D CARD FLIP
═══════════════════════════════════════════════════════════════ */
/* Source themes: front card styling + back card content */
const SOURCE_THEMES = {
  fp:  {
    frontBg: 'linear-gradient(145deg,#0a0a0a 0%,#000 55%,#0d0d0d 100%)',
    frontBorder: 'rgba(255,255,255,0.09)', frontPriceColor: '#00C896',
    frontLabelColor: 'rgba(255,255,255,0.6)', frontHintColor: 'rgba(255,255,255,0.32)',
    glowColor: '#00C896',
    backBg: 'linear-gradient(145deg,#111 0%,#000 55%,#0d0d0d 100%)',
    backBorder: 'rgba(255,255,255,0.10)',
    logoHtml: '<span style="color:#00e5c5;font-weight:800;font-size:16px;letter-spacing:-0.02em">AlethiaRx</span>',
    chipHtml: '<svg viewBox="0 0 32 24" fill="none" width="26" height="19"><rect x="1" y="1" width="30" height="22" rx="3" stroke="rgba(255,255,255,0.5)" stroke-width="1"/><rect x="8" y="5" width="16" height="14" rx="1.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/><path d="M8 10h16M8 14h16M16 5v14" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/></svg>',
    codeColor: '#fff', labelColor: 'rgba(255,255,255,0.4)',
    noteColor: 'rgba(255,255,255,0.4)', note: 'Show to pharmacist', showCodes: true,
  },
  ins: {
    frontBg: 'linear-gradient(135deg,#1a2f6b 0%,#0f1d45 100%)',
    frontBorder: 'rgba(120,160,240,0.2)', frontPriceColor: '#90CAF9',
    frontLabelColor: 'rgba(255,255,255,0.7)', frontHintColor: 'rgba(255,255,255,0.4)',
    glowColor: '#3b82f6',
    backBg: 'linear-gradient(135deg,#1a2f6b 0%,#0f1d45 100%)',
    backBorder: 'rgba(120,160,240,0.2)',
    logoHtml: '<span style="color:#90CAF9;font-weight:800;font-size:14px">Your Insurance</span>',
    chipHtml: '', codeColor: '#90CAF9', labelColor: 'rgba(255,255,255,0.5)',
    noteColor: 'rgba(255,255,255,0.45)', note: 'Present insurance card at checkout', showCodes: true,
  },
  grx: {
    frontBg: 'linear-gradient(135deg,#006B68 0%,#004D4A 100%)',
    frontBorder: 'rgba(0,210,190,0.2)', frontPriceColor: '#fff',
    frontLabelColor: 'rgba(255,255,255,0.75)', frontHintColor: 'rgba(255,255,255,0.45)',
    glowColor: '#00B5AD',
    backBg: 'linear-gradient(135deg,#007A77 0%,#005956 100%)',
    backBorder: 'rgba(0,210,190,0.18)',
    logoHtml: '<span style="color:#fff;font-weight:800;font-size:16px">GoodRx</span>',
    chipHtml: '', codeColor: '#fff', labelColor: 'rgba(255,255,255,0.55)',
    noteColor: 'rgba(255,255,255,0.5)', note: 'Use your GoodRx coupon at checkout', showCodes: false,
  },
  cp:  {
    frontBg: 'linear-gradient(135deg,#003d9e 0%,#001f5e 100%)',
    frontBorder: 'rgba(100,160,255,0.18)', frontPriceColor: '#fff',
    frontLabelColor: 'rgba(255,255,255,0.75)', frontHintColor: 'rgba(255,255,255,0.45)',
    glowColor: '#1d4ed8',
    backBg: 'linear-gradient(135deg,#0047AB 0%,#002F7A 100%)',
    backBorder: 'rgba(100,160,255,0.18)',
    logoHtml: '<span style="color:#fff;font-weight:800;font-size:14px;letter-spacing:-0.01em">Cost Plus Drugs</span>',
    chipHtml: '', codeColor: '#90CAF9', labelColor: 'rgba(255,255,255,0.55)',
    noteColor: 'rgba(255,255,255,0.5)', note: "Mark Cuban's Cost Plus Drugs", showCodes: false,
  },
  ret: {
    frontBg: 'linear-gradient(145deg,#0a0a0a 0%,#000 55%,#0d0d0d 100%)',
    frontBorder: 'rgba(255,255,255,0.08)', frontPriceColor: '#fff',
    frontLabelColor: 'rgba(255,255,255,0.6)', frontHintColor: 'rgba(255,255,255,0.32)',
    glowColor: '#00C896',
    backBg: 'linear-gradient(145deg,#111 0%,#000 55%,#0d0d0d 100%)',
    backBorder: 'rgba(255,255,255,0.10)',
    logoHtml: '<span style="color:#00e5c5;font-weight:800;font-size:16px;letter-spacing:-0.02em">AlethiaRx</span>',
    chipHtml: '<svg viewBox="0 0 32 24" fill="none" width="26" height="19"><rect x="1" y="1" width="30" height="22" rx="3" stroke="rgba(255,255,255,0.5)" stroke-width="1"/><rect x="8" y="5" width="16" height="14" rx="1.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/><path d="M8 10h16M8 14h16M16 5v14" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/></svg>',
    codeColor: '#fff', labelColor: 'rgba(255,255,255,0.4)',
    noteColor: 'rgba(255,255,255,0.35)', note: 'Standard retail — no discount applied', showCodes: false,
  },
};

function handlePriceAction(btn) {
  const sourceId    = btn.dataset.sourceId;
  const sourceLabel = btn.dataset.sourceLabel;
  const price       = parseFloat(btn.dataset.price);
  const drug        = btn.dataset.drug;
  const variantLbl  = btn.dataset.variant;
  const retail      = parseFloat(btn.dataset.retail);
  const theme       = SOURCE_THEMES[sourceId] || SOURCE_THEMES.fp;

  // ── COMPLIANCE GATE: VITAL Direct codes are locked until eligibility is verified ──
  if (sourceId === 'fp' && !isComplianceCleared(drug)) {
    ComplianceCtx._pendingBtn = btn;
    showComplianceGauntlet(drug);
    return; // Do not reveal codes — stop here
  }

  // Highlight selected price card
  $$('#priceComparisonGrid .price-card').forEach(c => {
    c.classList.remove('selected-card');
    c.style.removeProperty('--card-glow');
  });
  const selectedCard = btn.closest('.price-card');
  selectedCard.classList.add('selected-card');
  selectedCard.style.setProperty('--card-glow', theme.glowColor);

  const ins   = getInsuranceRecord();
  const name  = State.vault['vf-name'] || (State.user && State.user.name) || 'MEMBER';
  const saved = retail - price;

  // Style the front card dynamically
  const front = document.querySelector('.card-flip-front');
  front.style.background = theme.frontBg;
  front.style.borderColor = theme.frontBorder;
  $('flipSourceLabel').style.color = theme.frontLabelColor;
  $('flipSourceLabel').textContent = sourceLabel;
  $('flipPrice').style.color = theme.frontPriceColor;
  $('flipPrice').textContent = fmt(price);
  $('flipDrug').textContent = `${drug} · ${variantLbl}`;
  document.querySelector('.flip-hint').style.color = theme.frontHintColor;

  // Build dynamic back card — codes only shown after compliance clearance
  const cleared = isComplianceCleared(drug);
  const codesHtml = theme.showCodes
    ? (cleared
        ? `<div class="mini-card-codes">
            <div class="mini-code"><div class="mini-code-label" style="color:${theme.labelColor}">BIN</div><div class="mini-code-val" style="color:${theme.codeColor}">${ins.bin}</div></div>
            <div class="mini-code"><div class="mini-code-label" style="color:${theme.labelColor}">PCN</div><div class="mini-code-val" style="color:${theme.codeColor}">${ins.pcn}</div></div>
            <div class="mini-code"><div class="mini-code-label" style="color:${theme.labelColor}">GROUP</div><div class="mini-code-val" style="color:${theme.codeColor}">${ins.group || 'FP2026'}</div></div>
          </div>`
        : `<div class="mini-card-locked">
            <div class="mini-card-lock-icon">🔒</div>
            <div class="mini-card-lock-text">Verify eligibility to unlock codes</div>
          </div>`)
    : `<div style="height:14px"></div>`;

  const back = document.querySelector('.card-flip-back');
  back.style.background = theme.backBg;
  back.style.borderColor = theme.backBorder;
  back.style.boxShadow = `0 0 40px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.6)`;
  back.innerHTML = `
    <div class="mini-card">
      <div class="mini-card-header">
        ${theme.logoHtml}
        ${theme.chipHtml}
      </div>
      <div class="mini-card-name" style="color:rgba(255,255,255,0.45)">${name.toUpperCase()}</div>
      ${codesHtml}
      <div class="mini-card-note" style="color:${theme.noteColor};border-top:1px solid rgba(255,255,255,0.07)">
        ${theme.note} · Save <strong style="color:${theme.codeColor}">${saved > 0 ? fmt(saved) : '—'}</strong> vs. retail
      </div>
    </div>
  `;

  // Show panel, reset flip
  const panel = $('cardFlipPanel');
  const card  = $('cardFlipCard');
  card.classList.remove('flipped');
  panel.style.display = 'flex';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  card._flipBound && card.removeEventListener('click', card._flipBound);
  card._flipBound = () => card.classList.toggle('flipped');
  card.addEventListener('click', card._flipBound);

  // Open external link for GoodRx and Cost Plus
  const extLink = btn.dataset.link;
  if (extLink && (sourceId === 'grx' || sourceId === 'cp')) {
    setTimeout(function(){ window.open(extLink, '_blank', 'noopener'); }, 400);
  }

  if (sourceId === 'fp' && !State.user) {
    showToast('Create a free account to save your card details.', 'success');
  }
}

function hideCardFlip() {
  const panel = $('cardFlipPanel');
  if (panel) panel.style.display = 'none';
  const card = $('cardFlipCard');
  if (card) card.classList.remove('flipped');
}

function resetSearchPage() {
  $('searchResultsPanel').style.display = 'none';
  $('searchEmptyState').style.display   = 'block';
  showBrowseCatalog();
  hideCardFlip();
  State.currentDrug    = null;
  State.currentVariant = null;
}

/* ═══════════════════════════════════════════════════════════════
   MEDICINE CABINET
═══════════════════════════════════════════════════════════════ */
function renderCabinet() {
  const loggedIn = !!State.user;
  $('cabinetAuthGate').style.display = loggedIn ? 'none' : 'block';
  $('cabinetContent').style.display  = loggedIn ? 'block' : 'none';
  if (!loggedIn) return;

  const list = $('medList');

  if (State.cabinet.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:48px 20px;color:var(--text-muted)">
        <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">Your cabinet is empty</div>
        <div style="font-size:13px">Click <strong style="color:var(--mint)">+ Add Medication</strong> to get started</div>
      </div>
    `;
    $('refillTrackerSection').style.display = 'none';
    return;
  }

  list.innerHTML = State.cabinet.map(med => `
    <div class="med-item" data-id="${med.id}">
      <div class="med-icon">${med.icon || '💊'}</div>
      <div class="med-info">
        <div class="med-name-row">
          <span class="med-name">${med.name}</span>
          <button class="med-wallet-btn" title="Wallet (v2.0)" onclick="showWalletComingSoon()">
            <svg viewBox="0 0 20 20" fill="none" width="13" height="13">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/>
              <path d="M2 9h16" stroke="currentColor" stroke-width="1.3"/>
              <path d="M5 13h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="med-detail">${med.variant}</div>
      </div>
      <button class="med-remove" data-id="${med.id}" title="Remove">✕</button>
    </div>
  `).join('');

  // X buttons — permanent delete
  list.querySelectorAll('.med-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      State.cabinet = State.cabinet.filter(m => m.id !== id);
      saveCabinet();
      renderCabinet();
      showToast('Medication removed.');
    });
  });

  $('refillTrackerSection').style.display = 'none';
}

/* ─── ADD MED DRAWER ─────────────────────────────────────────── */
function setupDrawerSearch() {
  const input    = $('drawerSearchInput');
  const dropdown = $('drawerSearchDropdown');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 1) { dropdown.classList.remove('open'); $('drawerVariantSelect').style.display = 'none'; return; }
    const results = DRUGS.filter(d => d.name.toLowerCase().includes(q.toLowerCase()));

    dropdown.innerHTML = results.slice(0, 8).map(d => `
      <div class="dropdown-item" data-name="${d.name}">
        <div>
          <div class="dropdown-drug-name">${d.name}</div>
          <div class="dropdown-drug-cat">${d.category}</div>
        </div>
      </div>
    `).join('');

    dropdown.querySelectorAll('.dropdown-item[data-name]').forEach(item => {
      item.addEventListener('click', () => {
        const drug = DRUGS.find(d => d.name === item.dataset.name);
        if (!drug) return;
        State.drawerDrug = drug;
        input.value = drug.name;
        dropdown.classList.remove('open');

        // Populate variant dropdown
        const sel = $('drawerVariantDropdown');
        sel.innerHTML = drug.variants.map((v, i) => `<option value="${i}">${v.label}</option>`).join('');
        $('drawerVariantSelect').style.display = 'flex';
      });
    });

    dropdown.classList.add('open');
  });

  document.addEventListener('click', e => {
    if (!input.closest('.drawer-search-wrap').contains(e.target)) dropdown.classList.remove('open');
  });
}

function openAddMedDrawer() {
  const drawer = $('addMedDrawer');
  drawer.style.display = 'block';
  $('drawerSearchInput').value = '';
  $('drawerVariantSelect').style.display = 'none';
  $('drawerSearchDropdown').classList.remove('open');
  State.drawerDrug = null;
  setTimeout(() => $('drawerSearchInput').focus(), 50);
}

function closeAddMedDrawer() {
  $('addMedDrawer').style.display = 'none';
}

function confirmAddMed() {
  if (!State.drawerDrug) return;
  const variantIndex = parseInt($('drawerVariantDropdown').value);
  const variant      = State.drawerDrug.variants[variantIndex];
  const fills        = parseInt($('drawerFills').value) || 5;

  State.cabinet.push({
    id:       Date.now(),
    name:     State.drawerDrug.name,
    variant:  variant.label,
    fills,
    maxFills: fills,
    icon:     State.drawerDrug.icon,
  });
  saveCabinet();
  closeAddMedDrawer();
  renderCabinet();
  showToast(`${State.drawerDrug.name} added to your cabinet.`);
}

/* ═══════════════════════════════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════════════════════════════ */
function animateCounters() {
  $$('[data-count]').forEach(el => {
    const target   = parseInt(el.dataset.count);
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const p   = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + '+';
    }
    requestAnimationFrame(step);
  });
}

function observeStats() {
  const strip = document.querySelector('.hero-stat-strip');
  if (!strip) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(strip);
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — 3-field auth: email + password + access code
═══════════════════════════════════════════════════════════════ */
function initAdmin() {
  if (State.adminLoggedIn) {
    $('adminLoginGate').style.display = 'none';
    $('adminDashboard').style.display = 'block';
  } else {
    $('adminLoginGate').style.display = 'flex';
    $('adminDashboard').style.display = 'none';
  }
  updateAdminSidebarVisibility();
}

function doAdminLogin() {
  const email = $('adminEmail').value.trim().toLowerCase();
  const pass  = $('adminPass').value.trim();
  const code  = $('adminCode').value.trim();

  if (email === 'admin@vital.com' && pass === 'ADMIN2026888' && code === 'ADMIN888') {
    State.adminLoggedIn = true;
    $('adminLoginGate').style.display = 'none';
    $('adminDashboard').style.display = 'block';
    $('adminLoginError').style.display = 'none';
    showToast('Welcome to the Partner Portal.');
  } else {
    $('adminLoginError').style.display = 'block';
  }
}

function calcMRR() {
  const claims = parseInt($('claimsSlider').value);
  const mrr    = claims * State.activeFee;
  $('claimsVal').textContent = claims.toLocaleString();
  $('calcMRR').textContent   = '$' + Math.round(mrr).toLocaleString();
  $('calcARR').textContent   = '$' + Math.round(mrr * 12).toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════
   DATA PURGE
═══════════════════════════════════════════════════════════════ */
function openPurgeModal()  { $('purgeModalOverlay').classList.add('open'); $('purgeConfirmInput').value = ''; }
function closePurgeModal() { $('purgeModalOverlay').classList.remove('open'); }

function executePurge() {
  if ($('purgeConfirmInput').value.trim().toUpperCase() !== 'DELETE') {
    showToast('Please type DELETE to confirm.', 'error');
    return;
  }
  localStorage.clear();
  sessionStorage.clear();
  State.user = null; State.vault = {}; State.cabinet = [];
  closePurgeModal();
  updateAuthUI();
  navigateTo('home');
  showToast('All data permanently purged.');
}

/* ═══════════════════════════════════════════════════════════════
   BIND ALL EVENTS
═══════════════════════════════════════════════════════════════ */
function bindEvents() {

  // Sidebar
  $('hamburgerBtn').addEventListener('click', openSidebar);
  $('sidebarClose').addEventListener('click', closeSidebar);
  $('sidebarOverlay').addEventListener('click', closeSidebar);

  // Page links (all [data-page] elements)
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-page]');
    if (!link) return;
    const page = link.dataset.page;
    // Let auth modal links work too
    if (link.id === 'switchToRegister' || link.id === 'switchToSignIn') return;
    e.preventDefault();
    navigateTo(page);
  });

  // Header buttons
  $('btnSignIn').addEventListener('click', () => openAuthModal('signin'));
  $('btnJoin').addEventListener('click', () => State.user ? navigateTo('vault') : openAuthModal('register'));

  // Sidebar Sign In button
  const sidebarSignInBtn = $('sidebarSignInBtn');
  if (sidebarSignInBtn) sidebarSignInBtn.addEventListener('click', () => { closeSidebar(); openAuthModal('signin'); });

  // Auth modal
  $('authModalClose').addEventListener('click', closeAuthModal);
  $('authModalOverlay').addEventListener('click', e => { if (e.target === $('authModalOverlay')) closeAuthModal(); });
  $('switchToRegister').addEventListener('click', e => { e.preventDefault(); showRegView(); });
  $('switchToSignIn').addEventListener('click', e => { e.preventDefault(); showSignInView(); });
  $('authAdminContinueBtn').addEventListener('click', doAdminCodeVerify);
  $('authAdminCode').addEventListener('keydown', e => { if (e.key === 'Enter') doAdminCodeVerify(); });
  $('authAdminBackBtn').addEventListener('click', showSignInView);
  $('doSignInBtn').addEventListener('click', () => doSignIn($('signInEmail').value, $('signInPass').value));
  $('signInEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doSignIn($('signInEmail').value, $('signInPass').value); });
  $('signInPass').addEventListener('keydown',  e => { if (e.key === 'Enter') doSignIn($('signInEmail').value, $('signInPass').value); });

  // Onboarding
  $('onboardNext1').addEventListener('click', () => {
    if (!$('reg-name').value || !$('reg-email').value.includes('@') || $('reg-pass').value.length < 8) {
      showToast('Please complete all fields (password min 8 chars).', 'error');
      return;
    }
    goToOnboardStep(2);
  });
  $('onboardNext2').addEventListener('click', () => goToOnboardStep(3));
  $('onboardSkip2').addEventListener('click', () => goToOnboardStep(3));
  $('completeRegBtn').addEventListener('click', doRegister);

  // Vault
  $('secureEditToggle').addEventListener('change', e => setVaultLocked(!e.target.checked));
  $('saveVaultBtn').addEventListener('click', saveVaultData);
  $('cancelVaultBtn').addEventListener('click', () => { $('secureEditToggle').checked = false; setVaultLocked(true); renderVault(); });
  $('vaultSignInBtn').addEventListener('click', () => openAuthModal('signin'));
  $('vaultCreateBtn').addEventListener('click', () => openAuthModal('register'));
  $('signOutBtn').addEventListener('click', signOut);
  $('sidebarSignOut').addEventListener('click', signOut);
  $('purgeBtn').addEventListener('click', openPurgeModal);
  $('confirmPurgeBtn').addEventListener('click', executePurge);
  $('cancelPurgeBtn').addEventListener('click', closePurgeModal);
  $('purgeModalOverlay').addEventListener('click', e => { if (e.target === $('purgeModalOverlay')) closePurgeModal(); });

  // Cabinet
  $('cabinetSignInBtn').addEventListener('click', () => openAuthModal('signin'));
  $('cabinetCreateBtn').addEventListener('click', () => openAuthModal('register'));
  $('addMedBtn').addEventListener('click', openAddMedDrawer);
  $('addMedDrawerClose').addEventListener('click', closeAddMedDrawer);
  $('confirmAddMedBtn').addEventListener('click', confirmAddMed);

  // Cabinet filter buttons
  $$('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Card flip close
  $('closeFlipBtn').addEventListener('click', hideCardFlip);

  // Admin
  $('adminLoginBtn').addEventListener('click', doAdminLogin);
  $('adminCode').addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  $('adminLogoutBtn').addEventListener('click', () => { State.adminLoggedIn = false; initAdmin(); });
  $('claimsSlider').addEventListener('input', calcMRR);
  $$('.fee-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.fee-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.activeFee = parseFloat(btn.dataset.fee);
      calcMRR();
    });
  });

  // Telehealth notify
  const tele = $('teleNotifyBtn');
  if (tele) tele.addEventListener('click', () => showToast("You'll be notified when Online Care launches!"));

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAuthModal(); closePurgeModal(); closeSidebar(); hideCardFlip(); }
  });
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  bindEvents();
  initSearch();
  // Zip input — refresh matrix on change
  const zipEl = $('heroZipInput');
  if (zipEl) zipEl.addEventListener('input', () => renderPricingMatrix());
  updateAuthUI();
  updateAdminSidebarVisibility();
  observeStats();
  renderPricingMatrix();
  renderCard();
  calcMRR();
  initMedicationCards();
  initBrowseCatalog();
  navigateTo('home');
});

function initMedicationCards() {
  document.querySelectorAll('.medication-card[data-drug]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      showComplianceGauntlet(card.dataset.drug);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   BROWSE MEDICATIONS CATALOG — Category drill-down
═══════════════════════════════════════════════════════════════ */

// Colour palette cycling per category
const CAT_PALETTE = [
  { bg: 'rgba(0,200,150,0.07)',   accent: '#00a878', border: 'rgba(0,200,150,0.22)' },
  { bg: 'rgba(59,130,246,0.07)',  accent: '#2563eb', border: 'rgba(59,130,246,0.22)' },
  { bg: 'rgba(217,119,6,0.07)',   accent: '#d97706', border: 'rgba(217,119,6,0.22)'  },
  { bg: 'rgba(139,92,246,0.07)',  accent: '#7c3aed', border: 'rgba(139,92,246,0.22)' },
  { bg: 'rgba(239,68,68,0.07)',   accent: '#dc2626', border: 'rgba(239,68,68,0.22)'  },
  { bg: 'rgba(20,184,166,0.07)',  accent: '#0d9488', border: 'rgba(20,184,166,0.22)' },
  { bg: 'rgba(245,158,11,0.07)',  accent: '#b45309', border: 'rgba(245,158,11,0.22)' },
  { bg: 'rgba(236,72,153,0.07)',  accent: '#be185d', border: 'rgba(236,72,153,0.22)' },
];

// Build category → drugs map once
function buildCatMap() {
  const map = {};
  DRUGS.forEach(d => {
    if (!map[d.category]) map[d.category] = [];
    map[d.category].push(d);
  });
  return map;
}

function initBrowseCatalog() {
  if (!$('browseCatGrid')) return;
  renderBrowseCategories();
}

function renderBrowseCategories() {
  const catGrid = $('browseCatGrid');
  if (!catGrid) return;

  const map  = buildCatMap();
  const cats = Object.keys(map).sort();

  catGrid.innerHTML = cats.map((cat, i) => {
    const p     = CAT_PALETTE[i % CAT_PALETTE.length];
    const count = map[cat].length;
    return `
      <div class="browse-cat-card"
           style="--cat-bg:${p.bg};--cat-accent:${p.accent};--cat-border:${p.border}"
           onclick="showBrowseDrugs('${cat.replace(/'/g,"\\'")}')">
        <div class="browse-cat-dot"></div>
        <div class="browse-cat-body">
          <div class="browse-cat-name">${cat}</div>
          <div class="browse-cat-count">${count} medication${count !== 1 ? 's' : ''}</div>
        </div>
        <svg class="browse-cat-arrow" viewBox="0 0 20 20" fill="none" width="16" height="16">
          <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;
  }).join('');

  $('browseCategoryView').style.display = '';
  $('browseDrugView').style.display     = 'none';
}

function showBrowseDrugs(category) {
  const map   = buildCatMap();
  const drugs = (map[category] || []).sort((a, b) => a.name.localeCompare(b.name));

  $('browseDrugHeading').textContent = category;

  $('browseDrugList').innerHTML = drugs.map(drug => {
    const low = Math.min(...drug.variants.map(v => v.fairplay));
    return `
      <div class="browse-drug-row" onclick="handleBrowseDrugClick('${drug.name.replace(/'/g,"\\'")}')">
        <div class="browse-drug-row-icon">${drug.icon || 'Rx'}</div>
        <div class="browse-drug-row-info">
          <div class="browse-drug-row-name">${drug.name}</div>
          <div class="browse-drug-row-sub">${drug.variants.length} variant${drug.variants.length !== 1 ? 's' : ''} available</div>
        </div>
        <div class="browse-drug-row-price">From $${low.toFixed(2)}</div>
        <svg class="browse-drug-row-arrow" viewBox="0 0 20 20" fill="none" width="16" height="16">
          <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;
  }).join('');

  $('browseCategoryView').style.display = 'none';
  $('browseDrugView').style.display     = '';
}

function showBrowseCategories() {
  $('browseCategoryView').style.display = '';
  $('browseDrugView').style.display     = 'none';
}

function handleBrowseDrugClick(drugName) {
  hideBrowseCatalog();
  triggerSearch(drugName);
}

function showBrowseCatalog() {
  const catalog = $('browseCatalog');
  if (catalog) catalog.style.display = '';
  // Always land back on category grid when re-opening
  showBrowseCategories();
}

function hideBrowseCatalog() {
  const catalog = $('browseCatalog');
  if (catalog) catalog.style.display = 'none';
}
