import { FormEvent, ReactNode, useState } from 'react'

type Screen =
  | 'home'
  | 'alerts'
  | 'services'
  | 'collaborative'
  | 'concierge'
  | 'maintenance'
  | 'settings'

type CollaborativeAd = {
  id: number
  title: string
  description: string
  category: string
  contact: string
  author: string
  date: string
}

const navItems: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'alerts', label: 'Avisos', icon: '!' },
  { id: 'services', label: 'Mural', icon: '▦' },
  { id: 'concierge', label: 'Portaria', icon: '□' },
  { id: 'maintenance', label: 'Chamados', icon: '◇' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
]

const initialAlerts = [
  {
    id: 1,
    title: 'Manutenção do elevador',
    text: 'Elevador social indisponível amanhã, das 9h às 12h.',
    date: 'Hoje, 10:30',
    read: false,
  },
  {
    id: 2,
    title: 'Assembleia do condomínio',
    text: 'Reunião no salão de festas na quinta-feira, às 19h.',
    date: 'Ontem, 17:45',
    read: false,
  },
  {
    id: 3,
    title: 'Limpeza da caixa d’água',
    text: 'Serviço concluído. O abastecimento já foi normalizado.',
    date: '12 jun, 14:20',
    read: true,
  },
]

const services = [
  { category: 'Elétrica', name: 'André Eletricista', detail: 'Pequenos reparos e instalações', phone: '(11) 99999-1020' },
  { category: 'Reformas', name: 'Casa em Ordem', detail: 'Pintura e manutenção residencial', phone: '(11) 99999-4060' },
  { category: 'Elétrica', name: 'Luz & Cia', detail: 'Atendimento emergencial 24h', phone: '(11) 99999-3388' },
  { category: 'Sons', name: 'Marcos Sonorização', detail: 'Festas e pequenos eventos', phone: '(11) 99999-7781' },
]

const initialCollaborativeAds: CollaborativeAd[] = [
  {
    id: 1,
    title: 'Aulas de reforço em matemática',
    description: 'Dou aulas para estudantes do ensino fundamental, presencialmente no salão de estudos.',
    category: 'Aulas',
    contact: '(11) 98888-1204',
    author: 'Paula · Bloco B, 32',
    date: 'Publicado hoje',
  },
  {
    id: 2,
    title: 'Manutenção de computadores',
    description: 'Formatação, limpeza e configuração de computadores e notebooks.',
    category: 'Tecnologia',
    contact: 'ricardo@email.com',
    author: 'Ricardo · Bloco A, 17',
    date: 'Publicado ontem',
  },
  {
    id: 3,
    title: 'Passeio com cães',
    description: 'Tenho disponibilidade no período da manhã para passear com cães de pequeno e médio porte.',
    category: 'Cuidados',
    contact: '(11) 97777-4032',
    author: 'Bia · Bloco C, 08',
    date: 'Publicado há 3 dias',
  },
]

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function Header({
  title,
  eyebrow,
  onBack,
}: {
  title: string
  eyebrow?: string
  onBack?: () => void
}) {
  return (
    <header className="page-header">
      {onBack && (
        <button className="back-button" onClick={onBack} aria-label="Voltar">
          ←
        </button>
      )}
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      <div className="avatar" aria-label="Perfil do morador">
        MR
      </div>
    </header>
  )
}

function BottomNav({
  active,
  onNavigate,
}: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <b
            aria-hidden="true"
            style={item.icon === 'settings' ? { position: 'fixed' } : undefined}
          >
            {item.icon === 'settings' ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: 'block', transform: 'translateZ(0)' }}
              >
                <path
                  d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M9.64 3.76 10.2 2h3.6l.56 1.76c.48.2.93.46 1.35.78l1.8-.4 1.8 3.12-1.24 1.37c.07.51.07 1.03 0 1.54l1.24 1.37-1.8 3.12-1.8-.4c-.42.32-.87.58-1.35.78L13.8 18h-3.6l-.56-1.76a7.1 7.1 0 0 1-1.35-.78l-1.8.4-1.8-3.12 1.24-1.37a5.7 5.7 0 0 1 0-1.54L4.69 7.26l1.8-3.12 1.8.4c.42-.32.87-.58 1.35-.78Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  transform="translate(0 2)"
                />
              </svg>
            ) : (
              item.icon
            )}
          </b>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function Login({
  onLogin,
  onSupport,
  highContrast,
  largeText,
  onContrast,
  onLargeText,
}: {
  onLogin: () => void
  onSupport: () => void
  highContrast: boolean
  largeText: boolean
  onContrast: () => void
  onLargeText: () => void
}) {
  const [role, setRole] = useState('Morador')
  const [unit, setUnit] = useState('Bloco A · Apto 84')
  const [email, setEmail] = useState('morador@ecosis.com')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!role || !unit.trim() || !email.trim() || !password.trim()) {
      setError('Selecione o cargo e preencha todos os dados para continuar.')
      return
    }
    if (!email.includes('@')) {
      setError('Informe um e-mail válido para continuar.')
      return
    }
    setError('')
    onLogin()
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="brand-mark">ES</div>
        <p className="overline">EcoSis Condomínio</p>
        <h1>Tudo do seu condomínio em um só lugar.</h1>
        <p>Acompanhe avisos, encomendas, serviços e chamados com simplicidade.</p>
        <div className="prototype-note">
          <span>Protótipo navegável</span>
          <p>Use os dados já preenchidos para explorar todos os fluxos.</p>
        </div>
      </section>

      <section className="login-card">
        <p className="step-label">ACESSO DO MORADOR</p>
        <h2>Olá, que bom ter você aqui</h2>
        <p className="muted">Entre com sua identificação.</p>
        <form onSubmit={submit}>
          <label>
            Cargo no condomínio
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="Morador">Morador</option>
              <option value="Síndico">Síndico</option>
              <option value="Funcionário">Funcionário</option>
              <option value="Porteiro">Porteiro</option>
              <option value="Conselheiro">Conselheiro</option>
            </select>
          </label>
          <label>
            Bloco / unidade
            <input
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="Ex.: Bloco A · Apto 84"
              autoComplete="address-line2"
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@email.com"
              autoComplete="email"
            />
          </label>
          <label>
            Senha
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" type="submit">
            Entrar
          </button>
        </form>
        <button className="text-button" onClick={onSupport}>
          Preciso de ajuda para entrar
        </button>
        <div className="accessibility-box">
          <strong>Acessibilidade</strong>
          <button onClick={onContrast}>
            <span>Alto contraste</span>
            <i className={highContrast ? 'switch on' : 'switch'} />
          </button>
          <button onClick={onLargeText}>
            <span>Texto ampliado</span>
            <i className={largeText ? 'switch on' : 'switch'} />
          </button>
        </div>
      </section>
    </main>
  )
}

function Home({
  onNavigate,
  onPanic,
  unread,
}: {
  onNavigate: (screen: Screen) => void
  onPanic: () => void
  unread: number
}) {
  return (
    <div className="screen-content">
      <Header title="Boa tarde, Marina" eyebrow="APARTAMENTO 84" />
      <section className="welcome-card">
        <div>
          <span className="status-chip">Tudo tranquilo por aqui</span>
          <h2>Bem-vinda ao EcoSis</h2>
          <p>Acesse rapidamente o que você precisa hoje.</p>
        </div>
        <button className="panic-button" onClick={onPanic}>
          <b>!</b>
          Botão de pânico
        </button>
      </section>

      <div className="section-title">
        <div>
          <p className="overline">ATUALIZAÇÕES</p>
          <h2>Acontecendo agora</h2>
        </div>
        <button onClick={() => onNavigate('alerts')}>Ver avisos</button>
      </div>
      <button className="feature-card" onClick={() => onNavigate('alerts')}>
        <div className="feature-icon">!</div>
        <div>
          <span className="badge">{unread} novos</span>
          <h3>Avisos recentes</h3>
          <p>Manutenção do elevador e assembleia do condomínio.</p>
        </div>
        <b>→</b>
      </button>

      <div className="quick-grid">
        <button onClick={() => onNavigate('services')}>
          <span>▦</span>
          <h3>Mural de serviços</h3>
          <p>Encontre indicações dos vizinhos.</p>
        </button>
        <button onClick={() => onNavigate('concierge')}>
          <span>□</span>
          <h3>Encomendas</h3>
          <p>Você tem uma retirada pendente.</p>
        </button>
      </div>

      <button className="outline-action" onClick={() => onNavigate('maintenance')}>
        <span>◇</span>
        <div>
          <strong>Registrar um chamado</strong>
          <small>Informe um problema para o síndico</small>
        </div>
        <b>→</b>
      </button>
    </div>
  )
}

function Alerts({
  alerts,
  onReadAll,
  onNew,
}: {
  alerts: typeof initialAlerts
  onReadAll: () => void
  onNew: () => void
}) {
  const [voice, setVoice] = useState(false)
  return (
    <div className="screen-content">
      <Header title="Central de avisos" eyebrow="FIQUE POR DENTRO" />
      <div className="toolbar">
        <button className={voice ? 'tool active' : 'tool'} onClick={() => setVoice(!voice)}>
          <span>))</span> {voice ? 'Leitura ativada' : 'Ouvir avisos'}
        </button>
        <button className="tool" onClick={onReadAll}>
          ✓ Marcar como lidos
        </button>
      </div>
      {voice && <div className="info-banner">Leitura por voz simulada. Selecione um aviso para acompanhar.</div>}
      <div className="alert-list">
        {alerts.map((alert) => (
          <article className={alert.read ? 'alert-item read' : 'alert-item'} key={alert.id}>
            <div className="alert-meta">
              <span>{alert.read ? 'LIDO' : 'NOVO AVISO'}</span>
              <time>{alert.date}</time>
            </div>
            <h2>{alert.title}</h2>
            <p>{alert.text}</p>
            {voice && <button className="inline-action">Ouvir este aviso</button>}
          </article>
        ))}
      </div>
      <button className="floating-action" onClick={onNew}>
        + Novo alerta ao síndico
      </button>
    </div>
  )
}

function Services({
  onToast,
  onOpenCollaborative,
}: {
  onToast: (message: string) => void
  onOpenCollaborative: () => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [publishing, setPublishing] = useState(false)
  const [name, setName] = useState('')
  const filtered = services.filter(
    (service) =>
      (category === 'Todos' || service.category === category) &&
      `${service.name} ${service.detail}`.toLowerCase().includes(query.toLowerCase()),
  )

  function publish(event: FormEvent) {
    event.preventDefault()
    onToast(`Indicação de “${name || 'novo serviço'}” enviada para análise.`)
    setName('')
    setPublishing(false)
  }

  return (
    <div className="screen-content">
      <Header title="Mural dos vizinhos" eyebrow="INDICAÇÕES DA COMUNIDADE" />
      <button className="collaborative-callout" onClick={onOpenCollaborative}>
        <div className="collaborative-callout-icon">+</div>
        <div>
          <span>NOVO ESPAÇO DA COMUNIDADE</span>
          <strong>Mural de Serviços Colaborativos</strong>
          <p>Publique ou encontre serviços oferecidos pelos próprios moradores.</p>
        </div>
        <span className="collaborative-callout-cta">
          Acessar mural <b>→</b>
        </span>
      </button>
      <div className="search-box">
        <span>⌕</span>
        <input
          placeholder="Buscar serviço ou profissional"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="filter-row" aria-label="Filtros de categoria">
        {['Todos', 'Elétrica', 'Reformas', 'Sons'].map((item) => (
          <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
      <div className="results-meta">
        <strong>{filtered.length} indicações</strong>
        <span>Compartilhadas por moradores</span>
      </div>
      <div className="service-list">
        {filtered.map((service) => (
          <article key={service.name}>
            <div className="service-avatar">{service.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <span>{service.category}</span>
              <h2>{service.name}</h2>
              <p>{service.detail}</p>
              <a href={`tel:${service.phone.replace(/\D/g, '')}`}>Ligar: {service.phone}</a>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="empty-state">Nenhum serviço encontrado com esses filtros.</div>}
      </div>
      <button className="floating-action" onClick={() => setPublishing(true)}>
        + Publicar um serviço
      </button>
      {publishing && (
        <Modal title="Indicar um serviço" onClose={() => setPublishing(false)}>
          <form className="modal-form" onSubmit={publish}>
            <label>
              Nome do profissional ou empresa
              <input required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Categoria
              <select>
                <option>Elétrica</option>
                <option>Reformas</option>
                <option>Sons</option>
                <option>Outro</option>
              </select>
            </label>
            <button className="primary-button full" type="submit">
              Enviar indicação
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function CollaborativeServices({
  ads,
  onAdd,
  onBack,
  onToast,
}: {
  ads: CollaborativeAd[]
  onAdd: (ad: CollaborativeAd) => void
  onBack: () => void
  onToast: (message: string) => void
}) {
  const [publishing, setPublishing] = useState(false)
  const [category, setCategory] = useState('Todas')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [adCategory, setAdCategory] = useState('Aulas')
  const [contact, setContact] = useState('')
  const categories = ['Todas', 'Aulas', 'Tecnologia', 'Cuidados', 'Alimentação', 'Outros']
  const filteredAds = category === 'Todas' ? ads : ads.filter((ad) => ad.category === category)

  function publish(event: FormEvent) {
    event.preventDefault()
    onAdd({
      id: Date.now(),
      title,
      description,
      category: adCategory,
      contact,
      author: 'Você · Bloco A, 84',
      date: 'Publicado agora',
    })
    setTitle('')
    setDescription('')
    setContact('')
    setPublishing(false)
    onToast('Seu anúncio foi publicado no mural colaborativo.')
  }

  return (
    <div className="screen-content">
      <Header title="Serviços colaborativos" eyebrow="DE MORADOR PARA MORADOR" onBack={onBack} />
      <section className="collaborative-hero">
        <div className="community-symbol">
          <span />
          <span />
          <span />
        </div>
        <div>
          <h2>Compartilhe o que você sabe fazer</h2>
          <p>Ofereça serviços, encontre talentos e fortaleça a comunidade do condomínio.</p>
        </div>
        <button onClick={() => setPublishing(true)}>+ Publicar anúncio</button>
      </section>

      <div className="section-title collaborative-title">
        <div>
          <p className="overline">ANÚNCIOS RECENTES</p>
          <h2>Serviços dos moradores</h2>
        </div>
        <span>{filteredAds.length} publicados</span>
      </div>

      <div className="filter-row" aria-label="Filtrar anúncios por categoria">
        {categories.map((item) => (
          <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>
            {item}
          </button>
        ))}
      </div>

      <div className="collaborative-list">
        {filteredAds.map((ad) => (
          <article key={ad.id}>
            <div className="ad-heading">
              <span className="ad-category">{ad.category}</span>
              <small>{ad.date}</small>
            </div>
            <h2>{ad.title}</h2>
            <p>{ad.description}</p>
            <div className="ad-author">
              <div>{ad.author.charAt(0)}</div>
              <span>{ad.author}</span>
            </div>
            <button onClick={() => onToast(`Contato de ${ad.author.split(' · ')[0]}: ${ad.contact}`)}>
              Ver contato
            </button>
          </article>
        ))}
        {filteredAds.length === 0 && <div className="empty-state">Ainda não há anúncios nesta categoria.</div>}
      </div>

      <button className="floating-action" onClick={() => setPublishing(true)}>
        + Publicar anúncio
      </button>

      {publishing && (
        <Modal title="Novo anúncio colaborativo" onClose={() => setPublishing(false)}>
          <p className="modal-copy">Conte aos seus vizinhos qual serviço você oferece.</p>
          <form className="modal-form" onSubmit={publish}>
            <label>
              Título
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Aulas de inglês"
              />
            </label>
            <label>
              Descrição
              <textarea
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva o serviço, disponibilidade e outras informações..."
              />
            </label>
            <label>
              Categoria
              <select value={adCategory} onChange={(event) => setAdCategory(event.target.value)}>
                {categories.slice(1).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Contato
              <input
                required
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Telefone, WhatsApp ou e-mail"
              />
            </label>
            <p className="privacy-note">Seu nome, bloco e unidade serão exibidos junto ao anúncio.</p>
            <button className="primary-button full" type="submit">
              Publicar no mural
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Concierge({ onToast }: { onToast: (message: string) => void }) {
  const [packageReady, setPackageReady] = useState(true)
  const [visitorModal, setVisitorModal] = useState(false)
  return (
    <div className="screen-content">
      <Header title="Portaria e encomendas" eyebrow="ACESSO E RETIRADAS" />
      <section className="summary-row">
        <div>
          <b>{packageReady ? '1' : '0'}</b>
          <span>retiradas pendentes</span>
        </div>
        <div>
          <b>2</b>
          <span>visitas este mês</span>
        </div>
      </section>
      <div className="section-title">
        <div>
          <p className="overline">ENCOMENDAS</p>
          <h2>Aguardando você</h2>
        </div>
      </div>
      {packageReady ? (
        <article className="package-card">
          <div className="package-icon">□</div>
          <div>
            <span>RECEBIDA HOJE, 11:40</span>
            <h3>Encomenda na portaria</h3>
            <p>Pacote médio · Remetente: Loja Online</p>
          </div>
          <button
            onClick={() => {
              setPackageReady(false)
              onToast('Retirada confirmada. A portaria foi avisada.')
            }}
          >
            Confirmar retirada
          </button>
        </article>
      ) : (
        <div className="empty-state">Nenhuma encomenda aguardando retirada.</div>
      )}
      <div className="section-title">
        <div>
          <p className="overline">VISITANTES</p>
          <h2>Autorizar entrada</h2>
        </div>
      </div>
      <article className="visitor-card">
        <div className="visitor-visual">ID</div>
        <div>
          <h3>Avise a portaria antes da chegada</h3>
          <p>Gere uma autorização e compartilhe com seu visitante.</p>
        </div>
        <button className="primary-button" onClick={() => setVisitorModal(true)}>
          Abrir interfone digital
        </button>
      </article>
      {visitorModal && (
        <Modal title="Autorizar visitante" onClose={() => setVisitorModal(false)}>
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault()
              setVisitorModal(false)
              onToast('Visitante autorizado. A portaria recebeu os dados.')
            }}
          >
            <label>
              Nome do visitante
              <input required placeholder="Nome completo" />
            </label>
            <label>
              Data da visita
              <input required type="date" />
            </label>
            <button className="primary-button full" type="submit">
              Autorizar entrada
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Maintenance({ onToast }: { onToast: (message: string) => void }) {
  const [description, setDescription] = useState('')
  const [mediaAdded, setMediaAdded] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  function submit(event: FormEvent) {
    event.preventDefault()
    onToast('Chamado #1048 enviado ao síndico com sucesso.')
    setDescription('')
    setMediaAdded(false)
  }
  return (
    <div className="screen-content">
      <Header title="Chamados de manutenção" eyebrow="FALE COM O SÍNDICO" />
      <section className="maintenance-intro">
        <span>◇</span>
        <div>
          <h2>Encontrou algum problema?</h2>
          <p>Descreva a situação e acompanhe a resolução pelo histórico.</p>
        </div>
      </section>
      <form className="maintenance-form" onSubmit={submit}>
        <label>
          Onde está o problema?
          <select>
            <option>Área comum</option>
            <option>Meu apartamento</option>
            <option>Garagem</option>
            <option>Outro local</option>
          </select>
        </label>
        <label>
          Descrição
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Conte o que aconteceu, onde e quando..."
          />
          <small>{description.length}/300 caracteres</small>
        </label>
        <button type="button" className={mediaAdded ? 'media-button added' : 'media-button'} onClick={() => setMediaAdded(!mediaAdded)}>
          <span>+</span>
          {mediaAdded ? 'Foto anexada — remover' : 'Adicionar foto ou gravação de voz'}
        </button>
        <button className="primary-button full" type="submit">
          Enviar para o síndico
        </button>
      </form>
      <button className="history-button" onClick={() => setHistoryOpen(true)}>
        <div>
          <strong>Visualizar histórico</strong>
          <span>Acompanhe seus chamados anteriores</span>
        </div>
        <b>→</b>
      </button>
      {historyOpen && (
        <Modal title="Histórico de chamados" onClose={() => setHistoryOpen(false)}>
          <div className="history-list">
            <article>
              <span className="status-chip">Em andamento</span>
              <h3>#1032 · Lâmpada da garagem</h3>
              <p>Enviado em 10 de junho</p>
            </article>
            <article>
              <span className="status-chip neutral">Resolvido</span>
              <h3>#0991 · Vazamento no corredor</h3>
              <p>Finalizado em 2 de junho</p>
            </article>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Settings({
  highContrast,
  largeText,
  onContrast,
  onLargeText,
  onToast,
  onLogout,
}: {
  highContrast: boolean
  largeText: boolean
  onContrast: () => void
  onLargeText: () => void
  onToast: (message: string) => void
  onLogout: () => void
}) {
  const [notifications, setNotifications] = useState(true)
  const [emailNotices, setEmailNotices] = useState(false)

  return (
    <div className="screen-content">
      <Header title="Configurações" eyebrow="PREFERÊNCIAS DA CONTA" />
      <section className="settings-profile">
        <div className="avatar">MR</div>
        <div>
          <h2>Marina Ribeiro</h2>
          <p>Bloco A · Apartamento 84</p>
          <span>morador@ecosis.com</span>
        </div>
      </section>

      <div className="settings-group">
        <p className="overline">ACESSIBILIDADE</p>
        <button className="setting-row" onClick={onContrast}>
          <div>
            <strong>Alto contraste</strong>
            <span>Aumenta a diferença entre cores e textos</span>
          </div>
          <i className={highContrast ? 'switch on' : 'switch'} />
        </button>
        <button className="setting-row" onClick={onLargeText}>
          <div>
            <strong>Texto ampliado</strong>
            <span>Aumenta o tamanho dos textos da interface</span>
          </div>
          <i className={largeText ? 'switch on' : 'switch'} />
        </button>
      </div>

      <div className="settings-group">
        <p className="overline">NOTIFICAÇÕES</p>
        <button className="setting-row" onClick={() => setNotifications(!notifications)}>
          <div>
            <strong>Avisos no dispositivo</strong>
            <span>Receba alertas importantes do condomínio</span>
          </div>
          <i className={notifications ? 'switch on' : 'switch'} />
        </button>
        <button className="setting-row" onClick={() => setEmailNotices(!emailNotices)}>
          <div>
            <strong>Resumo por e-mail</strong>
            <span>Receba um resumo semanal das novidades</span>
          </div>
          <i className={emailNotices ? 'switch on' : 'switch'} />
        </button>
      </div>

      <div className="settings-group">
        <p className="overline">CONTA E SUPORTE</p>
        <button className="setting-link" onClick={() => onToast('Seus dados cadastrais estão atualizados.')}>
          <span>Meus dados cadastrais</span>
          <b>→</b>
        </button>
        <button className="setting-link" onClick={() => onToast('Canal de suporte aberto para atendimento.')}>
          <span>Ajuda e suporte</span>
          <b>→</b>
        </button>
      </div>

      <button className="logout-button" onClick={onLogout}>
        Sair da conta
      </button>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [screen, setScreen] = useState<Screen>('home')
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [collaborativeAds, setCollaborativeAds] = useState(initialCollaborativeAds)
  const [modal, setModal] = useState<'support' | 'panic' | 'newAlert' | null>(null)
  const [toast, setToast] = useState('')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function renderScreen() {
    if (screen === 'alerts') {
      return (
        <Alerts
          alerts={alerts}
          onReadAll={() => {
            setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
            showToast('Todos os avisos foram marcados como lidos.')
          }}
          onNew={() => setModal('newAlert')}
        />
      )
    }
    if (screen === 'services') {
      return (
        <Services
          onToast={showToast}
          onOpenCollaborative={() => setScreen('collaborative')}
        />
      )
    }
    if (screen === 'collaborative') {
      return (
        <CollaborativeServices
          ads={collaborativeAds}
          onAdd={(ad) => setCollaborativeAds([ad, ...collaborativeAds])}
          onBack={() => setScreen('services')}
          onToast={showToast}
        />
      )
    }
    if (screen === 'concierge') return <Concierge onToast={showToast} />
    if (screen === 'maintenance') return <Maintenance onToast={showToast} />
    if (screen === 'settings') {
      return (
        <Settings
          highContrast={highContrast}
          largeText={largeText}
          onContrast={() => setHighContrast(!highContrast)}
          onLargeText={() => setLargeText(!largeText)}
          onToast={showToast}
          onLogout={() => {
            setAuthenticated(false)
            setScreen('home')
          }}
        />
      )
    }
    return (
      <Home
        onNavigate={setScreen}
        onPanic={() => setModal('panic')}
        unread={alerts.filter((alert) => !alert.read).length}
      />
    )
  }

  return (
    <div className={`${highContrast ? 'high-contrast ' : ''}${largeText ? 'large-text' : ''}`}>
      {!authenticated ? (
        <Login
          onLogin={() => setAuthenticated(true)}
          onSupport={() => setModal('support')}
          highContrast={highContrast}
          largeText={largeText}
          onContrast={() => setHighContrast(!highContrast)}
          onLargeText={() => setLargeText(!largeText)}
        />
      ) : (
        <main className="app-shell">
          {renderScreen()}
          <BottomNav active={screen} onNavigate={setScreen} />
        </main>
      )}

      {modal === 'support' && (
        <Modal title="Suporte e recuperação" onClose={() => setModal(null)}>
          <p className="modal-copy">Escolha como prefere recuperar seu acesso.</p>
          <button className="option-button" onClick={() => showToast('Link de recuperação enviado por SMS.')}>
            <div>
              <strong>Receber por SMS</strong>
              <span>Enviaremos um link para o telefone cadastrado</span>
            </div>
            <b>→</b>
          </button>
          <button className="option-button" onClick={() => showToast('A portaria foi notificada para ajudar.')}>
            <div>
              <strong>Falar com a portaria</strong>
              <span>Solicite ajuda para confirmar sua identidade</span>
            </div>
            <b>→</b>
          </button>
        </Modal>
      )}

      {modal === 'panic' && (
        <Modal title="Acionar alerta de emergência?" onClose={() => setModal(null)}>
          <div className="panic-confirm">
            <b>!</b>
            <p>Este alerta avisará imediatamente a portaria e identificará seu apartamento.</p>
          </div>
          <div className="modal-actions">
            <button className="secondary-button" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button
              className="danger-button"
              onClick={() => {
                setModal(null)
                showToast('Alerta enviado. A portaria está entrando em contato.')
              }}
            >
              Sim, enviar alerta
            </button>
          </div>
        </Modal>
      )}

      {modal === 'newAlert' && (
        <Modal title="Novo alerta ao síndico" onClose={() => setModal(null)}>
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault()
              setModal(null)
              showToast('Alerta enviado ao síndico.')
            }}
          >
            <label>
              Assunto
              <select>
                <option>Barulho</option>
                <option>Segurança</option>
                <option>Área comum</option>
                <option>Outro</option>
              </select>
            </label>
            <label>
              O que aconteceu?
              <textarea required placeholder="Descreva a situação..." />
            </label>
            <button className="primary-button full" type="submit">
              Enviar alerta
            </button>
          </form>
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          <b>✓</b>
          {toast}
        </div>
      )}
    </div>
  )
}
