/* ═══════════════════════════════════════════════════════
   exercises.js — exercise library
   equip: barbell | dumbbell | machine | cable | bodyweight | kettlebell | band
   pattern: squat | hinge | push-h | push-v | pull-h | pull-v | lunge | carry | core | iso | cardio
   ═══════════════════════════════════════════════════════ */

export const EXERCISES = [
  // ── Squat / quad ──
  { id: 'back-squat', name: 'Barbell Back Squat', equip: 'barbell', pattern: 'squat', muscles: ['quads', 'glutes', 'core'], compound: true, tip: 'Brace hard, break at hips and knees together, drive the floor apart.' },
  { id: 'front-squat', name: 'Front Squat', equip: 'barbell', pattern: 'squat', muscles: ['quads', 'core'], compound: true, tip: 'Elbows high through the whole rep — the bar follows the elbows.' },
  { id: 'goblet-squat', name: 'Goblet Squat', equip: 'dumbbell', pattern: 'squat', muscles: ['quads', 'glutes'], compound: true, tip: 'Sit between your knees, keep the chest tall.' },
  { id: 'leg-press', name: 'Leg Press', equip: 'machine', pattern: 'squat', muscles: ['quads', 'glutes'], compound: true, tip: 'Do not let the lower back round off the pad at the bottom.' },
  { id: 'hack-squat', name: 'Hack Squat', equip: 'machine', pattern: 'squat', muscles: ['quads'], compound: true, tip: 'Great quad overload with a fixed path — go deep.' },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squat', equip: 'dumbbell', pattern: 'lunge', muscles: ['quads', 'glutes'], compound: true, tip: 'Front shin vertical for quads, torso leaned forward for glutes.' },
  { id: 'walking-lunge', name: 'Walking Lunge', equip: 'dumbbell', pattern: 'lunge', muscles: ['quads', 'glutes'], compound: true, tip: 'Long steps, control the descent.' },
  { id: 'step-up', name: 'Dumbbell Step-Up', equip: 'dumbbell', pattern: 'lunge', muscles: ['quads', 'glutes'], compound: true, tip: 'Drive through the whole front foot, do not push off the back leg.' },
  { id: 'leg-extension', name: 'Leg Extension', equip: 'machine', pattern: 'iso', muscles: ['quads'], compound: false, tip: 'Pause a beat at the top for the rectus femoris.' },
  { id: 'air-squat', name: 'Bodyweight Squat', equip: 'bodyweight', pattern: 'squat', muscles: ['quads', 'glutes'], compound: true, tip: 'Slow the descent to 3 seconds to add difficulty.' },

  // ── Hinge / posterior ──
  { id: 'deadlift', name: 'Conventional Deadlift', equip: 'barbell', pattern: 'hinge', muscles: ['hamstrings', 'glutes', 'back'], compound: true, tip: 'Take the slack out of the bar before you pull. Neutral spine, no jerking.' },
  { id: 'rdl', name: 'Romanian Deadlift', equip: 'barbell', pattern: 'hinge', muscles: ['hamstrings', 'glutes'], compound: true, tip: 'Push the hips back, bar stays against the legs, stop at mid-shin.' },
  { id: 'db-rdl', name: 'Dumbbell RDL', equip: 'dumbbell', pattern: 'hinge', muscles: ['hamstrings', 'glutes'], compound: true, tip: 'Feel the stretch in the hamstrings — that is the rep.' },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', equip: 'barbell', pattern: 'hinge', muscles: ['glutes'], compound: true, tip: 'Chin tucked, ribs down, squeeze hard for a full second at the top.' },
  { id: 'kb-swing', name: 'Kettlebell Swing', equip: 'kettlebell', pattern: 'hinge', muscles: ['glutes', 'hamstrings', 'core'], compound: true, tip: 'It is a hip snap, not a squat or a front raise.' },
  { id: 'good-morning', name: 'Good Morning', equip: 'barbell', pattern: 'hinge', muscles: ['hamstrings', 'back'], compound: true, tip: 'Start light. Soft knees, hinge from the hips.' },
  { id: 'leg-curl', name: 'Lying Leg Curl', equip: 'machine', pattern: 'iso', muscles: ['hamstrings'], compound: false, tip: 'Control the eccentric for 3 seconds.' },
  { id: 'back-extension', name: 'Back Extension', equip: 'bodyweight', pattern: 'hinge', muscles: ['glutes', 'lower back'], compound: false, tip: 'Round-and-extend for glutes, flat back for spinal erectors.' },
  { id: 'glute-bridge', name: 'Glute Bridge', equip: 'bodyweight', pattern: 'hinge', muscles: ['glutes'], compound: false, tip: 'Posterior tilt the pelvis before every rep.' },

  // ── Horizontal push ──
  { id: 'bench-press', name: 'Barbell Bench Press', equip: 'barbell', pattern: 'push-h', muscles: ['chest', 'triceps', 'shoulders'], compound: true, tip: 'Shoulder blades pinned back and down, bar to lower chest.' },
  { id: 'incline-bench', name: 'Incline Barbell Press', equip: 'barbell', pattern: 'push-h', muscles: ['upper chest', 'shoulders'], compound: true, tip: '30° is enough — steeper turns it into a shoulder press.' },
  { id: 'db-bench', name: 'Dumbbell Bench Press', equip: 'dumbbell', pattern: 'push-h', muscles: ['chest', 'triceps'], compound: true, tip: 'Bigger stretch than the barbell. Do not clang them at the top.' },
  { id: 'incline-db', name: 'Incline Dumbbell Press', equip: 'dumbbell', pattern: 'push-h', muscles: ['upper chest'], compound: true, tip: 'The best single builder for the upper chest shelf.' },
  { id: 'machine-chest', name: 'Machine Chest Press', equip: 'machine', pattern: 'push-h', muscles: ['chest'], compound: true, tip: 'Ideal for pushing close to failure safely.' },
  { id: 'cable-fly', name: 'Cable Fly', equip: 'cable', pattern: 'iso', muscles: ['chest'], compound: false, tip: 'Think of hugging a barrel; slight elbow bend held constant.' },
  { id: 'pushup', name: 'Push-Up', equip: 'bodyweight', pattern: 'push-h', muscles: ['chest', 'triceps', 'core'], compound: true, tip: 'Body in one line — no sagging hips.' },
  { id: 'dip', name: 'Chest Dip', equip: 'bodyweight', pattern: 'push-h', muscles: ['chest', 'triceps'], compound: true, tip: 'Lean forward for chest, stay upright for triceps.' },

  // ── Vertical push ──
  { id: 'ohp', name: 'Overhead Press', equip: 'barbell', pattern: 'push-v', muscles: ['shoulders', 'triceps'], compound: true, tip: 'Squeeze glutes to stop the lower back from arching. Head through at lockout.' },
  { id: 'db-shoulder', name: 'Dumbbell Shoulder Press', equip: 'dumbbell', pattern: 'push-v', muscles: ['shoulders'], compound: true, tip: 'Seated with back support if the lower back complains.' },
  { id: 'arnold-press', name: 'Arnold Press', equip: 'dumbbell', pattern: 'push-v', muscles: ['shoulders'], compound: true, tip: 'Rotate through the full range for front and side delts.' },
  { id: 'lateral-raise', name: 'Lateral Raise', equip: 'dumbbell', pattern: 'iso', muscles: ['side delts'], compound: false, tip: 'Light weight, lead with the elbows, no swinging.' },
  { id: 'cable-lateral', name: 'Cable Lateral Raise', equip: 'cable', pattern: 'iso', muscles: ['side delts'], compound: false, tip: 'Constant tension beats dumbbells here.' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', equip: 'dumbbell', pattern: 'iso', muscles: ['rear delts'], compound: false, tip: 'Most underrated exercise for shoulder health and posture.' },
  { id: 'face-pull', name: 'Face Pull', equip: 'cable', pattern: 'pull-h', muscles: ['rear delts', 'upper back'], compound: false, tip: 'Pull to the forehead, externally rotate at the end.' },

  // ── Vertical pull ──
  { id: 'pullup', name: 'Pull-Up', equip: 'bodyweight', pattern: 'pull-v', muscles: ['lats', 'biceps'], compound: true, tip: 'Start from a dead hang, drive the elbows to the ribs.' },
  { id: 'chinup', name: 'Chin-Up', equip: 'bodyweight', pattern: 'pull-v', muscles: ['lats', 'biceps'], compound: true, tip: 'More biceps than the pull-up, and usually stronger.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', equip: 'machine', pattern: 'pull-v', muscles: ['lats', 'biceps'], compound: true, tip: 'Lean back slightly and pull to the collarbone.' },
  { id: 'assisted-pullup', name: 'Assisted Pull-Up', equip: 'machine', pattern: 'pull-v', muscles: ['lats', 'biceps'], compound: true, tip: 'Reduce assistance a little every week.' },

  // ── Horizontal pull ──
  { id: 'barbell-row', name: 'Barbell Row', equip: 'barbell', pattern: 'pull-h', muscles: ['back', 'biceps'], compound: true, tip: 'Torso around 45°, pull to the belly button, no heaving.' },
  { id: 'pendlay-row', name: 'Pendlay Row', equip: 'barbell', pattern: 'pull-h', muscles: ['back'], compound: true, tip: 'Reset on the floor each rep — pure concentric power.' },
  { id: 'db-row', name: 'One-Arm Dumbbell Row', equip: 'dumbbell', pattern: 'pull-h', muscles: ['lats', 'back'], compound: true, tip: 'Let the shoulder blade travel — full stretch, full squeeze.' },
  { id: 'seated-row', name: 'Seated Cable Row', equip: 'cable', pattern: 'pull-h', muscles: ['back', 'biceps'], compound: true, tip: 'Chest tall, do not rock for momentum.' },
  { id: 'chest-supported-row', name: 'Chest-Supported Row', equip: 'machine', pattern: 'pull-h', muscles: ['back'], compound: true, tip: 'Removes the lower back from the equation — go heavy.' },
  { id: 'inverted-row', name: 'Inverted Row', equip: 'bodyweight', pattern: 'pull-h', muscles: ['back', 'biceps'], compound: true, tip: 'Raise the bar to make it easier, lower it to make it harder.' },

  // ── Arms ──
  { id: 'barbell-curl', name: 'Barbell Curl', equip: 'barbell', pattern: 'iso', muscles: ['biceps'], compound: false, tip: 'Elbows pinned at the sides. No hip swing.' },
  { id: 'db-curl', name: 'Dumbbell Curl', equip: 'dumbbell', pattern: 'iso', muscles: ['biceps'], compound: false, tip: 'Supinate as you curl for the peak.' },
  { id: 'incline-curl', name: 'Incline Dumbbell Curl', equip: 'dumbbell', pattern: 'iso', muscles: ['biceps'], compound: false, tip: 'Best stretch position for the long head.' },
  { id: 'hammer-curl', name: 'Hammer Curl', equip: 'dumbbell', pattern: 'iso', muscles: ['biceps', 'forearms'], compound: false, tip: 'Builds the brachialis — adds arm width.' },
  { id: 'cable-curl', name: 'Cable Curl', equip: 'cable', pattern: 'iso', muscles: ['biceps'], compound: false, tip: 'Tension never drops. Great finisher.' },
  { id: 'skullcrusher', name: 'Skullcrusher', equip: 'barbell', pattern: 'iso', muscles: ['triceps'], compound: false, tip: 'Lower behind the head, not to the forehead — bigger stretch.' },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', equip: 'cable', pattern: 'iso', muscles: ['triceps'], compound: false, tip: 'Lock the elbows at your sides and extend fully.' },
  { id: 'overhead-ext', name: 'Overhead Triceps Extension', equip: 'cable', pattern: 'iso', muscles: ['triceps'], compound: false, tip: 'Only position that fully stretches the long head.' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', equip: 'barbell', pattern: 'push-h', muscles: ['triceps', 'chest'], compound: true, tip: 'Shoulder-width grip. Wrists stacked over elbows.' },

  // ── Core ──
  { id: 'plank', name: 'Plank', equip: 'bodyweight', pattern: 'core', muscles: ['core'], compound: false, tip: 'Squeeze glutes and quads — it should be hard at 30 seconds.' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', equip: 'bodyweight', pattern: 'core', muscles: ['abs', 'hip flexors'], compound: false, tip: 'Curl the pelvis up; do not just swing the legs.' },
  { id: 'cable-crunch', name: 'Cable Crunch', equip: 'cable', pattern: 'core', muscles: ['abs'], compound: false, tip: 'Loadable abs — treat it like any other lift and progress it.' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', equip: 'bodyweight', pattern: 'core', muscles: ['abs', 'core'], compound: false, tip: 'Keep a posterior pelvic tilt the entire way out.' },
  { id: 'dead-bug', name: 'Dead Bug', equip: 'bodyweight', pattern: 'core', muscles: ['core'], compound: false, tip: 'Lower back stays glued to the floor.' },
  { id: 'pallof-press', name: 'Pallof Press', equip: 'cable', pattern: 'core', muscles: ['core', 'obliques'], compound: false, tip: 'Anti-rotation — resist the pull, do not create it.' },
  { id: 'side-plank', name: 'Side Plank', equip: 'bodyweight', pattern: 'core', muscles: ['obliques'], compound: false, tip: 'Stack the hips, lift them high.' },

  // ── Calves / accessories ──
  { id: 'standing-calf', name: 'Standing Calf Raise', equip: 'machine', pattern: 'iso', muscles: ['calves'], compound: false, tip: 'Full stretch at the bottom, 1-second squeeze at the top.' },
  { id: 'seated-calf', name: 'Seated Calf Raise', equip: 'machine', pattern: 'iso', muscles: ['calves'], compound: false, tip: 'Targets the soleus — higher reps work best.' },
  { id: 'farmer-carry', name: "Farmer's Carry", equip: 'dumbbell', pattern: 'carry', muscles: ['core', 'traps', 'forearms'], compound: true, tip: 'Tall posture, short quick steps.' },
  { id: 'shrug', name: 'Dumbbell Shrug', equip: 'dumbbell', pattern: 'iso', muscles: ['traps'], compound: false, tip: 'Straight up and down. Pause at the top.' },

  // ── Conditioning ──
  { id: 'incline-walk', name: 'Incline Treadmill Walk', equip: 'machine', pattern: 'cardio', muscles: ['cardio'], compound: false, tip: '12% incline at 5 km/h. No hands on the rails.' },
  { id: 'row-erg', name: 'Rowing Machine', equip: 'machine', pattern: 'cardio', muscles: ['cardio', 'back'], compound: false, tip: 'Legs → back → arms on the drive, reverse on the recovery.' },
  { id: 'bike-intervals', name: 'Bike Intervals', equip: 'machine', pattern: 'cardio', muscles: ['cardio'], compound: false, tip: '30s hard / 90s easy × 8 rounds.' },
  { id: 'jump-rope', name: 'Jump Rope', equip: 'bodyweight', pattern: 'cardio', muscles: ['cardio', 'calves'], compound: false, tip: 'Small hops, wrists do the work.' },
  { id: 'burpee', name: 'Burpee', equip: 'bodyweight', pattern: 'cardio', muscles: ['cardio', 'full body'], compound: true, tip: 'Pace yourself — steady beats sprint-and-die.' }
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function findExercise(id) {
  return byId[id] || { id, name: id, muscles: [], equip: 'other', tip: '' };
}

export function searchExercises(q, equipment = null) {
  const term = q.trim().toLowerCase();
  return EXERCISES.filter((e) => {
    if (equipment && equipment.length && !equipment.includes(e.equip)) return false;
    if (!term) return true;
    return e.name.toLowerCase().includes(term) || e.muscles.some((m) => m.includes(term));
  });
}
