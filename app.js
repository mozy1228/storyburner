const TAIPEI_TIME_ZONE = 'Asia/Taipei';
function taipeiParts(date = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TAIPEI_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
}
window.storyburnerToday = () => { const p = taipeiParts(); return `${p.year}-${p.month}-${p.day}`; };
window.storyburnerReadingOpen = () => Number(taipeiParts().hour) >= 22;

const fireAudio = document.querySelector('#fire-audio');
const musicButton = document.querySelector('#music-button');
const volumeControl = document.querySelector('#volume');
fireAudio.volume = Number(volumeControl.value) / 100;
volumeControl.addEventListener('input', () => { fireAudio.volume = Number(volumeControl.value) / 100; });
musicButton.addEventListener('click', () => {
  if (fireAudio.paused) { fireAudio.play().catch(() => {}); musicButton.textContent = '♨ 壁爐回聲施放中'; }
  else { fireAudio.pause(); musicButton.textContent = '♨ 召喚壁爐回聲'; }
});
document.querySelector('#enter-site').addEventListener('click', () => {
  document.querySelector('#prelude').classList.add('leave');
  document.querySelector('#site-main').classList.add('entered');
  document.body.classList.add('site-entered');
  fireAudio.play().then(() => { musicButton.textContent = '♨ 壁爐回聲施放中'; }).catch(() => {});
});

const floatingPhrases = ['今晚，讓故事施下一道魔法。', '一段文字，能打開整個世界。', '把不可能寫進火光裡。', '下一章，等待你的魔法。', '午夜以前，故事仍在生長。'];
let floatingIndex = 0;
const floatingPhrase = document.querySelector('#floating-phrase');
setInterval(() => { floatingPhrase.classList.add('fade-out'); setTimeout(() => { floatingIndex = (floatingIndex + 1) % floatingPhrases.length; floatingPhrase.textContent = floatingPhrases[floatingIndex]; floatingPhrase.classList.remove('fade-out'); }, 650); }, 4300);

const screens = [...document.querySelectorAll('[data-screen]')];
const dots = [...document.querySelectorAll('.page-dot')];
let currentScreen = 0;
const spellWorkspace = document.querySelector('.workspace');
const spellTitle = document.querySelector('#spell-title');
function revealWritingSpell() {
  if (spellWorkspace.dataset.revealed) return;
  spellWorkspace.dataset.revealed = 'true';
  spellWorkspace.classList.add('spell-awake');
  [...spellTitle.dataset.text].forEach((glyph, index) => {
    const letter = document.createElement('span');
    letter.className = 'spell-glyph';
    letter.textContent = glyph;
    letter.style.animationDelay = `${index * 100}ms`;
    spellTitle.appendChild(letter);
  });
  setTimeout(() => spellWorkspace.classList.add('story-line-revealed'), spellTitle.dataset.text.length * 100 + 320);
}
function showScreen(index) {
  currentScreen = (index + screens.length) % screens.length;
  screens.forEach((screen, i) => screen.classList.toggle('active-page', i === currentScreen));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentScreen));
  document.querySelector('#prev-page').disabled = currentScreen === 0;
  document.querySelector('#next-page').disabled = currentScreen === screens.length - 1;
  if (currentScreen === 1) revealWritingSpell();
}
document.querySelector('#prev-page').addEventListener('click', () => showScreen(currentScreen - 1));
document.querySelector('#next-page').addEventListener('click', () => showScreen(currentScreen + 1));
dots.forEach(dot => dot.addEventListener('click', () => showScreen(Number(dot.dataset.page))));
showScreen(0);

const entry = document.querySelector('#entry');
const chars = document.querySelector('#chars');
const bannedWords = ['幹', '媽的', '他媽', '操', '靠北', '靠夭', '雞巴', '王八蛋', '智障', '白痴', 'fuck', 'shit', 'bitch', 'asshole'];
window.hasBannedWords = text => bannedWords.some(word => text.toLowerCase().replace(/[\s\u200b]/g, '').includes(word));
entry.addEventListener('input', () => { chars.textContent = `${entry.value.length} / 100`; document.querySelector('#content-warning').textContent = ''; });

const countdown = document.querySelector('#countdown');
let demoMode = false, burnDemoSeconds = 299, burnTimer;
const formatClock = total => `${String(Math.floor(total / 3600)).padStart(2, '0')}:${String(Math.floor(total % 3600 / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
function secondsToTaipeiMidnight() {
  const p = taipeiParts(); const localNow = new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+08:00`); const next = new Date(localNow); next.setHours(24, 0, 0, 0); return Math.max(0, Math.floor((next - localNow) / 1000));
}
function renderCountdown() { if (!demoMode) countdown.textContent = formatClock(secondsToTaipeiMidnight()); }
renderCountdown(); setInterval(renderCountdown, 1000);

const storyView = document.querySelector('#story-view');
document.querySelector('#close-story').addEventListener('click', () => { storyView.classList.remove('open'); storyView.setAttribute('aria-hidden', 'true'); });
document.querySelector('#burn-demo').addEventListener('click', () => {
  demoMode = !demoMode; const stage = document.querySelector('#burn-stage'); stage.classList.toggle('open', demoMode); stage.classList.toggle('demo-wait', demoMode); stage.classList.remove('burning-now'); stage.setAttribute('aria-hidden', String(!demoMode)); clearInterval(burnTimer);
  if (!demoMode) return renderCountdown();
  burnDemoSeconds = location.search.includes('burn-preview') ? 8 : 299; countdown.textContent = formatClock(burnDemoSeconds);
  burnTimer = setInterval(() => { burnDemoSeconds -= 1; countdown.textContent = formatClock(Math.max(0, burnDemoSeconds)); document.querySelector('#burn-countdown').textContent = burnDemoSeconds > 0 ? `${formatClock(burnDemoSeconds)} · 火焰尚未觸及羊皮紙` : '00:00:00 · 羊皮紙正在焚毀'; if (burnDemoSeconds <= 0) { clearInterval(burnTimer); stage.classList.remove('demo-wait'); stage.classList.add('burning-now'); } }, 1000);
});
document.querySelector('#close-burn').addEventListener('click', () => { demoMode = false; clearInterval(burnTimer); document.querySelector('#burn-stage').classList.remove('open', 'demo-wait', 'burning-now'); document.querySelector('#burn-stage').setAttribute('aria-hidden', 'true'); renderCountdown(); });
document.querySelector('#ticket-button-home').addEventListener('click', () => { document.querySelector('#ticket-result-home').textContent = '✦ 你的數位火柴已點燃；今晚可用它回到完整篇章。'; });
document.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('[data-vote]').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); document.querySelector('#vote-result').textContent = `你投給了「${btn.dataset.vote}」`; }));

const magicCursor = document.querySelector('#magic-cursor'); let lastMagicX = 0, lastMagicY = 0;
document.addEventListener('pointermove', event => { if (event.pointerType === 'touch' || Math.hypot(event.clientX - lastMagicX, event.clientY - lastMagicY) < 13) return; lastMagicX = event.clientX; lastMagicY = event.clientY; const spark = document.createElement('span'); spark.className = 'magic-spark'; spark.style.left = `${event.clientX}px`; spark.style.top = `${event.clientY}px`; spark.style.setProperty('--drift-x', `${(Math.random() - .5) * 34}px`); spark.style.setProperty('--drift-y', `${-12 - Math.random() * 32}px`); spark.style.setProperty('--spark-size', `${2 + Math.random() * 4}px`); spark.style.setProperty('--spark-hue', Math.random() > .72 ? '#9fd8ff' : '#e8b866'); magicCursor.appendChild(spark); setTimeout(() => spark.remove(), 900); });
const ambientMagic = document.createElement('div'); ambientMagic.className = 'ambient-magic';
for (let i = 0; i < 28; i += 1) { const mote = document.createElement('i'); mote.style.setProperty('--x', `${Math.random() * 100}%`); mote.style.setProperty('--delay', `${Math.random() * 8}s`); mote.style.setProperty('--duration', `${7 + Math.random() * 9}s`); mote.style.setProperty('--size', `${1 + Math.random() * 3}px`); mote.style.setProperty('--hue', Math.random() > .8 ? '#a7d9db' : '#e4b05d'); ambientMagic.appendChild(mote); }
document.body.appendChild(ambientMagic);
if (location.search.includes('burn-preview')) setTimeout(() => { document.querySelector('#enter-site')?.click(); setTimeout(() => document.querySelector('#burn-demo')?.click(), 900); }, 500);
