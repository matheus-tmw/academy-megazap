import { Track, Lesson } from '../types';

export const TRACKS_DATA: Track[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    slug: 'primeiros-passos',
    category: 'Primeiros Passos',
    shortDescription: 'Conheça a plataforma e configure os principais recursos iniciais do White Label.',
    description: 'Guia definitivo para parceiros e novos administradores configurarem sua instância MegaZap, conectarem canais de WhatsApp e prepararem a operação inicial.',
    iconName: 'Compass',
    level: 'Iniciante',
    badgeColor: 'blue',
    estimatedHours: '2h 15min',
    certificateAvailable: true,
    certificateName: 'Certificação em Onboarding e Implantação MegaZap',
    modules: [
      {
        id: 'mod-pp-01',
        trackId: 'primeiros-passos',
        orderNumber: 1,
        title: 'Visão Geral e Primeiras Configurações',
        description: 'Apresentação do ecossistema MegaZap e primeiros passos de configuração.',
        lessons: [
          {
            id: 'aula-pp-01',
            trackId: 'primeiros-passos',
            moduleId: 'mod-pp-01',
            moduleTitle: 'Visão Geral e Primeiras Configurações',
            title: 'Boas-vindas à MegaZap Academy e Visão Geral da Plataforma',
            slug: 'boas-vindas-e-visao-geral',
            description: 'Entenda a arquitetura do MegaZap e como aproveitar ao máximo os treinamentos oficiais.',
            duration: '06:15',
            durationSeconds: 375,
            videoUrl: '', // Cole aqui o link do seu vídeo (ex: 'https://seuservidor.com.br/videos/aula01.mp4' ou link do YouTube/Vimeo)
            level: 'Iniciante',
            category: 'Primeiros Passos',
            thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'general',
            learningObjectives: [
              'Conhecer o propósito da MegaZap Academy para parceiros White Label.',
              'Navegar entre módulos, submenus e funcionalidades do sistema.',
              'Compreender o fluxo de trabalho integrado entre canais e atendentes.'
            ],
            megaZapTip: 'Mantenha seus atendentes e supervisores alinhados com as trilhas de treinamento para reduzir dúvidas de suporte no dia a dia.',
            aboutText: 'Nesta aula introdutória, você terá um panorama completo sobre como o ecossistema MegaZap organiza atendimento, automações e inteligência artificial para potencializar operações de WhatsApp.',
            resources: [
              { id: 'res-pp-01', title: 'Guia de Boas Práticas MegaZap (PDF)', type: 'pdf', size: '2.4 MB' },
              { id: 'res-pp-02', title: 'Checklist de Implantação Rápida (PDF)', type: 'pdf', size: '1.1 MB' }
            ]
          },
          {
            id: 'aula-pp-02',
            trackId: 'primeiros-passos',
            moduleId: 'mod-pp-01',
            moduleTitle: 'Visão Geral e Primeiras Configurações',
            title: 'Conexão de Conexões WhatsApp via QR Code',
            slug: 'conexao-whatsapp-qr-code',
            description: 'Passo a passo para parear números de WhatsApp com estabilidade e segurança.',
            duration: '07:45',
            durationSeconds: 465,
            level: 'Iniciante',
            category: 'Primeiros Passos',
            thumbnail: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Gerar e ler o QR Code de autenticação no painel.',
              'Monitorar o status da conexão em tempo real.',
              'Configurar alertas de desconexão preventiva.'
            ],
            megaZapTip: 'Sempre utilize um aparelho celular dedicado com conexão Wi-Fi estável e bateria carregada para evitar quedas no pareamento.',
            aboutText: 'Aprenda o processo correto para sincronizar os números da sua empresa ou de seus clientes White Label com o servidor MegaZap.',
            resources: [
              { id: 'res-pp-03', title: 'Dicas para evitar desconexões no WhatsApp (PDF)', type: 'pdf', size: '950 KB' }
            ]
          },
          {
            id: 'aula-pp-03',
            trackId: 'primeiros-passos',
            moduleId: 'mod-pp-01',
            moduleTitle: 'Visão Geral e Primeiras Configurações',
            title: 'Cadastro de Departamentos e Horários de Acesso',
            slug: 'departamentos-e-horarios',
            description: 'Como estruturar setores (Comercial, Suporte, Financeiro) e definir turnos.',
            duration: '09:20',
            durationSeconds: 560,
            level: 'Iniciante',
            category: 'Primeiros Passos',
            thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Criar departamentos com cores e permissões personalizadas.',
              'Definir regras de atendimento fora do horário comercial.',
              'Vincular atendentes a setores específicos.'
            ],
            megaZapTip: 'Organize os departamentos antes de convidar a equipe. Isso agiliza a triagem automática de novos clientes.',
            aboutText: 'Veja como configurar os setores operacionais e garantir que os atendimentos caiam na fila correta dentro do horário de expediente.',
            resources: [
              { id: 'res-pp-04', title: 'Planilha Modelo de Estrutura Organizacional', type: 'doc', size: '420 KB' }
            ]
          }
        ]
      },
      {
        id: 'mod-pp-02',
        trackId: 'primeiros-passos',
        orderNumber: 2,
        title: 'Gestão de Usuários e Aplicativos',
        description: 'Configuração de perfis, permissões e instalação de aplicativos desktop e mobile.',
        lessons: [
          {
            id: 'aula-pp-04',
            trackId: 'primeiros-passos',
            moduleId: 'mod-pp-02',
            moduleTitle: 'Gestão de Usuários e Aplicativos',
            title: 'Cadastro de Usuários e Níveis de Permissão',
            slug: 'cadastro-usuarios-permissoes',
            description: 'Entenda os papéis de Administrador, Supervisor e Atendente.',
            duration: '08:10',
            durationSeconds: 490,
            level: 'Iniciante',
            category: 'Primeiros Passos',
            thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Convidar membros de equipe por e-mail.',
              'Restringir visualização de conversas e contatos por perfil.',
              'Gerenciar senhas e autenticação segura.'
            ],
            megaZapTip: 'Supervisores podem acompanhar chats em tempo real e assumir conversas sensíveis sem interromper o atendente.',
            aboutText: 'Aprenda a cadastrar operadores e garantir que cada colaborador acesse apenas as ferramentas necessárias à sua função.',
            resources: [
              { id: 'res-pp-05', title: 'Matriz de Permissões MegaZap (PDF)', type: 'pdf', size: '1.2 MB' }
            ]
          },
          {
            id: 'aula-pp-05',
            trackId: 'primeiros-passos',
            moduleId: 'mod-pp-02',
            moduleTitle: 'Gestão de Usuários e Aplicativos',
            title: 'Baixar e Configurar Aplicativos Desktop e Notificações',
            slug: 'baixar-aplicativos-notificacoes',
            description: 'Instalação do app no Windows/Mac e configuração de alertas sonoros.',
            duration: '05:40',
            durationSeconds: 340,
            level: 'Iniciante',
            category: 'Primeiros Passos',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'general',
            learningObjectives: [
              'Baixar a versão oficial do MegaZap Desktop.',
              'Ativar notificações no sistema operacional para não perder leads.',
              'Configurar microfone e saída de áudio para mensagens de voz.'
            ],
            megaZapTip: 'O aplicativo Desktop oferece performance otimizada e notificações nativas mais ágeis que o navegador.',
            aboutText: 'Instale o aplicativo oficial MegaZap no seu computador para garantir uma experiência de digitação e alerta mais rápida.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'atendimento',
    title: 'Atendimento',
    slug: 'atendimento',
    category: 'Atendimento',
    shortDescription: 'Aprenda a utilizar todos os recursos do módulo de atendimento multi-agente.',
    description: 'Aprenda a utilizar os principais recursos do módulo de atendimento do MegaZap e domine o fluxo completo de gestão das conversas, transferências, mensagens rápidas e relatórios.',
    iconName: 'MessageSquare',
    level: 'Intermediário',
    badgeColor: 'blue',
    estimatedHours: '5h 40min',
    certificateAvailable: true,
    certificateName: 'Formação Especialista em Atendimento MegaZap',
    modules: [
      {
        id: 'mod-at-01',
        trackId: 'atendimento',
        orderNumber: 1,
        title: 'Primeiros passos no atendimento',
        description: 'Fundamentos da tela de chat, status de tickets e fluxos de atendimento.',
        lessons: [
          {
            id: 'aula-at-01',
            trackId: 'atendimento',
            moduleId: 'mod-at-01',
            moduleTitle: 'Primeiros passos no atendimento',
            title: 'Introdução ao Atendimento Multi-agente',
            slug: 'introducao-ao-atendimento',
            description: 'Entenda como múltiplos atendentes respondem pelo mesmo número de WhatsApp.',
            duration: '05:32',
            durationSeconds: 332,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Entender a fila de espera e distribuição de chamados.',
              'Diferenciar conversas abertas, pendentes e finalizadas.',
              'Acompanhar o tempo de primeira resposta da equipe.'
            ],
            megaZapTip: 'Distribua os atendimentos de forma automática por departamento para reduzir o tempo de espera do cliente.',
            aboutText: 'Veja como funciona a central unificada de atendimento onde toda a sua equipe atende de forma simultânea e organizada.',
            resources: [
              { id: 'res-at-01', title: 'Manual do Atendente MegaZap (PDF)', type: 'pdf', size: '3.1 MB' }
            ]
          },
          {
            id: 'aula-at-02',
            trackId: 'atendimento',
            moduleId: 'mod-at-01',
            moduleTitle: 'Primeiros passos no atendimento',
            title: 'Conhecendo a Interface de Conversas e Painéis',
            slug: 'conhecendo-a-interface',
            description: 'Tour detalhado por abas de conversas, filtros rápidos e detalhes do contato.',
            duration: '08:12',
            durationSeconds: 492,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Identificar a lista de chats ativos, pendentes e fechados.',
              'Utilizar a barra lateral direita para ver dados e tags do cliente.',
              'Buscar histórico de conversas anteriores.'
            ],
            megaZapTip: 'Use os atalhos de teclado para alternar entre conversas sem tirar as mãos do teclado.',
            aboutText: 'Domine cada canto da tela de atendimento para ganhar velocidade e oferecer um suporte ágil aos seus clientes.',
            resources: [
              { id: 'res-at-02', title: 'Tabela de Atalhos de Teclado (PDF)', type: 'pdf', size: '600 KB' }
            ]
          },
          {
            id: 'aula-at-03',
            trackId: 'atendimento',
            moduleId: 'mod-at-01',
            moduleTitle: 'Primeiros passos no atendimento',
            title: 'Status dos Atendimentos: Aguardando, Em Atendimento e Finalizados',
            slug: 'status-dos-atendimentos',
            description: 'Ciclo de vida do ticket de conversa e regras de finalização.',
            duration: '06:45',
            durationSeconds: 405,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Puxar atendimentos da fila geral para seu operador.',
              'Finalizar conversas com preenchimento obrigatório de motivo.',
              'Reabrir tickets quando o cliente retornar.'
            ],
            megaZapTip: 'Exija que os atendentes selecionem a tag de motivo de finalização para gerar relatórios comerciais precisos.',
            aboutText: 'Entenda os estados pelos quais um contato passa desde a primeira mensagem enviada até o encerramento formal do atendimento.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-at-02',
        trackId: 'atendimento',
        orderNumber: 2,
        title: 'Gestão de conversas',
        description: 'Ferramentas de produtividade: chat dinâmico, mensagens rápidas, transferências e recados.',
        lessons: [
          {
            id: 'aula-at-04',
            trackId: 'atendimento',
            moduleId: 'mod-at-02',
            moduleTitle: 'Gestão de conversas',
            title: 'Como utilizar o Chat e Envio de Mídias',
            slug: 'chat-e-envio-de-midias',
            description: 'Envio de áudios gravados, imagens, documentos, vídeos e localização.',
            duration: '07:15',
            durationSeconds: 435,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Gravar e enviar áudios que parecem gravados na hora pelo WhatsApp.',
              'Enviar anexos em PDF, fotos e tabelas com compressão ideal.',
              'Citar mensagens específicas para responder dúvidas pontuais.'
            ],
            megaZapTip: 'Áudios enviados pelo MegaZap são reproduzidos como se tivessem sido gravados manualmente pelo operador.',
            aboutText: 'Aprenda a interagir no chat enviando todos os tipos de mídia suportados pelo WhatsApp com facilidade.',
            resources: []
          },
          {
            id: 'aula-at-05',
            trackId: 'atendimento',
            moduleId: 'mod-at-02',
            moduleTitle: 'Gestão de conversas',
            title: 'Como utilizar as Mensagens Rápidas',
            slug: 'mensagens-rapidas',
            description: 'Aprenda a configurar e utilizar mensagens rápidas durante os atendimentos.',
            duration: '08:42',
            durationSeconds: 522,
            videoUrl: 'https://v2-8.mz-css.net/89b533fa20b93e0f8651594041dfa889/Mensagens_Rapidas.mp4',
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Como localizar as mensagens rápidas no painel e no chat.',
              'Como criar uma nova mensagem rápida com variáveis personalizadas ({nome}, {protocolo}).',
              'Como utilizar mensagens rápidas durante o atendimento digitando barra (/atalho).',
              'Como organizar pastas de mensagens por departamento de maneira eficiente.'
            ],
            megaZapTip: 'Utilize mensagens rápidas para reduzir o tempo de resposta e manter um padrão de comunicação impecável entre os atendentes da equipe.',
            aboutText: 'As Mensagens Rápidas são um dos recursos mais poderosos para aumentar a produtividade do time de suporte e vendas. Aprenda a cadastrar respostas prontas com textos, áudios e imagens associadas a atalhos simples.',
            resources: [
              { id: 'res-at-03', title: '50 Exemplos Prontos de Mensagens Rápidas (PDF)', type: 'pdf', size: '1.8 MB' },
              { id: 'res-at-04', title: 'Arquivo de Importação de Mensagens (JSON)', type: 'json', size: '45 KB' }
            ],
            featured: true
          },
          {
            id: 'aula-at-06',
            trackId: 'atendimento',
            moduleId: 'mod-at-02',
            moduleTitle: 'Gestão de conversas',
            title: 'Transferência de Atendimento entre Departamentos e Operadores',
            slug: 'transferencia-de-atendimento',
            description: 'Transfira conversas mantendo todo o histórico para o novo atendente.',
            duration: '06:50',
            durationSeconds: 410,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Transferir conversas para um departamento específico ou atendente direto.',
              'Inserir notas internas antes de confirmar a transferência.',
              'Garantir que o cliente seja notificado da mudança de responsável.'
            ],
            megaZapTip: 'Adicione uma nota interna explicando o caso ao transferir. Isso evita que o cliente tenha que repetir a mesma história.',
            aboutText: 'Aprenda a transferir chamados entre setores sem quebrar a continuidade do atendimento ao cliente.',
            resources: []
          },
          {
            id: 'aula-at-07',
            trackId: 'atendimento',
            moduleId: 'mod-at-02',
            moduleTitle: 'Gestão de conversas',
            title: 'Como utilizar os Recados e Notas Internas',
            slug: 'recados-e-notas-internas',
            description: 'Deixe avisos internos visíveis apenas para a equipe dentro do chat.',
            duration: '08:21',
            durationSeconds: 501,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Adicionar recados que não aparecem no WhatsApp do cliente.',
              'Marcar colegas de equipe em notas importantes.',
              'Consultar recados passados na linha do tempo do atendimento.'
            ],
            megaZapTip: 'Notas internas são destacadas com fundo amarelo/cinza diferenciado para evitar confusão com mensagens enviadas ao cliente.',
            aboutText: 'Entenda como utilizar recados internos para comunicação rápida entre supervisores e operadores.',
            resources: []
          },
          {
            id: 'aula-at-08',
            trackId: 'atendimento',
            moduleId: 'mod-at-02',
            moduleTitle: 'Gestão de conversas',
            title: 'Mensagens Programadas e Agendamentos',
            slug: 'mensagens-programadas',
            description: 'Agende mensagens de follow-up e lembretes para datas e horários futuros.',
            duration: '07:30',
            durationSeconds: 450,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Programar disparos automáticos para clientes com data e hora marcadas.',
              'Editar ou cancelar agendamentos pendentes.',
              'Usar agendamento para pós-venda e lembretes de vencimento.'
            ],
            megaZapTip: 'Programe lembretes de confirmação de reuniões 2 horas antes do compromisso para reduzir faltas.',
            aboutText: 'Veja como programar envios futuros diretamente da janela de conversa do contato.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-at-03',
        trackId: 'atendimento',
        orderNumber: 3,
        title: 'Gestão de contatos',
        description: 'Carteira de clientes, agenda inteligente e contatos bloqueados.',
        lessons: [
          {
            id: 'aula-at-09',
            trackId: 'atendimento',
            moduleId: 'mod-at-03',
            moduleTitle: 'Gestão de contatos',
            title: 'Carteira de Contatos e Atribuição de Carteiras',
            slug: 'carteira-de-contatos',
            description: 'Vincule clientes a atendentes específicos de forma exclusiva.',
            duration: '06:10',
            durationSeconds: 370,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'contacts',
            learningObjectives: [
              'Criar regras de carteira para redirecionamento automático.',
              'Garantir sigilo de contatos entre vendedores da equipe.',
              'Transferir carteiras completas de clientes.'
            ],
            megaZapTip: 'Ao vincular um contato à carteira de um atendente, mensagens recebidas vão direto para a fila dele.',
            aboutText: 'Configure carteiras de clientes para dar exclusividade no relacionamento entre operador e cliente.',
            resources: []
          },
          {
            id: 'aula-at-10',
            trackId: 'atendimento',
            moduleId: 'mod-at-03',
            moduleTitle: 'Gestão de contatos',
            title: 'Agenda de Contatos, Tags e Campos Customizados',
            slug: 'agenda-de-contatos-e-tags',
            description: 'Organize dados adicionais como CPF, plano, aniversário e status do lead.',
            duration: '08:45',
            durationSeconds: 525,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'contacts',
            learningObjectives: [
              'Criar e aplicar tags coloridas aos clientes.',
              'Cadastrar campos personalizados para formulários de cadastro.',
              'Filtrar a agenda por múltiplos critérios combinados.'
            ],
            megaZapTip: 'Use tags padronizadas (ex: #LeadQuente, #ClienteVIP, #EmNegociacao) para facilitar campanhas segmentadas.',
            aboutText: 'Aprenda a estruturar o CRM integrado do MegaZap mantendo todas as informações do cliente centralizadas.',
            resources: [
              { id: 'res-at-05', title: 'Tabela Modelo de Tags Estratégicas (PDF)', type: 'pdf', size: '820 KB' }
            ]
          },
          {
            id: 'aula-at-11',
            trackId: 'atendimento',
            moduleId: 'mod-at-03',
            moduleTitle: 'Gestão de contatos',
            title: 'Contatos Bloqueados e Gestão de Spam',
            slug: 'contatos-bloqueados',
            description: 'Como proteger sua operação contra mensagens indevidas ou spammers.',
            duration: '04:50',
            durationSeconds: 290,
            level: 'Iniciante',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'contacts',
            learningObjectives: [
              'Bloquear números abusivos ou ligações indesejadas.',
              'Gerenciar a lista negra no painel de controle.',
              'Desbloquear contatos quando necessário.'
            ],
            megaZapTip: 'O bloqueio impede que o contato abra novas filas no sistema sem afetar o número no WhatsApp.',
            aboutText: 'Entenda como funciona a lista de contatos bloqueados e como manter a higiene da sua base.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-at-04',
        trackId: 'atendimento',
        orderNumber: 4,
        title: 'Recursos avançados',
        description: 'Bots de menu, enquetes interativas, integrações e auditoria de registros.',
        lessons: [
          {
            id: 'aula-at-12',
            trackId: 'atendimento',
            moduleId: 'mod-at-04',
            moduleTitle: 'Recursos avançados',
            title: 'Configuração de Bots Básicos de Triagem',
            slug: 'bots-de-triagem',
            description: 'Crie menus numéricos e botões para direcionar o cliente ao departamento correto.',
            duration: '09:40',
            durationSeconds: 580,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'flow',
            learningObjectives: [
              'Montar menu de opções numeradas (1- Vendas, 2- Suporte).',
              'Configurar tempo de timeout para respostas automáticas.',
              'Redirecionar para atendente caso o cliente digite opção inválida.'
            ],
            megaZapTip: 'Mantenha os menus curtos com no máximo 4 opções principais para não confundir o cliente.',
            aboutText: 'Aprenda a configurar bots de autoatendimento simples para triagem e qualificação inicial.',
            resources: [
              { id: 'res-at-06', title: 'Fluxograma de Triagem Modelo (PDF)', type: 'pdf', size: '1.4 MB' }
            ]
          },
          {
            id: 'aula-at-13',
            trackId: 'atendimento',
            moduleId: 'mod-at-04',
            moduleTitle: 'Recursos avançados',
            title: 'Enquetes e Pesquisa de Satisfação (NPS)',
            slug: 'enquetes-e-nps',
            description: 'Envie pesquisas de satisfação ao encerrar cada atendimento.',
            duration: '06:15',
            durationSeconds: 375,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'chat',
            learningObjectives: [
              'Ativar disparo automático da pesquisa de NPS pós-atendimento.',
              'Personalizar escalas (1 a 5 ou 1 a 10) e perguntas abertas.',
              'Monitorar notas individuais dos operadores.'
            ],
            megaZapTip: 'Monitore o ranking de NPS para bonificar os melhores atendentes do mês.',
            aboutText: 'Descubra como coletar feedbacks em tempo real para medir a satisfação dos clientes.',
            resources: []
          },
          {
            id: 'aula-at-14',
            trackId: 'atendimento',
            moduleId: 'mod-at-04',
            moduleTitle: 'Recursos avançados',
            title: 'Registros e Auditoria de Ações',
            slug: 'registros-e-auditoria',
            description: 'Rastreie quem visualizou, transferiu ou excluiu informações no sistema.',
            duration: '05:55',
            durationSeconds: 355,
            level: 'Avançado',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Acessar logs de auditoria por data e operador.',
              'Identificar alterações de configurações e exclusões de mensagens.',
              'Exportar relatórios de conformidade para segurança de dados.'
            ],
            megaZapTip: 'O log de auditoria é imutável e garante conformidade com a LGPD e segurança jurídica.',
            aboutText: 'Veja como auditar cada ação executada dentro do painel para manter total controle operacional.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-at-05',
        trackId: 'atendimento',
        orderNumber: 5,
        title: 'Indicadores e relatórios',
        description: 'Dashboards gerenciais, métricas de produtividade e relatórios de clientes.',
        lessons: [
          {
            id: 'aula-at-15',
            trackId: 'atendimento',
            moduleId: 'mod-at-05',
            moduleTitle: 'Indicadores e relatórios',
            title: 'Dashboard Geral de Atendimento em Tempo Real',
            slug: 'dashboard-de-atendimento',
            description: 'Monitore chamados em aberto, tempo médio de espera e capacidade do time.',
            duration: '07:20',
            durationSeconds: 440,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'general',
            learningObjectives: [
              'Interpretar os gráficos de volume por hora do dia.',
              'Identificar picos de atendimento e gargalos na equipe.',
              'Definir metas de TMA (Tempo Médio de Atendimento) e TME.'
            ],
            megaZapTip: 'Projete o dashboard em uma TV na sala de operações para manter a equipe focada no tempo de resposta.',
            aboutText: 'Aprenda a analisar as métricas operacionais para tomar decisões estratégicas com base em dados.',
            resources: [
              { id: 'res-at-07', title: 'Guia de Métricas de Atendimento (PDF)', type: 'pdf', size: '1.6 MB' }
            ]
          },
          {
            id: 'aula-at-16',
            trackId: 'atendimento',
            moduleId: 'mod-at-05',
            moduleTitle: 'Indicadores e relatórios',
            title: 'Relatórios de Atendimentos e Exportação para Excel',
            slug: 'relatorios-e-exportacao',
            description: 'Como gerar relatórios customizados por período, departamento e atendente.',
            duration: '08:15',
            durationSeconds: 495,
            level: 'Intermediário',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'general',
            learningObjectives: [
              'Filtrar relatórios por tags de motivo de encerramento.',
              'Exportar planilhas XLS/CSV para cruzamento com BI externo.',
              'Agendar relatórios semanais automáticos por e-mail.'
            ],
            megaZapTip: 'Exporte relatórios consolidados mensais para apresentar resultados de produtividade à diretoria.',
            aboutText: 'Saiba como extrair relatórios completos com todas as conversas e métricas de desempenho.',
            resources: []
          },
          {
            id: 'aula-at-17',
            trackId: 'atendimento',
            moduleId: 'mod-at-05',
            moduleTitle: 'Indicadores e relatórios',
            title: 'Atendimentos com Retorno e Gestão de Clientes Potenciais',
            slug: 'atendimentos-com-retorno',
            description: 'Identifique clientes que voltaram a entrar em contato e leads quentes.',
            duration: '06:30',
            durationSeconds: 390,
            level: 'Avançado',
            category: 'Atendimento',
            thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'general',
            learningObjectives: [
              'Filtrar conversas com retorno dentro de 24h para prioridade.',
              'Identificar clientes potenciais para ação da equipe de vendas.',
              'Integrar os leads qualificados ao funil comercial.'
            ],
            megaZapTip: 'Clientes com retorno frequente em curto período podem sinalizar uma dúvida não resolvida na primeira tentativa.',
            aboutText: 'Descubra como transformar o histórico de atendimento em uma máquina de retenção e novas vendas.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'automacao',
    title: 'Automação',
    slug: 'automacao',
    category: 'Automação',
    shortDescription: 'Domine fluxos, automações e processos inteligentes sem código.',
    description: 'Aprenda a construir fluxos visuais avançados, disparos agendados, integrações via webhook e regras condicionais para automatizar 80% dos atendimentos repetitivos.',
    iconName: 'GitBranch',
    level: 'Avançado',
    badgeColor: 'amber',
    estimatedHours: '4h 10min',
    certificateAvailable: true,
    certificateName: 'Certificação Especialista em Automações MegaZap',
    modules: [
      {
        id: 'mod-aut-01',
        trackId: 'automacao',
        orderNumber: 1,
        title: 'Construtor Visual de Fluxos',
        description: 'Fundamentos do canvas visual de automação, nós, gatilhos e ações.',
        lessons: [
          {
            id: 'aula-aut-01',
            trackId: 'automacao',
            moduleId: 'mod-aut-01',
            moduleTitle: 'Construtor Visual de Fluxos',
            title: 'Como criar seu primeiro fluxo de automação',
            slug: 'primeiro-fluxo-automacao',
            description: 'Criação prática de um fluxo de boas-vindas com botões e transbordo humano.',
            duration: '11:20',
            durationSeconds: 680,
            level: 'Iniciante',
            category: 'Automação',
            thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'flow',
            learningObjectives: [
              'Utilizar o editor drag-and-drop de nós.',
              'Configurar mensagens com botões e listas de seleção.',
              'Direcionar o cliente para atendentes após qualificação.'
            ],
            megaZapTip: 'Sempre teste o fluxo no seu próprio número antes de publicar para toda a base.',
            aboutText: 'Construa do zero um fluxo completo de boas-vindas e qualificação automática de clientes.',
            resources: [
              { id: 'res-aut-01', title: 'Template de Fluxo de Boas-Vindas (JSON)', type: 'json', size: '120 KB' }
            ],
            featured: true
          },
          {
            id: 'aula-aut-02',
            trackId: 'automacao',
            moduleId: 'mod-aut-01',
            moduleTitle: 'Construtor Visual de Fluxos',
            title: 'Condicionais e Variáveis Dinâmicas no Fluxo',
            slug: 'condicionais-e-variaveis',
            description: 'Crie caminhos personalizados com base em tags, horário ou respostas anteriores.',
            duration: '09:50',
            durationSeconds: 590,
            level: 'Avançado',
            category: 'Automação',
            thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'flow',
            learningObjectives: [
              'Configurar nós de decisão (SE o cliente já comprou ENTÃO...).',
              'Armazenar variáveis digitadas pelo usuário.',
              'Personalizar textos dinamicamente com os dados coletados.'
            ],
            megaZapTip: 'Use nós condicionais para criar experiências personalizadas para clientes VIP.',
            aboutText: 'Eleve o nível dos seus fluxos criando árvores de decisão inteligentes baseadas no comportamento do cliente.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-aut-02',
        trackId: 'automacao',
        orderNumber: 2,
        title: 'Fluxos Agendados e Histórico',
        description: 'Programação de eventos temporais e acompanhamento de execuções.',
        lessons: [
          {
            id: 'aula-aut-03',
            trackId: 'automacao',
            moduleId: 'mod-aut-02',
            moduleTitle: 'Fluxos Agendados e Histórico',
            title: 'Fluxos Agendados e Régua de Relacionamento',
            slug: 'fluxos-agendados-regua',
            description: 'Envio de mensagens automáticas após 3 dias, 7 dias ou datas comemorativas.',
            duration: '08:30',
            durationSeconds: 510,
            level: 'Intermediário',
            category: 'Automação',
            thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'flow',
            learningObjectives: [
              'Montar réguas de nutrição de leads.',
              'Disparar mensagens em datas de aniversário de clientes.',
              'Pausar automações caso o cliente já tenha interagido.'
            ],
            megaZapTip: 'Configure réguas de reengajamento para contatos inativos há mais de 30 dias.',
            aboutText: 'Automatize o pós-venda e retenção criando réguas de mensagens disparadas por tempo.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    slug: 'marketing',
    category: 'Marketing',
    shortDescription: 'Aprenda a criar e gerenciar campanhas e grupos no WhatsApp.',
    description: 'Estratégias completas de disparos em massa responsáveis, segmentação de listas por tags, gerenciamento de grupos e acompanhamento de taxas de conversão.',
    iconName: 'Megaphone',
    level: 'Intermediário',
    badgeColor: 'blue',
    estimatedHours: '3h 10min',
    certificateAvailable: true,
    certificateName: 'Certificação em Marketing e Campanhas MegaZap',
    modules: [
      {
        id: 'mod-mkt-01',
        trackId: 'marketing',
        orderNumber: 1,
        title: 'Campanhas de Mensagens',
        description: 'Criação de disparos, segmentação de contatos e intervalos anti-bloqueio.',
        lessons: [
          {
            id: 'aula-mkt-01',
            trackId: 'marketing',
            moduleId: 'mod-mkt-01',
            moduleTitle: 'Campanhas de Mensagens',
            title: 'Como Criar uma Campanha de Disparo Segmentada',
            slug: 'criar-campanha-segmentada',
            description: 'Seleção de públicos por tags, agendamento e personalização de textos.',
            duration: '08:40',
            durationSeconds: 520,
            level: 'Intermediário',
            category: 'Marketing',
            thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'campaign',
            learningObjectives: [
              'Definir filtros de público com base em histórico e tags.',
              'Configurar delay entre mensagens para evitar bloqueios de chip.',
              'Acompanhar status de envio: Enviado, Entregue e Lido.'
            ],
            megaZapTip: 'Sempre configure um intervalo de 15 a 30 segundos entre os envios para simular comportamento humano.',
            aboutText: 'Aprenda a disparar promoções e avisos para milhares de contatos com segurança e alta taxa de entrega.',
            resources: [
              { id: 'res-mkt-01', title: 'Guia Anti-Bloqueio no WhatsApp (PDF)', type: 'pdf', size: '2.1 MB' }
            ]
          }
        ]
      },
      {
        id: 'mod-mkt-02',
        trackId: 'marketing',
        orderNumber: 2,
        title: 'Gestão de Grupos e Comunidades',
        description: 'Administração de grupos de WhatsApp, links de entrada e mensagens programadas.',
        lessons: [
          {
            id: 'aula-mkt-02',
            trackId: 'marketing',
            moduleId: 'mod-mkt-02',
            moduleTitle: 'Gestão de Grupos e Comunidades',
            title: 'Gerenciamento Centralizado de Grupos de WhatsApp',
            slug: 'gerenciamento-de-grupos',
            description: 'Envie avisos para múltiplos grupos simultaneamente e controle permissões.',
            duration: '07:15',
            durationSeconds: 435,
            level: 'Intermediário',
            category: 'Marketing',
            thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'campaign',
            learningObjectives: [
              'Conectar grupos existentes ao painel MegaZap.',
              'Disparar comunicações sincronizadas em dezenas de grupos.',
              'Controlar abertura e fechamento de envio de mensagens.'
            ],
            megaZapTip: 'Utilize o disparo em lote de grupos para lançamentos de infoprodutos e eventos corporativos.',
            aboutText: 'Gerencie dezenas de grupos de clientes ou alunos a partir de uma única tela no MegaZap.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'cadastros',
    title: 'Cadastros',
    slug: 'cadastros',
    category: 'Cadastros',
    shortDescription: 'Gerencie clientes, serviços, produtos e catálogo comercial.',
    description: 'Aprenda a estruturar a base cadastral de clientes, catálogo de produtos e serviços para agilizar a cotação e envio de propostas pelo chat.',
    iconName: 'Database',
    level: 'Iniciante',
    badgeColor: 'blue',
    estimatedHours: '2h 40min',
    certificateAvailable: true,
    certificateName: 'Certificação em Gestão de Cadastros MegaZap',
    modules: [
      {
        id: 'mod-cad-01',
        trackId: 'cadastros',
        orderNumber: 1,
        title: 'Cadastro de Clientes e Estrutura',
        description: 'Importação de planilhas de contatos, mesclagem e campos personalizados.',
        lessons: [
          {
            id: 'aula-cad-01',
            trackId: 'cadastros',
            moduleId: 'mod-cad-01',
            moduleTitle: 'Cadastro de Clientes e Estrutura',
            title: 'Importação e Exportação de Listas de Clientes via CSV/Excel',
            slug: 'importacao-exportacao-clientes',
            description: 'Como subir bases com milhares de contatos sem erros de formatação.',
            duration: '06:40',
            durationSeconds: 400,
            level: 'Iniciante',
            category: 'Cadastros',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'contacts',
            learningObjectives: [
              'Formatar colunas de telefone com DDI e DDD (+5511999999999).',
              'Mapear campos customizados durante o upload da planilha.',
              'Identificar e tratar contatos duplicados.'
            ],
            megaZapTip: 'Sempre verifique se a coluna de telefone possui o código do país (+55 para Brasil) para evitar falhas de envio.',
            aboutText: 'Aprenda a subir sua base atual de clientes para o MegaZap em poucos segundos.',
            resources: [
              { id: 'res-cad-01', title: 'Planilha Modelo de Importação (XLSX)', type: 'doc', size: '380 KB' }
            ]
          }
        ]
      },
      {
        id: 'mod-cad-02',
        trackId: 'cadastros',
        orderNumber: 2,
        title: 'Catálogo de Produtos e Serviços',
        description: 'Criação de itens com foto, preço, código e envio direto no chat.',
        lessons: [
          {
            id: 'aula-cad-02',
            trackId: 'cadastros',
            moduleId: 'mod-cad-02',
            moduleTitle: 'Catálogo de Produtos e Serviços',
            title: 'Como Cadastrar Produtos e Enviar no Chat com 1 Clique',
            slug: 'cadastrar-produtos-chat',
            description: 'Agilize vendas enviando fotos, descrições e links de pagamento.',
            duration: '07:25',
            durationSeconds: 445,
            level: 'Iniciante',
            category: 'Cadastros',
            thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'contacts',
            learningObjectives: [
              'Cadastrar produtos com fotos em alta resolução e valores.',
              'Utilizar o botão de catálogo direto na janela de conversa.',
              'Adicionar links de checkout ou chave PIX aos itens.'
            ],
            megaZapTip: 'Atendentes podem enviar um card completo de produto sem precisar sair da conversa com o cliente.',
            aboutText: 'Veja como cadastrar seu portfólio de produtos e serviços para acelerar as vendas do time comercial.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'jadi',
    title: 'JADI',
    slug: 'jadi',
    category: 'JADI',
    shortDescription: 'Conheça os recursos de inteligência artificial generativa e assistentes virtuais.',
    description: 'Aprenda a configurar a IA oficial do MegaZap (JADI), criar assistentes inteligentes treinados com o conhecimento da sua empresa e automatizar atendimentos com linguagem natural.',
    iconName: 'Sparkles',
    level: 'Avançado',
    badgeColor: 'purple',
    estimatedHours: '3h 45min',
    certificateAvailable: true,
    certificateName: 'Certificação em IA e Assistentes Virtuais JADI MegaZap',
    modules: [
      {
        id: 'mod-jadi-01',
        trackId: 'jadi',
        orderNumber: 1,
        title: 'Introdução ao JADI e Configuração de IA',
        description: 'Visão geral da IA proprietária, prompts de sistema e personalidade do agente.',
        lessons: [
          {
            id: 'aula-jadi-01',
            trackId: 'jadi',
            moduleId: 'mod-jadi-01',
            moduleTitle: 'Introdução ao JADI e Configuração de IA',
            title: 'O que é o JADI e Como Funciona a IA no MegaZap',
            slug: 'o-que-e-o-jadi',
            description: 'Conceitos fundamentais de IA aplicada a conversas de WhatsApp corporativas.',
            duration: '08:15',
            durationSeconds: 495,
            level: 'Intermediário',
            category: 'JADI',
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'jadi',
            learningObjectives: [
              'Entender a diferença entre chatbot tradicional de botões e IA generativa JADI.',
              'Aprender como o JADI interpreta intenções e dúvidas complexas.',
              'Definir limites éticos e instruções de segurança da empresa.'
            ],
            megaZapTip: 'O JADI pode responder dúvidas em português, inglês e espanhol automaticamente com tom humanizado.',
            aboutText: 'Descubra como o motor de inteligência artificial JADI transforma o atendimento do seu WhatsApp em um assistente 24/7.',
            resources: [
              { id: 'res-jadi-01', title: 'Guia de Engenharia de Prompt para o JADI (PDF)', type: 'pdf', size: '2.8 MB' }
            ],
            featured: true
          },
          {
            id: 'aula-jadi-02',
            trackId: 'jadi',
            moduleId: 'mod-jadi-01',
            moduleTitle: 'Introdução ao JADI e Configuração de IA',
            title: 'Criando Assistentes Virtuais e Base de Conhecimento',
            slug: 'assistentes-e-base-conhecimento',
            description: 'Treine a IA enviando PDFs, links de sites e manuais da empresa.',
            duration: '10:45',
            durationSeconds: 645,
            level: 'Avançado',
            category: 'JADI',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'jadi',
            learningObjectives: [
              'Subir arquivos PDF e links para treinamento da IA.',
              'Testar o simulador de chat antes de ativar para clientes reais.',
              'Configurar transbordo para humano quando a IA não souber a resposta.'
            ],
            megaZapTip: 'Mantenha a base de conhecimento atualizada sempre que mudar preços ou políticas da empresa.',
            aboutText: 'Aprenda a alimentar o cérebro do JADI com os manuais da sua empresa para respostas precisas e sem alucinações.',
            resources: [
              { id: 'res-jadi-02', title: 'Estrutura Recomendada para Base de Conhecimento (DOC)', type: 'doc', size: '510 KB' }
            ]
          }
        ]
      },
      {
        id: 'mod-jadi-02',
        trackId: 'jadi',
        orderNumber: 2,
        title: 'Agrupamentos e Transbordo Inteligente',
        description: 'Integração de assistentes a fluxos de atendimento e regras de transbordo.',
        lessons: [
          {
            id: 'aula-jadi-03',
            trackId: 'jadi',
            moduleId: 'mod-jadi-02',
            moduleTitle: 'Agrupamentos e Transbordo Inteligente',
            title: 'Transbordo Automático do JADI para Atendentes Humanos',
            slug: 'transbordo-jadi-humano',
            description: 'Como a IA identifica a hora exata de chamar um especialista.',
            duration: '07:50',
            durationSeconds: 470,
            level: 'Avançado',
            category: 'JADI',
            thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'jadi',
            learningObjectives: [
              'Definir palavras-chave e gatilhos de transbordo imediato.',
              'Gerar resumo automático da conversa para o atendente que assumir.',
              'Monitorar a taxa de resolução da IA sem intervenção humana.'
            ],
            megaZapTip: 'O JADI envia um resumo inteligente com os pontos principais tratados antes do atendente falar com o cliente.',
            aboutText: 'Garanta a melhor experiência para o cliente combinando a velocidade da IA com a sensibilidade do atendimento humano.',
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: 'administracao',
    title: 'Administração',
    slug: 'administracao',
    category: 'Administração',
    shortDescription: 'Personalização White Label, configurações avançadas e API/Webhooks.',
    description: 'Trilha técnica e executiva para parceiros White Label: configuração de domínio próprio, customização de logotipo e cores, gestão de subcontas e integração via API oficial.',
    iconName: 'ShieldCheck',
    level: 'Avançado',
    badgeColor: 'slate',
    estimatedHours: '3h 30min',
    certificateAvailable: true,
    certificateName: 'Certificação Master White Label MegaZap',
    modules: [
      {
        id: 'mod-adm-01',
        trackId: 'administracao',
        orderNumber: 1,
        title: 'Configurações de Marca White Label',
        description: 'Apontamento de DNS, domínio personalizado, favicon e cores da sua empresa.',
        lessons: [
          {
            id: 'aula-adm-01',
            trackId: 'administracao',
            moduleId: 'mod-adm-01',
            moduleTitle: 'Configurações de Marca White Label',
            title: 'Configurando seu Domínio Personalizado e Certificado SSL',
            slug: 'configurar-dominio-white-label',
            description: 'Como apontar seu CNAME (ex: app.suaempresa.com.br) para o MegaZap.',
            duration: '09:10',
            durationSeconds: 550,
            level: 'Avançado',
            category: 'Administração',
            thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Criar entradas DNS CNAME e TXT no Cloudflare ou registrador.',
              'Validar emissão automática de certificado SSL gratuito.',
              'Configurar logotipo claro, escuro e favicon da sua marca.'
            ],
            megaZapTip: 'Use o Cloudflare com proxy ativado (nuvem cinza/DNS Only durante a validação) para máxima velocidade de carregamento.',
            aboutText: 'Transforme o MegaZap na ferramenta com o nome, domínio e identidade visual da sua agência ou empresa de software.',
            resources: [
              { id: 'res-adm-01', title: 'Guia de Apontamento DNS White Label (PDF)', type: 'pdf', size: '1.5 MB' }
            ]
          },
          {
            id: 'aula-adm-02',
            trackId: 'administracao',
            moduleId: 'mod-adm-01',
            moduleTitle: 'Configurações de Marca White Label',
            title: 'Configuração de Usuários, Departamentos e Permissões Globais',
            slug: 'configurando-usuarios-e-permissoes',
            description: 'Gerenciamento de acessos corporativos, papéis e segurança.',
            duration: '08:30',
            durationSeconds: 510,
            level: 'Intermediário',
            category: 'Administração',
            thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Criar perfis de permissão customizados.',
              'Auditar logs de login e acessos por IP.',
              'Definir regras de expiração de senhas e 2FA.'
            ],
            megaZapTip: 'Ative a autenticação em duas etapas (2FA) para todos os administradores para proteger sua infraestrutura.',
            aboutText: 'Estruture as políticas de segurança da sua plataforma White Label para atender clientes corporativos exigentes.',
            resources: []
          }
        ]
      },
      {
        id: 'mod-adm-02',
        trackId: 'administracao',
        orderNumber: 2,
        title: 'API, Webhooks e Integrações',
        description: 'Documentação da API REST, tokens de integração e envio de eventos em tempo real.',
        lessons: [
          {
            id: 'aula-adm-03',
            trackId: 'administracao',
            moduleId: 'mod-adm-02',
            moduleTitle: 'API, Webhooks e Integrações',
            title: 'Geração de Token de Integração e Envio de Mensagens via API',
            slug: 'api-e-webhooks-integracao',
            description: 'Como integrar seu ERP, CRM ou site para disparar mensagens automáticas.',
            duration: '11:45',
            durationSeconds: 705,
            level: 'Avançado',
            category: 'Administração',
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
            previewMockupType: 'settings',
            learningObjectives: [
              'Gerar tokens de API com permissões restritas.',
              'Disparar mensagens de texto, mídias e templates via POST /api/send.',
              'Configurar webhooks para receber notificações de mensagens recebidas e status.'
            ],
            megaZapTip: 'Utilize webhooks com payload assinado para garantir a autenticidade das mensagens recebidas pelo seu sistema.',
            aboutText: 'Conecte qualquer sistema legado ou software SaaS à API do MegaZap com facilidade e alta performance.',
            resources: [
              { id: 'res-adm-02', title: 'Postman Collection da API MegaZap (JSON)', type: 'json', size: '85 KB' },
              { id: 'res-adm-03', title: 'Documentação da API Swagger (Link)', type: 'link', url: 'https://megazap.api-docs.io' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper to get all lessons flat
export const ALL_LESSONS: Lesson[] = TRACKS_DATA.flatMap(t => 
  t.modules.flatMap(m => m.lessons)
);

// Initial mock progress data aligned with prompt:
// 72% overall, 12 of 17 completed in Atendimento track (or 12 total),
// Primeiros Passos 100%, Atendimento 68%, Automação 35%, etc.
export const INITIAL_COMPLETED_LESSON_IDS = [
  // Primeiros passos: all 5 completed
  'aula-pp-01',
  'aula-pp-02',
  'aula-pp-03',
  'aula-pp-04',
  'aula-pp-05',
  // Atendimento: 6 completed
  'aula-at-01',
  'aula-at-02',
  'aula-at-03',
  'aula-at-04',
  'aula-at-07',
  'aula-at-09',
  // Automação: 1 completed
  'aula-aut-01'
];

export const INITIAL_LESSON_PROGRESS: Record<string, number> = {
  'aula-at-05': 82, // Currently watching "Como utilizar as Mensagens Rápidas" at 82% (08:42 restantes)
  'aula-at-06': 30,
  'aula-aut-02': 40
};

export const INITIAL_FAVORITE_LESSON_IDS = [
  'aula-at-05', // Mensagens Rápidas
  'aula-aut-01', // Primeiro fluxo de automação
  'aula-jadi-01', // O que é o JADI
  'aula-adm-01'  // Configurar domínio
];

export const RECOMMENDED_LESSONS_IDS = [
  'aula-aut-01', // Como criar seu primeiro fluxo de automação
  'aula-adm-02', // Configurando usuários e permissões
  'aula-at-01'   // Como organizar sua equipe de atendimento
];
