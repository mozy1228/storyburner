const SUPABASE_URL = 'https://bybivratiknvxfrtpfzz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pk5yPu_WytSIqrXGW7vyQg_7VRN6dAZ';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const storyDate = () => window.storyburnerToday();
const visitorStorageKey = 'storyburner-visitor-id';
let visitorId = localStorage.getItem(visitorStorageKey);
if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(visitorStorageKey, visitorId); }

const relayForm = document.querySelector('#relay-form');
const warning = document.querySelector('#content-warning');
const success = document.querySelector('#success');
const readingButton = document.querySelector('#unlock-demo');
const readingNote = document.querySelector('#reading-note');

async function loadStoryState() {
  const { data, error } = await sb.from('story_entries').select('position, content').eq('story_date', storyDate()).eq('status', 'approved').order('position', { ascending: true });
  if (error) { console.warn('讀取故事失敗', error.message); return []; }
  const last = data.at(-1);
  const lastLine = document.querySelector('#last-line');
  const quoteMeta = document.querySelector('#quote-meta');
  if (last) {
    lastLine.textContent = last.content;
    quoteMeta.textContent = `匿名段落 ${String(last.position).padStart(2, '0')} · 等待你接住故事`;
  } else {
    lastLine.textContent = window.storyburnerTheme.starter;
    quoteMeta.textContent = '開場句 · 等待第一位小說家接住它';
  }
  document.querySelector('#progress').textContent = data.length;
  document.querySelector('#spots').textContent = `還有 ${Math.max(0, 100 - data.length)} 個位置`;
  document.querySelector('#ritual-progress').textContent = data.length;
  document.querySelector('#story-count').textContent = data.length;
  return data;
}

function renderStoryLines(lines) {
  const container = document.querySelector('#story-lines');
  container.replaceChildren();
  if (!lines.length) { const empty = document.createElement('div'); empty.className = 'empty-story'; empty.textContent = '今晚的故事還沒有完成。回到羊皮紙，寫下開場吧。'; container.appendChild(empty); return; }
  lines.forEach(line => { const row = document.createElement('div'); row.className = 'story-line'; const label = document.createElement('span'); label.textContent = `匿名段落 ${String(line.position).padStart(2, '0')}`; row.append(label, document.createTextNode(line.content)); container.appendChild(row); });
}

function updateReadingState() {
  const open = window.storyburnerReadingOpen();
  readingButton.hidden = !open; readingButton.disabled = !open;
  readingNote.textContent = open ? '今晚的完整篇章已開啟，將在午夜回到寂靜。' : '完整篇章將在今晚 22:00 開啟，午夜準時焚毀。';
}

relayForm.addEventListener('submit', async event => {
  event.preventDefault();
  const content = document.querySelector('#entry').value.trim();
  if (!content) return;
  if (window.hasBannedWords(content)) { warning.textContent = '這段文字包含不適合公開的用語，請換一種方式表達。'; return; }
  warning.textContent = '正在把句子交給羊皮紙…';
  const { error } = await sb.rpc('submit_story_entry', { p_content: content, p_visitor_id: visitorId });
  if (error) { warning.textContent = error.message.includes('already') ? '你今天已留下文字；今晚 22:00 回來閱讀完整故事。' : error.message.includes('full') ? '今晚的羊皮紙已寫滿，請明天再回來。' : '目前無法送出，請稍後再試。'; return; }
  localStorage.setItem(`storyburner-submitted-${storyDate()}`, '1'); relayForm.style.display = 'none'; success.style.display = 'block'; success.querySelector('span').textContent = '你的魔法已經留在故事裡。今晚 22:00，回來閱讀完整篇章。'; document.querySelector('#status').textContent = '你已留下文字'; await loadStoryState();
});

if (localStorage.getItem(`storyburner-submitted-${storyDate()}`)) { relayForm.style.display = 'none'; success.style.display = 'block'; success.querySelector('span').textContent = '你今天已留下句子。今晚 22:00，回來閱讀完整故事。'; }
readingButton.addEventListener('click', async () => {
  if (!window.storyburnerReadingOpen()) return;
  renderStoryLines(await loadStoryState()); const view = document.querySelector('#story-view'); view.classList.add('open'); view.setAttribute('aria-hidden', 'false'); view.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
updateReadingState(); setInterval(updateReadingState, 30_000); loadStoryState();
