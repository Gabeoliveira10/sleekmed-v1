/* ═══════════════════════════════════════════════════════════════
   VITAL — PRODUCTION SCRIPT v2
   50-Drug Database · 3D Card Flip · Golden Record Insurance Engine
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
  updateInsuranceNotice();
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

function renderPriceCards(variant, drugName) {
  const ins = getInsuranceRecord();
  const insLabel = (State.user && ins.carrier) ? `${ins.carrier} Co-pay` : 'Avg. Insurance Co-pay';

  const prices = [
    { id: 'fp',  source: 'VITAL Direct',       amount: variant.fairplay,  action: 'Use This Card',      isFP: true },
    { id: 'ins', source: insLabel,             amount: variant.insurance, action: 'Use Your Insurance',  isFP: false },
    { id: 'grx', source: 'GoodRx',             amount: variant.goodrx,    action: 'View on GoodRx',      isFP: false },
    { id: 'cp',  source: 'Cost Plus Drugs',    amount: variant.costplus,  action: 'View on Cost Plus',   isFP: false },
    { id: 'ret', source: 'Retail Cash',        amount: variant.retail,    action: 'Standard Retail',     isFP: false },
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
   PRICE ACTION → 3D CARD FLIP
═══════════════════════════════════════════════════════════════ */
function handlePriceAction(btn) {
  const sourceId    = btn.dataset.sourceId;
  const sourceLabel = btn.dataset.sourceLabel;
  const price       = parseFloat(btn.dataset.price);
  const drug        = btn.dataset.drug;
  const variantLbl  = btn.dataset.variant;
  const retail      = parseFloat(btn.dataset.retail);

  // "Use This Card" (Fair Play) OR "View Discount" (any) → show flip card
  const ins   = getInsuranceRecord();
  const name  = State.vault['vf-name'] || (State.user && State.user.name) || 'MEMBER';
  const saved = retail - price;

  // Populate front
  $('flipSourceLabel').textContent = sourceLabel;
  $('flipPrice').textContent       = fmt(price);
  $('flipDrug').textContent        = `${drug} · ${variantLbl}`;

  // Populate back
  $('flipCardName').textContent = name.toUpperCase();
  $('flipBIN').textContent      = ins.bin;
  $('flipPCN').textContent      = ins.pcn;
  $('flipGroup').textContent    = ins.group || 'FP2026';
  $('flipSavings').textContent  = saved > 0 ? fmt(saved) : '—';

  // Show panel, reset flip state
  const panel = $('cardFlipPanel');
  const card  = $('cardFlipCard');
  card.classList.remove('flipped');
  panel.style.display = 'flex';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Tap/click on card = flip
  card._flipBound && card.removeEventListener('click', card._flipBound);
  card._flipBound = () => card.classList.toggle('flipped');
  card.addEventListener('click', card._flipBound);

  // If it's the FP card and user is not logged in — prompt
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
  updateAuthUI();
  updateAdminSidebarVisibility();
  observeStats();
  renderCard();
  calcMRR();
  navigateTo('home');
});
