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
const THEME_STORAGE = 'vitamed_theme_preference';
function applyTheme(theme) {
    const selected = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', selected);
    localStorage.setItem(THEME_STORAGE, selected);
    const nextLabel = selected === 'dark' ? 'Tema claro' : 'Tema escuro';
    const nextIcon = selected === 'dark' ? '☀' : '☾';
    ['loginThemeLabel', 'appThemeLabel'].forEach(id => { if ($(id)) $(id).textContent = nextLabel; });
    ['loginThemeIcon', 'appThemeIcon'].forEach(id => { if ($(id)) $(id).textContent = nextIcon; });
    const preference = $('themePreference');
    if (preference) preference.value = selected;
}
function setTheme(theme) { applyTheme(theme); }
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

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

async function submitLogin(role) {
    const email = $('loginEmail').value.trim();
    const password = $('loginPass').value;

    if (!email || !password) {
        alert('Preencha o e-mail e a senha.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password,
                tipo_usuario: role
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.mensagem || 'Não foi possível entrar.');
            return;
        }

        localStorage.setItem(STORAGE.account, JSON.stringify({
            id: resultado.usuario.id,
            name: resultado.usuario.nome,
            contact: resultado.usuario.email,
            role: resultado.usuario.tipo_usuario
        }));

        sessionStorage.removeItem(STORAGE.failures);
        sessionStorage.removeItem(STORAGE.lockUntil);

        login(resultado.usuario.tipo_usuario);

    } catch (erro) {
        console.error('Erro no login:', erro);
        alert('Não foi possível conectar ao servidor VitaMed.');
    }
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


$('registerForm').addEventListener('submit', async event => {
    event.preventDefault();

    const password = $('regPass').value;
    const confirmation = $('regPass2').value;

    if (password.length < 8 || password !== confirmation) {
        alert('As senhas devem ter ao menos 8 caracteres e ser iguais.');
        return;
    }

    const data = {
        nome: $('regName').value.trim(),
        email: $('regContact').value.trim(),
        senha: password,
        tipo_usuario: $('regRole').value
    };

    if (!data.nome || !data.email) {
        alert('Preencha seu nome e e-mail.');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.mensagem || 'Não foi possível realizar o cadastro.');
            return;
        }

        const account = {
            name: data.nome,
            role: data.tipo_usuario,
            contact: data.email,
            allergies: $('regAllergies').value.trim(),
            emergency: $('regEmergency').value.trim(),
            timezone: $('regTimezone').value
        };

        localStorage.setItem(STORAGE.account, JSON.stringify(account));

        $('loginEmail').value = data.email;
        $('loginPass').value = '';

        $('registerForm').reset();

        alert('Cadastro realizado com sucesso! Agora você pode entrar.');

        backToLogin();

    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        alert('Não foi possível conectar ao servidor VitaMed. Verifique se ele está iniciado.');
    }
});

function resetMedForm() {
    $('medForm').reset();
    $('medId').value = '';
    $('medFormTitle').textContent = 'Cadastrar medicamento';
}

$('medForm').addEventListener('submit', async event => {
    event.preventDefault();

    const id = $('medId').value;
    const file = $('medImage').files[0];

    if (file) {
        alert('O envio de fotos será conectado em uma próxima etapa. Por enquanto, cadastre sem imagem.');
        return;
    }

    const account = getAccount();

    if (!account.id) {
        alert('Não foi possível identificar o usuário. Saia da conta e entre novamente.');
        return;
    }

    const dados = {
        usuario_id: account.id,
        nome: $('medName').value.trim(),
        dosagem: $('medDose').value.trim(),
        instrucoes: '',
        quantidade_estoque: Math.max(0, Number($('medStock').value || 0)),
        estoque_minimo: 0
    };

    if (!dados.nome || !dados.dosagem) {
        alert('Preencha o nome e a dosagem do medicamento.');
        return;
    }

    try {
        if (id) {
            alert('A edição no banco de dados será conectada na próxima etapa. Por enquanto, teste um novo cadastro.');
            return;
        }

        const resposta = await fetch('http://localhost:3000/medicamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.mensagem || 'Não foi possível cadastrar o medicamento.');
            return;
        }

        const novoMedicamento = {
            id: resultado.medicamentoId,
            name: dados.nome,
            dose: dados.dosagem,
            time: $('medTime').value,
            stock: dados.quantidade_estoque,
            image: '',
            paused: false
        };

        meds.push(novoMedicamento);
        persist();
        resetMedForm();
        renderAll();
        announce('Medicamento salvo no banco de dados!');
        alert('Medicamento cadastrado com sucesso!');

    } catch (erro) {
        console.error('Erro ao cadastrar medicamento:', erro);
        alert('Não foi possível conectar ao servidor VitaMed.');
    }
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
        timezone: $('timezone').value,
        theme: $('themePreference').value
    };
    localStorage.setItem(STORAGE.account, JSON.stringify(data));
    applyTheme(data.theme);
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
    applyTheme(localStorage.getItem(THEME_STORAGE) || 'dark');

    sessionStorage.removeItem('vitamed_session');
    sessionStorage.removeItem('vitamed_role');
    $('loginEmail').value = account.contact || 'maria@email.com';
    configureRoleNavigation();
})();
