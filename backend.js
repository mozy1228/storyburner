const SUPABASE_URL = 'https://bybivratiknvxfrtpfzz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pk5yPu_WytSIqrXGW7vyQg_7VRN6dAZ';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const today = () => new Date().toISOString().slice(0, 10);

async function loadStoryState() {
  const { data, error } = await sb.from('story_entries')
    .select('position, content')
    .eq('story_date', today())
    .eq('status', 'approved')
    .order('position', { ascending: true });
  if (error) return;
  const last = data.at(-1);
  if (last) document.querySelector('#last-line').textContent = last.content;
  document.querySelector('#progress').textContent = data.length;
  document.querySelector('#spots').textContent = `還有 ${Math.max(0, 100 - data.length)} 個位置`;
}

document.querySelector('#relay-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const entry = document.querySelector('#entry');
  const warning = document.querySelector('#content-warning');
  const content = entry.value.trim();
  if (!content) return;
  if (hasBannedWords(content)) {
    warning.textContent = '這段文字包含不適合公開的用語，請換一種方式表達。';
    return;
  }
  const { data: approved } = await sb.from('story_entries')
    .select('position')
    .eq('story_date', today()).eq('status', 'approved')
    .order('position', { ascending: false }).limit(1);
  const position = (approved?.[0]?.position || 0) + 1;
  const { error } = await sb.from('story_entries').insert({
    story_date: today(), position, content, status: 'pending'
  });
  if (error) {
    warning.textContent = '目前無法送出，請稍後再試。';
    return;
  }
  document.querySelector('#relay-form').style.display = 'none';
  document.querySelector('#success').style.display = 'block';
  document.querySelector('#success span').textContent = `你的句子已進入審核隊列。審核通過後，會成為下一位陌生人的起點。`;
  document.querySelector('#status').textContent = '句子等待審核';
  entry.value = '';
  loadStoryState();
}, true);

loadStoryState();
