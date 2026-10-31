'use strict';
const STORAGE = {
    meds: 'vitamed_meds_v2',
    logs: 'vitamed_logs_v2',
    account: 'vitamed_account_v2',
    failures: 'vitamed_login_failures',
    lockUntil: 'vitamed_lock_until'
};
const DEMO_PASSWORD = '12345678';
const LOCK_DURATION_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const defaultMeds = [
    { id: 1, name: 'Losartana', dose: '50 mg', time: '08:00', stock: 20, image: '', paused: false },
    { id: 2, name: 'Vitamina D', dose: '1 cápsula', time: '20:00', stock: 4, image: '', paused: false }
];

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}
let meds = readJSON(STORAGE.meds, defaultMeds);
let logs = readJSON(STORAGE.logs, []);
let currentRole = 'idoso';
let currentScreen = 'home';
let previousScreen = 'home';
let demoPassword = sessionStorage.getItem('vitamed_demo_password') || DEMO_PASSWORD;

const titles = {
    register: ['Criar conta', 'Preencha seus dados para começar a usar o VitaMed.'],
    home: ['Início', 'Acompanhe seus horários e confirme suas doses.'],
    meds: ['Meus remédios', 'Cadastre, edite, pause ou exclua medicamentos.'],
    forgot: ['Recuperar senha', 'Redefina sua senha em três etapas.'],
    history: ['Histórico e relatório', 'Acompanhe sua adesão ao tratamento.'],
    care: ['Painel do cuidador', 'Acompanhe doses e alertas importantes.'],
    stock: ['Estoque baixo', 'Veja quais medicamentos precisam ser repostos.'],
    account: ['Minha conta', 'Dados pessoais, alergias e contato de emergência.']
};

const roleScreens = {
    idoso: ['home', 'meds', 'history', 'stock', 'account'],
    cuidador: ['home', 'meds', 'history', 'care', 'stock', 'account']
};

function $(id) { return document.getElementById(id); }
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}
function announce(message) {
    const status = $('statusMessage');
    if (status) status.textContent = message;
}
function persist() {
    try {
        localStorage.setItem(STORAGE.meds, JSON.stringify(meds));
        localStorage.setItem(STORAGE.logs, JSON.stringify(logs));
    } catch {
        alert('Não foi possível salvar. Verifique o espaço disponível no navegador.');
    }
}
function getAccount() { return readJSON(STORAGE.account, {}); }
function isAuthenticated() { return sessionStorage.getItem('vitamed_session') === 'active'; }
function lockRemaining() {
    const until = Number(sessionStorage.getItem(STORAGE.lockUntil) || 0);
    return Math.max(0, until - Date.now());
}
function formatRemaining(ms) {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} minuto(s)`;
}
function submitLogin(role) {
    const email = $('loginEmail').value.trim();
    const password = $('loginPass').value;
    const remaining = lockRemaining();

    if (remaining > 0) {
        alert(`Acesso temporariamente bloqueado. Tente novamente em ${formatRemaining(remaining)}.`);
        return;
    }
    if (!email || !password) {
        alert('Preencha o e-mail/telefone e a senha.');
        return;
    }

    const account = getAccount();
    const registeredContact = account.contact || '';
    const contactMatches = !registeredContact || registeredContact.toLowerCase() === email.toLowerCase();

    if (password !== demoPassword || !contactMatches) {
        let failures = Number(sessionStorage.getItem(STORAGE.failures) || 0) + 1;
        sessionStorage.setItem(STORAGE.failures, String(failures));
        const left = MAX_ATTEMPTS - failures;
        if (failures >= MAX_ATTEMPTS) {
            sessionStorage.setItem(STORAGE.lockUntil, String(Date.now() + LOCK_DURATION_MS));
            sessionStorage.setItem(STORAGE.failures, '0');
            alert('Muitas tentativas incorretas. O acesso foi bloqueado por 15 minutos nesta demonstração.');
        } else {
            alert(`Dados incorretos. Restam ${left} tentativa(s) antes do bloqueio.`);
        }
        return;
    }

    sessionStorage.removeItem(STORAGE.failures);
    sessionStorage.removeItem(STORAGE.lockUntil);
    login(role);
}
function login(role) {
    const account = getAccount();
    currentRole = role;
    sessionStorage.setItem('vitamed_session', 'active');
    sessionStorage.setItem('vitamed_role', role);
    $('loginScreen').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('roleChip').textContent = `Perfil: ${role}`;
    configureRoleNavigation();
    showScreen('home', true);
    renderAll();
}
function logout() {
    sessionStorage.removeItem('vitamed_session');
    sessionStorage.removeItem('vitamed_role');
    $('app').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    $('loginPass').value = '';
    currentScreen = 'home';
    announce('Você saiu da sua conta.');
}
function configureRoleNavigation() {
    const allowed = roleScreens[currentRole] || roleScreens.idoso;
    document.querySelectorAll('#nav button[data-screen]').forEach(button => {
        const permitted = allowed.includes(button.dataset.screen);
        button.classList.toggle('hidden', !permitted);
        button.disabled = !permitted;
        if (!permitted) button.setAttribute('aria-hidden', 'true');
        else button.removeAttribute('aria-hidden');
    });
}
function showScreen(id, initial = false) {
    const publicScreens = ['forgot', 'register'];
    if (!publicScreens.includes(id) && !isAuthenticated()) {
        $('app').classList.add('hidden');
        $('loginScreen').classList.remove('hidden');
        return;
    }
    if (!publicScreens.includes(id)) {
        const allowed = roleScreens[currentRole] || roleScreens.idoso;
        if (!allowed.includes(id)) {
            alert('Esta página não está disponível para o perfil atual.');
            id = 'home';
        }
    }
    if (!initial && currentScreen !== id) previousScreen = currentScreen;
    currentScreen = id;
    document.querySelectorAll('.screen').forEach(section => {
        section.classList.toggle('active', section.id === id);
    });
    document.querySelectorAll('#nav button[data-screen]').forEach(button => {
        const active = button.dataset.screen === id;
        button.classList.toggle('active', active);
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
    });
    const title = titles[id] || titles.home;
    $('pageTitle').textContent = title[0];
    $('pageSub').textContent = title[1];
    if (id === 'forgot' || id === 'register') {
        $('loginScreen').classList.add('hidden');
        $('app').classList.remove('hidden');
    }
    if (isAuthenticated()) renderAll();
}
function goBack() {
    if (currentScreen === 'forgot' || currentScreen === 'register') {
        backToLogin();
        return;
    }
    const allowed = roleScreens[currentRole] || roleScreens.idoso;
    showScreen(allowed.includes(previousScreen) ? previousScreen : 'home');
}
function backToLogin() {
    $('app').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $('loginPass').value = '';
    currentScreen = 'home';
}
function forgotNext(step) {
    if (step === 2 && !$('recoveryContact').value.trim()) {
        alert('Informe seu e-mail ou telefone.');
        return;
    }
    if (step === 3 && $('recoveryCode').value !== '123456') {
        alert('Código inválido. Na demonstração, use 123456.');
        return;
    }
    [1, 2, 3].forEach(i => {
        $(`forgotStep${i}`).classList.toggle('hidden', i !== step);
        $(`step${i}`).classList.toggle('on', i <= step);
    });
}
function saveNewPass() {
    const password = $('newPass').value;
    const confirmation = $('confirmPass').value;
    if (password.length < 8 || password !== confirmation) {
        alert('As senhas devem ter ao menos 8 caracteres e ser iguais.');
        return;
    }
    demoPassword = password;
    sessionStorage.setItem('vitamed_demo_password', password);
    alert('Senha alterada apenas nesta sessão de demonstração.');
    backToLogin();
}

$('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    submitLogin('idoso');
});

$('registerForm').addEventListener('submit', event => {
    event.preventDefault();
    const password = $('regPass').value;
    if (password.length < 8 || password !== $('regPass2').value) {
        alert('As senhas devem ter ao menos 8 caracteres e ser iguais.');
        return;
    }
    const data = {
        name: $('regName').value.trim(),
        role: $('regRole').value,
        contact: $('regContact').value.trim(),
        allergies: $('regAllergies').value.trim(),
        emergency: $('regEmergency').value.trim(),
        timezone: $('regTimezone').value
    };
    if (!data.name || !data.contact) {
        alert('Preencha seu nome e contato.');
        return;
    }
    localStorage.setItem(STORAGE.account, JSON.stringify(data));
    demoPassword = password;
    sessionStorage.setItem('vitamed_demo_password', password);
    $('loginEmail').value = data.contact;
    alert('Cadastro demonstrativo criado. Entre com o contato e a senha cadastrada.');
    backToLogin();
});

function resetMedForm() {
    $('medForm').reset();
    $('medId').value = '';
    $('medFormTitle').textContent = 'Cadastrar medicamento';
}
$('medForm').addEventListener('submit', event => {
    event.preventDefault();
    const id = $('medId').value;
    const file = $('medImage').files[0];
    if (file && !file.type.startsWith('image/')) {
        alert('Selecione um arquivo de imagem válido.');
        return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2 MB.');
        return;
    }
    const existing = meds.find(m => m.id == id);
    const save = image => {
        const item = {
            id: id ? Number(id) : Date.now(),
            name: $('medName').value.trim(),
            dose: $('medDose').value.trim(),
            time: $('medTime').value,
            stock: Math.max(0, Number($('medStock').value || 0)),
            image: image !== undefined ? image : (existing?.image || ''),
            paused: existing?.paused || false
        };
        if (id) meds = meds.map(m => m.id == id ? item : m);
        else meds.push(item);
        persist();
        resetMedForm();
        renderAll();
        announce('Medicamento salvo.');
    };
    if (file) {
        const reader = new FileReader();
        reader.onload = () => save(reader.result);
        reader.onerror = () => alert('Não foi possível carregar a imagem.');
        reader.readAsDataURL(file);
    } else save(undefined);
});
function editMed(id) {
    const med = meds.find(m => m.id === id);
    if (!med) return;
    $('medId').value = med.id;
    $('medName').value = med.name;
    $('medDose').value = med.dose;
    $('medTime').value = med.time;
    $('medStock').value = med.stock;
    $('medFormTitle').textContent = 'Editar medicamento';
    showScreen('meds');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function deleteMed(id) {
    const med = meds.find(m => m.id === id);
    if (!med) return;
    if (confirm(`Tem certeza de que deseja excluir ${med.name}? Esta ação não poderá ser desfeita.`)) {
        meds = meds.filter(m => m.id !== id);
        persist();
        renderAll();
        announce('Medicamento excluído.');
    }
}
function togglePause(id) {
    const med = meds.find(m => m.id === id);
    if (!med) return;
    med.paused = !med.paused;
    persist();
    renderAll();
}
function confirmDose(status) {
    const med = meds.filter(m => !m.paused).sort((a, b) => a.time.localeCompare(b.time))[0];
    if (!med) {
        alert('Cadastre um medicamento ativo primeiro.');
        return;
    }
    logs.unshift({
        name: med.name, dose: med.dose, time: med.time, status,
        date: new Date().toLocaleString('pt-BR')
    });
    if (status === 'Tomei' && med.stock > 0) med.stock--;
    persist();
    renderAll();
    announce(`Registro da dose: ${status}.`);
    alert(status === 'Adiei' ? 'Dose adiada por 10 minutos (simulação).' : `Registro salvo: ${status}.`);
}
function renderAll() {
    renderMeds();
    renderHome();
    renderHistory();
    renderCare();
    renderStock();
}
function renderMeds() {
    const element = $('medTable');
    if (!meds.length) {
        element.innerHTML = '<div class="empty">Nenhum medicamento cadastrado.</div>';
        return;
    }
    element.innerHTML = '<table><thead><tr><th>Medicamento</th><th>Horário</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead><tbody>' +
        meds.map(m => `<tr><td><b>${esc(m.name)}</b><br><span class="muted">${esc(m.dose)}</span></td><td>${esc(m.time)}</td><td>${m.stock}</td><td>${m.paused ? '<span class="pill warn">Pausado</span>' : '<span class="pill">Ativo</span>'}</td><td><button class="btn small secondary" onclick="editMed(${Number(m.id)})">Editar</button> <button class="btn small ghost" onclick="togglePause(${Number(m.id)})">${m.paused ? 'Retomar' : 'Pausar'}</button> <button class="btn small danger" onclick="deleteMed(${Number(m.id)})">Excluir</button></td></tr>`).join('') +
        '</tbody></table>';
}
function renderHome() {
    const active = meds.filter(m => !m.paused).sort((a, b) => a.time.localeCompare(b.time));
    const med = active[0];
    $('todayCount').textContent = active.length;
    $('takenCount').textContent = logs.filter(l => l.status === 'Tomei').length;
    $('pendingCount').textContent = active.length;
    $('homeMedName').textContent = med ? `${med.name} ${med.dose}` : 'Nenhuma dose cadastrada';
    $('homeDoseLabel').textContent = med ? `${med.time} · Próximo horário` : 'Adicione um medicamento em Meus remédios';
    $('homePhoto').innerHTML = med && med.image ? `<img src="${med.image}" alt="Foto de ${esc(med.name)}">` : '💊';
    $('todayList').innerHTML = active.length
        ? active.map(item => `<div class="notice">${esc(item.time)} — <b>${esc(item.name)}</b> ${esc(item.dose)}</div>`).join('')
        : '<div class="empty">Sem doses cadastradas.</div>';
}
function renderHistory() {
    const element = $('historyTable');
    element.innerHTML = logs.length
        ? '<table><thead><tr><th>Data e hora</th><th>Medicamento</th><th>Registro</th></tr></thead><tbody>' +
        logs.map(log => `<tr><td>${esc(log.date)}</td><td>${esc(log.name)} · ${esc(log.dose)}</td><td><span class="pill ${log.status === 'Não tomei' ? 'bad' : log.status === 'Adiei' ? 'warn' : ''}">${esc(log.status)}</span></td></tr>`).join('') +
        '</tbody></table>'
        : '<div class="empty">Ainda não há registros. Use os botões da tela inicial para registrar uma dose.</div>';
}
function renderCare() {
    const pending = meds.filter(m => !m.paused).length;
    $('carePending').textContent = pending;
    $('careTaken').textContent = logs.filter(l => l.status === 'Tomei').length;
    $('careLow').textContent = meds.filter(m => m.stock <= 5).length;
    const low = meds.filter(m => m.stock <= 5);
    const alerts = (pending ? '<div class="notice alert">Há doses aguardando confirmação na rotina de hoje.</div>' : '') +
        low.map(m => `<div class="notice alert">${esc(m.name)} está com apenas ${m.stock} unidade(s) no estoque.</div>`).join('') +
        logs.slice(0, 5).map(l => `<div class="notice ${l.status === 'Não tomei' ? 'dangerline' : ''}">${esc(l.date)} — ${esc(l.name)}: <b>${esc(l.status)}</b></div>`).join('');
    $('careAlerts').innerHTML = alerts || '<div class="empty">Nenhum alerta no momento.</div>';
    $('emergencyInfo').textContent = getAccount().emergency || 'Nenhum contato cadastrado.';
}
function renderStock() {
    const low = meds.filter(m => m.stock <= 5);
    $('stockList').innerHTML = low.length
        ? low.map(m => `<div class="notice alert"><b>${esc(m.name)}</b> — restam ${m.stock} unidade(s). <button class="btn small secondary" onclick="editMed(${Number(m.id)})">Atualizar estoque</button></div>`).join('')
        : '<div class="empty">Tudo certo! Nenhum medicamento com estoque baixo.</div>';
}
function exportPDF() {
    const rows = logs.map(log => `${log.date} | ${log.name} ${log.dose} | ${log.status}`).join('\n') || 'Nenhum registro.';
    const report = window.open('', '_blank');
    if (!report) {
        alert('Permita a abertura de pop-ups para gerar o relatório.');
        return;
    }
    report.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório VitaMed</title></head><body style="font:14px Arial;padding:30px"><h1>VitaMed — Relatório de adesão</h1><pre>${esc(rows)}</pre><script>window.print()<\/script></body></html>`);
    report.document.close();
}
$('accountForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = {
        ...getAccount(),
        name: $('accountName').value.trim(),
        role: $('accountRole').value,
        allergies: $('allergies').value.trim(),
        emergency: $('emergency').value.trim(),
        timezone: $('timezone').value
    };
    localStorage.setItem(STORAGE.account, JSON.stringify(data));
    currentRole = data.role;
    sessionStorage.setItem('vitamed_role', currentRole);
    $('roleChip').textContent = `Perfil: ${currentRole}`;
    configureRoleNavigation();
    alert('Dados salvos neste navegador.');
    renderCare();
});
(function initialize() {
    const account = getAccount();
    $('accountName').value = account.name || '';
    $('accountRole').value = account.role || 'idoso';
    $('allergies').value = account.allergies || '';
    $('emergency').value = account.emergency || '';
    $('timezone').value = account.timezone || 'America/Sao_Paulo';

    // A sessão não é restaurada automaticamente: é necessário entrar novamente.
    sessionStorage.removeItem('vitamed_session');
    sessionStorage.removeItem('vitamed_role');
    $('loginEmail').value = account.contact || 'maria@email.com';
    configureRoleNavigation();
})();