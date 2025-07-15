import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, List, Clock, Users, Shield } from "lucide-react";

export default function FeatureShowcase() {
  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Limitações de Teste",
      description: "Usuários em teste podem criar apenas 1 campanha com máximo 20 contatos",
      status: "implemented",
      color: "bg-orange-100 text-orange-800"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Agendamento de Campanhas",
      description: "Agende campanhas para datas específicas no fuso horário de Brasília (UTC-3)",
      status: "implemented",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <List className="w-5 h-5" />,
      title: "Listas de Contatos Personalizadas",
      description: "Crie listas como 'Recorrentes' ou 'Inativos' para organizar seus contatos",
      status: "implemented",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Período de Teste",
      description: "Badge mostra 'Teste até: X dias' com contagem regressiva",
      status: "implemented",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Importação com Limite",
      description: "Upload de Excel/CSV respeitando limite de 20 contatos para usuários teste",
      status: "implemented",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Funcionalidades Implementadas
        </h2>
        <p className="text-gray-600">
          Novas funcionalidades do sistema de campanhas WhatsApp
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                {feature.icon}
                <Badge className={feature.color}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Implementado
                </Badge>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Funcionalidades Ativas</h3>
        </div>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Sistema de teste com limitações de 1 campanha e 20 contatos</li>
          <li>• Agendamento de campanhas para horários específicos</li>
          <li>• Listas de contatos personalizadas (Recorrentes, Inativos, etc.)</li>
          <li>• Contador de dias restantes no período de teste</li>
          <li>• Validação de limites na importação de contatos</li>
        </ul>
      </div>
    </div>
  );
}