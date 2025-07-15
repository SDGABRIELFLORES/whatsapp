import { MessageCircle, Upload, Clock, Image, Users, Shield, BarChart3, Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageCircle className="text-primary text-2xl mr-3" />
              <span className="text-xl font-semibold text-slate-900">CampanhaWhats</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Recursos</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Planos</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contato</a>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/login'}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Envie Campanhas no
                <span className="text-primary"> WhatsApp</span>
                em Lote
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Plataforma completa para disparos de mensagens personalizadas no WhatsApp. 
                Gerencie campanhas, clientes e relatórios em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Começar Agora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Ver Demonstração
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="shadow-2xl border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Dashboard de Campanhas</h3>
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Mensagens Enviadas</span>
                      <span className="font-semibold text-slate-900">1,247</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Taxa de Entrega</span>
                      <span className="font-semibold text-primary">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Campanhas Ativas</span>
                      <span className="font-semibold text-slate-900">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Recursos Principais</h2>
            <p className="text-xl text-slate-600">Tudo que você precisa para campanhas eficientes</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <Upload className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Upload de Planilha</h3>
                <p className="text-slate-600">Importe seus contatos via Excel com campos personalizados</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <Clock className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Delay Configurável</h3>
                <p className="text-slate-600">Configure intervalos entre envios para evitar banimento</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <Image className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Envio com Imagens</h3>
                <p className="text-slate-600">Anexe imagens às suas mensagens para maior engajamento</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <Users className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Personalização</h3>
                <p className="text-slate-600">Use [nome] e outros campos da planilha nas mensagens</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <BarChart3 className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Relatórios</h3>
                <p className="text-slate-600">Acompanhe estatísticas detalhadas de suas campanhas</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-6">
                <Shield className="text-primary text-2xl mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Proteção Anti-Ban</h3>
                <p className="text-slate-600">Sistema inteligente para evitar bloqueios</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Planos e Preços</h2>
            <p className="text-xl text-slate-600">Escolha o plano ideal para seu negócio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Básico</h3>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    R$ 29<span className="text-lg text-slate-500">/mês</span>
                  </div>
                  <p className="text-slate-600">Ideal para começar</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Até 1.000 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">1 sessão WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Upload de planilha</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Relatórios básicos</span>
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">Mais Popular</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    R$ 79<span className="text-lg text-slate-500">/mês</span>
                  </div>
                  <p className="text-slate-600">Para empresas em crescimento</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Até 10.000 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">3 sessões WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Envio com imagens</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Suporte prioritário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    R$ 199<span className="text-lg text-slate-500">/mês</span>
                  </div>
                  <p className="text-slate-600">Para grandes volumes</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Mensagens ilimitadas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">10 sessões WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">API dedicada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Suporte 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-5 w-5" />
                    <span className="text-slate-600">Gerente de conta</span>
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Escolher Plano
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <MessageCircle className="text-primary text-2xl mr-3" />
                <span className="text-xl font-semibold">CampanhaWhats</span>
              </div>
              <p className="text-slate-400">Plataforma completa para campanhas de WhatsApp marketing.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 CampanhaWhats. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
