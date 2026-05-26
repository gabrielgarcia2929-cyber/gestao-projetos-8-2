const storeKey = "gestao-projetos-v1";
const msDay = 24 * 60 * 60 * 1000;

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
  LTE: ["Relatório Final", "Capex e Opex", "MNC", "Outro"],
  TQI: ["Relatório Final", "MNC", "Outro"],
  DD: ["Relatório Final", "Outro"],
  Arbitragem: ["Relatório Final", "Outro"],
  RCA: ["Relatório Final", "Outro"],
  Outro: ["Relatório Final", "Outro"],
};

const state = loadState();
let activeProjectId = state.activeProjectId || state.projects[0].id;
let ganttScale = "day";
let activeProjectView = state.activeProjectView || "kanban";
let planningDays = state.planningDays || 75;

const els = {
  pageEyebrow: document.querySelector("#pageEyebrow"),
  projectSelect: document.querySelector("#projectSelect"),
  projectTitle: document.querySelector("#projectTitle"),
  projectPortfolio: document.querySelector("#projectPortfolio"),
  involvedList: document.querySelector("#involvedList"),
  involvedInput: document.querySelector("#involvedInput"),
  addInvolvedBtn: document.querySelector("#addInvolvedBtn"),
  projectTypeSelect: document.querySelector("#projectTypeSelect"),
  projectTypeOtherLabel: document.querySelector("#projectTypeOtherLabel"),
  deliverablesOptions: document.querySelector("#deliverablesOptions"),
  languageLabel: document.querySelector("#languageLabel"),
  deliverableOtherLabel: document.querySelector("#deliverableOtherLabel"),
  metricProgress: document.querySelector("#metricProgress"),
  metricOpen: document.querySelector("#metricOpen"),
  metricRisk: document.querySelector("#metricRisk"),
  metricDeadline: document.querySelector("#metricDeadline"),
  projectDetails: document.querySelector("#projectDetails"),
  nextTasks: document.querySelector("#nextTasks"),
  ganttChart: document.querySelector("#ganttChart"),
  ownerFilter: document.querySelector("#ownerFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  taskBoard: document.querySelector("#taskBoard"),
  taskList: document.querySelector("#taskList"),
  planningGrid: document.querySelector("#planningGrid"),
  planningLegend: document.querySelector("#planningLegend"),
  projectDialog: document.querySelector("#projectDialog"),
  projectForm: document.querySelector("#projectForm"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  taskImagePreview: document.querySelector("#taskImagePreview"),
  splitDialog: document.querySelector("#splitDialog"),
  splitForm: document.querySelector("#splitForm"),
  deleteTaskBtn: document.querySelector("#deleteTaskBtn"),
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
  return { activeProjectId: sampleProject.id, projects: [sampleProject] };
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
  task.description = task.description ?? task.notes ?? "";
  task.checklist = task.checklist ?? "";
  task.attachments = task.attachments ?? "";
  task.comments = task.comments ?? "";
  task.labels = task.labels ?? "";
  task.imageData = task.imageData ?? "";
  task.isMilestone = task.isMilestone === true || task.isMilestone === "true";
  return task;
}

function normalizeProject(item) {
  item.people = item.people ?? "";
  item.manager = item.manager ?? "";
  item.projectType = item.projectType ?? inferProjectType(item.name);
  item.projectTypeOther = item.projectTypeOther ?? "";
  item.deliverables = Array.isArray(item.deliverables) ? item.deliverables : splitLinesOrComma(item.deliverables);
  item.deliverableOther = item.deliverableOther ?? "";
  item.language = item.language ?? "";
  return item;
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

function saveState() {
  state.activeProjectId = activeProjectId;
  state.activeProjectView = activeProjectView;
  state.planningDays = planningDays;
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function project() {
  return state.projects.find((item) => item.id === activeProjectId) || state.projects[0];
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / msDay);
}

function formatDate(value) {
  if (!value) return "-";
  return parseDate(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function render() {
  state.projects.forEach(normalizeProject);
  const current = project();
  current.tasks.forEach(normalizeTask);
  renderPageTitle();
  renderProjectSelect();
  renderProjectPortfolio();
  renderMetrics(current);
  renderDetails(current);
  renderInvolved(current);
  renderNextTasks(current);
  renderFilters(current);
  renderGantt(current);
  renderBoard(current);
  renderTaskList(current);
  renderPlanning();
  fillTaskSelects(current);
  renderProjectDisplayMode();
  saveState();
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
  els.pageEyebrow.textContent = "Projeto ativo";
  els.projectTitle.textContent = current.name;
}

function renderProjectSelect() {
  els.projectSelect.innerHTML = state.projects
    .map((item) => `<option value="${item.id}" ${item.id === activeProjectId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
    .join("");
}

function renderProjectPortfolio() {
  els.projectPortfolio.innerHTML = state.projects
    .map((item) => {
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
    .join("");
}

function renderMetrics(current) {
  const tasks = current.tasks;
  const progress = tasks.length ? Math.round(tasks.reduce((sum, item) => sum + Number(item.progress), 0) / tasks.length) : 0;
  const open = tasks.filter((item) => item.status !== "concluido").length;
  const risk = tasks.filter((item) => item.status === "standby").length;
  const next = tasks
    .filter((item) => item.status !== "concluido")
    .sort((a, b) => parseDate(a.end) - parseDate(b.end))[0];

  els.metricProgress.textContent = `${progress}%`;
  els.metricOpen.textContent = open;
  els.metricRisk.textContent = risk;
  els.metricDeadline.textContent = next ? formatDate(next.end) : "-";
}

function renderDetails(current) {
  const details = [
    ["Tipo", projectTypeLabel(current)],
    ["Entregáveis", deliverablesLabel(current)],
    ...(current.deliverables?.includes("Relatório Final") ? [["Idioma", current.language || "-"]] : []),
    ["Descrição", current.goal],
    ["Responsável", current.manager || "-"],
    ["Período", `${formatDate(current.start)} a ${formatDate(current.end)}`],
    ["Prioridade", current.priority],
    ["Status", current.status],
  ];
  els.projectDetails.innerHTML = details.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join("");
}

function renderInvolved(current) {
  const people = splitLinesOrComma(current.people);
  els.involvedList.innerHTML = people.length
    ? people.map((person) => `<span class="person-card">${escapeHtml(person)}</span>`).join("")
    : empty("Nenhum envolvido adicionado.");
}

function renderNextTasks(current) {
  const tasks = current.tasks
    .filter((item) => item.status !== "concluido")
    .sort((a, b) => parseDate(a.end) - parseDate(b.end))
    .slice(0, 5);
  els.nextTasks.innerHTML = tasks.length ? tasks.map(taskCard).join("") : empty("Nenhuma ação aberta.");
}

function renderFilters(current) {
  const owners = Array.from(new Set(current.tasks.map((item) => item.owner).filter(Boolean))).sort();
  const selected = els.ownerFilter.value || "all";
  els.ownerFilter.innerHTML = `<option value="all">Todos os responsáveis</option>${owners
    .map((owner) => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`)
    .join("")}`;
  els.ownerFilter.value = owners.includes(selected) ? selected : "all";
}

function filteredTasks(current) {
  const owner = els.ownerFilter.value || "all";
  const status = els.statusFilter.value || "all";
  return current.tasks.filter((task) => {
    const ownerOk = owner === "all" || task.owner === owner;
    const statusOk = status === "all" || task.status === status;
    return ownerOk && statusOk;
  });
}

function renderGantt(current) {
  const tasks = filteredTasks(current).sort((a, b) => parseDate(a.start) - parseDate(b.start));
  if (!tasks.length) {
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
  els.ganttChart.innerHTML = `<div class="gantt-header" style="grid-template-columns:240px ${timelineWidth}px">
    <div class="gantt-label">Tarefa</div>
    <div class="gantt-dates" style="grid-template-columns:repeat(${cells}, ${cellWidth}px)">${dates}</div>
  </div>${rows}`;
}

function renderBoard(current) {
  const columns = Object.keys(statusLabels);
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

function toggleProjectTypeOther() {
  const isOther = els.projectTypeSelect.value === "Outro";
  els.projectTypeOtherLabel.classList.toggle("hidden-field", !isOther);
  els.projectForm.elements.projectTypeOther.disabled = !isOther;
  if (!isOther) els.projectForm.elements.projectTypeOther.value = "";
  renderDeliverablesOptions();
  toggleDeliverableConditionalFields();
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
  return `<article class="task-card" draggable="true" data-task-id="${task.id}">
    <header>
      <strong>${escapeHtml(task.title)}</strong>
      <button data-edit-task="${task.id}" title="Abrir cartão">✎</button>
    </header>
    <div class="task-meta">
      <span>${escapeHtml(task.owner)}</span>
      <span class="status status-${task.status}">${statusLabels[task.status] || task.status}</span>
    </div>
    <div class="progress" title="${task.progress}% concluído"><span style="width:${Number(task.progress)}%"></span></div>
    ${renderTaskBadges(task)}
    <small>${formatDate(task.start)} a ${formatDate(task.end)}</small>
  </article>`;
}

function renderTaskBadges(task) {
  const labels = splitLinesOrComma(task.labels).slice(0, 3);
  const checklistCount = splitLinesOrComma(task.checklist).length;
  const commentsCount = splitLinesOrComma(task.comments).length;
  const meta = [];
  if (task.isMilestone) meta.push("Marco");
  if (checklistCount) meta.push(`☑ ${checklistCount}`);
  if (commentsCount) meta.push(`☰ ${commentsCount}`);
  if (task.attachments) meta.push("Anexo");
  if (task.imageData) meta.push("Imagem");
  const labelHtml = labels.map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`).join("");
  const metaHtml = meta.map((item) => `<span class="task-mini-meta">${item}</span>`).join("");
  return labelHtml || metaHtml ? `<div class="task-badges">${labelHtml}${metaHtml}</div>` : "";
}

function renderPlanning() {
  const members = collectMembers();
  const projects = state.projects.map(normalizeProject);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: planningDays }, (_, index) => new Date(start.getTime() + index * msDay));
  const colors = projectColors(projects);

  document.querySelectorAll("#planningScaleToggle button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.planningDays) === planningDays);
  });

  const header = `<div class="planning-corner">Membro</div>${days
    .map((day) => `<div class="planning-date ${day.getDay() === 0 || day.getDay() === 6 ? "weekend" : ""}">${formatShortDate(day)}</div>`)
    .join("")}`;

  const rows = members
    .map((member) => {
      const cells = days
        .map((day) => {
          const allocations = projects.filter((item) => projectHasMember(item, member) && dateInRange(day, item.start, item.end));
          if (!allocations.length) return `<div class="planning-cell"></div>`;
          const projectNames = allocations.map((item) => item.name).join(" / ");
          const background = allocations.length === 1 ? colors.get(allocations[0].id) : `linear-gradient(135deg, ${allocations.map((item) => colors.get(item.id)).join(", ")})`;
          return `<div class="planning-cell allocated" title="${escapeHtml(projectNames)}" style="background:${background}">${allocations.length > 1 ? allocations.length : ""}</div>`;
        })
        .join("");
      return `<div class="planning-member">${escapeHtml(member)}</div>${cells}`;
    })
    .join("");

  els.planningGrid.style.gridTemplateColumns = `150px repeat(${days.length}, 34px)`;
  els.planningGrid.innerHTML = members.length ? header + rows : empty("Adicione envolvidos aos projetos para montar o planejamento.");
  els.planningLegend.innerHTML = projects
    .map((item) => `<span class="legend-item"><i style="background:${colors.get(item.id)}"></i>${escapeHtml(item.name)}</span>`)
    .join("");
}

function collectMembers() {
  const names = new Set();
  state.projects.forEach((item) => splitLinesOrComma(item.people).forEach((person) => names.add(person)));
  return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function projectHasMember(item, member) {
  return splitLinesOrComma(item.people).some((person) => person.toLowerCase() === member.toLowerCase());
}

function dateInRange(date, start, end) {
  return date >= parseDate(start) && date <= parseDate(end);
}

function projectColors(projects) {
  const palette = ["#ff8200", "#111111", "#7c2d12", "#facc15", "#6b7280", "#fb7185", "#38bdf8", "#a855f7", "#22c55e", "#ef4444"];
  return new Map(projects.map((item, index) => [item.id, palette[index % palette.length]]));
}

function fillTaskSelects(current) {
  const options = `<option value="">Sem dependência</option>${current.tasks
    .map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`)
    .join("")}`;
  els.taskForm.elements.dependsOn.innerHTML = options;
  els.splitForm.elements.taskId.innerHTML = current.tasks
    .map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`)
    .join("");
}

function empty(text) {
  return `<div class="empty">${text}</div>`;
}

function openProjectDialog(newProject = false) {
  const current = newProject
    ? { name: "", projectType: "TQI", projectTypeOther: "", deliverables: [], deliverableOther: "", language: "", goal: "", manager: "", people: "", start: isoDate(new Date()), end: isoDate(new Date(Date.now() + 30 * msDay)), priority: "Média", status: "Planejamento" }
    : normalizeProject(project());
  els.projectForm.dataset.mode = newProject ? "new" : "edit";
  Object.entries(current).forEach(([key, value]) => {
    if (els.projectForm.elements[key] && key !== "deliverables") els.projectForm.elements[key].value = value;
  });
  renderDeliverablesOptions(current.deliverables || []);
  toggleProjectTypeOther();
  renderDeliverablesOptions(current.deliverables || []);
  toggleDeliverableConditionalFields();
  if (current.deliverables?.includes("Relatório Final")) els.projectForm.elements.language.value = current.language || "";
  if (current.deliverables?.includes("Outro")) els.projectForm.elements.deliverableOther.value = current.deliverableOther || "";
  els.projectDialog.showModal();
}

function openTaskDialog(taskId = "") {
  const current = project();
  const task = normalizeTask(current.tasks.find((item) => item.id === taskId) || makeTask("", current.manager || "", current.start, current.end));
  Object.entries(task).forEach(([key, value]) => {
    if (els.taskForm.elements[key] && els.taskForm.elements[key].type !== "file") els.taskForm.elements[key].value = value;
  });
  els.taskForm.elements.id.value = taskId;
  els.taskForm.elements.attachments.value = "";
  els.taskForm.elements.imageInput.value = "";
  renderImagePreview(task.imageData);
  els.deleteTaskBtn.hidden = !taskId;
  els.taskDialog.showModal();
}

function saveProjectForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.projectForm));
  data.deliverables = getSelectedDeliverables();
  if (data.projectType !== "Outro") data.projectTypeOther = "";
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
  }
  els.projectDialog.close();
  render();
}

function saveTaskForm(event) {
  event.preventDefault();
  const current = project();
  const data = Object.fromEntries(new FormData(els.taskForm));
  const existingTask = current.tasks.find((item) => item.id === data.id);
  data.progress = Number(data.progress || 0);
  data.isMilestone = data.isMilestone === "true";
  data.attachments = normalizeAttachmentNames(els.taskForm.elements.attachments.files, existingTask?.attachments);
  data.imageData = els.taskForm.elements.imageData.value || "";
  delete data.imageInput;
  if (data.isMilestone) data.end = data.start;
  if (parseDate(data.end) < parseDate(data.start)) data.end = data.start;
  if (data.id) {
    Object.assign(existingTask, data);
  } else {
    current.tasks.push({ ...data, id: uid() });
  }
  els.taskDialog.close();
  render();
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
    current.tasks.push(makeTask(title, base.owner, isoDate(start), isoDate(end), "afazer", 0, base.id));
  });
  els.splitDialog.close();
  els.splitForm.reset();
  render();
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

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}View`).classList.add("active");
    renderPageTitle();
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
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
els.projectTypeSelect.addEventListener("change", toggleProjectTypeOther);
els.deliverablesOptions.addEventListener("change", toggleDeliverableConditionalFields);
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

els.addInvolvedBtn.addEventListener("click", () => {
  const name = els.involvedInput.value.trim();
  if (!name) return;
  const current = project();
  const people = splitLinesOrComma(current.people);
  if (!people.some((person) => person.toLowerCase() === name.toLowerCase())) {
    people.push(name);
    current.people = people.join("\n");
  }
  els.involvedInput.value = "";
  render();
});

els.involvedInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    els.addInvolvedBtn.click();
  }
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
document.querySelector("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(project(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${project().name.toLowerCase().replaceAll(" ", "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

els.projectSelect.addEventListener("change", (event) => {
  activeProjectId = event.target.value;
  document.querySelector('[data-view="project"]').click();
  render();
});
els.ownerFilter.addEventListener("change", () => render());
els.statusFilter.addEventListener("change", () => render());
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
els.splitForm.addEventListener("submit", splitTask);
els.deleteTaskBtn.addEventListener("click", () => {
  const id = els.taskForm.elements.id.value;
  const current = project();
  current.tasks = current.tasks.filter((item) => item.id !== id);
  current.tasks.forEach((item) => {
    if (item.dependsOn === id) item.dependsOn = "";
  });
  els.taskDialog.close();
  render();
});

render();
