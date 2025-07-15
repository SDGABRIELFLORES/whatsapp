import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Smartphone,
  Plus,
  BarChart3,
  AlertCircle,
  Zap
} from "lucide-react";
import CampaignForm from "@/components/campaign-form";
import QRModal from "@/components/qr-modal";
import StatsCard from "@/components/stats-card";
import FeatureShowcase from "@/components/feature-showcase";
import Header from "@/components/header";
import Profile from "@/pages/profile";
import Subscribe from "@/pages/subscribe";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "profile" | "subscription">("dashboard");

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  // Check WhatsApp status
  const { data: whatsappStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    refetchInterval: 5000,
  });

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const totalContacts = contacts.length;
  const totalSent = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.sentCount || 0), 0);
  const totalFailed = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.failedCount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "sending":
        return "Enviando";
      case "failed":
        return "Falhou";
      default:
        return "Rascunho";
    }
  };

  // Handle navigation
  if (currentView === "profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          whatsappConnected={whatsappStatus?.isConnected}
          onProfileClick={() => setCurrentView("profile")}
          onSubscriptionClick={() => setCurrentView("subscription")}
        />
        <Profile 
          onBack={() => setCurrentView("dashboard")}
          onSubscriptionClick={() => setCurrentView("subscription")}
        />
      </div>
    );
  }

  if (currentView === "subscription") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          whatsappConnected={whatsappStatus?.isConnected}
          onProfileClick={() => setCurrentView("profile")}
          onSubscriptionClick={() => setCurrentView("subscription")}
        />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setCurrentView("dashboard")}>
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold">Assinatura</h1>
          </div>
          <Subscribe />
        </div>
      </div>
    );
  }

  if (showCampaignForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          whatsappConnected={whatsappStatus?.isConnected}
          onProfileClick={() => setCurrentView("profile")}
          onSubscriptionClick={() => setCurrentView("subscription")}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Nova Campanha</h1>
            <Button variant="outline" onClick={() => setShowCampaignForm(false)}>
              Voltar
            </Button>
          </div>
          <CampaignForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        whatsappConnected={whatsappStatus?.isConnected}
        onProfileClick={() => setCurrentView("profile")}
        onSubscriptionClick={() => setCurrentView("subscription")}
      />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Gerencie suas campanhas de WhatsApp</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Connect WhatsApp */}
            {!whatsappStatus?.isConnected && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-800">
                        Conecte seu WhatsApp
                      </h3>
                      <p className="text-sm text-orange-700">
                        Escaneie o QR code para começar a enviar campanhas
                      </p>
                    </div>
                    <Button onClick={() => setShowQRModal(true)}>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Conectar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total de Campanhas"
                value={totalCampaigns.toString()}
                icon={<MessageSquare className="w-5 h-5" />}
              />
              <StatsCard
                title="Total de Contatos"
                value={totalContacts.toString()}
                icon={<Users className="w-5 h-5" />}
              />
              <StatsCard
                title="Mensagens Enviadas"
                value={totalSent.toString()}
                icon={<Send className="w-5 h-5" />}
                valueColor="text-green-600"
              />
              <StatsCard
                title="Mensagens Falharam"
                value={totalFailed.toString()}
                icon={<XCircle className="w-5 h-5" />}
                valueColor="text-red-600"
              />
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Campanhas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500">Carregando campanhas...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhuma campanha criada ainda</p>
                    <Button 
                      onClick={() => setShowCampaignForm(true)}
                      disabled={!whatsappStatus?.isConnected}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Campanha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign: any) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">
                            {campaign.sentCount || 0} enviadas de {campaign.totalContacts || 0} contatos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowCampaignForm(true)}
                    className="h-auto p-4 justify-start"
                    disabled={!whatsappStatus?.isConnected}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Nova Campanha</div>
                      <div className="text-sm opacity-90">
                        Criar e enviar mensagens em massa
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowQRModal(true)}
                    className="h-auto p-4 justify-start"
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Conectar WhatsApp</div>
                      <div className="text-sm opacity-90">
                        Escaneie o QR code para conectar
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Minhas Campanhas</h2>
              <Button
                onClick={() => setShowCampaignForm(true)}
                disabled={!whatsappStatus?.isConnected}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            {!whatsappStatus?.isConnected && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Conecte seu WhatsApp para criar campanhas
                  </span>
                </div>
              </div>
            )}

            {campaignsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Carregando campanhas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign: any) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{campaign.name}</span>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {campaign.message}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {campaign.sentCount || 0} / {campaign.totalContacts || 0} enviadas
                          </span>
                          <span className="text-gray-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeatureShowcase />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Meus Contatos</h2>
              <div className="text-sm text-gray-500">
                {contacts.length} contatos cadastrados
              </div>
            </div>

            {contactsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Carregando contatos...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum contato cadastrado</p>
                <p className="text-sm text-gray-400">
                  Faça upload de uma planilha Excel na criação de campanhas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact: any) => (
                  <Card key={contact.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        {contact.email && (
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {contact.totalCampaignsSent || 0} campanhas recebidas
                          </span>
                          {contact.lastCampaignSent && (
                            <span>
                              Último: {new Date(contact.lastCampaignSent).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      </div>
    </div>
  );
}