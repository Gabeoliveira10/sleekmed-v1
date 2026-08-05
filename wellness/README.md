# Forge — AI Health & Wellness

An all-in-one training, nutrition, and motivation app. Vanilla HTML/CSS/JS, no build
step, installable as a PWA. Lives at `/wellness/` alongside the Vital Rx site and
deploys to GitHub Pages as-is.

```
open https://<user>.github.io/sleekmed-v1/wellness/
```

## What's in it

| Area | What it does |
|---|---|
| **Today** | Calorie ring, macro bars, next session, week-at-a-glance, consistency grid, AI daily read |
| **Training** | Program generated from your goal, experience, schedule and equipment. Live workout logger with per-set weight/reps, rest timer, PR detection, exercise swap, volume history |
| **Nutrition** | Food log by meal, ~130-item food database with real serving sizes, custom foods, quick-calorie entry, water tracking, per-day navigation |
| **AI Snap** | Photograph a plate → itemized foods, portions, macros, per-item confidence, and a coach note written against your remaining budget for the day |
| **Meal plan** | Multi-day plans hitting your calorie and protein targets, with recipes and a consolidated grocery list |
| **Progress** | Weight trend, BMI/body-fat estimate, tape measurements with deltas, per-exercise strength curves, progress photos |
| **Motivation** | Quote of the day, streaks, 14 achievements, mood/win/note check-in, honest weekly review |
| **Coach** | Chat that is given your targets, weight trend, today's intake and recent sessions before it answers |

## Architecture

```
wellness/
├── index.html          app shell
├── sw.js               service worker (offline shell; never caches API traffic)
├── css/                base (tokens, layout) · components · screens
└── js/
    ├── app.js          router + shell wiring
    ├── store.js        state + localStorage, subscribe/update
    ├── calc.js         BMR/TDEE/macros, units, formatting
    ├── program.js      rule-based program generator
    ├── ai.js           Claude integration
    ├── ui.js           render helpers, sheets, toasts, charts
    ├── data/           foods · exercises · quotes+achievements
    └── screens/        one module per screen (render + mount)
```

Each screen exports `render(nav) → html` and `mount(host, nav)`. `nav(name)` routes;
`nav(null)` re-renders in place. State changes go through `update(draft => …)`, which
persists and notifies.

**All data is local.** Everything lives in `localStorage` under `forge.state.v1` —
including progress photos. Nothing is uploaded. Profile → Export JSON writes a backup.

## Connecting the AI

The AI features (photo logging, meal plans, coach, daily read) call the Anthropic
Messages API. Configure under **Profile → AI coaching**, one of two ways:

**1. Proxy (recommended).** Point *Proxy endpoint* at your own HTTPS route that
forwards the JSON body to `https://api.anthropic.com/v1/messages` with your key
attached server-side. The browser never sees the key. Minimal worker:

```js
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('POST only', { status: 405 });
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: await req.text()
    });
    return new Response(res.body, {
      status: res.status,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }
};
```

**2. Direct browser call.** Paste an `sk-ant-…` key into *Anthropic API key*. Requests
go straight from the page with the `anthropic-dangerous-direct-browser-access` header.
Fine on your own device. **Do not use this mode for an app other people load** — the key
sits in their browser's local storage in plain text.

Default model is `claude-opus-5`; Sonnet 5 and Haiku 4.5 are selectable for
lower cost. Photo analysis and plan generation use structured outputs
(`output_config.format`), so responses are schema-validated JSON rather than parsed prose.

Turning AI off in settings leaves the rest of the app fully functional offline —
the program generator, food database, and every tracker are local.

## Notes on the numbers

- Calories use Mifflin–St Jeor BMR × an activity multiplier, adjusted by goal, with a
  floor at the higher of BMR or 22 kcal/kg so a target can never go dangerously low.
- Protein is 1.8–2.2 g/kg by goal; fat gets a 0.7 g/kg floor; carbs take the remainder.
- 1RM estimates use the Epley formula. Body fat is Deurenberg from BMI — a rough
  indicator, not a measurement.
- Photo macro estimates are estimates. Every one is reviewable and editable before it
  is logged.

This is a tracking tool, not medical advice.
