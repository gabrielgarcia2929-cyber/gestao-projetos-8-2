const storeKey = "gestao-projetos-v1";
const sessionKey = "gestao-projetos-session";
const backupKey = "gestao-projetos-backups";
const appVersion = "V03";
const supabaseUrl = "https://mhqssjntntonsqcfjarf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXNzam50bnRvbnNxY2ZqYXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDg5NzgsImV4cCI6MjA5Nzg4NDk3OH0.cr4mKTNhCCFjasvodaJQfocrk_kAzye5QFca5A9ihiw";
const supabaseClient = window.supabase?.createClient(supabaseUrl, supabaseKey);
let remoteStateReady = false;
let legacyPlannerItemsMerged = false;
let remoteUpdatedAt = "";
let remoteSaveTimer = null;
let remoteSaveInFlight = false;
let remoteSaveQueued = false;
let hasUnsavedChanges = false;
let saveStatusMode = "saved";
const appUsers = [
  { username: "Anna", email: "anna.caminha@8p2.com", role: "member" },
  { username: "Felipe", email: "felipe.alves@8p2.com", role: "member" },
  { username: "Gustavo", email: "gustavo.carvalho@8p2.com", role: "member" },
  { username: "Vanderlania", email: "vanderlania.brito@8p2.com", role: "member" },
  { username: "Ricardo", email: "ricardo.guedes@8p2.de", role: "member" },
  { username: "Coordenação", email: "gabriel.gaarcia2929@gmail.com", role: "coordinator" },
];
const msDay = 24 * 60 * 60 * 1000;
const planningCellWidth = 32;
const engineeringMembers = ["Anna", "Felipe", "Vanderlania", "Gustavo", "Gabriel", "Ricardo"];

const statusLabels = {
  aprovado: "Aprovado",
  afazer: "A fazer",
  andamento: "Em andamento",
  revisao: "Revisão",
  standby: "Stand-by",
  concluido: "Concluído",
};

const legacyStatusMap = {
  planejado: "afazer",
  risco: "standby",
  Planejamento: "afazer",
  "Em risco": "standby",
  "Em andamento": "andamento",
  "Concluído": "concluido",
};

const deliverablesByType = {
  LTE: ["Relatório Final", "Relatórios de inspeção", "Capex e Opex", "MNC", "Outro"],
  TQI: ["Relatório Final", "Relatórios de inspeção", "MNC", "Outro"],
  DD: ["Relatório Final", "Outro"],
  Arbitragem: ["Relatório Final", "Outro"],
  RCA: ["Relatório Final", "Outro"],
  Outro: ["Relatório Final", "Outro"],
};

const projectVariablesByType = {
  TQI: ["Inspeção externa de Blade", "Coleta de lubrificante", "Inspeção eletromecânica", "Boroscopia de Gearbox", "Boroscopia de Main Bearing", "Outro"],
  LTE: ["Inspeção externa de Blade", "Coleta de lubrificante", "Inspeção eletromecânica", "Outro"],
};

const coordinationMembers = ["Anna", "Felipe", "Vanderlânia", "Gustavo"];

const state = loadState();
let currentUser = loadSessionUser();
let activeProjectId = state.activeProjectId || state.projects[0].id;
let ganttScale = "day";
let activeProjectView = state.activeProjectView || "kanban";
let planningDays = state.planningDays || 75;
let planningOffsetDays = state.planningOffsetDays || -21;
let activePlanningView = state.activePlanningView || "allocation";
let activePlannerView = state.activePlannerView || "day";
let plannerDate = normalizeDateValue(state.plannerDate || new Date());
let activePlannerUser = state.activePlannerUser || currentUser?.username || "";
let activePlannerSourceFilter = state.activePlannerSourceFilter || "all";
let portfolioStatusFilter = state.portfolioStatusFilter || "all";
let editingProjectParks = [];
let editingTaskCheckinGroups = [];
let hideCheckedCheckins = false;

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUser: document.querySelector("#loginUser"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  currentUserLabel: document.querySelector("#currentUserLabel"),
  logoutBtn: document.querySelector("#logoutBtn"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  saveStatus: document.querySelector("#saveStatus"),
  saveStatusText: document.querySelector("#saveStatusText"),
  saveChangesBtn: document.querySelector("#saveChangesBtn"),
  projectSelect: document.querySelector("#projectSelect"),
  projectTitle: document.querySelector("#projectTitle"),
  projectPortfolio: document.querySelector("#projectPortfolio"),
  portfolioStatusFilter: document.querySelector("#portfolioStatusFilter"),
  projectTypeSelect: document.querySelector("#projectTypeSelect"),
  projectTypeOtherLabel: document.querySelector("#projectTypeOtherLabel"),
  projectVariablesSection: document.querySelector("#projectVariablesSection"),
  projectVariablesOptions: document.querySelector("#projectVariablesOptions"),
  projectVariableOtherLabel: document.querySelector("#projectVariableOtherLabel"),
  projectManagerType: document.querySelector("#projectManagerType"),
  projectManagerInternal: document.querySelector("#projectManagerInternal"),
  projectManagerInternalLabel: document.querySelector("#projectManagerInternalLabel"),
  projectManagerExternal: document.querySelector("#projectManagerExternal"),
  projectManagerExternalLabel: document.querySelector("#projectManagerExternalLabel"),
  deliverablesOptions: document.querySelector("#deliverablesOptions"),
  languageLabel: document.querySelector("#languageLabel"),
  deliverableOtherLabel: document.querySelector("#deliverableOtherLabel"),
  metricProgress: document.querySelector("#metricProgress"),
  metricStatus: document.querySelector("#metricStatus"),
  metricDeadline: document.querySelector("#metricDeadline"),
  projectDetails: document.querySelector("#projectDetails"),
  deleteProjectBtn: document.querySelector("#deleteProjectBtn"),
  projectInfoInput: document.querySelector("#projectInfoInput"),
  projectNotesBtn: document.querySelector("#projectNotesBtn"),
  projectNotesDialog: document.querySelector("#projectNotesDialog"),
  projectNotesInput: document.querySelector("#projectNotesInput"),
  projectNotesForm: document.querySelector("#projectNotesForm"),
  lessonsInput: document.querySelector("#lessonsInput"),
  deadlineAlerts: document.querySelector("#deadlineAlerts"),
  nextTasks: document.querySelector("#nextTasks"),
  ganttChart: document.querySelector("#ganttChart"),
  flowchart: document.querySelector("#flowchart"),
  ownerFilter: document.querySelector("#ownerFilter"),
  parkFilter: document.querySelector("#parkFilter"),
  taskBoard: document.querySelector("#taskBoard"),
  taskList: document.querySelector("#taskList"),
  planningGrid: document.querySelector("#planningGrid"),
  planningLegend: document.querySelector("#planningLegend"),
  planningRange: document.querySelector("#planningRange"),
  generalGanttChart: document.querySelector("#generalGanttChart"),
  negotiationProjects: document.querySelector("#negotiationProjects"),
  contractedProjects: document.querySelector("#contractedProjects"),
  plannerBoard: document.querySelector("#plannerBoard"),
  plannerDateInput: document.querySelector("#plannerDateInput"),
  plannerSourceFilter: document.querySelector("#plannerSourceFilter"),
  plannerUserSelect: document.querySelector("#plannerUserSelect"),
  plannerProjectSelect: document.querySelector("#plannerProjectSelect"),
  plannerTaskSelect: document.querySelector("#plannerTaskSelect"),
  plannerProjectManualInput: document.querySelector("#plannerProjectManualInput"),
  plannerWeeklyInput: document.querySelector("#plannerWeeklyInput"),
  plannerTextInput: document.querySelector("#plannerTextInput"),
  plannerForm: document.querySelector("#plannerForm"),
  plannerDoneRange: document.querySelector("#plannerDoneRange"),
  plannerDoneGroups: document.querySelector("#plannerDoneGroups"),
  coordinationBoard: document.querySelector("#coordinationBoard"),
  coordinationNotesBtn: document.querySelector("#coordinationNotesBtn"),
  coordinationNotesDialog: document.querySelector("#coordinationNotesDialog"),
  coordinationNotesInput: document.querySelector("#coordinationNotesInput"),
  coordinationNotesForm: document.querySelector("#coordinationNotesForm"),
  changeHistoryPanel: document.querySelector("#changeHistoryPanel"),
  changeHistoryList: document.querySelector("#changeHistoryList"),
  projectDialog: document.querySelector("#projectDialog"),
  projectForm: document.querySelector("#projectForm"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  taskOwnerType: document.querySelector("#taskOwnerType"),
  taskOwnerInternal: document.querySelector("#taskOwnerInternal"),
  taskOwnerInternalLabel: document.querySelector("#taskOwnerInternalLabel"),
  taskOwnerExternal: document.querySelector("#taskOwnerExternal"),
  taskOwnerExternalLabel: document.querySelector("#taskOwnerExternalLabel"),
  taskImagePreview: document.querySelector("#taskImagePreview"),
  taskCheckinProgress: document.querySelector("#taskCheckinProgress"),
  taskCheckinProgressBar: document.querySelector("#taskCheckinProgressBar"),
  taskCheckinList: document.querySelector("#taskCheckinList"),
  taskCheckinAdd: document.querySelector("#taskCheckinAdd"),
  taskCheckinInput: document.querySelector("#taskCheckinInput"),
  addCheckinBtn: document.querySelector("#addCheckinBtn"),
  saveCheckinBtn: document.querySelector("#saveCheckinBtn"),
  toggleCheckedCheckinsBtn: document.querySelector("#toggleCheckedCheckinsBtn"),
  splitDialog: document.querySelector("#splitDialog"),
  splitForm: document.querySelector("#splitForm"),
  deleteTaskBtn: document.querySelector("#deleteTaskBtn"),
  projectParksSection: document.querySelector("#projectParksSection"),
  projectParksList: document.querySelector("#projectParksList"),
  parkNameInput: document.querySelector("#parkNameInput"),
  parkTechnologyInput: document.querySelector("#parkTechnologyInput"),
  parkWtgInput: document.querySelector("#parkWtgInput"),
  parkCodInput: document.querySelector("#parkCodInput"),
  addParkBtn: document.querySelector("#addParkBtn"),
};

function loadState() {
  const saved = localStorage.getItem(storeKey);
  if (saved) return JSON.parse(saved);

  const today = isoDate(new Date());
  const add = (days) => isoDate(new Date(Date.now() + days * msDay));
  const sampleProject = {
    id: uid(),
    name: "Implantação do Portal de Atendimento",
    projectType: "LTE",
    projectTypeOther: "",
    deliverables: ["Relatório Final"],
    deliverableOther: "",
    language: "Português",
    goal: "Centralizar solicitações, dar visibilidade aos prazos e reduzir retrabalho entre as áreas.",
    manager: "Gabriel",
    people: "Gabriel\nProduto\nUX\nTecnologia\nOperações\nPMO",
    start: today,
    end: add(75),
    priority: "Alta",
    status: "Em andamento",
    tasks: [
      makeTask("Mapear escopo e stakeholders", "Gabriel", today, add(8), "concluido", 100),
      makeTask("Definir requisitos funcionais", "Produto", add(5), add(18), "andamento", 60),
      makeTask("Criar protótipo navegável", "UX", add(14), add(28), "revisao", 35),
      makeTask("Validar integrações", "Tecnologia", add(24), add(48), "standby", 20),
      makeTask("Treinar equipes piloto", "Operações", add(50), add(62), "afazer", 0),
      makeTask("Go-live assistido", "PMO", add(65), add(75), "aprovado", 0),
    ],
    updates: [
      {
        id: uid(),
        title: "Kickoff realizado",
        type: "Avanço",
        body: "Objetivo, papéis e ritos semanais foram alinhados com as áreas envolvidas.",
        date: today,
      },
    ],
  };
  return {
    activeProjectId: sampleProject.id,
    projects: [sampleProject],
    plannerItems: [],
    pipelineDrafts: [],
    planningProjectMeta: {},
    changeLog: [],
    coordinationNotes: "",
    lastSavedAt: "",
  };
}

function loadSessionUser() {
  const username = localStorage.getItem(sessionKey);
  return appUsers.find((user) => user.username === username) || null;
}

function isCoordinator() {
  return currentUser?.role === "coordinator";
}

async function requireLogin() {
  els.loginUser.innerHTML = appUsers.map((user) => `<option value="${escapeHtml(user.username)}">${escapeHtml(user.username)}</option>`).join("");
  if (!supabaseClient) {
    document.body.classList.add("auth-locked");
    els.loginScreen.classList.remove("hidden-field");
    els.loginError.textContent = "Supabase não carregou. Verifique a conexão com a internet.";
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    currentUser = mapSupabaseUser(data.session.user);
    await loadRemoteState();
  } else {
    currentUser = null;
    localStorage.removeItem(sessionKey);
  }
  if (currentUser) {
    showAuthenticatedApp();
    return;
  }
  document.body.classList.add("auth-locked");
  els.loginScreen.classList.remove("hidden-field");
}

function showAuthenticatedApp() {
  applyPlannerPreferencesForUser();
  document.body.classList.remove("auth-locked");
  els.loginScreen.classList.add("hidden-field");
  els.currentUserLabel.textContent = currentUser.username;
  applyUserPermissions();
  render();
}

function mapSupabaseUser(user) {
  const email = user.email || "";
  const localPart = email.split("@")[0] || "";
  const normalized = normalizeText(localPart);
  const knownNames = {
    anna: "Anna",
    annacaminha: "Anna",
    felipe: "Felipe",
    felipealves: "Felipe",
    gustavo: "Gustavo",
    gustavocarvalho: "Gustavo",
    vanderlania: "Vanderlania",
    vanderlaniabrito: "Vanderlania",
    ricardo: "Ricardo",
    gabriel: "Gabriel",
    gabrielgaarcia2929: "Coordenação",
    gabrielgarcia2929: "Coordenação",
    coordenacao: "Coordenação",
    coord: "Coordenação",
  };
  const username = knownNames[normalized] || user.user_metadata?.name || localPart || email || "Usuário";
  return {
    id: user.id,
    email,
    username,
    role: username === "Coordenação" ? "coordinator" : "member",
  };
}

function applyPlannerPreferencesForUser() {
  const preferences = state.plannerPreferences?.[currentUser?.username];
  if (!preferences) return;
  activePlannerView = preferences.activePlannerView || activePlannerView;
  plannerDate = normalizeDateValue(preferences.plannerDate || plannerDate);
  activePlannerSourceFilter = preferences.activePlannerSourceFilter || activePlannerSourceFilter;
  activePlannerUser = isCoordinator() ? state.activePlannerUser || currentUser?.username || "Coordenação" : currentUser?.username || "";
}

function applyUserPermissions() {
  const coordinationNav = document.querySelector('[data-view="coordination"]');
  coordinationNav.hidden = !isCoordinator();
  document.querySelector("#coordinationView").classList.toggle("restricted-view", !isCoordinator());
  if (els.deleteProjectBtn) els.deleteProjectBtn.hidden = !isCoordinator();
  activePlannerUser = isCoordinator() ? activePlannerUser || currentUser?.username || "Coordenação" : currentUser?.username || "";
  if (!isCoordinator() && activeViewName() === "coordination") {
    document.querySelector('[data-view="portfolio"]').click();
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function loadRemoteState() {
  if (!supabaseClient || !currentUser) return;
  setSaveStatus("saving", "Carregando dados...");
  const { data, error } = await supabaseClient.from("app_state").select("data, updated_at").eq("id", 1).single();
  if (error) {
    if (error.code === "PGRST116") {
      await saveStateToSupabase(true);
      remoteStateReady = true;
      hasUnsavedChanges = false;
      setSaveStatus("saved", "Tudo salvo");
      return;
    }
    console.error("Erro ao carregar dados do Supabase:", error);
    remoteStateReady = true;
    setSaveStatus("error", "Erro ao carregar");
    return;
  }
  remoteUpdatedAt = data?.updated_at || "";
  const remoteState = data?.data;
  if (remoteState?.projects?.length) {
    applyRemoteState(remoteState);
    state.lastSavedAt = state.lastSavedAt || remoteUpdatedAt;
    if (legacyPlannerItemsMerged) await saveStateToSupabase(true);
  } else {
    await saveStateToSupabase(true);
  }
  remoteStateReady = true;
  hasUnsavedChanges = false;
  setSaveStatus("saved", "Tudo salvo");
}

function applyRemoteState(remoteState) {
  const legacyPlannerItems = Array.isArray(state.plannerItems) ? state.plannerItems : [];
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, remoteState);
  state.projects = Array.isArray(state.projects) && state.projects.length ? state.projects : loadState().projects;
  state.projects.forEach(normalizeProject);
  state.plannerItems = mergeLegacyPlannerItems(Array.isArray(state.plannerItems) ? state.plannerItems : [], legacyPlannerItems);
  state.coordinationItems = Array.isArray(state.coordinationItems) ? state.coordinationItems : [];
  state.pipelineDrafts = Array.isArray(state.pipelineDrafts) ? state.pipelineDrafts : [];
  state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
  state.changeLog = Array.isArray(state.changeLog) ? state.changeLog : [];
  state.coordinationNotes = state.coordinationNotes || "";
  state.lastSavedAt = state.lastSavedAt || "";
  activeProjectId = state.activeProjectId || state.projects[0].id;
  if (!state.projects.some((item) => item.id === activeProjectId)) activeProjectId = state.projects[0].id;
  activeProjectView = state.activeProjectView || "kanban";
  planningDays = state.planningDays || 75;
  planningOffsetDays = state.planningOffsetDays ?? -21;
  activePlanningView = state.activePlanningView || "allocation";
  activePlannerView = state.activePlannerView || "day";
  activePlannerSourceFilter = state.activePlannerSourceFilter || "all";
  activePlannerUser = state.activePlannerUser || currentUser?.username || "";
  portfolioStatusFilter = state.portfolioStatusFilter || "all";
  plannerDate = normalizeDateValue(state.plannerDate || new Date());
}

function mergeLegacyPlannerItems(remoteItems, legacyItems) {
  const merged = remoteItems.map(normalizePlannerItem);
  const existing = new Set(merged.map(plannerItemKey));
  legacyItems
    .filter((item) => item && !item.user && item.text)
    .map((item) => normalizePlannerItem({ ...item, user: "Coordenação" }))
    .forEach((item) => {
      const key = plannerItemKey(item);
      if (existing.has(key)) return;
      merged.push(item);
      existing.add(key);
      legacyPlannerItemsMerged = true;
    });
  return merged;
}

function plannerItemKey(item) {
  return [item.id || "", item.text || "", item.date || "", item.projectName || ""].join("|");
}

function setSaveStatus(mode, text) {
  saveStatusMode = mode;
  if (!els.saveStatus || !els.saveStatusText || !els.saveChangesBtn) return;
  els.saveStatus.classList.remove("saved", "unsaved", "saving", "conflict", "error");
  els.saveStatus.classList.add(mode);
  const savedAt = state.lastSavedAt ? ` às ${formatTime(state.lastSavedAt)}` : "";
  els.saveStatusText.textContent = mode === "saved" ? `${text} em ${currentAreaLabel()}${savedAt}` : text;
  els.saveChangesBtn.disabled = mode === "saving" || !hasUnsavedChanges;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function currentAreaLabel() {
  const labels = {
    portfolio: "Projetos",
    project: "Projeto ativo",
    planning: "Planejamento",
    planner: "Planner",
    coordination: "Coordenação",
  };
  return labels[activeViewName()] || "Aplicativo";
}

function registerChange() {
  if (!currentUser) return;
  state.changeLog = Array.isArray(state.changeLog) ? state.changeLog : [];
  const area = currentAreaLabel();
  const target = area === "Projeto ativo" ? project()?.name || "Projeto" : area;
  const previous = state.changeLog[0];
  const now = new Date().toISOString();
  if (previous && previous.user === currentUser.username && previous.area === area && previous.target === target && Date.now() - new Date(previous.at).getTime() < 15000) {
    previous.at = now;
    return;
  }
  state.changeLog.unshift({
    id: uid(),
    user: currentUser.username,
    area,
    target,
    at: now,
  });
  state.changeLog = state.changeLog.slice(0, 120);
}

function markUnsavedChanges() {
  if (!remoteStateReady || !currentUser) return;
  hasUnsavedChanges = true;
  setSaveStatus("unsaved", "Alterações não salvas");
  scheduleRemoteStateSave();
}

function scheduleRemoteStateSave(delay = 1200) {
  if (!supabaseClient || !currentUser || !remoteStateReady) return;
  window.clearTimeout(remoteSaveTimer);
  remoteSaveTimer = window.setTimeout(() => saveStateToSupabase(), delay);
}

function mergeById(remoteItems = [], localItems = []) {
  const merged = new Map();
  remoteItems.filter(Boolean).forEach((item) => merged.set(item.id || uid(), item));
  localItems.filter(Boolean).forEach((item) => merged.set(item.id || uid(), item));
  return [...merged.values()];
}

function mergeTasks(remoteTasks = [], localTasks = []) {
  const remoteById = new Map(remoteTasks.map((task) => [task.id, task]));
  return mergeById(remoteTasks, localTasks).map((task) => {
    const remoteTask = remoteById.get(task.id);
    if (!remoteTask) return task;
    return {
      ...remoteTask,
      ...task,
      checkins: mergeById(remoteTask.checkins || [], task.checkins || []),
      checkinGroups: mergeCheckinGroups(remoteTask.checkinGroups || [], task.checkinGroups || []),
      completedPlannerItems: mergeById(remoteTask.completedPlannerItems || [], task.completedPlannerItems || []),
    };
  });
}

function mergeCheckinGroups(remoteGroups = [], localGroups = []) {
  const remoteById = new Map(remoteGroups.map((group) => [group.id, group]));
  return mergeById(remoteGroups, localGroups).map((group) => {
    const remoteGroup = remoteById.get(group.id);
    if (!remoteGroup) return group;
    return {
      ...remoteGroup,
      ...group,
      items: mergeById(remoteGroup.items || [], group.items || []),
    };
  });
}

function mergeProjects(remoteProjects = [], localProjects = []) {
  const remoteById = new Map(remoteProjects.map((projectItem) => [projectItem.id, projectItem]));
  return mergeById(remoteProjects, localProjects).map((projectItem) => {
    const remoteProject = remoteById.get(projectItem.id);
    if (!remoteProject) return projectItem;
    return {
      ...remoteProject,
      ...projectItem,
      tasks: mergeTasks(remoteProject.tasks || [], projectItem.tasks || []),
      completedPlannerItems: mergeById(remoteProject.completedPlannerItems || [], projectItem.completedPlannerItems || []),
    };
  });
}

function mergeRemoteStateIntoLocal(remoteState) {
  if (!remoteState?.projects?.length) return;
  state.projects = mergeProjects(remoteState.projects || [], state.projects || []);
  state.plannerItems = mergeById(remoteState.plannerItems || [], state.plannerItems || []);
  state.coordinationItems = mergeById(remoteState.coordinationItems || [], state.coordinationItems || []);
  state.pipelineDrafts = mergeById(remoteState.pipelineDrafts || [], state.pipelineDrafts || []);
  state.changeLog = mergeById(remoteState.changeLog || [], state.changeLog || []).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 120);
  state.coordinationNotes = state.coordinationNotes || remoteState.coordinationNotes || "";
  state.lastSavedAt = state.lastSavedAt || remoteState.lastSavedAt || "";
  state.plannerPreferences = { ...(remoteState.plannerPreferences || {}), ...(state.plannerPreferences || {}) };
  state.planningProjectMeta = { ...(remoteState.planningProjectMeta || {}), ...(state.planningProjectMeta || {}) };
}

async function saveStateToSupabase(force = false) {
  if (!supabaseClient || !currentUser || (!remoteStateReady && !force)) return;
  if (remoteSaveInFlight) {
    remoteSaveQueued = true;
    return;
  }
  remoteSaveInFlight = true;
  setSaveStatus("saving", "Salvando...");
  if (!force && remoteUpdatedAt) {
    const { data: latest, error: latestError } = await supabaseClient.from("app_state").select("data, updated_at").eq("id", 1).single();
    if (latestError) {
      console.error("Erro ao conferir versão no Supabase:", latestError);
      setSaveStatus("error", "Erro ao conferir versão");
      remoteSaveInFlight = false;
      return;
    }
    const latestUpdatedAt = latest?.updated_at || "";
    if (latestUpdatedAt && latestUpdatedAt !== remoteUpdatedAt) {
      mergeRemoteStateIntoLocal(latest.data);
      remoteUpdatedAt = latestUpdatedAt;
      localStorage.setItem(storeKey, JSON.stringify(state));
    }
  }
  const nextUpdatedAt = new Date().toISOString();
  state.lastSavedAt = nextUpdatedAt;
  const payload = JSON.parse(JSON.stringify(state));
  const { error } = await supabaseClient.from("app_state").upsert({
    id: 1,
    data: payload,
    updated_at: nextUpdatedAt,
  });
  if (error) {
    console.error("Erro ao salvar dados no Supabase:", error);
    setSaveStatus("error", "Erro ao salvar");
    remoteSaveInFlight = false;
    return;
  }
  remoteUpdatedAt = nextUpdatedAt;
  localStorage.setItem(storeKey, JSON.stringify(state));
  hasUnsavedChanges = false;
  setSaveStatus("saved", "Tudo salvo");
  remoteSaveInFlight = false;
  if (remoteSaveQueued) {
    remoteSaveQueued = false;
    scheduleRemoteStateSave(300);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  els.loginError.textContent = "";
  const selectedUser = appUsers.find((user) => user.username === els.loginUser.value);
  const email = selectedUser?.email || els.loginUser.value.trim();
  const password = els.loginPassword.value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const message = error?.message || "";
    if (/email not confirmed/i.test(message)) {
      els.loginError.textContent = "Este usuário ainda não foi confirmado no Supabase.";
    } else if (/invalid login credentials/i.test(message)) {
      els.loginError.textContent = "E-mail ou senha inválidos. Confira se o usuário foi criado e confirmado no Supabase.";
    } else {
      els.loginError.textContent = message || "Não foi possível entrar. Verifique o usuário no Supabase.";
    }
    return;
  }
  currentUser = mapSupabaseUser(data.user);
  localStorage.setItem(sessionKey, currentUser.username);
  els.loginPassword.value = "";
  await loadRemoteState();
  showAuthenticatedApp();
}

async function logout() {
  await supabaseClient?.auth.signOut();
  localStorage.removeItem(sessionKey);
  currentUser = null;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector('[data-view="portfolio"]').classList.add("active");
  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
  document.querySelector("#portfolioView").classList.add("active");
  requireLogin();
}

function makeTask(title, owner, start, end, status = "afazer", progress = 0, dependsOn = "") {
  return {
    id: uid(),
    title,
    owner,
    start,
    end,
    status,
    progress,
    dependsOn,
    notes: "",
    description: "",
    checklist: "",
    attachments: "",
    comments: "",
    labels: "",
    imageData: "",
    isMilestone: false,
  };
}

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeTask(task) {
  task.status = legacyStatusMap[task.status] || task.status || "afazer";
  if (!statusLabels[task.status]) task.status = "afazer";
  task.parkId = task.parkId ?? "";
  task.start = normalizeDateValue(task.start);
  task.end = normalizeDateValue(task.end);
  task.dependsOn = task.dependsOn ?? "";
  task.dependsOnIds = Array.isArray(task.dependsOnIds) ? task.dependsOnIds : splitLinesOrComma(task.dependsOn);
  task.description = task.description ?? task.notes ?? "";
  task.checklist = task.checklist ?? "";
  task.attachments = task.attachments ?? "";
  task.comments = task.comments ?? "";
  task.labels = task.labels ?? "";
  task.imageData = task.imageData ?? "";
  task.checkins = Array.isArray(task.checkins) ? task.checkins.map(normalizeCheckin) : [];
  task.checkinGroups = Array.isArray(task.checkinGroups) && task.checkinGroups.length
    ? task.checkinGroups.map(normalizeCheckinGroup)
    : task.checkins.length ? [{ id: uid(), title: "Check-in", items: task.checkins }] : [];
  task.completedPlannerItems = Array.isArray(task.completedPlannerItems) ? task.completedPlannerItems : [];
  task.isMilestone = task.isMilestone === true || task.isMilestone === "true";
  return task;
}

function normalizeCheckinGroup(group) {
  return {
    id: group.id || uid(),
    title: group.title || "Check-in",
    items: Array.isArray(group.items) ? group.items.map(normalizeCheckin) : [],
    createdAt: Number(group.createdAt || Date.now()),
  };
}

function normalizeCheckin(item) {
  return {
    id: item.id || uid(),
    text: item.text || "",
    done: item.done === true || item.done === "true",
    createdAt: Number(item.createdAt || Date.now()),
    doneAt: item.doneAt || "",
  };
}

function normalizeProject(item) {
  item.people = item.people ?? "";
  item.manager = item.manager ?? "";
  item.information = item.information ?? "";
  item.notesBlock = item.notesBlock ?? "";
  item.lessonsLearned = item.lessonsLearned ?? "";
  item.start = normalizeDateValue(item.start);
  item.end = normalizeDateValue(item.end);
  item.projectType = item.projectType ?? inferProjectType(item.name);
  item.projectTypeOther = item.projectTypeOther ?? "";
  item.projectVariables = Array.isArray(item.projectVariables) ? item.projectVariables : splitLinesOrComma(item.projectVariables);
  item.projectVariableOther = item.projectVariableOther ?? "";
  item.parks = Array.isArray(item.parks) ? item.parks.map(normalizePark) : [];
  item.deliverables = Array.isArray(item.deliverables) ? item.deliverables : splitLinesOrComma(item.deliverables);
  item.deliverableOther = item.deliverableOther ?? "";
  item.language = item.language ?? "";
  item.completedPlannerItems = Array.isArray(item.completedPlannerItems) ? item.completedPlannerItems : [];
  return item;
}

function normalizePark(park) {
  return {
    id: park.id || uid(),
    name: park.name || "",
    technology: park.technology || "",
    wtg: park.wtg || "",
    cod: park.cod || "",
  };
}

function inferProjectType(name) {
  const value = String(name || "").toUpperCase();
  return ["TQI", "DD", "ARBITRAGEM", "RCA", "LTE"].find((type) => value.includes(type)) || "Outro";
}

function projectTypeLabel(item) {
  return item.projectType === "Outro" ? item.projectTypeOther || "Outro" : item.projectType || "-";
}

function deliverablesLabel(item) {
  const selected = [...(item.deliverables || [])];
  if (selected.includes("Outro") && item.deliverableOther) {
    selected[selected.indexOf("Outro")] = item.deliverableOther;
  }
  return selected.length ? selected.join(", ") : "-";
}

function projectVariablesLabel(item) {
  const selected = [...(item.projectVariables || [])];
  if (selected.includes("Outro") && item.projectVariableOther) {
    selected[selected.indexOf("Outro")] = item.projectVariableOther;
  }
  return selected.length ? selected.join(", ") : "-";
}

function projectParksLabel(item) {
  return item.parks?.length
    ? item.parks.map((park) => `${park.name}${park.technology ? ` (${park.technology})` : ""}`).join(", ")
    : "-";
}

function saveState(markDirty = true) {
  state.activeProjectId = activeProjectId;
  state.activeProjectView = activeProjectView;
  state.portfolioStatusFilter = portfolioStatusFilter;
  state.planningDays = planningDays;
  state.planningOffsetDays = planningOffsetDays;
  state.activePlanningView = activePlanningView;
  state.activePlannerUser = activePlannerUser;
  state.activePlannerSourceFilter = activePlannerSourceFilter;
  state.plannerPreferences = state.plannerPreferences || {};
  if (currentUser) {
    state.plannerPreferences[currentUser.username] = {
      activePlannerView,
      plannerDate,
      activePlannerSourceFilter,
    };
  } else {
    state.activePlannerView = activePlannerView;
    state.plannerDate = plannerDate;
  }
  state.plannerItems = state.plannerItems || [];
  state.coordinationItems = state.coordinationItems || [];
  state.pipelineDrafts = state.pipelineDrafts || [];
  state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
  state.changeLog = Array.isArray(state.changeLog) ? state.changeLog : [];
  state.coordinationNotes = state.coordinationNotes || "";
  if (markDirty) registerChange();
  localStorage.setItem(storeKey, JSON.stringify(state));
  if (markDirty) createAutomaticBackup();
  if (markDirty) markUnsavedChanges();
}

function createAutomaticBackup() {
  const now = Date.now();
  const backups = JSON.parse(localStorage.getItem(backupKey) || "[]");
  const latest = backups[0];
  if (latest && now - latest.createdAt < 10 * 60 * 1000) return;
  const snapshot = JSON.parse(JSON.stringify(state));
  backups.unshift({
    id: uid(),
    createdAt: now,
    createdBy: currentUser?.username || "Usuário",
    data: snapshot,
  });
  localStorage.setItem(backupKey, JSON.stringify(backups.slice(0, 12)));
}

function exportFullBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: currentUser?.username || "",
    state,
    localBackups: JSON.parse(localStorage.getItem(backupKey) || "[]"),
  };
  downloadJson(payload, `backup-gestao-projetos-${isoDate(new Date())}.json`);
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function project() {
  return state.projects.find((item) => item.id === activeProjectId) || state.projects[0];
}

function deleteActiveProject() {
  if (!isCoordinator()) return;
  const current = project();
  if (!current) return;
  if (state.projects.length <= 1) {
    alert("Mantenha pelo menos um projeto cadastrado.");
    return;
  }
  const firstConfirmation = confirm(`Excluir o projeto "${current.name}"? Esta ação remove todas as tarefas e informações dele.`);
  if (!firstConfirmation) return;
  const secondConfirmation = confirm("Confirma definitivamente a exclusão deste projeto?");
  if (!secondConfirmation) return;
  state.projects = state.projects.filter((item) => item.id !== current.id);
  state.plannerItems = (state.plannerItems || [])
    .filter((item) => item.sourceProjectId !== current.id)
    .map((item) => (item.projectId === current.id ? { ...item, projectId: "", projectName: current.name || item.projectName } : item));
  activeProjectId = state.projects[0]?.id || "";
  document.querySelector('[data-view="portfolio"]').click();
  render();
  saveState();
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value) {
  if (value instanceof Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  const text = String(value || "").trim();
  if (!text) return new Date(NaN);
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  const brMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (brMatch) {
    const year = brMatch[3].length === 2 ? Number(`20${brMatch[3]}`) : Number(brMatch[3]);
    return new Date(year, Number(brMatch[2]) - 1, Number(brMatch[1]));
  }
  const parsed = new Date(text);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function normalizeDateValue(value) {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / msDay);
}

function formatDate(value) {
  if (!value) return "-";
  return parseDate(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatShortDate(date) {
  return parseDate(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function render() {
  if (!currentUser) return;
  state.plannerItems = Array.isArray(state.plannerItems) ? state.plannerItems.map(normalizePlannerItem) : [];
  state.coordinationItems = Array.isArray(state.coordinationItems) ? state.coordinationItems.map(normalizeCoordinationItem) : [];
  state.pipelineDrafts = Array.isArray(state.pipelineDrafts) ? state.pipelineDrafts : [];
  state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
  state.changeLog = Array.isArray(state.changeLog) ? state.changeLog : [];
  state.coordinationNotes = state.coordinationNotes || "";
  state.lastSavedAt = state.lastSavedAt || "";
  renderResponsibleSelects();
  state.projects.forEach(normalizeProject);
  const didAutoSyncPlanner = syncAllProjectTasksToPlanner();
  const current = project();
  current.tasks.forEach(normalizeTask);
  renderPageTitle();
  renderProjectSelect();
  renderProjectPortfolio();
  renderDeadlineAlerts();
  renderMetrics(current);
  renderDetails(current);
  renderProjectTextFields(current);
  renderNextTasks(current);
  renderFilters(current);
  renderGantt(current);
  renderDependencyFlowchart(current);
  renderBoard(current);
  renderTaskList(current);
  renderPlanning();
  renderPlanner();
  renderCoordination();
  applyUserPermissions();
  fillTaskSelects(current);
  renderProjectDisplayMode();
  saveState(didAutoSyncPlanner);
}

function activeViewName() {
  return document.querySelector(".view.active")?.id?.replace("View", "") || "portfolio";
}

function renderPageTitle() {
  const current = project();
  const view = activeViewName();
  if (view === "portfolio") {
    els.pageEyebrow.textContent = "Carteira de projetos";
    els.projectTitle.textContent = "Projetos";
    return;
  }
  if (view === "planning") {
    els.pageEyebrow.textContent = "Planejamento";
    els.projectTitle.textContent = "Alocação da equipe";
    return;
  }
  if (view === "planner") {
    els.pageEyebrow.textContent = "Planner";
    els.projectTitle.textContent = "Rotina e To do";
    return;
  }
  if (view === "coordination") {
    els.pageEyebrow.textContent = "Coordenação";
    els.projectTitle.textContent = "Atividades da equipe";
    return;
  }
  els.pageEyebrow.textContent = "Projeto ativo";
  els.projectTitle.textContent = current.name;
}

function renderProjectSelect() {
  els.projectSelect.innerHTML = state.projects
    .map((item) => `<option value="${item.id}" ${item.id === activeProjectId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
    .join("");
}

function renderProjectPortfolio() {
  renderPortfolioStatusFilter();
  const projects = state.projects.filter((item) => portfolioStatusFilter === "all" || item.status === portfolioStatusFilter);
  els.projectPortfolio.innerHTML = projects.length ? projects
    .map((item) => {
      normalizeProject(item);
      item.tasks.forEach(normalizeTask);
      const total = item.tasks.length;
      const progress = total ? Math.round(item.tasks.reduce((sum, task) => sum + Number(task.progress), 0) / total) : 0;
      const open = item.tasks.filter((task) => task.status !== "concluido").length;
      const next = item.tasks
        .filter((task) => task.status !== "concluido")
        .sort((a, b) => parseDate(a.end) - parseDate(b.end))[0];
      return `<article class="project-card ${item.id === activeProjectId ? "active" : ""}" data-open-project="${item.id}">
        <header>
          <span class="status">${escapeHtml(projectTypeLabel(item))}</span>
          <button type="button" data-open-project="${item.id}">Abrir</button>
        </header>
        <h2>${escapeHtml(item.name)}</h2>
        <p>${escapeHtml(item.goal || "Sem descrição informada.")}</p>
        <div class="progress" title="${progress}% concluído"><span style="width:${progress}%"></span></div>
        <dl>
          <div><dt>Responsável</dt><dd>${escapeHtml(item.manager || "-")}</dd></div>
          <div><dt>Tarefas abertas</dt><dd>${open}</dd></div>
          <div><dt>Próximo prazo</dt><dd>${next ? formatDate(next.end) : "-"}</dd></div>
        </dl>
      </article>`;
    })
    .join("") : empty("Nenhum projeto encontrado para este status.");
}

function renderPortfolioStatusFilter() {
  if (!els.portfolioStatusFilter) return;
  const statuses = Array.from(new Set(state.projects.map((item) => item.status).filter(Boolean))).sort();
  els.portfolioStatusFilter.innerHTML = `<option value="all">Todos os status</option>${statuses
    .map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`)
    .join("")}`;
  els.portfolioStatusFilter.value = statuses.includes(portfolioStatusFilter) ? portfolioStatusFilter : "all";
  portfolioStatusFilter = els.portfolioStatusFilter.value;
}

function renderMetrics(current) {
  const tasks = current.tasks;
  const progress = tasks.length ? Math.round(tasks.reduce((sum, item) => sum + Number(item.progress), 0) / tasks.length) : 0;
  els.metricProgress.textContent = `${progress}%`;
  els.metricStatus.textContent = current.status || "-";
  els.metricDeadline.textContent = formatDate(current.end);
}

function renderDetails(current) {
  const details = [
    ["Tipo", projectTypeLabel(current)],
    ...(current.projectVariables?.length ? [["Variáveis", projectVariablesLabel(current)]] : []),
    ...(current.parks?.length ? [["Parques", projectParksLabel(current)]] : []),
    ["Entregáveis", deliverablesLabel(current)],
    ...(current.deliverables?.includes("Relatório Final") ? [["Idioma", current.language || "-"]] : []),
    ["Descrição", current.goal],
    ["Responsável", current.manager || "-"],
    ["Período", `${formatDate(current.start)} a ${formatDate(current.end)}`],
    ["Prioridade", current.priority],
    ["Status", current.status],
    ...((current.completedPlannerItems || []).length ? [["Planner concluído", `${current.completedPlannerItems.length} atividade${current.completedPlannerItems.length > 1 ? "s" : ""}`]] : []),
  ];
  els.projectDetails.innerHTML = details.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join("");
}

function renderProjectTextFields(current) {
  els.projectInfoInput.value = current.information || "";
  els.lessonsInput.value = current.lessonsLearned || "";
}

function renderNextTasks(current) {
  const tasks = current.tasks
    .filter((item) => item.status !== "concluido")
    .sort((a, b) => parseDate(a.end) - parseDate(b.end))
    .slice(0, 5);
  els.nextTasks.innerHTML = tasks.length ? tasks.map(taskCard).join("") : empty("Nenhuma ação aberta.");
}

function renderDeadlineAlerts() {
  if (!els.deadlineAlerts) return;
  const view = activeViewName();
  const shouldShowProjectAlerts = view === "project";
  const shouldShowCoordinationAlerts = view === "coordination" && isCoordinator();
  if (!shouldShowProjectAlerts && !shouldShowCoordinationAlerts) {
    els.deadlineAlerts.classList.add("hidden-field");
    els.deadlineAlerts.innerHTML = "";
    return;
  }
  const today = parseDate(isoDate(new Date()));
  const alerts = [];
  const projectsToCheck = shouldShowProjectAlerts ? [project()] : state.projects;
  projectsToCheck.forEach((projectItem) => {
    normalizeProject(projectItem);
    projectItem.tasks.forEach((task) => {
      normalizeTask(task);
      if (task.status === "concluido") return;
      const days = daysBetween(isoDate(today), task.end);
      if (days < 0) alerts.push({ type: "late", text: `${projectItem.name}: ${task.title} atrasada desde ${formatDate(task.end)}` });
      else if (days <= 7) alerts.push({ type: "soon", text: `${projectItem.name}: ${task.title} vence em ${days} dia${days === 1 ? "" : "s"}` });
    });
  });
  const visible = alerts.slice(0, 4);
  els.deadlineAlerts.classList.toggle("hidden-field", !visible.length);
  els.deadlineAlerts.innerHTML = visible.map((alert) => `<span class="deadline-alert ${alert.type}">${escapeHtml(alert.text)}</span>`).join("");
}

function parkName(current, parkId) {
  return (current.parks || []).find((park) => park.id === parkId)?.name || "";
}

function renderFilters(current) {
  const owners = Array.from(new Set(current.tasks.map((item) => item.owner).filter(Boolean))).sort();
  const selected = els.ownerFilter.value || "all";
  els.ownerFilter.innerHTML = `<option value="all">Todos os responsáveis</option>${owners
    .map((owner) => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`)
    .join("")}`;
  els.ownerFilter.value = owners.includes(selected) ? selected : "all";
  const parks = current.parks || [];
  const selectedPark = els.parkFilter.value || "all";
  els.parkFilter.innerHTML = `<option value="all">Todos os parques</option><option value="none">Sem parque vinculado</option>${parks
    .map((park) => `<option value="${park.id}">${escapeHtml(park.name)}</option>`)
    .join("")}`;
  els.parkFilter.value = selectedPark === "none" || parks.some((park) => park.id === selectedPark) ? selectedPark : "all";
}

function filteredTasks(current) {
  const owner = els.ownerFilter.value || "all";
  const park = els.parkFilter.value || "all";
  return current.tasks.filter((task) => {
    const ownerOk = owner === "all" || task.owner === owner;
    const parkOk = park === "all" || (park === "none" ? !task.parkId : task.parkId === park);
    return ownerOk && parkOk;
  });
}

function renderGantt(current) {
  const tasks = filteredTasks(current).sort((a, b) => parseDate(a.start) - parseDate(b.start));
  if (!tasks.length) {
    els.ganttChart.style.width = "";
    els.ganttChart.style.minWidth = "";
    els.ganttChart.innerHTML = empty("Nenhuma tarefa encontrada para os filtros.");
    return;
  }

  const min = tasks.reduce((value, item) => (parseDate(item.start) < parseDate(value) ? item.start : value), tasks[0].start);
  const max = tasks.reduce((value, item) => (parseDate(item.end) > parseDate(value) ? item.end : value), tasks[0].end);
  const step = ganttScale === "week" ? 7 : 1;
  const totalDays = Math.max(daysBetween(min, max) + 1, 1);
  const cells = Math.ceil(totalDays / step);
  const cellWidth = ganttScale === "week" ? 92 : 46;
  const timelineWidth = cells * cellWidth;
  const dates = Array.from({ length: cells }, (_, index) => {
    const date = new Date(parseDate(min).getTime() + index * step * msDay);
    return `<div class="gantt-date">${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</div>`;
  }).join("");

  const rows = tasks
    .map((task) => {
      const left = Math.max(0, (daysBetween(min, task.start) / step) * cellWidth);
      const width = Math.max(18, ((daysBetween(task.start, task.end) + 1) / step) * cellWidth);
      return `<div class="gantt-row" style="grid-template-columns:240px ${timelineWidth}px">
        <div class="gantt-task-label">
          <strong>${escapeHtml(task.title)}${task.isMilestone ? " · Marco" : ""}</strong>
          <small>${escapeHtml(task.owner)} · ${formatDate(task.start)} a ${formatDate(task.end)}</small>
        </div>
        <div class="gantt-track" style="--cell-width:${cellWidth}px;width:${timelineWidth}px">
          <button class="gantt-bar bar-${task.status}" data-edit-task="${task.id}" style="left:${left}px;width:${width}px">${task.progress}%</button>
        </div>
      </div>`;
    })
    .join("");

  els.ganttChart.style.gridTemplateRows = `auto repeat(${tasks.length}, auto)`;
  els.ganttChart.style.width = `${240 + timelineWidth}px`;
  els.ganttChart.style.minWidth = `${240 + timelineWidth}px`;
  els.ganttChart.innerHTML = `<div class="gantt-header" style="grid-template-columns:240px ${timelineWidth}px">
    <div class="gantt-label">Tarefa</div>
    <div class="gantt-dates" style="grid-template-columns:repeat(${cells}, ${cellWidth}px)">${dates}</div>
  </div>${rows}`;
}

function renderFlowchart(current) {
  const tasks = current.tasks.map(normalizeTask);
  if (!tasks.length) {
    els.flowchart.innerHTML = empty("Nenhuma tarefa cadastrada para gerar o fluxograma.");
    return;
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const childrenByParent = new Map();
  tasks.forEach((task) => {
    taskDependencyIds(task).forEach((dependencyId) => {
      if (!taskById.has(dependencyId)) return;
      if (!childrenByParent.has(dependencyId)) childrenByParent.set(dependencyId, []);
      childrenByParent.get(dependencyId).push(task);
    });
  });

  const roots = tasks.filter((task) => !taskDependencyIds(task).some((dependencyId) => taskById.has(dependencyId)));
  const visited = new Set();

  function node(task, depth = 0, hasParent = false) {
    visited.add(task.id);
    const children = (childrenByParent.get(task.id) || []).sort((a, b) => parseDate(a.start) - parseDate(b.start));
    const dependency = hasParent ? `<span class="flow-dependency">depende da etapa anterior</span>` : `<span class="flow-dependency root">início do fluxo</span>`;
    return `<div class="flow-row ${hasParent ? "has-parent" : "root"}" style="--depth:${depth}">
      <article class="flow-node status-${task.status}">
        <header>
          <strong>${escapeHtml(task.title)}</strong>
          <span>${statusLabels[task.status] || task.status}</span>
        </header>
        <p>${escapeHtml(task.owner || "Sem responsável")}</p>
        <small>${dependency}${formatDate(task.start)} a ${formatDate(task.end)}</small>
      </article>
    </div>${children.map((child) => node(child, depth + 1, true)).join("")}`;
  }

  const sortedRoots = roots.sort((a, b) => parseDate(a.start) - parseDate(b.start));
  const content = sortedRoots.map((task) => node(task)).join("");
  const remaining = tasks.filter((task) => !visited.has(task.id)).map((task) => node(task)).join("");
  els.flowchart.innerHTML = `<div class="flow-lane">${content}${remaining}</div>`;
}

function renderDependencyFlowchart(current) {
  const tasks = current.tasks.map(normalizeTask);
  if (!tasks.length) {
    els.flowchart.innerHTML = empty("Nenhuma tarefa cadastrada para gerar o fluxograma.");
    return;
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const depthCache = new Map();

  function taskDepth(task, path = new Set()) {
    if (depthCache.has(task.id)) return depthCache.get(task.id);
    if (path.has(task.id)) return 0;
    const nextPath = new Set(path);
    nextPath.add(task.id);
    const dependencies = taskDependencyIds(task).filter((dependencyId) => taskById.has(dependencyId));
    const depth = dependencies.length ? 1 + Math.max(...dependencies.map((dependencyId) => taskDepth(taskById.get(dependencyId), nextPath))) : 0;
    depthCache.set(task.id, depth);
    return depth;
  }

  const groups = tasks
    .map((task) => ({ task, depth: taskDepth(task) }))
    .sort((a, b) => a.depth - b.depth || parseDate(a.task.start) - parseDate(b.task.start))
    .reduce((acc, item) => {
      if (!acc.has(item.depth)) acc.set(item.depth, []);
      acc.get(item.depth).push(item.task);
      return acc;
    }, new Map());
  const levels = [...groups.entries()].sort(([a], [b]) => a - b);
  const cardWidth = 230;
  const cardHeight = 122;
  const gapX = 38;
  const gapY = 76;
  const maxColumns = Math.max(...levels.map(([, group]) => group.length));
  const canvasWidth = Math.max(760, maxColumns * cardWidth + Math.max(0, maxColumns - 1) * gapX + 80);
  const canvasHeight = levels.length * cardHeight + Math.max(0, levels.length - 1) * gapY + 60;
  const positions = new Map();

  const cards = levels
    .map(([depth, group], levelIndex) => {
      const rowWidth = group.length * cardWidth + Math.max(0, group.length - 1) * gapX;
      const startX = Math.max(30, (canvasWidth - rowWidth) / 2);
      return group
        .map((task, index) => {
          const x = startX + index * (cardWidth + gapX);
          const y = 30 + levelIndex * (cardHeight + gapY);
          positions.set(task.id, { x, y });
          const checkins = task.checkins || [];
          const doneCheckins = checkins.filter((item) => item.done).length;
          return `<article class="flow-card status-${task.status}" data-edit-task="${task.id}" style="left:${x}px;top:${y}px;width:${cardWidth}px;min-height:${cardHeight}px">
            <div class="flow-card-top">
              <span>${escapeHtml(projectTypeLabel(current))}</span>
              <button type="button" data-edit-task="${task.id}">...</button>
            </div>
            <strong>${escapeHtml(task.title)}</strong>
            <p>${escapeHtml(task.owner || "Sem responsável")}</p>
            <div class="flow-card-meta">
              <span>${statusLabels[task.status] || task.status}</span>
              <span>${formatDate(task.start)} a ${formatDate(task.end)}</span>
            </div>
            <small>${checkins.length ? `${doneCheckins}/${checkins.length} check-ins` : `${Number(task.progress || 0)}%`}</small>
          </article>`;
        })
        .join("");
    })
    .join("");

  const connectors = tasks.flatMap((task) => {
    const child = positions.get(task.id);
    if (!child) return [];
    return taskDependencyIds(task)
      .filter((dependencyId) => positions.has(dependencyId))
      .map((dependencyId) => {
        const parent = positions.get(dependencyId);
        const startX = parent.x + cardWidth / 2;
        const startY = parent.y + cardHeight;
        const endX = child.x + cardWidth / 2;
        const endY = child.y;
        const midY = startY + Math.max(24, (endY - startY) / 2);
        return `<path d="M ${startX} ${startY} V ${midY} H ${endX} V ${endY}" />`;
      });
  }).join("");

  els.flowchart.innerHTML = `<div class="flow-canvas" style="width:${canvasWidth}px;height:${canvasHeight}px">
    <svg class="flow-lines" viewBox="0 0 ${canvasWidth} ${canvasHeight}" aria-hidden="true">${connectors}</svg>
    ${cards}
  </div>`;
}

function taskDependencyIds(task) {
  const ids = Array.isArray(task.dependsOnIds) ? [...task.dependsOnIds] : [];
  if (task.dependsOn && !ids.includes(task.dependsOn)) ids.push(task.dependsOn);
  return ids.filter(Boolean);
}

function businessDatesBetween(startValue, endValue) {
  const dates = [];
  let cursor = parseDate(startValue);
  const end = parseDate(endValue);
  while (cursor <= end) {
    if (isBusinessDay(cursor)) dates.push(normalizeDateValue(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function taskDependencyDepth(current, task, cache = new Map(), path = new Set()) {
  if (!task?.id) return 0;
  if (cache.has(task.id)) return cache.get(task.id);
  if (path.has(task.id)) return 0;
  path.add(task.id);
  const dependencies = taskDependencyIds(task)
    .map((id) => current.tasks.find((candidate) => candidate.id === id))
    .filter(Boolean);
  const depth = dependencies.length
    ? 1 + Math.max(...dependencies.map((dependency) => taskDependencyDepth(current, dependency, cache, path)))
    : 0;
  path.delete(task.id);
  cache.set(task.id, depth);
  return depth;
}

function plannerDependencyRank(item) {
  if (!item?.taskId || !item.projectId) return 9999;
  const linkedProject = state.projects.find((projectItem) => projectItem.id === item.projectId);
  const linkedTask = linkedProject?.tasks?.find((task) => task.id === item.taskId);
  if (!linkedProject || !linkedTask) return 9999;
  return taskDependencyDepth(linkedProject, linkedTask);
}

function taskPlannerOwner(task) {
  if (samePerson(task.owner, "Gabriel")) return "Coordenação";
  return engineeringMembers.find((name) => samePerson(name, task.owner)) || "";
}

function syncTaskPlannerCards(current, task) {
  normalizeProject(current);
  normalizeTask(task);
  const owner = taskPlannerOwner(task);
  const businessDates = owner && task.start && task.end ? businessDatesBetween(task.start, task.end) : [];
  const validDates = new Set(businessDates);
  let changed = false;

  state.plannerItems = state.plannerItems.filter((item) => {
    const isAutoCard = item.sourceProjectId === current.id && item.sourceTaskId === task.id;
    if (!isAutoCard) return true;
    const date = item.autoTaskDate || item.date;
    const keep = owner && samePerson(item.user, owner) && validDates.has(date);
    if (!keep) changed = true;
    return keep;
  });

  businessDates.forEach((dateValue) => {
    const existing = state.plannerItems.find((item) =>
      item.sourceProjectId === current.id
      && item.sourceTaskId === task.id
      && (item.autoTaskDate || item.date) === dateValue
    );
    const rank = taskDependencyDepth(current, task);
    const nextData = {
      user: owner,
      text: task.title,
      projectId: current.id,
      projectName: current.name,
      taskId: task.id,
      taskTitle: task.title,
      sourceProjectId: current.id,
      sourceTaskId: task.id,
      autoTaskDate: dateValue,
      date: dateValue,
      weekly: false,
      order: rank + 1,
    };
    if (existing) {
      Object.keys(nextData).forEach((key) => {
        if (existing[key] !== nextData[key]) {
          existing[key] = nextData[key];
          changed = true;
        }
      });
    } else {
      state.plannerItems.push({
        id: uid(),
        ...nextData,
        doneDates: [],
        completedDate: "",
        done: false,
        createdAt: Date.now(),
      });
      changed = true;
    }
  });

  return changed;
}

function syncAllProjectTasksToPlanner() {
  if (state.autoPlannerSyncVersion === 3) return false;
  let changed = false;
  state.projects.forEach((projectItem) => {
    normalizeProject(projectItem);
    projectItem.tasks.forEach((task) => {
      if (task.status !== "concluido") changed = syncTaskPlannerCards(projectItem, task) || changed;
    });
  });
  state.autoPlannerSyncVersion = 3;
  return true || changed;
}

function renderBoard(current) {
  const columns = Object.keys(statusLabels).filter((status) => status !== "aprovado");
  const tasksByFilter = filteredTasks(current);
  els.taskBoard.innerHTML = columns
    .map((status) => {
      const tasks = tasksByFilter.filter((item) => item.status === status);
      return `<section class="column" data-kanban-status="${status}"><h2>${statusLabels[status]}</h2><div class="kanban-dropzone">${tasks.length ? tasks.map(taskCard).join("") : empty("Sem itens.")}</div></section>`;
    })
    .join("");
}

function renderTaskList(current) {
  const tasks = filteredTasks(current).sort((a, b) => parseDate(a.end) - parseDate(b.end));
  els.taskList.innerHTML = tasks.length
    ? tasks
        .map(
          (task) => `<article class="task-list-row" data-edit-task="${task.id}">
            <div>
              <strong>${escapeHtml(task.title)}</strong>
              <small>${task.isMilestone ? "Marco · " : ""}${escapeHtml(task.owner)} · ${formatDate(task.start)} a ${formatDate(task.end)}</small>
            </div>
            <span class="status status-${task.status}">${statusLabels[task.status]}</span>
            <div class="progress" title="${task.progress}% concluído"><span style="width:${Number(task.progress)}%"></span></div>
            <button type="button" data-edit-task="${task.id}">Abrir</button>
          </article>`,
        )
        .join("")
    : empty("Nenhuma tarefa encontrada para os filtros.");
}

function renderProjectDisplayMode() {
  document.querySelectorAll("#projectViewToggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.projectView === activeProjectView);
  });
  document.querySelectorAll(".project-display").forEach((display) => display.classList.remove("active"));
  document.querySelector(`#${activeProjectView}Display`)?.classList.add("active");
  document.querySelector("#scaleToggle").style.display = activeProjectView === "gantt" ? "inline-grid" : "none";
}

function renderPlanningDisplayMode() {
  document.querySelectorAll("#planningViewToggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.planningView === activePlanningView);
  });
  document.querySelectorAll(".planning-display").forEach((display) => display.classList.remove("active"));
  document.querySelector(`#${activePlanningView}PlanningDisplay`)?.classList.add("active");
}

function renderPlanner() {
  carryForwardPlannerItems();
  renderPlannerUserSelect();
  renderPlannerProjectSelect();
  document.querySelectorAll("#plannerViewToggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.plannerView === activePlannerView);
  });
  els.plannerDateInput.value = plannerDate;
  if (els.plannerSourceFilter) els.plannerSourceFilter.value = activePlannerSourceFilter;
  const dates = plannerDates();
  els.plannerBoard.className = `planner-board planner-${activePlannerView}`;
  els.plannerBoard.innerHTML = dates.map(renderPlannerDay).join("");
  renderPlannerDoneWeek();
}

function plannerUserName() {
  return isCoordinator() ? activePlannerUser || "Coordenação" : currentUser?.username || "";
}

function renderPlannerUserSelect() {
  if (!els.plannerUserSelect) return;
  const users = appUsers.map((user) => user.username);
  els.plannerUserSelect.classList.toggle("hidden-field", !isCoordinator());
  els.plannerUserSelect.disabled = !isCoordinator();
  els.plannerUserSelect.innerHTML = users.map((username) => `<option value="${escapeHtml(username)}">${escapeHtml(username)}</option>`).join("");
  if (!users.includes(activePlannerUser)) activePlannerUser = currentUser?.username || users[0];
  els.plannerUserSelect.value = activePlannerUser;
}

function renderPlannerDay(dateValue) {
  const items = plannerItemsForDate(dateValue);
  return `<section class="planner-day" data-planner-date="${dateValue}">
    <header>
      <strong>${plannerDayTitle(dateValue)}</strong>
      <span>${formatDate(dateValue)}</span>
    </header>
    <div class="planner-todos">
      ${items.length ? items.map((item, index) => plannerItemHtml(item, dateValue, index)).join("") : `<button class="planner-empty" type="button" data-planner-add-date="${dateValue}">Sem tarefas.</button>`}
    </div>
  </section>`;
}

function plannerItemHtml(item, dateValue, index = 0) {
  const done = plannerItemDoneOnDate(item, dateValue);
  const priority = index < 3 ? `<b class="planner-priority">${index + 1}</b>` : `<b class="planner-priority blank"></b>`;
  const sourceLabel = item.sourceTaskId ? "Projeto" : "Manual";
  return `<article class="planner-todo ${done ? "done" : ""}" draggable="true" data-planner-drag="${item.id}" data-planner-instance-date="${dateValue}">
    <input type="checkbox" data-planner-toggle="${item.id}" data-planner-toggle-date="${dateValue}" ${done ? "checked" : ""} />
    ${priority}
    <span class="planner-todo-body">
      <small class="planner-source ${item.sourceTaskId ? "project" : "manual"}">${sourceLabel}${item.weekly ? " · Semanal" : ""}</small>
      ${item.projectName ? `<small>${escapeHtml(item.projectName)}</small>` : ""}
      ${item.taskTitle ? `<small class="planner-task-link">${escapeHtml(item.taskTitle)}</small>` : ""}
      <strong data-planner-edit="${item.id}">${escapeHtml(item.text)}</strong>
    </span>
    <button type="button" data-planner-delete="${item.id}" title="Excluir">×</button>
  </article>`;
}

function renderPlannerProjectSelect() {
  const currentValue = els.plannerProjectSelect.value || "";
  const projects = activePlannerProjects();
  els.plannerProjectSelect.innerHTML = [
    `<option value="">Sem projeto</option>`,
    ...projects.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`),
    `<option value="manual">Adicionar manualmente</option>`,
  ].join("");
  const shouldKeepValue = currentValue === "manual" || projects.some((item) => item.id === currentValue);
  els.plannerProjectSelect.value = shouldKeepValue ? currentValue : "";
  togglePlannerManualProject();
  renderPlannerTaskSelect();
}

function activePlannerProjects() {
  return state.projects.filter((item) => !["Concluído", "concluido", "Em negociação", "Contratado"].includes(item.status));
}

function renderResponsibleSelects() {
  const options = engineeringMembers.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  [els.projectManagerInternal, els.taskOwnerInternal].forEach((select) => {
    if (select) select.innerHTML = options;
  });
}

function setResponsibleControls(kind, value) {
  const isInternal = engineeringMembers.some((name) => samePerson(name, value));
  const type = els[`${kind}Type`];
  const internal = els[`${kind}Internal`];
  const external = els[`${kind}External`];
  if (!type || !internal || !external) return;
  type.value = isInternal || !value ? "internal" : "external";
  internal.value = engineeringMembers.find((name) => samePerson(name, value)) || engineeringMembers[0];
  external.value = isInternal ? "" : value || "";
  toggleResponsibleControls(kind);
}

function responsibleValue(kind) {
  const type = els[`${kind}Type`];
  if (!type) return "";
  return type.value === "external" ? els[`${kind}External`].value.trim() : els[`${kind}Internal`].value;
}

function toggleResponsibleControls(kind) {
  const isExternal = els[`${kind}Type`].value === "external";
  els[`${kind}InternalLabel`].classList.toggle("hidden-field", isExternal);
  els[`${kind}ExternalLabel`].classList.toggle("hidden-field", !isExternal);
}

function plannerDates() {
  const selected = parseDate(plannerDate);
  if (activePlannerView === "day") return [plannerDate];
  if (activePlannerView === "week") {
    const start = startOfWeek(selected);
    return Array.from({ length: 5 }, (_, index) => normalizeDateValue(addDays(start, index)));
  }
  const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const total = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, index) => addDays(first, index))
    .filter((date) => isBusinessDay(date))
    .map(normalizeDateValue);
}

function plannerItemsForDate(dateValue) {
  return state.plannerItems
    .filter((item) => item.user === plannerUserName())
    .filter((item) => {
      if (activePlannerSourceFilter === "project") return Boolean(item.sourceTaskId);
      if (activePlannerSourceFilter === "manual") return !item.sourceTaskId;
      return true;
    })
    .filter((item) => item.date === dateValue || (item.weekly && item.date <= dateValue && parseDate(item.date).getDay() === parseDate(dateValue).getDay()))
    .sort((a, b) =>
      Number(plannerItemDoneOnDate(a, dateValue)) - Number(plannerItemDoneOnDate(b, dateValue))
      || plannerDependencyRank(a) - plannerDependencyRank(b)
      || Number(a.order || 0) - Number(b.order || 0)
      || a.createdAt - b.createdAt
    );
}

function plannerItemDoneOnDate(item, dateValue) {
  if (item.weekly) return Array.isArray(item.doneDates) && item.doneDates.includes(dateValue);
  if (!item.done) return false;
  return item.completedDate ? item.completedDate === dateValue : item.date === dateValue;
}

function syncPlannerCompletionToProject(item, doneDate, isDone) {
  if (!item?.projectId) return;
  const linkedProject = state.projects.find((projectItem) => projectItem.id === item.projectId);
  if (!linkedProject) return;
  normalizeProject(linkedProject);
  const key = `${item.id}|${doneDate}`;
  linkedProject.completedPlannerItems = linkedProject.completedPlannerItems.filter((entry) => entry.key !== key);
  const linkedTask = (linkedProject.tasks || []).find((task) => task.id === item.taskId);
  if (linkedTask) {
    normalizeTask(linkedTask);
    linkedTask.completedPlannerItems = linkedTask.completedPlannerItems.filter((entry) => entry.key !== key);
  }
  if (!isDone) return;
  const record = {
    key,
    id: item.id,
    text: item.text,
    user: item.user,
    date: doneDate,
    completedAt: new Date().toISOString(),
  };
  linkedProject.completedPlannerItems.push(record);
  if (linkedTask) linkedTask.completedPlannerItems.push(record);
}

function plannerWeekDates() {
  const start = startOfWeek(parseDate(plannerDate));
  return Array.from({ length: 5 }, (_, index) => normalizeDateValue(addDays(start, index)));
}

function renderPlannerDoneWeek() {
  const weekDates = plannerWeekDates();
  const weekSet = new Set(weekDates);
  const doneItems = state.plannerItems
    .filter((item) => item.user === plannerUserName())
    .flatMap((item) => item.weekly
      ? (item.doneDates || []).filter((date) => weekSet.has(date)).map((date) => ({ ...item, doneDate: date }))
      : item.done && weekSet.has(item.completedDate || item.date) ? [{ ...item, doneDate: item.completedDate || item.date }] : [])
    .sort((a, b) => a.doneDate.localeCompare(b.doneDate) || a.createdAt - b.createdAt);
  els.plannerDoneRange.textContent = `${formatDate(weekDates[0])} a ${formatDate(weekDates[weekDates.length - 1])}`;
  if (!doneItems.length) {
    els.plannerDoneGroups.innerHTML = `<div class="planner-done-empty">Nenhuma atividade concluída nesta semana.</div>`;
    return;
  }
  const groups = doneItems.reduce((acc, item) => {
    const key = item.projectName || "Sem projeto";
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(item);
    return acc;
  }, new Map());
  els.plannerDoneGroups.innerHTML = [...groups.entries()].map(([projectName, items]) => `
    <article class="planner-done-card">
      <header>
        <strong>${escapeHtml(projectName)}</strong>
        <span>${items.length} feito${items.length > 1 ? "s" : ""}</span>
      </header>
      <ul>
        ${items.map((item) => `<li><span>${formatShortDate(item.doneDate)}</span>${escapeHtml(item.text)}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function plannerDayTitle(dateValue) {
  return parseDate(dateValue).toLocaleDateString("pt-BR", { weekday: "long" });
}

function normalizePlannerItem(item) {
  return {
    id: item.id || uid(),
    text: item.text || "",
    projectId: item.projectId || "",
    projectName: item.projectName || "",
    taskId: item.taskId || "",
    taskTitle: item.taskTitle || "",
    sourceProjectId: item.sourceProjectId || "",
    sourceTaskId: item.sourceTaskId || "",
    autoTaskDate: item.autoTaskDate || "",
    user: item.user || "Coordenação",
    date: normalizeDateValue(item.date || new Date()),
    weekly: item.weekly === true || item.weekly === "true",
    doneDates: Array.isArray(item.doneDates) ? item.doneDates : [],
    completedDate: item.completedDate || "",
    order: Number(item.order || 0),
    done: item.done === true || item.done === "true",
    createdAt: Number(item.createdAt || Date.now()),
  };
}

function nextBusinessDateValue(dateValue) {
  let next = addDays(parseDate(dateValue), 1);
  while (!isBusinessDay(next)) next = addDays(next, 1);
  return normalizeDateValue(next);
}

function carryForwardPlannerItems() {
  const today = normalizeDateValue(new Date());
  let changed = false;
  state.plannerItems.forEach((item) => {
    if (item.user !== plannerUserName()) return;
    if (item.weekly || item.done || item.sourceTaskId) return;
    while (item.date < today) {
      item.date = nextBusinessDateValue(item.date);
      changed = true;
    }
  });
  if (changed) saveState();
}

function plannerProjectFromForm() {
  const value = els.plannerProjectSelect.value;
  if (value === "manual") {
    return { projectId: "", projectName: els.plannerProjectManualInput.value.trim(), taskId: "", taskTitle: "" };
  }
  const selected = state.projects.find((item) => item.id === value);
  const selectedTask = selected?.tasks?.find((task) => task.id === els.plannerTaskSelect?.value);
  return selected
    ? { projectId: selected.id, projectName: selected.name, taskId: selectedTask?.id || "", taskTitle: selectedTask?.title || "" }
    : { projectId: "", projectName: "", taskId: "", taskTitle: "" };
}

function validatePlannerProject(projectMeta) {
  if (projectMeta.projectName) return true;
  alert("Selecione um projeto ou adicione uma etiqueta manual antes de criar a tarefa.");
  els.plannerProjectSelect.focus();
  return false;
}

function togglePlannerManualProject() {
  const isManual = els.plannerProjectSelect.value === "manual";
  els.plannerProjectManualInput.classList.toggle("hidden-field", !isManual);
  els.plannerProjectManualInput.disabled = !isManual;
  if (!isManual) els.plannerProjectManualInput.value = "";
  renderPlannerTaskSelect();
}

function renderPlannerTaskSelect() {
  if (!els.plannerTaskSelect) return;
  const projectId = els.plannerProjectSelect.value;
  const selectedProject = state.projects.find((item) => item.id === projectId);
  const tasks = selectedProject?.tasks?.map(normalizeTask).filter((task) => task.status !== "concluido") || [];
  const currentValue = els.plannerTaskSelect.value || "";
  const shouldShow = Boolean(selectedProject && tasks.length);
  els.plannerTaskSelect.classList.toggle("hidden-field", !shouldShow);
  els.plannerTaskSelect.disabled = !shouldShow;
  els.plannerTaskSelect.innerHTML = `<option value="">Sem tarefa vinculada</option>${tasks
    .map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`)
    .join("")}`;
  els.plannerTaskSelect.value = tasks.some((task) => task.id === currentValue) ? currentValue : "";
}

function reorderPlannerItem(id, dateValue, beforeId = "") {
  const item = state.plannerItems.find((entry) => entry.id === id);
  if (!item) return;
  if (!item.weekly) item.date = dateValue;
  const items = plannerItemsForDate(dateValue).filter((entry) => entry.id !== id);
  const insertAt = beforeId ? Math.max(0, items.findIndex((entry) => entry.id === beforeId)) : items.length;
  items.splice(insertAt, 0, item);
  items.forEach((entry, index) => {
    const source = state.plannerItems.find((stored) => stored.id === entry.id);
    if (source) source.order = index + 1;
  });
  plannerDate = dateValue;
  renderPlanner();
  saveState();
}

function startInlineTextEdit(target, currentText, onSave) {
  const input = document.createElement("input");
  input.className = "inline-edit-input";
  input.value = currentText;
  target.replaceWith(input);
  input.focus();
  input.select();
  let finished = false;

  const finish = (shouldSave) => {
    if (finished) return;
    finished = true;
    const nextText = input.value.trim();
    if (shouldSave && nextText) onSave(nextText);
    else render();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true), { once: true });
}

function movePlannerDate(direction) {
  const current = parseDate(plannerDate);
  if (activePlannerView === "month") {
    current.setMonth(current.getMonth() + direction);
  } else {
    current.setDate(current.getDate() + direction * (activePlannerView === "week" ? 7 : 1));
  }
  plannerDate = normalizeDateValue(current);
  renderPlanner();
  saveState();
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isBusinessDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function renderCoordination() {
  els.coordinationBoard.innerHTML = coordinationMembers.map(renderCoordinationColumn).join("");
  renderChangeHistory();
}

function renderChangeHistory() {
  if (!els.changeHistoryPanel || !els.changeHistoryList) return;
  els.changeHistoryPanel.classList.toggle("hidden-field", !isCoordinator());
  if (!isCoordinator()) return;
  const entries = (state.changeLog || []).slice(0, 30);
  els.changeHistoryList.innerHTML = entries.length
    ? entries.map((entry) => `<article class="change-history-item">
        <strong>${escapeHtml(entry.user)}</strong>
        <span>${escapeHtml(entry.area)} · ${escapeHtml(entry.target)}</span>
        <time>${new Date(entry.at).toLocaleString("pt-BR")}</time>
      </article>`).join("")
    : empty("Nenhuma alteração registrada ainda.");
}

function renderCoordinationColumn(member) {
  const items = coordinationItemsForMember(member);
  return `<section class="coordination-column" data-coordination-member="${escapeHtml(member)}">
    <header>
      <h3>${escapeHtml(member)}</h3>
      <span>${items.length} atividades</span>
    </header>
    <form class="coordination-add-form" data-coordination-form="${escapeHtml(member)}">
      <input placeholder="Adicionar atividade" />
      <button type="submit">+</button>
    </form>
    <div class="coordination-list">
      ${items.length ? items.map(coordinationItemHtml).join("") : `<div class="coordination-empty">Sem atividades.</div>`}
    </div>
  </section>`;
}

function coordinationItemsForMember(member) {
  return state.coordinationItems
    .filter((item) => item.member === member)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order || a.createdAt - b.createdAt)
    .map((item, index) => ({ ...item, priority: index < 3 ? index + 1 : "" }));
}

function coordinationItemHtml(item) {
  const priority = item.priority ? `<span class="coordination-priority">${item.priority}</span>` : `<span class="coordination-priority blank"></span>`;
  return `<article class="coordination-task ${item.done ? "done" : ""}" draggable="true" data-coordination-drag="${item.id}">
    ${priority}
    <input type="checkbox" data-coordination-toggle="${item.id}" ${item.done ? "checked" : ""} />
    <span data-coordination-edit="${item.id}">${escapeHtml(item.text)}</span>
    <button type="button" data-coordination-delete="${item.id}" title="Excluir">×</button>
  </article>`;
}

function normalizeCoordinationItem(item) {
  return {
    id: item.id || uid(),
    text: item.text || "",
    member: coordinationMembers.includes(item.member) ? item.member : coordinationMembers[0],
    done: Boolean(item.done),
    order: Number(item.order || 0),
    createdAt: Number(item.createdAt || Date.now()),
  };
}

function rebalanceCoordinationOrder(member) {
  coordinationItemsForMember(member).forEach((item, index) => {
    const source = state.coordinationItems.find((entry) => entry.id === item.id);
    if (source) source.order = index + 1;
  });
}

function addCoordinationItem(member, text) {
  const order = coordinationItemsForMember(member).length + 1;
  state.coordinationItems.push({
    id: uid(),
    member,
    text,
    done: false,
    order,
    createdAt: Date.now(),
  });
  rebalanceCoordinationOrder(member);
  renderCoordination();
  saveState();
}

function moveCoordinationItem(id, member) {
  const item = state.coordinationItems.find((entry) => entry.id === id);
  if (!item || item.member === member) return;
  const previousMember = item.member;
  item.member = member;
  item.order = coordinationItemsForMember(member).length + 1;
  rebalanceCoordinationOrder(previousMember);
  rebalanceCoordinationOrder(member);
  renderCoordination();
  saveState();
}

function reorderCoordinationItem(id, member, beforeId = "") {
  const item = state.coordinationItems.find((entry) => entry.id === id);
  if (!item || !coordinationMembers.includes(member)) return;
  const previousMember = item.member;
  const nextItems = coordinationItemsForMember(member).filter((entry) => entry.id !== id);
  const insertAt = beforeId ? Math.max(0, nextItems.findIndex((entry) => entry.id === beforeId)) : nextItems.length;
  item.member = member;
  nextItems.splice(insertAt, 0, item);
  nextItems.forEach((entry, index) => {
    const source = state.coordinationItems.find((stored) => stored.id === entry.id);
    if (source) {
      source.member = member;
      source.order = index + 1;
    }
  });
  if (previousMember !== member) rebalanceCoordinationOrder(previousMember);
  renderCoordination();
  saveState();
}

function toggleProjectTypeOther() {
  const isOther = els.projectTypeSelect.value === "Outro";
  els.projectTypeOtherLabel.classList.toggle("hidden-field", !isOther);
  els.projectForm.elements.projectTypeOther.disabled = !isOther;
  if (!isOther) els.projectForm.elements.projectTypeOther.value = "";
  renderProjectVariableOptions();
  renderProjectParksSection();
  renderDeliverablesOptions();
  toggleDeliverableConditionalFields();
}

function shouldShowProjectParks() {
  return projectTypeSupportsParksAndVariables(els.projectTypeSelect.value);
}

function shouldShowProjectVariables() {
  return projectTypeSupportsParksAndVariables(els.projectTypeSelect.value);
}

function projectTypeSupportsParksAndVariables(type) {
  return ["LTE", "TQI"].includes(String(type || "").trim().toUpperCase());
}

function renderProjectParksSection() {
  const show = shouldShowProjectParks();
  els.projectParksSection.classList.toggle("hidden-field", !show);
  els.projectParksSection.hidden = !show;
  els.projectParksSection.style.display = show ? "" : "none";
  if (!show) editingProjectParks = [];
  renderProjectParksList();
}

function renderProjectParksList() {
  els.projectParksList.innerHTML = editingProjectParks.length
    ? editingProjectParks
        .map(
          (park) => `<article class="park-item">
            <div>
              <strong>${escapeHtml(park.name)}</strong>
              <small>${escapeHtml(park.technology || "Sem tecnologia")} · ${escapeHtml(park.wtg || "-")} WTG · COD ${escapeHtml(park.cod || "-")}</small>
            </div>
            <button type="button" data-remove-park="${park.id}">Remover</button>
          </article>`,
        )
        .join("")
    : empty("Nenhum parque cadastrado.");
}

function renderProjectVariableOptions(selected = getSelectedProjectVariables()) {
  const type = els.projectTypeSelect.value || "Outro";
  const options = shouldShowProjectVariables() ? projectVariablesByType[type] || [] : [];
  els.projectVariablesSection.classList.toggle("hidden-field", !options.length);
  els.projectVariablesSection.hidden = !options.length;
  els.projectVariablesSection.style.display = options.length ? "" : "none";
  els.projectVariablesOptions.innerHTML = options
    .map(
      (option) => `<label class="check-card">
        <input type="checkbox" name="projectVariables" value="${escapeHtml(option)}" ${selected.includes(option) ? "checked" : ""} />
        <span>${escapeHtml(option)}</span>
      </label>`,
    )
    .join("");
  toggleProjectVariableConditionalFields();
}

function getSelectedProjectVariables() {
  return Array.from(els.projectForm.querySelectorAll('input[name="projectVariables"]:checked')).map((input) => input.value);
}

function toggleProjectVariableConditionalFields() {
  const selected = getSelectedProjectVariables();
  const hasOther = selected.includes("Outro");
  els.projectVariableOtherLabel.classList.toggle("hidden-field", !hasOther);
  els.projectForm.elements.projectVariableOther.disabled = !hasOther;
  if (!hasOther) els.projectForm.elements.projectVariableOther.value = "";
}

function renderDeliverablesOptions(selected = getSelectedDeliverables()) {
  const type = els.projectTypeSelect.value || "Outro";
  const options = deliverablesByType[type] || deliverablesByType.Outro;
  els.deliverablesOptions.innerHTML = options
    .map(
      (option) => `<label class="check-card">
        <input type="checkbox" name="deliverables" value="${escapeHtml(option)}" ${selected.includes(option) ? "checked" : ""} />
        <span>${escapeHtml(option)}</span>
      </label>`,
    )
    .join("");
}

function getSelectedDeliverables() {
  return Array.from(els.projectForm.querySelectorAll('input[name="deliverables"]:checked')).map((input) => input.value);
}

function toggleDeliverableConditionalFields() {
  const selected = getSelectedDeliverables();
  const hasFinalReport = selected.includes("Relatório Final");
  const hasOther = selected.includes("Outro");
  els.languageLabel.classList.toggle("hidden-field", !hasFinalReport);
  els.deliverableOtherLabel.classList.toggle("hidden-field", !hasOther);
  els.projectForm.elements.language.disabled = !hasFinalReport;
  els.projectForm.elements.deliverableOther.disabled = !hasOther;
  if (!hasFinalReport) els.projectForm.elements.language.value = "";
  if (!hasOther) els.projectForm.elements.deliverableOther.value = "";
}

function taskCard(task) {
  normalizeTask(task);
  const linkedPark = parkName(project(), task.parkId);
  return `<article class="task-card" draggable="true" data-task-id="${task.id}">
    <header>
      <strong>${escapeHtml(task.title)}</strong>
      <button data-edit-task="${task.id}" title="Abrir cartão">✎</button>
    </header>
    <div class="task-meta">
      <span>${escapeHtml(task.owner)}</span>
      <span class="status status-${task.status}">${statusLabels[task.status] || task.status}</span>
    </div>
    ${linkedPark ? `<span class="task-mini-meta">${escapeHtml(linkedPark)}</span>` : ""}
    <div class="progress" title="${task.progress}% concluído"><span style="width:${Number(task.progress)}%"></span></div>
    ${renderTaskBadges(task)}
    <small>${formatDate(task.start)} a ${formatDate(task.end)}</small>
  </article>`;
}

function renderTaskBadges(task) {
  const meta = [];
  if (task.isMilestone) meta.push("Marco");
  if (task.imageData) meta.push("Anexo");
  const metaHtml = meta.map((item) => `<span class="task-mini-meta">${item}</span>`).join("");
  return metaHtml ? `<div class="task-badges">${metaHtml}</div>` : "";
}

function renderPlanning() {
  const members = collectMembers();
  const projects = state.projects.map(normalizeProject);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + planningOffsetDays);
  const days = Array.from({ length: planningDays }, (_, index) => new Date(start.getTime() + index * msDay));
  const colors = projectColors(projects);
  const end = days[days.length - 1];
  els.planningRange.textContent = `${formatShortDate(start)} a ${formatShortDate(end)}`;

  document.querySelectorAll("#planningScaleToggle button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.planningDays) === planningDays);
  });
  renderPlanningDisplayMode();

  const header = `<div class="planning-corner">Membro</div>${days
    .map((day) => {
      const weekday = day.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const month = day.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      return `<div class="planning-date ${day.getDay() === 0 || day.getDay() === 6 ? "weekend" : ""}">
        <strong>${String(day.getDate()).padStart(2, "0")}</strong>
        <span>${weekday}</span>
        <small>${month}</small>
      </div>`;
    })
    .join("")}`;

  const rows = members
    .map((member) => {
      const cells = days
        .map((day) => {
          const weekendClass = day.getDay() === 0 || day.getDay() === 6 ? " weekend" : "";
          const allocations = allocationsForMemberOnDate(projects, member, day);
          if (!allocations.length) return `<div class="planning-cell${weekendClass}"></div>`;
          const projectNames = allocations.map(projectLegendLabel).join(" / ");
          const background = allocationBackground(allocations, colors);
          const multiClass = allocations.length > 1 ? " multi" : "";
          const count = allocations.length > 1 ? `<span class="allocation-count">${allocations.length}</span>` : "";
          return `<div class="planning-cell allocated${weekendClass}${multiClass}" title="${escapeHtml(projectNames)}" style="background:${background}">${count}</div>`;
        })
        .join("");
      return `<div class="planning-member">${escapeHtml(member)}</div>${cells}`;
    })
    .join("");

  els.planningGrid.style.gridTemplateColumns = `150px repeat(${days.length}, ${planningCellWidth}px)`;
  els.planningGrid.innerHTML = members.length ? header + rows : empty("Adicione envolvidos aos projetos para montar o planejamento.");
  els.planningLegend.innerHTML = projects
    .map(
      (item) => `<span class="legend-item">
        <input type="color" value="${escapeHtml(colors.get(item.id))}" data-planning-project-color="${escapeHtml(item.id)}" title="Alterar cor no Planejamento">
        <span data-planning-project-label="${escapeHtml(item.id)}" title="Duplo clique para alterar o nome apenas no Planejamento">${escapeHtml(projectLegendLabel(item))}</span>
      </span>`
    )
    .join("");
  renderGeneralGantt(projects, colors);
  renderPipeline(projects, colors);
}

function allocationsForMemberOnDate(projects, member, day) {
  return projects.filter((item) => memberProjectRanges(item, member).some((range) => dateInRange(day, range.start, range.end)));
}

function memberProjectRanges(item, member) {
  const ranges = [];
  (item.tasks || []).forEach((task) => {
    if (samePerson(task.owner, member)) ranges.push({ start: task.start, end: task.end });
  });
  return ranges;
}

function collectMembers() {
  return engineeringMembers.filter((member) => member !== "Ricardo");
}

function projectHasMember(item, member) {
  return projectPeople(item).some((person) => samePerson(person, member));
}

function projectPeople(item) {
  const names = new Set();
  splitLinesOrComma(item.people).forEach((person) => names.add(person));
  if (item.manager) names.add(item.manager);
  (item.tasks || []).forEach((task) => {
    if (task.owner) names.add(task.owner);
  });
  return Array.from(names).filter(Boolean);
}

function projectPlanningRange(item) {
  const starts = [item.start, ...(item.tasks || []).map((task) => task.start)].filter(Boolean);
  const ends = [item.end, ...(item.tasks || []).map((task) => task.end)].filter(Boolean);
  return {
    start: earliestDate(starts) || item.start,
    end: latestDate(ends) || item.end,
  };
}

function projectLegendLabel(item) {
  const customLabel = state.planningProjectMeta?.[item.id]?.label;
  return customLabel || defaultProjectLegendLabel(item);
}

function defaultProjectLegendLabel(item) {
  return `${item.name || "Sem cliente"} - ${projectTypeLabel(item)}`;
}

function hasPerson(people, member) {
  return people.some((person) => samePerson(person, member));
}

function samePerson(a, b) {
  return normalizePersonName(a) === normalizePersonName(b);
}

function normalizePersonName(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function earliestDate(values) {
  return values.sort((a, b) => parseDate(a) - parseDate(b))[0] || "";
}

function latestDate(values) {
  return values.sort((a, b) => parseDate(b) - parseDate(a))[0] || "";
}

function dateInRange(date, start, end) {
  if (!start || !end) return false;
  const current = parseDate(date);
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (Number.isNaN(current.getTime()) || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false;
  return current >= startDate && current <= endDate;
}

function projectColors(projects) {
  const palette = ["#ff8200", "#111111", "#7c2d12", "#facc15", "#6b7280", "#fb7185", "#38bdf8", "#a855f7", "#22c55e", "#ef4444"];
  state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
  return new Map(
    projects.map((item, index) => {
      const storedColor = state.planningProjectMeta[item.id]?.color;
      return [item.id, /^#[0-9a-f]{6}$/i.test(storedColor || "") ? storedColor : palette[index % palette.length]];
    })
  );
}

function allocationBackground(allocations, colors) {
  if (allocations.length === 1) return colors.get(allocations[0].id);
  const size = 100 / allocations.length;
  const stops = allocations.flatMap((item, index) => {
    const start = Math.round(index * size);
    const end = Math.round((index + 1) * size);
    const color = colors.get(item.id);
    return [`${color} ${start}%`, `${color} ${end}%`];
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function renderGeneralGantt(projects, colors) {
  const items = projects.filter((item) => item.start && item.end).sort((a, b) => parseDate(a.start) - parseDate(b.start));
  if (!items.length) {
    els.generalGanttChart.style.width = "";
    els.generalGanttChart.style.minWidth = "";
    els.generalGanttChart.innerHTML = empty("Cadastre projetos com início e fim para montar o Gantt geral.");
    return;
  }

  const min = items.reduce((value, item) => (parseDate(item.start) < parseDate(value) ? item.start : value), items[0].start);
  const max = items.reduce((value, item) => (parseDate(item.end) > parseDate(value) ? item.end : value), items[0].end);
  const totalDays = Math.max(daysBetween(min, max) + 1, 1);
  const cellWidth = 38;
  const cells = totalDays;
  const timelineWidth = cells * cellWidth;
  const dates = Array.from({ length: cells }, (_, index) => {
    const date = new Date(parseDate(min).getTime() + index * msDay);
    return `<div class="gantt-date compact-date">${String(date.getDate()).padStart(2, "0")}<small>${date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></div>`;
  }).join("");

  const rows = items
    .map((item) => {
      const left = Math.max(0, daysBetween(min, item.start) * cellWidth);
      const width = Math.max(24, (daysBetween(item.start, item.end) + 1) * cellWidth);
      return `<div class="gantt-row" style="grid-template-columns:260px ${timelineWidth}px">
        <div class="gantt-task-label">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(projectTypeLabel(item))} · ${formatDate(item.start)} a ${formatDate(item.end)}</small>
        </div>
        <div class="gantt-track" style="--cell-width:${cellWidth}px;width:${timelineWidth}px">
          <span class="gantt-bar" style="left:${left}px;width:${width}px;background:${colors.get(item.id)}">${escapeHtml(item.status || "")}</span>
        </div>
      </div>`;
    })
    .join("");

  els.generalGanttChart.style.width = `${260 + timelineWidth}px`;
  els.generalGanttChart.style.minWidth = `${260 + timelineWidth}px`;
  els.generalGanttChart.innerHTML = `<div class="gantt-header" style="grid-template-columns:260px ${timelineWidth}px">
    <div class="gantt-label">Projeto</div>
    <div class="gantt-dates" style="grid-template-columns:repeat(${cells}, ${cellWidth}px)">${dates}</div>
  </div>${rows}`;
}

function renderPipeline(projects, colors) {
  state.pipelineDrafts = Array.isArray(state.pipelineDrafts) ? state.pipelineDrafts : [];
  const draftColors = projectColors(state.pipelineDrafts);
  const card = (item) => `<article class="pipeline-card">
    <span style="background:${draftColors.get(item.id) || "#ff8200"}"></span>
    <strong>${escapeHtml(item.name)}</strong>
    <small>${escapeHtml(projectTypeLabel(item))}</small>
    <p>${escapeHtml(item.goal || "Sem descrição.")}</p>
  </article>`;
  const negotiations = state.pipelineDrafts.filter((item) => item.status === "Em negociação");
  const contracted = state.pipelineDrafts.filter((item) => item.status === "Contratado");
  els.negotiationProjects.innerHTML = negotiations.length ? negotiations.map(card).join("") : empty("Nenhum projeto em negociação.");
  els.contractedProjects.innerHTML = contracted.length ? contracted.map(card).join("") : empty("Nenhum projeto contratado.");
}

function fillTaskSelects(current) {
  const options = `<option value="">Sem dependência</option>${current.tasks
    .map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`)
    .join("")}`;
  els.taskForm.elements.dependsOn.innerHTML = options;
  const parkOptions = `<option value="">Sem parque vinculado</option>${(current.parks || [])
    .map((park) => `<option value="${park.id}">${escapeHtml(park.name)}</option>`)
    .join("")}`;
  els.taskForm.elements.parkId.innerHTML = parkOptions;
  els.splitForm.elements.taskId.innerHTML = current.tasks
    .map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`)
    .join("");
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function openProjectDialog(newProject = false) {
  const current = newProject
    ? { name: "", projectType: "TQI", projectTypeOther: "", projectVariables: [], projectVariableOther: "", parks: [], deliverables: [], deliverableOther: "", language: "", goal: "", information: "", notesBlock: "", lessonsLearned: "", manager: "", people: "", start: isoDate(new Date()), end: isoDate(new Date(Date.now() + 30 * msDay)), priority: "Média", status: "Planejamento" }
    : normalizeProject(project());
  editingProjectParks = (current.parks || []).map(normalizePark);
  els.projectForm.dataset.mode = newProject ? "new" : "edit";
  els.projectForm.classList.remove("simple-project-form");
  els.projectForm.elements.simplePipeline.value = "false";
  Object.entries(current).forEach(([key, value]) => {
    if (els.projectForm.elements[key] && key !== "deliverables" && key !== "projectVariables") els.projectForm.elements[key].value = value;
  });
  setResponsibleControls("projectManager", current.manager || "");
  renderDeliverablesOptions(current.deliverables || []);
  toggleProjectTypeOther();
  renderProjectVariableOptions(current.projectVariables || []);
  renderProjectParksSection();
  renderDeliverablesOptions(current.deliverables || []);
  toggleProjectVariableConditionalFields();
  toggleDeliverableConditionalFields();
  if (current.projectVariables?.includes("Outro")) els.projectForm.elements.projectVariableOther.value = current.projectVariableOther || "";
  if (current.deliverables?.includes("Relatório Final")) els.projectForm.elements.language.value = current.language || "";
  if (current.deliverables?.includes("Outro")) els.projectForm.elements.deliverableOther.value = current.deliverableOther || "";
  els.projectDialog.showModal();
}

function openPipelineProjectDialog(status) {
  openProjectDialog(true);
  els.projectForm.classList.add("simple-project-form");
  els.projectForm.elements.simplePipeline.value = "true";
  els.projectForm.elements.status.value = status;
}

function openTaskDialog(taskId = "") {
  const current = project();
  const task = normalizeTask(current.tasks.find((item) => item.id === taskId) || makeTask("", current.manager || "", current.start, current.end));
  editingTaskCheckinGroups = (task.checkinGroups || []).map(normalizeCheckinGroup);
  hideCheckedCheckins = false;
  Object.entries(task).forEach(([key, value]) => {
    if (els.taskForm.elements[key] && els.taskForm.elements[key].type !== "file") els.taskForm.elements[key].value = value;
  });
  setResponsibleControls("taskOwner", task.owner || current.manager || "");
  [...els.taskForm.elements.dependsOn.options].forEach((option) => {
    option.selected = (task.dependsOnIds || []).includes(option.value);
  });
  els.taskForm.elements.id.value = taskId;
  if (els.taskForm.elements.attachments) els.taskForm.elements.attachments.value = "";
  els.taskForm.elements.imageInput.value = "";
  renderTaskCheckins();
  renderImagePreview(task.imageData);
  els.deleteTaskBtn.hidden = !taskId;
  els.taskDialog.showModal();
}

function saveProjectForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.projectForm));
  data.manager = responsibleValue("projectManager");
  data.projectVariables = getSelectedProjectVariables();
  data.parks = projectTypeSupportsParksAndVariables(data.projectType) ? editingProjectParks.map(normalizePark) : [];
  data.deliverables = getSelectedDeliverables();
  if (data.simplePipeline === "true") {
    state.pipelineDrafts = Array.isArray(state.pipelineDrafts) ? state.pipelineDrafts : [];
    state.pipelineDrafts.push({
      id: uid(),
      name: data.name,
      projectType: data.projectType,
      projectTypeOther: data.projectType === "Outro" ? data.projectTypeOther : "",
      goal: data.goal,
      status: data.status,
      createdAt: Date.now(),
    });
    els.projectDialog.close();
    render();
    saveState();
    return;
  }
  delete data.simplePipeline;
  if (data.projectType !== "Outro") data.projectTypeOther = "";
  if (!projectTypeSupportsParksAndVariables(data.projectType)) {
    data.projectVariables = [];
    data.projectVariableOther = "";
    data.parks = [];
  }
  if (!data.projectVariables.includes("Outro")) data.projectVariableOther = "";
  if (!data.deliverables.includes("Relatório Final")) data.language = "";
  if (!data.deliverables.includes("Outro")) data.deliverableOther = "";
  if (parseDate(data.end) < parseDate(data.start)) data.end = data.start;
  if (els.projectForm.dataset.mode === "new") {
    const newProject = { id: uid(), ...data, tasks: [], updates: [] };
    state.projects.push(newProject);
    activeProjectId = newProject.id;
    document.querySelector('[data-view="project"]').click();
  } else {
    Object.assign(project(), data);
    const validParkIds = new Set(project().parks.map((park) => park.id));
    project().tasks.forEach((task) => {
      if (task.parkId && !validParkIds.has(task.parkId)) task.parkId = "";
    });
  }
  els.projectDialog.close();
  render();
  saveState();
}

function saveTaskForm(event) {
  event.preventDefault();
  const current = project();
  const data = Object.fromEntries(new FormData(els.taskForm));
  const existingTask = current.tasks.find((item) => item.id === data.id);
  const dependsOnIds = [...els.taskForm.elements.dependsOn.selectedOptions].map((option) => option.value).filter(Boolean);
  data.owner = responsibleValue("taskOwner");
  data.dependsOnIds = dependsOnIds;
  data.dependsOn = dependsOnIds[0] || "";
  data.progress = Number(data.progress || 0);
  data.isMilestone = data.isMilestone === "true";
  data.checklist = "";
  data.comments = "";
  data.labels = "";
  data.attachments = "";
  data.checkinGroups = editingTaskCheckinGroups.map(normalizeCheckinGroup);
  data.checkins = data.checkinGroups.flatMap((group) => group.items);
  data.imageData = els.taskForm.elements.imageData.value || "";
  delete data.imageInput;
  if (data.isMilestone) data.end = data.start;
  if (parseDate(data.end) < parseDate(data.start)) data.end = data.start;
  let savedTask;
  if (data.id) {
    Object.assign(existingTask, data);
    savedTask = existingTask;
  } else {
    savedTask = { ...data, id: uid() };
    current.tasks.push(savedTask);
  }
  syncTaskPlannerCards(current, savedTask);
  els.taskDialog.close();
  render();
  saveState();
}

function splitTask(event) {
  event.preventDefault();
  const current = project();
  const base = current.tasks.find((item) => item.id === els.splitForm.elements.taskId.value);
  if (!base) return;
  const lines = els.splitForm.elements.items.value.split("\n").map((line) => line.trim()).filter(Boolean);
  const totalDays = Math.max(daysBetween(base.start, base.end) + 1, lines.length);
  const chunk = Math.max(Math.floor(totalDays / lines.length), 1);
  lines.forEach((title, index) => {
    const start = new Date(parseDate(base.start).getTime() + index * chunk * msDay);
    const end = new Date(start.getTime() + (chunk - 1) * msDay);
    const newTask = makeTask(title, base.owner, isoDate(start), isoDate(end), "afazer", 0, base.id);
    current.tasks.push(newTask);
    syncTaskPlannerCards(current, newTask);
  });
  els.splitDialog.close();
  els.splitForm.reset();
  render();
  saveState();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitLinesOrComma(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAttachmentNames(files, fallback) {
  const names = Array.from(files || []).map((file) => file.name);
  return names.length ? names.join(", ") : fallback || "";
}

function renderImagePreview(src) {
  els.taskImagePreview.innerHTML = src ? `<img src="${src}" alt="Imagem anexada à tarefa" />` : "";
}

function renderTaskCheckins() {
  if (!els.taskCheckinList) return;
  editingTaskCheckinGroups = editingTaskCheckinGroups.map(normalizeCheckinGroup);
  const allItems = editingTaskCheckinGroups.flatMap((group) => group.items);
  const total = allItems.length;
  const done = allItems.filter((item) => item.done).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  els.taskCheckinProgress.textContent = `${progress}%`;
  els.taskCheckinProgressBar.style.width = `${progress}%`;
  els.toggleCheckedCheckinsBtn.textContent = hideCheckedCheckins ? "Mostrar itens marcados" : "Ocultar itens marcados";
  els.taskCheckinList.innerHTML = editingTaskCheckinGroups.length
    ? editingTaskCheckinGroups.map((group) => {
        const visibleItems = hideCheckedCheckins ? group.items.filter((item) => !item.done) : group.items;
        const groupDone = group.items.filter((item) => item.done).length;
        const groupProgress = group.items.length ? Math.round((groupDone / group.items.length) * 100) : 0;
        return `<article class="task-checkin-group" data-checkin-group="${group.id}">
          <header>
            <div>
              <h4 data-task-checkin-group-edit="${group.id}">${escapeHtml(group.title)}</h4>
              <p>${groupProgress}% concluído</p>
            </div>
            <button type="button" data-task-checkin-group-delete="${group.id}" title="Excluir tópico">×</button>
          </header>
          <div class="task-checkin-progress small"><span style="width:${groupProgress}%"></span></div>
          <div class="task-checkin-list">
            ${visibleItems.length
              ? visibleItems.map((item) => `<label class="task-checkin-item ${item.done ? "done" : ""}">
                  <input type="checkbox" data-task-checkin-toggle="${item.id}" ${item.done ? "checked" : ""} />
                  <span data-task-checkin-edit="${item.id}">${escapeHtml(item.text)}</span>
                  <button type="button" data-task-checkin-delete="${item.id}" title="Excluir">×</button>
                </label>`).join("")
              : empty("Nenhum item neste tópico.")}
          </div>
          <div class="task-checkin-add inline">
            <input data-task-checkin-item-input="${group.id}" placeholder="Adicionar item neste tópico" />
            <button class="ghost-button" data-task-checkin-item-add="${group.id}" type="button">Adicionar</button>
          </div>
        </article>`;
      }).join("")
    : empty("Nenhum tópico de check-in cadastrado.");
}

function addTaskCheckin() {
  const title = els.taskCheckinInput.value.trim() || "Novo Check-in";
  editingTaskCheckinGroups.push({ id: uid(), title, items: [], createdAt: Date.now() });
  els.taskCheckinInput.value = "";
  els.taskCheckinAdd.classList.add("hidden-field");
  renderTaskCheckins();
}

function findCheckinItem(itemId) {
  for (const group of editingTaskCheckinGroups) {
    const item = group.items.find((entry) => entry.id === itemId);
    if (item) return { group, item };
  }
  return null;
}

function addCheckinItemToGroup(groupId, text) {
  const group = editingTaskCheckinGroups.find((entry) => entry.id === groupId);
  if (!group || !text.trim()) return;
  group.items.push({ id: uid(), text: text.trim(), done: false, createdAt: Date.now(), doneAt: "" });
  renderTaskCheckins();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "coordination" && !isCoordinator()) return;
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}View`).classList.add("active");
    renderPageTitle();
    renderDeadlineAlerts();
    if (!hasUnsavedChanges && saveStatusMode === "saved") setSaveStatus("saved", "Tudo salvo");
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

els.loginForm.addEventListener("submit", handleLogin);
els.logoutBtn.addEventListener("click", logout);
els.saveChangesBtn.addEventListener("click", () => saveStateToSupabase());
if (els.portfolioStatusFilter) {
  els.portfolioStatusFilter.addEventListener("change", () => {
    portfolioStatusFilter = els.portfolioStatusFilter.value;
    renderProjectPortfolio();
    saveState();
  });
}
if (els.deleteProjectBtn) els.deleteProjectBtn.addEventListener("click", deleteActiveProject);
window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedChanges) return;
  event.preventDefault();
  event.returnValue = "";
});

document.querySelectorAll("[data-focus-field]").forEach((button) => {
  button.addEventListener("click", () => {
    const field = els.taskForm.elements[button.dataset.focusField] || document.querySelector(`#${button.dataset.focusField}`);
    field?.focus();
    field?.click();
  });
});

document.querySelector("#newProjectBtn").addEventListener("click", () => openProjectDialog(true));
document.querySelector("#editProjectBtn").addEventListener("click", () => openProjectDialog(false));
els.projectInfoInput.addEventListener("input", () => {
  const current = project();
  current.information = els.projectInfoInput.value;
  saveState();
});
els.projectNotesBtn?.addEventListener("click", () => {
  const current = normalizeProject(project());
  els.projectNotesInput.value = current.notesBlock || "";
  els.projectNotesDialog.showModal();
});
els.projectNotesForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const current = project();
  current.notesBlock = els.projectNotesInput.value;
  els.projectNotesDialog.close();
  saveState();
});
els.coordinationNotesBtn?.addEventListener("click", () => {
  els.coordinationNotesInput.value = state.coordinationNotes || "";
  els.coordinationNotesDialog.showModal();
});
els.coordinationNotesForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.coordinationNotes = els.coordinationNotesInput.value;
  els.coordinationNotesDialog.close();
  saveState();
});
els.lessonsInput.addEventListener("input", () => {
  const current = project();
  current.lessonsLearned = els.lessonsInput.value;
  saveState();
});
els.projectTypeSelect.addEventListener("change", toggleProjectTypeOther);
els.projectVariablesOptions.addEventListener("change", toggleProjectVariableConditionalFields);
els.deliverablesOptions.addEventListener("change", toggleDeliverableConditionalFields);
els.addParkBtn.addEventListener("click", () => {
  const name = els.parkNameInput.value.trim();
  if (!name) return;
  editingProjectParks.push(
    normalizePark({
      id: uid(),
      name,
      technology: els.parkTechnologyInput.value.trim(),
      wtg: els.parkWtgInput.value.trim(),
      cod: els.parkCodInput.value.trim(),
    }),
  );
  els.parkNameInput.value = "";
  els.parkTechnologyInput.value = "";
  els.parkWtgInput.value = "";
  els.parkCodInput.value = "";
  renderProjectParksList();
});
els.projectParksList.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-park]");
  if (!remove) return;
  editingProjectParks = editingProjectParks.filter((park) => park.id !== remove.dataset.removePark);
  renderProjectParksList();
});
document.querySelector("#quickTaskBtn").addEventListener("click", () => {
  document.querySelector('[data-view="project"]').click();
  openTaskDialog();
});
document.querySelector("#addTaskBtn").addEventListener("click", () => {
  openTaskDialog();
  els.taskForm.elements.isMilestone.value = "false";
});
document.querySelector("#addMilestoneBtn").addEventListener("click", () => {
  const current = project();
  openTaskDialog();
  els.taskForm.elements.title.value = "Marco do projeto";
  els.taskForm.elements.owner.value = current.manager || "";
  els.taskForm.elements.isMilestone.value = "true";
  els.taskForm.elements.description.value = "Ponto de controle do projeto, sem duração.";
  els.taskForm.elements.progress.value = 0;
  els.taskForm.elements.end.value = els.taskForm.elements.start.value;
});

els.taskForm.elements.imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    els.taskForm.elements.imageData.value = reader.result;
    renderImagePreview(reader.result);
  });
  reader.readAsDataURL(file);
});
document.querySelector("#splitTaskBtn").addEventListener("click", () => els.splitDialog.showModal());
document.querySelector("#exportBtn").addEventListener("click", exportFullBackup);

els.projectSelect.addEventListener("change", (event) => {
  activeProjectId = event.target.value;
  document.querySelector('[data-view="project"]').click();
  render();
});
els.projectManagerType.addEventListener("change", () => toggleResponsibleControls("projectManager"));
els.taskOwnerType.addEventListener("change", () => toggleResponsibleControls("taskOwner"));
els.ownerFilter.addEventListener("change", () => render());
els.parkFilter.addEventListener("change", () => render());
document.querySelector("#scaleToggle").addEventListener("click", (event) => {
  if (!event.target.dataset.scale) return;
  ganttScale = event.target.dataset.scale;
  document.querySelectorAll("#scaleToggle button").forEach((button) => button.classList.toggle("active", button.dataset.scale === ganttScale));
  renderGantt(project());
});

document.querySelector("#projectViewToggle").addEventListener("click", (event) => {
  if (!event.target.dataset.projectView) return;
  activeProjectView = event.target.dataset.projectView;
  renderProjectDisplayMode();
  saveState();
});

document.querySelector("#planningScaleToggle").addEventListener("click", (event) => {
  if (!event.target.dataset.planningDays) return;
  planningDays = Number(event.target.dataset.planningDays);
  renderPlanning();
  saveState();
});

document.querySelector("#planningViewToggle").addEventListener("click", (event) => {
  if (!event.target.dataset.planningView) return;
  activePlanningView = event.target.dataset.planningView;
  renderPlanningDisplayMode();
  saveState();
});

document.querySelector("#planningPrevBtn").addEventListener("click", () => {
  planningOffsetDays -= 7;
  renderPlanning();
  saveState();
});

document.querySelector("#planningTodayBtn").addEventListener("click", () => {
  planningOffsetDays = -21;
  renderPlanning();
  saveState();
});

document.querySelector("#planningNextBtn").addEventListener("click", () => {
  planningOffsetDays += 7;
  renderPlanning();
  saveState();
});

els.planningLegend.addEventListener("change", (event) => {
  const colorInput = event.target.closest("[data-planning-project-color]");
  if (!colorInput) return;
  state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
  const projectId = colorInput.dataset.planningProjectColor;
  state.planningProjectMeta[projectId] = {
    ...(state.planningProjectMeta[projectId] || {}),
    color: colorInput.value,
  };
  renderPlanning();
  saveState();
});

els.planningLegend.addEventListener("dblclick", (event) => {
  const editable = event.target.closest("[data-planning-project-label]");
  if (!editable) return;
  event.preventDefault();
  const projectId = editable.dataset.planningProjectLabel;
  const item = state.projects.find((projectItem) => projectItem.id === projectId);
  if (!item) return;
  startInlineTextEdit(editable, projectLegendLabel(item), (nextText) => {
    state.planningProjectMeta = state.planningProjectMeta && typeof state.planningProjectMeta === "object" ? state.planningProjectMeta : {};
    const cleanText = nextText.trim();
    state.planningProjectMeta[projectId] = {
      ...(state.planningProjectMeta[projectId] || {}),
      label: cleanText && cleanText !== defaultProjectLegendLabel(item) ? cleanText : "",
    };
    renderPlanning();
    saveState();
  });
});

document.querySelector("#plannerViewToggle").addEventListener("click", (event) => {
  if (!event.target.dataset.plannerView) return;
  activePlannerView = event.target.dataset.plannerView;
  renderPlanner();
  saveState();
});

document.querySelector("#plannerPrevBtn").addEventListener("click", () => movePlannerDate(-1));
document.querySelector("#plannerTodayBtn").addEventListener("click", () => {
  plannerDate = normalizeDateValue(new Date());
  renderPlanner();
  saveState();
});
document.querySelector("#plannerNextBtn").addEventListener("click", () => movePlannerDate(1));
els.plannerDateInput.addEventListener("change", () => {
  plannerDate = normalizeDateValue(els.plannerDateInput.value || new Date());
  renderPlanner();
  saveState();
});
els.plannerSourceFilter?.addEventListener("change", () => {
  activePlannerSourceFilter = els.plannerSourceFilter.value || "all";
  renderPlanner();
  saveState();
});
els.plannerProjectSelect.addEventListener("change", togglePlannerManualProject);
if (els.plannerUserSelect) {
  els.plannerUserSelect.addEventListener("change", () => {
    activePlannerUser = els.plannerUserSelect.value;
    renderPlanner();
    saveState();
  });
}
els.plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.plannerTextInput.value.trim();
  if (!text) return;
  const projectMeta = plannerProjectFromForm();
  if (!validatePlannerProject(projectMeta)) return;
  state.plannerItems.push({ id: uid(), user: plannerUserName(), text, ...projectMeta, date: plannerDate, weekly: els.plannerWeeklyInput.checked, doneDates: [], done: false, order: plannerItemsForDate(plannerDate).length + 1, createdAt: Date.now() });
  els.plannerTextInput.value = "";
  els.plannerWeeklyInput.checked = false;
  if (els.plannerProjectSelect.value === "manual") els.plannerProjectManualInput.value = "";
  renderPlanner();
  saveState();
});
els.plannerBoard.addEventListener("click", (event) => {
  const addDate = event.target.closest("[data-planner-add-date]");
  if (addDate) {
    plannerDate = addDate.dataset.plannerAddDate;
    els.plannerDateInput.value = plannerDate;
    els.plannerTextInput.focus();
    els.plannerTextInput.placeholder = `Adicionar tarefa em ${formatDate(plannerDate)}`;
    saveState();
    return;
  }
  const toggle = event.target.closest("[data-planner-toggle]");
  if (toggle) {
    const item = state.plannerItems.find((entry) => entry.id === toggle.dataset.plannerToggle);
    const dateValue = toggle.dataset.plannerToggleDate;
    if (item?.weekly) {
      item.doneDates = Array.isArray(item.doneDates) ? item.doneDates : [];
      if (toggle.checked && !item.doneDates.includes(dateValue)) item.doneDates.push(dateValue);
      if (!toggle.checked) item.doneDates = item.doneDates.filter((date) => date !== dateValue);
    } else if (item) {
      item.done = toggle.checked;
      item.completedDate = toggle.checked ? dateValue || item.date : "";
      item.doneDates = toggle.checked ? Array.from(new Set([...(item.doneDates || []), dateValue || item.date])) : [];
    }
    if (item) syncPlannerCompletionToProject(item, dateValue || item.date, toggle.checked);
    renderPlanner();
    saveState();
    return;
  }
  const editable = event.target.closest("[data-planner-edit]");
  if (editable) {
    event.preventDefault();
    const item = state.plannerItems.find((entry) => entry.id === editable.dataset.plannerEdit);
    if (!item) return;
    startInlineTextEdit(editable, item.text, (nextText) => {
      item.text = nextText;
      renderPlanner();
      saveState();
    });
    return;
  }
  const deleteButton = event.target.closest("[data-planner-delete]");
  if (deleteButton) {
    state.plannerItems = state.plannerItems.filter((entry) => entry.id !== deleteButton.dataset.plannerDelete);
    renderPlanner();
    saveState();
  }
});

els.plannerBoard.addEventListener("dblclick", (event) => {
  const editable = event.target.closest("[data-planner-edit]");
  if (!editable) return;
  event.preventDefault();
  const item = state.plannerItems.find((entry) => entry.id === editable.dataset.plannerEdit);
  if (!item) return;
  startInlineTextEdit(editable, item.text, (nextText) => {
    item.text = nextText;
    renderPlanner();
    saveState();
  });
});

els.plannerBoard.addEventListener("dragstart", (event) => {
  const todo = event.target.closest("[data-planner-drag]");
  if (!todo) return;
  event.dataTransfer.setData("text/plain", todo.dataset.plannerDrag);
});

els.plannerBoard.addEventListener("dragover", (event) => {
  const day = event.target.closest("[data-planner-date]");
  if (!day) return;
  event.preventDefault();
  document.querySelectorAll(".planner-todo.drop-before, .planner-todo.drop-after").forEach((item) => item.classList.remove("drop-before", "drop-after"));
  const targetTodo = event.target.closest("[data-planner-drag]");
  const draggedId = event.dataTransfer.getData("text/plain");
  if (!targetTodo || targetTodo.dataset.plannerDrag === draggedId) return;
  const rect = targetTodo.getBoundingClientRect();
  targetTodo.classList.add(event.clientY > rect.top + rect.height / 2 ? "drop-after" : "drop-before");
});

els.plannerBoard.addEventListener("drop", (event) => {
  const day = event.target.closest("[data-planner-date]");
  if (!day) return;
  event.preventDefault();
  const id = event.dataTransfer.getData("text/plain");
  const targetTodo = event.target.closest("[data-planner-drag]");
  let beforeId = "";
  if (targetTodo && targetTodo.dataset.plannerDrag !== id) {
    const rect = targetTodo.getBoundingClientRect();
    const cards = [...day.querySelectorAll("[data-planner-drag]")].filter((card) => card.dataset.plannerDrag !== id);
    const targetIndex = cards.findIndex((card) => card === targetTodo);
    const insertIndex = targetIndex + (event.clientY > rect.top + rect.height / 2 ? 1 : 0);
    beforeId = cards[insertIndex]?.dataset.plannerDrag || "";
  }
  document.querySelectorAll(".planner-todo.drop-before, .planner-todo.drop-after").forEach((item) => item.classList.remove("drop-before", "drop-after"));
  reorderPlannerItem(id, day.dataset.plannerDate, beforeId);
});

els.coordinationBoard.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-coordination-form]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  const member = form.dataset.coordinationForm;
  if (!text || !coordinationMembers.includes(member)) return;
  addCoordinationItem(member, text);
  input.value = "";
  input.focus();
});

els.coordinationBoard.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-coordination-delete]");
  if (deleteButton) {
    const item = state.coordinationItems.find((entry) => entry.id === deleteButton.dataset.coordinationDelete);
    state.coordinationItems = state.coordinationItems.filter((entry) => entry.id !== deleteButton.dataset.coordinationDelete);
    if (item) rebalanceCoordinationOrder(item.member);
    renderCoordination();
    saveState();
    return;
  }
  const editable = event.target.closest("[data-coordination-edit]");
  if (editable) {
    event.preventDefault();
    const item = state.coordinationItems.find((entry) => entry.id === editable.dataset.coordinationEdit);
    if (!item) return;
    startInlineTextEdit(editable, item.text, (nextText) => {
      item.text = nextText;
      renderCoordination();
      saveState();
    });
  }
});

els.coordinationBoard.addEventListener("change", (event) => {
  const toggle = event.target.closest("[data-coordination-toggle]");
  if (!toggle) return;
  const item = state.coordinationItems.find((entry) => entry.id === toggle.dataset.coordinationToggle);
  if (!item) return;
  item.done = toggle.checked;
  renderCoordination();
  saveState();
});

els.coordinationBoard.addEventListener("dblclick", (event) => {
  const editable = event.target.closest("[data-coordination-edit]");
  if (!editable) return;
  event.preventDefault();
  const item = state.coordinationItems.find((entry) => entry.id === editable.dataset.coordinationEdit);
  if (!item) return;
  startInlineTextEdit(editable, item.text, (nextText) => {
    item.text = nextText;
    renderCoordination();
    saveState();
  });
});

els.coordinationBoard.addEventListener("dragstart", (event) => {
  const task = event.target.closest("[data-coordination-drag]");
  if (!task) return;
  event.stopPropagation();
  event.dataTransfer.setData("text/plain", task.dataset.coordinationDrag);
  event.dataTransfer.effectAllowed = "move";
  task.classList.add("dragging");
});

els.coordinationBoard.addEventListener("dragend", (event) => {
  event.stopPropagation();
  event.target.closest("[data-coordination-drag]")?.classList.remove("dragging");
  document.querySelectorAll(".coordination-column.drag-over, .coordination-task.drop-before, .coordination-task.drop-after").forEach((item) => {
    item.classList.remove("drag-over", "drop-before", "drop-after");
  });
});

els.coordinationBoard.addEventListener("dragover", (event) => {
  const column = event.target.closest("[data-coordination-member]");
  if (!column) return;
  event.preventDefault();
  event.stopPropagation();
  column.classList.add("drag-over");
  document.querySelectorAll(".coordination-task.drop-before, .coordination-task.drop-after").forEach((item) => {
    item.classList.remove("drop-before", "drop-after");
  });
  const targetTask = event.target.closest("[data-coordination-drag]");
  const draggingId = event.dataTransfer.getData("text/plain");
  if (!targetTask || targetTask.dataset.coordinationDrag === draggingId) return;
  const rect = targetTask.getBoundingClientRect();
  targetTask.classList.add(event.clientY > rect.top + rect.height / 2 ? "drop-after" : "drop-before");
});

els.coordinationBoard.addEventListener("dragleave", (event) => {
  const column = event.target.closest("[data-coordination-member]");
  if (column && !column.contains(event.relatedTarget)) column.classList.remove("drag-over");
});

els.coordinationBoard.addEventListener("drop", (event) => {
  const column = event.target.closest("[data-coordination-member]");
  if (!column) return;
  event.preventDefault();
  event.stopPropagation();
  column.classList.remove("drag-over");
  const draggedId = event.dataTransfer.getData("text/plain");
  const targetTask = event.target.closest("[data-coordination-drag]");
  let beforeId = "";
  if (targetTask && targetTask.dataset.coordinationDrag !== draggedId) {
    const rect = targetTask.getBoundingClientRect();
    const cards = [...column.querySelectorAll("[data-coordination-drag]")].filter((card) => card.dataset.coordinationDrag !== draggedId);
    const targetIndex = cards.findIndex((card) => card === targetTask);
    const insertIndex = targetIndex + (event.clientY > rect.top + rect.height / 2 ? 1 : 0);
    beforeId = cards[insertIndex]?.dataset.coordinationDrag || "";
  }
  reorderCoordinationItem(draggedId, column.dataset.coordinationMember, beforeId);
});

document.querySelector("#addNegotiationBtn").addEventListener("click", () => {
  openPipelineProjectDialog("Em negociação");
});

document.querySelector("#addContractedBtn").addEventListener("click", () => {
  openPipelineProjectDialog("Contratado");
});

document.body.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-open-project]");
  if (projectButton) {
    activeProjectId = projectButton.dataset.openProject;
    document.querySelector('[data-view="project"]').click();
    render();
    return;
  }
  const editButton = event.target.closest("[data-edit-task]");
  if (editButton) openTaskDialog(editButton.dataset.editTask);
});

document.body.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".task-card");
  if (!card) return;
  event.dataTransfer.setData("text/plain", card.dataset.taskId);
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
});

document.body.addEventListener("dragend", (event) => {
  event.target.closest(".task-card")?.classList.remove("dragging");
  document.querySelectorAll(".column.drag-over").forEach((column) => column.classList.remove("drag-over"));
});

document.body.addEventListener("dragover", (event) => {
  const column = event.target.closest("[data-kanban-status]");
  if (!column) return;
  event.preventDefault();
  column.classList.add("drag-over");
});

document.body.addEventListener("dragleave", (event) => {
  const column = event.target.closest("[data-kanban-status]");
  if (column && !column.contains(event.relatedTarget)) column.classList.remove("drag-over");
});

document.body.addEventListener("drop", (event) => {
  const column = event.target.closest("[data-kanban-status]");
  if (!column) return;
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const task = project().tasks.find((item) => item.id === taskId);
  if (task) {
    task.status = column.dataset.kanbanStatus;
    render();
  }
});

els.projectForm.addEventListener("submit", saveProjectForm);
els.taskForm.addEventListener("submit", saveTaskForm);
els.addCheckinBtn?.addEventListener("click", () => {
  els.taskCheckinAdd.classList.toggle("hidden-field");
  if (!els.taskCheckinAdd.classList.contains("hidden-field")) els.taskCheckinInput.focus();
});
els.saveCheckinBtn?.addEventListener("click", addTaskCheckin);
els.taskCheckinInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTaskCheckin();
  }
});
els.toggleCheckedCheckinsBtn?.addEventListener("click", () => {
  hideCheckedCheckins = !hideCheckedCheckins;
  renderTaskCheckins();
});
els.taskCheckinList?.addEventListener("change", (event) => {
  const toggle = event.target.closest("[data-task-checkin-toggle]");
  if (!toggle) return;
  const found = findCheckinItem(toggle.dataset.taskCheckinToggle);
  if (!found) return;
  found.item.done = toggle.checked;
  found.item.doneAt = toggle.checked ? new Date().toISOString() : "";
  renderTaskCheckins();
});
els.taskCheckinList?.addEventListener("click", (event) => {
  const addItemButton = event.target.closest("[data-task-checkin-item-add]");
  if (addItemButton) {
    event.preventDefault();
    const groupId = addItemButton.dataset.taskCheckinItemAdd;
    const input = els.taskCheckinList.querySelector(`[data-task-checkin-item-input="${CSS.escape(groupId)}"]`);
    addCheckinItemToGroup(groupId, input?.value || "");
    return;
  }
  const deleteGroupButton = event.target.closest("[data-task-checkin-group-delete]");
  if (deleteGroupButton) {
    event.preventDefault();
    editingTaskCheckinGroups = editingTaskCheckinGroups.filter((entry) => entry.id !== deleteGroupButton.dataset.taskCheckinGroupDelete);
    renderTaskCheckins();
    return;
  }
  const deleteButton = event.target.closest("[data-task-checkin-delete]");
  if (!deleteButton) return;
  event.preventDefault();
  editingTaskCheckinGroups.forEach((group) => {
    group.items = group.items.filter((entry) => entry.id !== deleteButton.dataset.taskCheckinDelete);
  });
  renderTaskCheckins();
});
els.taskCheckinList?.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-task-checkin-item-input]");
  if (!input || event.key !== "Enter") return;
  event.preventDefault();
  addCheckinItemToGroup(input.dataset.taskCheckinItemInput, input.value);
});
els.taskCheckinList?.addEventListener("dblclick", (event) => {
  const groupEditable = event.target.closest("[data-task-checkin-group-edit]");
  if (groupEditable) {
    event.preventDefault();
    const group = editingTaskCheckinGroups.find((entry) => entry.id === groupEditable.dataset.taskCheckinGroupEdit);
    if (!group) return;
    startInlineTextEdit(groupEditable, group.title, (nextText) => {
      group.title = nextText;
      renderTaskCheckins();
    });
    return;
  }
  const editable = event.target.closest("[data-task-checkin-edit]");
  if (!editable) return;
  event.preventDefault();
  const found = findCheckinItem(editable.dataset.taskCheckinEdit);
  if (!found) return;
  startInlineTextEdit(editable, found.item.text, (nextText) => {
    found.item.text = nextText;
    renderTaskCheckins();
  });
});
els.splitForm.addEventListener("submit", splitTask);
els.deleteTaskBtn.addEventListener("click", () => {
  const id = els.taskForm.elements.id.value;
  const current = project();
  current.tasks = current.tasks.filter((item) => item.id !== id);
  state.plannerItems = state.plannerItems.filter((item) => !(item.sourceProjectId === current.id && item.sourceTaskId === id));
  current.tasks.forEach((item) => {
    if (item.dependsOn === id) item.dependsOn = "";
    item.dependsOnIds = (item.dependsOnIds || []).filter((dependencyId) => dependencyId !== id);
  });
  els.taskDialog.close();
  render();
  saveState();
});

requireLogin();




