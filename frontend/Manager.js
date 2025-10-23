    // Safari compatibility fix - comprehensive ReadableStream handling
    (function() {
        // Detect Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
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
                
                // Safari compatibility: handle response body reading properly
                return originalFetch(input, init).then(response => {
                    // Cache the response body to prevent ReadableStream issues
                    let bodyText = null;
                    let bodyJson = null;
                    let bodyRead = false;
                    
                    // Override text() method to cache the response
                    const originalText = response.text;
                    response.text = function() {
                        if (bodyText !== null) {
                            return Promise.resolve(bodyText);
                        }
                        if (bodyRead) {
                            throw new Error('Response body already read');
                        }
                        bodyRead = true;
                        return originalText.call(this).then(text => {
                            bodyText = text;
                            return text;
                        }).catch(error => {
                            // Safari-specific error handling
                            if (isSafari && error.name === 'TypeError') {

                                return Promise.resolve('{}');
                            }
                            throw error;
                        });
                    };
                    
                    // Override json() method to use cached text
                    const originalJson = response.json;
                    response.json = function() {
                        if (bodyJson !== null) {
                            return Promise.resolve(bodyJson);
                        }
                        if (bodyText !== null) {
                            try {
                                bodyJson = JSON.parse(bodyText);
                                return Promise.resolve(bodyJson);
                            } catch (e) {
                                throw new Error('Failed to parse JSON: ' + e.message);
                            }
                        }
                        if (bodyRead) {
                            throw new Error('Response body already read');
                        }
                        bodyRead = true;
                        return originalJson.call(this).then(json => {
                            bodyJson = json;
                            return json;
                        }).catch(error => {
                            // Fallback for Safari issues - use text() instead
                            if (error.name === 'TypeError') {
                                return this.text().then(text => {
                                    try {
                                        bodyJson = JSON.parse(text);
                                        return bodyJson;
                                    } catch (e) {
                                        throw new Error('Failed to parse JSON: ' + e.message);
                                    }
                                });
                            }
                            throw error;
                        });
                    };
                    
                    return response;
                });
            };
        }
    })();

    const API = '/backend/index.php';
    function getToken(){ return (window.getAuthToken ? window.getAuthToken() : (localStorage.getItem('auth_token') || '')); }
    

    const $=s=>document.querySelector(s)
    const DICT={en:{BTN_BACK:"← Back to login",CREATE_POLL:"Create Poll",POLL_TYPE_SINGLE:"Single choice",
            POLL_TITLE:"Title",
            PH_POLL_TITLE:"Type your question here",
            POLL_DESC:"Description",
            POLL_TYPE:"Poll type",
            POLL_TYPE_MULT:"Multiple choice",
            ANSWER_OPTIONS:"Answer Options",
            BTN_ADD_OPTION:"Add option",
            ALLOW_MULTI:"Allow selection of multiple options",
            REQUIRE_NAMES:"Require participant names",
            VOTING_SECURITY:"Voting security",
            ONE_VOTE_USER:"One vote per user",
            BTN_CREATE_POLL:"Create poll",
            POLL_RESULTS:"Poll results",
            PH_SEARCH_POLLS:"Search polls…",
            NO_POLLS:"No polls yet",
            TOTAL_VOTES:"Total votes",
            EXPAND_HINT:"Click to expand",
            BTN_DELETE_POLL:"Delete",INSIGHTS_TITLE:"Insights",KPI_USERS:"Total Users",KPI_PROFS:"Professors",KPI_WINS:"Windows",KPI_OFFERS:"Offers",OFFER_STATUS:"Offer Status",PROFS_PER_OFFER:"Professors per Offer",PROF_OVERVIEW:"Professor Overview",CLICK_TO_FOCUS:"Click a name to focus.",CREATE_WINDOW:"Create Window",LBL_START:"Start date & time",LBL_END:"End date & time",LBL_SET_MANUAL:"Set manually",LBL_DEF_MIN:"Defense minutes",LBL_BUF_MIN:"Buffer minutes",LBL_NUM_DEF:"Number of defenses",LBL_INSERT_BREAKS:"Insert breaks",LBL_BREAKS_COUNT:"How many breaks",LBL_BREAK_MIN:"Break minutes",LBL_TITLE:"Title",LBL_PREVIEW:"Preview",BTN_CREATE_WINDOW:"Create window",WINDOWS:"Windows",ALL_OFFERS_SCROLL:"All Offers (scroll)",EDIT_WINDOW:"Edit Window",BTN_UPDATE_WINDOW:"Update window",BTN_CANCEL:"Cancel",OFFER_WINDOW_TO_PROF:"Offer Window to Professor",LBL_WINDOW:"Window",LBL_PROFS:"Professor(s)",PLACEHOLDER_PROF_SEARCH:"Search by name or ID…",BTN_SELECT_ALL:"Select all",BTN_CLEAR:"Clear",LBL_COMMENT:"Comment",PLACEHOLDER_COMMENT:"Notes to professor",BTN_SEND_OFFER:"Send offer",OFFERS:"Offers",FILTER_ALL:"All",FILTER_ACCEPTED:"Accepted",FILTER_PENDING:"Pending",FILTER_REQUEST_CHANGE:"Request Change",FILTER_REJECTED:"Rejected",USERS:"Users",BTN_SHOW_ALL:"Show all",BTN_SHOW_FIRST10:"Show first 10",BTN_COLLAPSE:"Collapse",BTN_EXPAND:"Expand",LBL_SEARCH_USERS:"Search users",PLACEHOLDER_SEARCH_USERS:"Search by name or ID…",LBL_NEW_USER_NAME:"Name of the user",PLACEHOLDER_FULL_NAME:"Full name",LBL_SELECT_ROLE:"Select role",BTN_CREATE_USER:"Create",TH_NO:"No.",TH_TITLE:"Title",TH_START:"Start",TH_END:"End",TH_DURATION:"Duration (defense+buffer)",TH_ACTIONS:"Actions",TH_WINDOW:"Window",TH_OFFERS:"Offers",TH_NAME:"Name",TH_ROLE:"Role",TH_ACTIVE:"Active",BTN_EDIT:"Edit",BTN_DELETE:"Delete",NO_USERS:"No users",PROTECTED:"Protected",SUSPEND:"Suspend",ACTIVATE:"Activate",EDIT_PROFESSORS:"Edit",SAVE_CHANGES:"Save changes",SAVE_RESEND:"Save & Resend",RESET:"Reset",FINALIZE:"Finalize",APPROVE_CHANGE:"Approve change",AT_LEAST_ONE:"At least one must remain",COMMENT_APPLIES_NEW:"Comment (applies to newly added offers)",TOTAL_OFFERS:"Total offers",NO_OFFERS_YET:"No offers yet",NO_OFFERS_TO_CHART:"No offers to chart",PH_WIN_TITLE:"e.g., Window 12–16",PH_WIN_EDIT_TITLE:"Window title",PH_SEARCH_WINDOWS:"Search by No. or Title…",NOTICE:"Notice",OK:"OK",CONFIRM:"Please confirm",YES:"Yes",NO:"No",DELETE_USER_Q:"Delete this user? This cannot be undone.",DELETE_WINDOW_Q:"Delete this window (with its offers & slots)?",DELETE_OFFER_Q:"Delete this offer?",PLACEHOLDER_SEARCH_OFFERS:"Search by window, professor, comment…",PLACEHOLDER_SEARCH_ALL_OFFERS:"Search by window or professor…"},ru:{BTN_BACK:"← Назад к входу",CREATE_POLL:"Создать опрос",
            POLL_TITLE:"Заголовок",
            PH_POLL_TITLE:"Введите вопрос",
            POLL_DESC:"Описание",
            POLL_TYPE:"Тип опроса",POLL_TYPE_SINGLE:"Один выбор",
            POLL_TYPE_MULT:"Множественный выбор",
            ANSWER_OPTIONS:"Варианты ответа",
            BTN_ADD_OPTION:"Добавить вариант",
            ALLOW_MULTI:"Разрешить множественный выбор",
            REQUIRE_NAMES:"Требовать имена участников",
            VOTING_SECURITY:"Безопасность голосования",
            ONE_VOTE_USER:"Один голос на пользователя",
            BTN_CREATE_POLL:"Создать опрос",
            POLL_RESULTS:"Результаты опросов",
            PH_SEARCH_POLLS:"Поиск опросов…",
            NO_POLLS:"Пока нет опросов",
            TOTAL_VOTES:"Всего голосов",
            EXPAND_HINT:"Нажмите, чтобы развернуть",
            BTN_DELETE_POLL:"Удалить",INSIGHTS_TITLE:"Аналитика",KPI_USERS:"Всего пользователей",KPI_PROFS:"Профессора",KPI_WINS:"Окна",KPI_OFFERS:"Предложения",OFFER_STATUS:"Статусы предложений",PROFS_PER_OFFER:"Профессоров на предложение",PROF_OVERVIEW:"Обзор профессора",CLICK_TO_FOCUS:"Нажмите имя, чтобы сфокусироваться.",CREATE_WINDOW:"Создать окно",LBL_START:"Дата и время начала",LBL_END:"Дата и время окончания",LBL_SET_MANUAL:"Задать вручную",LBL_DEF_MIN:"Минут на защиту",LBL_BUF_MIN:"Минут буфера",LBL_NUM_DEF:"Количество защит",LBL_INSERT_BREAKS:"Добавить перерывы",LBL_BREAKS_COUNT:"Сколько перерывов",LBL_BREAK_MIN:"Минут в перерыве",LBL_TITLE:"Название",LBL_PREVIEW:"Предпросмотр",BTN_CREATE_WINDOW:"Создать окно",WINDOWS:"Окна",ALL_OFFERS_SCROLL:"Все предложения (прокрутка)",EDIT_WINDOW:"Редактировать окно",BTN_UPDATE_WINDOW:"Обновить окно",BTN_CANCEL:"Отмена",OFFER_WINDOW_TO_PROF:"Предложить окно профессору",LBL_WINDOW:"Окно",LBL_PROFS:"Профессора",PLACEHOLDER_PROF_SEARCH:"Поиск по имени или ID…",BTN_SELECT_ALL:"Выбрать все",BTN_CLEAR:"Сбросить",LBL_COMMENT:"Комментарий",PLACEHOLDER_COMMENT:"Заметки для профессора",BTN_SEND_OFFER:"Отправить предложение",OFFERS:"Предложения",FILTER_ALL:"Все",FILTER_ACCEPTED:"Принято",FILTER_PENDING:"В ожидании",FILTER_REQUEST_CHANGE:"Запрос изменений",FILTER_REJECTED:"Отклонено",USERS:"Пользователи",BTN_SHOW_ALL:"Показать все",BTN_SHOW_FIRST10:"Показать первые 10",BTN_COLLAPSE:"Свернуть",BTN_EXPAND:"Развернуть",LBL_SEARCH_USERS:"Поиск пользователей",PLACEHOLDER_SEARCH_USERS:"Поиск по имени или ID…",LBL_NEW_USER_NAME:"Имя пользователя",PLACEHOLDER_FULL_NAME:"Полное имя",LBL_SELECT_ROLE:"Выберите роль",BTN_CREATE_USER:"Создать",TH_NO:"№",TH_TITLE:"Название",TH_START:"Начало",TH_END:"Окончание",TH_DURATION:"Длительность (защита+пауза)",TH_ACTIONS:"Действия",TH_WINDOW:"Окно",TH_OFFERS:"Предложения",TH_NAME:"Имя",TH_ROLE:"Роль",TH_ACTIVE:"Активен",BTN_EDIT:"Редактировать",BTN_DELETE:"Удалить",NO_USERS:"Нет пользователей",PROTECTED:"Защищено",SUSPEND:"Заблокировать",ACTIVATE:"Активировать",EDIT_PROFESSORS:"Редактировать список профессоров",SAVE_CHANGES:"Сохранить",SAVE_RESEND:"Сохранить и отправить",RESET:"Сброс",FINALIZE:"Финализировать",APPROVE_CHANGE:"Одобрить изменение",AT_LEAST_ONE:"Должен остаться хотя бы один",COMMENT_APPLIES_NEW:"Комментарий (применится к новым предложениям)",TOTAL_OFFERS:"Всего предложений",NO_OFFERS_YЕТ:"Пока нет предложений",NO_OFFERS_TO_CHART:"Недостаточно данных",PH_WIN_TITLE:"например, Окно 12–16",PH_WIN_EDIT_TITLE:"Название окна",PH_SEARCH_WINDOWS:"Поиск по № или названию…",NOTICE:"Уведомление",OK:"ОК",CONFIRM:"Подтвердите действие",YES:"Да",NO:"Нет",DELETE_USER_Q:"Удалить этого пользователя? Это действие необратимо.",DELETE_WINDOW_Q:"Удалить это окно (вместе с предложениями и слотами)?",DELETE_OFFER_Q:"Удалить это предложение?",PLACEHOLDER_SEARCH_OFFERS:"Поиск по окну, профессору, комментарию…",PLACEHOLDER_SEARCH_ALL_OFFERS:"Поиск по окну или профессору…"}}
    let LANG=localStorage.getItem('lang')||'en'
    function t(key){const dict=DICT[LANG]||DICT.en;return dict[key]||DICT.en[key]||key}
    function applyI18n(){
        document.documentElement.lang=LANG;
        document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.setAttribute('placeholder',t(el.dataset.i18nPlaceholder))});
        updateLangButtons();renderUsersTable();renderWindows();renderWindowsOffersScroll();renderOffers();renderProfessorChecks();renderCharts();renderPolls();renderNonVotingProfessors();
        $('#title').textContent=(LANG==='ru'?'Консоль менеджера':'Manager Console');
        $('#wSmall').textContent=(LANG==='ru'?'Добро пожаловать':'Welcome');
        $('#wBig').textContent=(LANG==='ru'?'Добро пожаловать в панель планирования, Менеджер':'Welcome to the Scheduler Dashboard, Manager');
        $('#wSub').innerHTML=(LANG==='ru'?'Загружаем данные':'Loading resources')+'<span class="pulse-dot"></span>';
        $('#chartSub').textContent=(LANG==='ru'?'Все профессоры по числу окон':'All professors by window count')
    }
    function setLang(lang){LANG=(lang==='ru')?'ru':'en';localStorage.setItem('lang',LANG);applyI18n()}
    function updateLangButtons(){$('#btnLangEn')?.classList.toggle('active',LANG==='en');$('#btnLangRu')?.classList.toggle('active',LANG==='ru')}
    const jfetch = async (url, opt = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(getToken() ? { 'Authorization': 'Bearer ' + getToken() } : {}),
            ...(opt.headers || {})
        };
        
        try {
            const r = await fetch(url, { ...opt, headers });
            
            if (!r.ok) {
                // Safari compatibility: read response body safely
                let txt;
                try {
                    txt = await r.text();
                } catch (error) {
                    // Fallback for Safari ReadableStream issues

                    txt = 'Request failed';
                }
                try {
                    const j = JSON.parse(txt);
                    txt = j.error || j.detail || txt;
                } catch {}
                throw new Error(txt);
            }
            
            // Safari compatibility: use the enhanced json() method
            try {
                return await r.json();
            } catch (error) {
                // Fallback for Safari issues
                if (error.name === 'TypeError') {

                    try {
                        const txt = await r.text();
                        return JSON.parse(txt);
                    } catch (e) {
                        throw new Error('Failed to parse JSON response: ' + e.message);
                    }
                }
                throw error;
            }
        } catch (error) {
            // Additional error handling for Safari
            if (error.name === 'TypeError' && error.message.includes('ReadableStream')) {

                throw new Error('Safari compatibility issue detected. Please try refreshing the page.');
            }
            throw error;
        }
    }
    const fmt = s => {
        if (!s) return '';
        const d = new Date(s);
        if (isNaN(d)) return String(s);
        return d.toLocaleString(undefined, {
            year:'numeric', month:'short', day:'2-digit',
            hour:'2-digit', minute:'2-digit'
        });
    };const escapeHtml=(s='')=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const esc=escapeHtml;function fmtDate(d){const x=new Date(d);return x.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'})}function fmtTime(d){const x=new Date(d);return x.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
    function logout(e){e?.preventDefault?.();try{localStorage.removeItem('auth_token');}catch(_){};location.href='index.html'}
    function addRipple(e){const el=e.target.closest('.btn,.mini');if(!el) return;const r=document.createElement('span');r.className='ripple';const rect=el.getBoundingClientRect();r.style.left=(e.clientX-rect.left)+'px';r.style.top=(e.clientY-rect.top)+'px';el.appendChild(r);setTimeout(()=>r.remove(),600)}document.addEventListener('click',addRipple)
    function toast(msg,type='ok'){const box=$('#toasts');const el=document.createElement('div');el.className='toast '+(type==='error'?'err':'ok');el.textContent=msg;box.appendChild(el);setTimeout(()=>el.remove(),3600)}
    function showWelcome(){$('#wSmall').textContent=(LANG==='ru'?'Аутентификация':'Hello');$('#wBig').textContent=(LANG==='ru'?'Добро пожаловать в панель планирования, Менеджер':'Welcome to the Scheduler Dashboard, Manager');$('#wSub').innerHTML=(LANG==='ru'?'Получаем данные':'Fetching data')+'<span class="pulse-dot"></span>';const w=$('#welcome');w.classList.add('show');w.setAttribute('aria-hidden','false');setTimeout(()=>{w.classList.remove('show');w.setAttribute('aria-hidden','true')},1100)}
    function showDialog({title=null,message='',okText=null,cancelText=null}={}){title=title||t('NOTICE');okText=okText||t('OK');return new Promise(resolve=>{const root=$('#dialogRoot');root.innerHTML=`<div class="modal-card" role="document" tabindex="-1"><h4 class="modal-title">${escapeHtml(title)}</h4><div class="modal-body">${message}</div><div class="modal-actions">${cancelText?`<button class="btn ghost" id="dlgCancel">${escapeHtml(cancelText)}</button>`:''}<button class="btn primary" id="dlgOk">${escapeHtml(okText)}</button></div></div>`;const btnOk=root.querySelector('#dlgOk');const btnCancel=root.querySelector('#dlgCancel');const close=val=>{root.classList.remove('show');root.setAttribute('aria-hidden','true');setTimeout(()=>{root.innerHTML='';resolve(val)},140);window.removeEventListener('keydown',onKey);root.removeEventListener('click',onBackdrop)};const onKey=e=>{if(e.key==='Escape'){btnCancel?close(false):close(true)}if(e.key==='Enter'){close(true)}};const onBackdrop=e=>{if(e.target===root){btnCancel?close(false):close(true)}};btnOk.addEventListener('click',()=>close(true));if(btnCancel) btnCancel.addEventListener('click',()=>close(false));window.addEventListener('keydown',onKey);root.addEventListener('click',onBackdrop);root.classList.add('show');root.setAttribute('aria-hidden','false');setTimeout(()=>btnOk.focus(),30)})}
    const alertDialog=(message,opts={})=>showDialog({title:opts.title||t('NOTICE'),message,okText:opts.okText||t('OK')})
    const confirmDialog=(message,opts={})=>showDialog({title:opts.title||t('CONFIRM'),message,okText:opts.okText||t('YES'),cancelText:opts.cancelText||t('NO')})
    let state={users:[],slots:[],offers:[],windows:[],polls:[]}
    let ME=null
    let editingOffers=new Set()
    let editingOfferGroups=new Set()
    let offerOriginals=new Map()
    let collapsedOfferWindows=new Set()
    let usersCollapsed=true
    let usersSectionCollapsed=false
    let editingWindowId=null
    let offersFilter='all'
    let focusedProfessorId=null
    async function whoami(){
        const res=await jfetch(API+'?action=whoami');
        ME=res.user;
        if (!ME) {
            toast('Unauthorized','error');
            logout();
            return;
        }
        if(ME.role!=='manager' && ME.role!=='assistant'){toast('Manager/Assistant role required','error');location.href='index.html';return}
        $('#me').textContent=`Logged in as ${ME.fullname} [${ME.role}]`;$('#title').textContent=(LANG==='ru'?'Консоль менеджера':'Manager Console');showWelcome()
    }
    async function refreshUsers(){state.users=await jfetch(API+'?action=users');renderUsersTable();renderProfessorChecks();renderProfessorList();updateKPIs()}
    async function refreshWindows(){state.windows=await jfetch(API+'?action=windows');renderWindows();const labelForWindow=w=>(w.title&&w.title.trim())?w.title:`${fmtDate(w.start_ts)} ${fmtTime(w.start_ts)} → ${fmtTime(w.end_ts)}`;populate('#offerWindow',state.windows.map(w=>({value:w.id,label:labelForWindow(w)})));updateKPIs();renderOffers();renderWindowsOffersScroll()}
    async function refreshOffers(){state.offers=await jfetch(API+'?action=my_offers');renderOffers();updateKPIs();renderCharts();renderWindowsOffersScroll()}
    async function refreshSlots(){state.slots=await jfetch(API+'?action=slots');renderProfessorList();if(focusedProfessorId) focusProfessor(focusedProfessorId)}
    async function refreshAll(){await Promise.all([refreshUsers(),refreshWindows(),refreshOffers(),refreshSlots(),refreshPolls()]);renderCharts();renderWindowsOffersScroll();renderNonVotingProfessors()}
    function nameById(id){const u=state.users.find(x=>x.id===id);return u?u.fullname:('#'+id)}
    function groupCount(arr,getter){const m=new Map();arr.forEach(x=>{const k=getter(x);m.set(k,(m.get(k)||0)+1)});return m}
    function pad(n){return String(n).padStart(2,'0')}
    function toLocalInputValue(d){if(!d||Number.isNaN(d.getTime())) return'';return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())}
    function updateKPIs(){const totalUsers=state.users.length;const profs=state.users.filter(u=>u.role==='professor');const assistants=state.users.filter(u=>u.role==='assistant');const activeUsers=state.users.filter(u=>u.active).length;const wins=state.windows.length;const offers=state.offers.length;$('#kpiUsers').textContent=totalUsers;$('#kpiUsersSub').textContent=`${activeUsers} active · ${assistants.length} assistants`;$('#kpiProfs').textContent=profs.length;const profActive=profs.filter(p=>p.active).length;$('#kpiProfsSub').textContent=`${profActive} active`;$('#kpiWins').textContent=wins;$('#kpiWinsSub').textContent=wins?'avg '+Math.round(state.windows.reduce((a,w)=>a+(w.defense_minutes+w.buffer_minutes),0)/wins)+' min/block':'—';$('#kpiOffers').textContent=offers;const oc=groupCount(state.offers,o=>o.status);$('#kpiOffersSub').textContent=[`accepted:${(oc.get('accepted')||0)+(oc.get('finalized')||0)}`,`pending:${(oc.get('offered')||0)+(oc.get('change_requested')||0)}`,`rejected:${oc.get('rejected')||0}`].join(' · ')}
    function renderUsersTable(){const q=($('#userSearch')?.value||'').trim().toLowerCase();let filtered=state.users.filter(u=>{if(!q) return true;if(/^\d+$/.test(q)) return String(u.id)===q||String(u.no)===q;return u.fullname.toLowerCase().includes(q)});const rows=filtered.map(u=>{const isSelf=ME&&ME.id===u.id;let actions=`<span class="muted">No actions</span>`;if(!isSelf){if(ME.role==='manager'){if(u.role==='manager'){actions=`<span class="muted">${t('PROTECTED')}</span>`}else{actions=`<button class="mini" onclick="setActive(event, ${u.id}, ${!u.active})">${u.active?t('SUSPEND'):t('ACTIVATE')}</button><button class="mini danger" onclick="deleteUser(event, ${u.id})">${t('BTN_DELETE')}</button>`}}}return`<tr><td>${u.no}</td><td>${escapeHtml(u.fullname)}</td><td>${escapeHtml(u.role)}</td><td>${u.active?'Yes':'No'}</td><td>${actions}</td></tr>`}).join('');$('#tblUsers tbody').innerHTML=rows||`<tr><td colspan="5" class="muted">${t('NO_USERS')}</td></tr>`;const meta=$('#usersMeta');const btn=$('#btnUsersCollapse');const scrollContainer=$('.users-table-scroll');const isSearching=q.length>0;if(isSearching){meta.textContent=`${t('LBL_SEARCH_USERS')}: ${filtered.length}`;btn.textContent=t('BTN_SHOW_ALL');btn.disabled=true;scrollContainer.style.maxHeight='700px';}else{if(usersCollapsed){meta.textContent=`Showing ${filtered.length} users (scrollable)`;btn.textContent=t('BTN_SHOW_ALL');btn.disabled=false;scrollContainer.style.maxHeight='300px';}else{meta.textContent=`Showing all ${filtered.length}`;btn.textContent=t('BTN_SHOW_FIRST10');btn.disabled=false;scrollContainer.style.maxHeight='700px';}}$('#btnUsersSection').textContent=usersSectionCollapsed?t('BTN_EXPAND'):t('BTN_COLLAPSE')}
    function toggleUsersCollapse(e){const btn=$('#btnUsersCollapse');if(btn?.disabled) return;usersCollapsed=!usersCollapsed;renderUsersTable()}
    function toggleUsersSection(e){usersSectionCollapsed=!usersSectionCollapsed;const body=$('#usersBody');const btn=$('#btnUsersSection');if(usersSectionCollapsed){body.style.display='none';btn.textContent=t('BTN_EXPAND')}else{body.style.display='';btn.textContent=t('BTN_COLLAPSE')}}
    async function createUser(e){const role=$('#newUserRole').value;const fullname=($('#newUserName').value||'').trim();const msgEl=$('#newUserMsg');msgEl.textContent='';if(!fullname){msgEl.textContent=(LANG==='ru'?'Введите полное имя.':'Please enter the full name.');$('#newUserName').focus();return}try{const res=await jfetch(API+'?action=create_user',{method:'POST',body:JSON.stringify({fullname,role})});$('#newUserName').value='';await refreshUsers();msgEl.innerHTML=(LANG==='ru'?'Пользователь создан. Токен: ':'User created. Token: ')+`<code class="token">${res.auth_token}</code> <button class="mini" onclick="copyToClipboard('${res.auth_token}'); this.textContent='${LANG==='ru'?'Скопировано':'Copied'}'; setTimeout(()=>this.textContent='${LANG==='ru'?'Копировать':'Copy'}',1200)">${LANG==='ru'?'Копировать':'Copy'}</button>`;toast(LANG==='ru'?'Пользователь создан':'User created','ok')}catch(err){msgEl.textContent=err.message||String(err);toast(err.message||(LANG==='ru'?'Ошибка создания пользователя':'Error creating user'),'error')}}
    // --- Poll helpers & creation ---
    function addPollOption(){
        const box = document.getElementById('pollOptionsBox');
        if (!box) return;
        const count = box.querySelectorAll('.poll-opt-input').length + 1;
        const row = document.createElement('div');
        row.className = 'poll-opt';
        row.innerHTML = `<input class="inp poll-opt-input" placeholder="Option ${count}"><button class="mini danger" onclick="removePollOption(this)">×</button>`;
        box.appendChild(row);
        const last = row.querySelector('input');
        last && last.focus();
        updatePollOptionButtonStates();
    }
    
    function updatePollOptionButtonStates() {
        const box = document.getElementById('pollOptionsBox');
        if (!box) return;
        const currentOptions = box.querySelectorAll('.poll-opt');
        const removeButtons = box.querySelectorAll('.poll-opt .mini.danger');
        
        removeButtons.forEach(btn => {
            if (currentOptions.length <= 2) {
                btn.disabled = true;
                btn.title = 'At least 2 options required';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.title = 'Remove option';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }
    function removePollOption(btn){
        const box = document.getElementById('pollOptionsBox');
        if (!box) return;
        const row = btn.closest('.poll-opt');
        if (row) {
            // Safety measure: ensure at least 2 options remain
            const currentOptions = box.querySelectorAll('.poll-opt');
            if (currentOptions.length <= 2) {
                toast('At least 2 options are required', 'error');
                return;
            }
            row.remove();
            // re-number placeholders
            Array.from(box.querySelectorAll('.poll-opt-input')).forEach((inp, i) => {
                if (!inp.value) inp.placeholder = `Option ${i+1}`;
            });
            updatePollOptionButtonStates();
        }
    }

    function addCustomTimeslotOption(){
        const box = document.getElementById('customTimeslotOptionsBox');
        if (!box) return;
        const count = box.querySelectorAll('.custom-timeslot-opt').length + 1;
        const timestamp = Date.now(); // Use timestamp to ensure uniqueness
        const row = document.createElement('div');
        row.className = 'custom-timeslot-opt';
        row.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <label class="req">Start date &amp; time</label>
                    <div class="input-wrap">
                        <input id="custom-start-${timestamp}-${count}" class="inp dtp-input custom-start" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                        <button type="button" class="calbtn" data-for="custom-start-${timestamp}-${count}" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                    </div>
                </div>
                <div class="col-6">
                    <label class="req">End date &amp; time</label>
                    <div class="input-wrap">
                        <input id="custom-end-${timestamp}-${count}" class="inp dtp-input custom-end" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                        <button type="button" class="calbtn" data-for="custom-end-${timestamp}-${count}" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                    </div>
                </div>
            </div>
            <button class="mini danger" onclick="removeCustomTimeslotOption(this)" title="Remove this timeslot">×</button>
        `;
        box.appendChild(row);
        updateCustomTimeslotButtonStates();
        
        // Initialize calendar pickers for the new timeslot
        setTimeout(() => {
            const newInputs = row.querySelectorAll('.dtp-input');
            const newButtons = row.querySelectorAll('.calbtn');
            
            newInputs.forEach(inp => {
                // Remove any existing listeners first
                if (inp._calendarFocusHandler) {
                    inp.removeEventListener('focus', inp._calendarFocusHandler);
                }
                inp._calendarFocusHandler = e => {
                    e.stopPropagation();
                    const btn = document.querySelector(`.calbtn[data-for="${inp.id}"]`);
                    if (inp.disabled) return;
                    makePicker(inp);
                };
                inp.addEventListener('focus', inp._calendarFocusHandler);
            });
            
            newButtons.forEach(btn => {
                // Remove any existing listeners first
                if (btn._calendarClickHandler) {
                    btn.removeEventListener('click', btn._calendarClickHandler);
                }
                btn._calendarClickHandler = e => {
                    e.stopPropagation();
                    e.preventDefault();
                    const id = btn.getAttribute('data-for');
                    const input = document.getElementById(id);
                    if (!input || input.disabled) return;
                    makePicker(input);
                };
                btn.addEventListener('click', btn._calendarClickHandler);
            });
        }, 50);
    }
    
    function updateCustomTimeslotButtonStates() {
        const box = document.getElementById('customTimeslotOptionsBox');
        if (!box) return;
        const currentTimeslots = box.querySelectorAll('.custom-timeslot-opt');
        const removeButtons = box.querySelectorAll('.custom-timeslot-opt .mini.danger');
        
        removeButtons.forEach(btn => {
            if (currentTimeslots.length <= 2) {
                btn.disabled = true;
                btn.title = 'At least 2 timeslots required';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.title = 'Remove this timeslot';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }

    function removeCustomTimeslotOption(btn){
        const box = document.getElementById('customTimeslotOptionsBox');
        if (!box) return;
        const row = btn.closest('.custom-timeslot-opt');
        if (row) {
            // Safety measure: ensure at least 2 timeslots remain
            const currentTimeslots = box.querySelectorAll('.custom-timeslot-opt');
            if (currentTimeslots.length <= 2) {
                toast('At least 2 timeslots are required', 'error');
                return;
            }
            row.remove();
            updateCustomTimeslotButtonStates();
        }
    }

    window.createPoll = async function (event) {
        try { event?.preventDefault?.(); } catch (_) {}
        const titleEl = document.getElementById('pollTitle');
        const descEl  = document.getElementById('pollDesc');
        const typeEl  = document.getElementById('pollType');
        const modeEl  = document.getElementById('pollMode');
        const msgEl   = document.getElementById('pollCreateMsg');

        const title = (titleEl?.value || '').trim();
        const description = (descEl?.value || '').trim();
        const allow_multi = (typeEl?.value === 'multiple');
        let mode = 'text';
        if (modeEl?.value === 'time') {
            mode = 'timeslots';
        } else if (modeEl?.value === 'custom_timeslot') {
            mode = 'custom_timeslot';
        }

        if (!title) { toast('Please enter a title', 'error'); titleEl?.focus(); return; }

        let payload = { title, description, allow_multi, require_names: false, mode };

        if (mode === 'text') {
            const opts = Array.from(document.querySelectorAll('#pollOptionsBox .poll-opt-input'))
                .map(i => (i.value || '').trim())
                .filter(v => v !== '');
            if (opts.length < 2) { toast('Add at least two options', 'error'); return; }
            payload.options = opts;
        } else if (mode === 'custom_timeslot') {
            const timeslots = [];
            const timeslotElements = document.querySelectorAll('#customTimeslotOptionsBox .custom-timeslot-opt');
            
            for (let i = 0; i < timeslotElements.length; i++) {
                const element = timeslotElements[i];
                const startInput = element.querySelector('.custom-start');
                const endInput = element.querySelector('.custom-end');
                
                const startValue = (startInput?.value || '').trim();
                const endValue = (endInput?.value || '').trim();
                
                if (startValue && endValue) {
                    // Validate that end is after start
                    const startDate = new Date(startValue);
                    const endDate = new Date(endValue);
                    
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        toast(`Invalid date format in timeslot ${i + 1}`, 'error');
                        return;
                    }
                    
                    if (endDate <= startDate) {
                        toast(`End time must be after start time in timeslot ${i + 1}`, 'error');
                        return;
                    }
                    
                    // Fix timezone issue: preserve local time instead of converting to UTC
                    const startLocal = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));
                    const endLocal = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));
                    
                    // Format as "YYYY-MM-DD HH:MM - YYYY-MM-DD HH:MM"
                    const startFormatted = startLocal.toISOString().slice(0, 16).replace('T', ' ');
                    const endFormatted = endLocal.toISOString().slice(0, 16).replace('T', ' ');
                    timeslots.push(`${startFormatted} - ${endFormatted}`);
                }
            }
            
            if (timeslots.length < 2) { toast('Add at least two timeslots', 'error'); return; }
            payload.options = timeslots;
        } else {

            const start = document.getElementById('ptStart').value.trim();
            const end   = document.getElementById('ptEnd').value.trim();
            const defm  = parseInt(document.getElementById('ptDef').value || '0', 10);
            const bufm  = parseInt(document.getElementById('ptBuf').value || '0', 10);
            const count = parseInt(document.getElementById('ptCount').value || '0', 10);
            const breaksEn = document.getElementById('ptBreaksEnable').checked;
            const bcount = breaksEn ? parseInt(document.getElementById('ptBreaksCount').value || '0', 10) : 0;
            const bmins  = breaksEn ? parseInt(document.getElementById('ptBreakMinutes').value || '0', 10) : 0;
            const note   = (document.getElementById('ptNote').value || '').trim();



            if (!start) { toast('Choose start date & time', 'error'); return; }
            if (!end)   { toast('End time not calculated yet', 'error'); return; }
            if (!(defm > 0)) { toast('Defense minutes must be > 0', 'error'); return; }
            if (bufm < 0)    { toast('Buffer minutes must be ≥ 0', 'error'); return; }
            if (!(count > 0)) { toast('Number of defenses must be > 0', 'error'); return; }

            const slots = buildTimeSlots(new Date(start), new Date(end), defm, bufm, count);
            if (slots.length < 2) { toast('The selected time range produces fewer than two slots', 'error'); return; }

            // Fix timezone issue: preserve local time instead of converting to UTC
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            // Create ISO string with local timezone offset preserved
            const startLocal = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));
            const endLocal = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));
            
            payload.start_ts = startLocal.toISOString();
            payload.end_ts = endLocal.toISOString();
            payload.defense_minutes = defm;
            payload.buffer_minutes  = bufm;
            payload.breaks_count    = bcount || null;
            payload.break_minutes   = bmins  || null;
            payload.per_slot_note   = note   || null;
            payload.options         = slots.map(s => s.label); // backend still expects options
        }

        try {
            msgEl.textContent = 'Creating…';
            await jfetch(API + '?action=create_poll', { method: 'POST', body: JSON.stringify(payload) });
            msgEl.textContent = '';
            toast('Poll created');

            // reset
            titleEl.value = '';
            descEl.value = '';
            if (mode === 'text') {
                const box = document.getElementById('pollOptionsBox');
                box.innerHTML =
                    '<div class="poll-opt"><input class="inp poll-opt-input" placeholder="Option 1"><button class="mini danger" onclick="removePollOption(this)">×</button></div>' +
                    '<div class="poll-opt"><input class="inp poll-opt-input" placeholder="Option 2"><button class="mini danger" onclick="removePollOption(this)">×</button></div>';
            } else if (mode === 'timeslots') {
                document.getElementById('ptNote').value = '';
            } else if (mode === 'custom_timeslot') {
                const box = document.getElementById('customTimeslotOptionsBox');
                box.innerHTML = `
                    <div class="custom-timeslot-opt">
                        <div class="row">
                            <div class="col-6">
                                <label class="req">Start date &amp; time</label>
                                <div class="input-wrap">
                                    <input id="custom-start-init-1" class="inp dtp-input custom-start" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                                    <button type="button" class="calbtn" data-for="custom-start-init-1" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                                </div>
                            </div>
                            <div class="col-6">
                                <label class="req">End date &amp; time</label>
                                <div class="input-wrap">
                                    <input id="custom-end-init-1" class="inp dtp-input custom-end" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                                    <button type="button" class="calbtn" data-for="custom-end-init-1" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                                </div>
                            </div>
                        </div>
                        <button class="mini danger" onclick="removeCustomTimeslotOption(this)">×</button>
                    </div>
                    <div class="custom-timeslot-opt">
                        <div class="row">
                            <div class="col-6">
                                <label class="req">Start date &amp; time</label>
                                <div class="input-wrap">
                                    <input id="custom-start-init-2" class="inp dtp-input custom-start" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                                    <button type="button" class="calbtn" data-for="custom-start-init-2" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                                </div>
                            </div>
                            <div class="col-6">
                                <label class="req">End date &amp; time</label>
                                <div class="input-wrap">
                                    <input id="custom-end-init-2" class="inp dtp-input custom-end" type="text" inputmode="none" placeholder="YYYY-MM-DDTHH:MM"/>
                                    <button type="button" class="calbtn" data-for="custom-end-init-2" aria-label="Open calendar"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                                </div>
                            </div>
                        </div>
                        <button class="mini danger" onclick="removeCustomTimeslotOption(this)">×</button>
                    </div>
                `;
            }

            await refreshPolls?.();
        } catch (e) {
            msgEl.textContent = '';
            toast('Failed to create poll: ' + (e.message || e), 'error');

        }
    };
    // --- Poll results: show voters per option (manager/assistant only) ---
    async function renderVotersForPoll(pollId){
        try{
            if(!pollId || isNaN(pollId)) { toast('Enter a valid poll ID','error'); return; }
            const res = await jfetch(API+`?action=poll_results&poll_id=${pollId}&t=${Date.now()}`);

            const panel = document.getElementById('pollVotersPanel');
            if(!panel) return;

            const safe = s => escapeHtml(String(s||''));
            const options = Array.isArray(res.options) ? res.options : [];

            // voters_by_option may come with numeric keys serialized as strings; support both
            const votersByOpt = res.voters_by_option || {};

            // Build a unique, sorted list of voters across all options
            const voterMap = new Map(); // key -> {id,name}
            options.forEach(o => {
                const list = votersByOpt[o.id] || votersByOpt[String(o.id)] || [];
                list.forEach(v => {
                    const key = (v && v.id != null) ? `id:${v.id}` : `name:${v?.name||''}`;
                    if (!voterMap.has(key)) {
                        voterMap.set(key, { id: v?.id ?? null, name: v?.name || (v?.id != null ? ('#'+v.id) : '') });
                    }
                });
            });
            const voters = Array.from(voterMap.values()).sort((a,b)=>a.name.localeCompare(b.name));

            if (!options.length){
                panel.style.display='';
                panel.innerHTML = `<div class="muted">No options found for poll ${pollId}</div>`;
                return;
            }

            // Build the professor × option matrix UI
            let html = '';
            const metaTitle = res.poll && res.poll.title ? ` – ${safe(res.poll.title)}` : '';
            html += `<div style="padding:8px 10px;border-bottom:1px solid var(--line-2);background:#0b1c2a"><b>Voters matrix</b>${metaTitle}</div>`;

            html += `<div class="poll-matrix">`;
            // Header row
            html += `<div class="pm-head">`;
            html += `<div class="pm-hcell">Name</div>`;
            options.forEach(o => { html += `<div class="pm-hcell">${safe(o.label)}</div>`; });
            html += `</div>`; // end header

            // Rows
            if (voters.length === 0) {
                html += `<div class="pm-row"><div class="pm-cell muted" style="grid-column:1 / span ${options.length+1}">No votes yet</div></div>`;
            } else {
                voters.forEach(v => {
                    html += `<div class="pm-row">`;
                    html += `<div class="pm-cell"><div class="pm-name"><b>${safe(v.name)}</b></div></div>`;
                    options.forEach(o => {
                        const list = votersByOpt[o.id] || votersByOpt[String(o.id)] || [];
                        const has = list.some(x => (x?.id != null && v.id != null && x.id === v.id) || (v.id == null && (x?.name||'') === v.name));
                        html += `<div class="pm-cell">${has ? '<span class="pm-chip pm-yes">✓</span>' : '<span class="pm-chip pm-none">–</span>'}</div>`;
                    });
                    html += `</div>`;
                });
            }

            html += `</div>`; // end .poll-matrix

            panel.innerHTML = html;
            panel.style.display='';
            panel.scrollIntoView({behavior:'smooth', block:'nearest'});
        }catch(e){
            toast(e.message||'Error loading results','error');
        }
    }

    async function viewVotersById(){
        const inp = document.getElementById('pollIdLoad');
        if(!inp){ toast('Control not found','error'); return; }
        const pollId = parseInt(inp.value,10);
        await renderVotersForPoll(pollId);
    }

    // Optional: allow other buttons to call viewVoters(pollId)
    window.viewVoters = renderVotersForPoll;



    function minutesBetween(a,b){ return Math.round((b-a)/60000); }

    function recalcTimeslotEnd(){
        const manual = document.getElementById('ptManualEnd').checked;
        const startVal = document.getElementById('ptStart').value.trim();
        const defm = parseInt(document.getElementById('ptDef').value || '0', 10);
        const bufm = parseInt(document.getElementById('ptBuf').value || '0', 10);
        const count = parseInt(document.getElementById('ptCount').value || '0', 10);
        const breaksEn = document.getElementById('ptBreaksEnable').checked;
        const bcount   = breaksEn ? parseInt(document.getElementById('ptBreaksCount').value || '0', 10) : 0;
        const bmins    = breaksEn ? parseInt(document.getElementById('ptBreakMinutes').value || '0', 10) : 0;

        const endEl = document.getElementById('ptEnd');
        const endBtn = document.querySelector('.calbtn[data-for="ptEnd"]');

        if (!startVal || manual){
            endEl.disabled = !manual;
            if (endBtn) endBtn.disabled = !manual;
            return;
        }

        const start = new Date(startVal);
        if (isNaN(start)) return;

        const stride = (defm > 0 ? defm : 0) + (bufm >= 0 ? bufm : 0);
        const totalMin = (stride * count) + (bcount * Math.max(0,bmins));
        const end = new Date(start.getTime() + totalMin * 60000);

        endEl.disabled = true;
        if (endBtn) endBtn.disabled = true;
        endEl.value = toLocalInputValue(end);
    }

    function buildTimeSlots(start, end, defm, bufm, count = null){
        const slots = [];
        if (!(start instanceof Date) || !(end instanceof Date)) return slots;
        if (isNaN(start) || isNaN(end) || end <= start) return slots;
        
        if (count && count > 0) {
            // Generate exactly 'count' slots
            const stride = defm + bufm;
            let cur = new Date(start);
            for (let i = 0; i < count && cur < end; i++) {
                const s = new Date(cur);
                const e = new Date(cur.getTime() + defm*60000);
                slots.push({ start:s, end:e, label: `${fmtTime(s)} – ${fmtTime(e)}` });
                cur = new Date(cur.getTime() + stride*60000);
            }
        } else {
            // Generate slots based on time range (original behavior)
            const stride = defm + bufm;
            let cur = new Date(start);
            while (cur < end){
                const s = new Date(cur);
                const e = new Date(cur.getTime() + defm*60000);
                slots.push({ start:s, end:e, label: `${fmtTime(s)} – ${fmtTime(e)}` });
                cur = new Date(cur.getTime() + stride*60000);
            }
        }
        return slots;
    }

    function renderTimeslotPreview(){
        // First renderTimeslotPreview function - for poll creation
        const startVal = document.getElementById('ptStart').value.trim();
        const endVal   = document.getElementById('ptEnd').value.trim();
        const defm  = parseInt(document.getElementById('ptDef').value || '0', 10);
        const bufm  = parseInt(document.getElementById('ptBuf').value || '0', 10);
        const count = parseInt(document.getElementById('ptCount').value || '0', 10);
        const prev  = document.getElementById('ptPreview');
        prev.innerHTML = '';
        if (!startVal || !endVal || !(defm > 0)) { prev.textContent = 'Set parameters to see preview.'; return; }
        const slots = buildTimeSlots(new Date(startVal), new Date(endVal), defm, bufm, count);
        if (!slots.length){ prev.textContent = 'No slots generated for the selected range.'; return; }
        prev.innerHTML = slots.map(s => `<div>• ${fmtDate(s.start)} · ${fmtTime(s.start)} – ${fmtTime(s.end)}</div>`).join('');
    }



    function resetPollTimeUI(){
        const ids = ['ptStart','ptEnd'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const def = document.getElementById('ptDef'); if (def) def.value = 20;
        const buf = document.getElementById('ptBuf'); if (buf) buf.value = 5;
        const cnt = document.getElementById('ptCount'); if (cnt) cnt.value = 4;
        const en  = document.getElementById('ptBreaksEnable'); if (en) en.checked = false;
        const bc  = document.getElementById('ptBreaksCount'); if (bc) { bc.value = 1; bc.disabled = true; }
        const bm  = document.getElementById('ptBreakMinutes'); if (bm) { bm.value = 10; bm.disabled = true; }
        const me  = document.getElementById('ptManualEnd'); if (me) me.checked = false;
        const calEndBtn = document.querySelector('.calbtn[data-for="ptEnd"]'); if (calEndBtn) calEndBtn.disabled = true;
        const end = document.getElementById('ptEnd'); if (end) end.disabled = true;
        const note= document.getElementById('ptNote'); if (note) note.value = '';
    }

    function parseLocalDateTime(str){
        if (!str) return null;
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    function toLocalInputValue(d){
        if(!d||Number.isNaN(d.getTime())) return '';
        const pad = n => String(n).padStart(2,'0');
        return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());
    }

    function computePollTimeSlots(){
        const start = parseLocalDateTime(document.getElementById('ptStart')?.value || '');
        const manual = !!document.getElementById('ptManualEnd')?.checked;
        let end   = parseLocalDateTime(document.getElementById('ptEnd')?.value || '');
        const defM = parseInt(document.getElementById('ptDef')?.value || '0', 10);
        const bufM = parseInt(document.getElementById('ptBuf')?.value || '0', 10);
        const cnt  = parseInt(document.getElementById('ptCount')?.value || '0', 10);
        const breaksOn = !!document.getElementById('ptBreaksEnable')?.checked;
        const bCount = breaksOn ? parseInt(document.getElementById('ptBreaksCount')?.value || '0', 10) : 0;
        const bMin   = breaksOn ? parseInt(document.getElementById('ptBreakMinutes')?.value || '0', 10) : 0;

        if (!start || defM <= 0 || bufM < 0 || cnt <= 0) return [];

        const stride = defM + bufM;
        const breakPositions = [];
        if (breaksOn && bCount > 0 && bMin > 0 && cnt > 1) {
            const step = Math.floor(cnt / (bCount + 1));
            let pos = step; // after this many slots, insert first break
            while (pos < cnt) { breakPositions.push(pos); pos += step; }
        }

        const slots = [];
        let cur = new Date(start.getTime());
        for (let i=0;i<cnt;i++){
            const label = cur.toLocaleString(undefined,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'});
            slots.push({ start:new Date(cur.getTime()), label });
            // advance by stride
            cur = new Date(cur.getTime() + stride*60000);
            // add break after certain indices
            if (breakPositions.includes(i+1)) {
                cur = new Date(cur.getTime() + bMin*60000);
            }
        }

        // auto-calc end if not manual
        if (!manual) {
            const last = slots[slots.length-1]?.start;
            if (last) {
                let extra = 0;
                if (breaksOn && bCount > 0 && bMin > 0) extra = bCount*bMin*60000;
                end = new Date(start.getTime() + (stride*cnt)*60000 + extra);
                const endEl = document.getElementById('ptEnd');
                if (endEl) endEl.value = toLocalInputValue(end);
            }
        }

        return slots;
    }

    function updatePollTimePreview(){
        const preview = document.getElementById('ptPreview');
        if (!preview) return;
        const slots = computePollTimeSlots();
        if (!slots.length) { preview.textContent = window.LANG==='ru' ? 'Нет слотов для отображения' : 'No slots yet'; return; }
        preview.innerHTML = '<ul style="margin:0;padding-left:18px">' +
            slots.map(s => '<li>'+escapeHtml(s.label)+'</li>').join('') + '</ul>';
    }

    // Wire up time-slot controls on load
    document.addEventListener('DOMContentLoaded', () => {
        ['ptStart','ptEnd','ptDef','ptBuf','ptCount','ptBreaksCount','ptBreakMinutes']
            .forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', updatePollTimePreview); });
        const me = document.getElementById('ptManualEnd');
        if (me) me.addEventListener('change', () => {
            const end = document.getElementById('ptEnd');
            const btn = document.querySelector('.calbtn[data-for="ptEnd"]');
            const on  = !!me.checked;
            if (end) end.disabled = !on;
            if (btn) btn.disabled = !on;
            updatePollTimePreview();
        });
        const be = document.getElementById('ptBreaksEnable');
        if (be) be.addEventListener('change', () => {
            const c = document.getElementById('ptBreaksCount');
            const m = document.getElementById('ptBreakMinutes');
            const on = !!be.checked;
            if (c) c.disabled = !on;
            if (m) m.disabled = !on;
            updatePollTimePreview();
        });

        // initial calc
        updatePollTimePreview();
    });
    async function setActive(e,id,active){try{await jfetch(API+'?action=set_active',{method:'POST',body:JSON.stringify({id,active})});await refreshUsers();toast(active?(LANG==='ru'?'Пользователь активирован':'User activated'):(LANG==='ru'?'Пользователь заблокирован':'User suspended'))}catch(err){toast(err.message||'Error updating user','error')}}
    async function deleteUser(e,id){try{const ok=await confirmDialog(t('DELETE_USER_Q'));if(!ok) return;await jfetch(API+'?action=delete_user',{method:'POST',body:JSON.stringify({id})});await refreshAll();toast(LANG==='ru'?'Пользователь удалён':'User deleted','ok');renderCharts()}catch(err){toast(err.message||'Error deleting user','error')}}
    function renderWindows(){const q=($('#winSearch')?.value||'').trim().toLowerCase();const rows=state.windows.filter(w=>{if(!q) return true;if(/^\d+$/.test(q)) return String(w.no)===q||String(w.id)===q;return (w.title||'').toLowerCase().includes(q)}).map(w=>`<tr><td>${w.no}</td><td><strong>${escapeHtml(w.title||'')}</strong></td><td>${fmt(w.start_ts)}</td><td>${fmt(w.end_ts)}</td><td>${w.defense_minutes} + ${w.buffer_minutes} min</td><td class="inline"><button class="mini" onclick="openEditWindow(event, ${w.id})">${t('BTN_EDIT')}</button><button class="mini danger" onclick="deleteWindow(event, ${w.id})">${t('BTN_DELETE')}</button></td></tr>`).join('');$('#tblWindows tbody').innerHTML=rows||`<tr><td colspan="6" class="muted">${LANG==='ru'?'Нет окон':'No windows'}</td></tr>`}
    function renderWindowsOffersScroll(){const box=$('#winOffersList');if(!box) return;const q=($('#winOffersSearch')?.value||'').trim().toLowerCase();if(!state.offers.length){box.innerHTML=`<div class="muted">${LANG==='ru'?'Пока нет предложений.':'No offers yet.'}</div>`;return}const items=state.offers.map(o=>{const w=state.windows.find(x=>x.id===o.window_id)||{};const wTitle=w.title||`Window ${o.window_id}`;return{id:o.id,windowTitle:wTitle,windowNo:w.no,professor:nameById(o.professor_id),status:o.status,start:w.start_ts,end:w.end_ts}}).filter(it=>{if(!q) return true;if(/^\d+$/.test(q)) return String(it.windowNo)===q||/\d+/.test(q)&&String(it.id)===q;return it.windowTitle.toLowerCase().includes(q)||it.professor.toLowerCase().includes(q)}).sort((a,b)=>{const at=new Date(a.start||0)-new Date(b.start||0);return at!==0?at:a.professor.localeCompare(b.professor)});box.innerHTML=items.map(it=>`<div class="win-offer-item"><div class="win-offer-left"><span class="badge">${escapeHtml(it.windowTitle)}</span><span class="muted">→</span><span>${escapeHtml(it.professor)}</span></div><div class="win-offer-right"><span class="pill ${statusClass(it.status)}">${escapeHtml(statusLabel(it.status))}</span></div></div>`).join('')||`<div class="muted">${LANG==='ru'?'Совпадений не найдено.':'No matches.'}</div>`}
    function updateWindowPreview(prefix){
        const P=x=>document.getElementById(prefix+x);
        const errorsEl=P('Errors'),previewEl=P('Preview');
        const startStr=P('Start').value;
        const start=startStr?new Date(startStr):null;
        const defMin=parseInt(P('Def').value||'0',10);
        const bufMin=parseInt(P('Buf').value||'0',10);
        const breaksOn=P('BreaksEnable').checked;
        const breakCount=breaksOn?parseInt(P('BreaksCount').value||'0',10):0;
        const breakMin=breaksOn?parseInt(P('BreakMinutes').value||'0',10):0;
        const manualEnd=P('ManualEnd').checked;
        const endStr=P('End').value;
        let end=endStr?new Date(endStr):null;
        let countInput=parseInt(P('Count').value||'0',10);
        const errors=[];
        
        if(!start||!defMin&&defMin!==0){
            previewEl.innerHTML='';
            errorsEl.textContent='';
            P('End').disabled=!manualEnd;
            return;
        }
        
        const block=defMin+bufMin;
        if(block<=0){
            previewEl.innerHTML='';
            errorsEl.textContent='';
            return;
        }
        
        if(!manualEnd){
            // Auto mode: calculate end time based on count
            if(countInput<=0){
                previewEl.innerHTML='';
                errorsEl.textContent='';
                return;
            }
            const totalMin=countInput*block+(breakCount*breakMin);
            end=new Date(start.getTime()+totalMin*60000);
            P('End').value=toLocalInputValue(end);
            P('End').disabled=true;
            toggleCalBtn(P('End').id,true);
        }else{
            // Manual mode: validate count against available time
            P('End').disabled=false;
            toggleCalBtn(P('End').id,false);
            
            if(!end||end<=start){
                errors.push(LANG==='ru'?'Окончание должно быть позже начала.':'End must be after start.');
            }
            
            const windowMin=end?Math.max(0,Math.round((end-start)/60000)):0;
            const room=Math.max(0,windowMin-(breakCount*breakMin));
            const maxCount=Math.floor(room/block);
            
            if(!Number.isFinite(maxCount)||maxCount<=0){
                errors.push(LANG==='ru'?'Недостаточно времени для защит.':'Not enough time for defenses.');
            }else if(countInput>maxCount){
                // Show warning but don't override user input
                errors.push(LANG==='ru'?`Максимальное количество защит: ${maxCount}`:`Maximum number of defenses: ${maxCount}`);
            }
            
            // Only auto-fill count if it's empty
            if(!countInput){
                countInput=Math.max(0,maxCount);
                P('Count').value=String(countInput||1);
            }
        }
        
        P('BreaksCount').disabled=!breaksOn;
        P('BreakMinutes').disabled=!breaksOn;
        
        let html='';
        if(start&&end&&countInput>0){
            let tcur=new Date(start);
            const ba=new Set();
            if(breaksOn&&breakCount>0){
                for(let j=1;j<=breakCount;j++){
                    const idx=Math.round(j*countInput/(breakCount+1));
                    if(idx>0&&idx<countInput) ba.add(idx);
                }
            }
            html+='<div style="display:grid;grid-template-columns:1fr auto;gap:6px;font-size:13px">';
            for(let i=0;i<countInput;i++){
                if(tcur>=end) break;
                html+=`<div>${i+1}</div><div>${tcur.toLocaleString()}</div>`;
                tcur=new Date(tcur.getTime()+defMin*60000+bufMin*60000);
                if(ba.has(i+1)){
                    const bEnd=new Date(tcur.getTime()+breakMin*60000);
                    if(bEnd>end) break;
                    html+=`<div class="muted">${LANG==='ru'?'Перерыв':'Break'}</div><div>${tcur.toLocaleTimeString()} → ${bEnd.toLocaleTimeString()}</div>`;
                    tcur=bEnd;
                }
            }
            html+='</div>';
        }
        previewEl.innerHTML=html;
        errorsEl.textContent=errors.join(' ');
    }
    function bindPreview(prefix){['Start','End','Def','Buf','Count','BreaksEnable','BreaksCount','BreakMinutes','ManualEnd'].forEach(id=>{const el=document.getElementById(prefix+id);if(!el) return;el.addEventListener('input',()=>updateWindowPreview(prefix));el.addEventListener('change',()=>updateWindowPreview(prefix))});updateWindowPreview(prefix)}
    async function createWindow(e){try{updateWindowPreview('win');const title=$('#winTitle').value.trim();if(!title){$('#winErrors').textContent=(LANG==='ru'?'Требуется название.':'Title is required.');return}const start_ts=$('#winStart').value;const end_ts=$('#winEnd').value;const defense_minutes=parseInt($('#winDef').value||'0',10);const buffer_minutes=parseInt($('#winBuf').value||'0',10);const count=parseInt($('#winCount').value||'0',10);const breaksOn=$('#winBreaksEnable').checked;const breakCount=breaksOn?parseInt($('#winBreaksCount').value||'0',10):0;const breakMin=breaksOn?parseInt($('#winBreakMinutes').value||'0',10):0;if(!start_ts||!end_ts) throw new Error(LANG==='ru'?'Окончание должно быть позже начала.':'End must be after start.');if(defense_minutes<=0||count<=0) throw new Error(LANG==='ru'?'Недостаточно времени для всех защит.':'Not enough time to schedule all defenses.');const start=new Date(start_ts),end=new Date(end_ts);const need=count*(defense_minutes+buffer_minutes)+(breakCount*breakMin);const have=Math.round((end-start)/60000);if(have<need) throw new Error(LANG==='ru'?'Недостаточно времени для всех защит.':'Not enough time to schedule all defenses.');const payload={title,start_ts,end_ts,defense_minutes,buffer_minutes};await jfetch(API+'?action=create_window',{method:'POST',body:JSON.stringify(payload)});$('#winMsg').textContent=(LANG==='ru'?'Создано.':'Created.');toast(LANG==='ru'?'Окно создано':'Window created','ok');$('#winStart').value='';$('#winEnd').value='';$('#winDef').value=20;$('#winBuf').value=5;$('#winCount').value=4;$('#winBreaksEnable').checked=false;$('#winBreaksCount').value=1;$('#winBreakMinutes').value=10;$('#winManualEnd').checked=false;toggleCalBtn('winEnd',true);$('#winTitle').value='';updateWindowPreview('win');await refreshWindows();renderCharts()}catch(err){$('#winMsg').textContent=err.message||String(err);toast(err.message||(LANG==='ru'?'Ошибка при создании окна':'Error creating window'),'error')}}
    function openEditWindow(e,id){
        const w=state.windows.find(x=>x.id===id);
        if(!w){
            toast(LANG==='ru'?'Окно не найдено':'Window not found','error');
            return;
        }
        
        editingWindowId=id;
        const panel=$('#editPanel');
        panel.classList.add('open');
        panel.setAttribute('aria-hidden','false');
        $('#editMeta').textContent=`DB id ${id} · No. ${w.no}`;
        $('#ewinTitle').value=w.title||'';
        const s=w.start_ts?new Date(w.start_ts):null;
        const eend=w.end_ts?new Date(w.end_ts):null;
        $('#ewinStart').value=s?toLocalInputValue(s):'';
        $('#ewinEnd').value=eend?toLocalInputValue(eend):'';
        $('#ewinDef').value=w.defense_minutes;
        $('#ewinBuf').value=w.buffer_minutes;
        // Calculate the original count based on the window's time span
        const block=Number(w.defense_minutes)+Number(w.buffer_minutes);
        let originalCount=1;
        if(s&&eend&&block>0){
            const windowMin=Math.max(0,Math.round((eend-s)/60000));
            originalCount=Math.max(1,Math.floor(windowMin/block));
        }
        $('#ewinCount').value=String(originalCount);
        $('#ewinManualEnd').checked=false;
        toggleCalBtn('ewinEnd',true);
        $('#ewinBreaksEnable').checked=false;
        $('#ewinBreaksCount').value=1;
        $('#ewinBreakMinutes').value=10;
        bindPreview('ewin');
    }
    async function updateWindow(e){
        const title=$('#ewinTitle').value.trim();
        if(!title){
            $('#ewinErrors').textContent=(LANG==='ru'?'Требуется название.':'Title is required.');
            return;
        }
        
        try{
            const payload={
                id:editingWindowId,
                title,
                start_ts:$('#ewinStart').value,
                end_ts:$('#ewinEnd').value,
                defense_minutes:parseInt($('#ewinDef').value||'0',10),
                buffer_minutes:parseInt($('#ewinBuf').value||'0',10)
            };
            
            const response = await jfetch(API+'?action=update_window',{method:'POST',body:JSON.stringify(payload)});
            cancelEdit();
            await refreshAll();
            
            // Show appropriate message based on response
            if(response.offers_deleted && response.offers_deleted > 0){
                const message = LANG==='ru' 
                    ? `Окно обновлено. Удалено ${response.offers_deleted} предложений из-за изменения параметров окна.`
                    : `Window updated. Deleted ${response.offers_deleted} offers due to window parameter changes.`;
                toast(message, 'warning');
            } else {
                toast(LANG==='ru'?'Окно обновлено':'Window updated','ok');
            }
            
            renderCharts();
        }catch(err){
            $('#ewinMsg').textContent=err.message||String(err);
            toast(err.message||(LANG==='ru'?'Ошибка обновления окна':'Error updating window'),'error');
        }
    }
    function cancelEdit(e){editingWindowId=null;const panel=$('#editPanel');panel.classList.remove('open');panel.setAttribute('aria-hidden','true');$('#ewinMsg').textContent=''}
    async function deleteWindow(e,id){try{const ok=await confirmDialog(t('DELETE_WINDOW_Q'));if(!ok) return;await jfetch(API+'?action=delete_window',{method:'POST',body:JSON.stringify({id})});await refreshAll();if(editingWindowId===id) cancelEdit();toast(LANG==='ru'?'Окно удалено':'Window deleted','ok');renderCharts()}catch(err){toast(err.message||'Error deleting window','error')}}
    function renderProfessorChecks(){
        const box=document.getElementById('offerProfessorChecks');
        if(!box) return;
        const q=($('#offerProfessorFilter').value||'').toLowerCase();
        const profs=state.users.filter(u=>u.role==='professor').sort((a,b)=>a.fullname.localeCompare(b.fullname)).filter(p=>!q||p.fullname.toLowerCase().includes(q)||String(p.id)===q||String(p.no)===q);
        
        // Check if a window is selected
        const windowId = parseInt($('#offerWindow').value || '0');
        const hasWindowSelected = windowId > 0;
        
        box.innerHTML=profs.map(p=>`<label class="check ${!hasWindowSelected ? 'disabled' : ''}"><input type="checkbox" value="${p.id}" onchange="onProfessorSelectionChange(${p.id}, '${escapeHtml(p.fullname)}', this.checked)" ${!hasWindowSelected ? 'disabled' : ''}><span title="${escapeHtml(p.fullname)}">${escapeHtml(p.fullname)}</span></label>`).join('')||`<div class="muted" style="padding:6px">${LANG==='ru'?'Нет профессоров':'No professors'}</div>`;
        
        // Add a note if no window is selected
        if (!hasWindowSelected && profs.length > 0) {
            const note = document.createElement('div');
            note.className = 'muted';
            note.style.cssText = 'padding: 6px; font-size: 11px; color: var(--p2); font-style: italic;';
            note.textContent = LANG==='ru' ? '⚠️ Сначала выберите окно выше' : '⚠️ Please select a window above first';
            box.appendChild(note);
        }
    }
    async function offerSelectAllVisible(e){
        document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]').forEach(cb=>cb.checked=true);
        // Show slot selections for all selected professors
        const selectedProfs = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
        if (selectedProfs.length > 0) {
            $('#professorSlotSelections').style.display = 'block';
            for (const cb of selectedProfs) {
                const professorId = parseInt(cb.value);
                const professorName = cb.nextElementSibling.textContent;
                showProfessorSlotSelection(professorId, professorName);
            }
        }
    }
    function offerClear(e){
        document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]').forEach(cb=>cb.checked=false);
        clearProfessorSlotSelections();
        $('#professorSlotSelections').style.display = 'none';
    }
    document.getElementById('offerProfessorFilter')?.addEventListener?.('input',renderProfessorChecks)
    
    // Individual professor slot selection functions
    async function onWindowSelected() {
        const windowId = parseInt($('#offerWindow').value || '0');
        if (windowId > 0) {
            // Clear any existing slot selections when window changes
            clearProfessorSlotSelections();
            // Show the slot selection container
            $('#professorSlotSelections').style.display = 'block';
            // Re-render professor checkboxes to enable them
            renderProfessorChecks();
        } else {
            // Hide the slot selection container when no window is selected
            $('#professorSlotSelections').style.display = 'none';
            clearProfessorSlotSelections();
            // Re-render professor checkboxes to disable them
            renderProfessorChecks();
        }
    }
    
    function showProfessorSlotSelection(professorId, professorName) {
        const windowId = parseInt($('#offerWindow').value || '0');
        
        if (windowId <= 0) {
            toast(LANG==='ru'?'Сначала выберите окно':'Please select a window first', 'warning');
            return;
        }
        
        const window = state.windows.find(w => w.id === windowId);
        if (!window) {
            return;
        }
        
        const slots = generateWindowSlots(window);
        
        const container = $('#professorSlotSelections');
        
        // Check if slot selection for this professor already exists
        const existingSelection = document.getElementById(`prof-slot-${professorId}`);
        if (existingSelection) {
            return;
        }
        
        const slotSelectionHtml = `
            <div id="prof-slot-${professorId}" class="professor-slot-selection">
                <h4>
                        Slot Selection for <strong>${escapeHtml(professorName)}</strong>
                        <span class="muted slot-count-span" style="font-weight:400; margin-left:8px">(0/${slots.length} slots selected)</span>
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
        $('#professorSlotSelections').innerHTML = '';
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
            
            // Only update the count span, not the entire title to avoid interfering with checkboxes
            const countSpan = titleElement.querySelector('.slot-count-span');
            if (countSpan) {
                countSpan.textContent = `(${selectedCount}/${totalCount} slots selected)`;
            } else {
                // If count span doesn't exist, create it
                const instructionSpan = titleElement.querySelector('.muted');
                if (instructionSpan) {
                    instructionSpan.className = 'muted slot-count-span';
                    instructionSpan.textContent = `(${selectedCount}/${totalCount} slots selected)`;
                }
            }
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
        const windowId = parseInt($('#offerWindow').value || '0');
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
                    
                    // Update the slot count display after all checkboxes are checked
                    setTimeout(() => {
                    updateProfessorSlotSelection();
                    }, 50);
                    
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
                    $('#offerComment').value = response.comment;
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
            $('#professorSlotSelections').style.display = 'block';
        } else {
            // Remove slot selection for this professor
            removeProfessorSlotSelection(professorId);
            // Hide container if no professors are selected
            const selectedProfs = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
            if (selectedProfs.length === 0) {
                $('#professorSlotSelections').style.display = 'none';
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
            
            // Fix timezone issue: preserve local time instead of converting to UTC
            const slotStartLocal = new Date(slotStart.getTime() - (slotStart.getTimezoneOffset() * 60000));
            const slotEndLocal = new Date(slotEnd.getTime() - (slotEnd.getTimezoneOffset() * 60000));
            
            slots.push({
                index: slotIndex,
                start: slotStart,
                end: slotEnd,
                start_ts: slotStartLocal.toISOString(),
                end_ts: slotEndLocal.toISOString()
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
    async function offerWindow(e){
        try {
            const checks = document.querySelectorAll('#offerProfessorChecks input[type="checkbox"]:checked');
            const selectedProfs = Array.from(checks).map(cb => +cb.value);
            
            if (selectedProfs.length === 0) {
                $('#offerMsg').textContent = (LANG==='ru'?'Выберите минимум одного профессора.':'Select at least one professor.');
                return;
            }
            
            const windowId = +$('#offerWindow').value;
            const comment = $('#offerComment').value.trim();
            const selectedSlots = getSelectedSlots();
            
            // Validate that each selected professor has at least one slot selected
            const professorsWithoutSlots = selectedProfs.filter(pid => !selectedSlots[pid] || selectedSlots[pid].length === 0);
            if (professorsWithoutSlots.length > 0) {
                const profNames = professorsWithoutSlots.map(pid => {
                    const prof = state.users.find(u => u.id === pid);
                    return prof ? prof.fullname : `ID ${pid}`;
                }).join(', ');
                $('#offerMsg').textContent = (LANG==='ru'?'Следующие профессора не имеют выбранных слотов: ':'The following professors have no slots selected: ') + profNames;
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
            
            $('#offerMsg').textContent = (LANG==='ru'?'Отправлено предложений: ':'Offers sent: ') + selectedProfs.length;
            $('#offerComment').value = '';
            offerClear();
            await refreshOffers();
            toast(LANG==='ru'?'Предложения отправлены':'Offer(s) sent', 'ok');
            renderCharts();
        } catch (err) {
            $('#offerMsg').textContent = err.message;
            toast(err.message || (LANG==='ru'?'Ошибка отправки':'Error sending offers'), 'error');
        }
    }
    function statusClass(s){if(s==='accepted') return'status-accepted';if(s==='finalized') return'status-finalized';if(s==='offered') return'status-offered';if(s==='rejected') return'status-rejected';if(s==='change_requested') return'status-change_requested';return''}
    function statusLabel(s){const mapEn={accepted:'Accepted',finalized:'Finalized',offered:'Offered',rejected:'Rejected',change_requested:'Change requested'};const mapRu={accepted:'Принято',finalized:'Завершено',offered:'Отправлено',rejected:'Отклонено',change_requested:'Запрошено изменение'};return(LANG==='ru'?(mapRu[s]||s):(mapEn[s]||s))}
    function statusShort(s){if(s==='finalized') return LANG==='ru'?'Завершено':'Finalized';if(s==='accepted') return LANG==='ru'?'Принято':'Accepted';if(s==='offered') return LANG==='ru'?'В ожидании':'Pending';if(s==='change_requested') return LANG==='ru'?'Запрос изм.':'Change req.';if(s==='rejected') return LANG==='ru'?'Отклонено':'Rejected';return s}
    function setOffersFilter(val,btn){offersFilter=val;document.querySelectorAll('#offerFilterBtns .mini').forEach(b=>b.classList.remove('active'));if(btn) btn.classList.add('active');renderOffers()}
    function matchesOfferFilter(o){if(offersFilter==='all') return true;if(offersFilter==='accepted') return o.status==='accepted'||o.status==='finalized';if(offersFilter==='pending') return o.status==='offered'||o.status==='change_requested';if(offersFilter==='request_change') return o.status==='change_requested';if(offersFilter==='rejected') return o.status==='rejected';return true}
    function matchesOfferSearch(o){const q=($('#offerSearch')?.value||'').trim().toLowerCase();if(!q) return true;const w=state.windows.find(x=>x.id===o.window_id);const wTitle=(w?.title||'').toLowerCase();const wNo=String(w?.no||'');const prof=nameById(o.professor_id).toLowerCase();const cmt=(o.comment||'').toLowerCase();const stat=statusLabel(o.status).toLowerCase();if(/^\d+$/.test(q)) return wNo===q||String(o.window_id)===q||String(o.id)===q||String(o.professor_id)===q;return wTitle.includes(q)||prof.includes(q)||cmt.includes(q)||stat.includes(q)}
    function toggleEditOffer(id,on){
        const offer=state.offers.find(o=>o.id===id);
        if(on){
            if(offer) editingOfferGroups.delete(offer.window_id);
            editingOffers.add(id);
            // Ensure the window is expanded when editing an offer
            collapsedOfferWindows.delete(offer.window_id);
        }else{
            editingOffers.delete(id);
        }
        renderOffers();
    }
    function toggleEditOfferGroup(windowId,on){if(on){state.offers.filter(o=>o.window_id===windowId).forEach(o=>editingOffers.delete(o.id));editingOfferGroups.add(windowId);collapsedOfferWindows.delete(windowId)}else{editingOfferGroups.delete(windowId)}renderOffers()}
    function toggleOfferWindowCollapse(windowId){
        // If we're expanding this window, collapse all others first
        if(collapsedOfferWindows.has(windowId)) {
            // Close all other open windows first
            const allWindowIds = state.windows.map(w => w.id);
            allWindowIds.forEach(otherWindowId => {
                if (otherWindowId !== windowId) {
                    collapsedOfferWindows.add(otherWindowId);
                }
            });
            collapsedOfferWindows.delete(windowId);
        } else {
            collapsedOfferWindows.add(windowId);
        }
        
        renderOffers();
    }
    async function saveOffer(id){
        try{
            const comment = document.getElementById('offerCmt_'+id)?.value || '';
            const professor_id = parseInt(document.getElementById('offerProf_'+id)?.value||'0',10) || null;
            const window_id = parseInt(document.getElementById('offerWin_'+id)?.value||'0',10) || null;
            
            // Get selected slots for this offer
            const selectedSlots = [];
            const slotCheckboxes = document.querySelectorAll(`input[id^="edit_slot_${id}_"]:checked`);
            slotCheckboxes.forEach(cb => {
                const slotIndex = parseInt(cb.dataset.slotIndex);
                if (!isNaN(slotIndex)) {
                    selectedSlots.push(slotIndex);
                }
            });
            
            await jfetch(API+'?action=update_offer',{
                method:'POST',
                body:JSON.stringify({
                    id,
                    comment,
                    professor_id,
                    window_id,
                    selected_slots: selectedSlots
                })
            });
            editingOffers.delete(id);
            await refreshOffers();
            toast(LANG==='ru'?'Предложение обновлено и повторно отправлено':'Offer updated & re-sent','ok');
            renderCharts();
        }catch(err){
            toast(err.message||(LANG==='ru'?'Ошибка обновления предложения':'Error updating offer'),'error');
        }
    }
    function resetOffer(id){const orig=offerOriginals.get(id);if(!orig){toggleEditOffer(id,false);return}const profSel=document.getElementById('offerProf_'+id);const winSel=document.getElementById('offerWin_'+id);const cmt=document.getElementById('offerCmt_'+id);if(profSel) profSel.value=String(orig.professor_id);if(winSel) winSel.value=String(orig.window_id);if(cmt) cmt.value=orig.comment||'';toggleEditOffer(id,false)}
    async function saveOfferGroup(windowId){const box=document.getElementById('editProfChecks_'+windowId);if(!box) return;const selected=Array.from(box.querySelectorAll('input[type="checkbox"]:checked')).map(cb=>+cb.value);if(selected.length===0){toast(LANG==='ru'?'Нужно оставить хотя бы одного профессора':'At least one professor must remain for this window','error');return}const items=state.offers.filter(o=>o.window_id===windowId);const current=new Set(items.map(o=>o.professor_id));const toAdd=selected.filter(pid=>!current.has(pid));const toRemove=items.filter(o=>!selected.includes(o.professor_id));const risky=toRemove.filter(o=>['accepted','finalized','change_requested'].includes(o.status));if(risky.length){const ok=await confirmDialog((LANG==='ru'?`Вы удаляете ${risky.length} предложений со статусом принято/завершено/изменение. Продолжить?`:`You are removing ${risky.length} accepted/finalized/change-requested offer(s). Proceed?`));if(!ok) return}try{const newComment=(document.getElementById('editGroupComment_'+windowId)?.value||'').trim();const addCalls=toAdd.map(pid=>jfetch(API+'?action=offer_window',{method:'POST',body:JSON.stringify({window_id:windowId,professor_id:pid,comment:newComment})}));const delCalls=toRemove.map(o=>jfetch(API+'?action=delete_offer',{method:'POST',body:JSON.stringify({id:o.id})}));await Promise.all([...addCalls,...delCalls]);editingOfferGroups.delete(windowId);await Promise.all([refreshOffers(),refreshSlots()]);toast(LANG==='ru'?'Список профессоров обновлён':'Professor list updated for this window','ok');renderCharts()}catch(err){toast(err.message||(LANG==='ru'?'Ошибка обновления предложений':'Error updating offers'),'error')}}
    function cancelOfferGroup(windowId){editingOfferGroups.delete(windowId);renderOffers()}
    async function finalizeOffer(id,acceptChange){try{await jfetch(API+'?action=finalize_offer',{method:'POST',body:JSON.stringify({offer_id:id,accept_change:!!acceptChange})});await Promise.all([refreshOffers(),refreshSlots()]);toast(LANG==='ru'?'Предложение финализировано, слоты созданы':'Offer finalized & slots generated','ok');renderCharts()}catch(err){toast(err.message||(LANG==='ru'?'Ошибка финализации':'Error finalizing offer'),'error')}}
    async function deleteOffer(id){try{const ok=await confirmDialog(t('DELETE_OFFER_Q'));if(!ok) return;await jfetch(API+'?action=delete_offer',{method:'POST',body:JSON.stringify({id})});await Promise.all([refreshOffers(),refreshSlots()]);toast(LANG==='ru'?'Предложение удалено':'Offer deleted','ok');renderCharts()}catch(err){toast(err.message||(LANG==='ru'?'Ошибка удаления':'Error deleting offer'),'error')}}
    async function deleteWindowFromOffers(windowId){try{const ok=await confirmDialog(t('DELETE_WINDOW_Q'));if(!ok) return;await jfetch(API+'?action=delete_window',{method:'POST',body:JSON.stringify({id:windowId})});editingOfferGroups.delete(windowId);collapsedOfferWindows.delete(windowId);await refreshAll();toast(LANG==='ru'?'Окно удалено':'Window deleted','ok');renderCharts()}catch(err){toast(err.message||(LANG==='ru'?'Ошибка удаления окна':'Error deleting window'),'error')}}
    function renderOffers(){
        state.offers.forEach(o=>{if(!offerOriginals.has(o.id)) offerOriginals.set(o.id,{professor_id:o.professor_id,window_id:o.window_id,comment:o.comment||''})});
        const profOpts=state.users.filter(u=>u.role==='professor').sort((a,b)=>a.fullname.localeCompare(b.fullname));
        const winOpts=state.windows;
        const filteredOffers=state.offers.filter(matchesOfferFilter).filter(matchesOfferSearch);
        
        const groups=[];
        const map=new Map();
        filteredOffers.forEach(o=>{if(!map.has(o.window_id)){map.set(o.window_id,[]);groups.push({window_id:o.window_id,items:map.get(o.window_id)})}map.get(o.window_id).push(o)});
        
        // Start with all windows collapsed by default
        if(collapsedOfferWindows.size===0){groups.forEach(g=>collapsedOfferWindows.add(g.window_id))}
        const rows=groups.map((g,idx)=>{
            const w=state.windows.find(ww=>ww.id===g.window_id)||g.items[0];
            const dateChip=`<span class="meta-chip">${fmtDate(w.start_ts)}</span>`;
            const timeChip=`<span class="meta-chip">${fmtTime(w.start_ts)} <span class="meta-sep">→</span> ${fmtTime(w.end_ts)}</span>`;
            const blockChip=`<span class="meta-chip">${w.defense_minutes}+${w.buffer_minutes} min/block</span>`;
            const headerLeft=`<div><strong>${escapeHtml(w.title||(LANG==='ru'?'Окно':'Window'))}</strong><div class="meta-row">${dateChip}${timeChip}${blockChip}</div></div>`;
            const headerRight=`<div class="inline" style="margin-top:6px"><button class="mini" onclick="toggleEditOfferGroup(${g.window_id}, true); event.stopPropagation()">${t('EDIT_PROFESSORS')}</button><button class="mini danger" title="${escapeHtml(LANG==='ru'?'Удалить это окно вместе со всеми предложениями':'Delete this window and all its offers')}" onclick="deleteWindowFromOffers(${g.window_id}); event.stopPropagation()">${t('BTN_DELETE')}</button></div>`;
            const caret=`<span class="caret ${!collapsedOfferWindows.has(g.window_id)?'rot':''}">▶</span>`;

            
            const mapping=g.items.slice().sort((a,b)=>nameById(a.professor_id).localeCompare(nameById(b.professor_id))).map(o=>{const dotCls=(o.status==='offered')?'pending':o.status;return`<span class="mapping-chip"><span class="dot ${dotCls}"></span>${escapeHtml(nameById(o.professor_id))} · ${escapeHtml(statusShort(o.status))}</span>`}).join('');
            const groupEditing=editingOfferGroups.has(g.window_id);
            const collapsed=collapsedOfferWindows.has(g.window_id)&&!groupEditing;
            
            const itemsHtml=g.items.map(o=>{
                const cls=statusClass(o.status);
                const editing=editingOffers.has(o.id)&&!groupEditing;
                const profSel=`<select id="offerProf_${o.id}" class="sel" ${editing?'':'disabled'} style="max-width:260px">${profOpts.map(p=>`<option value="${p.id}" ${p.id===o.professor_id?'selected':''}>${escapeHtml(p.fullname)}</option>`).join('')}</select>`;
                const winSel=`<select id="offerWin_${o.id}" class="sel" ${editing?'':'disabled'} style="max-width:260px">${winOpts.map(ww=>`<option value="${ww.id}" ${ww.id===o.window_id?'selected':''}>${escapeHtml(ww.title)}</option>`).join('')}</select>`;
                const cmtVal=escapeHtml(o.comment||'');
                const commentEl=editing?`<input id="offerCmt_${o.id}" class="inp" value="${cmtVal}" placeholder="${t('LBL_COMMENT')}">`:(cmtVal?`<span class="muted">"${cmtVal}"</span>`:'');
                const editBtns=editing?`<button class="mini" onclick="saveOffer(${o.id})">${t('SAVE_RESEND')}</button><button class="mini" onclick="resetOffer(${o.id})">${t('RESET')}</button>`:(groupEditing?``:`<button class="mini" onclick="toggleEditOffer(${o.id}, true)">${t('BTN_EDIT')}</button>`);
                let finalizeBtn='';
                if(o.status==='accepted') finalizeBtn=`<button class="mini success" onclick="finalizeOffer(${o.id}, false)" title="Manager only: Finalize offer and create defense slots">${t('FINALIZE')}</button>`;
                if(o.status==='change_requested') finalizeBtn=`<button class="mini success" onclick="finalizeOffer(${o.id}, true)" title="Manager only: Approve professor's change request">${t('APPROVE_CHANGE')}</button>`;
                
                // Get professor's assigned time slots for this window (from defense_slots - finalized slots)
                const professorSlots = state.slots.filter(s => s.userid === o.professor_id && s.window_id === o.window_id);
                
                // Check for change request data
                const hasChangeRequest = o.status === 'change_requested';
                const hasWindowChange = hasChangeRequest && o.requested_window_id;
                const hasTimeChange = hasChangeRequest && o.requested_start && o.requested_end;
                
                let timeSlotInfo = '';
                
                if (hasWindowChange) {
                    // Show requested window change
                    const requestedWindow = state.windows.find(w => w.id === o.requested_window_id);
                    
                    if (requestedWindow) {
                        const requestedStart = new Date(requestedWindow.start_ts);
                        const requestedEnd = new Date(requestedWindow.end_ts);
                        
                        // Get original window time for comparison
                        const originalStart = new Date(w.start_ts);
                        const originalEnd = new Date(w.end_ts);
                        
                        timeSlotInfo = `<div class="time-slots-info change-request">
                            <span class="time-slots-label change-request-label">${LANG==='ru'?'Запрошенное изменение окна:':'Requested Window Change:'}</span>
                            <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">
                                <span class="time-slot-chip change-request-chip">${requestedWindow.title || 'Window #' + requestedWindow.id} - ${requestedStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${requestedStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${requestedEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: var(--muted);">
                                <span>${LANG==='ru'?'Вместо:':'Instead of:'} ${w.title || 'Window #' + w.id} - ${originalStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${originalStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${originalEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>`;
                    }
                } else if (hasTimeChange) {
                    // Show requested time change within the same window
                    const requestedStart = new Date(o.requested_start);
                    const requestedEnd = new Date(o.requested_end);
                    
                    // Get original window time for comparison
                    const originalStart = new Date(w.start_ts);
                    const originalEnd = new Date(w.end_ts);
                    
                    timeSlotInfo = `<div class="time-slots-info change-request">
                        <span class="time-slots-label change-request-label">${LANG==='ru'?'Запрошенное изменение времени:':'Requested Time Change:'}</span>
                        <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">
                            <span class="time-slot-chip change-request-chip">${requestedStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${requestedStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${requestedEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style="margin-top: 6px; font-size: 11px; color: var(--muted);">
                            <span>${LANG==='ru'?'Вместо:':'Instead of:'} ${originalStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${originalStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${originalEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>`;
                } else if (professorSlots.length > 0) {
                    // Show assigned time slots (from defense_slots - finalized slots)
                    timeSlotInfo = `<div class="time-slots-info">
                        <span class="time-slots-label">${LANG==='ru'?'Назначенные слоты:':'Assigned slots:'}</span>
                        <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">
                            ${professorSlots.map(slot => {
                                const slotTime = new Date(slot.timeslot);
                                const endTime = new Date(slotTime.getTime() + (w.defense_minutes + w.buffer_minutes) * 60000);
                                return `<span class="time-slot-chip">${slotTime.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${slotTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                            }).join('')}
                        </div>
                    </div>`;
                } else if (o.slots && o.slots.length > 0) {
                    // Show offered time slots (from offer_slots - pending offers)
                    const selectedSlots = o.slots.filter(s => s.is_selected);
                    if (selectedSlots.length > 0) {
                        timeSlotInfo = `<div class="time-slots-info">
                            <span class="time-slots-label">${LANG==='ru'?'Предложенные слоты:':'Offered slots:'}</span>
                            <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">
                                ${selectedSlots.map(slot => {
                                    const slotStart = new Date(slot.slot_start_ts);
                                    const slotEnd = new Date(slot.slot_end_ts);
                                    return `<span class="time-slot-chip offered-slot">${slotStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} ${slotStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${slotEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                                }).join('')}
                            </div>
                        </div>`;
                    }
                }
                
                // Generate slot selection for editing mode
                let slotSelectionHtml = '';
                if (editing) {
                    const window = state.windows.find(w => w.id === o.window_id);
                    if (window) {
                        const slots = generateWindowSlots(window);
                        const currentSelectedSlots = o.slots ? o.slots.filter(s => s.is_selected).map(s => s.slot_index) : [];
                        
                        slotSelectionHtml = `
                            <div class="slot-selection-container" style="margin-top: 12px; padding: 12px; background: var(--card-soft); border: 1px solid var(--line-2); border-radius: 8px;">
                                <h4 style="margin: 0 0 8px; font-size: 14px; color: var(--ink);">${LANG==='ru'?'Выберите слоты для предложения:':'Select slots for this offer:'}</h4>
                                <div class="slot-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
                                    ${slots.map((slot, index) => {
                                        const isSelected = currentSelectedSlots.includes(index);
                                        const slotStart = new Date(slot.start_ts);
                                        const slotEnd = new Date(slot.end_ts);
                                        return `
                                            <label class="slot-check-item" style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; background: ${isSelected ? 'var(--accent-soft)' : 'transparent'};">
                                                <input type="checkbox" 
                                                       id="edit_slot_${o.id}_${index}" 
                                                       data-offer-id="${o.id}" 
                                                       data-slot-index="${index}"
                                                       ${isSelected ? 'checked' : ''}
                                                       style="margin: 0;">
                                                <span style="font-size: 12px; color: var(--ink);">
                                                    ${slotStart.toLocaleDateString([], {month: 'short', day: 'numeric'})} 
                                                    ${slotStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                                    ${slotEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                                <div style="margin-top: 8px; font-size: 11px; color: var(--muted);">
                                    ${LANG==='ru'?'Выберите временные слоты, которые будут предложены профессору.':'Select the time slots to offer to the professor.'}
                                </div>
                            </div>
                        `;
                    }
                }
                
                return`<div class="offer-item">
                    <div class="offer-line">
                        <span class="badge">${escapeHtml(nameById(o.professor_id))}</span>
                        <span class="pill ${cls}">${escapeHtml(statusLabel(o.status))}</span>
                        ${!editing?commentEl:''}
                    </div>
                    ${timeSlotInfo}
                    ${editing?`<div class="offer-line">${profSel} ${winSel} ${commentEl}</div>`:``}
                    ${slotSelectionHtml}
                    <div class="offer-line">${editBtns}${finalizeBtn}<button class="mini danger" onclick="deleteOffer(${o.id})">${t('BTN_DELETE')}</button></div>
                </div>`;
            }).join('');
            
            const allProfs=profOpts;
            const selectedSet=new Set(g.items.map(x=>x.professor_id));
            const editPanel=groupEditing?`<div class="offer-edit-panel" id="editPanel_${g.window_id}"><div class="inline" style="justify-content:space-between; width:100%"><strong>${t('EDIT_PROFESSORS')} – "${escapeHtml(w.title||(LANG==='ru'?'Окно':'Window'))}"</strong><span class="muted">${t('AT_LEAST_ONE')}</span></div><div id="editProfChecks_${g.window_id}" class="check-grid" style="margin-top:6px">${allProfs.map(p=>`<label class="check"><input type="checkbox" value="${p.id}" ${selectedSet.has(p.id)?'checked':''}><span>${escapeHtml(p.fullname)}</span></label>`).join('')}</div><label style="margin-top:8px">${t('COMMENT_APPLIES_NEW')}</label><input id="editGroupComment_${g.window_id}" class="inp" placeholder="${t('LBL_COMMENT')}"><div class="offer-edit-actions"><button class="mini success" onclick="saveOfferGroup(${g.window_id})">${t('SAVE_CHANGES')}</button><button class="mini" onclick="cancelOfferGroup(${g.window_id})">${t('BTN_CANCEL')}</button></div></div>`:'';
            
        // Calculate offer status counts for this window
        const statusCounts = {};
        g.items.forEach(o => {
            const status = o.status;
            if (status === 'accepted' || status === 'finalized') {
                statusCounts.accepted = (statusCounts.accepted || 0) + 1;
            } else if (status === 'offered' || status === 'change_requested') {
                statusCounts.pending = (statusCounts.pending || 0) + 1;
            } else if (status === 'rejected') {
                statusCounts.rejected = (statusCounts.rejected || 0) + 1;
            }
        });
        
        // Also count change_requested separately for detailed display
        const changeRequestedCount = g.items.filter(o => o.status === 'change_requested').length;
        
        const statusSummary = [];
        if (statusCounts.accepted) statusSummary.push(`<span class="pill status-accepted">${statusCounts.accepted} accepted</span>`);
        if (statusCounts.pending) statusSummary.push(`<span class="pill status-offered">${statusCounts.pending} pending</span>`);
        if (changeRequestedCount > 0) statusSummary.push(`<span class="pill status-change-requested">${changeRequestedCount} request change</span>`);
        if (statusCounts.rejected) statusSummary.push(`<span class="pill status-rejected">${statusCounts.rejected} rejected</span>`);
        
        const header = `<div class="offer-group-header"
    data-window-id="${g.window_id}"
    role="button" tabindex="0"
    aria-expanded="${!collapsed}">
                <div class="inline" style="align-items:flex-start"><span class="caret ${!collapsed?'rot':''}">▶</span>${headerLeft}</div>${headerRight}</div>${collapsed?`<div class="mapping">${mapping||`<span class="muted">${LANG==='ru'?'Нет предложений':'No offers'}</span>`}</div>`:''}`;
            
            return`<tr><td style="white-space:nowrap">${idx+1}</td><td>${header}${editPanel}</td><td>${collapsed?`<div class="inline" style="gap:8px">${statusSummary.join('')}</div>`:`<div class="offer-list">${itemsHtml}</div>`}</td></tr>`;
        }).join('');
        
        $('#tblOffers tbody').innerHTML=rows||`<tr><td colspan="3" class="muted">${t('NO_OFFERS_YET')}</td></tr>`;
        
        // Add event listeners for window headers
        document.querySelectorAll('.offer-group-header').forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const windowId = parseInt(this.getAttribute('data-window-id'));

                toggleOfferWindowCollapse(windowId);
            });
        });
        
        // Add event listeners for slot selection checkboxes
        document.querySelectorAll('.slot-check-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.closest('.slot-check-item');
                if (this.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            });
            
            // Also handle click on the label
            const label = checkbox.closest('.slot-check-item');
            if (label) {
                label.addEventListener('click', function(e) {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });
            }
        });
    }
    function blockMinutesForSlot(slot,professorId){const t=new Date(slot.timeslot).getTime();if(!t||!Number.isNaN(t)===false) return 25;const candidates=state.windows.filter(w=>{const a=new Date(w.start_ts).getTime(),b=new Date(w.end_ts).getTime();return Number.isFinite(a)&&Number.isFinite(b)&&t>=a&&t<b});let win=candidates.find(w=>state.offers.some(o=>o.window_id===w.id&&o.professor_id===professorId&&['offered','accepted','finalized','change_requested'].includes(o.status)));if(!win) win=candidates[0];return win?(Number(win.defense_minutes||0)+Number(win.buffer_minutes||0)||25):25}
    // Global variable to store the current professor overview filter
    let professorOverviewFilter = '';
    
    function filterProfessorOverview(query) {
        professorOverviewFilter = query;
        renderProfessorList();
    }
    
    function renderProfessorList(){
        const list = $('#profList');
        const profs = state.users.filter(u => u.role === 'professor').map(p => {
            const mine = state.slots.filter(s => s.userid === p.id);
            const total = mine.length, approved = mine.filter(m => m.status_text === 'Approved').length;
            const ratio = total ? Math.round(100 * approved / total) : 0;
            const next = mine.length ? mine.map(s => +new Date(s.timeslot)).sort((a, b) => a - b)[0] : null;
            return { id: p.id, name: p.fullname, total, approved, ratio, next };
        }).sort((a, b) => a.name.localeCompare(b.name));
        
        // Apply filter if set
        const filteredProfs = profs.filter(p => {
            if (!professorOverviewFilter) return true;
            const query = professorOverviewFilter.toLowerCase();
            return p.name.toLowerCase().includes(query) || 
                   String(p.id).includes(query) || 
                   String(p.total).includes(query) ||
                   String(p.ratio).includes(query);
        });
        
        list.innerHTML = filteredProfs.map(x => 
            `<div class="prof-item" onclick="focusProfessor(${x.id}); this.parentNode.querySelectorAll('.prof-item').forEach(n=>n.classList.remove('active')); this.classList.add('active')">
                <div>
                    <b>${escapeHtml(x.name)}</b><br>
                    <small>${x.total} ${LANG==='ru'?'слотов':'slot(s)'}${x.next?' · '+(LANG==='ru'?'ближайший ':'next ')+new Date(x.next).toLocaleDateString():''}</small>
                </div>
                <span class="ratio">${x.ratio}%</span>
            </div>`
        ).join('') || `<div class="muted" style="padding:10px">${LANG==='ru'?'Пока нет профессоров.':'No professors yet.'}</div>`;
        
        if (filteredProfs.length && !$('#topology').dataset.hasSelection) {
            focusProfessor(filteredProfs[0].id);
            const first = list.querySelector('.prof-item');
            first && first.classList.add('active');
        }
    }
    function focusProfessor(pid){focusedProfessorId=pid;const prof=state.users.find(u=>u.id===pid);const mine=state.slots.filter(s=>s.userid===pid).sort((a,b)=>new Date(a.timeslot)-new Date(b.timeslot));const approved=mine.filter(s=>s.status_text==='Approved').length;$('#topoTitle').textContent=`${LANG==='ru'?'Топология':'Topology'} · ${prof?.fullname??('ID '+pid)}`;$('#topoMeta').textContent=`${mine.length} ${LANG==='ru'?'слотов':'slot(s)'} • ${LANG==='ru'?'утверждено':'approved'} ${approved}/${mine.length}`;const svg=document.getElementById('topology');svg.innerHTML='';svg.dataset.hasSelection='1';const box=svg.getBoundingClientRect();const W=Math.max(560,Math.floor(box.width||900));const H=Math.max(360,Math.floor(W*0.4));svg.setAttribute('viewBox',`0 0 ${W} ${H}`);const PAD=36,nodeR=9,cx=W/2,cy=H/2+20;const centerR=Math.min(120,Math.max(48,42+mine.length*4));const maxRx=W/2-PAD-centerR-nodeR-4;const maxRy=H/2-PAD-nodeR-6;const rx=Math.max(120,Math.min(maxRx,150+mine.length*14));const ry=Math.max(100,Math.min(maxRy,120+mine.length*12));const NS=n=>document.createElementNS('http://www.w3.org/2000/svg',n);const circle=(x,y,r,f,st,sw)=>{const c=NS('circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',r);c.setAttribute('fill',f);c.setAttribute('stroke',st);c.setAttribute('stroke-width',sw);return c};const text=(x,y,str,fill='#e5e7eb',size=12,weight=400,anchor='start')=>{const t=NS('text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill',fill);t.setAttribute('font-size',size);t.setAttribute('font-weight',weight);t.setAttribute('text-anchor',anchor);t.textContent=str;return t};const line=(x1,y1,x2,y2,stroke='#1b3a51',sw=1)=>{const l=NS('line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',stroke);l.setAttribute('stroke-width',sw);return l};const arcD=(cx,cy,rx,ry,sd,ed)=>{const toRad=d=>d*Math.PI/180;const s=toRad(sd),e=toRad(ed);const x1=cx+rx*Math.cos(s),y1=cy+ry*Math.sin(s);const x2=cx+rx*Math.cos(e),y2=cy+ry*Math.sin(e);const large=(Math.abs(ed-sd)%360)>180?1:0;const sweep=ed>sd?1:0;return`M ${x1} ${y1} A ${rx} ${ry} 0 ${large} ${sweep} ${x2} ${y2}`};const pathArc=(cx,cy,rx,ry,startDeg,endDeg,stroke='#1f4f67',sw=1.6)=>{const p=NS('path');p.setAttribute('d',arcD(cx,cy,rx,ry,startDeg,endDeg));p.setAttribute('fill','none');p.setAttribute('stroke',stroke);p.setAttribute('stroke-width',sw);return p};const center=circle(cx,cy,centerR,'#06b6d433','#06b6d4',4);const lbl1=text(cx,cy-4,prof?.fullname??('ID '+pid),'#e5e7eb',16,800,'middle');const lbl2=text(cx,cy+18,`${mine.length} ${LANG==='ru'?'слотов':'slot(s)'}`,'#9dc2d8',12,400,'middle');svg.append(center,lbl1,lbl2);svg.append(pathArc(cx,cy,rx,ry,200,-20));mine.forEach((s,i)=>{const t=i/(mine.length-1||1);const theta=Math.PI*(1-t);const x=cx-rx*Math.cos(theta);const y=cy-ry*Math.sin(theta)-6;const ln=line(cx,cy-centerR+2,x,y);svg.append(ln);const ok=s.status_text==='Approved';const blockMin=blockMinutesForSlot(s,pid);const endTs=new Date(s.timeslot).getTime()+blockMin*60000;const now=Date.now();const fillCol=ok?(now>=endTs?'#64748b':'var(--g)'):'#f59e0b';const node=circle(x,y,nodeR,fillCol,'var(--card)',2);svg.append(node);const tl=text(x,y-16,new Date(s.timeslot).toLocaleString(),'#e5e7eb',10,400,'middle');tl.setAttribute('opacity','0');svg.append(tl);node.addEventListener('mouseenter',()=>tl.setAttribute('opacity','1'));node.addEventListener('mouseleave',()=>tl.setAttribute('opacity','0'))});const first=mine[0],last=mine[mine.length-1];if(first) svg.append(text(cx-rx,cy-ry-14,new Date(first.timeslot).toLocaleString(),'#9dc2d8',11));if(last) svg.append(text(cx+rx,cy-ry-14,new Date(last.timeslot).toLocaleString(),'#9dc2d8',11,400,'end'))}
    function populate(sel,items){const el=document.querySelector(sel);if(!el) return;el.innerHTML=items.map(i=>`<option value="${i.value}">${escapeHtml(i.label)}</option>`).join('')}
    const tip=$('#tip')
    function showTip(x,y,html){if(!html){tip.style.opacity=0;return}tip.innerHTML=html;tip.style.left=x+'px';tip.style.top=y+'px';tip.style.opacity=1}
    function hideTip(){tip.style.opacity=0}
    function fitCanvas(c){const dpr=window.devicePixelRatio||1;const rect=c.getBoundingClientRect();c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return ctx}
    let collapsedPolls=new Set()

    function addPollOption(val=''){
        const box=$('#pollOptionsBox')
        const row=document.createElement('div')
        row.className='poll-opt'
        row.innerHTML=`<input class="inp poll-opt-input" placeholder="Option" value="${escapeHtml(val)}"><button class="mini danger" onclick="removePollOption(this)">×</button>`
        box.appendChild(row)
    }
    function removePollOption(btn){
        const row=btn.closest('.poll-opt')
        const box=$('#pollOptionsBox')
        if(box.querySelectorAll('.poll-opt').length<=2) return
        row.remove()
    }
    async function createPoll(e){
        e?.preventDefault?.();
        const title = ($('#pollTitle').value || '').trim();
        const description = ($('#pollDesc').value || '').trim();
        const allow_multi = $('#pollType').value === 'multiple';
        const require_names = $('#pollRequireNames').checked;
        const options = Array.from(document.querySelectorAll('.poll-opt-input'))
            .map(i => (i.value || '').trim())
            .filter(s => s.length > 0);

        const msg = $('#pollCreateMsg');
        msg.textContent = '';
        if (!title) { msg.textContent = (LANG==='ru'?'Введите заголовок.':'Please enter a title.'); return; }
        if (options.length < 2) { msg.textContent = (LANG==='ru'?'Минимум 2 варианта.':'At least two options.'); return; }

        try{
            const res = await jfetch(API+'?action=create_poll', {
                method:'POST',
                body: JSON.stringify({ title, description, allow_multi, require_names, options })
            });
            msg.textContent = (LANG==='ru'?'Опрос создан.':'Poll created.');
            $('#pollTitle').value = ''; $('#pollDesc').value = '';
            document.querySelectorAll('.poll-opt-input').forEach((i,idx)=>{ i.value = idx < 2 ? '' : i.closest('.poll-opt')?.remove(); });
            await refreshPolls();
        }catch(err){
            msg.textContent = err.message || 'Error';
            toast(err.message || 'Error creating poll','error');
        }
    }
    async function refreshPolls(){
        state.polls=await jfetch(API+'?action=polls')
        collapsedPolls=new Set(state.polls.map(p=>p.id))
        renderPolls()
    }
    function renderPolls(){
        const box=$('#pollList'); if(!box) return
        const q=($('#pollSearch')?.value||'').trim().toLowerCase()
        const rows=state.polls.filter(p=>{
            if(!q) return true
            return p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q)
        })


        if(rows.length===0){box.innerHTML=`<div class="muted">${t('NO_POLLS')}</div>`;return}
        box.innerHTML=rows.map(p=>{
            const total=p.options.reduce((a,b)=>a+Number(b.votes||0),0)
            const chips=`<div class="poll-meta"><span class="poll-chip">${new Date(p.created_at).toLocaleString()}</span><span class="poll-chip">${escapeHtml(p.author||'')}</span><span class="poll-chip">${p.allow_multi?(LANG==='ru'?'множественный выбор':'multiple select'):(LANG==='ru'?'один выбор':'single select')}</span><span class="poll-chip">${t('TOTAL_VOTES')}: ${total}</span></div>`
            const caret=`<span class="caret ${collapsedPolls.has(p.id)?'':'rot'}">▶</span>`
            const header=`<div class="poll-item-header" onclick="togglePoll(${p.id})"><div><strong>${escapeHtml(p.title)}</strong><div class="muted" style="margin-top:2px">${escapeHtml(p.description||'')}</div><div style="margin-top:6px">${chips}</div></div><div class="inline"><button class="mini danger" onclick="deletePoll(${p.id});event.stopPropagation()">${t('BTN_DELETE_POLL')}</button><span class="muted">${t('EXPAND_HINT')}</span>${caret}</div></div>`
            const table=`<div class="poll-table" style="margin-top:10px"><table><thead><tr><th>${t('ANSWER_OPTIONS')}</th><th>${t('TOTAL_VOTES')}</th></tr></thead><tbody>${p.options.map(o=>`<tr><td>${escapeHtml(o.label)}</td><td>${o.votes}</td></tr>`).join('')}</tbody></table></div>`
            const canvas=`<div class="card chart-card" style="margin-top:10px"><canvas id="pollPie_${p.id}" aria-label="Poll pie" role="img"></canvas></div>`
            return `<div class="poll-item" id="poll_${p.id}">${header}<div class="poll-item-body ${collapsedPolls.has(p.id)?'':'open'}">${table}${canvas}</div></div>`
        }).join('')
        rows.forEach(p=>{ if(!collapsedPolls.has(p.id)) drawPollPie(p) })
    }
    function togglePoll(id){
        if(collapsedPolls.has(id)) collapsedPolls.delete(id); else collapsedPolls.add(id)
        renderPolls()
    }
    async function deletePoll(id){
        const ok=await confirmDialog(LANG==='ru'?'Удалить опрос?':'Delete this poll?')
        if(!ok) return
        try{
            await jfetch(API+'?action=delete_poll',{method:'POST',body:JSON.stringify({poll_id:id})})
            await refreshPolls()
            toast(LANG==='ru'?'Опрос удалён':'Poll deleted','ok')
        }catch(err){toast(err.message||'Error','error')}
    }

    async function deletePollOption(pid, oid){
        if (!confirm('Delete this option (its votes will be removed)?')) return;
        try{
            await apiPost('delete_poll_option', { poll_id: pid, option_id: oid });
            toast('Option deleted');
            if (typeof togglePollDetails === 'function') await togglePollDetails(pid); // refresh expanded view
        }catch(e){
            toast('Failed to delete option: ' + (e.message||e), false);

        }
    }

    // small helper for the professor-matrix search box beside the pie
    function filterMatrix(pid){
        const q = (document.getElementById('pmq_'+pid)?.value || '').toLowerCase();
        document.querySelectorAll('#pm_body_'+pid+' .pm-row').forEach(r=>{
            const name = (r.getAttribute('data-name')||'').toLowerCase();
            r.style.display = !q || name.includes(q) ? '' : 'none';
        });
    }
    function drawPollPie(p){
        const c=document.getElementById('pollPie_'+p.id); if(!c) return
        const ctx=fitCanvas(c); const rect=c.getBoundingClientRect(); const W=rect.width,H=rect.height
        ctx.clearRect(0,0,W,H)
        const data=p.options.map(o=>({label:o.label,value:Number(o.votes||0)})).filter(d=>d.value>0)
        const total=data.reduce((a,b)=>a+b.value,0)
        const cx=W/2,cy=H/2,R=Math.min(W,H)*0.36,r=R*0.58
        const palette=['#06b6d4','#22c55e','#f59e0b','#60a5fa','#fb7185','#a78bfa','#34d399','#fde047','#f97316','#10b981','#93c5fd']
        const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#0d2231');grd.addColorStop(1,'#091a29')
        ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.arc(cx,cy,r,0,Math.PI*2,true);ctx.closePath();ctx.fillStyle=grd;ctx.fill()
        if(total===0){ctx.fillStyle='#e6edf5';ctx.font='700 16px system-ui';ctx.textAlign='center';ctx.fillText(t('NO_POLLS'),cx,cy+6);return}
        let start=-Math.PI/2; const arcs=[]
        data.forEach((d,i)=>{const ang=(d.value/total)*Math.PI*2;const end=start+ang;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,start,end);ctx.lineTo(cx+r*Math.cos(end),cy+r*Math.sin(end));ctx.arc(cx,cy,r,end,start,true);ctx.closePath();ctx.fillStyle=palette[i%palette.length];ctx.globalAlpha=.95;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#06111a';ctx.lineWidth=1;ctx.stroke();arcs.push({label:d.label,start,end,value:d.value,color:palette[i%palette.length]});start=end})
        
        // Draw colored labels
        const labelY = cy + R + 20;
        const labelSpacing = 20;
        const labelStartX = cx - (data.length * labelSpacing) / 2;
        
        data.forEach((d, i) => {
            const x = labelStartX + i * labelSpacing;
            const y = labelY;
            
            // Draw colored circle
            ctx.beginPath();
            ctx.arc(x - 8, y - 4, 4, 0, Math.PI * 2);
            ctx.fillStyle = palette[i % palette.length];
            ctx.fill();
            
            // Draw label text
            ctx.fillStyle = '#e6edf5';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'left';
            ctx.fillText(d.label, x, y);
        });
        c.onmousemove=ev=>{
            const rect=c.getBoundingClientRect();const x=ev.clientX-rect.left,y=ev.clientY-rect.top
            const dx=x-cx,dy=y-cy;const dist=Math.hypot(dx,dy)
            if(dist<r||dist>R){hideTip();return}
            let ang=Math.atan2(dy,dx);if(ang<-Math.PI/2) ang+=Math.PI*2
            let found=null;arcs.forEach(a=>{if(ang>=a.start&&ang<=a.end) found=a})
            if(found){const pct=((found.value/total)*100).toFixed(1)+'%';showTip(ev.clientX,ev.clientY,`<b style="color:${found.color}">${escapeHtml(found.label)}</b><br>${found.value} · ${pct}`)}else hideTip()
        }
        c.onmouseleave=hideTip
    }
    function renderCharts(){renderDonut();renderOfferBars()}
    function renderDonut(){
        const c=$('#chartDonut');
        if(!c) return;
        const ctx=fitCanvas(c);
        const rect=c.getBoundingClientRect();
        const W=rect.width,H=rect.height;
        const titleHeight = 40; // Account for title and "Total offers" text
        const cx=W/2,cy=(H-titleHeight)/2+titleHeight,R=Math.min(W,H)*0.36,r=R*0.58;
        
        const counts=groupCount(state.offers,o=>o.status);
        const accepted=(counts.get('accepted')||0)+(counts.get('finalized')||0);
        const pending=(counts.get('offered')||0)+(counts.get('change_requested')||0);
        const rejected=(counts.get('rejected')||0);
        
        const data=[
            {k:(LANG==='ru'?'Принято':'Accepted'),v:accepted,col:'#22c55e'},
            {k:(LANG==='ru'?'В ожидании':'Pending'),v:pending,col:'#f59e0b'},
            {k:(LANG==='ru'?'Отклонено':'Rejected'),v:rejected,col:'#ef4444'}
        ].filter(d=>d.v>0);
        
        const total=data.reduce((a,b)=>a+b.v,0);
        
        // Background gradient
        const grd=ctx.createLinearGradient(0,0,0,H);
        grd.addColorStop(0,'#0d2231');
        grd.addColorStop(1,'#091a29');
        
        ctx.clearRect(0,0,W,H);
        
        // Total offers text
        ctx.fillStyle='#a4bed6';
        ctx.font='12px system-ui, -apple-system, Segoe UI';
        ctx.fillText(`${t('TOTAL_OFFERS')}: `+(state.offers.length||0),10,18);
        
        // Draw background donut
        ctx.beginPath();
        ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.arc(cx,cy,r,0,Math.PI*2,true);
        ctx.closePath();
        ctx.fillStyle=grd;
        ctx.fill();
        
        if(!total){
            ctx.fillStyle='#e6edf5';
            ctx.font='700 18px system-ui';
            ctx.textAlign='center';
            ctx.fillText(t('NO_OFFERS_YET'),cx,cy+6);
            c.onmousemove=null;
            c.onmouseleave=null;
            return;
        }
        
        let start=-Math.PI/2;
        const arcs=[];
        
        // Draw segments
        data.forEach(d=>{
            const ang=(d.v/total)*Math.PI*2;
            const end=start+ang;
            
            ctx.beginPath();
            ctx.moveTo(cx,cy);
            ctx.arc(cx,cy,R,start,end);
            ctx.lineTo(cx+r*Math.cos(end),cy+r*Math.sin(end));
            ctx.arc(cx,cy,r,end,start,true);
            ctx.closePath();
            ctx.fillStyle=d.col;
            ctx.globalAlpha=.9;
            ctx.fill();
            ctx.globalAlpha=1;
            ctx.strokeStyle='#06111a';
            ctx.lineWidth=1;
            ctx.stroke();
            
            arcs.push({label:d.k,start,end,color:d.col,value:d.v});
            start=end;
        });
        
        // Draw labels with better positioning to avoid overlap
        const labelPositions = [];
        let currentStart = -Math.PI/2;
        data.forEach((d,i)=>{
            const midAngle = currentStart + (d.v/total)*Math.PI/2;
            const labelRadius = R + 30;
            let labelX = cx + Math.cos(midAngle)*labelRadius;
            let labelY = cy + Math.sin(midAngle)*labelRadius;
            
            // Adjust position to avoid overlap
            const labelText = d.k;
            ctx.font = '12px system-ui';
            const labelWidth = ctx.measureText(labelText).width;
            const labelHeight = 16;
            const labelPadding = 6;
            const totalLabelHeight = labelHeight + labelPadding*2 + 12; // +12 for percentage
            
            // Check for overlap with existing labels
            let adjustedY = labelY;
            let attempts = 0;
            while (attempts < 10) {
                let hasOverlap = false;
                for (const pos of labelPositions) {
                    const distance = Math.abs(adjustedY - pos.y);
                    if (distance < totalLabelHeight) {
                        hasOverlap = true;
                        break;
                    }
                }
                if (!hasOverlap) break;
                adjustedY += totalLabelHeight * 0.8;
                attempts++;
            }
            
            labelPositions.push({x: labelX, y: adjustedY, width: labelWidth, height: totalLabelHeight});
            
            // Draw label background
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(
                labelX - labelWidth/2 - labelPadding,
                adjustedY - labelHeight/2 - labelPadding,
                labelWidth + labelPadding*2,
                labelHeight + labelPadding*2
            );
            
            // Draw label text
            ctx.fillStyle = d.col;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, labelX, adjustedY);
            
            // Draw percentage
            const pctText = ((d.v/total)*100).toFixed(1)+'%';
            ctx.font = '10px system-ui';
            ctx.fillStyle = '#e6edf5';
            ctx.fillText(pctText, labelX, adjustedY + labelHeight/2 + 8);
            
            currentStart += (d.v/total)*Math.PI*2;
        });
        
        // Mouse interaction
        c.onmousemove=ev=>{
            const rect=c.getBoundingClientRect();
            const x=ev.clientX-rect.left,y=ev.clientY-rect.top;
            const dx=x-cx,dy=y-cy;
            const dist=Math.hypot(dx,dy);
            if(dist<r||dist>R){
                hideTip();
                return;
            }
            let ang=Math.atan2(dy,dx);
            if(ang<-Math.PI/2) ang+=Math.PI*2;
            let found=null;
            arcs.forEach(a=>{
                if(ang>=a.start&&ang<=a.end) found=a;
            });
            if(found){
                const pct=((found.value/total)*100).toFixed(1)+'%';
                showTip(ev.clientX,ev.clientY,`<b style="color:${found.color}">${escapeHtml(found.label)}</b><br>${found.value} · ${pct}`);
            }else hideTip();
        };
        c.onmouseleave=hideTip;
    }
    function renderOfferBars(){
        const c=$('#chartSpark');
        if(!c) return;
        const ctx=fitCanvas(c);
        const rect=c.getBoundingClientRect();
        let W=rect.width,H=rect.height;
        
        ctx.clearRect(0,0,W,H);
        
        // Use filtered data if available, otherwise get all data
        let rows;
        if (filteredWindows) {
            rows = filteredWindows;
        } else {
        const include=new Set(['finalized']);
            const perWindow=new Map();
            
            // Initialize all windows with 0 professors
            state.windows.forEach(w => {
                perWindow.set(w.id, 0);
            });
            
            // Count finalized offers per window
        state.offers.forEach(o=>{
            if(!include.has(o.status)) return;
                perWindow.set(o.window_id,(perWindow.get(o.window_id)||0)+1);
            });
            
            rows=Array.from(perWindow.entries()).map(([wid,cnt])=>{
                const window=state.windows.find(x=>x.id===wid);
                const name = window?.title || `Window ${wid}`;
                return{wid,cnt,name,start_ts: window?.start_ts};
            }).sort((a,b)=>new Date(b.start_ts || 0) - new Date(a.start_ts || 0));
        }
        
        if(rows.length===0){
            ctx.fillStyle='#e6edf5';
            ctx.font='700 18px system-ui';
            ctx.textAlign='center';
            ctx.fillText(LANG==='ru'?'Нет окон для отображения':'No windows to display',W/2,H/2);
            c.onmousemove=null;
            c.onmouseleave=null;
            return;
        }
        
        const barH=32;
        const gap=6;
        const PADT=35;
        const PADB=24;
        
        // Calculate dynamic left padding based on the longest window name
        ctx.font='bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
        const maxNameWidth = Math.max(...rows.map(r => ctx.measureText(r.name).width));
        const PADL = Math.max(200, maxNameWidth + 40); // Minimum 200px, or name width + 40px padding
        const PADR=20;
        
        const totalHeight=PADT+PADB+(rows.length*(barH+gap));
        c.height=Math.max(350,totalHeight);
        
        // Adjust canvas width if needed to accommodate long names
        const minWidth = PADL + 200; // PADL + minimum chart area
        if (W < minWidth) {
            c.style.width = minWidth + 'px';
            W = minWidth;
        }
        
        const maxV=Math.max(1,...rows.map(r=>r.cnt));
        
        // X-axis line
        ctx.strokeStyle='#0e2839';
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(PADL,H-PADB);
        ctx.lineTo(W-PADR,H-PADB);
        ctx.stroke();
        
        // X-axis ticks (number of professors)
        const ticks=Math.min(5,maxV);
        ctx.fillStyle='#6b8ba4';
        ctx.font='11px system-ui';
        for(let i=0;i<=ticks;i++){
            const v=Math.round(i*maxV/ticks);
            const x=PADL+(v/maxV)*(W-PADL-PADR);
            ctx.strokeStyle='#0c2333';
            ctx.beginPath();
            ctx.moveTo(x,PADT);
            ctx.lineTo(x,H-PADB);
            ctx.stroke();
            ctx.textAlign='center';
            ctx.fillText(String(v),x,H-PADB+14);
        }
        
        // Draw horizontal bars for each window
        rows.forEach((r,i)=>{
            const y=PADT+i*(barH+gap);
            const w=(r.cnt/maxV)*(W-PADL-PADR);
            const grad=ctx.createLinearGradient(PADL,y,PADL,y+barH);
            grad.addColorStop(0,'#22d3ee88');
            grad.addColorStop(1,'#22d3ee44');
            ctx.fillStyle=grad;
            ctx.fillRect(PADL,y,w,barH);
            
            // Window name on the left (Y-axis)
            ctx.fillStyle='#ffffff';
            ctx.font='bold 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign='right';
            ctx.fillText(`${r.name}`,PADL-15,y+barH-8);
            
            // Number of professors on the right of the bar
            ctx.fillStyle='#cde7ff';
            ctx.font='14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign='left';
            ctx.fillText(r.cnt.toString(),PADL+w+8,y+barH-8);
        });
        
        // Mouse interaction
        c.onmousemove=ev=>{
            const rct=c.getBoundingClientRect();
            const mx=ev.clientX-rct.left,my=ev.clientY-rct.top;
            if(mx<PADL||mx>W-PADR||my<PADT||my>H-PADB){
                hideTip();
                return;
            }
            const idx=Math.floor((my-PADT)/(barH+gap));
            const row=rows[idx];
            if(!row){
                hideTip();
                return;
            }
            showTip(ev.clientX,ev.clientY,`<b>${escapeHtml(row.name)}</b><br>${row.cnt} ${LANG==='ru'?'профессоров':'professors'}`);
        };
        c.onmouseleave=hideTip;
    }
    
    // Global variable to store filtered window data
    let filteredWindows = null;
    
    function filterWindows(searchTerm) {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // If no search term, show all windows
        if (!searchTerm) {
            filteredWindows = null;
            renderOfferBars();
            return;
        }
        
        // Filter windows based on search term
        const include = new Set(['finalized']);
        const perWindow = new Map();
        
        // Initialize all matching windows with 0 professors
        state.windows.forEach(w => {
            if (w.title && w.title.toLowerCase().includes(searchLower)) {
                perWindow.set(w.id, 0);
            }
        });
        
        // Count finalized offers per matching window
        state.offers.forEach(o => {
            if (!include.has(o.status)) return;
            const window = state.windows.find(x => x.id === o.window_id);
            if (window && window.title && window.title.toLowerCase().includes(searchLower)) {
                perWindow.set(o.window_id, (perWindow.get(o.window_id) || 0) + 1);
            }
        });
        
        // Store filtered data
        filteredWindows = Array.from(perWindow.entries()).map(([wid, cnt]) => {
            const window = state.windows.find(x => x.id === wid);
            const name = window?.title || `Window ${wid}`;
            return { wid, cnt, name, start_ts: window?.start_ts };
        }).sort((a, b) => new Date(b.start_ts || 0) - new Date(a.start_ts || 0));
        
        renderOfferBars();
    }
    
    setInterval(()=>{if(focusedProfessorId) focusProfessor(focusedProfessorId)},60000)
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&focusedProfessorId) focusProfessor(focusedProfessorId)})
    function copyToClipboard(text){if(!text) return;navigator.clipboard?.writeText(text).then(()=>toast('Token copied')).catch(()=>{})}
    function dtpFormat(d){return toLocalInputValue(d)}
    function toggleCalBtn(id,disabled){const btn=document.querySelector(`.calbtn[data-for="${id}"]`);if(btn){btn.disabled=disabled}}
    function makePicker(input){
        // Prevent multiple calendars from being created
        if (window.__activeCalendar__) {
            window.__activeCalendar__.close();
        }
        
        const shadow=document.createElement('div');shadow.className='dtp-shadow';const pop=document.createElement('div');pop.className='dtp';let cur=new Date();let sel=null;try{const v=input.value&&new Date(input.value);if(v&&v.getTime()) cur=new Date(v),sel=new Date(v)}catch{}const h=sel?sel.getHours():cur.getHours();const m=sel?sel.getMinutes():Math.round(cur.getMinutes()/5)*5;function atStart(d){const t=new Date(d);t.setHours(0,0,0,0);return t}function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}function render(){pop.innerHTML='';const head=document.createElement('div');head.className='dtp-header';const prev=document.createElement('button');prev.className='dtp-hbtn';prev.innerHTML='‹';prev.onclick=(e)=>{e.stopPropagation();cur.setMonth(cur.getMonth()-1);render()};const next=document.createElement('button');next.className='dtp-hbtn';next.innerHTML='›';next.onclick=(e)=>{e.stopPropagation();cur.setMonth(cur.getMonth()+1);render()};const title=document.createElement('div');title.className='dtp-month';title.textContent=cur.toLocaleDateString(undefined,{month:'long',year:'numeric'});head.append(prev,title,next);const week=document.createElement('div');week.className='dtp-week';const wds=[0,1,2,3,4,5,6].map(i=>new Date(2020,5,i+1).toLocaleDateString(undefined,{weekday:'short'}));wds.forEach(w=>{const s=document.createElement('span');s.textContent=w;week.appendChild(s)});const grid=document.createElement('div');grid.className='dtp-grid';const first=new Date(cur.getFullYear(),cur.getMonth(),1);const fd=(first.getDay()+7)%7;const start=new Date(first);start.setDate(first.getDate()-fd);for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const btn=document.createElement('button');btn.type='button';btn.className='dtp-day';if(d.getMonth()!==cur.getMonth()) btn.classList.add('out');if(sel&&sameDay(d,sel)) btn.classList.add('sel');btn.textContent=String(d.getDate());btn.onclick=(e)=>{e.stopPropagation();sel=new Date(d.getFullYear(),d.getMonth(),d.getDate(),hh.value.padStart(2,'0'),mm.value.padStart(2,'0'));render()};grid.appendChild(btn)}const time=document.createElement('div');time.className='dtp-time';const hh=document.createElement('input');hh.className='inp';hh.type='number';hh.min='0';hh.max='23';hh.value=String(h).padStart(2,'0');const colon=document.createElement('span');colon.textContent=':';const mm=document.createElement('input');mm.className='inp';mm.type='number';mm.min='0';mm.max='59';mm.step='1';mm.value=String(m).padStart(2,'0');const nowB=document.createElement('button');nowB.className='mini';nowB.textContent='Now';nowB.onclick=(e)=>{e.stopPropagation();const n=new Date();cur=new Date(n);sel=new Date(n);hh.value=String(n.getHours()).padStart(2,'0');mm.value=String(n.getMinutes()).padStart(2,'0')};time.append(hh,colon,mm,nowB);const actions=document.createElement('div');actions.className='dtp-actions';const clr=document.createElement('button');clr.className='mini';clr.textContent='Clear';clr.onclick=(e)=>{e.stopPropagation();input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));close()};const ok=document.createElement('button');ok.className='mini success';ok.textContent='OK';ok.onclick=(e)=>{e.stopPropagation();if(!sel) sel=new Date(cur.getFullYear(),cur.getMonth(),cur.getDate(),+hh.value,+mm.value);sel.setHours(+hh.value,+mm.value,0,0);input.value=dtpFormat(sel);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));close()};const cancel=document.createElement('button');cancel.className='mini';cancel.textContent='Cancel';cancel.onclick=(e)=>{e.stopPropagation();close()};actions.append(clr,cancel,ok);pop.append(head,week,grid,time,actions)}function place(){const r=input.getBoundingClientRect();const W=320;const H=356;const vw=window.innerWidth;const vh=window.innerHeight;let left=r.left,top=r.bottom+6;if(top+H>vh) top=r.top-H-6;if(left+W>vw) left=vw-W-8;if(left<8) left=8;if(top<8) top=8;pop.style.left=left+'px';pop.style.top=top+'px'}function close(){document.body.removeChild(pop);document.body.removeChild(shadow);document.removeEventListener('keydown',onKey);window.__activeCalendar__=null}function onKey(e){if(e.key==='Escape') close()}shadow.addEventListener('click',(e)=>{if(e.target===shadow)close()});document.body.appendChild(shadow);document.body.appendChild(pop);window.__activeCalendar__={close};render();place();setTimeout(()=>document.addEventListener('keydown',onKey),0)}
    function initPickers(){
        // Prevent duplicate initialization
        if (window.__pickersInitialized__) return;
        window.__pickersInitialized__ = true;
        
                 document.querySelectorAll('.calbtn').forEach(btn=>{
             // Skip custom timeslot buttons as they have their own handlers
             if (btn.closest('.custom-timeslot-opt')) return;
             
             // Remove existing listeners to prevent duplicates
             btn.removeEventListener('click', btn._initClickHandler);
             btn._initClickHandler = e => {
                 const id=btn.getAttribute('data-for');
                 const input=document.getElementById(id);
                 if(!input||input.disabled) return;
                 makePicker(input);
             };
             btn.addEventListener('click', btn._initClickHandler);
         });
        
                 document.querySelectorAll('.dtp-input').forEach(inp=>{
             // Skip custom timeslot inputs as they have their own handlers
             if (inp.closest('.custom-timeslot-opt')) return;
             
             // Remove existing listeners to prevent duplicates
             inp.removeEventListener('focus', inp._initFocusHandler);
             inp._initFocusHandler = e => {
                 const btn=document.querySelector(`.calbtn[data-for="${inp.id}"]`);
                 if(inp.disabled) return;
                 makePicker(inp);
             };
             inp.addEventListener('focus', inp._initFocusHandler);
         });
        
        $('#winManualEnd').addEventListener('change',e=>{const dis=!e.target.checked;$('#winEnd').disabled=dis;toggleCalBtn('winEnd',dis)});
        $('#ewinManualEnd').addEventListener('change',e=>{const dis=!e.target.checked;$('#ewinEnd').disabled=dis;toggleCalBtn('ewinEnd',dis)});
    }
    async function refreshPolls(){ state.polls = await jfetch(API+'?action=polls'); renderPolls(); renderNonVotingProfessors(); }

    function renderPolls(){
        const list = document.getElementById('pollList');
        if (!list) return;
        const q = (document.getElementById('pollSearch')?.value || '').trim().toLowerCase();
        const polls = (state.polls || []).filter(p => !q || (p.title||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
        if (!polls.length){ list.innerHTML = `<div class="muted">No polls yet</div>`; return; }
        list.innerHTML = polls.map(p => `
    <div class="poll-item" id="poll_${p.id}">
      <div class="poll-item-header" onclick="togglePollDetails(${p.id})" role="button" aria-expanded="false">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="poll-checkbox" value="${p.id}" onchange="handlePollSelection(this)" onclick="event.stopPropagation();" style="margin: 0;">
          <div>
            <div style="font-weight:800">${escapeHtml(p.title)}</div>
            <div class="muted" style="margin-top:2px">${escapeHtml(p.description || '')}</div>
          </div>
        </div>
        <div class="poll-meta">
          <span class="poll-chip">${p.allow_multi?'multiple':'single'}</span>
          ${p.mode?`<span class="poll-chip">${escapeHtml(p.mode)}</span>`:''}
          ${p.voters!=null?`<span class="poll-chip">${p.voters} voters</span>`:''}
          <button class="mini" title="Export this poll" onclick="event.stopPropagation(); exportSinglePoll(${p.id})" style="background: var(--g); color: white; border: none;">📊</button>
          <button class="mini danger" title="Delete poll" onclick="event.stopPropagation(); deletePoll(${p.id})">×</button>
        </div>
      </div>
      <div class="poll-item-body" id="poll_body_${p.id}">
        <div style="padding:10px" class="muted">Click to expand</div>
      </div>
    </div>`).join('');
        
        // Update export button state after rendering
        updateExportSelectedButton();
    }


    
    function getDayOfWeek(dateStr) {
        // Extract month and day from "May 10" format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const match = dateStr.match(/(\w+)\s+(\d+)/);
        if (match) {
            const [, month, day] = match;
            const monthIndex = monthNames.indexOf(month);
            if (monthIndex !== -1) {
                // Use current year to get day of week
                const currentYear = new Date().getFullYear();
                const date = new Date(currentYear, monthIndex, parseInt(day));
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return dayNames[date.getDay()];
            }
        }
        return '';
    }
    
    function parseTimeSlot(label) {
        console.log('parseTimeSlot called with label:', label);
        
        // Try to parse date-time format like "2025-09-01 08:00 - 2025-09-01 12:00" or "2025-09-01 08:00 - 2..."
        const dateTimeRegex = /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;
        let match = label.match(dateTimeRegex);
        
        // If that doesn't work, try the truncated format "2025-09-01 08:00 - 2..."
        if (!match) {
            const truncatedRegex = /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})\s*-\s*(\d{2})/;
            match = label.match(truncatedRegex);
        }
        
        if (match) {

            
            let year, month, day, startTime, endTime;
            
            // Check if we have the full format or truncated format
            if (match[5] && match[5].includes(':')) {
                // Full format: "2025-09-01 08:00 - 2025-09-01 12:00"
                [, year, month, day, startTime, endTime] = match;
            } else {
                // Truncated format: "2025-09-01 08:00 - 2..."
                [, year, month, day, startTime, endHour] = match;
                endTime = `${endHour}:00`; // Assume minutes are 00
            }
            
            const dateObj = new Date(year, month - 1, day);
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const monthName = monthNames[dateObj.getMonth()];
            
            const result = {
                date: `${monthName} ${parseInt(day)}`,
                time: `${startTime} - ${endTime}`,
                fullDate: `${monthName} ${parseInt(day)}`,
                cleanLabel: `${monthName} ${parseInt(day)} ${startTime} - ${endTime}`
            };
            
            console.log('parseTimeSlot result:', result);
            return result;
        }
        
        // Try to parse MM-DD format like "09-01 08:00 - 09-01 12:00"
        const mmddRegex = /(\d{2})-(\d{2})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;
        match = label.match(mmddRegex);
        
        if (match) {
            const [, month, day, startTime, endTime] = match;
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const monthName = monthNames[parseInt(month) - 1];
            
            const result = {
                date: `${monthName} ${parseInt(day)}`,
                time: `${startTime} - ${endTime}`,
                fullDate: `${monthName} ${parseInt(day)}`,
                cleanLabel: `${monthName} ${parseInt(day)} ${startTime} - ${endTime}`
            };
            console.log('parseTimeSlot MM-DD result:', result);
            return result;
        }
        
        // Fallback for other formats
        return {
            date: label.length > 20 ? label.substring(0, 20) + '...' : label,
            time: '',
            fullDate: label,
            cleanLabel: label
        };
    }

    function drawPie(canvas, segments, labels){
        if (!canvas) return;
        
        // Debug: log what we're receiving
        
        const ctx = canvas.getContext('2d');
        
        // Fixed size for perfect circle (no stretching)
        const size = 280; // Optimal size for circular chart
        canvas.width = size; 
        canvas.height = size;
        
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = (size * 0.4);
        const innerRadius = (size * 0.25);
        
        const total = segments.reduce((a,b)=>a+b,0) || 1;
        let start = -Math.PI/2;
        
        // Theme-matching color palette
        const colors = [
            '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', 
            '#8b5cf6', '#3b82f6', '#f97316', '#84cc16',
            '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
        ];
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw segments
        segments.forEach((val, i) => {
            if (val === 0) return; // Skip zero segments in chart
            
            const ang = (val/total)*Math.PI*2;
            const color = colors[i % colors.length];
            const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
            
            // Draw outer arc
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, outerRadius, start, start + ang);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Draw inner cutout for donut effect
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, innerRadius, start, start + ang);
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            // Add percentage text in the middle of each segment
            if (percentage > 0) {
                const midAngle = start + (ang / 2);
                const textRadius = (outerRadius + innerRadius) / 2;
                const textX = centerX + Math.cos(midAngle) * textRadius;
                const textY = centerY + Math.sin(midAngle) * textRadius;
                
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percentage}%`, textX, textY);
                ctx.restore();
            }
            
            start += ang;
        });
        
        // Add subtle border
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Create single column legend with color dots on left side
        const legend = document.createElement('div');
        legend.className = 'pie-legend';
        legend.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            background: rgba(11, 28, 42, 0.4);
            border-radius: 8px;
            border: 1px solid var(--line-2);
            justify-content: start;
            width: 200px;
            overflow: visible;
        `;
        
                // Show all options in legend, even those with 0 votes
        labels.forEach((lab, i) => {
            const votes = segments[i] || 0;
            const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
            const legendTimeInfo = parseTimeSlot(lab);
            const color = colors[i % colors.length];
            
                    // Debug: log the parsing results
            
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                border-radius: 6px;
                background: ${votes === 0 ? 'rgba(255,255,255,0.02)' : color + '20'};
                border: 1px solid ${votes === 0 ? 'rgba(255,255,255,0.1)' : color};
                opacity: ${votes === 0 ? 0.6 : 1};
                transition: all 0.3s ease;
                cursor: pointer;
                width: fit-content;
                min-width: 150px;
                max-width: 180px;
                height: auto;
                overflow: visible;
            `;
            
            // Add colored circle indicator on the left side
            const colorIndicator = document.createElement('div');
            colorIndicator.style.cssText = `
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: ${color};
                flex-shrink: 0;
            `;
            item.appendChild(colorIndicator);
            
            // Start date display (month and day with suffix)
            const dateDisplay = document.createElement('div');
            dateDisplay.style.cssText = `
                color: var(--ink);
                font-weight: 600;
                font-size: 9px;
                line-height: 1.1;
                white-space: nowrap;
                overflow: visible;
            `;
            dateDisplay.textContent = legendTimeInfo.date;
            
            // Time range display (start and end time)
            const timeDisplay = document.createElement('div');
            timeDisplay.style.cssText = `
                color: var(--ink);
                font-size: 8px;
                line-height: 1.1;
                white-space: nowrap;
                overflow: visible;
            `;
            timeDisplay.textContent = legendTimeInfo.time;
            
            item.appendChild(dateDisplay);
            item.appendChild(timeDisplay);
            legend.appendChild(item);
        });
        
        // Find the legend container
        const legendContainer = document.getElementById('legend_' + canvas.id.replace('pie_', ''));
        console.log('Legend container found:', legendContainer);
        console.log('Legend element created:', legend);
        
        if (legendContainer) {
            legendContainer.innerHTML = '';
            legendContainer.appendChild(legend);
            console.log('Legend appended to container');
        } else {
            // Fallback: try to find by poll ID
            const pollId = canvas.id.replace('pie_', '');
            const fallbackContainer = document.getElementById('legend_' + pollId);
            if (fallbackContainer) {
                fallbackContainer.innerHTML = '';
                fallbackContainer.appendChild(legend);
                console.log('Legend appended to fallback container');
            } else {
                // Last resort: append to canvas parent
            canvas.parentElement.querySelector('.pie-legend')?.remove();
            canvas.parentElement.appendChild(legend);
                console.log('Legend appended to canvas parent');
            }
        }
    }

    async function togglePollDetails(pid){
        const body = document.getElementById('poll_body_'+pid);
        const header = document.querySelector('#poll_'+pid+' .poll-item-header');
        const open = body.classList.contains('open');
        
        // Close all other open polls first
        document.querySelectorAll('.poll-item-body.open').forEach(otherBody => {
            if (otherBody !== body) {
                otherBody.classList.remove('open');
                const otherHeader = otherBody.parentElement.querySelector('.poll-item-header');
                otherHeader?.setAttribute('aria-expanded','false');
                otherBody.innerHTML = `<div style="padding:10px" class="muted">Click to expand</div>`;
            }
        });
        
        if (open){ body.classList.remove('open'); header?.setAttribute('aria-expanded','false'); body.innerHTML = `<div style="padding:10px" class="muted">Click to expand</div>`; return; }
        header?.setAttribute('aria-expanded','true'); body.classList.add('open'); body.innerHTML = `<div class="muted" style="padding:10px">Loading…</div>`;
        
        // Force fresh data by adding timestamp
        const res = await jfetch(API+`?action=poll_results&poll_id=${pid}&t=${Date.now()}&debug=1`);

        const options = res.options || [];
        const counts  = res.counts || {};
        const votersByOpt = res.voters_by_option || {};

        const labels = options.map(o => o.label);
        const segs   = options.map(o => counts[o.id] || 0);
        
        // Debug: log the labels to see what we're getting
        console.log('Raw labels from API:', labels);
        console.log('Labels after parseTimeSlot processing:');
        labels.forEach((label, index) => {
            const parsed = parseTimeSlot(label);
            console.log(`Label ${index}: "${label}" -> "${parsed.date} ${parsed.time}"`);
        });

        // Build a unique, sorted list of voters across all options
        const voterMap = new Map(); // key -> {id,name}
        options.forEach(o => {
            const list = votersByOpt[o.id] || votersByOpt[String(o.id)] || [];
            list.forEach(v => {
                const key = (v && v.id != null) ? `id:${v.id}` : `name:${v?.name||''}`;
                if (!voterMap.has(key)) {
                    voterMap.set(key, { id: v?.id ?? null, name: v?.name || (v?.id != null ? ('#'+v.id) : '') });
                }
            });
        });
        const voters = Array.from(voterMap.values()).sort((a,b)=>a.name.localeCompare(b.name));

        // Calculate responsive grid layout based on number of options
        const numOptions = options.length;
        const isWide = numOptions > 4;
        const gridClass = isWide ? 'poll-detail-grid-wide' : 'poll-detail-grid';
        
        // Calculate optimal column widths based on number of options and screen width
        const professorColWidth = 200;
        const availableWidth = window.innerWidth - 400; // Increased available width
        const minOptionWidth = Math.max(150, Math.min(200, Math.floor(availableWidth / Math.max(numOptions, 1))));
        const gridTemplate = `${professorColWidth}px repeat(${numOptions}, minmax(${minOptionWidth}px, 1fr))`;
        
        body.innerHTML = `
    <div class="poll-detail-single-column">
      <div class="poll-pie-wrap">
        <div style="text-align:center;margin-bottom:12px">
          <h3 style="margin:0;color:var(--ink);font-size:16px;font-weight:600">Vote Distribution</h3>
          <p style="margin:4px 0 0 0;color:var(--muted);font-size:12px">${voters.length} participant${voters.length !== 1 ? 's' : ''} • ${options.length} option${options.length !== 1 ? 's' : ''}</p>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:8px">
          <canvas id="pie_${pid}" aria-label="Results pie" style="width:280px;height:280px;flex-shrink:0;"></canvas>
          <div id="legend_${pid}" style="margin-top:0;width:200px;overflow:visible;"></div>
        </div>
      </div>
      <div class="poll-matrix" id="pm_${pid}">
        <div class="pm-tools">
          <div style="display:flex;align-items:center;gap:8px">
            <input class="inp pm-search" id="pmq_${pid}" placeholder="Search professor…" oninput="filterMatrix(${pid})">
            <span class="muted">${voters.length} participant${voters.length !== 1 ? 's' : ''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="muted">${options.length} option${options.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="pm-container">
          <div class="pm-head" style="grid-template-columns: ${gridTemplate}">
          <div class="pm-hcell">Professor</div>
            ${labels.map((l, index)=>{
              const timeInfo = parseTimeSlot(l);
              const colorIndex = index % 10; // Use modulo to cycle through colors
              return `<div class="pm-hcell" title="${escapeHtml(timeInfo.fullDate)}" style="border-left: 3px solid var(--chart-color-${colorIndex})">
                <div style="font-size: 12px; font-weight: 600; color: var(--ink);">${escapeHtml(timeInfo.date)}</div>
                <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">${escapeHtml(timeInfo.time)}</div>
              </div>`;
            }).join('')}
        </div>
        <div class="pm-body" id="pm_body_${pid}"></div>
        </div>
      </div>
    </div>
  `;

        const bodyEl = document.getElementById('pm_body_'+pid);
        if (!voters.length){
            bodyEl.innerHTML = `<div class="pm-row" style="grid-template-columns: ${gridTemplate}">
                <div class="pm-cell muted" style="grid-column:1 / -1;text-align:center;padding:40px 20px;color:var(--muted);font-style:italic">
                    <div style="font-size:24px;margin-bottom:8px">📊</div>
                    No votes yet
                </div>
            </div>`;
        } else {
            bodyEl.innerHTML = voters.map(v => {
                return `
        <div class="pm-row" data-name="${escapeHtml(v.name).toLowerCase()}" style="grid-template-columns: ${gridTemplate}">
          <div class="pm-cell pm-name">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:16px;color:var(--accent)">●</span>
              <span style="font-weight:500">${escapeHtml(v.name)}</span>
            </div>
          </div>
          ${options.map((o, index) => {
                const list = votersByOpt[o.id] || votersByOpt[String(o.id)] || [];
                const has = list.some(x => (x?.id != null && v.id != null && x.id === v.id) || (v.id == null && (x?.name||'') === v.name));
                const colorIndex = index % 10; // Use modulo to cycle through colors
                const cellStyle = has ? `background: var(--chart-color-${colorIndex}); color: white; border-radius: 4px;` : '';
                return `<div class="pm-cell" style="text-align:center;${cellStyle}">${has ? '<span class="pm-chip pm-yes">●</span>' : '<span class="pm-chip pm-none">○</span>'}</div>`;
            }).join('')}
        </div>
      `;
            }).join('');
        }
        drawPie(document.getElementById('pie_'+pid), segs, labels);
        
        // Add resize handler to recalculate grid on window resize
        const resizeHandler = () => {
            const newAvailableWidth = window.innerWidth - 400; // Increased available width
            const newMinOptionWidth = Math.max(150, Math.min(200, Math.floor(newAvailableWidth / Math.max(numOptions, 1))));
            const newGridTemplate = `${professorColWidth}px repeat(${numOptions}, minmax(${newMinOptionWidth}px, 1fr))`;
            
            const headEl = document.querySelector(`#pm_${pid} .pm-head`);
            const rows = document.querySelectorAll(`#pm_${pid} .pm-row`);
            
            if (headEl) headEl.style.gridTemplateColumns = newGridTemplate;
            rows.forEach(row => row.style.gridTemplateColumns = newGridTemplate);
        };
        
        window.addEventListener('resize', resizeHandler);
    }

    function filterMatrix(pid){
        const q = (document.getElementById('pmq_'+pid)?.value || '').trim().toLowerCase();
        const rows = document.querySelectorAll('#pm_body_'+pid+' .pm-row');
        rows.forEach(r => {
            const name = r.getAttribute('data-name') || '';
            r.style.display = (!q || name.includes(q)) ? '' : 'none';
        });
    }
    // --- themed date-time picker for poll time inputs (reuses existing styles) ---
    let __dtpOpen = null;
    function openDTP(forId){
        closeDTP();
        const inp = document.getElementById(forId);
        if (!inp) return;
        const anchor = document.querySelector(`.calbtn[data-for="${forId}"]`);
        const rect = anchor ? anchor.getBoundingClientRect() : inp.getBoundingClientRect();

        const root = document.createElement('div');
        root.className = 'dtp';
        root.style.position = 'fixed';
        root.style.left = `${rect.left}px`;
        root.style.top  = `${rect.bottom + 6}px`;

        const d0 = inp.value ? new Date(inp.value) : new Date();
        let cur = new Date(d0.getFullYear(), d0.getMonth(), 1);
        let sel = new Date(d0);

        function render(){
            root.innerHTML = '';
            const head = document.createElement('div');
            head.className = 'dtp-header';
            const m = cur.toLocaleString(undefined,{month:'long', year:'numeric'});
            head.innerHTML = `
      <button class="dtp-hbtn" data-nav="-1">‹</button>
      <div class="dtp-month">${m}</div>
      <button class="dtp-hbtn" data-nav="1">›</button>`;
            root.appendChild(head);

            const week = document.createElement('div');
            week.className = 'dtp-week';
            'SMTWTFS'.split('').forEach(c => { const s=document.createElement('span'); s.textContent=c; week.appendChild(s); });
            root.appendChild(week);

            const grid = document.createElement('div');
            grid.className = 'dtp-grid';
            const first = new Date(cur);
            const offset = (first.getDay()+6)%7; // Monday first
            for (let i=0;i<offset;i++){ const d=document.createElement('div'); d.className='dtp-day out'; grid.appendChild(d); }
            const monthLen = new Date(cur.getFullYear(), cur.getMonth()+1, 0).getDate();
            for (let day=1; day<=monthLen; day++){
                const d = document.createElement('div');
                d.className = 'dtp-day';
                d.textContent = day;
                const dt = new Date(cur.getFullYear(), cur.getMonth(), day, sel.getHours(), sel.getMinutes());
                if (sel.toDateString() === dt.toDateString()) d.classList.add('sel');
                d.addEventListener('click', () => { sel = dt; updateValue(); closeDTP(); });
                grid.appendChild(d);
            }
            root.appendChild(grid);

            const time = document.createElement('div');
            time.className = 'dtp-time';
            time.innerHTML = `Time: <input type="number" id="dtp_h" min="0" max="23" value="${('0'+sel.getHours()).slice(-2)}">:<input type="number" id="dtp_m" min="0" max="59" value="${('0'+sel.getMinutes()).slice(-2)}">`;
            root.appendChild(time);

            const actions = document.createElement('div');
            actions.className = 'dtp-actions';
            actions.innerHTML = `<button class="mini" id="dtpCancel">Cancel</button><button class="btn primary" id="dtpOk">OK</button>`;
            root.appendChild(actions);

            head.querySelectorAll('.dtp-hbtn').forEach(b => b.addEventListener('click', () => { cur.setMonth(cur.getMonth()+parseInt(b.dataset.nav,10)); render(); }));
            time.querySelector('#dtp_h').addEventListener('input', e => { const v=Math.max(0,Math.min(23,parseInt(e.target.value||'0',10))); sel.setHours(v); });
            time.querySelector('#dtp_m').addEventListener('input', e => { const v=Math.max(0,Math.min(59,parseInt(e.target.value||'0',10))); sel.setMinutes(v); });
            actions.querySelector('#dtpCancel').addEventListener('click', closeDTP);
            actions.querySelector('#dtpOk').addEventListener('click', () => { updateValue(); closeDTP(); });
        }

        function updateValue(){
            inp.value = toLocalInputValue(sel);
            inp.dispatchEvent(new Event('change'));
        }

        document.body.appendChild(root);
        __dtpOpen = root;
        render();
    }
    function closeDTP(){ if (__dtpOpen){ __dtpOpen.remove(); __dtpOpen=null; } }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.calbtn');
        if (btn){
            const forId = btn.getAttribute('data-for');
            if (!btn.disabled) openDTP(forId);
        } else if (!e.target.closest('.dtp')) {
            closeDTP();
        }
    });

    // wire poll timeslot inputs
    ['ptStart','ptDef','ptBuf','ptCount','ptBreaksEnable','ptBreaksCount','ptBreakMinutes','ptManualEnd','ptEnd'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { recalcTimeslotEnd(); renderTimeslotPreview(); });
        if (el) el.addEventListener('change', () => { recalcTimeslotEnd(); renderTimeslotPreview(); });
    });
    document.getElementById('ptBreaksEnable')?.addEventListener('change', (e) => {
        const on = e.target.checked;
        document.getElementById('ptBreaksCount').disabled = !on;
        document.getElementById('ptBreakMinutes').disabled = !on;
        recalcTimeslotEnd(); renderTimeslotPreview();
    });
    document.getElementById('ptManualEnd')?.addEventListener('change', (e) => {
        const en = e.target.checked;
        const endEl = document.getElementById('ptEnd');
        const btn = document.querySelector('.calbtn[data-for="ptEnd"]');
        endEl.disabled = !en; if (btn) btn.disabled = !en;
    });
    // ---- Offers UI: expand/collapse and show Finalize button on expand
    (function(){
        if (window.__offersBindOnce__) return;
        window.__offersBindOnce__ = true;

        // We don't know the exact container id at runtime; use delegation on document.
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.offer-group-header'); // your header row
            if (!header) return;

            const body = header.nextElementSibling; // expects .offer-item-body (collapsible)
            if (!body) return;

            // Toggle open class used by your CSS (.poll-item-body uses same pattern)
            body.classList.toggle('open');

            // Rotate caret if present
            const caret = header.querySelector('.caret');
            if (caret) caret.classList.toggle('rot', body.classList.contains('open'));

            // Make sure Finalize is visible when expanded (if present and not finalized)
            const finalizeBtn = body.querySelector('[data-action="finalize-offer"], .btn.finalize, .mini.success.finalize');
            if (finalizeBtn) {
                finalizeBtn.hidden = false;                 // unhide if it was hidden
                finalizeBtn.style.display = '';             // clear inline "display:none"
                finalizeBtn.removeAttribute('aria-hidden'); // remove ARIA hidden if present
            }
        }, { passive: true });
    })();
    // --- Manager helpers (authorization-safe) ---
    function __readCookie(name){
        try {
            const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)'));
            return m ? decodeURIComponent(m[1]) : '';
        } catch(_) { return ''; }
    }
    function getAuthToken(){
        try {
            // primary
            let t = localStorage.getItem('auth_token');
            // migrate legacy keys if needed
            if (!t) {
                const legacy = localStorage.getItem('authToken') || localStorage.getItem('defense_token') || __readCookie('authToken');
                if (legacy) {
                    try { localStorage.setItem('auth_token', legacy); } catch(_){}
                    t = legacy;
                }
            }
            // final cookie fallback
            if (!t) t = __readCookie('authToken') || '';
            return t || '';
        } catch(_) { return ''; }
    }
    // Make getAuthToken available globally
    window.getAuthToken = getAuthToken;
    (function(){
        // --- Global fetch wrapper: always attach Authorization for backend calls ---
        const __origFetch = window.fetch.bind(window);
        window.fetch = function(input, init){
            try {
                const req = (input instanceof Request) ? input : new Request(input, init || {});
                const urlObj = new URL(req.url, location.origin);
                const isBackend = urlObj.pathname.endsWith('/backend/index.php');
                if (isBackend) {
                    // Never pass tokens via query string
                    if (urlObj.searchParams.has('token')) urlObj.searchParams.delete('token');
                    const token = getAuthToken();
                    const headers = new Headers(req.headers || {});
                    if (token && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token);
                    const patched = new Request(urlObj.toString(), {
                        method: req.method,
                        headers,
                        body: req.body,
                        mode: req.mode,
                        credentials: req.credentials,
                        cache: req.cache,
                        redirect: req.redirect,
                        referrer: req.referrer,
                        referrerPolicy: req.referrerPolicy,
                        integrity: req.integrity,
                        keepalive: req.keepalive,
                        signal: req.signal
                    });
                    return __origFetch(patched);
                }
            } catch(_e) { /* fallthrough to original */ }
            return __origFetch(input, init);
        };
        // HARD GUARD: if we're authenticated as manager/assistant, do NOT allow any legacy script to bounce us back to login
        let __BLOCK_LOGIN_REDIRECT__ = true;
        const originalReplace = window.location.replace.bind(window.location);
        const originalAssign  = window.location.assign.bind(window.location);
        function blockIfLogin(url){
            try {
                const u = new URL(url, location.origin);
                if ((__BLOCK_LOGIN_REDIRECT__ || window.__AUTH_OK__) && /\/frontend\/index\.html$/.test(u.pathname)) {
                    return true;
                }
            } catch (_e) {}
            return false;
        }
        window.location.replace = (url)=>{ if (!blockIfLogin(url)) originalReplace(url); };
        window.location.assign  = (url)=>{ if (!blockIfLogin(url)) originalAssign(url); };
        // provide a no-op alias some older code might call
        window.gotoLogin = function(){ if (!__BLOCK_LOGIN_REDIRECT__) originalReplace('/frontend/index.html'); };
        // logout helper used by the header button
        window.logout = function(ev){
            if (ev) ev.preventDefault();
            try { localStorage.removeItem('auth_token'); } catch(_e){}
            originalReplace('/frontend/index.html');
        };

        // --- AUTH CHECK: redirect to login if not authed, else validate token via whoami ---
        (function(){
            const cur = (function(){ try { return localStorage.getItem('auth_token'); } catch(_) { return null; } })();
            if (!cur) {
                try {
                    const legacy = localStorage.getItem('authToken') || localStorage.getItem('defense_token') || '';
                    if (legacy) localStorage.setItem('auth_token', legacy);
                } catch(_) {}
            }
        })();
        async function checkAuth() {
            const token = getAuthToken();
            if (!token) {
                originalReplace('/frontend/index.html');
                return;
            }
            try {
                const res = await fetch('/backend/index.php?action=whoami', {
                    method: 'GET',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('auth_token');
                    }
                    originalReplace('/frontend/index.html');
                    return;
                }
                const data = await res.json();
                const u = data && data.user ? data.user : null;
                if (!u) { originalReplace('/frontend/index.html'); return; }

                // If this user isn't allowed here, send them to their console
                if (u.role === 'professor') { originalReplace('/frontend/professor.html'); return; }
                if (u.role === 'assistant') { /* assistants are allowed to use manager console too */ }
                if (u.role !== 'manager' && u.role !== 'assistant') { originalReplace('/frontend/index.html'); return; }

                // Auth confirmed; show header info and enable anti-bounce guard
                window.__AUTH_OK__ = true;
                document.documentElement.setAttribute('data-auth', u.role);
                __BLOCK_LOGIN_REDIRECT__ = true;
                const meEl = document.getElementById('me');
                if (meEl) meEl.textContent = `${u.fullname} · ${u.role}`;
            } catch (e) {
                localStorage.removeItem('auth_token');
                originalReplace('/frontend/index.html');
            }
        }
        // Run auth check on load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkAuth);
        } else {
            checkAuth();
        }

        window.addEventListener('pageshow', function(){
            if (!window.__AUTH_OK__) checkAuth();
        });

        // getToken function is already defined above - no need for duplicate
        const token = getToken();

        // API helpers: always use Authorization header, never query string for token
        function apiUrl(action){
            const u = new URL((window.API || '/backend/index.php'), location.origin);
            u.searchParams.set('action', action);
            // never include token in query
            u.searchParams.delete('token');
            return u.toString();
        }
        async function apiPost(action, payload){
            const url = apiUrl(action);
            const token = getToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    token ? { 'Authorization': 'Bearer ' + token } : {}
                ),
                body: JSON.stringify(payload || {})
            });
            if (!res.ok) {
                let detail = '';
                try { const j = await res.json(); detail = j.error || j.detail || ''; } catch {}
                throw new Error('HTTP ' + res.status + (detail ? (': ' + detail) : ''));
            }
            return res.json();
        }
        async function apiGet(action){
            const url = apiUrl(action);
            const token = getToken();
            const res = await fetch(url, {
                method: 'GET',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            if (!res.ok) {
                let detail = '';
                try { const j = await res.json(); detail = j.error || j.detail || ''; } catch {}
                throw new Error('HTTP ' + res.status + (detail ? (': ' + detail) : ''));
            }
            return res.json();
        }

        // Small toast helper (uses .toasts container if present)
        function toast(msg, ok=true){
            let box = document.querySelector('.toasts');
            if (!box) {
                box = document.createElement('div');
                box.className = 'toasts';
                document.body.appendChild(box);
            }
            const el = document.createElement('div');
            el.className = 'toast ' + (ok ? 'ok' : 'err');
            el.textContent = msg;
            box.appendChild(el);
            setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(10px)'; }, 3000);
            setTimeout(()=>{ el.remove(); }, 3600);
        }

        // --- Poll UI helpers ---
        window.addPollOption = function(){
            const box = document.getElementById('pollOptionsBox');
            if (!box) return;
            const n = box.querySelectorAll('.poll-opt').length + 1;
            const row = document.createElement('div');
            row.className = 'poll-opt';
            row.innerHTML = '<input class="inp poll-opt-input" placeholder="Option ' + n + '"><button class="mini danger" onclick="removePollOption(this)">×</button>';
            box.appendChild(row);
        };
        window.removePollOption = function(btn){
            const row = btn.closest('.poll-opt');
            if (row && row.parentElement) {
                row.parentElement.removeChild(row);
            }
        };



        // --- Remove any hard-coded demo datetime values (ugly 2025-08-31T13:00) ---
        document.addEventListener('DOMContentLoaded', () => {
            ['winStart','winEnd'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        });
        // ---- Date/Time Picker: single instance; prevent double-open
        (function(){
            if (window.__dtpInitOnce__) return; // guard against re-init
            window.__dtpInitOnce__ = true;

            let __dtpActive = null; // keep the single open picker

            function closeDTP(){
                try {
                    document.querySelectorAll('.dtp,.dtp-shadow').forEach(n => n.remove());
                } catch(_) {}
                __dtpActive = null;
            }


            // If you don't, this still ensures only-one-instance + no double-open.
            function openDTP(forId, anchorEl){
                // If the same field tries to open again, just bail.
                if (__dtpActive && __dtpActive.forId === forId) return;
                closeDTP();
                __dtpActive = { forId };

                // Your app already styles .dtp and .dtp-shadow in CSS.
                const shadow = document.createElement('div');
                shadow.className = 'dtp-shadow';
                shadow.addEventListener('click', closeDTP);

                const box = document.createElement('div');
                box.className = 'dtp';
                // Let your existing picker code populate "box" later if you have it.
                // Minimal stub so the guard works even if rendering is elsewhere:
                box.innerHTML = '<div class="dtp-header"><div class="dtp-month">Pick a date/time</div></div>';

                document.body.appendChild(shadow);
                document.body.appendChild(box);

                // Position near the anchor (simple placement)
                const r = anchorEl.getBoundingClientRect();
                box.style.position = 'fixed';
                box.style.left = Math.min(window.innerWidth - 340, Math.max(8, r.left)) + 'px';
                box.style.top  = (r.bottom + 8) + 'px';
            }

            // Bind once: clicking the INPUT opens picker
            document.querySelectorAll('.dtp-input').forEach(inp => {
                inp.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();           // <- prevents bubbling to body
                    openDTP(inp.id, inp);
                }, { once: false });
            });

            // Bind once: clicking the ICON opens picker for its target input
            document.querySelectorAll('.calbtn').forEach(btn => {
                btn.setAttribute('type','button'); // avoid any implicit submit
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();             // <- key: stops event reaching the input
                    const forId = btn.getAttribute('data-for');
                    const target = forId ? document.getElementById(forId) : btn;
                    openDTP(forId || '', target || btn);
                }, { once: false });
            });

            // Close on ESC
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDTP(); });
        })();
    })();
    function pollModeChanged(){
        const mode = (document.getElementById('pollMode')?.value || 'text');
        const textBox = document.getElementById('pollAnswerText');
        const timeBox = document.getElementById('pollAnswerTime');
        const customTimeslotBox = document.getElementById('pollAnswerCustomTimeslot');
        
        // Hide all boxes first
            textBox.style.display = 'none';
        timeBox.style.display = 'none';
        customTimeslotBox.style.display = 'none';
        
        if (mode === 'time'){
            timeBox.style.display = '';
            recalcTimeslotEnd();
            renderTimeslotPreview();
        } else if (mode === 'custom_timeslot'){
            customTimeslotBox.style.display = '';
            // Reinitialize calendar pickers for custom timeslot inputs
            setTimeout(() => {
                document.querySelectorAll('.custom-timeslot-opt .dtp-input').forEach(inp => {
                    // Remove existing listeners to prevent duplicates
                    inp.removeEventListener('focus', inp._calendarFocusHandler);
                    inp._calendarFocusHandler = e => {
                        const btn = document.querySelector(`.calbtn[data-for="${inp.id}"]`);
                        if (inp.disabled) return;
                        makePicker(inp);
                    };
                    inp.addEventListener('focus', inp._calendarFocusHandler);
                });
                document.querySelectorAll('.custom-timeslot-opt .calbtn').forEach(btn => {
                    // Remove existing listeners to prevent duplicates
                    btn.removeEventListener('click', btn._calendarClickHandler);
                    btn._calendarClickHandler = e => {
                        const id = btn.getAttribute('data-for');
                        const input = document.getElementById(id);
                        if (!input || input.disabled) return;
                        makePicker(input);
                    };
                    btn.addEventListener('click', btn._calendarClickHandler);
                });
            }, 100);
        } else {
            textBox.style.display = '';
        }
    }
    function minutesBetween(a,b){ return Math.round((b-a)/60000); }
    function recalcTimeslotEnd(){
        const manual = document.getElementById('ptManualEnd').checked;
        const startVal = document.getElementById('ptStart').value.trim();
        const defm = parseInt(document.getElementById('ptDef').value || '0', 10);
        const bufm = parseInt(document.getElementById('ptBuf').value || '0', 10);
        const count = parseInt(document.getElementById('ptCount').value || '0', 10);
        const breaksEn = document.getElementById('ptBreaksEnable').checked;
        const bcount   = breaksEn ? parseInt(document.getElementById('ptBreaksCount').value || '0', 10) : 0;
        const bmins    = breaksEn ? parseInt(document.getElementById('ptBreakMinutes').value || '0', 10) : 0;

        const endEl = document.getElementById('ptEnd');
        const endBtn = document.querySelector('.calbtn[data-for="ptEnd"]');

        if (!startVal || manual){
            endEl.disabled = !manual;
            if (endBtn) endBtn.disabled = !manual;
            return;
        }
        const start = new Date(startVal);
        if (isNaN(start)) return;

        const stride = (defm > 0 ? defm : 0) + (bufm >= 0 ? bufm : 0);
        const totalMin = (stride * count) + (bcount * Math.max(0,bmins));
        const end = new Date(start.getTime() + totalMin * 60000);

        endEl.disabled = true;
        if (endBtn) endBtn.disabled = true;
        endEl.value = toLocalInputValue(end);
    }
    function buildTimeSlots(start, end, defm, bufm, count = null){
        const slots = [];
        if (!(start instanceof Date) || !(end instanceof Date)) return slots;
        if (isNaN(start) || isNaN(end) || end <= start) return slots;
        
        if (count && count > 0) {
            // Generate exactly 'count' slots
            const stride = defm + bufm;
            let cur = new Date(start);
            for (let i = 0; i < count && cur < end; i++) {
                const s = new Date(cur);
                const e = new Date(cur.getTime() + defm*60000);
                slots.push({ start:s, end:e, label: `${fmtTime(s)} – ${fmtTime(e)}` });
                cur = new Date(cur.getTime() + stride*60000);
            }
        } else {
            // Generate slots based on time range (original behavior)
            const stride = defm + bufm;
            let cur = new Date(start);
            while (cur < end){
                const s = new Date(cur);
                const e = new Date(cur.getTime() + defm*60000);
                slots.push({ start:s, end:e, label: `${fmtTime(s)} – ${fmtTime(e)}` });
                cur = new Date(cur.getTime() + stride*60000);
            }
        }
        return slots;
    }
    function renderTimeslotPreview(){
        // Second renderTimeslotPreview function - for window creation
        const startVal = document.getElementById('ptStart').value.trim();
        const endVal   = document.getElementById('ptEnd').value.trim();
        const defm  = parseInt(document.getElementById('ptDef').value || '0', 10);
        const bufm  = parseInt(document.getElementById('ptBuf').value || '0', 10);
        const count = parseInt(document.getElementById('ptCount').value || '0', 10);
        const prev  = document.getElementById('ptPreview');
        prev.innerHTML = '';
        if (!startVal || !endVal || !(defm > 0)) { prev.textContent = 'Set parameters to see preview.'; return; }
        const slots = buildTimeSlots(new Date(startVal), new Date(endVal), defm, bufm, count);
        if (!slots.length){ prev.textContent = 'No slots generated for the selected range.'; return; }
        prev.innerHTML = slots.map(s => `<div>• ${fmtDate(s.start)} · ${fmtTime(s.start)} – ${fmtTime(s.end)}</div>`).join('');
    }
    (function wireOffersExpand(){
        if (window.__offersExpandWired__) return;
        window.__offersExpandWired__ = true;

        // Mouse / touch
        document.addEventListener('click', function(e){
            const hdr = e.target.closest('.offer-group-header');
            if (!hdr) return;
            const id = +hdr.getAttribute('data-window-id');
            if (!id) return;
            // ignore clicks on inner buttons that already call stopPropagation
            e.preventDefault();
            toggleOfferWindowCollapse(id);
        });

        // Keyboard (Enter / Space)
        document.addEventListener('keydown', function(e){
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const hdr = e.target.closest('.offer-group-header');
            if (!hdr) return;
            const id = +hdr.getAttribute('data-window-id');
            if (!id) return;
            e.preventDefault();
            toggleOfferWindowCollapse(id);
        });
    })();

    /* ---------- Non-Voting Professors Functions ---------- */
    let nonVotingCollapsed = false;
    
    function toggleNonVotingSection(){
        nonVotingCollapsed = !nonVotingCollapsed;
        const body = $('#nonVotingBody'); 
        const btn = $('#btnNonVotingSection');
        
        if (nonVotingCollapsed){ 
            body.classList.remove('expanded');
            body.classList.add('panel-collapsible');
            btn.textContent = 'Expand'; 
            setTimeout(() => {
                body.style.display = 'none';
            }, 400);
        } else { 
            body.style.display = ''; 
            body.classList.remove('panel-collapsible');
            body.classList.add('expanded');
            btn.textContent = 'Collapse'; 
            renderNonVotingProfessors();
        }
    }
    
    async function renderNonVotingProfessors(){
        const list = $('#nonVotingList');
        
        // Get all polls with voting statistics
        const pollStats = [];
        
        // Fetch voting data for all polls from backend
        for (const poll of state.polls) {
            const professors = state.users.filter(u => u.role === 'professor');
            
            try {
                const voteData = await jfetch(API + '?action=poll_votes&poll_id=' + poll.id);
                
                const votedCount = voteData.count || 0;
                
                const notVotedCount = professors.length - votedCount;
                
                pollStats.push({
                    poll: poll,
                    voted: votedCount,
                    notVoted: notVotedCount,
                    total: professors.length
                });
            } catch (error) {
                // Fallback to local data
                let votedCount = 0;
                if (poll.votes && Array.isArray(poll.votes)) {
                    votedCount = poll.votes.length;
                } else if (poll.votes && typeof poll.votes === 'object') {
                    votedCount = Object.keys(poll.votes).length;
                }
                
                const notVotedCount = professors.length - votedCount;
                
                pollStats.push({
                    poll: poll,
                    voted: votedCount,
                    notVoted: notVotedCount,
                    total: professors.length
                });
            }
        }
        
        // Use all polls (no search filter)
        const filteredPolls = pollStats;
        
        // Sort by creation date (newest first)
        filteredPolls.sort((a, b) => new Date(b.poll.created_at) - new Date(a.poll.created_at));
        
        // Render list
        list.innerHTML = filteredPolls.map(item => {
            const pollTitle = item.poll.title || `Poll #${item.poll.id}`;
            const percentage = item.total > 0 ? Math.round((item.voted / item.total) * 100) : 0;
            
            return `
                <div class="poll-item chart-slide-up" onclick="showPollVotingDetails(${item.poll.id})" style="cursor: pointer; padding: 12px; background: var(--card-soft); border: 1px solid var(--line-2); border-radius: 8px; margin-bottom: 8px; transition: all 0.3s ease;">
                    <div class="prof-name" style="font-weight: 600; color: var(--ink); margin-bottom: 8px;">${esc(pollTitle)}</div>
                    <div class="prof-polls">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #22c55e;">✓ ${item.voted} voted</span>
                            <span style="color: #ef4444;">✗ ${item.notVoted} not voted</span>
                        </div>
                        <div style="background: var(--line-2); height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="background: #22c55e; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
                            ${percentage}% participation rate • Click to see details
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<div class="muted">No polls available.</div>';
        
        // Render default chart showing total across all polls
        renderTotalVotingChart(pollStats);
    }
    
    function renderNonVotingChart(highlightedPollId = null){
        const c = $('#nonVotingChart');
        if (!c) return;
        
        const ctx = fitCanvas(c);
        const W = c.clientWidth, H = c.clientHeight, PAD = 20;
        
        // Clear canvas
        ctx.clearRect(0, 0, W, H);
        
        // Get voting statistics for each poll
        const pollStats = [];
        state.polls.forEach(poll => {
            const professors = state.users.filter(u => u.role === 'professor');
            const votedCount = poll.votes ? poll.votes.length : 0;
            const notVotedCount = professors.length - votedCount;
            
            pollStats.push({
                poll: poll,
                voted: votedCount,
                notVoted: notVotedCount,
                total: professors.length
            });
        });
        
        if (pollStats.length === 0) {
            ctx.fillStyle = '#e6edf5';
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('No polls available', W/2, H/2);
            return;
        }
        
        // Prepare chart data
        const chartData = pollStats.slice(0, 6); // Show top 6 polls
        const maxValue = Math.max(...chartData.map(d => Math.max(d.voted, d.notVoted)));
        
        const barWidth = 25;
        const barSpacing = 20;
        const groupSpacing = 40;
        const availableWidth = W - PAD * 2;
        const totalBarWidth = chartData.length * (barWidth * 2 + groupSpacing) - groupSpacing;
        const startX = (W - totalBarWidth) / 2;
        const availableHeight = H - PAD * 2 - 60; // Space for labels and legend
        
        // Draw legend
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(PAD, PAD, 12, 12);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Voted', PAD + 18, PAD + 9);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(PAD + 80, PAD, 12, 12);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px system-ui';
        ctx.fillText('Not Voted', PAD + 98, PAD + 9);
        
        // Draw bars for each poll
        chartData.forEach((item, index) => {
            const groupX = startX + index * (barWidth * 2 + groupSpacing);
            const isHighlighted = highlightedPollId && item.poll.id === highlightedPollId;
            
            // Add highlight effect
            if (isHighlighted) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(groupX - 5, PAD + 25, barWidth * 2 + 10, availableHeight + 10);
            }
            
            // Voted bar (green)
            const votedHeight = (item.voted / maxValue) * availableHeight;
            const votedY = PAD + 30 + availableHeight - votedHeight;
            
            ctx.fillStyle = isHighlighted ? '#16a34a' : '#22c55e';
            ctx.fillRect(groupX, votedY, barWidth, votedHeight);
            
            // Not voted bar (red)
            const notVotedHeight = (item.notVoted / maxValue) * availableHeight;
            const notVotedY = PAD + 30 + availableHeight - notVotedHeight;
            
            ctx.fillStyle = isHighlighted ? '#dc2626' : '#ef4444';
            ctx.fillRect(groupX + barWidth + 5, notVotedY, barWidth, notVotedHeight);
            
            // Draw values
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px system-ui';
            ctx.textAlign = 'center';
            if (item.voted > 0) {
                ctx.fillText(item.voted.toString(), groupX + barWidth/2, votedY - 5);
            }
            if (item.notVoted > 0) {
                ctx.fillText(item.notVoted.toString(), groupX + barWidth + 5 + barWidth/2, notVotedY - 5);
            }
            
            // Draw poll title (truncated)
            const title = item.poll.title || `Poll #${item.poll.id}`;
            const displayTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
            ctx.fillStyle = isHighlighted ? '#ffffff' : '#e5e7eb';
            ctx.font = isHighlighted ? 'bold 10px system-ui' : '10px system-ui';
            ctx.fillText(displayTitle, groupX + barWidth + 2.5, PAD + 30 + availableHeight + 15);
        });
        

        
        // Add click handlers for interactive bars
        c.onclick = function(e) {
            const rect = c.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is on a bar
            chartData.forEach((item, index) => {
                const groupX = startX + index * (barWidth * 2 + groupSpacing);
                const barY = PAD + 30;
                
                // Check voted bar
                if (x >= groupX && x <= groupX + barWidth && y >= barY && y <= barY + availableHeight) {
                    showPollVotingDetails(item.poll, 'voted');
                    return;
                }
                
                // Check not voted bar
                if (x >= groupX + barWidth + 5 && x <= groupX + barWidth * 2 + 5 && y >= barY && y <= barY + availableHeight) {
                    showPollVotingDetails(item.poll, 'not_voted');
                    return;
                }
            });
        };
    }
    
    async function showPollVotingDetails(pollId) {
        
        const poll = state.polls.find(p => p.id === pollId);
        if (!poll) {
            return;
        }
        
        const professors = state.users.filter(u => u.role === 'professor');
        
        // Add loading animation to chart
        const chart = $('#nonVotingChart');
        if (chart) {
            chart.style.opacity = '0.5';
            chart.style.transform = 'scale(0.95)';
        }
        
        // Get actual voting data from backend
        try {
            const voteData = await jfetch(API + '?action=poll_votes&poll_id=' + pollId);
            
            const votedCount = voteData.count || 0;
            const notVotedCount = professors.length - votedCount;
            const percentage = professors.length > 0 ? Math.round((votedCount / professors.length) * 100) : 0;
        
            // Update the list to show poll details with bigger text
            const list = $('#nonVotingList');
            list.innerHTML = `
                <div class="poll-details-card" style="margin-bottom: 16px; padding: 16px; background: var(--card-soft); border-radius: 8px; border: 1px solid var(--line-2);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px;">
                                ${esc(poll.title || `Poll #${poll.id}`)}
                            </div>
                            <div style="font-size: 14px; color: var(--ink-2); line-height: 1.4; margin-bottom: 12px;">
                                ${esc(poll.description || 'No description available')}
                            </div>
                        </div>
                        <button class="mini" onclick="renderNonVotingProfessors()" style="font-size: 10px; margin-left: 12px;">← Back to polls</button>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: #22c55e; font-size: 14px;">✓ ${votedCount} voted</span>
                        <span style="color: #ef4444; font-size: 14px;">✗ ${notVotedCount} not voted</span>
                        <span style="color: var(--muted); font-size: 14px;">${percentage}% participation</span>
                    </div>
                    <div style="background: var(--line-2); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: #22c55e; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
            
            // Update chart to show ONLY this specific poll
            renderSinglePollChart(poll, votedCount, notVotedCount, professors.length);
            
            // Restore chart animation
            setTimeout(() => {
                if (chart) {
                    chart.style.opacity = '1';
                    chart.style.transform = 'scale(1)';
                    chart.style.transition = 'all 0.3s ease';
                }
            }, 100);
            
            // Show professor list below the chart
            showProfessorListForPoll(poll, votedCount, notVotedCount, professors);
            
        } catch (error) {
            // Fallback to local data if backend fails
            const votedCount = poll.votes ? poll.votes.length : 0;
            const notVotedCount = professors.length - votedCount;
            const percentage = professors.length > 0 ? Math.round((votedCount / professors.length) * 100) : 0;
            
            // Update the list to show poll details with bigger text
            const list = $('#nonVotingList');
            list.innerHTML = `
                <div class="poll-details-card" style="margin-bottom: 16px; padding: 16px; background: var(--card-soft); border-radius: 8px; border: 1px solid var(--line-2);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px;">
                                ${esc(poll.title || `Poll #${poll.id}`)}
                            </div>
                            <div style="font-size: 14px; color: var(--ink-2); line-height: 1.4; margin-bottom: 12px;">
                                ${esc(poll.description || 'No description available')}
                            </div>
                        </div>
                        <button class="mini" onclick="renderNonVotingProfessors()" style="font-size: 10px; margin-left: 12px;">← Back to polls</button>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: #22c55e; font-size: 14px;">✓ ${votedCount} voted</span>
                        <span style="color: #ef4444; font-size: 14px;">✗ ${notVotedCount} not voted</span>
                        <span style="color: var(--muted); font-size: 14px;">${percentage}% participation</span>
                    </div>
                    <div style="background: var(--line-2); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: #22c55e; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
            
            // Update chart to show ONLY this specific poll
            renderSinglePollChart(poll, votedCount, notVotedCount, professors.length);
            
            // Restore chart animation
            setTimeout(() => {
                if (chart) {
                    chart.style.opacity = '1';
                    chart.style.transform = 'scale(1)';
                    chart.style.transition = 'all 0.3s ease';
                }
            }, 100);
            
            // Show professor list below the chart
            showProfessorListForPoll(poll, votedCount, notVotedCount, professors);
        }
    }
    
    function renderTotalVotingChart(pollStats) {
        const c = $('#nonVotingChart');
        if (!c) return;
        
        const ctx = fitCanvas(c);
        const W = c.clientWidth, H = c.clientHeight, PAD = 15;
        
        // Clear canvas
        ctx.clearRect(0, 0, W, H);
        
        // Calculate totals across all polls
        const totalVoted = pollStats.reduce((sum, item) => sum + item.voted, 0);
        const totalNotVoted = pollStats.reduce((sum, item) => sum + item.notVoted, 0);
        const totalProfessors = pollStats.length > 0 ? pollStats[0].total : 0;
        const totalPolls = pollStats.length;
        const percentage = totalProfessors > 0 ? Math.round((totalVoted / (totalVoted + totalNotVoted)) * 100) : 0;
        
        // Calculate vertical center position
        const chartCenterY = H / 2;
        
        // Draw title
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Overall Voting Statistics', W/2, chartCenterY - 80);
        
        // Draw subtitle
        ctx.fillStyle = '#8fa2b8';
        ctx.font = '10px system-ui';
        ctx.fillText(`Across ${totalPolls} polls • ${percentage}% average participation`, W/2, chartCenterY - 60);
        
        // Draw larger bars (2x bigger)
        const barWidth = 80;
        const barHeight = 160;
        const barSpacing = 60;
        const startX = (W - (barWidth * 2 + barSpacing)) / 2;
        const startY = chartCenterY - 20;
        
        const maxValue = Math.max(totalVoted, totalNotVoted);
        
        // Voted bar (green)
        const votedBarHeight = maxValue > 0 ? (totalVoted / maxValue) * barHeight : 0;
        const votedY = startY + barHeight - votedBarHeight;
        
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(startX, votedY, barWidth, votedBarHeight);
        
        // Not voted bar (red)
        const notVotedBarHeight = maxValue > 0 ? (totalNotVoted / maxValue) * barHeight : 0;
        const notVotedY = startY + barHeight - notVotedBarHeight;
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(startX + barWidth + barSpacing, notVotedY, barWidth, notVotedBarHeight);
        
        // Draw values on bars
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(totalVoted.toString(), startX + barWidth/2, votedY - 5);
        ctx.fillText(totalNotVoted.toString(), startX + barWidth + barSpacing + barWidth/2, notVotedY - 5);
        
        // Draw labels below bars
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Voted', startX + barWidth/2, startY + barHeight + 15);
        ctx.fillText('Not Voted', startX + barWidth + barSpacing + barWidth/2, startY + barHeight + 15);
        
        // Draw stats below the chart
        ctx.fillStyle = '#8fa2b8';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${totalPolls} polls • ${totalVoted} total votes • ${totalNotVoted} total not voted`, W/2, startY + barHeight + 35);
        

    }
    
    function renderSinglePollChart(poll, votedCount, notVotedCount, totalProfessors) {
        const c = $('#nonVotingChart');
        if (!c) return;
        
        const ctx = fitCanvas(c);
        const W = c.clientWidth, H = c.clientHeight, PAD = 15;
        
        // Clear canvas
        ctx.clearRect(0, 0, W, H);
        
        const pollTitle = poll.title || `Poll #${poll.id}`;
        const percentage = totalProfessors > 0 ? Math.round((votedCount / totalProfessors) * 100) : 0;
        
        // Calculate vertical center position
        const chartCenterY = H / 2;
        
        // Draw title
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(pollTitle, W/2, chartCenterY - 80);
        
        // Draw subtitle
        ctx.fillStyle = '#8fa2b8';
        ctx.font = '10px system-ui';
        ctx.fillText(`${percentage}% participation rate`, W/2, chartCenterY - 60);
        
        // Draw larger bars (2x bigger)
        const barWidth = 80;
        const barHeight = 160;
        const barSpacing = 60;
        const startX = (W - (barWidth * 2 + barSpacing)) / 2;
        const startY = chartCenterY - 20;
        
        // Voted bar (green)
        const votedBarHeight = (votedCount / totalProfessors) * barHeight;
        const votedY = startY + barHeight - votedBarHeight;
        
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(startX, votedY, barWidth, votedBarHeight);
        
        // Not voted bar (red)
        const notVotedBarHeight = (notVotedCount / totalProfessors) * barHeight;
        const notVotedY = startY + barHeight - notVotedBarHeight;
        
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(startX + barWidth + barSpacing, notVotedY, barWidth, notVotedBarHeight);
        
        // Draw values on bars
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(votedCount.toString(), startX + barWidth/2, votedY - 5);
        ctx.fillText(notVotedCount.toString(), startX + barWidth + barSpacing + barWidth/2, notVotedY - 5);
        
        // Draw labels below bars
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Voted', startX + barWidth/2, startY + barHeight + 15);
        ctx.fillText('Not Voted', startX + barWidth + barSpacing + barWidth/2, startY + barHeight + 15);
        
        // Draw stats below the chart
        ctx.fillStyle = '#8fa2b8';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${votedCount} voted • ${notVotedCount} not voted • ${totalProfessors} total professors`, W/2, startY + barHeight + 35);
        
        // Draw percentages inside bars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 9px system-ui';
        const votedPercentage = totalProfessors > 0 ? Math.round((votedCount / totalProfessors) * 100) : 0;
        const notVotedPercentage = totalProfessors > 0 ? Math.round((notVotedCount / totalProfessors) * 100) : 0;
        
        if (votedBarHeight > 20) {
            ctx.fillText(`${votedPercentage}%`, startX + barWidth/2, votedY + votedBarHeight/2 + 2);
        }
        if (notVotedBarHeight > 20) {
            ctx.fillText(`${notVotedPercentage}%`, startX + barWidth + barSpacing + barWidth/2, notVotedY + notVotedBarHeight/2 + 2);
        }
        
        // Update meta

    }
    
    async function showProfessorListForPoll(poll, votedCount, notVotedCount, professors) {
        // Get the actual voters for this poll
        try {
            const voterData = await jfetch(API + '?action=poll_voters&poll_id=' + poll.id);
            
            const voters = voterData.voters || [];
            const nonVoters = voterData.non_voters || [];
            
            const list = $('#nonVotingList');
            list.innerHTML = `
                <div style="margin-bottom: 16px; padding: 12px; background: var(--card-soft); border-radius: 8px; border: 1px solid var(--line-2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: 600; color: var(--ink);">${esc(poll.title || `Poll #${poll.id}`)} - Professor Details</div>
                        <button class="mini" onclick="renderNonVotingProfessors()" style="font-size: 10px;">← Back to polls</button>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="color: #22c55e;">✓ ${voters.length} voted</span>
                        <span style="color: #ef4444;">✗ ${nonVoters.length} not voted</span>
                        <span style="color: var(--muted);">${Math.round((voters.length / professors.length) * 100)}% participation</span>
                    </div>
                </div>
                
                <div class="professor-matrix" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div style="font-weight: 600; color: #22c55e; margin-bottom: 8px; font-size: 13px;">✓ Professors who voted (${voters.length})</div>
                        <input id="votedSearch" class="inp" placeholder="Search voted professors..." style="margin-bottom: 8px; font-size: 12px;" oninput="filterProfessorMatrix('voted', this.value)">
                        <div id="votedMatrix" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; max-height: 1200px; overflow-y: auto; padding-right: 8px;">
                            ${voters.map(prof => `
                                <div class="professor-matrix-item" data-name="${esc(prof.name || 'Unknown').toLowerCase()}" style="
                                    background: var(--card-soft); 
                                    border: 1px solid #22c55e; 
                                    border-radius: 6px; 
                                    padding: 8px; 
                                    text-align: center; 
                                    font-size: 11px; 
                                    color: var(--ink);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='rgba(34,197,94,0.1)'" onmouseout="this.style.background='var(--card-soft)'">
                                    ${esc(prof.name || 'Unknown')}
                                </div>
                            `).join('') || '<div class="muted" style="grid-column: 1 / -1; padding: 8px; text-align: center;">No professors voted yet.</div>'}
                        </div>
                    </div>
                    
                    <div>
                        <div style="font-weight: 600; color: #ef4444; margin-bottom: 8px; font-size: 13px;">✗ Professors who didn't vote (${nonVoters.length})</div>
                        <input id="nonVotedSearch" class="inp" placeholder="Search non-voted professors..." style="margin-bottom: 8px; font-size: 12px;" oninput="filterProfessorMatrix('nonVoted', this.value)">
                        <div id="nonVotedMatrix" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; max-height: 1200px; overflow-y: auto; padding-right: 8px;">
                            ${nonVoters.map(prof => `
                                <div class="professor-matrix-item" data-name="${esc(prof.name || 'Unknown').toLowerCase()}" style="
                                    background: var(--card-soft); 
                                    border: 1px solid #ef4444; 
                                    border-radius: 6px; 
                                    padding: 8px; 
                                    text-align: center; 
                                    font-size: 11px; 
                                    color: var(--ink);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='var(--card-soft)'">
                                    ${esc(prof.name || 'Unknown')}
                                </div>
                            `).join('') || '<div class="muted" style="grid-column: 1 / -1; padding: 8px; text-align: center;">All professors voted!</div>'}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
        }
    }
    
    function filterProfessorMatrix(type, searchQuery) {
        const searchTerm = searchQuery.toLowerCase().trim();
        const matrixContainer = type === 'voted' ? $('#votedMatrix') : $('#nonVotedMatrix');
        const professorItems = matrixContainer.querySelectorAll('.professor-matrix-item');
        
        professorItems.forEach(item => {
            const name = item.getAttribute('data-name') || '';
            const matches = name.includes(searchTerm);
            item.style.display = matches ? 'block' : 'none';
        });
    }
    
    // Wire up functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Make functions globally accessible
        window.showPollVotingDetails = showPollVotingDetails;
        window.renderNonVotingProfessors = renderNonVotingProfessors;
        window.showProfessorListForPoll = showProfessorListForPoll;
        window.filterProfessorMatrix = filterProfessorMatrix;
        
        // Initialize export button state
        updateExportSelectedButton();
    });

    /* ==========================================================
       POLL EXPORT FUNCTIONS
       ========================================================== */

    // Global variable to track selected polls
    let selectedPolls = new Set();

    /**
     * Export all polls to Excel
     */
    async function exportAllPolls() {
        try {
            toast('Exporting all polls...', 'info');
            
            const response = await fetch(API + '?action=export_polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    export_type: 'all',
                    poll_ids: []
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Export failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.detail || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

                           // Get the filename from the response headers
               const contentDisposition = response.headers.get('Content-Disposition');
               let filename = 'polls_export.xlsx';
               if (contentDisposition) {
                   const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                   if (filenameMatch) {
                       filename = filenameMatch[1];
                   }
               }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast('Export completed successfully!', 'success');
        } catch (error) {
            toast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Export selected polls to Excel
     */
    async function exportSelectedPolls() {
        if (selectedPolls.size === 0) {
            toast('Please select at least one poll to export', 'warning');
            return;
        }

        try {
            toast(`Exporting ${selectedPolls.size} selected polls...`, 'info');
            
            const response = await fetch(API + '?action=export_polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    export_type: 'selected',
                    poll_ids: Array.from(selectedPolls)
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Export failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.detail || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
                           let filename = 'selected_polls_export.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast('Export completed successfully!', 'success');
        } catch (error) {
            toast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Export a single poll to Excel
     */
    async function exportSinglePoll(pollId) {
        try {
            toast('Exporting poll...', 'info');
            
            const response = await fetch(API + '?action=export_polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    export_type: 'single',
                    poll_ids: [pollId]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Export failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.detail || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Get the filename from the response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `poll_${pollId}_export.xlsx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast('Export completed successfully!', 'success');
        } catch (error) {
            toast('Export failed: ' + error.message, 'error');
        }
    }

    /**
     * Select all visible polls
     */
    function selectAllPolls() {
        const pollCheckboxes = document.querySelectorAll('.poll-checkbox');
        pollCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            selectedPolls.add(parseInt(checkbox.value));
        });
        updateExportSelectedButton();
    }

    /**
     * Deselect all polls
     */
    function deselectAllPolls() {
        const pollCheckboxes = document.querySelectorAll('.poll-checkbox');
        pollCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectedPolls.clear();
        updateExportSelectedButton();
    }

    /**
     * Handle poll checkbox change
     */
    function handlePollSelection(checkbox) {
        const pollId = parseInt(checkbox.value);
        if (checkbox.checked) {
            selectedPolls.add(pollId);
        } else {
            selectedPolls.delete(pollId);
        }
        updateExportSelectedButton();
    }

    /**
     * Update the export selected button state
     */
    function updateExportSelectedButton() {
        const exportSelectedBtn = document.getElementById('exportSelectedBtn');
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedPolls.size === 0;
            exportSelectedBtn.textContent = `📊 Export Selected (${selectedPolls.size})`;
        }
    }

    // Make export functions globally accessible
    window.exportAllPolls = exportAllPolls;
    window.exportSelectedPolls = exportSelectedPolls;
    window.exportSinglePoll = exportSinglePoll;
    window.selectAllPolls = selectAllPolls;
    window.deselectAllPolls = deselectAllPolls;
    window.handlePollSelection = handlePollSelection;
    
    // Debug function to test polls endpoint
    async function testPollsEndpoint() {
        try {
            const currentToken = getToken();
            
            const response = await fetch(API + '?action=test_polls', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + currentToken
                }
            });
            
            const data = await response.json();

            toast('Test completed: ' + JSON.stringify(data), 'info');
        } catch (error) {

            toast('Test failed: ' + error.message, 'error');
        }
    }
    
    window.testPollsEndpoint = testPollsEndpoint;

    // Initialize the application
    (async function init() {
        try {
            await whoami();
            await refreshAll();
        } catch (error) {
            console.error('Initialization failed:', error);
            toast('Failed to initialize application', 'error');
        }
    })();


