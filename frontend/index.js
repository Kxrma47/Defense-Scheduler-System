// Safari compatibility fix - simple approach without ReadableStream
(function() {
    // Enhanced fetch polyfill for Safari compatibility
    if (typeof window.fetch === 'function') {
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            // Ensure we have a proper init object
            init = init || {};
            
            // Safari compatibility: ensure headers are properly set
            if (init.headers && !(init.headers instanceof Headers)) {
                const headers = new Headers();
                Object.keys(init.headers).forEach(key => {
                    headers.set(key, init.headers[key]);
                });
                init.headers = headers;
            }
            
            // Safari compatibility: handle response.json() properly
            return originalFetch(input, init).then(response => {
                // Add a safe json() method that handles Safari issues
                const originalJson = response.json;
                response.json = function() {
                    try {
                        return originalJson.call(this);
                    } catch (error) {
                        // Fallback for Safari issues - use text() instead
                        if (error.name === 'TypeError') {
                            return this.text().then(text => {
                                try {
                                    return JSON.parse(text);
                                } catch (e) {
                                    throw new Error('Failed to parse JSON: ' + e.message);
                                }
                            });
                        }
                        throw error;
                    }
                };
                
                return response;
            });
        };
    }
})();

const API = '/backend/index.php';
const $  = (s)=>document.querySelector(s);
const tilesBox = $('#tiles');

/* ---------------- I18N ---------------- */
const I = {
    en: {
        title_app: 'Defense Scheduler',
        subtitle: 'Paste your token, then choose a console.',
        ph_token: 'Paste your auth token',
        show: 'Show', hide: 'Hide',
        consoles: 'Consoles',
        consoles_tip: 'Access is strictly role-gated. Tip: press <b>1</b>, <b>2</b>, or <b>3</b> to quick-launch a console.',
        manager_tile_title: 'Manager Console',
        manager_tile_desc: 'Full control over windows, offers & users.',
        assistant_tile_title: 'Assistant Console',
        assistant_tile_desc: 'Almost everything; limited user controls.',
        prof_tile_title: 'Professor Console',
        prof_tile_desc: 'Review offers and see your slots.',
        tips_title: 'Tips',
        tip1: 'Paste your token and pause for a second — we’ll auto-detect your role and light up the right tile.',
        tip2: 'Press <b>Enter</b> to quick-launch your detected console after pasting a valid token.',
        tip3: 'We never store your token server-side here — it only goes to your browser’s storage.',
        detected_role: 'Detected role',
        please_token: 'Please paste a token first.',
        invalid_token: 'Invalid token or server error.',
        network_err: 'Network error. Please try again.',
        access_denied: 'Access denied. Your role is "{role}". This console requires "{need}".',
        welcome_small: 'Authenticated',
        welcome_big: 'Welcome to the Scheduler Dashboard, {role}',
        welcome_sub: 'Loading your console',
        sel_title_asst: 'Select an assistant account',
        sel_title_prof: 'Select a professor account',
        sel_search: 'Search by name…',
        sel_none: 'No accounts found.',
        sel_cancel: 'Cancel',
        sel_use: 'Use account',
    },
    ru: {
        title_app: 'Планировщик защит',
        subtitle: 'Вставьте токен и выберите консоль.',
        ph_token: 'Вставьте токен доступа',
        show: 'Показать', hide: 'Скрыть',
        consoles: 'Консоли',
        consoles_tip: 'Доступ зависит от роли. Подсказка: нажмите <b>1</b>, <b>2</b> или <b>3</b>, чтобы быстро открыть консоль.',
        manager_tile_title: 'Консоль менеджера',
        manager_tile_desc: 'Полный контроль над окнами, предложениями и пользователями.',
        assistant_tile_title: 'Консоль ассистента',
        assistant_tile_desc: 'Почти все функции; ограниченное управление пользователями.',
        prof_tile_title: 'Консоль преподавателя',
        prof_tile_desc: 'Просмотр предложений и своих слотов.',
        tips_title: 'Подсказки',
        tip1: 'Вставьте токен и подождите секунду — система определит вашу роль и подсветит нужную плитку.',
        tip2: 'Нажмите <b>Enter</b>, чтобы быстро открыть нужную консоль после ввода токена.',
        tip3: 'Токен не хранится на сервере — только в памяти вашего браузера.',
        detected_role: 'Определена роль',
        please_token: 'Сначала вставьте токен.',
        invalid_token: 'Неверный токен или ошибка сервера.',
        network_err: 'Сетевая ошибка. Повторите попытку.',
        access_denied: 'Доступ запрещён. Ваша роль — «{role}». Требуется «{need}».',
        welcome_small: 'Авторизация выполнена',
        welcome_big: 'Добро пожаловать в панель, {role}',
        welcome_sub: 'Загрузка консоли',
        sel_title_asst: 'Выберите аккаунт ассистента',
        sel_title_prof: 'Выберите аккаунт преподавателя',
        sel_search: 'Поиск по имени…',
        sel_none: 'Аккаунты не найдены.',
        sel_cancel: 'Отмена',
        sel_use: 'Использовать аккаунт',
    }
};
let LANG = localStorage.getItem('lang') || 'en';
function t(key){ return (I[LANG] && I[LANG][key]) || key; }
function applyI18n(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    $('#token').setAttribute('placeholder', t('ph_token'));
    $('#selSearch').setAttribute('placeholder', t('sel_search'));
    $('#btnSelCancel').textContent = t('sel_cancel');
    $('#btnSelUse').textContent = t('sel_use');
    $('#eyeText').textContent = hidden ? t('show') : t('hide');
    document.getElementById('lang_en').classList.toggle('active', LANG==='en');
    document.getElementById('lang_ru').classList.toggle('active', LANG==='ru');
    document.getElementById('lang_en').setAttribute('aria-selected', LANG==='en'?'true':'false');
    document.getElementById('lang_ru').setAttribute('aria-selected', LANG==='ru'?'true':'false');
}
function setLang(l){ LANG=l; localStorage.setItem('lang', l); applyI18n(); }

document.addEventListener('click', (e)=>{
    const b = e.target.closest('button[data-lang]');
    if(b){ setLang(b.getAttribute('data-lang')); }
});

/* -------------- UI init -------------- */
window.addEventListener('load', ()=>{
    applyI18n();
    requestAnimationFrame(()=> tilesBox.classList.add('tiles-start'));
    document.querySelectorAll('.tile').forEach(t=>{
        t.addEventListener('mousemove', (e)=>{
            const r = t.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const cx = x / r.width - .5, cy = y / r.height - .5;
            t.style.transform = `translateY(-3px) scale(1.01) rotateX(${(-cy*4)}deg) rotateY(${(cx*6)}deg)`;
        });
        t.addEventListener('mouseleave', ()=>{ t.style.transform=''; });
        t.addEventListener('click', addRipple);
    });
});

function addRipple(e){
    const target = e.currentTarget;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = target.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left) + 'px';
    r.style.top  = (e.clientY - rect.top) + 'px';
    target.appendChild(r);
    setTimeout(()=> r.remove(), 700);
}

const tokenInput = $('#token');
const msgEl = $('#msg');
const eye = $('#toggleEye');
let hidden = true;
let detectTimer = null;
let lastDetectedRole = null;

eye.addEventListener('click', ()=>{
    hidden = !hidden;
    tokenInput.setAttribute('type', hidden ? 'password' : 'text');
    $('#eyeText').textContent = hidden ? t('show') : t('hide');
});
tokenInput.addEventListener('focus', ()=>{ if(hidden){ tokenInput.setAttribute('type','password'); } });

tokenInput.addEventListener('input', ()=>{
    setMsg('');
    lastDetectedRole = null;
    if(detectTimer) clearTimeout(detectTimer);
    const val = tokenInput.value.trim();
    if(!val){ paintTiles(null); msgEl.innerHTML=''; return; }

    // If default tokens => open account selector
    if(val === '123' || val === '321'){
        openAccountSelector(val==='123' ? 'assistant' : 'professor');
    }

    detectTimer = setTimeout(()=> autoDetectRole(val), 450);
});

function roleMeta(role){
    return ({
        manager  : { accent:'#06b6d4', border:'#0ea5b7', g1:'#0b2436', g2:'#081523', label: LANG==='ru'?'Менеджер':'Manager' },
        assistant: { accent:'#3b82f6', border:'#2d5df1', g1:'#0b1b3a', g2:'#081326', label: LANG==='ru'?'Ассистент':'Assistant'},
        professor: { accent:'#f59e0b', border:'#ca8a04', g1:'#241a0b', g2:'#1b1208', label: LANG==='ru'?'Преподаватель':'Professor'}
    })[role] || { accent:'#60a5fa', border:'#264164', g1:'#0f172a', g2:'#0b1220', label: role||'User' };
}

// Selected "as" id for default tokens
let selectedAsId = null;

async function autoDetectRole(tok){
    try{
        // If default token and we already chose an account, append selector into token
        let effTok = tok;
        if((tok==='123' || tok==='321') && selectedAsId){
            effTok = tok + '|as=' + selectedAsId;
        }
        const r = await fetch(API+'?action=whoami', { headers:{'Authorization':'Bearer '+effTok} });
        if(!r.ok){ paintTiles(null); setMsg(t('invalid_token'), true); return; }
        const j = await r.json();
        const me = j.user;
        if(!me){ paintTiles(null); setMsg(t('invalid_token'), true); return; }

        lastDetectedRole = me.role;
        const meta = roleMeta(me.role);
        paintTiles(me.role);

        msgEl.innerHTML = `<span class="role-pill ok"><span class="role-dot" style="background:${meta.accent}"></span>${t('detected_role')}: <b>${meta.label}</b></span>`;
    }catch(e){
        paintTiles(null);
        setMsg(t('network_err'), true);
    }
}

function paintTiles(activeRole){
    document.querySelectorAll('.tile').forEach(t=>{
        const role = t.getAttribute('data-role');
        t.style.opacity = activeRole ? (role===activeRole ? 1 : .55) : 1;
        t.style.filter  = activeRole ? (role===activeRole ? 'none' : 'grayscale(.3)') : 'none';
        t.style.borderColor = (activeRole && role===activeRole) ? '#2a4c7a' : 'var(--line)';
    });
}

function setMsg(text, isErr=false){
    msgEl.className = isErr ? 'muted err' : 'muted';
    msgEl.textContent = text || '';
}

function showWelcome(role){
    const w = $('#welcome');
    const meta = roleMeta(role);
    w.style.setProperty('--w-accent', meta.accent);
    w.style.setProperty('--w-border', meta.border);
    w.style.setProperty('--w-grad1',  meta.g1);
    w.style.setProperty('--w-grad2',  meta.g2);
    $('#wSmall').textContent = t('welcome_small');
    $('#wBig').textContent   = (t('welcome_big')).replace('{role}', meta.label);
    $('#wSub').innerHTML     = t('welcome_sub') + '<span class="pulse-dot"></span>';
    w.classList.add('show');
    w.setAttribute('aria-hidden','false');
}

async function go(ev, page, roleNeeded){
    setMsg('');
    const raw = (tokenInput.value || '').trim();
    if(!raw){ setMsg(t('please_token'), true); return; }

    // If default token and not selected yet, prompt selector for the appropriate role
    if((raw==='123' && roleNeeded==='assistant') || (raw==='321' && roleNeeded==='professor')){
        if(!selectedAsId){ openAccountSelector(roleNeeded); return; }
    }

    let tok = raw;
    if((raw==='123' || raw==='321') && selectedAsId){
        tok = raw + '|as=' + selectedAsId;
    }

    let me = null;
    try{
        const r = await fetch(API+'?action=whoami', { headers:{'Authorization':'Bearer '+tok} });
        if(!r.ok){ setMsg(t('invalid_token'), true); return; }
        const j = await r.json();
        me = j.user || null;
    }catch(e){ setMsg(t('network_err'), true); return; }

    if(!me){ setMsg(t('invalid_token'), true); return; }
    if(me.role !== roleNeeded){
        const msg = t('access_denied')
            .replace('{role}', me.role)
            .replace('{need}', roleNeeded);
        setMsg(msg, true);
        paintTiles(me.role);
        return;
    }
    showWelcome(me.role);
    localStorage.setItem('defense_token', tok);
    setTimeout(()=> { location.href = page; }, 950);
}

document.addEventListener('keydown', (e)=>{
    if(e.key==='1'){ document.querySelector('.tile[data-role="manager"]')?.click(); }
    if(e.key==='2'){ document.querySelector('.tile[data-role="assistant"]')?.click(); }
    if(e.key==='3'){ document.querySelector('.tile[data-role="professor"]')?.click(); }
    if(e.key==='Enter' && lastDetectedRole){
        const map = {manager:'manager.html', assistant:'assistant.html', professor:'professor.html'};
        const page = map[lastDetectedRole];
        if(page) go(null, page, lastDetectedRole);
    }
});

/* -------- Account selector for default tokens (assistant=123, professor=321) -------- */
const sel = {
    box: $('#acctSel'),
    list: $('#selList'),
    search: $('#selSearch'),
    btnUse: $('#btnSelUse'),
    btnCancel: $('#btnSelCancel'),
    msg: $('#selMsg'),
    title: $('#selTitle'),
    role: null,
    data: [],
    selected: null
};

function openAccountSelector(role){
    sel.role = role;
    sel.selected = null;
    sel.search.value = '';
    sel.msg.textContent = '';
    sel.title.textContent = (role==='assistant') ? t('sel_title_asst') : t('sel_title_prof');
    sel.list.innerHTML = '';
    sel.btnUse.disabled = true;
    sel.box.classList.add('show');
    sel.box.setAttribute('aria-hidden','false');
    loadAccountsForRole(role).catch(()=>{ sel.msg.textContent = t('network_err'); });
}
function closeAccountSelector(){
    sel.box.classList.remove('show');
    sel.box.setAttribute('aria-hidden','true');
}
sel.btnCancel.addEventListener('click', closeAccountSelector);
sel.btnUse.addEventListener('click', ()=>{
    if(!sel.selected) return;
    selectedAsId = sel.selected;
    // Re-detect role with bound account
    const raw = (tokenInput.value||'').trim();
    if(raw==='123' || raw==='321'){ autoDetectRole(raw + '|as=' + selectedAsId); }
    closeAccountSelector();
});
sel.search.addEventListener('input', ()=> renderSelList());

async function loadAccountsForRole(role){
    const tok = (tokenInput.value||'').trim();
    if(!tok) return;
    // We can fetch using default token; backend allows any authenticated role to call list_users
    const r = await fetch(API+'?action=list_users', { headers:{'Authorization':'Bearer '+tok} });
    if(!r.ok){ sel.msg.textContent = t('invalid_token'); return; }
    const arr = await r.json();
    sel.data = (arr || []).filter(u=> u.role===role && u.active);
    renderSelList();
}
function renderSelList(){
    const q = sel.search.value.trim().toLowerCase();
    const items = sel.data
        .filter(u=> !q || (u.fullname||'').toLowerCase().includes(q))
        .sort((a,b)=> (a.fullname||'').localeCompare(b.fullname||''));
    if(!items.length){
        sel.list.innerHTML = `<div class="sel-item" style="justify-content:center;cursor:default">${t('sel_none')}</div>`;
        sel.btnUse.disabled = true;
        return;
    }
    sel.list.innerHTML = items.map(u=>`
        <div class="sel-item ${sel.selected===u.id?'active':''}" data-id="${u.id}">
            <div><b>${escapeHtml(u.fullname||('#'+u.id))}</b></div>
            <div class="muted">#${u.id}</div>
        </div>
    `).join('');
    sel.list.querySelectorAll('.sel-item').forEach(it=>{
        it.addEventListener('click', ()=>{
            sel.selected = parseInt(it.getAttribute('data-id'),10);
            renderSelList();
            sel.btnUse.disabled = !sel.selected;
        });
    });
}
function escapeHtml(s=''){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
