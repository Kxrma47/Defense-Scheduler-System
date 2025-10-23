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

/* ========== i18n ========== */
const I18N = {
    en: {
        assistant_console: "Assistant Console",
        back_to_login: "← Back to login",
        prof_overview: "Professor Overview",
        click_name: "Click a name to focus.",
        topology_pick: "Topology · pick a professor",

        create_window: "Create Window",
        start_dt: "Start date & time",
        end_dt: "End date & time",
        set_manually: "Set manually",
        def_min: "Defense minutes",
        buf_min: "Buffer minutes",
        num_defenses: "Number of defenses",
        insert_breaks: "Insert breaks",
        how_many_breaks: "How many breaks",
        break_minutes: "Break minutes",
        title_label: "Title",
        win_title_ph: "e.g., Window 12–16",
        win_title2_ph: "Window title",
        preview: "Preview",
        create_window_btn: "Create window",
        windows: "Windows",
        th_no: "No.",
        th_title: "Title",
        th_start: "Start",
        th_end: "End",
        th_duration: "Duration (defense+buffer)",
        th_actions: "Actions",
        all_offers_scroll: "All Offers (scroll)",
        edit_window: "Edit Window",
        update_window_btn: "Update window",
        cancel: "Cancel",

        offer_window_to_prof: "Offer Window to Professor",
        window: "Window",
        professors: "Professor(s)",
        search_name_or_id: "Search by name or ID…",
        select_all: "Select all",
        clear: "Clear",
        comment: "Comment",
        notes_to_prof: "Notes to professor",
        send_offer: "Send offer",

        offers: "Offers",
        filter_all: "All",
        filter_pending: "Pending",
        filter_accepted: "Accepted",
        filter_rejected: "Declined",
        filter_change_requested: "Request to change",
        col_window: "Window",
        col_prof_status: "Professors · status · comment · actions",

        users: "Users",
        show_all: "Show all",
        show_first10: "Show first 10",
        collapse: "Collapse",
        expand: "Expand",
        search_users: "Search users",
        new_user_name: "Name of the user",
        full_name: "Full name",
        select_role: "Select role",
        create: "Create",
        th_name: "Name",
        th_role: "Role",
        th_active: "Active",

        // chart
        profs_per_offer: "Professors per Offer",
        chart_subtitle: "Top windows by professor count",
        number_of_professors: "number of professors",
        no_offers_to_chart: "No offers to chart",
        max_word: "max",

        // runtime texts / statuses / toasts
        status_offered: "Offered",
        status_accepted: "Accepted — awaiting manager",
        status_change_requested: "Change requested — awaiting manager",
        status_finalized: "Finalized",
        status_rejected: "Declined",

        pending_action: "Pending action",
        pending_nudge: "{n} {offers_word} await manager approval/finalization",
        offer_finalized_notif: "Offer finalized",
        slots_created: "Slots were created",

        token_copied: "Token copied",
        copy: "Copy",
        copied: "Copied",
        protected: "Protected",
        suspend: "Suspend",
        activate: "Activate",
        delete_disabled: "Delete disabled",
        no_actions: "No actions",
        yes: "Yes",
        no: "No",

        // NEW: delete window label for Offers header
        delete_window: "Delete window",

        // tables empty
        no_windows: "No windows",
        no_offers: "No offers",
        no_users: "No users",
        no_profs: "No professors yet.",

        // misc dynamic
        authenticated: "Authenticated",
        welcome_small: "Hello",
        welcome_big: "Welcome to the Scheduler Dashboard, Assistant",
        welcome_sub: "Loading your tools<span class=\"pulse-dot\"></span>",
        logged_in_as: "Logged in as {name} [{role}]",

        // errors/validation/confirm
        assistant_required: "Assistant role required",
        title_required_msg: "Title is required.",
        select_prof_msg: "Select at least one professor.",
        created: "Created.",
        window_created: "Window created",
        window_updated: "Window updated",
        window_deleted: "Window deleted",
        offer_sent: "Offer(s) sent",
        offer_updated_resend: "Offer updated & re-sent",
        offer_deleted: "Offer deleted",
        user_activated: "User activated",
        user_suspended: "User suspended",

        end_after_start: "End must be after start.",
        not_enough_time: "Not enough time to schedule all defenses.",
        window_len_must_equal: "Window length must equal total duration ({have} vs {need} min).",
        delete_window_confirm: "Delete this window (with offers & slots)?",
        delete_offer_confirm: "Delete this offer?",

        // timeline / labels
        break_word: "Break",
        topology_meta: "{total} {slots_word} • approved {approved}/{total}",
        next_word: "next",
        slot_singular: "slot",
        slot_plural: "slots",
        offer_singular: "offer",
        offer_plural: "offers",
        yes_word: "Yes",
        no_word: "No",
        showing_first_n_of_m: "Showing first {n} of {m}",
        showing_all_n: "Showing all {n}",
        showing_n: "Showing {n}",
        search_results: "Search results: {n}",

        /* NEW search labels */
        search_windows: "Search windows",
        search_all_offers: "Search all offers",
        search_offers: "Search offers",
        search_title_or_no: "Search by title or No…",
        search_prof_or_win: "Search by professor or window…",
        search_prof_win_or_id: "Search by professor, window or ID…"
    },
    ru: {
        assistant_console: "Консоль ассистента",
        back_to_login: "← Назад к входу",
        prof_overview: "Обзор преподавателей",
        click_name: "Кликните по имени, чтобы сфокусироваться.",
        topology_pick: "Топология · выберите преподавателя",

        create_window: "Создать окно",
        start_dt: "Дата и время начала",
        end_dt: "Дата и время окончания",
        set_manually: "Задать вручную",
        def_min: "Минут на защиту",
        buf_min: "Минут на буфер",
        num_defenses: "Количество защит",
        insert_breaks: "Добавить перерывы",
        how_many_breaks: "Сколько перерывов",
        break_minutes: "Минут на перерыв",
        title_label: "Название",
        win_title_ph: "например, Окно 12–16",
        win_title2_ph: "Название окна",
        preview: "Предпросмотр",
        create_window_btn: "Создать окно",
        windows: "Окна",
        th_no: "№",
        th_title: "Название",
        th_start: "Начало",
        th_end: "Окончание",
        th_duration: "Длительность (защита+буфер)",
        th_actions: "Действия",
        all_offers_scroll: "Все предложения (прокрутка)",
        edit_window: "Редактировать окно",
        update_window_btn: "Обновить окно",
        cancel: "Отмена",

        offer_window_to_prof: "Предложить окно преподавателю",
        window: "Окно",
        professors: "Преподаватель(и)",
        search_name_or_id: "Поиск по имени или ID…",
        select_all: "Выбрать всех",
        clear: "Снять выбор",
        comment: "Комментарий",
        notes_to_prof: "Заметка для преподавателя",
        send_offer: "Отправить предложение",

        offers: "Предложения",
        filter_all: "Все",
        filter_pending: "В ожидании",
        filter_accepted: "Принято",
        filter_rejected: "Отклонено",
        filter_change_requested: "Запрос изменения",
        col_window: "Окно",
        col_prof_status: "Преподаватели · статус · комментарий · действия",

        users: "Пользователи",
        show_all: "Показать все",
        show_first10: "Показать первые 10",
        collapse: "Свернуть",
        expand: "Развернуть",
        search_users: "Поиск пользователей",
        new_user_name: "Имя пользователя",
        full_name: "ФИО",
        select_role: "Роль",
        create: "Создать",
        th_name: "Имя",
        th_role: "Роль",
        th_active: "Активен",

        // chart
        profs_per_offer: "Профессоров на предложение",
        chart_subtitle: "Топ окон по числу преподавателей",
        number_of_professors: "число преподавателей",
        no_offers_to_chart: "Недостаточно данных",
        max_word: "макс",

        status_offered: "Предложено",
        status_accepted: "Принято — ожидает менеджера",
        status_change_requested: "Запрошено изменение — ожидает менеджера",
        status_finalized: "Финализировано",
        status_rejected: "Отклонено",

        pending_action: "Требуется действие",
        pending_nudge: "{n} {offers_word} ожидают подтверждения/финализации менеджером",
        offer_finalized_notif: "Предложение финализировано",
        slots_created: "Слоты созданы",

        token_copied: "Токен скопирован",
        copy: "Скопировать",
        copied: "Скопировано",
        protected: "Защищено",
        suspend: "Заморозить",
        activate: "Активировать",
        delete_disabled: "Удаление отключено",
        no_actions: "Нет действий",
        yes: "Да",
        no: "Нет",

        delete_window: "Удалить окно",

        no_windows: "Окон нет",
        no_offers: "Предложений нет",
        no_users: "Пользователей нет",
        no_profs: "Пока нет преподавателей.",

        authenticated: "Аутентификация успешна",
        welcome_small: "Здравствуйте",
        welcome_big: "Добро пожаловать в панель планировщика, ассистент",
        welcome_sub: "Загружаем инструменты<span class=\"pulse-dot\"></span>",
        logged_in_as: "Вошли как {name} [{role}]",

        assistant_required: "Требуется роль ассистента",
        title_required_msg: "Введите название.",
        select_prof_msg: "Выберите хотя бы одного преподавателя.",
        created: "Создано.",
        window_created: "Окно создано",
        window_updated: "Окно обновлено",
        window_deleted: "Окно удалено",
        offer_sent: "Предложение(я) отправлено",
        offer_updated_resend: "Предложение обновлено и отправлено повторно",
        offer_deleted: "Предложение удалено",
        user_activated: "Пользователь активирован",
        user_suspended: "Пользователь заморожен",

        end_after_start: "Окончание должно быть позже начала.",
        not_enough_time: "Недостаточно времени для всех защит.",
        window_len_must_equal: "Длина окна должна равняться общей длительности ({have} против {need} мин).",
        delete_window_confirm: "Удалить это окно (вместе с предложениями и слотами)?",
        delete_offer_confirm: "Удалить это предложение?",

        break_word: "Перерыв",
        topology_meta: "{total} {slots_word} • одобрено {approved}/{total}",
        next_word: "следующая",
        slot_singular: "слот",
        slot_plural2: "слота",
        slot_plural5: "слотов",
        offer_singular: "предложение",
        offer_plural2: "предложения",
        offer_plural5: "предложений",
        yes_word: "Да",
        no_word: "Нет",
        showing_first_n_of_m: "Показаны первые {n} из {m}",
        showing_all_n: "Показаны все {n}",
        showing_n: "Показано {n}",
        search_results: "Результаты поиска: {n}",

        /* NEW search labels */
        search_windows: "Поиск по окнам",
        search_all_offers: "Поиск по всем предложениям",
        search_offers: "Поиск предложений",
        search_title_or_no: "Поиск по названию или №…",
        search_prof_or_win: "Поиск по преподавателю или окну…",
        search_prof_win_or_id: "Поиск по преподавателю, окну или ID…"
    }
};

let lang = localStorage.getItem('ui_lang') || 'en';
function L(){ return lang==='ru' ? 'ru-RU' : 'en-US'; }
function t(key, params={}){
    let s = (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
    return s.replace(/\{(\w+)\}/g, (_,k)=> (params[k]!==undefined? params[k] : ''));
}
function ruPlural(n, f1, f2, f5){
    n = Math.abs(n)%100; const n1 = n%10;
    if(n>10 && n<20) return f5;
    if(n1>1 && n1<5) return f2;
    if(n1===1) return f1;
    return f5;
}
function wordSlots(n){
    if(lang==='ru') return ruPlural(n, t('slot_singular'), t('slot_plural2'), t('slot_plural5'));
    return n===1 ? t('slot_singular') : t('slot_plural');
}
function wordOffers(n){
    if(lang==='ru') return ruPlural(n, t('offer_singular'), t('offer_plural2'), t('offer_plural5'));
    return n===1 ? t('offer_singular') : t('offer_plural');
}
function applyI18n(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        const k = el.getAttribute('data-i18n');
        el.innerHTML = t(k);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const k = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(k));
    });
    document.documentElement.lang = (lang==='ru'?'ru':'en');
    document.getElementById('langEN')?.classList.toggle('active', lang==='en');
    document.getElementById('langRU')?.classList.toggle('active', lang==='ru');

    renderUsersTable();
    renderWindows();
    renderWindowsOffersScroll();
    renderOffers();
    renderProfessorChecks();
    renderProfessorList();
    bindPreview('win');
    if(editingWindowId) bindPreview('ewin');
    renderCharts();

    // NEW: rerender open datepicker when language changes
    DateTimePicker.refreshIfOpen();
}
function setLang(l){
    lang = (l==='ru'?'ru':'en');
    localStorage.setItem('ui_lang', lang);
    applyI18n();
}

/* ========== Themed Modal UI module ========== */
const ui = (() => {
    const root = document.getElementById('modal');
    const titleEl = document.getElementById('modalTitle');
    const msgEl = document.getElementById('modalMsg');
    const okBtn = document.getElementById('modalOk');
    const cancelBtn = document.getElementById('modalCancel');

    let resolver = null;
    let mode = 'alert';

    function labels(){
        return {
            ok: (lang==='ru' ? 'ОК' : 'OK'),
            yes: t('yes'),
            no: t('no'),
            cancel: t('cancel')
        };
    }

    function open({title='', message='', variant='info', kind='alert', okText, cancelText}){
        return new Promise(res=>{
            resolver = res;
            mode = kind;
            document.getElementById('modal').dataset.mode = (kind==='confirm' ? 'confirm' : (variant==='error'?'error':'alert'));
            titleEl.textContent = title || (kind==='confirm' ? (lang==='ru'?'Подтвердите действие':'Confirm action') : (lang==='ru'?'Сообщение':'Message'));
            msgEl.textContent = String(message || '');

            const Lb = labels();
            okBtn.textContent = okText || (kind==='confirm' ? Lb.yes : Lb.ok);
            cancelBtn.textContent = cancelText || Lb.cancel;
            cancelBtn.style.display = (kind==='confirm' ? '' : 'none');

            document.getElementById('modal').classList.add('show');
            document.getElementById('modal').setAttribute('aria-hidden','false');

            setTimeout(()=> (kind==='confirm' ? cancelBtn : okBtn).focus(), 10);
        });
    }
    function close(val){
        const root = document.getElementById('modal');
        root.classList.remove('show');
        root.setAttribute('aria-hidden','true');
        if(resolver){ const r = resolver; resolver=null; r(val); }
    }

    document.getElementById('modalOk').addEventListener('click', ()=> close(true));
    document.getElementById('modalCancel').addEventListener('click', ()=> close(false));
    document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target===document.getElementById('modal')){ close(mode==='confirm' ? false : true); }});
    document.addEventListener('keydown', (e)=>{
        if(document.getElementById('modal').classList.contains('show')){
            if(e.key==='Escape'){ e.preventDefault(); close(mode==='confirm' ? false : true); }
            if(e.key==='Enter'){ e.preventDefault(); close(true); }
        }
    });

    return {
        alert(msg, opts={}) { return open({message: msg, variant: opts.variant||'info', kind:'alert', okText:opts.okText}); },
        confirm(msg, opts={}) { return open({message: msg, variant: opts.variant||'info', kind:'confirm', okText:opts.okText, cancelText:opts.cancelText}); }
    };
})();

(function(){
    const nativeAlert = window.alert.bind(window);
    window.alert = function(msg){
        try{ ui.alert(String(msg)); }catch(_){ nativeAlert(String(msg)); }
    };
})();

/* ========== App code ========== */
const token = localStorage.getItem('defense_token') || '';
if(!token) location.href='index.html';

const $ = s => document.querySelector(s);

const jfetch = async (url, opt={})=>{
    const headers={'Content-Type':'application/json','Authorization':'Bearer '+token, ...(opt.headers||{})};
    const r = await fetch(url, {...opt, headers});
    if(!r.ok){
        let txt = await r.text();
        try{ const j = JSON.parse(txt); txt = j.error || j.detail || txt; }catch(_){}
        throw new Error(txt);
    }
    return r.json();
};
function fmt(s, options){ return s ? new Date(s).toLocaleString(L(), options||{}) : ''; }
const escapeHtml = (s='') => s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
function logout(e){ e?.preventDefault?.(); localStorage.removeItem('defense_token'); location.href='index.html'; }

/* ripple on buttons */
function addRipple(e){
    const el = e.currentTarget;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = el.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left) + 'px';
    r.style.top  = (e.clientY - rect.top)  + 'px';
    el.appendChild(r);
    setTimeout(()=> r.remove(), 600);
}
document.addEventListener('click', (ev)=>{
    const el = ev.target.closest('.btn, .mini');
    if(el){ addRipple(ev); }
});

function toast(msg, type='ok'){
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (type==='error'?'err':'ok');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(()=> el.remove(), 3600);
}

function showWelcome(){
    const w = $('#welcome');
    $('#wSmall').innerHTML = t('welcome_small');
    $('#wBig').innerHTML   = t('welcome_big');
    $('#wSub').innerHTML   = t('welcome_sub');
    w.classList.add('show');
    w.setAttribute('aria-hidden','false');
    setTimeout(()=>{ w.classList.remove('show'); w.setAttribute('aria-hidden','true'); }, 1100);
}

/* ---------- State ---------- */
let state = { users:[], slots:[], offers:[], windows:[] };
let ME = null;
let editingOffers = new Set();
let offerOriginals = new Map();
let usersCollapsed = true;
let usersSectionCollapsed = false;
let editingWindowId = null;

let offersFilter = 'all';
let focusedProfessorId = null;

/* ---------- Live notifications ---------- */
const Notifier = (()=>{
    let permissionAsked = false;
    function ask() {
        if(permissionAsked) return;
        permissionAsked = true;
        if ('Notification' in window && Notification.permission === 'default'){
            try{ Notification.requestPermission().catch(()=>{}); }catch(_){}
        }
    }
    function browserNotify(title, body){
        if(!('Notification' in window)) return;
        if(Notification.permission === 'granted'){
            new Notification(title, { body });
        }
    }
    function toastAndNotify(title, body, type='ok'){
        toast(`${title}: ${body}`, type==='error'?'error':'ok');
        browserNotify(title, body);
    }
    return { ask, toastAndNotify };
})();

/* ---------- API ---------- */
async function whoami(){
    const res = await jfetch(API+'?action=whoami');
    ME = res.user;
    if(ME.role!=='assistant'){
        await ui.alert(t('assistant_required'), {variant:'error'});
        location.href='index.html';
        return;
    }
    $('#me').textContent = t('logged_in_as', {name: ME.fullname, role: ME.role});
    $('#title').textContent = t('assistant_console');
    showWelcome();
}
async function refreshUsers(){ state.users = await jfetch(API+'?action=users'); renderUsersTable(); renderProfessorChecks(); renderProfessorList(); }
async function refreshWindows(){ state.windows = await jfetch(API+'?action=windows'); renderWindows(); populate('#offerWindow', state.windows.map(w=>({value:w.id,label:`${w.title} · No. ${w.no}`}))); renderWindowsOffersScroll(); }
async function refreshOffers(){ 
    state.offers = await jfetch(API+'?action=my_offers'); 
    renderOffers(); 
    renderWindowsOffersScroll(); 
    renderCharts(); 
}
async function refreshSlots(){ state.slots = await jfetch(API+'?action=slots'); renderProfessorList(); }
async function refreshAll(){ await Promise.all([refreshUsers(), refreshWindows(), refreshOffers(), refreshSlots()]); renderCharts(); }

/* ---------- Helpers ---------- */
function nameById(id){ const u=state.users.find(x=>x.id===id); return u?u.fullname:('#'+id); }
function copyToClipboard(text){
    if(!text) return;
    navigator.clipboard?.writeText(text).then(()=>toast(t('token_copied'))).catch(()=>{});
}
function pad(n){ return String(n).padStart(2,'0'); }
function toLocalInputValue(d){
    if(!d || Number.isNaN(d.getTime())) return '';
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
}
function populate(sel, items){
    const el = document.querySelector(sel);
    if(!el) return;
    el.innerHTML = items.map(i=>`<option value="${i.value}">${escapeHtml(i.label)}</option>`).join('');
}
function fmtDate(d){ return d ? new Date(d).toLocaleDateString(L(), {day:'2-digit', month:'short', year:'numeric'}) : ''; }
function fmtTime(d){ return d ? new Date(d).toLocaleTimeString(L(), {hour:'2-digit', minute:'2-digit'}) : ''; }
function getAccent(){ return getComputedStyle(document.documentElement).getPropertyValue('--p').trim() || '#a78bfa'; }

/* === DateTimePicker (custom themed) === */
const DateTimePicker = (function(){
    let openFor = null; // input element
    let anchorBtn = null; // icon button
    let root = null;
    let curMonth = new Date(); // displayed month
    let selected = null; // Date
    const firstDow = ()=> (lang==='ru'?1:0); // RU Monday, EN Sunday

    function ensureRoot(){
        if(root) return root;
        root = document.createElement('div');
        root.className = 'dtp';
        root.setAttribute('role','dialog');
        root.innerHTML = `
            <div class="dtp-header">
                <button class="mini" data-act="prev" aria-label="Previous month">‹</button>
                <div class="dtp-title"></div>
                <button class="mini" data-act="next" aria-label="Next month">›</button>
            </div>
            <div class="dtp-week"></div>
            <div class="dtp-grid"></div>
            <div class="dtp-time">
                <select class="sel" data-part="hh"></select>
                <select class="sel" data-part="mm"></select>
            </div>
            <div class="dtp-actions">
                <button class="mini" data-act="now">Now</button>
                <button class="mini" data-act="clear">Clear</button>
                <button class="mini" data-act="apply">Apply</button>
            </div>`;
        document.body.appendChild(root);

        root.addEventListener('click', (e)=>{
            const btn = e.target.closest('[data-act]');
            if(!btn) return;
            const act = btn.getAttribute('data-act');
            if(act==='prev'){ curMonth.setMonth(curMonth.getMonth()-1); render(); }
            if(act==='next'){ curMonth.setMonth(curMonth.getMonth()+1); render(); }
            if(act==='apply'){ applyValue(); }
            if(act==='clear'){ if(openFor){ openFor.value=''; fireInput(openFor); } close(); }
            if(act==='now'){ selected = new Date(); syncTimeSelectors(); renderDays(); }
        });
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onDocClick, true);
        window.addEventListener('resize', position);
        buildTimeSelectors();
        return root;
    }

    function onDocClick(e){
        if(!root || !openFor) return;
        if(root.contains(e.target)) return;
        if(anchorBtn && anchorBtn.contains(e.target)) return;
        if(openFor && openFor.contains(e.target)) return;
        close();
    }
    function onKey(e){
        if(!root || !openFor) return;
        if(e.key==='Escape'){ close(); }
    }

    function parseVal(str){
        if(!str) return null;
        const d = new Date(str);
        return isNaN(+d)? null : d;
    }

    function buildTimeSelectors(){
        const hh = root.querySelector('[data-part="hh"]');
        const mm = root.querySelector('[data-part="mm"]');
        hh.innerHTML = Array.from({length:24}, (_,h)=>`<option value="${h}">${String(h).padStart(2,'0')}</option>`).join('');
        mm.innerHTML = Array.from({length:12}, (_,i)=> i*5).map(m=>`<option value="${m}">${String(m).padStart(2,'0')}</option>`).join('');
        hh.addEventListener('change', ()=>{ if(!selected) selected=new Date(); selected.setHours(parseInt(hh.value,10)); });
        mm.addEventListener('change', ()=>{ if(!selected) selected=new Date(); selected.setMinutes(parseInt(mm.value,10)); });
    }
    function syncTimeSelectors(){
        const hh = root.querySelector('[data-part="hh"]');
        const mm = root.querySelector('[data-part="mm"]');
        const d = selected || new Date();
        hh.value = String(d.getHours());
        mm.value = String(Math.round(d.getMinutes()/5)*5 % 60);
    }

    function weekdayLabels(){
        const base = new Date(Date.UTC(2021,7,1)); // Aug 1, 2021 (Sunday)
        const arr=[];
        for(let i=0;i<7;i++){
            const d = new Date(base);
            d.setUTCDate(d.getUTCDate()+((i+firstDow())%7));
            arr.push(d.toLocaleDateString(L(), {weekday:'short'}));
        }
        return arr;
    }

    function renderWeek(){
        const wk = root.querySelector('.dtp-week');
        wk.innerHTML = weekdayLabels().map(w=>`<span>${w}</span>`).join('');
    }
    function renderDays(){
        const grid = root.querySelector('.dtp-grid');
        const y = curMonth.getFullYear(), m = curMonth.getMonth();
        const first = new Date(y, m, 1);
        const startOffset = (first.getDay() - firstDow() + 7) % 7;
        const start = new Date(y, m, 1 - startOffset);

        const today = new Date(); today.setHours(0,0,0,0);
        const selKey = selected ? [selected.getFullYear(),selected.getMonth(),selected.getDate()].join('-') : null;

        let html='';
        for(let i=0;i<42;i++){
            const d = new Date(start); d.setDate(start.getDate()+i);
            const inMonth = d.getMonth()===m;
            const key = [d.getFullYear(), d.getMonth(), d.getDate()].join('-');
            const isToday = d.getTime()===today.getTime();
            const cls = ['dtp-day', inMonth?'':'muted', (key===selKey?'selected':''), (isToday?'today':'')].filter(Boolean).join(' ');
            html += `<button type="button" class="${cls}" data-date="${d.toISOString()}">${d.getDate()}</button>`;
        }
        grid.innerHTML = html;
        grid.querySelectorAll('.dtp-day').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const d = new Date(btn.getAttribute('data-date'));
                if(!selected) selected = d; else { selected.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); }
                renderDays();
            });
            btn.addEventListener('dblclick', ()=>{ // quick apply
                const d = new Date(btn.getAttribute('data-date'));
                if(!selected) selected = d; else { selected.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); }
                applyValue();
            });
        });
    }
    function renderHeader(){
        const title = root.querySelector('.dtp-title');
        title.textContent = new Date(curMonth).toLocaleDateString(L(), {month:'long', year:'numeric'});
    }
    function render(){
        ensureRoot();
        renderHeader();
        renderWeek();
        renderDays();
    }

    function position(){
        if(!root || !anchorBtn) return;
        const r = anchorBtn.getBoundingClientRect();
        const desiredTop = r.bottom + 8 + window.scrollY;
        const desiredLeft = r.right - 320 + window.scrollX;
        root.style.top = desiredTop+'px';
        root.style.left = Math.max(8, desiredLeft)+'px';
    }

    function applyValue(){
        if(!openFor || !selected) { close(); return; }
        const d = new Date(selected);
        const hh = root.querySelector('[data-part="hh"]');
        const mm = root.querySelector('[data-part="mm"]');
        d.setHours(parseInt(hh.value,10)||0, parseInt(mm.value,10)||0, 0, 0);
        openFor.value = toLocalInputValue(d);
        fireInput(openFor);
        close();
    }

    function fireInput(el){
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
    }

    function open(inputEl, iconBtn){
        ensureRoot();
        if(inputEl.disabled) return;
        openFor = inputEl;
        anchorBtn = iconBtn || inputEl;
        selected = parseVal(openFor.value) || new Date();
        curMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        syncTimeSelectors();
        render();
        position();
        root.style.display='block';
    }
    function close(){
        if(root) root.style.display='none';
        openFor = null; anchorBtn=null;
    }

    function attach(id){
        const input = document.getElementById(id);
        const btn = document.querySelector(`.icon-btn[data-dtp="${id}"]`);
        if(!input || !btn) return;
        input.addEventListener('click', ()=> open(input, btn));
        btn.addEventListener('click', ()=> open(input, btn));
    }
    function attachMany(ids){ ids.forEach(attach); }

    function refreshIfOpen(){
        if(openFor){ render(); position(); }
    }

    // keep icon-btn disabled state in sync with input.disabled
    function watchDisabledSync(ids){
        const mo = new MutationObserver(()=> ids.forEach(syncBtn));
        ids.forEach(id=>{
            const el = document.getElementById(id);
            if(!el) return;
            mo.observe(el, {attributes:true, attributeFilter:['disabled']});
            syncBtn(id);
        });
        function syncBtn(id){
            const el = document.getElementById(id);
            const btn = document.querySelector(`.icon-btn[data-dtp="${id}"]`);
            if(btn && el){ btn.disabled = el.disabled; }
        }
    }

    return { attach, attachMany, refreshIfOpen, watchDisabledSync };
})();

/* ---------- Users ---------- */
function renderUsersTable(){
    const q = ($('#userSearch')?.value||'').trim().toLowerCase();

    let filtered = state.users.filter(u=>{
        if(!q) return true;
        if(/^\d+$/.test(q)) return String(u.id)===q || String(u.no)===q;
        return u.fullname.toLowerCase().includes(q);
    });

    let shown = filtered;
    const limit = 10;
    const isSearching = q.length > 0;

    if (!isSearching && usersCollapsed && filtered.length > limit){
        shown = filtered.slice(0, limit);
    }

    const rows = shown.map(u=>{
        const isSelf = ME && ME.id===u.id;
        let actions = `<span class="muted">${t('no_actions')}</span>`;
        if(!isSelf){
            if(u.role==='manager'){
                actions = `<span class="muted">${t('protected')}</span>`;
            }else if(u.role==='professor'){
                actions = `<button class="mini" onclick="setActive(event, ${u.id}, ${!u.active})">${u.active?t('suspend'):t('activate')}</button>
                 <span class="muted">Delete disabled</span>`;
            }
        }
        return `<tr>
            <td>${u.no}</td>
            <td>${escapeHtml(u.fullname)}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>${u.active ? t('yes_word') : t('no_word')}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');

    $('#tblUsers tbody').innerHTML = rows || `<tr><td colspan="5" class="muted">${t('no_users')}</td></tr>`;

    const meta = $('#usersMeta');
    const btn = $('#btnUsersCollapse');
    if (isSearching){
        meta.textContent = t('search_results', {n: filtered.length});
        btn.textContent = t('show_all');
        btn.disabled = true;
    }else{
        if (usersCollapsed){
            meta.textContent = filtered.length > limit ? t('showing_first_n_of_m', {n: limit, m: filtered.length}) : t('showing_n', {n: filtered.length});
            btn.textContent = t('show_all');
            btn.disabled = filtered.length <= limit;
        }else{
            meta.textContent = t('showing_all_n', {n: filtered.length});
            btn.textContent = t('show_first10');
            btn.disabled = filtered.length <= limit;
        }
    }
}

function toggleUsersCollapse(e){
    const btn = $('#btnUsersCollapse');
    if (btn?.disabled) return;
    usersCollapsed = !usersCollapsed;
    renderUsersTable();
}
function toggleUsersSection(e){
    usersSectionCollapsed = !usersSectionCollapsed;
    const body = $('#usersBody');
    const btn = $('#btnUsersSection');
    if (usersSectionCollapsed){
        body.style.display = 'none';
        btn.textContent = t('expand');
    }else{
        body.style.display = '';
        btn.textContent = t('collapse');
    }
}

async function createUser(e){
    const role = 'professor';
    const fullname = ($('#newUserName').value||'').trim();
    const msgEl = $('#newUserMsg');
    msgEl.textContent = '';
    if(!fullname){
        msgEl.textContent = t('title_required_msg');
        $('#newUserName').focus();
        return;
    }
    try{
        const res = await jfetch(API+'?action=create_user',{method:'POST',body:JSON.stringify({fullname,role})});
        $('#newUserName').value='';
        await refreshUsers();
        msgEl.innerHTML = `${t('users')} • ${t('created')} Token: <code class="token">${res.auth_token}</code> <button class="mini" onclick="copyToClipboard('${res.auth_token}'); this.textContent='${t('copied')}'; setTimeout(()=>this.textContent='${t('copy')}',1200)">${t('copy')}</button>`;
        toast(t('created'),'ok');
    }catch(err){
        msgEl.textContent = err.message || String(err);
        toast(err.message || 'Error','error');
    }
}

async function setActive(e,id,active){
    try{
        await jfetch(API+'?action=set_active',{method:'POST',body:JSON.stringify({id,active})});
        await refreshUsers();
        toast(active?t('user_activated'):t('user_suspended'));
    }catch(err){
        toast(err.message||'Error','error');
    }
}

/* ---------- Window preview helpers ---------- */
function updateWindowPreview(prefix){
    const name = (prefix||'win');
    const P = x => document.getElementById(name + x);
    const isEdit = name.startsWith('ewin');

    const errorsEl = P('Errors'), previewEl = P('Preview');
    const startStr = P('Start').value;
    const start = startStr ? new Date(startStr) : null;

    const defMin = parseInt(P('Def').value||'0',10);
    const bufMin = parseInt(P('Buf').value||'0',10);
    let count = parseInt(P('Count').value||'0',10);

    const breaksOn = P('BreaksEnable').checked;
    const breakCount = breaksOn ? parseInt(P('BreaksCount').value||'0',10) : 0;
    const breakMin = breaksOn ? parseInt(P('BreakMinutes').value||'0',10) : 0;

    const manualEnd = P('ManualEnd').checked;
    const endStr = P('End').value;
    let end = endStr ? new Date(endStr) : null;

    const errors=[];
    if(!start || (!defMin && defMin!==0)){
        previewEl.innerHTML=''; errorsEl.textContent='';
        // keep end disabled flag wiring for icon button too
        P('End').disabled = !manualEnd;
        DateTimePicker.refreshIfOpen();
        return;
    }

    const block = defMin + bufMin;
    if(!manualEnd){
        if(!isEdit){
            const totalMin = (count>0? count*block : 0) + (breakCount*breakMin);
            if(count>0){ end = new Date(start.getTime() + totalMin*60000); P('End').value = toLocalInputValue(end); }
        }else{
            if(!end && count>0){
                const totalMin = count*block + (breakCount*breakMin);
                end = new Date(start.getTime() + totalMin*60000);
                P('End').value = toLocalInputValue(end);
            }
        }
        P('End').disabled = true;
    }else{
        P('End').disabled = false;
    }

    // keep icon button disabled state in sync
    DateTimePicker.refreshIfOpen();
    document.querySelector(`.icon-btn[data-dtp="${name}End"]`)?.setAttribute('disabled', P('End').disabled ? 'true' : null);

    if(isEdit && end && block>0){
        const windowMin = Math.max(0, Math.round((end - start)/60000));
        const usableMin = Math.max(0, windowMin - (breakCount*breakMin));
        const autoCount = Math.max(1, Math.floor(usableMin / block));
        if(!count || count !== autoCount){
            P('Count').value = autoCount;
            count = autoCount;
        }
    }

    if(!end || end <= start){ errors.push(t('end_after_start')); }

    const windowMin = end ? Math.round((end - start)/60000) : 0;
    const totalMin = (count>0? count*block : 0) + (breakCount*breakMin);
    if(windowMin && count>0 && windowMin < totalMin){ errors.push(t('not_enough_time')); }

    P('BreaksCount').disabled = !breaksOn;
    P('BreakMinutes').disabled = !breaksOn;

    let html='';
    if(start && count>0 && !errors.length){
        let tcur = new Date(start);
        const breakAt = new Set();
        if(breakCount > 0){
            for(let j=1;j<=breakCount;j++){
                const idx = Math.round(j*count/(breakCount+1));
                if(idx>0 && idx<count) breakAt.add(idx);
            }
        }
        html += '<div style="display:grid;grid-template-columns:1fr auto;gap:6px;font-size:13px">';
        for(let i=0;i<count;i++){
            html += `<div>${i+1}</div><div>${tcur.toLocaleString(L())}</div>`;
            tcur = new Date(tcur.getTime()+defMin*60000+bufMin*60000);
            if(breakAt.has(i+1)){
                const bEnd = new Date(tcur.getTime()+breakMin*60000);
                html += `<div class="muted">${t('break_word')}</div><div>${tcur.toLocaleTimeString(L())} → ${bEnd.toLocaleTimeString(L())}</div>`;
                tcur = bEnd;
            }
        }
        html += '</div>';
    }
    previewEl.innerHTML = html;
    errorsEl.textContent = errors.join(' ');
}

function bindPreview(prefix){
    const px = (prefix||'win');
    ['Start','End','Def','Buf','Count','BreaksEnable','BreaksCount','BreakMinutes','ManualEnd']
        .forEach(id=>{
            const el = document.getElementById(px+id); if(!el) return;
            el.addEventListener('input', ()=>updateWindowPreview(px));
            el.addEventListener('change', ()=>updateWindowPreview(px));
        });
    updateWindowPreview(px);
}

/* ---------- Windows (with search) ---------- */
function renderWindows(){
    const q = ($('#windowsSearch')?.value||'').trim().toLowerCase();
    const wins = state.windows.filter(w=>{
        if(!q) return true;
        if(/^\d+$/.test(q)) return String(w.no)===q || String(w.id)===q;
        return (w.title||'').toLowerCase().includes(q);
    });

    const rows = wins.map(w=>`
  <tr>
    <td>${w.no}</td>
    <td><strong>${escapeHtml(w.title||'')}</strong></td>
    <td>${fmt(w.start_ts)}</td>
    <td>${fmt(w.end_ts)}</td>
    <td>${w.defense_minutes} + ${w.buffer_minutes} min</td>
    <td class="inline">
      <button class="mini" onclick="openEditWindow(event, ${w.id})">${t('edit_window')}</button>
      <button class="mini danger" onclick="deleteWindow(event, ${w.id})">Delete</button>
    </td>
  </tr>`).join('');
    $('#tblWindows tbody').innerHTML = rows || `<tr><td colspan="6" class="muted">${t('no_windows')}</td></tr>`;
}

function renderWindowsOffersScroll(){
    const box = $('#winOffersList');
    if(!box) return;
    if(!state.offers.length){
        box.innerHTML = `<div class="muted">${t('no_offers')}</div>`;
        return;
    }

    const q = ($('#winOffersSearch')?.value||'').trim().toLowerCase();

    const items = state.offers
        .map(o=>{
            const w = state.windows.find(x=>x.id===o.window_id) || {};
            const wTitle = w.title || `Window ${o.window_id}`;
            const ts = w.start_ts || null;
            return {
                id:o.id, windowTitle:wTitle, windowNo:w.no, professor:nameById(o.professor_id), status:o.status, ts, time: ts? new Date(ts).toLocaleString(L()): ''
            };
        })
        .filter(it=>{
            if(!q) return true;
            if(/^\d+$/.test(q)) return String(it.id)===q || String(it.windowNo)===q;
            return it.windowTitle.toLowerCase().includes(q) || it.professor.toLowerCase().includes(q) || it.status.toLowerCase().includes(q);
        })
        .sort((a,b)=> (new Date(a.ts||0) - new Date(b.ts||0)) || a.professor.localeCompare(b.professor));

    const statusTextLocal = s=>{
        if(s==='accepted') return t('status_accepted');
        if(s==='finalized') return t('status_finalized');
        if(s==='rejected') return t('status_rejected');
        if(s==='change_requested') return t('status_change_requested');
        return t('status_offered');
    };

    box.innerHTML = items.map(it=>`
  <div class="win-offer-item">
    <div class="win-offer-left">
      <span class="badge">${escapeHtml(it.windowTitle)}</span>
      ${it.time?`<span class="muted">· ${escapeHtml(it.time)}</span>`:''}
      <span class="muted">→</span>
      <span>${escapeHtml(it.professor)}</span>
    </div>
    <div class="win-offer-right">
      <span class="pill ${statusClass(it.status)}">${escapeHtml(statusTextLocal(it.status))}</span>
    </div>
  </div>
`).join('') || `<div class="muted">${t('no_offers')}</div>`;
}

async function createWindow(e){
    try{
        updateWindowPreview('win');
        const title = $('#winTitle').value.trim();
        if(!title){ $('#winErrors').textContent=t('title_required_msg'); return; }

        const start_ts = $('#winStart').value;
        const end_ts = $('#winEnd').value;
        const defense_minutes = parseInt($('#winDef').value||'0',10);
        const buffer_minutes = parseInt($('#winBuf').value||'0',10);
        const count = parseInt($('#winCount').value||'0',10);
        const breaksOn = $('#winBreaksEnable').checked;
        const breakCount = breaksOn ? parseInt($('#winBreaksCount').value||'0',10) : 0;
        const breakMin = breaksOn ? parseInt($('#winBreakMinutes').value||'0',10) : 0;
        const manualEnd = $('#winManualEnd').checked;

        if(!start_ts || !end_ts) throw new Error(t('end_after_start'));
        if(defense_minutes <=0 || count <=0) throw new Error(t('not_enough_time'));

        const start = new Date(start_ts), end = new Date(end_ts);
        const need = count*(defense_minutes+buffer_minutes)+(breakCount*breakMin);
        const have = Math.round((end-start)/60000);
        if(have < need) throw new Error(t('not_enough_time'));
        if(manualEnd && have !== need) throw new Error(t('window_len_must_equal', {have, need}));

        const payload={ title, start_ts, end_ts, defense_minutes, buffer_minutes };
        await jfetch(API+'?action=create_window',{method:'POST',body:JSON.stringify(payload)});
        $('#winMsg').textContent=t('created');
        toast(t('window_created'),'ok');
        // reset
        $('#winStart').value=''; $('#winEnd').value='';
        $('#winDef').value=20; $('#winBuf').value=5; $('#winCount').value=4;
        $('#winBreaksEnable').checked=false; $('#winBreaksCount').value=1; $('#winBreakMinutes').value=10; $('#winManualEnd').checked=false; $('#winTitle').value='';
        updateWindowPreview('win');
        await refreshWindows();
    }catch(err){
        $('#winMsg').textContent = err.message || String(err);
        toast(err.message || 'Error','error');
    }
}

function openEditWindow(e,id){
    const w = state.windows.find(x=>x.id===id);
    if(!w){ ui.alert('Window not found', {variant:'error'}); return; }
    editingWindowId = id;

    const start = w.start_ts ? new Date(w.start_ts) : null;
    const end   = w.end_ts ? new Date(w.end_ts) : null;
    const block = (w.defense_minutes||0) + (w.buffer_minutes||0);
    let autoCount = 1;
    if(start && end && block>0){
        const windowMin = Math.max(0, Math.round((end - start)/60000));
        autoCount = Math.max(1, Math.floor(windowMin / block));
    }

    const panel = $('#editPanel');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    $('#editMeta').textContent = `DB id ${id} · No. ${w.no}`;

    $('#ewinTitle').value = w.title || '';
    $('#ewinStart').value = w.start_ts ? toLocalInputValue(new Date(w.start_ts)) : '';
    $('#ewinEnd').value   = w.end_ts ? toLocalInputValue(new Date(w.end_ts)) : '';
    $('#ewinDef').value   = w.defense_minutes;
    $('#ewinBuf').value   = w.buffer_minutes;
    $('#ewinCount').value = autoCount;

    $('#ewinManualEnd').checked=false;
    $('#ewinBreaksEnable').checked=false;
    $('#ewinBreaksCount').value=1;
    $('#ewinBreakMinutes').value=10;

    bindPreview('ewin');
}
async function updateWindow(e){
    const title = $('#ewinTitle').value.trim();
    if(!title){ $('#ewinErrors').textContent=t('title_required_msg'); return; }
    try{
        const payload={
            id: editingWindowId,
            title,
            start_ts: $('#ewinStart').value,
            end_ts: $('#ewinEnd').value,
            defense_minutes: parseInt($('#ewinDef').value||'0',10),
            buffer_minutes: parseInt($('#ewinBuf').value||'0',10)
        };
        await jfetch(API+'?action=update_window',{method:'POST',body:JSON.stringify(payload)});
        cancelEdit();
        await refreshWindows();
        toast(t('window_updated'),'ok');
    }catch(err){
        $('#ewinMsg').textContent = err.message || String(err);
        toast(err.message || 'Error','error');
    }
}
function cancelEdit(e){
    editingWindowId = null;
    const panel = $('#editPanel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    $('#ewinMsg').textContent='';
}
async function deleteWindow(e,id){
    try{
        const ok = await ui.confirm(t('delete_window_confirm'), {variant:'error'});
        if(!ok) return;
        await jfetch(API+'?action=delete_window',{method:'POST',body:JSON.stringify({id})});
        await refreshAll();
        if(editingWindowId===id) cancelEdit();
        toast(t('window_deleted'),'ok');
    }catch(err){ toast(err.message||'Error','error'); }
}

/* ---------- Offer Window ---------- */
function renderProfessorChecks(){
    const box = document.getElementById('offerProfessorChecks');
    if(!box) return;
    const q = ($('#offerProfessorFilter').value||'').toLowerCase();
    const profs = state.users
        .filter(u=>u.role==='professor')
        .sort((a,b)=> a.fullname.localeCompare(b.fullname))
        .filter(p=> !q || p.fullname.toLowerCase().includes(q) || String(p.id)===q || String(p.no)===q);
    box.innerHTML = profs.map(p =>
        `<label class="check"><input type="checkbox" value="${p.id}" onchange="onProfessorSelectionChange(${p.id}, '${escapeHtml(p.fullname)}', this.checked)"><span>${escapeHtml(p.fullname)}</span></label>`
    ).join('') || `<div class="muted" style="padding:6px">${t('no_profs')}</div>`;
}
function offerSelectAllVisible(e){
    document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]').forEach(cb=> cb.checked=true);
    // Show slot selections for all selected professors
    const selectedProfs = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
    if (selectedProfs.length > 0) {
        document.getElementById('professorSlotSelections').style.display = 'block';
        for (const cb of selectedProfs) {
            const professorId = parseInt(cb.value);
            const professorName = cb.nextElementSibling.textContent;
            showProfessorSlotSelection(professorId, professorName);
        }
    }
}
function offerClear(e){
    document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]').forEach(cb=> cb.checked=false);
    clearProfessorSlotSelections();
    document.getElementById('professorSlotSelections').style.display = 'none';
}
document.getElementById('offerProfessorFilter')?.addEventListener?.('input', renderProfessorChecks);

async function offerWindow(e){
    try {
        const checks = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
        const selectedProfs = Array.from(checks).map(cb => +cb.value);
        
        if (selectedProfs.length === 0) {
            document.getElementById('offerMsg').textContent = t('select_prof_msg');
            return;
        }
        
        const windowId = +document.getElementById('offerWindow').value;
        const comment = document.getElementById('offerComment').value.trim();
        const selectedSlots = getSelectedSlots();
        
        // Validate that each selected professor has at least one slot selected
        const professorsWithoutSlots = selectedProfs.filter(pid => !selectedSlots[pid] || selectedSlots[pid].length === 0);
        if (professorsWithoutSlots.length > 0) {
            const profNames = professorsWithoutSlots.map(pid => {
                const prof = state.users.find(u => u.id === pid);
                return prof ? prof.fullname : `ID ${pid}`;
            }).join(', ');
            document.getElementById('offerMsg').textContent = 'The following professors have no slots selected: ' + profNames;
            return;
        }
        
        // Send offers with slot information
        const offerPromises = selectedProfs.map(async (pid) => {
            const payload = {
                window_id: windowId,
                professor_id: pid,
                comment: comment,
                selected_slots: selectedSlots[pid] || []
            };
            return jfetch(API+'?action=offer_window', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        });
        
        await Promise.all(offerPromises);
        
        document.getElementById('offerMsg').textContent = 'Offers sent: ' + selectedProfs.length;
        document.getElementById('offerComment').value = '';
        offerClear();
        await refreshOffers();
        toast(t('offer_sent'), 'ok');
    } catch (err) {
        document.getElementById('offerMsg').textContent = err.message;
        toast(err.message || 'Error sending offers', 'error');
    }
}

/* ---------- Offers (filters + editing + search) ---------- */
function statusClass(s){
    if(s==='accepted') return 'status-accepted';
    if(s==='finalized') return 'status-finalized';
    if(s==='offered') return 'status-offered';
    if(s==='rejected') return 'status-rejected';
    if(s==='change_requested') return 'status-change_requested';
    return '';
}
function statusText(s){
    if(s==='accepted') return t('status_accepted');
    if(s==='change_requested') return t('status_change_requested');
    if(s==='finalized') return t('status_finalized');
    if(s==='rejected') return t('status_rejected');
    return t('status_offered');
}

function setOffersFilter(val, btn){
    offersFilter = val;
    document.querySelectorAll('#offerFilterBtns .mini').forEach(b=> b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderOffers();
}
function matchesOfferFilter(o){
    if(offersFilter==='all') return true;
    if(offersFilter==='pending') return o.status==='offered';
    if(offersFilter==='accepted') return o.status==='accepted';
    if(offersFilter==='rejected') return o.status==='rejected';
    if(offersFilter==='change_requested') return o.status==='change_requested';
    return true;
}

function toggleEditOffer(id, on){
    if(on) editingOffers.add(id); else editingOffers.delete(id);
    renderOffers();
}
async function saveOffer(id){
    try{
        const comment = document.getElementById('offerCmt_'+id)?.value || '';
        const professor_id = parseInt(document.getElementById('offerProf_'+id)?.value||'0',10)||null;
        const window_id = parseInt(document.getElementById('offerWin_'+id)?.value||'0',10)||null;
        await jfetch(API+'?action=update_offer',{method:'POST',body:JSON.stringify({id, comment, professor_id, window_id})});
        editingOffers.delete(id);
        await refreshOffers();
        toast(t('offer_updated_resend'),'ok');
    }catch(err){ toast(err.message||'Error','error'); }
}
function resetOffer(id){
    const orig = offerOriginals.get(id);
    if(!orig) { toggleEditOffer(id,false); return; }
    const profSel = document.getElementById('offerProf_'+id);
    const winSel  = document.getElementById('offerWin_'+id);
    const cmt     = document.getElementById('offerCmt_'+id);
    if(profSel) profSel.value = String(orig.professor_id);
    if(winSel)  winSel.value  = String(orig.window_id);
    if(cmt)     cmt.value     = orig.comment||'';
    toggleEditOffer(id,false);
}
// finalizeOffer function removed - only managers can finalize offers and approve changes
async function deleteOffer(id){
    try{
        const ok = await ui.confirm(t('delete_offer_confirm'), {variant:'error'});
        if(!ok) return;
        await jfetch(API+'?action=delete_offer',{method:'POST', body: JSON.stringify({id})});
        await Promise.all([refreshOffers(), refreshSlots()]);
        toast(t('offer_deleted'),'ok');
    }catch(err){ toast(err.message||'Error','error'); }
}

// Track collapsed state of offer windows
const collapsedOfferWindows = new Set();

function toggleOfferWindow(windowId) {
    const header = document.querySelector(`[data-window-id="${windowId}"] .offer-window-header`);
    const content = document.getElementById(`offer-content-${windowId}`);
    
    if (collapsedOfferWindows.has(windowId)) {
        // Expand
        collapsedOfferWindows.delete(windowId);
        header.classList.remove('collapsed');
        content.classList.add('expanded');
    } else {
        // Collapse
        collapsedOfferWindows.add(windowId);
        header.classList.add('collapsed');
        content.classList.remove('expanded');
    }
}

function renderOffers(){
    state.offers.forEach(o=>{
        if(!offerOriginals.has(o.id)) offerOriginals.set(o.id, {professor_id:o.professor_id, window_id:o.window_id, comment:o.comment||''});
    });

    const q = ($('#offersSearch')?.value||'').trim().toLowerCase();

    const groups = [];
    const map = new Map();
    state.offers.filter(o=> matchesOfferFilter(o)).forEach(o=>{
        const W = state.windows.find(x=>x.id===o.window_id);
        // Search condition
        const passSearch = (() => {
            if(!q) return true;
            if(/^\d+$/.test(q)) return String(o.id)===q || String(W?.no||'')===q || String(W?.id||'')===q;
            const profName = (nameById(o.professor_id) || '').toLowerCase();
            const wTitle = (W?.title || '').toLowerCase();
            return profName.includes(q) || wTitle.includes(q) || (o.status||'').toLowerCase().includes(q);
        })();
        if(!passSearch) return;

        if(!map.has(o.window_id)){
            map.set(o.window_id, { meta:o, items:[] });
            groups.push(map.get(o.window_id));
        }
        map.get(o.window_id).items.push(o);
    });

    const profOpts = state.users.filter(u=>u.role==='professor').sort((a,b)=>a.fullname.localeCompare(b.fullname));
    const winOpts = state.windows;

    // Start with all windows collapsed by default
    if(collapsedOfferWindows.size===0){
        groups.forEach(g=>collapsedOfferWindows.add(g.meta.window_id));
    }

    const windowSections = groups.map((g, idx)=>{
        const w = g.meta;
        const W = state.windows.find(x=>x.id===w.window_id) || w;
        const isCollapsed = collapsedOfferWindows.has(w.window_id);

        const dateChip = `<span class="meta-chip">${fmtDate(W.start_ts)}</span>`;
        const timeChip = `<span class="meta-chip">${fmtTime(W.start_ts)} <span class="meta-sep">→</span> ${fmtTime(W.end_ts)}</span>`;
        const blockChip= `<span class="meta-chip">${W.defense_minutes}+${W.buffer_minutes} min/block</span>`;

        const itemsHtml = g.items.map(o=>{
            const cls = statusClass(o.status);
            const stx = statusText(o.status);
            const editing = editingOffers.has(o.id);
            const profSel = `<select id="offerProf_${o.id}" class="sel" ${editing?'':'disabled'} style="max-width:260px">
                ${profOpts.map(p=>`<option value="${p.id}" ${p.id===o.professor_id?'selected':''}>${escapeHtml(p.fullname)}</option>`).join('')}
            </select>`;
            const winSel  = `<select id="offerWin_${o.id}" class="sel" ${editing?'':'disabled'} style="max-width:260px">
                ${winOpts.map(ww=>`<option value="${ww.id}" ${ww.id===o.window_id?'selected':''}>${escapeHtml(ww.title)} (No. ${ww.no})</option>`).join('')}
            </select>`;
            const cmtVal = escapeHtml(o.comment||'');
            const commentEl = editing ? `<input id="offerCmt_${o.id}" class="inp" value="${cmtVal}" placeholder="${t('comment')}">` : (cmtVal?`<span class="muted">"${cmtVal}"</span>`:'');
            const editBtns = editing
                ? `<button class="mini" onclick="saveOffer(${o.id})">${t('update_window_btn')}</button>
                   <button class="mini" onclick="resetOffer(${o.id})">${t('cancel')}</button>`
                : `<button class="mini" onclick="toggleEditOffer(${o.id}, true)">${t('edit_window')}</button>`;
            let finalizeBtn='';
            // Note: Only managers can finalize offers and approve changes
            // Assistants cannot finalize offers or approve change requests
            
            // Add indicator for offers that need manager approval
            if (o.status==='accepted') {
                finalizeBtn = `<span class="muted" style="font-size: 11px; padding: 4px 8px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 6px; color: #fbbf24;">
                    ⏳ Awaiting Manager Approval
                </span>`;
            }
            if (o.status==='change_requested') {
                finalizeBtn = `<span class="muted" style="font-size: 11px; padding: 4px 8px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 6px; color: #fbbf24;">
                    ⏳ Change Request Pending
                </span>`;
            }

            // Add slot information display
            let slotInfo = '';
            
            // Check for change request data
            const hasChangeRequest = o.status === 'change_requested';
            const hasWindowChange = hasChangeRequest && o.requested_window_id;
            const hasTimeChange = hasChangeRequest && o.requested_start && o.requested_end;
            
            if (hasWindowChange) {
                // Show requested window change
                const requestedWindow = state.windows.find(w => w.id === o.requested_window_id);
                if (requestedWindow) {
                    const requestedStart = new Date(requestedWindow.start_ts);
                    const requestedEnd = new Date(requestedWindow.end_ts);
                    const originalStart = new Date(W.start_ts);
                    const originalEnd = new Date(W.end_ts);
                    
                    slotInfo = `<div class="offer-line" style="margin-top: 4px;">
                        <span class="muted" style="font-size: 12px; color: #fbbf24;">
                            <strong>🔄 Requested Window Change:</strong><br>
                            ${requestedWindow.title || 'Window #' + requestedWindow.id} - ${requestedStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${requestedStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${requestedEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br>
                            <span style="color: var(--muted);">Instead of: ${W.title || 'Window #' + W.id} - ${originalStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${originalStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${originalEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </span>
                    </div>`;
                }
            } else if (hasTimeChange) {
                // Show requested time change within the same window
                const requestedStart = new Date(o.requested_start);
                const requestedEnd = new Date(o.requested_end);
                const originalStart = new Date(W.start_ts);
                const originalEnd = new Date(W.end_ts);
                
                slotInfo = `<div class="offer-line" style="margin-top: 4px;">
                    <span class="muted" style="font-size: 12px; color: #fbbf24;">
                        <strong>🔄 Requested Time Change:</strong><br>
                        ${requestedStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${requestedStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${requestedEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br>
                        <span style="color: var(--muted);">Instead of: ${originalStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${originalStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${originalEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </span>
                </div>`;
            } else if (o.slots && o.slots.length > 0) {
                const selectedSlots = o.slots.filter(s => s.is_selected);
                if (selectedSlots.length > 0) {
                    const slotTimes = selectedSlots.map(slot => {
                        const start = new Date(slot.slot_start_ts);
                        const end = new Date(slot.slot_end_ts);
                        return `${start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})} - ${end.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}`;
                    });
                    slotInfo = `<div class="offer-line" style="margin-top: 4px;">
                        <span class="muted" style="font-size: 12px;">
                            <strong>${o.selected_slots_count} of ${o.total_slots_count} slots offered:</strong><br>
                            ${slotTimes.join('<br>')}
                        </span>
                    </div>`;
                }
            }

            return `<div class="offer-item">
                <div class="offer-line">
                    <span class="badge">${escapeHtml(nameById(o.professor_id))}</span>
                    <span class="pill ${cls}">${stx}</span>
                    ${!editing ? commentEl : ''}
                </div>
                ${slotInfo}
                ${editing ? `<div class="offer-line">${profSel} ${winSel} ${commentEl}</div>` : ``}
                <div class="offer-line">
                    ${editBtns}
                    ${finalizeBtn}
                    <button class="mini danger" onclick="deleteOffer(${o.id})">Delete</button>
                </div>
            </div>`;
        }).join('');

        return `<div class="offer-window-section" data-window-id="${w.window_id}">
            <div class="offer-window-header ${isCollapsed ? 'collapsed' : ''}" onclick="toggleOfferWindow(${w.window_id})">
                <div class="window-info">
                    <div class="window-number">${idx+1}</div>
                    <div>
                        <div class="window-title">${escapeHtml(W.title||'')}</div>
                        <div class="window-meta">
                            ${dateChip}${timeChip}${blockChip}
                        </div>
                    </div>
                </div>
                <div class="window-actions">
                    <button class="mini danger" onclick="event.stopPropagation(); deleteWindow(event, ${w.window_id})" data-i18n="delete_window">${t('delete_window')}</button>
                    <button class="collapse-toggle" onclick="event.stopPropagation(); toggleOfferWindow(${w.window_id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="offer-window-content ${!isCollapsed ? 'expanded' : ''}" id="offer-content-${w.window_id}">
                <div class="offers-list">
                    ${itemsHtml}
                </div>
                
                <!-- Professor Matrix Section -->
                <div class="professor-matrix-section">
                    <div class="matrix-header">
                        <h4>Add More Professors to This Window</h4>
                        <div class="matrix-controls">
                            <button class="mini" onclick="selectAllProfessorsForWindow(${w.window_id})">Select All</button>
                            <button class="mini" onclick="clearAllProfessorsForWindow(${w.window_id})">Clear All</button>
                        </div>
                    </div>
                    
                    <div class="professor-matrix" id="professor-matrix-${w.window_id}">
                        ${generateProfessorMatrix(w.window_id)}
                    </div>
                    
                    <div class="matrix-actions">
                        <button class="btn primary" onclick="addSelectedProfessorsToWindow(${w.window_id})">
                            Update Selected Professors
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    $('#offersContainer').innerHTML = windowSections || `<div class="muted" style="padding:20px; text-align:center;">${t('no_offers')}</div>`;
}

/* ---------- Professor overview ---------- */
function slotEndTs(slot){
    if(slot.end_ts){ const d = new Date(slot.end_ts); if(!isNaN(+d)) return d; }
    const start = new Date(slot.timeslot);
    if(isNaN(+start)) return null;
    let durMin = 0;
    const win = state.windows.find(w=>{
        const ws = new Date(w.start_ts), we = new Date(w.end_ts);
        return !isNaN(+ws) && !isNaN(+we) && start >= ws && start < we;
    });
    if(win) durMin = (win.defense_minutes||0) + (win.buffer_minutes||0);
    if(!durMin) durMin = 25;
    return new Date(start.getTime() + durMin*60000);
}

function renderProfessorList(){
    const list = $('#profList');
    const profs = state.users.filter(u=>u.role==='professor')
        .map(p=>{
            const mine = state.slots.filter(s=>s.userid===p.id);
            const total = mine.length, approved = mine.filter(m=> (m.status_text||'').toLowerCase()==='approved' || m.approved===true).length;
            const next = mine.length? mine.map(s=>+new Date(s.timeslot)).sort((a,b)=>a-b)[0]: null;
            return {id:p.id, name:p.fullname, total, approved, next};
        })
        .sort((a,b)=> a.name.localeCompare(b.name));

    list.innerHTML = profs.map(x=>`
  <div class="prof-item" onclick="focusProfessor(${x.id}); this.parentNode.querySelectorAll('.prof-item').forEach(n=>n.classList.remove('active')); this.classList.add('active')">
    <div>
      <b>${escapeHtml(x.name)}</b><br>
      <small>${x.total} ${wordSlots(x.total)}${x.next? ' · '+ t('next_word') +' '+ new Date(x.next).toLocaleDateString(L()):''}</small>
    </div>
    <span class="ratio">${Math.round(100*(x.approved/(x.total||1)))}%</span>
  </div>`).join('') || `<div class="muted" style="padding:10px">${t('no_profs')}</div>`;

    if (profs.length && !$('#topology').dataset.hasSelection){
        focusProfessor(profs[0].id);
        const first = list.querySelector('.prof-item'); first && first.classList.add('active');
    }
}

function focusProfessor(pid){
    focusedProfessorId = pid;
    const prof = state.users.find(u=>u.id===pid);
    const mine = state.slots
        .filter(s=>s.userid===pid)
        .sort((a,b)=> new Date(a.timeslot)-new Date(b.timeslot));
    const approved = mine.filter(s=> (s.status_text||'').toLowerCase()==='approved' || s.approved===true).length;

    $('#topoTitle').textContent = `${t('topology_pick').split('·')[0].trim()} · ${prof?.fullname ?? ('ID '+pid)}`;
    $('#topoMeta').textContent = t('topology_meta', {total: mine.length, approved, slots_word: wordSlots(mine.length)});

    const svg = document.getElementById('topology');
    svg.innerHTML=''; svg.dataset.hasSelection = '1';

    const box = svg.getBoundingClientRect();
    const W = Math.max(560, Math.floor(box.width || 900));
    const H = Math.max(360, Math.floor(W * 0.4));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const PAD = 36, nodeR = 9, cx = W/2, cy = H/2 + 20;
    const centerR = Math.min(120, Math.max(48, 42 + mine.length*4));
    const maxRx = W/2 - PAD - centerR - nodeR - 4;
    const maxRy = H/2 - PAD - nodeR - 6;
    const rx = Math.max(120, Math.min(maxRx, 150 + mine.length*14));
    const ry = Math.max(100, Math.min(maxRy, 120 + mine.length*12));

    const NS = n => document.createElementNS('http://www.w3.org/2000/svg', n);
    const circle=(x,y,r,f,st,sw)=>{const c=NS('circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',r);c.setAttribute('fill',f);c.setAttribute('stroke',st);c.setAttribute('stroke-width',sw);return c;};
    const text=(x,y,str,fill='#e5e7eb',size=12,weight=400,anchor='start')=>{const t=NS('text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill',fill);t.setAttribute('font-size',size);t.setAttribute('font-weight',weight);t.setAttribute('text-anchor',anchor);t.textContent=str;return t;};
    const line=(x1,y1,x2,y2,stroke='#283552',sw=1)=>{const l=NS('line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',stroke);l.setAttribute('stroke-width',sw);return l;};
    const arcD=(cx,cy,rx,ry,sd,ed)=>{const toRad=d=>d*Math.PI/180;const s=toRad(sd), e=toRad(ed);const x1=cx+rx*Math.cos(s), y1=cy+ry*Math.sin(s);const x2=cx+rx*Math.cos(e), y2=cy+ry*Math.sin(e);const large=(Math.abs(ed-sd)%360)>180?1:0;const sweep=ed>sd?1:0;return `M ${x1} ${y1} A ${rx} ${ry} 0 ${large} ${sweep} ${x2} ${y2}`;};
    const pathArc=(cx,cy,rx,ry,startDeg,endDeg,stroke='#3a2d70',sw=1.6)=>{const p=NS('path');p.setAttribute('d',arcD(cx,cy,rx,ry,startDeg,endDeg));p.setAttribute('fill','none');p.setAttribute('stroke',stroke);p.setAttribute('stroke-width',sw);return p;};

    const center = circle(cx, cy, centerR, '#7c3aed33', '#8b5cf6', 4);
    const lbl1 = text(cx, cy-4, prof?.fullname ?? ('ID '+pid), '#e5e7eb', 16, 800, 'middle');
    const lbl2 = text(cx, cy+18, `${mine.length} ${wordSlots(mine.length)}`, '#93a4b5', 12, 400, 'middle');
    svg.append(center, lbl1, lbl2);
    svg.append(pathArc(cx, cy, rx, ry, 200, -20));

    const orbit = circle(cx, cy-centerR, 4, '#f472b6', '#0f142c', 2);
    svg.append(orbit);
    let angle = 0;
    const OR= centerR+6;
    function tick(){
        angle = (angle+2)%360;
        const rad = angle*Math.PI/180;
        orbit.setAttribute('cx', cx + OR*Math.cos(rad));
        orbit.setAttribute('cy', cy + OR*Math.sin(rad));
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const now = Date.now();

    mine.forEach((s, i)=>{
        const tFr = i/(mine.length-1 || 1);
        const theta = Math.PI * (1 - tFr);
        const x = cx - rx*Math.cos(theta);
        const y = cy - ry*Math.sin(theta) - 6;

        const ln = line(cx, cy-centerR+2, x, y);
        svg.append(ln);

        const approved = (s.status_text||'').toLowerCase()==='approved' || s.approved===true;
        const endTs = slotEndTs(s);
        const isPast = endTs ? (now >= +endTs) : false;

        const fillCol = isPast ? '#6b7280' : (approved ? 'var(--g)' : '#f59e0b');

        const node = circle(x, y, 9, fillCol, 'var(--card)', 2);
        svg.append(node);

        const timeLabel = new Date(s.timeslot).toLocaleString(L());
        const tl = text(x, y-16, timeLabel, '#e5e7eb', 10, 400, 'middle');
        tl.setAttribute('opacity','0');
        svg.append(tl);
        node.addEventListener('mouseenter', ()=> tl.setAttribute('opacity','1'));
        node.addEventListener('mouseleave', ()=> tl.setAttribute('opacity','0'));
    });

    const first = mine[0], last = mine[mine.length-1];
    if(first) svg.append(text(cx-rx, cy-ry-14, new Date(first.timeslot).toLocaleString(L()), '#9fb0ce', 11));
    if(last)  svg.append(text(cx+rx, cy-ry-14, new Date(last.timeslot).toLocaleString(L()), '#9fb0ce', 11, 400, 'end'));
}

setInterval(()=>{ if(focusedProfessorId) focusProfessor(focusedProfessorId); }, 60*1000);
window.addEventListener('focus', ()=>{ if(focusedProfessorId) focusProfessor(focusedProfessorId); });

/* ---------- Chart helpers + render (horizontal bars like screenshot) ---------- */
const tip = $('#tip');
function showTip(x,y,html){
    if(!html){ tip.style.opacity=0; return; }
    tip.innerHTML = html;
    tip.style.left = x+'px'; tip.style.top = y+'px';
    tip.style.opacity = 1;
}
function hideTip(){ tip.style.opacity=0; }
function fitCanvas(c){
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
}
function renderCharts(){ renderAssignmentsChart(); }

// Horizontal bar chart: Top windows by professor count
function renderAssignmentsChart(){
    const c = document.getElementById('chartSpark'); if(!c) return;
    const ctx = fitCanvas(c);
    const rect = c.getBoundingClientRect();
    const W = rect.width, H = rect.height;

    ctx.clearRect(0,0,W,H);

    const include = new Set(['offered','accepted','finalized','change_requested']);

    const countByWindow = new Map();
    state.offers.forEach(o=>{
        if(!include.has(o.status)) return;
        countByWindow.set(o.window_id, (countByWindow.get(o.window_id)||0)+1);
    });

    const rows = Array.from(countByWindow.entries()).map(([wid, cnt])=>{
        const w = state.windows.find(x=>x.id===wid);
        return {title: w?.title || `Window ${wid}`, count: cnt};
    }).sort((a,b)=> b.count - a.count).slice(0, 10);

    if(rows.length===0){
        ctx.fillStyle='#e6edf5'; ctx.font='700 18px system-ui'; ctx.textAlign='center';
        ctx.fillText(t('no_offers_to_chart'), W/2, H/2);
        c.onmousemove = null; c.onmouseleave = null;
        return;
    }

    ctx.font='12px system-ui';
    const labelW = Math.min(260, Math.max(...rows.map(r=>ctx.measureText(r.title).width)) + 18);
    const PADL = 18 + labelW, PADR = 24, PADT = 28, PADB = 28;

    const max = Math.max(1, ...rows.map(r=>r.count));
    const innerW = W - PADL - PADR;
    const innerH = H - PADT - PADB;
    const n = rows.length;
    const slotH = innerH / n;
    const barH = Math.min(28, Math.max(16, slotH*0.65));
    const accent = getAccent();

    // Title for axis (top-right small)
    ctx.fillStyle='#9fb0ce';
    ctx.textAlign='left';
    ctx.fillText(t('number_of_professors'), PADL, 16);

    // guide grid
    ctx.strokeStyle='#0e1831'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(PADL, PADT+0.5); ctx.lineTo(PADL, H-PADB+0.5);
    ctx.moveTo(PADL, H-PADB+0.5); ctx.lineTo(W-PADR, H-PADB+0.5);
    ctx.stroke();

    // bars
    const barRects = [];
    rows.forEach((r, i)=>{
        const y = PADT + i*slotH + (slotH - barH)/2;
        const w = (r.count/max) * innerW;

        // label (window title)
        ctx.textAlign='right';
        ctx.fillStyle='#e6edf5';
        ctx.fillText(r.title, PADL-10, y + barH*0.72);

        // bar bg
        ctx.fillStyle='#152043';
        const radius = 6;
        roundRect(ctx, PADL, y, innerW, barH, radius); ctx.fill();

        // bar fg (accent)
        const grad = ctx.createLinearGradient(PADL,0,PADL+w,0);
        grad.addColorStop(0, accent);
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        roundRect(ctx, PADL, y, Math.max(4,w), barH, radius); ctx.fill();

        // count number at tip
        ctx.fillStyle='#d6ddf0';
        ctx.textAlign='left';
        ctx.font='700 12px system-ui';
        ctx.fillText(String(r.count), PADL + Math.max(6,w) + 8, y + barH*0.72);

        barRects.push({x:PADL, y, w, h:barH, data:r});
    });

    // helper for tips
    function roundRect(ctx,x,y,w,h,r){
        const rr = Math.min(r, h/2, w/2);
        ctx.beginPath();
        ctx.moveTo(x+rr,y);
        ctx.arcTo(x+w,y,x+w,y+h,rr);
        ctx.arcTo(x+w,y+h,x,y+h,rr);
        ctx.arcTo(x,y+h,x,y,rr);
        ctx.arcTo(x,y,x+w,y,rr);
        ctx.closePath();
    }

    c.onmousemove = (ev)=>{
        const r=c.getBoundingClientRect(); const mx=ev.clientX-r.left; const my=ev.clientY-r.top;
        const hit = barRects.find(b => my>=b.y && my<=b.y+b.h && mx>=PADL && mx<=PADL+innerW);
        if(!hit){ hideTip(); return; }
        showTip(ev.clientX, ev.clientY,
            `<b>${escapeHtml(hit.data.title)}</b><br>${hit.data.count} ${t('professors')}`);
    };
    c.onmouseleave = hideTip;
}

/* ---------- SLOT SELECTION FUNCTIONS ---------- */

// Individual professor slot selection functions
async function onWindowSelected() {
    const windowId = parseInt(document.getElementById('offerWindow').value || '0');
    if (windowId > 0) {
        // Clear any existing slot selections when window changes
        clearProfessorSlotSelections();
        // Show the slot selection container
        document.getElementById('professorSlotSelections').style.display = 'block';
    } else {
        // Hide the slot selection container when no window is selected
        document.getElementById('professorSlotSelections').style.display = 'none';
        clearProfessorSlotSelections();
    }
}

function showProfessorSlotSelection(professorId, professorName) {
    const windowId = parseInt(document.getElementById('offerWindow').value || '0');
    if (windowId <= 0) return;
    
    const window = state.windows.find(w => w.id === windowId);
    if (!window) return;
    
    const slots = generateWindowSlots(window);
    const container = document.getElementById('professorSlotSelections');
    
    // Check if slot selection for this professor already exists
    const existingSelection = document.getElementById(`prof-slot-${professorId}`);
    if (existingSelection) return;
    
    const slotSelectionHtml = `
        <div id="prof-slot-${professorId}" class="professor-slot-selection">
            <h4>
                Slot Selection for <strong>${escapeHtml(professorName)}</strong>
                <span class="muted" style="font-weight:400; margin-left:8px">(Select at least one slot)</span>
                <div style="margin-left:auto; display:flex; gap:8px;">
                    <button class="mini" onclick="selectAllSlotsForProfessor(${professorId})" title="Select all slots">All</button>
                    <button class="mini" onclick="clearAllSlotsForProfessor(${professorId})" title="Clear all slots">Clear</button>
                    <button class="mini" onclick="loadPreviousSlotAssignments(${professorId}, '${escapeHtml(professorName)}')" title="Load previous assignments">↻</button>
                    <button class="mini danger" onclick="removeProfessorSlotSelection(${professorId})" title="Remove slot selection">×</button>
                </div>
            </h4>
            <div class="slot-selection-grid">
                ${slots.map((slot, index) => `
                    <label class="slot-check-item">
                        <input type="checkbox" 
                               data-professor-id="${professorId}" 
                               data-slot-index="${index}"
                               onchange="updateProfessorSlotSelection()">
                        <span class="slot-time">
                            <strong>${formatSlotTime(slot.start)}</strong>
                            <span class="muted"> → ${formatSlotTime(slot.end)}</span>
                        </span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', slotSelectionHtml);
    updateProfessorSlotSelection();
    
    // Small delay to ensure DOM is ready before loading previous assignments
    setTimeout(() => {
        if (document.getElementById(`prof-slot-${professorId}`)) {
            loadPreviousSlotAssignments(professorId, professorName);
        }
    }, 100);
}

function removeProfessorSlotSelection(professorId) {
    const selection = document.getElementById(`prof-slot-${professorId}`);
    if (selection) {
        selection.remove();
    }
}

function clearProfessorSlotSelections() {
    document.getElementById('professorSlotSelections').innerHTML = '';
}

function updateProfessorSlotSelection() {
    // Update the slot count display for each professor
    const professorSelections = document.querySelectorAll('.professor-slot-selection');
    professorSelections.forEach(selection => {
        const professorId = selection.id.replace('prof-slot-', '');
        const selectedCount = selection.querySelectorAll('input[type="checkbox"]:checked').length;
        const totalCount = selection.querySelectorAll('input[type="checkbox"]').length;
        
        // Update the title to show selection count
        const titleElement = selection.querySelector('h4');
        const professorName = titleElement.querySelector('strong').textContent;
        
        titleElement.innerHTML = `
            Slot Selection for <strong>${professorName}</strong>
            <span class="muted" style="font-weight:400; margin-left:8px">
                (${selectedCount}/${totalCount} slots selected)
            </span>
            <div style="margin-left:auto; display:flex; gap:8px;">
                <button class="mini" onclick="selectAllSlotsForProfessor(${professorId})" title="Select all slots">All</button>
                <button class="mini" onclick="clearAllSlotsForProfessor(${professorId})" title="Clear all slots">Clear</button>
                <button class="mini" onclick="loadPreviousSlotAssignments(${professorId}, '${escapeHtml(professorName)}')" title="Load previous assignments">↻</button>
                <button class="mini danger" onclick="removeProfessorSlotSelection(${professorId})" title="Remove slot selection">×</button>
            </div>
        `;
    });
}

function selectAllSlotsForProfessor(professorId) {
    const checkboxes = document.querySelectorAll(`#prof-slot-${professorId} input[type="checkbox"]`);
    checkboxes.forEach(cb => cb.checked = true);
    updateProfessorSlotSelection();
}

function clearAllSlotsForProfessor(professorId) {
    const checkboxes = document.querySelectorAll(`#prof-slot-${professorId} input[type="checkbox"]`);
    checkboxes.forEach(cb => cb.checked = false);
    updateProfessorSlotSelection();
}

async function loadPreviousSlotAssignments(professorId, professorName) {
    const windowId = parseInt(document.getElementById('offerWindow').value || '0');
    if (windowId <= 0) return;
    
    try {
        const response = await jfetch(API + `?action=get_previous_slot_assignments&window_id=${windowId}&professor_id=${professorId}`);
        
        if (response.previous_assignments && response.previous_assignments.length > 0) {
            // Apply previous slot selections
            const slotSelection = document.getElementById(`prof-slot-${professorId}`);
            if (slotSelection) {
                response.previous_assignments.forEach(slotIndex => {
                    const checkbox = slotSelection.querySelector(`input[data-slot-index="${slotIndex}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                
                // Update the slot count display
                updateProfessorSlotSelection();
                
                // Show a notification about loaded previous assignments
                const titleElement = slotSelection.querySelector('h4');
                if (titleElement) {
                    const professorNameElement = titleElement.querySelector('strong');
                    const professorName = professorNameElement ? professorNameElement.textContent : '';
                    
                    // Determine the type of assignment loaded
                    let assignmentType = 'previous slot assignments';
                    let indicatorColor = 'rgba(6,182,212,0.1)';
                    let borderColor = 'rgba(6,182,212,0.3)';
                    let textColor = 'var(--p)';
                    
                    if (response.status === 'finalized' || response.status === 'accepted') {
                        assignmentType = 'finalized slot assignments';
                        indicatorColor = 'rgba(34,197,94,0.1)';
                        borderColor = 'rgba(34,197,94,0.3)';
                        textColor = '#22c55e';
                    }
                    
                    // Add a small indicator that previous assignments were loaded
                    const indicator = document.createElement('div');
                    indicator.style.cssText = `margin-top: 8px; padding: 6px 10px; background: ${indicatorColor}; border: 1px solid ${borderColor}; border-radius: 6px; font-size: 12px; color: ${textColor};`;
                    indicator.textContent = `✓ Loaded ${assignmentType} (${response.previous_assignments.length} slots)`;
                    
                    // Remove any existing indicator
                    const existingIndicator = slotSelection.querySelector('.previous-assignments-indicator');
                    if (existingIndicator) {
                        existingIndicator.remove();
                    }
                    
                    indicator.className = 'previous-assignments-indicator';
                    slotSelection.appendChild(indicator);
                    
                    // Auto-remove the indicator after 5 seconds
                    setTimeout(() => {
                        if (indicator.parentNode) {
                            indicator.remove();
                        }
                    }, 5000);
                }
            }
            
            // Also load the previous comment if available
            if (response.comment && response.comment.trim()) {
                document.getElementById('offerComment').value = response.comment;
            }
        }
    } catch (error) {
        // Failed to load previous slot assignments
    }
}

async function loadAllPreviousAssignments() {
    const selectedProfs = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
    for (const checkbox of selectedProfs) {
        const professorId = parseInt(checkbox.value);
        const professorName = checkbox.nextElementSibling.textContent;
        await loadPreviousSlotAssignments(professorId, professorName);
    }
}

async function onProfessorSelectionChange(professorId, professorName, isSelected) {
    if (isSelected) {
        // Show slot selection for this professor
        showProfessorSlotSelection(professorId, professorName);
        // Ensure slot selection container is visible
        document.getElementById('professorSlotSelections').style.display = 'block';
    } else {
        // Remove slot selection for this professor
        removeProfessorSlotSelection(professorId);
        // Hide container if no professors are selected
        const selectedProfs = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
        if (selectedProfs.length === 0) {
            document.getElementById('professorSlotSelections').style.display = 'none';
        }
    }
}

function generateWindowSlots(window) {
    const slots = [];
    const start = new Date(window.start_ts);
    const end = new Date(window.end_ts);
    const strideMinutes = (window.defense_minutes || 20) + (window.buffer_minutes || 5);
    
    let current = new Date(start);
    let slotIndex = 0;
    
    while (current < end) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + (window.defense_minutes || 20) * 60000);
        
        slots.push({
            start: slotStart,
            end: slotEnd,
            index: slotIndex
        });
        
        current.setTime(current.getTime() + strideMinutes * 60000);
        slotIndex++;
    }
    
    return slots;
}

function formatSlotTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

function getSelectedSlots() {
    const selectedSlots = {};
    const checkboxes = document.querySelectorAll('.professor-slot-selection input[type="checkbox"]:checked');
    
    checkboxes.forEach(cb => {
        const professorId = parseInt(cb.dataset.professorId);
        const slotIndex = parseInt(cb.dataset.slotIndex);
        
        if (!selectedSlots[professorId]) {
            selectedSlots[professorId] = [];
        }
        selectedSlots[professorId].push(slotIndex);
    });
    
    return selectedSlots;
}

/* ---------- Professor Matrix Functions ---------- */
function generateProfessorMatrix(windowId) {
    const professors = state.users.filter(u => u.role === 'professor').sort((a, b) => a.fullname.localeCompare(b.fullname));
    const existingProfessors = state.offers.filter(o => o.window_id === windowId).map(o => o.professor_id);
    
    return professors.map(prof => {
        const isAlreadyAssigned = existingProfessors.includes(prof.id);
        const checked = isAlreadyAssigned ? 'checked' : '';
        const assignedClass = isAlreadyAssigned ? 'assigned' : '';
        
        return `
            <div class="professor-matrix-item-container">
                <div class="professor-matrix-item ${assignedClass}" onclick="toggleProfessorSlots(${windowId}, ${prof.id}, '${escapeHtml(prof.fullname)}')">
                    <input type="checkbox" 
                           id="prof-${windowId}-${prof.id}" 
                           value="${prof.id}" 
                           ${checked}
                           onchange="onProfessorMatrixChange(${windowId}, ${prof.id}, this.checked); event.stopPropagation();">
                    <span class="professor-name">${escapeHtml(prof.fullname)}</span>
                    <span class="professor-id">#${prof.id}</span>
                    ${isAlreadyAssigned ? '<span class="assigned-badge">✓ Assigned (Editable)</span>' : ''}
                    <span class="view-slots-hint">Click to view/edit slots</span>
                </div>
                <div class="professor-slots-panel" id="slots-panel-${windowId}-${prof.id}" style="display: none;">
                    <!-- Slots will be loaded here -->
                </div>
            </div>
        `;
    }).join('');
}

function onProfessorMatrixChange(windowId, professorId, isSelected) {

    
    if (!isSelected) {
        // Clear slot selections when professor is deselected
        const key = `${windowId}_${professorId}`;
        if (window.slotSelections[key]) {
            delete window.slotSelections[key];
        }
        
        // Remove selection indicators from UI
        const slotElements = document.querySelectorAll(`[data-window-id="${windowId}"][data-professor-id="${professorId}"]`);
        slotElements.forEach(element => {
            element.classList.remove('selected');
            const indicator = element.querySelector('.slot-selection-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        });
    }
}

function toggleProfessorSlots(windowId, professorId, professorName) {
    const slotsPanel = document.getElementById(`slots-panel-${windowId}-${professorId}`);
    
    const isVisible = slotsPanel.style.display !== 'none';
    
    if (isVisible) {
        // Hide slots
        slotsPanel.style.display = 'none';
        return;
    }
    
    // Hide all other slots panels first
    document.querySelectorAll('.professor-slots-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Show this professor's slots
    slotsPanel.style.display = 'block';
    
    // Load slots content
    loadProfessorSlots(windowId, professorId, professorName, slotsPanel);
}

function loadProfessorSlots(windowId, professorId, professorName, slotsPanel) {
    const windowData = state.windows.find(w => w.id === windowId);
    if (!windowData) {
        slotsPanel.innerHTML = '<div class="error-message">Window not found</div>';
        return;
    }
    
    // Generate slots for this window
    const slots = generateWindowSlots(windowData);
    
    // Check if professor already has offers for this window
    const existingOffer = state.offers.find(o => o.window_id === windowId && o.professor_id === professorId);
    const hasExistingOffer = !!existingOffer;
    
    // Get previously assigned slots if any
    let previouslyAssignedSlots = [];
    if (hasExistingOffer && existingOffer.slots) {
        previouslyAssignedSlots = existingOffer.slots.filter(s => s.is_selected).map(s => s.slot_index);
        
        // Initialize the slot selection state with previously assigned slots
        const key = `${windowId}_${professorId}`;
        window.slotSelections[key] = [...previouslyAssignedSlots];
    }
    
    // Create slots content
    const slotsContent = `
        <div class="professor-slots-content">
            <div class="slots-header">
                <h4>Time Slots Matrix for ${professorName}</h4>
                <p class="window-info">Window: ${windowData.title || 'Window #' + windowId}</p>
                <p class="time-info">${new Date(windowData.start_ts).toLocaleDateString()} ${new Date(windowData.start_ts).toLocaleTimeString()} - ${new Date(windowData.end_ts).toLocaleTimeString()}</p>
                <p class="matrix-info" style="${previouslyAssignedSlots.length > 0 ? 'color: var(--p); font-weight: 600;' : ''}">${previouslyAssignedSlots.length > 0 ? `Selected: ${previouslyAssignedSlots.length} of ${slots.length} time slots` : `Click slots to select • Total: ${slots.length} time slots available`}</p>
            </div>
            
            <div class="slots-matrix-container">
                <div class="slots-grid">
                ${slots.map((slot, index) => {
                    const isPreviouslyAssigned = previouslyAssignedSlots.includes(index);
                    const slotStart = slot.start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
                    const slotEnd = slot.end.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false});
                    
                    return `
                        <div class="slot-item ${isPreviouslyAssigned ? 'previously-assigned selected' : ''} selectable-slot" 
                             data-slot-index="${index}" 
                             data-professor-id="${professorId}"
                             data-window-id="${windowId}"
                             onclick="toggleSlotSelection(${windowId}, ${professorId}, ${index}, '${escapeHtml(professorName)}')"
                             title="Slot ${index + 1}: ${slotStart} - ${slotEnd}">
                            <div class="slot-time">${slotStart}<br>${slotEnd}</div>
                            ${isPreviouslyAssigned ? '<div class="assigned-indicator">✓</div>' : ''}
                            <div class="slot-selection-indicator" style="display: ${isPreviouslyAssigned ? 'block' : 'none'};">✓</div>
                        </div>
                    `;
                }).join('')}
                </div>
                <div class="slots-actions" style="margin-top: 12px; display: flex; gap: 8px; justify-content: center;">
                    <button class="mini" onclick="selectAllSlotsForProfessor(${windowId}, ${professorId}, '${escapeHtml(professorName)}')">Select All Slots</button>
                    <button class="mini" onclick="clearAllSlotsForProfessor(${windowId}, ${professorId}, '${escapeHtml(professorName)}')">Clear All Slots</button>
                </div>
            </div>
            
            ${hasExistingOffer ? `
                <div class="slots-actions">
                    <button class="btn primary" onclick="editProfessorOffer(${existingOffer.id})">Edit Offer</button>
                </div>
            ` : ''}
        </div>
    `;
    
    slotsPanel.innerHTML = slotsContent;
}

// Global slot selection state
window.slotSelections = window.slotSelections || {};

function toggleSlotSelection(windowId, professorId, slotIndex, professorName) {
    const key = `${windowId}_${professorId}`;
    if (!window.slotSelections[key]) {
        window.slotSelections[key] = [];
    }
    
    const slotElement = document.querySelector(`[data-window-id="${windowId}"][data-professor-id="${professorId}"][data-slot-index="${slotIndex}"]`);
    const selectionIndicator = slotElement?.querySelector('.slot-selection-indicator');
    
    if (window.slotSelections[key].includes(slotIndex)) {
        // Remove slot from selection
        window.slotSelections[key] = window.slotSelections[key].filter(idx => idx !== slotIndex);
        slotElement?.classList.remove('selected');
        if (selectionIndicator) {
            selectionIndicator.style.display = 'none';
        }
    } else {
        // Add slot to selection
        window.slotSelections[key].push(slotIndex);
        slotElement?.classList.add('selected');
        if (selectionIndicator) {
            selectionIndicator.style.display = 'block';
        }
    }
    
    // Update the slot count display
    updateSlotSelectionCount(windowId, professorId, professorName);
}

function updateSlotSelectionCount(windowId, professorId, professorName) {
    const key = `${windowId}_${professorId}`;
    const selectedCount = window.slotSelections[key]?.length || 0;
    
    // Find and update the matrix info text
    const slotsPanel = document.querySelector(`[data-window-id="${windowId}"][data-professor-id="${professorId}"]`)?.closest('.professor-slots-panel');
    if (slotsPanel) {
        const matrixInfo = slotsPanel.querySelector('.matrix-info');
        if (matrixInfo) {
            const windowData = state.windows.find(w => w.id === windowId);
            const totalSlots = windowData ? generateWindowSlots(windowData).length : 0;
            if (selectedCount > 0) {
                matrixInfo.textContent = `Selected: ${selectedCount} of ${totalSlots} time slots`;
                matrixInfo.style.color = 'var(--p)';
                matrixInfo.style.fontWeight = '600';
            } else {
                matrixInfo.textContent = `Click slots to select • Total: ${totalSlots} time slots available`;
                matrixInfo.style.color = '';
                matrixInfo.style.fontWeight = '';
            }
        }
    }
}

function selectAllSlotsForProfessor(windowId, professorId, professorName) {
    const windowData = state.windows.find(w => w.id === windowId);
    if (!windowData) return;
    
    const slots = generateWindowSlots(windowData);
    const key = `${windowId}_${professorId}`;
    window.slotSelections[key] = Array.from({length: slots.length}, (_, i) => i);
    
    // Update UI
    slots.forEach((_, index) => {
        const slotElement = document.querySelector(`[data-window-id="${windowId}"][data-professor-id="${professorId}"][data-slot-index="${index}"]`);
        if (slotElement) {
            slotElement.classList.add('selected');
            const indicator = slotElement.querySelector('.slot-selection-indicator');
            if (indicator) {
                indicator.style.display = 'block';
            }
        }
    });
    
    updateSlotSelectionCount(windowId, professorId, professorName);
    toast(`All ${slots.length} slots selected for ${professorName}`, 'ok');
}

function clearAllSlotsForProfessor(windowId, professorId, professorName) {
    const key = `${windowId}_${professorId}`;
    if (window.slotSelections[key]) {
        delete window.slotSelections[key];
    }
    
    // Update UI
    const slotElements = document.querySelectorAll(`[data-window-id="${windowId}"][data-professor-id="${professorId}"]`);
    slotElements.forEach(element => {
        element.classList.remove('selected');
        const indicator = element.querySelector('.slot-selection-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    });
    
    updateSlotSelectionCount(windowId, professorId, professorName);
    toast(`All slots cleared for ${professorName}`, 'info');
}

function editProfessorOffer(offerId) {
    const offer = state.offers.find(o => o.id === offerId);
    if (!offer) {
        toast('Offer not found', 'error');
        return;
    }
    
    // Find the window and professor
    const windowData = state.windows.find(w => w.id === offer.window_id);
    const professor = state.users.find(u => u.id === offer.professor_id);
    
    if (!windowData || !professor) {
        toast('Window or professor not found', 'error');
        return;
    }
    
    // Show edit modal
    showEditOfferModal(offer, windowData, professor);
}

function showEditOfferModal(offer, windowData, professor) {
    
    const modalHtml = `
        <div class="modal" data-mode="edit-offer" style="display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center;">
            <div class="modal-card" style="background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
                <h3>Edit Offer</h3>
                <p><strong>Professor:</strong> ${professor.fullname}</p>
                <p><strong>Window:</strong> ${windowData.title || 'Window #' + windowData.id}</p>
                <p><strong>Status:</strong> ${offer.status}</p>
                
                <div style="margin: 20px 0;">
                    <label>Comment:</label>
                    <textarea id="editOfferComment" class="inp" style="width: 100%; margin-top: 8px;">${offer.comment || ''}</textarea>
                </div>
                
                <div class="inline" style="justify-content: flex-end; gap: 12px;">
                    <button class="btn ghost" onclick="closeModal()">Cancel</button>
                    <button class="btn primary" onclick="saveOfferEdit(${offer.id})">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeModal() {
    const modal = document.querySelector('.modal[data-mode="edit-offer"]');
    if (modal) {
        modal.remove();
    }
}

async function saveOfferEdit(offerId) {
    try {
        const comment = document.getElementById('editOfferComment').value.trim();
        
        const response = await jfetch(API+'?action=update_offer', {
            method: 'POST',
            body: JSON.stringify({
                id: offerId,
                comment: comment
            })
        });
        
        if (response.ok) {
            toast('Offer updated successfully', 'ok');
            closeModal();
            await refreshOffers();
        } else {
            toast('Failed to update offer: ' + (response.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        toast('Error updating offer', 'error');
    }
}

function selectAllProfessorsForWindow(windowId) {
    const checkboxes = document.querySelectorAll(`#professor-matrix-${windowId} input[type="checkbox"]:not([disabled])`);
    checkboxes.forEach(cb => {
        cb.checked = true;
        const professorId = parseInt(cb.value);
        onProfessorMatrixChange(windowId, professorId, true);
    });
}

function clearAllProfessorsForWindow(windowId) {
    const checkboxes = document.querySelectorAll(`#professor-matrix-${windowId} input[type="checkbox"]`);
    checkboxes.forEach(cb => {
        cb.checked = false;
        const professorId = parseInt(cb.value);
        onProfessorMatrixChange(windowId, professorId, false);
        // Clear slot selections for this professor
        const key = `${windowId}_${professorId}`;
        if (window.slotSelections[key]) {
            delete window.slotSelections[key];
        }
    });
}

async function addSelectedProfessorsToWindow(windowId) {
    try {
        const checkboxes = document.querySelectorAll(`#professor-matrix-${windowId} input[type="checkbox"]:checked`);
        const selectedProfessors = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (selectedProfessors.length === 0) {
            toast('No professors selected. Please select at least one professor to add.', 'warning');
            return;
        }
        
        const windowData = state.windows.find(w => w.id === windowId);
        if (!windowData) {
            toast('Window not found', 'error');
            return;
        }
        
        // Show loading state
        const button = document.querySelector(`#professor-matrix-${windowId}`).closest('.professor-matrix-section').querySelector('.matrix-actions .btn');
        const originalText = button.textContent;
        button.textContent = 'Updating Professors...';
        button.disabled = true;
        
        // Handle offers for each selected professor (create new or update existing)
        const promises = selectedProfessors.map(async professorId => {
            const key = `${windowId}_${professorId}`;
            const selectedSlots = window.slotSelections[key] || [];
            
            // Check if professor already has an offer for this window
            const existingOffer = state.offers.find(o => o.window_id == windowId && o.professor_id == professorId);
            
            if (existingOffer) {
                // Update existing offer
                const updatePayload = {
                    id: existingOffer.id,
                    selected_slots: selectedSlots,
                    comment: `Updated via professor matrix`
                };
                    
                try {
                    const response = await jfetch(API+'?action=update_offer', {
                        method: 'POST',
                        body: JSON.stringify(updatePayload)
                    });
                    
                    if (response && response.ok === true && response.status === 'offered') {
                        return response;
                    } else if (response && response.error) {
                        throw new Error(`Server error: ${response.error}`);
                    } else {
                        throw new Error(`Unexpected response format: ${JSON.stringify(response)}`);
                    }
                } catch (error) {
                    throw error;
                }
            } else {
                // Create new offer
                const createPayload = {
                    window_id: windowId,
                    professor_id: professorId,
                    comment: `Added via professor matrix`,
                    selected_slots: selectedSlots
                };
                
                try {
                    const response = await jfetch(API+'?action=offer_window', {
                        method: 'POST',
                        body: JSON.stringify(createPayload)
                    });
                    
                    if (response && response.ok === true && response.offer_id) {
                        return response;
                    } else if (response && response.error) {
                        throw new Error(`Server error: ${response.error}`);
                    } else {
                        throw new Error(`Unexpected response format: ${JSON.stringify(response)}`);
                    }
                } catch (error) {
                    throw error;
                }
            }
        });
        
        const results = await Promise.allSettled(promises);
        
        // Separate successful and failed results
        const successful = results.filter(r => r.status === 'fulfilled');
        const failed = results.filter(r => r.status === 'rejected');
        
        // Refresh the offers and re-render
        await refreshOffers();
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        // Clear selections
        checkboxes.forEach(cb => cb.checked = false);
        
        // Clear all slot selections for this window
        Object.keys(window.slotSelections).forEach(key => {
            if (key.startsWith(`${windowId}_`)) {
                delete window.slotSelections[key];
            }
        });
        
        // Remove all selection indicators from UI
        document.querySelectorAll(`[data-window-id="${windowId}"]`).forEach(element => {
            element.classList.remove('selected');
            const indicator = element.querySelector('.slot-selection-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        });
        
        // Show appropriate success/warning message
        if (failed.length === 0) {
            toast(`Successfully updated ${successful.length} professor(s) for "${windowData.title || 'Window #' + windowId}"`, 'ok');
        } else if (successful.length > 0) {
            toast(`Updated ${successful.length} of ${selectedProfessors.length} professor(s). ${failed.length} already assigned.`, 'warning');
        } else {
            toast(`No professors were updated. All may already be assigned.`, 'info');
        }
        
    } catch (error) {

        
        // Reset button state on error
        const button = document.querySelector(`#professor-matrix-${windowId}`).closest('.professor-matrix-section').querySelector('.matrix-actions .btn');
        if (button) {
            button.textContent = 'Update Selected Professors';
            button.disabled = false;
        }
        
        // Show more specific error message
        let errorMessage = 'Error adding professors to window. Please try again.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.error) {
            errorMessage = `Error: ${error.error}`;
        }
        
        toast(errorMessage, 'error');
    }
}

/* ---------- INIT ---------- */
(async function init(){
    try{
        applyI18n();
        await whoami();
        bindPreview('win'); // create panel
        await refreshAll();
        Notifier.ask();

        // NEW: hook the themed pickers
        DateTimePicker.attachMany(['winStart','winEnd','ewinStart','ewinEnd']);
        DateTimePicker.watchDisabledSync(['winEnd','ewinEnd']);
    }catch(err){

        ui.alert('Error loading page: '+(err.message||err), {variant:'error'});
    }
})();
