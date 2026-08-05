/* ═══════════════════════════════════════════════════════
   coach.js — AI coach chat
   ═══════════════════════════════════════════════════════ */

import { get, update, dayTotals, computeStreak } from '../store.js';
import { esc, icon, toast, lightMarkdown, confirmSheet } from '../ui.js';
import { aiConfigured, coachChat } from '../ai.js';

let sending = false;

const STARTERS = [
  'Am I eating enough protein?',
  'Why has my weight stalled?',
  'What should I eat tonight to hit my macros?',
  'My knee hurts on squats — what do I swap?',
  'Is my program actually working?',
  'How do I stay on track this weekend?'
];

export function render(nav) {
  const s = get();
  const thread = s.coachThread;

  if (!aiConfigured()) {
    return `
      <div class="stack fade-in">
        <div class="card">
          <div class="empty">
            <div class="empty-icon">💬</div>
            <h4>Coach is not connected</h4>
            <p>The coach answers using your logged data — weight trend, macros, training history. It needs an Anthropic API key or a proxy endpoint.</p>
            <button class="btn btn-primary" data-go="profile">Connect AI</button>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">What you could ask it</div></div>
          <div class="chip-row">${STARTERS.map((q) => `<span class="chip">${esc(q)}</span>`).join('')}</div>
        </div>
      </div>`;
  }

  return `
    <div class="fade-in" style="display:flex;flex-direction:column;min-height:60vh">
      ${thread.length ? `
        <div class="row-between" style="margin-bottom:12px">
          <span class="tiny dim">${thread.length} message${thread.length === 1 ? '' : 's'} · the coach sees your current stats</span>
          <button class="btn btn-ghost btn-sm" data-act="clear">Clear</button>
        </div>` : ''}

      <div class="chat-thread grow" id="chatThread">
        ${thread.length ? thread.map(renderMessage).join('') : renderIntro(s)}
        <div id="typingSlot"></div>
      </div>

      <div class="chat-composer">
        <textarea class="textarea grow" id="chatInput" rows="1" placeholder="Ask your coach anything…"></textarea>
        <button class="icon-btn" id="chatSend" style="width:48px;height:48px;background:var(--accent);color:#06120C;border:none" aria-label="Send">
          ${icon('play', 17)}
        </button>
      </div>
    </div>`;
}

function renderIntro(s) {
  return `
    <div class="msg ai">
      <div class="msg-bubble">
        Hey${s.profile.name ? ` ${esc(s.profile.name)}` : ''} — I can see your targets, your weight trend, what you have eaten today, and your recent sessions. Ask me anything about training, food, or why the numbers are doing what they are doing.
      </div>
    </div>
    <div class="chip-row" style="margin-top:6px">
      ${STARTERS.map((q) => `<button class="chip" data-starter="${esc(q)}">${esc(q)}</button>`).join('')}
    </div>`;
}

function renderMessage(m) {
  return `
    <div class="msg ${m.role === 'user' ? 'user' : 'ai'}">
      <div class="msg-bubble">${m.role === 'user' ? esc(m.content) : lightMarkdown(m.content)}</div>
    </div>`;
}

/* ── Events ────────────────────────────────────────── */

export function mount(host, nav) {
  host.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.go)));

  const input = host.querySelector('#chatInput');
  const sendBtn = host.querySelector('#chatSend');
  const thread = host.querySelector('#chatThread');
  if (!input) return;

  thread.scrollIntoView({ block: 'end' });
  window.scrollTo(0, document.body.scrollHeight);

  const autosize = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(140, input.scrollHeight) + 'px';
  };
  input.addEventListener('input', autosize);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 900) {
      e.preventDefault();
      send();
    }
  });

  sendBtn.addEventListener('click', send);

  host.querySelectorAll('[data-starter]').forEach((b) => b.addEventListener('click', () => {
    input.value = b.dataset.starter;
    autosize();
    send();
  }));

  host.querySelector('[data-act="clear"]')?.addEventListener('click', async () => {
    if (await confirmSheet('Clear conversation?', 'The whole thread will be deleted.', 'Clear')) {
      update((s) => { s.coachThread = []; });
      nav(null);
    }
  });

  async function send() {
    const text = input.value.trim();
    if (!text || sending) return;
    sending = true;

    update((s) => { s.coachThread.push({ role: 'user', content: text, at: Date.now() }); });
    input.value = '';
    autosize();

    // Append optimistically so the thread does not flash on re-render
    thread.querySelector('#typingSlot').insertAdjacentHTML('beforebegin', renderMessage({ role: 'user', content: text }));
    thread.querySelector('#typingSlot').innerHTML = `<div class="msg ai"><div class="msg-bubble typing"><span></span><span></span><span></span></div></div>`;
    thread.scrollTop = thread.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
    sendBtn.disabled = true;

    try {
      const history = get().coachThread.slice(-16).map((m) => ({ role: m.role, content: m.content }));
      const reply = await coachChat(history, { eaten: dayTotals(), streak: computeStreak() });
      update((s) => { s.coachThread.push({ role: 'assistant', content: reply, at: Date.now() }); });
      sending = false;
      nav(null);
      requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
    } catch (err) {
      sending = false;
      sendBtn.disabled = false;
      thread.querySelector('#typingSlot').innerHTML =
        `<div class="callout warn"><span class="callout-icon">⚠️</span><span>${esc(err.message)}</span></div>`;
    }
  }
}
