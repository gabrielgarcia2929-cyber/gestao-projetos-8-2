<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gestão de Projetos</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="assets/logo-8-2.png" alt="8.2 The Experts in Renewable Energy" />
          <div>
            <strong>Projetos</strong>
            <span>Coordenação e execução</span>
          </div>
        </div>

        <nav class="nav">
          <button class="nav-item active" data-view="portfolio" title="Projetos">
            <span class="icon">▦</span>
            <span>Projetos</span>
          </button>
          <button class="nav-item" data-view="project" title="Projeto ativo">
            <span class="icon">☑</span>
            <span>Projeto ativo</span>
          </button>
          <button class="nav-item" data-view="planning" title="Planejamento">
            <span class="icon">▥</span>
            <span>Planejamento</span>
          </button>
        </nav>

        <div class="project-picker">
          <label for="projectSelect">Projeto ativo</label>
          <select id="projectSelect"></select>
          <button class="ghost-button full" id="newProjectBtn">+ Novo projeto</button>
        </div>
      </aside>

      <main class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow" id="pageEyebrow">Carteira de projetos</p>
            <h1 id="projectTitle">Projeto</h1>
            <p class="developer-credit">Developed by: Gabriel Garcia</p>
          </div>
          <div class="topbar-actions">
            <button class="ghost-button" id="exportBtn" title="Exportar dados">Exportar</button>
            <button class="primary-button" id="quickTaskBtn">+ Tarefa</button>
          </div>
        </header>

        <section class="view active" id="portfolioView">
          <div class="portfolio-grid" id="projectPortfolio"></div>
        </section>

        <section class="view" id="projectView">
          <div class="summary-grid">
            <div class="metric">
              <span>Progresso</span>
              <strong id="metricProgress">0%</strong>
            </div>
            <div class="metric">
              <span>Tarefas abertas</span>
              <strong id="metricOpen">0</strong>
            </div>
            <div class="metric">
              <span>Stand-by</span>
              <strong id="metricRisk">0</strong>
            </div>
            <div class="metric">
              <span>Próximo prazo</span>
              <strong id="metricDeadline">-</strong>
            </div>
          </div>

          <div class="two-column">
            <section class="panel">
              <div class="panel-header">
                <h2>Informações iniciais</h2>
                <button class="icon-button" id="editProjectBtn" title="Editar projeto">✎</button>
              </div>
              <dl class="project-details" id="projectDetails"></dl>
              <div class="involved-panel">
                <div class="panel-header compact">
                  <h3>Envolvidos no projeto</h3>
                </div>
                <div class="involved-list" id="involvedList"></div>
                <div class="involved-form">
                  <input id="involvedInput" placeholder="Nome da pessoa" />
                  <button class="ghost-button" id="addInvolvedBtn" type="button">Adicionar</button>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-header">
                <h2>Próximas ações</h2>
                <button class="icon-button" id="splitTaskBtn" title="Dividir tarefa">⧉</button>
              </div>
              <div class="task-stack" id="nextTasks"></div>
            </section>
          </div>

          <section class="panel project-work-panel">
            <div class="panel-header project-work-header">
              <div>
                <h2>Etapas do projeto</h2>
                <p>Escolha como quer visualizar e destrinchar as tarefas deste projeto.</p>
              </div>
              <div class="toolbar">
                <button class="primary-button" id="addTaskBtn" title="Criar uma atividade com duração">+ Nova tarefa</button>
                <button class="ghost-button" id="addMilestoneBtn" title="Criar um ponto de controle sem duração">+ Marco</button>
              </div>
            </div>

            <div class="project-view-toolbar">
              <div class="segmented" id="projectViewToggle">
                <button class="active" data-project-view="kanban">Kanban</button>
                <button data-project-view="list">Lista</button>
                <button data-project-view="gantt">Gantt</button>
              </div>
              <div class="segmented" id="scaleToggle">
                <button class="active" data-scale="day">Dia</button>
                <button data-scale="week">Semana</button>
              </div>
              <select id="ownerFilter" title="Filtrar por responsável"></select>
              <select id="statusFilter" title="Filtrar por status">
                <option value="all">Todos os status</option>
                <option value="aprovado">Aprovado</option>
                <option value="afazer">A fazer</option>
                <option value="andamento">Em andamento</option>
                <option value="revisao">Revisão</option>
                <option value="standby">Stand-by</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div class="project-display active" id="kanbanDisplay">
              <div class="board" id="taskBoard"></div>
            </div>
            <div class="project-display" id="listDisplay">
              <div class="task-list" id="taskList"></div>
            </div>
            <div class="project-display" id="ganttDisplay">
              <div class="gantt-wrap">
                <div class="gantt" id="ganttChart"></div>
              </div>
            </div>
          </section>
        </section>

        <section class="view" id="planningView">
          <section class="panel">
            <div class="panel-header project-work-header">
              <div>
                <h2>Planejamento da equipe</h2>
                <p>Alocação automática baseada nos envolvidos e no período de cada projeto.</p>
              </div>
              <div class="segmented" id="planningScaleToggle">
                <button class="active" data-planning-days="45">45 dias</button>
                <button data-planning-days="75">75 dias</button>
                <button data-planning-days="120">120 dias</button>
              </div>
            </div>
            <div class="planning-wrap">
              <div class="planning-grid" id="planningGrid"></div>
            </div>
            <div class="planning-legend" id="planningLegend"></div>
          </section>
        </section>
      </main>
    </div>

    <dialog id="projectDialog">
      <form method="dialog" id="projectForm" class="modal-form">
        <h2>Projeto</h2>
        <label>Cliente <input name="name" required /></label>
        <div class="form-grid">
          <label>Tipo de projeto
            <select name="projectType" id="projectTypeSelect">
              <option value="TQI">TQI</option>
              <option value="DD">DD</option>
              <option value="Arbitragem">Arbitragem</option>
              <option value="RCA">RCA</option>
              <option value="LTE">LTE</option>
              <option value="Outro">Outro</option>
            </select>
          </label>
          <label id="projectTypeOtherLabel" class="hidden-field">Qual tipo? <input name="projectTypeOther" placeholder="Descreva o tipo de projeto" /></label>
        </div>
        <label>Descrição <textarea name="goal" rows="3" required></textarea></label>
        <section class="form-section">
          <h3>Entregáveis</h3>
          <div class="checkbox-grid" id="deliverablesOptions"></div>
          <label id="languageLabel" class="hidden-field">Idioma
            <select name="language">
              <option value="">Selecione</option>
              <option value="Português">Português</option>
              <option value="Espanhol">Espanhol</option>
              <option value="Inglês">Inglês</option>
            </select>
          </label>
          <label id="deliverableOtherLabel" class="hidden-field">Outro entregável <input name="deliverableOther" placeholder="Descreva o entregável" /></label>
        </section>
        <div class="form-grid">
          <label class="project-manager-field">Responsável <input name="manager" /></label>
          <label>Envolvidos no projeto <textarea name="people" rows="3" placeholder="Uma pessoa por linha"></textarea></label>
          <label>Início <input name="start" type="date" required /></label>
          <label>Fim <input name="end" type="date" required /></label>
          <label>Prioridade
            <select name="priority">
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
          </label>
          <label>Status
            <select name="status">
              <option>Em andamento</option>
              <option>Planejamento</option>
              <option>Em risco</option>
              <option>Concluído</option>
            </select>
          </label>
        </div>
        <menu>
          <button class="ghost-button" value="cancel" type="button" data-close>Cancelar</button>
          <button class="primary-button" value="default">Salvar</button>
        </menu>
      </form>
    </dialog>

    <dialog id="taskDialog">
      <form method="dialog" id="taskForm" class="modal-form task-detail-form">
        <div class="task-modal-header">
          <div>
            <p class="eyebrow">Cartão do projeto</p>
            <h2>Tarefa</h2>
          </div>
          <button class="icon-button" value="cancel" type="button" data-close title="Fechar">×</button>
        </div>
        <input type="hidden" name="id" />
        <input type="hidden" name="imageData" />
        <input type="hidden" name="isMilestone" value="false" />
        <label class="task-title-field">Título <input name="title" required /></label>
        <div class="form-grid">
          <label>Responsável <input name="owner" required /></label>
          <label>Status
            <select name="status">
              <option value="aprovado">Aprovado</option>
              <option value="afazer">A fazer</option>
              <option value="andamento">Em andamento</option>
              <option value="revisao">Revisão</option>
              <option value="standby">Stand-by</option>
              <option value="concluido">Concluído</option>
            </select>
          </label>
          <label>Data inicial <input name="start" type="date" required /></label>
          <label>Data final <input name="end" type="date" required /></label>
          <label>Progresso
            <div class="progress-scale" aria-hidden="true"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div>
            <input name="progress" type="range" min="0" max="100" step="5" />
          </label>
          <label>Dependência <select name="dependsOn"></select></label>
        </div>
        <div class="task-actions-row">
          <button class="ghost-button" type="button" data-focus-field="checklist">+ Checklist</button>
          <button class="ghost-button" type="button" data-focus-field="attachments">+ Anexo</button>
          <button class="ghost-button" type="button" data-focus-field="labels">+ Etiqueta</button>
          <button class="ghost-button" type="button" data-focus-field="imageInput">+ Imagem</button>
        </div>
        <label class="span-2">Descrição da atividade <textarea name="description" rows="5" placeholder="Detalhe o escopo, critérios de aceite, entregáveis e observações importantes."></textarea></label>
        <div class="form-grid task-extra-grid">
          <label>Check-list <textarea name="checklist" rows="5" placeholder="Uma atividade por linha"></textarea></label>
          <label>Comentários <textarea name="comments" rows="5" placeholder="Registre decisões, dúvidas e alinhamentos"></textarea></label>
          <label>Etiquetas <input name="labels" placeholder="Ex.: 2026, urgente, cliente" /></label>
          <label>Anexo <input name="attachments" type="file" multiple /></label>
          <label class="span-2">Imagem <input id="imageInput" name="imageInput" type="file" accept="image/*" /></label>
        </div>
        <div class="image-preview" id="taskImagePreview"></div>
        <menu>
          <button class="danger-button" type="button" id="deleteTaskBtn">Excluir</button>
          <span></span>
          <button class="ghost-button" value="cancel" type="button" data-close>Cancelar</button>
          <button class="primary-button" value="default">Salvar</button>
        </menu>
      </form>
    </dialog>

    <dialog id="splitDialog">
      <form method="dialog" id="splitForm" class="modal-form">
        <h2>Dividir tarefa</h2>
        <label>Tarefa base <select name="taskId" required></select></label>
        <label>Subtarefas <textarea name="items" rows="6" required placeholder="Uma subtarefa por linha"></textarea></label>
        <menu>
          <button class="ghost-button" value="cancel" type="button" data-close>Cancelar</button>
          <button class="primary-button" value="default">Criar subtarefas</button>
        </menu>
      </form>
    </dialog>

    <script src="app.js"></script>
  </body>
</html>
