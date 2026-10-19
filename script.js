// ===== Scroll reveal animations =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Prompts app: passcode login + localStorage =====
const PASS_KEY = 'mjaved_owner_pass';
const PROMPTS_KEY = 'mjaved_prompts';

const authBox = document.getElementById('auth-box');
const authTitle = document.getElementById('auth-title');
const authMsg = document.getElementById('auth-msg');
const authBtn = document.getElementById('auth-btn');
const authHint = document.getElementById('auth-hint');
const passInput = document.getElementById('passcode');
const promptsApp = document.getElementById('prompts-app');

let isSetupMode = !localStorage.getItem(PASS_KEY);

function refreshAuthUI() {
  isSetupMode = !localStorage.getItem(PASS_KEY);
  if (isSetupMode) {
    authTitle.textContent = '🔐 Pehli Dafa Setup';
    authMsg.textContent = 'Apna naya passcode banayein (yaad rakhein!):';
    authBtn.textContent = 'Set Passcode';
  } else {
    authTitle.textContent = '🔐 Login';
    authMsg.textContent = 'Apna passcode likhein:';
    authBtn.textContent = 'Login';
  }
}
refreshAuthUI();

function showHint(msg, cls) {
  authHint.textContent = msg;
  authHint.className = 'auth-hint ' + cls;
}

function doAuth() {
  const val = passInput.value.trim();
  if (val.length < 4) { showHint('Passcode kam az kam 4 characters ka ho!', 'err'); return; }
  if (isSetupMode) {
    localStorage.setItem(PASS_KEY, val);
    showHint('✅ Passcode set ho gaya! Login ho gaya.', 'ok');
    setTimeout(enterApp, 600);
  } else {
    if (val === localStorage.getItem(PASS_KEY)) {
      enterApp();
    } else {
      showHint('❌ Ghalat passcode! Dobara try karein.', 'err');
      passInput.value = '';
    }
  }
}
authBtn.addEventListener('click', doAuth);
passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAuth(); });

function enterApp() {
  authBox.classList.add('hidden');
  promptsApp.classList.remove('hidden');
  renderPrompts();
}

document.getElementById('logout-btn').addEventListener('click', () => {
  promptsApp.classList.add('hidden');
  authBox.classList.remove('hidden');
  passInput.value = '';
  showHint('', '');
  refreshAuthUI();
});

// ===== Prompts CRUD =====
function getPrompts() {
  try { return JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]'); }
  catch { return []; }
}
function savePrompts(list) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(list));
}

const promptList = document.getElementById('prompt-list');
const promptForm = document.getElementById('prompt-form');
const pTitle = document.getElementById('prompt-title');
const pText = document.getElementById('prompt-text');
let editingId = null;

function renderPrompts() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const list = getPrompts().filter(p =>
    !q || p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q));
  promptList.innerHTML = '';
  if (!list.length) {
    promptList.innerHTML = '<div class="empty-msg">📝 Abhi koi prompt nahi hai. "Naya Prompt" dabayein!</div>';
    return;
  }
  list.slice().reverse().forEach(p => {
    const div = document.createElement('div');
    div.className = 'prompt-item';
    const h = document.createElement('h4'); h.textContent = p.title;
    const para = document.createElement('p'); para.textContent = p.text;
    const actions = document.createElement('div'); actions.className = 'prompt-actions';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-small btn-copy'; copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(p.text).then(() => {
        copyBtn.textContent = '✅ Copied!'; setTimeout(() => copyBtn.textContent = '📋 Copy', 1200);
      });
    };
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-small btn-del'; delBtn.textContent = '🗑 Delete';
    delBtn.onclick = () => {
      if (confirm('Ye prompt delete kar dein?')) {
        savePrompts(getPrompts().filter(x => x.id !== p.id));
        renderPrompts();
      }
    };
    actions.appendChild(copyBtn); actions.appendChild(delBtn);
    div.appendChild(h); div.appendChild(para); div.appendChild(actions);
    promptList.appendChild(div);
  });
}

document.getElementById('search').addEventListener('input', renderPrompts);
document.getElementById('add-btn').addEventListener('click', () => {
  editingId = null; pTitle.value = ''; pText.value = '';
  promptForm.classList.remove('hidden');
  pTitle.focus();
});
document.getElementById('cancel-btn').addEventListener('click', () => {
  promptForm.classList.add('hidden');
});
document.getElementById('save-btn').addEventListener('click', () => {
  const t = pTitle.value.trim(), x = pText.value.trim();
  if (!t || !x) { alert('Title aur prompt dono likhein!'); return; }
  const list = getPrompts();
  list.push({ id: Date.now(), title: t, text: x });
  savePrompts(list);
  promptForm.classList.add('hidden');
  renderPrompts();
});
