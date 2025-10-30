import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[hsl(var(--flowdent-blue))]">
              Flowdent
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition"
            >
              Home
            </button>
            
            <button 
              onClick={() => scrollToSection('recursos')}
              className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition"
            >
              Recursos
            </button>

            <button 
              onClick={() => scrollToSection('depoimentos')}
              className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition"
            >
              Depoimentos
            </button>

            <button 
              onClick={() => scrollToSection('contato')}
              className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition"
            >
              Contato
            </button>
          </nav>

          {/* CTAs Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="/auth" 
              className="text-[hsl(var(--flowdent-blue))] hover:text-[hsl(var(--flow-turquoise))] transition font-semibold"
            >
              Entrar
            </a>
            <Button 
              className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))] transition-colors"
            >
              Testar Grátis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[hsl(var(--slate-gray))]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4"
            >
              <nav className="flex flex-col space-y-4 py-4">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('recursos')}
                  className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition text-left"
                >
                  Recursos
                </button>
                <button 
                  onClick={() => scrollToSection('depoimentos')}
                  className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition text-left"
                >
                  Depoimentos
                </button>
                <button 
                  onClick={() => scrollToSection('contato')}
                  className="text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))] transition text-left"
                >
                  Contato
                </button>
                <hr className="border-[hsl(var(--cloud-white))]" />
                <a href="/auth" className="text-[hsl(var(--flowdent-blue))] font-semibold">
                  Entrar
                </a>
                <Button className="bg-[hsl(var(--flowdent-blue))] text-white w-full">
                  Testar Grátis
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
