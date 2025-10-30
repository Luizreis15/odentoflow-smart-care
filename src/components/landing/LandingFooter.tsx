import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#2C3E50] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Coluna 1 - Informações da Empresa (mais larga) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold">Flowdent</h3>
            <p className="text-lg font-semibold text-[hsl(var(--flow-turquoise))]">
              Gestão Inteligente para Clínicas Odontológicas
            </p>
            <p className="text-sm text-gray-300">
              Desenvolvido pela Hera Digital, o Flowdent é a solução completa para transformar a gestão da sua clínica odontológica.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-[hsl(var(--flow-turquoise))] flex-shrink-0" />
                <span>Av. Dom Pedro II, 1107 - Sala 01, Jardim - Santo André/SP, CEP: 09080-110</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[hsl(var(--flow-turquoise))]" />
                <span>(11) 91551-9060</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[hsl(var(--flow-turquoise))]" />
                <span>contato@flowdent.com.br</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="mt-1 text-[hsl(var(--flow-turquoise))] flex-shrink-0" />
                <span>Hera Digital e Intermediações Ltda - CNPJ: 57.025.353/0001-63</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <a 
                href="https://facebook.com/flowdent" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com/flowdent" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Coluna 2 - Produto */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">PRODUTO</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#visao-geral" className="hover:text-[hsl(var(--flow-turquoise))] transition">Visão Geral</a></li>
              <li><a href="#recursos" className="hover:text-[hsl(var(--flow-turquoise))] transition">Recursos</a></li>
              <li><a href="#planos" className="hover:text-[hsl(var(--flow-turquoise))] transition">Planos e Preços</a></li>
              <li><a href="#mobile" className="hover:text-[hsl(var(--flow-turquoise))] transition">Aplicativo Mobile</a></li>
              <li><a href="#integracoes" className="hover:text-[hsl(var(--flow-turquoise))] transition">Integrações</a></li>
              <li><a href="#atualizacoes" className="hover:text-[hsl(var(--flow-turquoise))] transition">Atualizações</a></li>
              <li><a href="#roadmap" className="hover:text-[hsl(var(--flow-turquoise))] transition">Roadmap</a></li>
            </ul>
          </div>

          {/* Coluna 3 - Recursos */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">RECURSOS</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#agenda" className="hover:text-[hsl(var(--flow-turquoise))] transition">Agenda Inteligente</a></li>
              <li><a href="#prontuario" className="hover:text-[hsl(var(--flow-turquoise))] transition">Prontuário Digital</a></li>
              <li><a href="#documentos" className="hover:text-[hsl(var(--flow-turquoise))] transition">Documentos Digitais</a></li>
              <li><a href="#financeiro" className="hover:text-[hsl(var(--flow-turquoise))] transition">Gestão Financeira</a></li>
              <li><a href="#marketing" className="hover:text-[hsl(var(--flow-turquoise))] transition">Marketing e CRM</a></li>
              <li><a href="#relatorios" className="hover:text-[hsl(var(--flow-turquoise))] transition">Relatórios</a></li>
              <li><a href="#seguranca" className="hover:text-[hsl(var(--flow-turquoise))] transition">Segurança</a></li>
            </ul>
          </div>

          {/* Coluna 4 - Suporte */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">SUPORTE</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#ajuda" className="hover:text-[hsl(var(--flow-turquoise))] transition">Central de Ajuda</a></li>
              <li><a href="#especialista" className="hover:text-[hsl(var(--flow-turquoise))] transition">Falar com Especialista</a></li>
              <li><a href="#tutoriais" className="hover:text-[hsl(var(--flow-turquoise))] transition">Tutoriais em Vídeo</a></li>
              <li><a href="#base" className="hover:text-[hsl(var(--flow-turquoise))] transition">Base de Conhecimento</a></li>
              <li><a href="#migracao" className="hover:text-[hsl(var(--flow-turquoise))] transition">Migração de Dados</a></li>
              <li><a href="#treinamento" className="hover:text-[hsl(var(--flow-turquoise))] transition">Treinamento</a></li>
              <li><a href="#status" className="hover:text-[hsl(var(--flow-turquoise))] transition">Status do Sistema</a></li>
            </ul>
          </div>
        </div>

        {/* Linha adicional - Coluna 5 - Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
          <div className="lg:col-start-5">
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">EMPRESA</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hera-digital" className="hover:text-[hsl(var(--flow-turquoise))] transition">Sobre a Hera Digital</a></li>
              <li><a href="#sobre-flowdent" className="hover:text-[hsl(var(--flow-turquoise))] transition">Sobre o Flowdent</a></li>
              <li><a href="#blog" className="hover:text-[hsl(var(--flow-turquoise))] transition">Blog</a></li>
              <li><a href="#cases" className="hover:text-[hsl(var(--flow-turquoise))] transition">Cases de Sucesso</a></li>
              <li><a href="#parceiros" className="hover:text-[hsl(var(--flow-turquoise))] transition">Parceiros</a></li>
              <li><a href="#carreiras" className="hover:text-[hsl(var(--flow-turquoise))] transition">Carreiras</a></li>
              <li><a href="#imprensa" className="hover:text-[hsl(var(--flow-turquoise))] transition">Imprensa</a></li>
              <li><a href="#contato" className="hover:text-[hsl(var(--flow-turquoise))] transition">Contato</a></li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-sm">
            {/* Esquerda */}
            <p className="text-gray-400">
              © 2025 Flowdent by Hera Digital. Todos os direitos reservados.
            </p>

            {/* Centro */}
            <div className="flex flex-wrap justify-center gap-4 text-gray-400">
              <a href="#privacidade" className="hover:text-[hsl(var(--flow-turquoise))] transition">
                Política de Privacidade
              </a>
              <span className="hidden md:inline">|</span>
              <a href="#termos" className="hover:text-[hsl(var(--flow-turquoise))] transition">
                Termos de Uso
              </a>
              <span className="hidden md:inline">|</span>
              <a href="#lgpd" className="hover:text-[hsl(var(--flow-turquoise))] transition">
                LGPD
              </a>
              <span className="hidden md:inline">|</span>
              <a href="#cookies" className="hover:text-[hsl(var(--flow-turquoise))] transition">
                Política de Cookies
              </a>
            </div>

            {/* Direita - Badges */}
            <div className="flex gap-3">
              <a 
                href="#app-store" 
                className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg text-xs font-medium"
              >
                App Store
              </a>
              <a 
                href="#google-play" 
                className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg text-xs font-medium"
              >
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
