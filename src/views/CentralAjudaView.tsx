import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Sparkles,
  ShieldCheck,
  Server
} from 'lucide-react';

export const CentralAjudaView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [suggestText, setSuggestText] = useState('');
  const [suggestSent, setSuggestSent] = useState(false);

  const faqs = [
    {
      question: 'Como solicito uma aula ou tutorial específico para a minha equipe?',
      answer: 'Como parceiro White Label, você pode solicitar novos tutoriais ou roteiros de treinamento específicos preenchendo o formulário ao lado ou abrindo um chamado direto pelo canal exclusivo do WhatsApp de parceiros.'
    },
    {
      question: 'Posso disponibilizar os vídeos da MegaZap Academy para os meus clientes finais?',
      answer: 'Sim! Os conteúdos da Academy foram gravados sem menções a preços de varejo ou condições internas, permitindo que você compartilhe os materiais ou utilize a base de conhecimento como referência no seu suporte.'
    },
    {
      question: 'Com que frequência novos módulos e atualizações são adicionados?',
      answer: 'A equipe de produto e engenharia da MegaZap atualiza a Academy sempre que novas funcionalidades são lançadas no sistema, garantindo que você e sua equipe estejam sempre atualizados com as melhores práticas.'
    },
    {
      question: 'Onde encontro a documentação técnica da API e Webhooks?',
      answer: 'A documentação completa da API REST e Webhooks está disponível na trilha de Administração e também no portal de desenvolvedores oficial MegaZap.'
    },
    {
      question: 'O que fazer se um número de WhatsApp desconectar frequentemente?',
      answer: 'Confira a aula "Conexão de Conexões WhatsApp via QR Code" no módulo Primeiros Passos. As principais causas são economia de bateria ativa no celular, oscilações no Wi-Fi do aparelho ou atualização pendente no WhatsApp oficial.'
    }
  ];

  const handleSendSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestText.trim()) return;
    setSuggestSent(true);
    setSuggestText('');
    setTimeout(() => setSuggestSent(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Central de Ajuda & Suporte White Label
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dúvidas frequentes, documentação de integração e canal de contato direto com a equipe MegaZap.
        </p>
      </div>

      {/* 3 Action Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Partner Hotline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              WhatsApp Exclusivo Parceiros
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Atendimento prioritário de segundo nível para parceiros White Label com SLA reduzido.
            </p>
          </div>
          <a
            href="https://api.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
          >
            <span>Falar com o Suporte Técnico</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* API & Dev Docs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              Documentação da API & Webhooks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consulte endpoints REST, payloads JSON e guias de integração externa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('Abrindo portal da API MegaZap...')}
            className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Acessar Swagger API</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Status dos Servidores */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Status da Infraestrutura
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                100% Online
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cluster WhatsApp, disparadores de mensagens e instâncias de IA operando sem instabilidade.
            </p>
          </div>
          <span className="mt-4 text-[11px] text-slate-400 dark:text-slate-400 py-1">
            Uptime nos últimos 90 dias: <strong className="text-slate-700 dark:text-slate-200">99.98%</strong>
          </span>
        </div>
      </div>

      {/* Grid: FAQs + Suggestion Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: FAQs Accordion (Lg: 7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Perguntas Frequentes (FAQ)
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer gap-3"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 pt-1 border-t border-slate-50 dark:border-slate-800">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Request a Lesson / Suggestion Box (Lg: 5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Sugerir Nova Aula ou Funcionalidade
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Sentiu falta de algum tutorial específico sobre o MegaZap? Envie sua sugestão diretamente para a equipe pedagógica.
            </p>

            {suggestSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="font-bold">Sugestão enviada com sucesso!</p>
                <p className="text-emerald-700 dark:text-emerald-400">Nossa equipe analisará seu pedido para as próximas atualizações da Academy.</p>
              </div>
            ) : (
              <form onSubmit={handleSendSuggestion} className="space-y-3">
                <textarea
                  value={suggestText}
                  onChange={(e) => setSuggestText(e.target.value)}
                  placeholder="Descreva qual funcionalidade, integração ou fluxo você gostaria de ver explicado em uma aula..."
                  rows={4}
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed"
                />

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Sugestão de Treinamento</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            Tempo médio de resposta da equipe pedagógica: <strong className="text-slate-600 dark:text-slate-300">24 horas</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
