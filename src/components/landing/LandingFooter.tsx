import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[hsl(var(--slate-gray))] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Flowdent</h3>
            <p className="text-sm text-gray-300">
              O software de gestão que liberta seu tempo para focar no que importa: seus pacientes.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(var(--flow-turquoise))] transition-colors flex items-center justify-center"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#recursos" className="hover:text-[hsl(var(--flow-turquoise))] transition">Recursos</a></li>
              <li><a href="#planos" className="hover:text-[hsl(var(--flow-turquoise))] transition">Planos e Preços</a></li>
              <li><a href="#demo" className="hover:text-[hsl(var(--flow-turquoise))] transition">Solicitar Demo</a></li>
              <li><a href="#atualizacoes" className="hover:text-[hsl(var(--flow-turquoise))] transition">Atualizações</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#ajuda" className="hover:text-[hsl(var(--flow-turquoise))] transition">Central de Ajuda</a></li>
              <li><a href="#tutoriais" className="hover:text-[hsl(var(--flow-turquoise))] transition">Tutoriais</a></li>
              <li><a href="#contato" className="hover:text-[hsl(var(--flow-turquoise))] transition">Contato</a></li>
              <li><a href="#status" className="hover:text-[hsl(var(--flow-turquoise))] transition">Status do Sistema</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4 text-[hsl(var(--flow-turquoise))]">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-1 text-[hsl(var(--flow-turquoise))]" />
                <span>contato@flowdent.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-1 text-[hsl(var(--flow-turquoise))]" />
                <span>(11) 91551-9060</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-[hsl(var(--flow-turquoise))]" />
                <span>Belo Horizonte, MG<br />Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; 2024 Flowdent. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#privacidade" className="hover:text-[hsl(var(--flow-turquoise))] transition">
              Política de Privacidade
            </a>
            <a href="#termos" className="hover:text-[hsl(var(--flow-turquoise))] transition">
              Termos de Uso
            </a>
            <a href="#lgpd" className="hover:text-[hsl(var(--flow-turquoise))] transition">
              LGPD
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
