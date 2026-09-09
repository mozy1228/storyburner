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
const dailyThemes = [
  // 索引 0 對應每月 1 號，索引 30 對應每月 31 號。
  ['月光下會說話的地圖', '地圖在月光下慢慢攤開，最北端多出了一座從未存在過的塔。'],
  ['最後一班會飛的列車', '午夜鐘聲響起時，站牌前停下了一班沒有軌道的列車。'],
  ['玻璃瓶裡的小宇宙', '我打開那只玻璃瓶，裡面飄出了一顆迷你星球和一場暴風雨。'],
  ['忘記名字的龍', '那條龍伏在屋頂上，低聲問我：你知道我曾經叫什麼嗎？'],
  ['會開花的魔杖', '魔杖第一次開花時，花瓣上寫著一個我不認識的地址。'],
  ['第十三道門', '走廊盡頭原本只有十二道門，今夜卻多了一扇微微發光的門。'],
  ['把影子寄出去的人', '郵差送來一個空盒子，裡面只有我的影子正在向我揮手。'],
  ['雲端的圖書館', '那本書從雲裡掉下來，封面寫著：請替我補完最後一頁。'],
  ['會倒流的沙漏', '沙粒往上飛的瞬間，房間裡每個人都想起了明天的事。'],
  ['月亮遺失的一封信', '月亮今晚少了一角，缺口裡夾著一封還帶著銀光的信。'],
  ['不會熄滅的燭火', '那根蠟燭已經燃燒了一百年，今夜的火焰忽然說出了我的名字。'],
  ['藏在鏡子後的花園', '鏡面起霧後，有一隻沾著花粉的手從另一端敲了三下。'],
  ['被星星選中的信使', '一顆墜落的星星停在我肩上，交給我一封不能在白天打開的信。'],
  ['沒有終點的樓梯', '我沿著樓梯往上走，卻在第九十九階看見昨天的自己。'],
  ['會唱歌的盔甲', '空盔甲在走廊上唱著古老的搖籃曲，胸口藏著一把生鏽的鑰匙。'],
  ['時間販賣店', '店主把一分鐘裝進玻璃罐，問我願意用什麼來交換明天。'],
  ['能聽見夢的貓', '黑貓跳上窗台，說牠昨晚聽見我的夢在哭。'],
  ['飛毯下的祕密城市', '飛毯掀開雲層時，一座倒掛的城市正在向我們亮燈。'],
  ['會變色的湖', '湖水在午夜變成紫色，倒映出一座不屬於這個世界的城堡。'],
  ['寫給魔王的生日卡', '卡片寄錯地址後，魔王回信說他其實一直在等我。'],
  ['飄浮島嶼的最後一夜', '島嶼正緩緩往雲海深處漂去，而鐘塔只剩最後一次敲響。'],
  ['借來的翅膀', '我穿上陌生人寄來的翅膀，才發現每片羽毛都寫著一個願望。'],
  ['失落的咒語課本', '課本的空白頁在風裡翻動，自己寫下了今天還沒發生的事。'],
  ['雨滴裡的王國', '一滴雨落在掌心，裡面有位國王正向我求救。'],
  ['會記憶的森林', '樹木讓出一條路，說它們記得我上次來時答應過的事。'],
  ['無人認領的魔法箱', '月台角落的箱子忽然打開，裡面飛出一百隻尋找主人的紙鶴。'],
  ['替身人偶的夜晚', '人偶在午夜睜開眼睛，說它已經替我活了整整一天。'],
  ['通往海底的壁爐', '火焰熄滅後，壁爐裡傳來海浪聲，還有一枚正在發光的貝殼。'],
  ['世界末日的魔法郵局', '最後一封信還沒寄出，郵差便告訴我收件人住在明天。'],
  ['沉睡城堡的第七個鐘聲', '第七聲鐘響過後，所有沉睡的人同時指向了我手中的魔杖。']
];
const themeDay = Number(taipeiParts().day) - 1;
const [themeTitle, themeStarter] = dailyThemes[themeDay];
window.storyburnerTheme = { title: themeTitle, starter: themeStarter };
spellTitle.dataset.text = themeTitle;
document.querySelector('#last-line').textContent = themeStarter;
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
document.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('[data-vote]').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); document.querySelector('#vote-result').textContent = `你投給了「${btn.dataset.vote}」`; }));

const magicCursor = document.querySelector('#magic-cursor'); let lastMagicX = 0, lastMagicY = 0;
document.addEventListener('pointermove', event => { if (event.pointerType === 'touch' || Math.hypot(event.clientX - lastMagicX, event.clientY - lastMagicY) < 13) return; lastMagicX = event.clientX; lastMagicY = event.clientY; const spark = document.createElement('span'); spark.className = 'magic-spark'; spark.style.left = `${event.clientX}px`; spark.style.top = `${event.clientY}px`; spark.style.setProperty('--drift-x', `${(Math.random() - .5) * 34}px`); spark.style.setProperty('--drift-y', `${-12 - Math.random() * 32}px`); spark.style.setProperty('--spark-size', `${2 + Math.random() * 4}px`); spark.style.setProperty('--spark-hue', Math.random() > .72 ? '#9fd8ff' : '#e8b866'); magicCursor.appendChild(spark); setTimeout(() => spark.remove(), 900); });
const ambientMagic = document.createElement('div'); ambientMagic.className = 'ambient-magic';
for (let i = 0; i < 28; i += 1) { const mote = document.createElement('i'); mote.style.setProperty('--x', `${Math.random() * 100}%`); mote.style.setProperty('--delay', `${Math.random() * 8}s`); mote.style.setProperty('--duration', `${7 + Math.random() * 9}s`); mote.style.setProperty('--size', `${1 + Math.random() * 3}px`); mote.style.setProperty('--hue', Math.random() > .8 ? '#a7d9db' : '#e4b05d'); ambientMagic.appendChild(mote); }
document.body.appendChild(ambientMagic);
if (location.search.includes('burn-preview')) setTimeout(() => { document.querySelector('#enter-site')?.click(); setTimeout(() => document.querySelector('#burn-demo')?.click(), 900); }, 500);
