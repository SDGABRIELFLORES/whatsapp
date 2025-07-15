import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Crown, CheckCircle, ArrowLeft, CreditCard, Shield } from "lucide-react";

export default function Subscribe() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const handleCreateSubscription = async () => {
    if (!user) return;

    setIsCreatingSubscription(true);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription");
      const data = await response.json();
      
      if (data.initPoint) {
        // Redirect to MercadoPago payment page
        window.location.href = data.initPoint;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a assinatura. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi deslogado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Erro",
        description: "Erro ao criar assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageCircle className="text-primary text-2xl mr-3" />
              <span className="text-xl font-semibold text-slate-900">CampanhaWhats</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Assine o Plano Pro
          </h1>
          <p className="text-xl text-slate-600">
            Desbloqueie todas as funcionalidades da plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Plano Pro
              </CardTitle>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  R$ 79<span className="text-xl text-slate-500">/mês</span>
                </div>
                <p className="text-slate-600">Para empresas em crescimento</p>
                <div className="mt-2 text-sm text-green-600 font-medium">
                  7 dias grátis para testar
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Até 10.000 mensagens por mês</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Até 3 sessões do WhatsApp</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Envio de mensagens com imagens</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Relatórios avançados de campanha</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Configurações avançadas anti-ban</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="text-slate-700">Personalização avançada de mensagens</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <img 
                      src="https://logosmarcas.net/wp-content/uploads/2020/04/Mercado-Pago-Logo.png" 
                      alt="Mercado Pago" 
                      className="h-8"
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    Pagamento seguro processado pelo Mercado Pago
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Plano Pro (mensal)</span>
                    <span className="font-semibold">R$ 79,00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Período grátis</span>
                    <span className="font-semibold text-green-600">7 dias</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total hoje</span>
                      <span className="text-2xl font-bold text-green-600">R$ 0,00</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Você será cobrado R$ 79,00 após 7 dias
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateSubscription}
                  disabled={isCreatingSubscription}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
                  size="lg"
                >
                  {isCreatingSubscription ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Criando assinatura...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Iniciar Período Grátis
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                  <Shield className="h-4 w-4" />
                  <span>Dados protegidos com criptografia SSL</span>
                </div>
                <p className="text-xs text-slate-500">
                  Você pode cancelar a qualquer momento sem custo adicional
                </p>
                <p className="text-xs text-slate-500">
                  Aceita: Cartão de crédito, débito, Pix, boleto bancário
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Compare os Planos
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-center">Plano Básico</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    Gratuito
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-4 w-4" />
                    <span className="text-sm">Até 100 mensagens por mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-4 w-4" />
                    <span className="text-sm">1 sessão do WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-4 w-4" />
                    <span className="text-sm">Mensagens apenas de texto</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3 h-4 w-4" />
                    <span className="text-sm">Relatórios básicos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center">Plano Pro</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    R$ 79<span className="text-lg">/mês</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Até 10.000 mensagens por mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Até 3 sessões do WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Mensagens com imagens</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Configurações anti-ban</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-primary mr-3 h-4 w-4" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}