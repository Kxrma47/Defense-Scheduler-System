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

const API='/backend/index.php';
const token = localStorage.getItem('defense_token') || '';
if(!token) location.href='index.html';
const $ = s => document.querySelector(s);
/* ============ i18n ============ */

const I18N = {
en: {
    app_title: 'Professor Console',
    back_to_login: '← Back to login',
    msk: 'MSK',
    schedule_overview: 'Schedule Overview',
    live_from_slots: 'Live from your slots',
    approval_split: 'Approval Split',
    weekly_distribution: 'Weekly Distribution',
    timeline_by_date: 'Timeline (by date)',
    bars_meta: 'Slots by weekday',
    spark_meta: 'Slots per day — earliest → latest',
    my_offers: 'My Offers',
    filter_all: 'All',
    filter_accepted: 'Accepted',
    filter_pending: 'Pending',
    filter_declined: 'Declined',
    my_slots: 'My Scheduled Slots',
    search_by_name: 'Search by schedule name…',
    all_statuses: 'All statuses',
    approved: 'Approved',
    pending: 'Pending',
    collapse: 'Collapse',
    expand: 'Expand',
    hello: 'Hello',
    welcome_prof: 'Welcome, Professor',
    loading_dashboard: 'Loading your dashboard',
    notice: 'Notice',
    please_confirm: 'Please confirm',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    professor_role_required: 'Professor role required',
    no_offers_yet: 'No offers yet.',
    no_slots_yet: 'No slots yet.',
    showing_first_hint: (n, m)=>`Showing first ${n} of ${m}. Use search to narrow down.`,
    status_offered: 'Offered',
    status_accepted_awaiting: 'Accepted — awaiting manager',
    status_finalized: 'Finalized',
    status_declined: 'Declined',
    status_change_requested_awaiting: 'Change requested — awaiting manager',
    accept: 'Accept',
    decline: 'Decline',
    request_change: 'Request change',
    update_change: 'Update change request',
    submit_decline: 'Submit decline',
    cancel: 'Cancel',
    send_request: 'Send request',
    reason_decline_label: 'Reason for declining',
    reason_decline_ph: 'Provide a brief reason (required)',
    select_other_label: 'Switch to this offer/window',
    select_other_placeholder: 'Select another offer or window…',
    change_comment_label: 'Comment (optional)',
    change_note_hint: 'Custom dates/times are not editable.',
    no_other_available: 'No other offers/windows available to switch to. Please contact your manager.',
    declined_earlier: ' [declined earlier]',
    response_submitted: 'Response submitted',
    declined_toast: 'Declined',
    accepted_waiting_toast: 'Accepted — awaiting manager to finalize',
    change_sent_toast: 'Change request sent — awaiting manager',
    notif_schedule_finalized_title: 'Schedule finalized',
    notif_schedule_finalized_body: 'Your defense slots have been created',
    notif_offer_accepted_title: 'Offer accepted',
    notif_offer_accepted_body: 'Awaiting manager to finalize',
    notif_change_requested_title: 'Change requested',
    notif_change_requested_body: 'Awaiting manager decision',
    notif_finalized_title: 'Finalized',
    notif_finalized_body: 'Your schedule is ready',
    reminder24: 'Reminder (24h)',
    reminder60: 'Reminder (60m)',
    reminder24_body: d => `You have a defense slot on ${d}`,
    reminder60_body: t => `You have a defense slot at ${t}`,
    finalized: 'Finalized',
    declined: 'Declined',
    slots_word_one: 'slot',
    slots_word_few: 'slots',
    slots_word_many: 'slots',
    prof_word_one: 'professor',
    prof_word_few: 'professors',
    prof_word_many: 'professors',
    window: 'Window',
    min_per_block: 'min/block',
    starts_on: d => `starts ${d}`,
    participants: 'Participants',
    day_mon: 'Mon', day_tue: 'Tue', day_wed: 'Wed', day_thu: 'Thu', day_fri: 'Fri', day_sat: 'Sat', day_sun: 'Sun',
    /* Polls */
    available_polls: 'Available Polls',
    search_polls: 'Search polls…',
    no_polls_yet: 'No polls available yet.',
    poll_created_by: 'Created by',
    poll_created_at: 'Created',
    poll_type_single: 'Single choice',
    poll_type_multiple: 'Multiple choice',
    poll_mode_text: 'Text options',
    poll_mode_timeslots: 'Time slots',
    poll_total_votes: 'Total votes',
    poll_participants: 'participants',
    poll_vote: 'Vote',
    poll_update_vote: 'Update vote',
    poll_vote_submitted: 'Vote submitted successfully',
    poll_vote_updated: 'Vote updated successfully',
    poll_already_voted: 'You have already voted',
    poll_select_options: 'Please select at least one option',
    poll_single_selection: 'Please select only one option',
    poll_timezone: 'Time zone',
    poll_voted_btn: 'Voted',              /* <-- NEW */
    select_time_slots: 'Select time slots',
    select_all: 'Select All',
    clear_all: 'Clear All'
},
ru: {
    app_title: 'Консоль преподавателя',
    back_to_login: '← Назад к входу',
    msk: 'МСК',
    schedule_overview: 'Обзор расписания',
    live_from_slots: 'Данные из ваших слотов',
    approval_split: 'Статусы согласования',
    weekly_distribution: 'Распределение по дням недели',
    timeline_by_date: 'Хронология (по датам)',
    bars_meta: 'Слоты по дням недели',
    spark_meta: 'Слоты по дням — от ранних к поздним',
    my_offers: 'Мои предложения',
    filter_all: 'Все',
    filter_accepted: 'Принято',
    filter_pending: 'В ожидании',
    filter_declined: 'Отклонено',
    my_slots: 'Мои назначенные слоты',
    search_by_name: 'Поиск по названию расписания…',
    all_statuses: 'Все статусы',
    approved: 'Одобрено',
    pending: 'В ожидании',
    collapse: 'Свернуть',
    expand: 'Развернуть',
    hello: 'Здравствуйте',
    welcome_prof: 'Добро пожаловать, преподаватель',
    loading_dashboard: 'Загружаем вашу панель',
    notice: 'Сообщение',
    please_confirm: 'Подтвердите действие',
    ok: 'ОК',
    yes: 'Да',
    no: 'Нет',
    professor_role_required: 'Требуется роль преподавателя',
    no_offers_yet: 'Пока нет предложений.',
    no_slots_yet: 'Слотов пока нет.',
    showing_first_hint: (n, m)=>`Показаны первые ${n} из ${m}. Используйте поиск, чтобы сузить список.`,
    status_offered: 'Предложено',
    status_accepted_awaiting: 'Принято — ожидает менеджера',
    status_finalized: 'Финализировано',
    status_declined: 'Отклонено',
    status_change_requested_awaiting: 'Запрошено изменение — ожидает менеджера',
    accept: 'Принять',
    decline: 'Отклонить',
    request_change: 'Запросить изменение',
    update_change: 'Обновить запрос изменения',
    submit_decline: 'Отправить отказ',
    cancel: 'Отмена',
    send_request: 'Отправить запрос',
    reason_decline_label: 'Причина отказа',
    reason_decline_ph: 'Кратко опишите причину (обязательно)',
    select_other_label: 'Переключиться на это предложение/окно',
    select_other_placeholder: 'Выберите другое предложение или окно…',
    change_comment_label: 'Комментарий (необязательно)',
    change_note_hint: 'Свои даты/время недоступны для редактирования.',
    no_other_available: 'Нет доступных альтернатив. Свяжитесь с менеджером.',
    declined_earlier: ' [ранее отклонено]',
    response_submitted: 'Ответ отправлен',
    declined_toast: 'Отказ отправлен',
    accepted_waiting_toast: 'Принято — ожидает финализации',
    change_sent_toast: 'Запрос изменения отправлен — ожидает менеджера',
    notif_schedule_finalized_title: 'Расписание финализировано',
    notif_schedule_finalized_body: 'Ваши слоты защиты созданы',
    notif_offer_accepted_title: 'Предложение принято',
    notif_offer_accepted_body: 'Ожидает финализации менеджером',
    notif_change_requested_title: 'Запрошено изменение',
    notif_change_requested_body: 'Ожидает решения менеджера',
    notif_finalized_title: 'Финализировано',
    notif_finalized_body: 'Ваше расписание готово',
    reminder24: 'Напоминание (24ч)',
    reminder60: 'Напоминание (60мин)',
    reminder24_body: d => `У вас слот защиты ${d}`,
    reminder60_body: t => `У вас слот защиты в ${t}`,
    finalized: 'Финализировано',
    declined: 'Отклонено',
    slots_word_one: 'слот',
    slots_word_few: 'слота',
    slots_word_many: 'слотов',
    prof_word_one: 'преподаватель',
    prof_word_few: 'преподавателя',
    prof_word_many: 'преподавателей',
    window: 'Окно',
    min_per_block: 'мин/блок',
    starts_on: d => `начало ${d}`,
    participants: 'Участники',
    day_mon: 'Пн', day_tue: 'Вт', day_wed: 'Ср', day_thu: 'Чт', day_fri: 'Пт', day_sat: 'Сб', day_sun: 'Вс',
    /* Polls */
    available_polls: 'Доступные опросы',
    search_polls: 'Поиск опросов…',
    no_polls_yet: 'Пока нет доступных опросов.',
    poll_created_by: 'Создано',
    poll_created_at: 'Создано',
    poll_type_single: 'Один выбор',
    poll_type_multiple: 'Несколько выборов',
    poll_mode_text: 'Текстовые варианты',
    poll_mode_timeslots: 'Временные слоты',
    poll_total_votes: 'Всего голосов',
    poll_participants: 'участников',
    poll_vote: 'Голосовать',
    poll_update_vote: 'Обновить голос',
    poll_vote_submitted: 'Голос успешно отправлен',
    poll_vote_updated: 'Голос успешно обновлен',
    poll_already_voted: 'Вы уже голосовали',
    poll_select_options: 'Пожалуйста, выберите хотя бы один вариант',
    poll_single_selection: 'Пожалуйста, выберите только один вариант',
    poll_timezone: 'Часовой пояс',
    poll_voted_btn: 'Проголосовано',      /* <-- NEW */
    select_time_slots: 'Выберите временные слоты',
    select_all: 'Выбрать все',
    clear_all: 'Очистить все'
}
};

let LANG = (localStorage.getItem('lang') || (navigator.language||'en').slice(0,2)).toLowerCase();
if(!['en','ru'].includes(LANG)) LANG = 'en';
function t(key, arg){
const dict = I18N[LANG] || I18N.en;
const val = dict[key] ?? I18N.en[key] ?? key;
if(typeof val === 'function') return val(arg?.a ?? arg?.date ?? arg?.n ?? arg);
return val;
}
const t_ = (k,a)=>t(k,a);

function pluralWord(n, base){
if(LANG==='ru'){
    const mod10 = n%10, mod100=n%100;
    if(mod10===1 && mod100!==11) return I18N.ru[base+'_word_one'];
    if(mod10>=2 && mod10<=4 && !(mod100>=12 && mod100<=14)) return I18N.ru[base+'_word_few'];
    return I18N.ru[base+'_word_many'];
} else {
    return n===1 ? I18N.en[base+'_word_one'] : I18N.en[base+'_word_many'];
}
}
function applyI18n(){
document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.getAttribute('data-i18n'));
});
document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
});
document.title = t('app_title');
const btn = $('#btnSlotsSection');
if(btn) btn.textContent = slotsCollapsed ? t('expand') : t('collapse');
const btnP = $('#btnPollsSection');
if(btnP) btnP.textContent = pollsCollapsed ? t('expand') : t('collapse');
document.documentElement.lang = LANG;
document.querySelectorAll('.mini.lang').forEach(b=> b.classList.toggle('active', b.dataset.lang===LANG));
const barsMeta = $('#barsMeta'); if(barsMeta) barsMeta.textContent = `${t('bars_meta')} (${t('msk')})`;
const sparkMeta = $('#sparkMeta'); if(sparkMeta) sparkMeta.textContent = `${t('spark_meta')} (${t('msk')})`;
// re-render dynamic blocks that contain i18n pieces
updateOfferFilterBar(); renderOffers(); renderScheduleCards(); updateCharts(); renderPolls();
}
document.addEventListener('click', (e)=>{
const b = e.target.closest('.mini.lang');
if(!b) return;
const newLang = b.dataset.lang;
if(newLang && newLang!==LANG){
    LANG = newLang;
    localStorage.setItem('lang', LANG);
    applyI18n();
    tickClock();
    toast(LANG==='ru' ? 'Язык переключён: Русский' : 'Language switched: English');
}
});

/* ========= fetch helpers ========= */
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
const esc = (s='') => s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
function logout(e){ e?.preventDefault?.(); localStorage.removeItem('defense_token'); location.href='index.html'; }

/* ripple */
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
if(el) addRipple(ev);
});

function toast(msg, type='ok'){
const box = $('#toasts');
const el = document.createElement('div');
el.className = 'toast ' + (type==='error'?'err':'ok');
el.textContent = msg;
box.appendChild(el);
setTimeout(()=> el.remove(), 4500);
}

const MSK_TZ = 'Europe/Moscow';
function fmtDateMSK(d, opts){ return new Intl.DateTimeFormat(undefined, {timeZone: MSK_TZ, ...opts}).format(new Date(d)); }
function tickClock(){
const fmt = LANG==='ru'?'ru-RU':'en-GB';
const tNow = new Intl.DateTimeFormat(fmt, {timeZone: MSK_TZ, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}).format(new Date());
$('#clock').textContent = `${tNow} ${t('msk')}`;
}
setInterval(tickClock, 1000); tickClock();

/* modal helpers */
function showDialog({title=null, message='', okText=null, cancelText=null}={}){
return new Promise(resolve=>{
    const root = $('#dialogRoot');
    root.innerHTML = `
<div class="modal-card" role="document" tabindex="-1">
  <h4 class="modal-title">${esc(title ?? t('notice'))}</h4>
  <div class="modal-body">${message}</div>
  <div class="modal-actions">
    ${cancelText !== null ? `<button class="btn ghost" id="dlgCancel">${esc(cancelText ?? t('no'))}</button>`:''}
    <button class="btn primary" id="dlgOk">${esc(okText ?? t('ok'))}</button>
  </div>
</div>`;
    const btnOk = root.querySelector('#dlgOk');
    const btnCancel = root.querySelector('#dlgCancel');
    const close = (val)=>{
        root.classList.remove('show'); root.setAttribute('aria-hidden','true');
        setTimeout(()=>{ root.innerHTML=''; resolve(val); }, 140);
        window.removeEventListener('keydown', onKey); root.removeEventListener('click', onBackdrop);
    };
    const onKey = (e)=>{ if(e.key==='Escape'){ btnCancel? close(false): close(true);} if(e.key==='Enter'){ close(true);} };
    const onBackdrop = (e)=>{ if(e.target===root){ btnCancel? close(false): close(true);} };
    btnOk.addEventListener('click', ()=> close(true));
    if(btnCancel) btnCancel.addEventListener('click', ()=> close(false));
    window.addEventListener('keydown', onKey); root.addEventListener('click', onBackdrop);
    root.classList.add('show'); root.setAttribute('aria-hidden','false'); setTimeout(()=> btnOk.focus(), 30);
});
}
const alertDialog  = (message, opts={}) => showDialog({title: opts.title??t('notice'), message, okText: opts.okText??t('ok')});

/* data/state */
let ME=null, myOffers=[], mySlotsRaw=[], myNotesBySlot = new Map();
let slotsCollapsed = false;
let openScheduleId = null;
let peopleById = new Map();
let offerFilter = 'all';
let allWindows = [];

/* Poll system state */
let polls = [];
let myVotes = new Map(); // poll_id -> Set(option_ids) (local session memory)
let pollsCollapsed = false;

async function whoami(){
const res = await jfetch(API+'?action=whoami');
ME = res.user;
if(ME.role!=='professor'){
    toast(t('professor_role_required'),'error');
    location.href='index.html';
    return;
}
$('#me').textContent = `Logged in as ${ME.fullname} [${ME.role}]`;
}

/* --------- Offers (unchanged core) --------- */
function friendlyStatus(status){
switch(status){
    case 'accepted': return {text:t('status_accepted_awaiting'), cls:'status-accepted'};
    case 'finalized': return {text:t('status_finalized'), cls:'status-finalized'};
    case 'rejected': return {text:t('status_declined'), cls:'status-rejected'};
    case 'change_requested': return {text:t('status_change_requested_awaiting'), cls:'status-change_requested'};
    case 'offered':
    default: return {text:t('status_offered'), cls:'status-offered'};
}
}
function statusPill(status){ const s=friendlyStatus(status); return `<span class="pill ${s.cls}">${s.text}</span>`; }
function fmtChip(ts){
const d = new Date(ts);
const ds = fmtDateMSK(d, {weekday:'short', month:'short', day:'numeric'});
const tm = fmtDateMSK(d, {hour:'2-digit', minute:'2-digit'});
return `<span class="timechip">${ds} ${tm} (${t('msk')})</span>`;
}
function offerCounts(){
const acc = myOffers.filter(o=> o.status==='accepted' || o.status==='finalized').length;
const pend = myOffers.filter(o=> o.status==='offered' || o.status==='change_requested').length;
const dec = myOffers.filter(o=> o.status==='rejected').length;
return {all: myOffers.length, accepted: acc, pending: pend, declined: dec};
}
function updateOfferFilterBar(){
const c = offerCounts();
$('#ofc_all').textContent = c.all;
$('#ofc_accepted').textContent = c.accepted;
$('#ofc_pending').textContent = c.pending;
$('#ofc_declined').textContent = c.declined;
['all','accepted','pending','declined'].forEach(k=>{
    const btn = $('#ofbtn_'+k);
    if(!btn) return;
    btn.classList.toggle('active', offerFilter===k);
});
}
function setOfferFilter(k){ offerFilter=k; updateOfferFilterBar(); renderOffers(); }

function offerLabel(off){
const s = new Date(off.start_ts), e = new Date(off.end_ts);
const range = `${fmtDateMSK(s,{month:'short',day:'numeric'})} ${fmtDateMSK(s,{hour:'2-digit',minute:'2-digit'})} → ${fmtDateMSK(e,{hour:'2-digit',minute:'2-digit'})}`;
const blk = `${off.defense_minutes}+${off.buffer_minutes} ${t('min_per_block')}`;
return `${off.title || t('window')} — ${range} — ${blk}`;
}
function windowLabel(w){
const s = new Date(w.start_ts), e = new Date(w.end_ts);
const range = `${fmtDateMSK(s,{month:'short',day:'numeric'})} ${fmtDateMSK(s,{hour:'2-digit',minute:'2-digit'})} → ${fmtDateMSK(e,{hour:'2-digit',minute:'2-digit'})}`;
const blk = `${w.defense_minutes}+${w.buffer_minutes} ${t('min_per_block')}`;
return `${w.title || (t('window')+' #'+w.id)} — ${range} — ${blk}`;
}

function renderOffers(){
const box = $('#offersBox'); 
const c = offerCounts(); 
updateOfferFilterBar();

let list = myOffers.slice();
if(offerFilter==='accepted') list = list.filter(o=> o.status==='accepted' || o.status==='finalized');
if(offerFilter==='pending')  list = list.filter(o=> o.status==='offered' || o.status==='change_requested');
if(offerFilter==='declined') list = list.filter(o=> o.status==='rejected');

$('#offersMeta').textContent = myOffers.length ? `${list.length}/${myOffers.length} — ${t('filter_'+offerFilter)}` : t('no_offers_yet');

if(!myOffers.length){ 
    box.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${t('no_offers_yet')}</div>
            <div style="font-size: 14px;">No defense scheduling offers have been sent to you yet.</div>
        </div>
    `; 
    return; 
}

const offeredWindowIds = new Set(myOffers.map(o=> o.window_id));

box.innerHTML = list.map(o=>{
    // Enhanced time display
    const timeRow = `
        <div class="time-row">
            <div class="time-chip">
                ${fmtChip(o.start_ts)}
            </div>
            <span class="arrow">→</span>
            <div class="time-chip">
                ${fmtChip(o.end_ts)}
            </div>
            <span class="pill small">${o.defense_minutes}+${o.buffer_minutes} ${t('min_per_block')}</span>
        </div>
    `;
    
    // Enhanced slot information
    let slotInfo = '';
    if (o.slots && o.slots.length > 0) {
        const selectedSlots = o.slots.filter(s => s.is_selected);
        const totalSlots = o.slots.length;
        const selectedCount = selectedSlots.length;
        
        if (selectedCount > 0) {
            const slotTimes = selectedSlots.map(slot => {
                const start = new Date(slot.slot_start_ts);
                const end = new Date(slot.slot_end_ts);
                return `
                    <div class="slot-time-chip">
                        ${start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})} - ${end.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                    </div>
                `;
            }).join('');
            
            slotInfo = `
                <div class="slot-info">
                    <div class="slot-info-header">
                        <div>
                            <strong>${selectedCount}</strong> of <strong>${totalSlots}</strong> slots offered
                        </div>
                    </div>
                    <div class="slot-times">
                        ${slotTimes}
                    </div>
                </div>
            `;
        } else {
            slotInfo = `
                <div class="slot-info">
                    <div class="slot-info-header">
                        <div>
                            <strong>${totalSlots}</strong> slots available (none selected)
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Enhanced comment display
    const comment = o.comment ? `
        <div class="offer-comment">
            ${esc(o.comment)}
        </div>
    ` : '';
    
    // Enhanced actions
    const rid = 'req_'+o.id; 
    const did = 'rej_'+o.id;
    let actions = '';
    
    if (o.status==='finalized' || o.status==='accepted'){
        actions = `<button class="btn primary" onclick="toggleChange('${rid}')">${t('request_change')}</button>`;
    } else if (o.status==='change_requested'){
        actions = `<button class="btn primary" onclick="toggleChange('${rid}')">${t('update_change')}</button>`;
    } else if (o.status==='offered'){
        actions = `
            <button class="btn success" onclick="respond(${o.id}, 'accept')">${t('accept')}</button>
            <button class="btn danger" onclick="toggleRejection('${did}')">${t('decline')}</button>
            <button class="btn primary" onclick="toggleChange('${rid}')">${t('request_change')}</button>
        `;
    } else {
        actions = `<span class="muted">${t('status_'+o.status) || t('status_offered')}</span>`;
    }
    
    // Finalized note
    let finalizedNote = '';
    if (o.status==='finalized' && visibleSlotsAll().length){
        const mine = visibleSlotsAll().filter(s=> String(s.window_id)===String(o.window_id));
        if(mine.length){
            const first = mine.map(s=>+new Date(s.timeslot)).sort((a,b)=>a-b)[0];
            if(first)                     finalizedNote = `
                <div style="margin-top: 8px; padding: 8px; background: var(--g); color: white; border-radius: 8px; font-size: 12px; font-weight: 600;">
                    ${t('starts_on', fmtDateMSK(first,{dateStyle:'medium', timeStyle:'short'}))}
                </div>
            `;
        }
    }
    
    // Change request options
    const otherOffers = myOffers.filter(x=> x.id !== o.id && x.status !== 'finalized').sort((a,b)=> new Date(a.start_ts)-new Date(b.start_ts));
    const otherWindows = (allWindows||[]).filter(w => w.id !== o.window_id && !offeredWindowIds.has(w.id)).sort((a,b)=> new Date(a.start_ts)-new Date(b.start_ts));
    
    let optionsHtml = '';
    if (otherOffers.length){
        optionsHtml += `<optgroup label="${esc(t('my_offers'))}">` +
            otherOffers.map(t2=>{
                const tag = t2.status==='rejected' ? t('declined_earlier') : '';
                return `<option value="offer:${t2.id}">${esc(offerLabel(t2)+tag)}</option>`;
            }).join('') + `</optgroup>`;
    }
    if (otherWindows.length){
        optionsHtml += `<optgroup label="${esc(t('window'))}">` +
            otherWindows.map(w=>`<option value="window:${w.id}">${esc(windowLabel(w))}</option>`).join('') + `</optgroup>`;
    }
    
    const selHtml = optionsHtml
        ? `<select id="chgSel_${o.id}" class="sel" onchange="onWindowSelectionChange(${o.id})"><option value="">${esc(t('select_other_placeholder'))}</option>${optionsHtml}</select>`
        : `<div class="muted">${t('no_other_available')}</div>`;
    
    const sendBtn = optionsHtml ? `<button class="btn primary" onclick="sendChangeTo(${o.id})">${t('send_request')}</button>` : `<button class="btn primary" disabled>${t('send_request')}</button>`;
    
    return `
        <div class="offer-card status-${o.status}" aria-live="polite">
            <div class="offer-head">
                <div class="offer-title-section">
                    <div class="offer-title">${esc(o.title||t('window'))}</div>
                    <div class="offer-meta">
                        ${timeRow}
                        ${finalizedNote}
                    </div>
                </div>
                <div class="offer-status-section">
                    ${statusPill(o.status)}
                </div>
            </div>
            
            ${comment}
            ${slotInfo}
            
            <div class="offer-actions">${actions}</div>
            
            <div id="${did}" class="collapsible" aria-hidden="true">
                <div class="row" style="margin-top: 16px">
                    <div class="col-12">
                        <label class="req">${t('reason_decline_label')}</label>
                        <textarea id="decline_${o.id}" placeholder="${t('reason_decline_ph')}" style="width: 100%; min-height: 80px; margin-top: 8px;"></textarea>
                    </div>
                </div>
                <div class="inline" style="margin-top: 12px">
                    <button class="btn danger" onclick="sendDecline(${o.id})">${t('submit_decline')}</button>
                    <button class="btn ghost" onclick="toggleRejection('${did}', true)">${t('cancel')}</button>
                </div>
            </div>
            
            <div id="${rid}" class="collapsible" aria-hidden="true">
                <div class="row" style="margin-top: 16px">
                    <div class="col-12">
                        <label class="req">${t('select_other_label')}</label>
                        ${selHtml}
                    </div>
                </div>
                <label style="margin-top: 12px; display: block;">${t('change_comment_label')}</label>
                <textarea id="chgCmt_${o.id}" placeholder="e.g., &quot;Prefer this timing&quot;" style="width: 100%; min-height: 80px; margin-top: 8px;"></textarea>
                <div class="inline" style="margin-top: 12px">
                    ${sendBtn}
                    <button class="btn ghost" onclick="toggleChange('${rid}', true)">${t('cancel')}</button>
                </div>
                <div class="muted" style="margin-top: 8px; font-size: 12px;">${t('change_note_hint')}</div>
            </div>
        </div>
    `;
}).join('');
}

function toggleChange(id, hide=false){
const el = document.getElementById(id);
if(!el) return; if(hide){ el.classList.remove('open'); el.setAttribute('aria-hidden','true'); return; }
el.classList.toggle('open'); el.setAttribute('aria-hidden', el.classList.contains('open') ? 'false' : 'true');
}

function onWindowSelectionChange(offerId) {
const sel = document.getElementById('chgSel_' + offerId);
if (!sel) return;

const {type, id} = parseSelValue(sel.value || '');
const slotContainer = document.getElementById('slotSelection_' + offerId);

// Remove existing slot selection if any
if (slotContainer) {
    slotContainer.remove();
}

if (type === 'window' && id > 0) {
    // Find the selected window
    const selectedWindow = (allWindows || []).find(w => w.id === id);
    if (selectedWindow) {
        // Generate time slots for this window
        const slots = generateWindowSlots(selectedWindow);
        
        // Create slot selection container
        const changeContainer = document.getElementById('req_' + offerId);
        if (changeContainer) {
            const slotSelectionHtml = `
                <div id="slotSelection_${offerId}" class="slot-selection-container" style="margin-top: 16px;">
                    <label class="req">${t('select_time_slots') || 'Select time slots:'}</label>
                    <div class="slot-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-top: 8px;">
                        ${slots.map((slot, index) => `
                            <label class="slot-check-item" style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--line); border-radius: 8px; cursor: pointer;">
                                <input type="checkbox" 
                                       id="slot_${offerId}_${index}"
                                       data-slot-index="${index}"
                                       data-start-ts="${slot.start_ts}"
                                       data-end-ts="${slot.end_ts}"
                                       style="margin: 0;">
                                <span style="font-size: 12px; font-weight: 500;">
                                    ${formatSlotTime(new Date(slot.start_ts))} - ${formatSlotTime(new Date(slot.end_ts))}
                                </span>
                            </label>
                        `).join('')}
                    </div>
                    <div style="margin-top: 8px;">
                        <button class="mini" onclick="selectAllSlots(${offerId})" style="margin-right: 8px;">${t('select_all') || 'Select All'}</button>
                        <button class="mini" onclick="clearAllSlots(${offerId})">${t('clear_all') || 'Clear All'}</button>
                    </div>
                </div>
            `;
            
            // Insert after the comment textarea
            const commentTextarea = changeContainer.querySelector('textarea');
            if (commentTextarea) {
                commentTextarea.insertAdjacentHTML('afterend', slotSelectionHtml);
            }
        }
    }
}
}

function generateWindowSlots(window) {
const slots = [];
const start = new Date(window.start_ts);
const end = new Date(window.end_ts);
const defenseMinutes = window.defense_minutes || 20;
const bufferMinutes = window.buffer_minutes || 5;
const strideMinutes = defenseMinutes + bufferMinutes;

let current = new Date(start);
let slotIndex = 0;

while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + defenseMinutes * 60000);
    
    slots.push({
        index: slotIndex,
        start_ts: slotStart.toISOString(),
        end_ts: slotEnd.toISOString()
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

function selectAllSlots(offerId) {
const checkboxes = document.querySelectorAll(`#slotSelection_${offerId} input[type="checkbox"]`);
checkboxes.forEach(cb => cb.checked = true);
}

function clearAllSlots(offerId) {
const checkboxes = document.querySelectorAll(`#slotSelection_${offerId} input[type="checkbox"]`);
checkboxes.forEach(cb => cb.checked = false);
}
function toggleRejection(id, hide=false){ toggleChange(id, hide); }

async function respond(offerId, decision){
try{
    const response = await jfetch(API+'?action=respond_offer',{method:'POST', body: JSON.stringify({offer_id:offerId, decision})});
    await refresh();
    
    if (decision === 'accept') {
        if (response.auto_finalized) {
            toast(t('accepted_and_finalized_toast') || 'Offer accepted and automatically finalized!', 'ok');
        } else {
            toast(t('accepted_waiting_toast') || 'Offer accepted, waiting for manager to finalize', 'ok');
        }
    } else {
        toast(t('response_submitted') || 'Response submitted', 'ok');
    }
}catch(e){ toast(e.message || 'Error', 'error'); }
}
async function sendDecline(offerId){
const reason = ($('#decline_'+offerId)?.value||'').trim();
if(!reason){ toast(t('reason_decline_ph'), 'error'); return; }
try{
    await jfetch(API+'?action=respond_offer',{method:'POST', body: JSON.stringify({offer_id:offerId, decision:'reject', comment:reason})});
    await refresh();
    toast(t('declined_toast'));
}catch(e){ toast(e.message || 'Error', 'error'); }
}

function parseSelValue(v){
if(!v) return {type:'', id:0};
if(v.startsWith('offer:'))  return {type:'offer',  id: parseInt(v.slice(6),10)||0};
if(v.startsWith('window:')) return {type:'window', id: parseInt(v.slice(7),10)||0};
return {type:'', id:0};
}
async function sendChangeTo(currentOfferId){
const sel = document.getElementById('chgSel_'+currentOfferId);
if(!sel){ toast('No selection found', 'error'); return; }
const {type, id} = parseSelValue(sel.value||'');
if(!type || !id){ toast(t('select_other_placeholder'), 'error'); return; }
const current = myOffers.find(x=> x.id===currentOfferId);
const comment = ($('#chgCmt_'+currentOfferId)?.value||'').trim();

// Collect selected slots if this is a window change request
let selectedSlots = [];
if (type === 'window') {
    const slotCheckboxes = document.querySelectorAll(`#slotSelection_${currentOfferId} input[type="checkbox"]:checked`);
    selectedSlots = Array.from(slotCheckboxes).map(cb => ({
        slot_index: parseInt(cb.dataset.slotIndex),
        start_ts: cb.dataset.startTs,
        end_ts: cb.dataset.endTs
    }));
}

try{
    if(type==='offer'){
        const target = myOffers.find(x=> x.id===id); if(!target){ toast('Selected offer not found', 'error'); return; }
        const autoNote = current ? `Switch from "${current.title||('Offer #'+current.no)}" to "${target.title||('Offer #'+target.no)}"` : '';
        const finalComment = comment || autoNote;
        if(target.status==='rejected'){
            await jfetch(API+'?action=prof_request_change', {method:'POST', body: JSON.stringify({source_offer_id: currentOfferId, to_window_id: target.window_id, comment: finalComment || null, selected_slots: selectedSlots})});
        }else{
            await jfetch(API+'?action=respond_offer', {method:'POST', body: JSON.stringify({offer_id: target.id, decision: 'change', comment: finalComment || null, requested_start: target.start_ts, requested_end: target.end_ts})});
        }
    } else if (type==='window'){
        const win = (allWindows||[]).find(w=> w.id===id); if(!win){ toast('Selected window not found', 'error'); return; }
        const autoNote = current ? `Switch from "${current.title||('Offer #'+current.no)}" to window "${win.title||('#'+win.id)}"` : '';
        await jfetch(API+'?action=prof_request_change', {method:'POST', body: JSON.stringify({source_offer_id: currentOfferId, to_window_id: win.id, comment: (comment || autoNote) || null, selected_slots: selectedSlots})});
    }
    await refresh(); toast(t('change_sent_toast'));
}catch(e){ toast(e.message || 'Error', 'error'); }
}

/* --------- Slots helpers --------- */
function dedupeSlots(arr){ const seen=new Set(), out=[]; for(const s of arr){ const k=s.id ?? `${s.window_id}|${s.timeslot}`; if(seen.has(k)) continue; seen.add(k); out.push(s);} return out; }
function activeFinalizedWindowIds(){
const finals = myOffers.filter(o=>o.professor_id===ME.id && o.status==='finalized'); if(!finals.length) return new Set();
const latestByTitle = new Map();
finals.forEach(o=>{ const key=(o.title&&o.title.trim())?o.title.trim():`#${o.professor_id}`; const prev=latestByTitle.get(key); if(!prev || new Date(o.start_ts) > new Date(prev.start_ts)) latestByTitle.set(key, o); });
return new Set(Array.from(latestByTitle.values()).map(o=> o.window_id));
}
function visibleSlotsAll(){ const deduped=dedupeSlots(mySlotsRaw); const activeWins=activeFinalizedWindowIds(); return activeWins.size>0 ? deduped.filter(s=> activeWins.has(s.window_id)) : deduped; }
function mapName(id){ return peopleById.get(+id) || ('#'+id); }
function extractParticipants(slot){
if(Array.isArray(slot.participant_names)) return slot.participant_names;
if(Array.isArray(slot.participants)) return slot.participants.map(x=> typeof x==='string' && isNaN(+x) ? x : mapName(x));
if(Array.isArray(slot.professors)) return slot.professors.map(mapName);
if(Array.isArray(slot.panel)) return slot.panel.map(mapName);
if(Array.isArray(slot.member_ids)) return slot.member_ids.map(mapName);
return [];
}
function titleForWindow(id){
const o = myOffers.find(x=> String(x.window_id)===String(id));
if(o && o.title) return o.title;
const s = visibleSlotsAll().find(x=> String(x.window_id)===String(id) && x.window_title);
if(s) return s.window_title;
return `${t('window')} #${id}`;
}
function renderScheduleCards(){
const slots = visibleSlotsAll();
const grid = $('#scheduleGrid');
const nameQ = ($('#slotSearchName')?.value||'').trim().toLowerCase();
const statusFilter = ($('#slotStatusFilter')?.value||'all').toLowerCase();
const byWindow = new Map();
slots.forEach(s=>{
    const approved = (s.approved===true) || ((s.status_text||'').toLowerCase()==='approved');
    if (statusFilter==='approved' && !approved) return;
    if (statusFilter==='pending'  && approved)  return;
    const id = s.window_id ?? 'unknown';
    if(!byWindow.has(id)) byWindow.set(id, []);
    byWindow.get(id).push(s);
});
let groups = Array.from(byWindow.entries()).map(([wid, arr])=>{
    const sorted = arr.slice().sort((a,b)=> new Date(a.timeslot)-new Date(b.timeslot));
    const firstTs = sorted[0]?.timeslot || null;
    const title = titleForWindow(wid);
    return {window_id: wid, title, slots: sorted, first: firstTs};
});
if(nameQ) groups = groups.filter(g=> g.title.toLowerCase().includes(nameQ));
groups.sort((a,b)=> +new Date(a.first||0) - +new Date(b.first||0));
const MAX_BOXES = 12; // 3x4 matrix = 12 items
const sliced = groups.slice(0, MAX_BOXES);
grid.innerHTML = sliced.map(g=>{
    const opened = String(openScheduleId)===String(g.window_id);
    const meta = `${g.slots.length} ${pluralWord(g.slots.length,'slots')} · ${t('starts_on', g.first ? fmtDateMSK(g.first,{dateStyle:'medium'}) : '—')}`;
    const details = opened ? `<div class="schedule-details">
${g.slots.map(s=>{
        const people = extractParticipants(s);
        const when = fmtDateMSK(s.timeslot,{dateStyle:'medium', timeStyle:'short'});
        const approved = (s.approved===true) || ((s.status_text||'').toLowerCase()==='approved');
        const stxt = esc(approved ? t('approved') : t('pending'));
        const name = esc(s.name||'-');
        return `<div class="mini-slot">
    <div class="rowline"><div class="when">${when} (${t('msk')})</div><span class="pill small">${stxt}</span></div>
    <div class="rowline" style="margin-top:4px"><div class="people">${t('participants')}: ${people.length? esc(people.join(', ')) : '—'}</div><div class="muted">${name}</div></div>
  </div>`;
    }).join('')}
  </div>` : '';
    return `<div class="schedule-card" onclick="toggleSchedule('${g.window_id}')">
<div class="schedule-title">${esc(g.title)}</div>
<div class="schedule-meta">${meta}</div>
${details}
  </div>`;
}).join('') || `<div class="muted">${t('no_slots_yet')}</div>`;
}
function toggleSchedule(wid){ if(String(openScheduleId)===String(wid)) openScheduleId=null; else openScheduleId=wid; renderScheduleCards(); }
function toggleSlotsSection(){
slotsCollapsed = !slotsCollapsed;
const body = $('#slotsBody'); const btn = $('#btnSlotsSection');
if (slotsCollapsed){ body.style.display = 'none'; btn.textContent = t('expand'); }
else { body.style.display = ''; btn.textContent = t('collapse'); }
}

/* ---------- Notes (kept) ---------- */
async function loadNotes(){
const list = await jfetch(API+'?action=notes');
myNotesBySlot = new Map(); (list||[]).forEach(n=>{ if(!myNotesBySlot.has(n.slot_id)) myNotesBySlot.set(n.slot_id, []); myNotesBySlot.get(n.slot_id).push(n); });
}

/* ---------- Charts (kept) ---------- */
let donutCtx, barsCtx, sparkCtx; let donutSegments=[], barRects=[], sparkDaily=[];
function sizeCanvas(cnv){
const dpr = window.devicePixelRatio || 1;
const rect = cnv.getBoundingClientRect();
cnv.width = Math.floor(rect.width * dpr);
cnv.height = Math.floor(rect.height * dpr);
const ctx = cnv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return ctx;
}
function showTip(id,x,y,html){ const tip=document.getElementById(id); if(!tip) return; tip.innerHTML=html; tip.style.left=x+'px'; tip.style.top=y+'px'; tip.classList.add('show'); tip.setAttribute('aria-hidden','false');}
function hideTip(id){ const tip=document.getElementById(id); if(!tip) return; tip.classList.remove('show'); tip.setAttribute('aria-hidden','true');}
function drawDonut(finalized, pending, declined){
const c = $('#donut'); donutCtx = sizeCanvas(c); const ctx=donutCtx;
const W=c.clientWidth,H=c.clientHeight,cx=W/2,cy=H/2,R=Math.min(W,H)/2-20,r=R*0.65;
const total = finalized+pending+declined;
const parts = [
    {label:t('finalized'), value:finalized, color:'#22c55e', gradient:['#22c55e','#16a34a']},
    {label:t('pending'), value:pending, color:'#f59e0b', gradient:['#f59e0b','#d97706']},
    {label:t('declined'), value:declined, color:'#ef4444', gradient:['#ef4444','#dc2626']}
];

// Clear and draw background
ctx.clearRect(0,0,W,H);

// Background circle
ctx.lineWidth=R-r;
ctx.strokeStyle='#1f2b44';
ctx.beginPath();
ctx.arc(cx,cy,(R+r)/2,0,Math.PI*2);
ctx.stroke();

// Draw segments with gradients - only if there's data
let start=-Math.PI/2; donutSegments=[];
if(total > 0) {
    parts.forEach((p, i)=>{
        const sweep=(p.value/total)*Math.PI*2;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(cx,cy,r,cx,cy,R);
        gradient.addColorStop(0, p.gradient[0]);
        gradient.addColorStop(1, p.gradient[1]);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = R-r;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx,cy,(R+r)/2,start,start+sweep);
        ctx.stroke();
        
        donutSegments.push({start,end:start+sweep,label:p.label,value:p.value,total,color:p.color});
        start+=sweep;
    });
}

// Center text - only show if there's actual data
if(total > 0) {
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(total.toString(), cx, cy-5);
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#93a4b5';
    ctx.fillText('Total', cx, cy+10);
} else {
    // Show empty state message
    ctx.fillStyle = '#93a4b5';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No data', cx, cy);
}

// Legend
$('#donutMeta').innerHTML = `
    <span><span class="dot finalized"></span> ${t('finalized')} <strong>${finalized}</strong></span> 
    <span><span class="dot pending"></span> ${t('pending')} <strong>${pending}</strong></span> 
    <span><span class="dot declined"></span> ${t('declined')} <strong>${declined}</strong></span>
`;

// Enhanced hover interactions
c.onmousemove = (e)=>{
    const rect=c.getBoundingClientRect();
    const x=e.clientX-rect.left-W/2, y=e.clientY-rect.top-H/2;
    const ang=Math.atan2(y,x);
    const a=(ang<-Math.PI/2)?ang+Math.PI*2:ang;
    const rr=Math.hypot(x,y);
    
    if(rr<r || rr>R){
        hideTip('tip-donut');
        c.style.cursor = 'default';
        return;
    }
    
    c.style.cursor = 'pointer';
    for(const seg of donutSegments){
        if(a>=seg.start && a<=seg.end){
            const pct = Math.round(seg.value*100/Math.max(seg.total,1));
            showTip('tip-donut', e.clientX-rect.left, e.clientY-rect.top, 
                `<div style="text-align:center"><b>${seg.label}</b><br>${seg.value} slots (${pct}%)</div>`);
            return;
        }
    }
    hideTip('tip-donut');
};
c.onmouseleave = ()=> {
    hideTip('tip-donut');
    c.style.cursor = 'default';
};
}
function dowIndexMSK(d){ const name = new Intl.DateTimeFormat('en-US',{weekday:'short', timeZone:MSK_TZ}).format(new Date(d)); const map={Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6}; return map[name.slice(0,3)] ?? 0; }
function dayLabel(i){ return t(['day_mon','day_tue','day_wed','day_thu','day_fri','day_sat','day_sun'][i]||'day_mon'); }
function drawBars(byDow){
const c=$('#bars'); barsCtx=sizeCanvas(c); const ctx=barsCtx, W=c.clientWidth,H=c.clientHeight,PAD=28;
ctx.clearRect(0,0,W,H); const max=Math.max(...byDow,1); const bw=(W-PAD*2)/byDow.length-8; const base=H-PAD;
ctx.font='12px system-ui'; ctx.fillStyle='#cbd5e1'; barRects=[];
for(let i=0;i<byDow.length;i++){ const x=PAD + i*(bw+8); const h=(byDow[i]/max)*(H-PAD*2); ctx.fillStyle='#3b82f6'; ctx.fillRect(x, base-h, bw, h); ctx.fillStyle='#93a4b5'; ctx.fillText(dayLabel(i), x, base+14); barRects.push({x,y:base-h,w:bw,h,day:dayLabel(i), val:byDow[i]});}
c.onmousemove=(e)=>{ const rect=c.getBoundingClientRect(); const px=e.clientX-rect.left, py=e.clientY-rect.top; for(const b of barRects){ if(px>=b.x && px<=b.x+b.w && py>=b.y && py<=b.y+b.h){ const word=pluralWord(b.val,'slots'); showTip('tip-bars', px, py, `<b>${b.day}</b>: ${b.val} ${word}`); return; } } hideTip('tip-bars');};
c.onmouseleave=()=> hideTip('tip-bars'); const barsMeta=$('#barsMeta'); if(barsMeta) barsMeta.textContent = `${t('bars_meta')} (${t('msk')})`;
}
function fmtDateKeyMSK(d){ const f=new Intl.DateTimeFormat('en-CA',{timeZone: MSK_TZ, year:'numeric', month:'2-digit', day:'2-digit'}); return f.format(new Date(d)); }
function dailyCountsMSK(slots){
if(!slots.length) return []; const map=new Map(); let minKey=null,maxKey=null;
slots.forEach(s=>{ const key=fmtDateKeyMSK(s.timeslot); map.set(key,(map.get(key)||0)+1); if(!minKey||key<minKey) minKey=key; if(!maxKey||key>maxKey) maxKey=key; });
const out=[]; const startReal=new Date(minKey); const endReal=new Date(maxKey);
for(let d=new Date(startReal); d<=endReal; d.setDate(d.getDate()+1)){ const k=fmtDateKeyMSK(d); out.push({key:k, count: map.get(k)||0}); }
return out;
}
function drawTimelineDaily(slots){
const c=$('#spark'); sparkCtx=sizeCanvas(c); const ctx=sparkCtx, W=c.clientWidth,H=c.clientHeight, PADL=40, PADR=20, PADT=20, PADB=35;
ctx.clearRect(0,0,W,H); sparkDaily=dailyCountsMSK(slots);

if(!sparkDaily.length || sparkDaily.every(d => d.count === 0)){
    // Enhanced empty state
    ctx.fillStyle = '#93a4b5';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No scheduled slots', W/2, H/2 - 10);
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Timeline will show your defense schedule', W/2, H/2 + 10);
    $('#sparkMeta').textContent = t('no_slots_yet');
    c.onmousemove=null; c.onmouseleave=null;
    return;
}

const maxY=Math.max(...sparkDaily.map(x=>x.count),1); 
const n=sparkDaily.length; 
const stepX=(W-PADL-PADR)/Math.max(1,n-1);

// Draw grid lines
ctx.strokeStyle='#1f2937'; ctx.lineWidth=1;
// Horizontal grid lines
for(let i=0; i<=4; i++){
    const y = PADT + (H-PADT-PADB) * (i/4);
    ctx.beginPath(); ctx.moveTo(PADL, y); ctx.lineTo(W-PADR, y); ctx.stroke();
}
// Vertical axis
ctx.beginPath(); ctx.moveTo(PADL, PADT); ctx.lineTo(PADL, H-PADB); ctx.stroke();

// Draw timeline line with gradient
ctx.beginPath(); 
sparkDaily.forEach((d,i)=>{
    const x=PADL+i*stepX; 
    const y=H-PADB - (d.count/maxY)*(H-PADT-PADB);
    if(i===0) ctx.moveTo(x,y); 
    else ctx.lineTo(x,y);
}); 

// Create gradient for the line
const lineGradient = ctx.createLinearGradient(0, PADT, 0, H-PADB);
lineGradient.addColorStop(0, '#60a5fa');
lineGradient.addColorStop(1, '#3b82f6');

ctx.strokeStyle = lineGradient;
ctx.lineWidth=3; 
ctx.lineCap = 'round';
ctx.stroke();

// Fill area under the line
const g=ctx.createLinearGradient(0,PADT,0,H-PADB); 
g.addColorStop(0,'#60a5fa30'); 
g.addColorStop(1,'#60a5fa05'); 
ctx.lineTo(W-PADR, H-PADB); 
ctx.lineTo(PADL, H-PADB); 
ctx.closePath(); 
ctx.fillStyle=g; 
ctx.fill();

// Draw data points with enhanced styling
sparkDaily.forEach((d,i)=>{
    const x=PADL+i*stepX; 
    const y=H-PADB - (d.count/maxY)*(H-PADT-PADB);
    
    if(d.count > 0) {
        // Glow effect
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='#60a5fa'; ctx.fill();
        ctx.shadowBlur = 0;
        
        // Center dot
        ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle='#ffffff'; ctx.fill();
    }
});

// Enhanced date labels
ctx.fillStyle='#93a4b5'; ctx.font='11px system-ui'; 

// Show first, middle, and last dates
ctx.textAlign='left'; ctx.fillText(sparkDaily[0].key, PADL, H-8);
if(n>2) {
    ctx.textAlign='center'; 
    ctx.fillText(sparkDaily[Math.floor(n/2)].key, PADL + Math.floor(n/2)*stepX, H-8);
}
ctx.textAlign='right'; ctx.fillText(sparkDaily[n-1].key, W-PADR, H-8); 
ctx.textAlign='left';

// Y-axis labels
ctx.fillStyle='#64748b'; ctx.font='10px system-ui';
for(let i=0; i<=4; i++){
    const y = PADT + (H-PADT-PADB) * (i/4);
    const value = Math.round(maxY * (4-i)/4);
    ctx.textAlign='right';
    ctx.fillText(value.toString(), PADL-8, y+3);
}

$('#sparkMeta').textContent = `${t('spark_meta')} (${t('msk')})`;

// Enhanced hover interactions
c.onmousemove=(e)=>{
    const rect=c.getBoundingClientRect(); 
    const px=e.clientX-rect.left;
    const i=Math.min(n-1, Math.max(0, Math.round((px-PADL)/stepX))); 
    const d=sparkDaily[i]; 
    const x=PADL+i*stepX; 
    const y=H-PADB - (d.count/maxY)*(H-PADT-PADB);
    const word=pluralWord(d.count,'slots');
    
    if(d.count > 0) {
        showTip('tip-spark', x, y-10, `<div style="text-align:center"><b>${d.key}</b><br>${d.count} ${word}</div>`);
    }
};
c.onmouseleave=()=> hideTip('tip-spark');
}

function drawStatusBars(){
const c = $('#statusBars');
if (!c) return;

const ctx = sizeCanvas(c);
const W = c.clientWidth, H = c.clientHeight, PAD = 30;

// Calculate data
const votedPolls = polls.filter(p => p.has_voted).length;
const notVotedPolls = polls.length - votedPolls;

const acceptedOffers = myOffers.filter(o => o.status === 'accepted' || o.status === 'finalized').length;
const rejectedOffers = myOffers.filter(o => o.status === 'rejected').length;
const pendingOffers = myOffers.filter(o => o.status === 'offered').length;
const changeRequestedOffers = myOffers.filter(o => o.status === 'change_requested').length;

// Define categories and colors with gradients
const categories = [
    { label: 'Polls Voted', value: votedPolls, color: '#22c55e', gradient: ['#22c55e', '#16a34a'] },
    { label: 'Polls Not Voted', value: notVotedPolls, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { label: 'Change Requested', value: changeRequestedOffers, color: '#06b6d4', gradient: ['#06b6d4', '#0891b2'] }
];

// Clear canvas
ctx.clearRect(0, 0, W, H);

const maxValue = Math.max(...categories.map(cat => cat.value), 1);
const barWidth = 35; // Width of each vertical bar
const barSpacing = 20; // Space between bars
const labelHeight = 50; // Increased height for angled labels
const valueHeight = 20; // Height for values
const availableHeight = H - PAD * 2 - labelHeight - valueHeight - 20;

const totalBarWidth = categories.length * (barWidth + barSpacing) - barSpacing;
const startX = (W - totalBarWidth) / 2;

// Draw background grid
ctx.strokeStyle = '#1f2937';
ctx.lineWidth = 1;
ctx.setLineDash([2, 2]);
for (let i = 1; i <= 4; i++) {
    const y = PAD + labelHeight + (availableHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(startX - 10, y);
    ctx.lineTo(startX + totalBarWidth + 10, y);
    ctx.stroke();
}
ctx.setLineDash([]);

// Draw vertical bars with enhanced styling
categories.forEach((cat, index) => {
    const x = startX + index * (barWidth + barSpacing);
    const barHeight = (cat.value / maxValue) * availableHeight;
    const y = PAD + labelHeight + availableHeight - barHeight;
    
    // Create gradient for bar
    const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
    gradient.addColorStop(0, cat.gradient[0]);
    gradient.addColorStop(1, cat.gradient[1]);
    
    // Draw bar with rounded corners effect
    ctx.fillStyle = gradient;
    ctx.shadowColor = cat.color;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 0;
    
    // Rounded rectangle effect
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + barHeight - radius);
    ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
    ctx.lineTo(x + radius, y + barHeight);
    ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw label below bar at an angle
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 7px system-ui';
    ctx.textAlign = 'center';
    
    // Save context, rotate, draw text, restore context
    ctx.save();
    ctx.translate(x + barWidth / 2, PAD + labelHeight + availableHeight + 20);
    ctx.rotate(-Math.PI / 6); // -30 degrees
    ctx.fillText(cat.label, 0, 0);
    ctx.restore();
    
    // Draw value on top of bar
    if (cat.value > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(cat.value.toString(), x + barWidth / 2, y - 8);
        
        // Draw percentage inside bar
        const percentage = Math.round((cat.value / maxValue) * 100);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '10px system-ui';
        ctx.fillText(`${percentage}%`, x + barWidth / 2, y + barHeight / 2 + 3);
    }
});

// Update meta text with enhanced styling
const meta = $('#statusBarsMeta');
if (meta) {
    const totalPolls = polls.length;
    const totalOffers = myOffers.length;
    const votedPercentage = totalPolls > 0 ? Math.round((votedPolls / totalPolls) * 100) : 0;
    meta.textContent = `${totalPolls} polls (${votedPercentage}% voted) • ${totalOffers} offers`;
}
}
function updateCharts(){
const vSlots = visibleSlotsAll();
const approved = vSlots.filter(s=> (s.approved===true) || (s.status_text||'').toLowerCase()==='approved').length;
const pending  = vSlots.length - approved;
const declined = myOffers.filter(o=>o.status==='rejected').length;
drawDonut(approved, pending, declined);
const dow=[0,0,0,0,0,0,0]; vSlots.forEach(s=> dow[dowIndexMSK(s.timeslot)]++); drawBars(dow);
drawTimelineDaily(vSlots);
drawStatusBars();
}
window.addEventListener('resize', updateCharts);

/* ---------- Live (kept minimal) ---------- */
const Notifier = (()=>{
let permissionAsked=false;
function ask(){ if(permissionAsked) return; permissionAsked=true; if('Notification' in window && Notification.permission==='default'){ try{ Notification.requestPermission().catch(()=>{});}catch(_){}} }
function browserNotify(title, body){ if(!('Notification' in window)) return; if(Notification.permission==='granted'){ new Notification(title,{body}); } }
function toastAndNotify(title, body, type='ok'){ toast(`${title}: ${body}`, type==='error'?'error':'ok'); browserNotify(title, body); }
return { ask, toastAndNotify };
})();

/* --- People & Windows helpers used elsewhere --- */
async function loadPeople(){ try{ const users = await jfetch(API+'?action=list_users'); (users||[]).forEach(u=> peopleById.set(+u.id, u.fullname||('#'+u.id)) ); }catch(_){ } }
async function loadAvailableWindows(){ try{ const rows = await jfetch(API+'?action=available_windows'); allWindows = Array.isArray(rows) ? rows : []; }catch(_){ allWindows=[]; } }

/* ---------- Polls: load, render, submit ---------- */
async function loadPolls(){
try{
    const res = await jfetch(API+'?action=polls'); // manager/assistant/professor allowed
    polls = Array.isArray(res) ? res : [];
    renderPolls();
}catch(e){
    polls = [];
    $('#pollsList').innerHTML = `<div class="muted">${esc(e.message||'Failed to load polls')}</div>`;
}
}

function togglePollsSection(){
pollsCollapsed = !pollsCollapsed;
const body = $('#pollsBody'); const btn = $('#btnPollsSection');
if (pollsCollapsed){ body.style.display = 'none'; btn.textContent = t('expand'); }
else { body.style.display = ''; btn.textContent = t('collapse'); }
}

function pollTypeLabel(p){ return p.allow_multi ? t('poll_type_multiple') : t('poll_type_single'); }
function pollModeLabel(p){ return p.mode==='timeslots' ? t('poll_mode_timeslots') : t('poll_mode_text'); }

function optionRowHTML(p, o){
const name = `poll_${p.id}_opt`;
const id = `p${p.id}_o${o.id}`;
const locked = !!p.has_voted; // read-only when already voted
const mine = Array.isArray(p.my_option_ids) ? new Set(p.my_option_ids) : null;
const isChecked = mine ? mine.has(o.id) : false;

const baseInput = p.allow_multi
    ? `<input type="checkbox" name="${name}" id="${id}" value="${o.id}">`
    : `<input type="radio" name="${name}" id="${id}" value="${o.id}">`;

const attrs = [
    isChecked ? 'checked' : '',
    locked ? 'disabled' : '',
    'aria-disabled="'+(locked?'true':'false')+'"'
].filter(Boolean).join(' ');

const inputFinal = baseInput.replace('>', ' '+attrs+'>');
const labelHtml = `<label for="${id}" class="option-label">${esc(o.label)}</label>`;

// When locked, remove pointer cue by dropping cursor on the container
const lineCls = 'option-line' + (locked ? '" style="cursor:not-allowed; opacity:.9' : '');

return `<div class="${lineCls}">
      <div class="option-main">${inputFinal}${labelHtml}</div>
      <span class="count-badge" title="${t('poll_total_votes')}">${o.votes||0}</span>
    </div>`;
}

/* --- NEW: mark button as voted --- */
function markPollVoted(pollId){
const btn = document.getElementById(`btnPollVote_${pollId}`);
if(!btn) return;
btn.textContent = t('poll_voted_btn');      // Change button text
btn.setAttribute('data-i18n','poll_voted_btn');
btn.classList.remove('primary', 'success'); // Remove other styles
btn.classList.add('gray');                  // Add gray style
btn.disabled = true;                       // Disable button
}
/* --- NEW: when options change, switch back to Update vote --- */
function onPollChanged(pollId){
const btn = document.getElementById(`btnPollVote_${pollId}`);
if(!btn) return;
btn.textContent = t('poll_update_vote');
btn.setAttribute('data-i18n','poll_update_vote');
btn.classList.remove('success');
btn.classList.add('primary');
}
function togglePoll(pollId){
const content = document.getElementById(`pollContent_${pollId}`);
const toggle = document.getElementById(`pollToggle_${pollId}`);
if(!content || !toggle) return;

const isExpanded = content.classList.contains('expanded');
if(isExpanded) {
    content.classList.remove('expanded');
    toggle.classList.remove('expanded');
} else {
    content.classList.add('expanded');
    toggle.classList.add('expanded');
}
}

function wirePollInputs(pollId){
const card = document.getElementById(`poll_${pollId}`);
if(!card) return;
const locked = !!(polls.find(pp => pp.id === pollId)?.has_voted);
if (locked) return; // read-only: do not wire change handlers

const wrap = card.querySelector('.options');
if(!wrap) return;
wrap.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(inp=>{
    inp.addEventListener('change', ()=> onPollChanged(pollId));
    const line = inp.closest('.option-line');
    if(line){
        line.addEventListener('click', (e)=>{
            if(e.target.tagName.toLowerCase()!=='input') { inp.click(); }
        });
    }
});
}
function attachPollHandlers(){
polls.forEach(p=> {
    wirePollInputs(p.id);
    // Ensure polls start collapsed by default
    const content = document.getElementById(`pollContent_${p.id}`);
    const toggle = document.getElementById(`pollToggle_${p.id}`);
    if(content && toggle) {
        content.classList.remove('expanded');
        toggle.classList.remove('expanded');
    }
});
}

function renderPolls(){
const list = $('#pollsList');
const q = ($('#pollSearch')?.value||'').trim().toLowerCase();

let filtered = polls.slice();
if(q) filtered = filtered.filter(p =>
    (p.title||'').toLowerCase().includes(q) ||
    (p.description||'').toLowerCase().includes(q) ||
    (p.author||'').toLowerCase().includes(q)
);

if(!filtered.length){
    list.innerHTML = `<div class="muted">${t('no_polls_yet')}</div>`;
    return;
}

list.innerHTML = filtered.map(p=>{
    const created = p.created_at ? fmtDateMSK(p.created_at,{dateStyle:'medium', timeStyle:'short'}) : '';
    const optionsHtml = (p.options||[]).map(o=> optionRowHTML(p, o)).join('');
    const voters = typeof p.voters==='number' ? p.voters : 0;
    const tz = p.mode==='timeslots' ? `<span class="chip">${t('poll_timezone')}: ${t('msk')}</span>` : '';
    
    // Add scroll hint for polls with many options
    const optionsCount = (p.options||[]).length;
    const scrollHint = optionsCount > 8 ? `<span class="chip scroll-hint" title="Scroll to see all ${optionsCount} options">📜 ${optionsCount} options</span>` : '';

    const locked = !!p.has_voted;
    const btnLabel = locked ? t('poll_voted_btn') : (myVotes.has(p.id) ? t('poll_update_vote') : t('poll_vote'));
    const btnClass = locked ? 'btn gray' : 'btn primary';
    const btnAttrs = locked ? 'disabled aria-disabled="true"' : '';
    
    // Add voting status indicator
    const voteStatus = locked ? 'voted' : 'not-voted';
    const voteStatusClass = `poll-card-${voteStatus}`;
    const voteStatusChip = locked ? 
        `<span class="chip vote-status-chip voted">✓ Voted</span>` : 
        `<span class="chip vote-status-chip not-voted">○ Not Voted</span>`;

    return `<div class="poll-card ${voteStatusClass}" id="poll_${p.id}">
<div class="poll-header" onclick="togglePoll(${p.id})">
  <div>
    <h4 class="poll-title" id="poll_${p.id}_title">${esc(p.title)}</h4>
    ${p.description ? `<div class="poll-desc">${esc(p.description)}</div>` : ''}
    <div class="poll-meta">
      ${voteStatusChip}
      <span class="chip">${pollTypeLabel(p)}</span>
      <span class="chip">${pollModeLabel(p)}</span>
      ${tz}
      ${p.author ? `<span class="chip">${t('poll_created_by')}: ${esc(p.author)}</span>`:''}
      ${p.created_at ? `<span class="chip">${t('poll_created_at')}: ${esc(created)}</span>`:''}
      <span class="chip">${t('poll_total_votes')}: ${voters} ${t('poll_participants')}</span>
      ${scrollHint}
    </div>
  </div>
  <button class="poll-toggle" id="pollToggle_${p.id}" onclick="event.stopPropagation(); togglePoll(${p.id})">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  </button>
</div>
<div class="poll-content" id="pollContent_${p.id}">
  <div class="options-header">
    <span class="options-count">${optionsCount} option${optionsCount !== 1 ? 's' : ''}</span>
    ${optionsCount > 8 ? '<span class="scroll-indicator">↕ Scroll to see all</span>' : ''}
  </div>
  <div class="options" role="group" aria-labelledby="poll_${p.id}_title">
    ${optionsHtml}
  </div>
  <div class="poll-actions">
    <button
id="btnPollVote_${p.id}"
class="${btnClass} btn-vote"
${btnAttrs}
data-poll-id="${p.id}"
data-i18n="${locked ? 'poll_voted_btn' : (myVotes.has(p.id)?'poll_update_vote':'poll_vote')}"
onclick="${locked ? '' : `submitPollVote(${p.id}, ${p.allow_multi ? 'true':'false'})`}">
${esc(btnLabel)}
  </button>
  </div>
</div>
  </div>`;
}).join('');

attachPollHandlers();
}

async function submitPollVote(pollId, allowMulti){
const name = `poll_${pollId}_opt`;
const picked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(i=> parseInt(i.value,10)).filter(Boolean);
if(!picked.length){ toast(t('poll_select_options'),'error'); return; }
if(!allowMulti && picked.length>1){ toast(t('poll_single_selection'),'error'); return; }

try{
    await jfetch(API+'?action=vote_poll', {method:'POST', body: JSON.stringify({poll_id: pollId, option_ids: picked})});
    // Remember locally and refresh counts
    myVotes.set(pollId, new Set(picked));
    await loadPolls();          // refresh tallies
    markPollVoted(pollId);      // <--- ensure the button reads "Voted" even after Update vote
    toast(t('poll_vote_updated'));
}catch(e){ toast(e.message || 'Error', 'error'); }
}

/* ---------- Live stubs for events (offers only) ---------- */
const LiveBus = (()=>{
let pollTimer=null, lastTs=0;
function handle(evt){
    lastTs = Math.max(lastTs, evt.ts || Date.now());
    const type = evt.type||'';
    if(type==='offer_finalized'){ Notifier.toastAndNotify(t('notif_schedule_finalized_title'), t('notif_schedule_finalized_body')); refresh(); }
    if(type==='offer_update' || type==='offer_response'){ refreshOffersOnly(); }
}
function start(){
    try{
        const es = new EventSource(API+'?action=events&token='+encodeURIComponent(token));
        es.onmessage = (e)=>{ try{ handle(JSON.parse(e.data||'{}')); }catch(_){ } };
        es.onerror = ()=>{ try{ es.close(); }catch(_){} startPoll(); };
    }catch(_){ startPoll(); }
}
function startPoll(){
    stopPoll();
    pollTimer = setInterval(async ()=>{
        try{
            const res = await jfetch(API+`?action=events_poll&since=${lastTs}`);
            (res.events||[]).forEach(handle);
        }catch(_){}
    }, 6000);
}
function stopPoll(){ if(pollTimer){ clearInterval(pollTimer); pollTimer=null; } }
return { start };
})();

const Reminders = (()=>{
const scheduled = new Set();
function key(slotId, m){ return `${slotId}@${m}`; }
function scheduleAt(msFromNow, fn, k){ if(msFromNow<=0) return; if(scheduled.has(k)) return; scheduled.add(k); const delay=Math.min(msFromNow, 2147483647); setTimeout(()=>{ try{ fn(); } finally{ scheduled.delete(k); } }, delay); }
function scheduleForSlots(slots){
    const now = Date.now();
    slots.forEach(s=>{
        const tms = +new Date(s.timeslot||0); if(!tms || tms<now) return;
        const k24 = key(s.id, 1440), k60 = key(s.id, 60);
        scheduleAt(tms - now - 24*60*60*1000, ()=> Notifier.toastAndNotify(t('reminder24'), t('reminder24_body', fmtDateMSK(tms,{dateStyle:'medium', timeStyle:'short'}))), k24);
        scheduleAt(tms - now - 60*60*1000,  ()=> Notifier.toastAndNotify(t('reminder60'), t('reminder60_body', fmtDateMSK(tms,{timeStyle:'short'}))), k60);
    });
}
return { scheduleForSlots };
})();

/* ---------- Refresh helpers ---------- */
let prevOffersById = new Map();
async function refreshOffersOnly(){
const offers = await jfetch(API+'?action=my_offers');
myOffers = offers.filter(o=>o.professor_id === ME.id);
myOffers.forEach(o=>{
    const old = prevOffersById.get(o.id);
    if(old && old.status!==o.status){
        if(o.status==='accepted') Notifier.toastAndNotify(t('notif_offer_accepted_title'), t('notif_offer_accepted_body'));
        if(o.status==='change_requested') Notifier.toastAndNotify(t('notif_change_requested_title'), t('notif_change_requested_body'));
        if(o.status==='finalized') Notifier.toastAndNotify(t('notif_finalized_title'), t('notif_finalized_body'));
    }
    prevOffersById.set(o.id, {...o});
});
updateOfferFilterBar(); renderOffers(); await refreshSlotsOnly();
}
async function refreshSlotsOnly(){
const slots = await jfetch(API+'?action=slots');
mySlotsRaw = Array.isArray(slots) ? slots : [];
renderScheduleCards(); updateCharts();
const visibleApproved = visibleSlotsAll().filter(s=> (s.approved===true) || (s.status_text||'').toLowerCase()==='approved');
Reminders.scheduleForSlots(visibleApproved);
}
async function refresh(){
const [offers, slots] = await Promise.all([ jfetch(API+'?action=my_offers'), jfetch(API+'?action=slots') ]);
myOffers  = offers.filter(o=>o.professor_id === ME.id);
mySlotsRaw = Array.isArray(slots) ? slots : [];
await loadNotes();
myOffers.forEach(o=>{ if(!prevOffersById.has(o.id)) prevOffersById.set(o.id, {...o}); });
updateOfferFilterBar(); renderOffers(); renderScheduleCards(); updateCharts();
const visibleApproved = visibleSlotsAll().filter(s=> (s.approved===true) || (s.status_text||'').toLowerCase()==='approved');
Reminders.scheduleForSlots(visibleApproved);
}

/* ---------- Init ---------- */
(async function init(){
try{
    applyI18n();
    $('#welcome').classList.add('show');
    await whoami();
    await Promise.all([loadPeople(), loadAvailableWindows(), refresh(), loadPolls()]);
    setTimeout(()=>{$('#welcome').classList.remove('show')}, 900);
    $('#slotSearchName')?.addEventListener('input', renderScheduleCards);
    $('#slotStatusFilter')?.addEventListener('change', renderScheduleCards);
    $('#pollSearch')?.addEventListener('input', renderPolls);
    Notifier.ask();
    LiveBus.start();
}catch(e){

    alertDialog('Error loading page:<br><code>'+esc(e.message||String(e))+'</code>');
}
})();
