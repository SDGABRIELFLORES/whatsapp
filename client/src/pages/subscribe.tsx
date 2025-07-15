import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  MessageSquare, 
  Users, 
  Image, 
  BarChart3, 
  HeadphonesIcon,
  Clock,
  Building
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 29",
    period: "/mês",
    description: "Ideal para começar",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Até 1.000 mensagens/mês",
      "1 sessão WhatsApp",
      "Upload de planilha",
      "Relatórios básicos"
    ],
    recommended: false,
    color: "border-gray-200"
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 79",
    period: "/mês",
    description: "Para empresas em crescimento",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Até 10.000 mensagens/mês",
      "3 sessões WhatsApp",
      "Envio com imagens",
      "Relatórios avançados",
      "Suporte prioritário"
    ],
    recommended: true,
    color: "border-blue-500"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R$ 199",
    period: "/mês",
    description: "Para grandes volumes",
    icon: <Building className="w-6 h-6" />,
    features: [
      "Mensagens ilimitadas",
      "10 sessões WhatsApp",
      "API dedicada",
      "Suporte 24/7",
      "Gerente de conta"
    ],
    recommended: false,
    color: "border-purple-500"
  }
];

const featureIcons = {
  "mensagens": <MessageSquare className="w-4 h-4" />,
  "sessão": <Users className="w-4 h-4" />,
  "upload": <Image className="w-4 h-4" />,
  "relatórios": <BarChart3 className="w-4 h-4" />,
  "suporte": <HeadphonesIcon className="w-4 h-4" />,
  "api": <Shield className="w-4 h-4" />,
  "gerente": <Crown className="w-4 h-4" />
};

const getFeatureIcon = (feature: string) => {
  const key = Object.keys(featureIcons).find(k => feature.toLowerCase().includes(k));
  return key ? featureIcons[key as keyof typeof featureIcons] : <Check className="w-4 h-4" />;
};

export default function Subscribe() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);
    
    try {
      // Integração com Mercado Pago
      const response = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Erro ao criar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Escolha seu Plano</h1>
        <p className="text-gray-600 text-lg">
          Selecione o plano ideal para suas necessidades de campanhas WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.color} ${plan.recommended ? 'ring-2 ring-blue-500' : ''}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  Recomendado
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="text-green-500">
                      {getFeatureIcon(feature)}
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handlePlanSelect(plan.id)}
                disabled={loading && selectedPlan === plan.id}
                className={`w-full ${plan.recommended ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
              >
                {loading && selectedPlan === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processando...
                  </div>
                ) : (
                  "Assinar Agora"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-center">Pagamento Seguro</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <svg width="120" height="40" viewBox="0 0 120 40" className="h-8">
                <rect width="120" height="40" fill="#00B3E6" rx="4"/>
                <text x="60" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  MercadoPago
                </text>
              </svg>
              <span className="text-sm text-gray-600">Pagamento processado pelo Mercado Pago</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Seus dados estão protegidos com criptografia SSL. 
            Aceita cartão de crédito, débito e PIX.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold mb-4">Dúvidas Frequentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Posso cancelar a qualquer momento?</h4>
            <p className="text-sm text-gray-600">
              Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Como funciona o período de teste?</h4>
            <p className="text-sm text-gray-600">
              Novos usuários têm 7 dias gratuitos para testar todas as funcionalidades.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Posso mudar de plano depois?</h4>
            <p className="text-sm text-gray-600">
              Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Como funciona o suporte?</h4>
            <p className="text-sm text-gray-600">
              Suporte por email para todos os planos, com prioridade para planos Pro e Enterprise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}