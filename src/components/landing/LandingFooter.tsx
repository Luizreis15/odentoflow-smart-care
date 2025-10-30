import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#2C3E50] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Coluna 1 - Informações da Empresa */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Flowdent</h3>
            <p className="text-sm font-semibold text-[hsl(var(--flow-turquoise))]">
              Gestão Inteligente para Clínicas Odontológicas
            </p>
            <p className="text-sm text-gray-300">
              Desenvolvido pela Hera Digital, o Flowdent é a solução completa para transformar a gestão da sua clínica odontológica.
            </p>
            
            <div className="space-y-2 text-sm pt-2">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[hsl(var(--flow-turquoise))] flex-shrink-0" />
                <span className="text-gray-300">Av. Dom Pedro II, 1107 - Sala 01, Santo André/SP</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[hsl(var(--flow-turquoise))]" />
                <span className="text-gray-300">(11) 91551-9060</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[hsl(var(--flow-turquoise))]" />
                <span className="text-gray-300">contato@flowdent.com.br</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="mt-0.5 text-[hsl(var(--flow-turquoise))] flex-shrink-0" />
                <span className="text-gray-300 text-xs">CNPJ: 57.025.353/0001-63</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <a 
                href="https://facebook.com/flowdent" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="https://instagram.com/flowdent" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Coluna 2 - Produto */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))] text-sm uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#recursos" className="text-gray-300 hover:text-white transition">Recursos</a></li>
              <li><a href="#planos" className="text-gray-300 hover:text-white transition">Planos e Preços</a></li>
              <li><a href="#integracoes" className="text-gray-300 hover:text-white transition">Integrações</a></li>
              <li><a href="#atualizacoes" className="text-gray-300 hover:text-white transition">Atualizações</a></li>
            </ul>
          </div>

          {/* Coluna 3 - Suporte */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))] text-sm uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#ajuda" className="text-gray-300 hover:text-white transition">Central de Ajuda</a></li>
              <li><a href="#especialista" className="text-gray-300 hover:text-white transition">Falar com Especialista</a></li>
              <li><a href="#tutoriais" className="text-gray-300 hover:text-white transition">Tutoriais em Vídeo</a></li>
              <li><a href="#status" className="text-gray-300 hover:text-white transition">Status do Sistema</a></li>
            </ul>
          </div>

          {/* Coluna 4 - Empresa */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))] text-sm uppercase tracking-wider">Empresa</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#sobre" className="text-gray-300 hover:text-white transition">Sobre</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-white transition">Blog</a></li>
              <li><a href="#cases" className="text-gray-300 hover:text-white transition">Cases de Sucesso</a></li>
              <li><a href="#contato" className="text-gray-300 hover:text-white transition">Contato</a></li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-white/10 mt-10 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-xs">
            {/* Esquerda */}
            <p className="text-gray-400 text-center lg:text-left">
              © 2025 Flowdent by Hera Digital. Todos os direitos reservados.
            </p>

            {/* Centro */}
            <div className="flex flex-wrap justify-center gap-3 text-gray-400">
              <a href="#privacidade" className="hover:text-white transition">Política de Privacidade</a>
              <span className="hidden sm:inline">|</span>
              <a href="#termos" className="hover:text-white transition">Termos de Uso</a>
              <span className="hidden sm:inline">|</span>
              <a href="#lgpd" className="hover:text-white transition">LGPD</a>
              <span className="hidden sm:inline">|</span>
              <a href="#cookies" className="hover:text-white transition">Cookies</a>
            </div>

            {/* Direita - Badges */}
            <div className="flex gap-2">
              <a 
                href="#app-store" 
                className="bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded text-xs"
              >
                App Store
              </a>
              <a 
                href="#google-play" 
                className="bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded text-xs"
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
