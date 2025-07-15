import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, NotebookPen, CheckCircle, Megaphone, Users, Bell, Crown, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import CampaignForm from "@/components/campaign-form";
import StatsCard from "@/components/stats-card";
import QRModal from "@/components/qr-modal";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
  });

  // Fetch WhatsApp status
  const { data: whatsappStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    enabled: !!user,
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Disconnect WhatsApp mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/whatsapp/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Erro ao desconectar WhatsApp",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isConnected = whatsappStatus?.isConnected || false;
  const totalMessages = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.sentCount || 0), 0);
  const activeCampaigns = campaigns.filter((campaign: any) => campaign.status === "sending").length;
  const totalContacts = campaigns.reduce((sum: number, campaign: any) => sum + (campaign.totalContacts || 0), 0);
  const deliveryRate = totalMessages > 0 ? ((totalMessages / totalContacts) * 100).toFixed(1) : "0";

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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-primary text-white">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-700 font-medium">
                  {user.firstName || user.email}
                </span>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/api/logout"}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Mensagens Enviadas"
            value={totalMessages.toString()}
            icon={<NotebookPen className="h-6 w-6" />}
          />
          <StatsCard
            title="Taxa de Entrega"
            value={`${deliveryRate}%`}
            icon={<CheckCircle className="h-6 w-6" />}
            valueColor="text-primary"
          />
          <StatsCard
            title="Campanhas Ativas"
            value={activeCampaigns.toString()}
            icon={<Megaphone className="h-6 w-6" />}
          />
          <StatsCard
            title="Contatos"
            value={totalContacts.toString()}
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaign Creator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Nova Campanha
                </CardTitle>
                
                {/* WhatsApp Connection Status */}
                <div className={`p-4 rounded-lg border ${
                  isConnected 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isConnected ? (
                        <Wifi className="text-green-500 mr-2 h-5 w-5" />
                      ) : (
                        <WifiOff className="text-red-500 mr-2 h-5 w-5" />
                      )}
                      <span className={`font-medium ${
                        isConnected ? 'text-green-700' : 'text-red-700'
                      }`}>
                        WhatsApp {isConnected ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                    {isConnected ? (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectMutation.mutate()}
                        disabled={disconnectMutation.isPending}
                      >
                        Desconectar
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => setShowQRModal(true)}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CampaignForm />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Campanhas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : campaigns.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    Nenhuma campanha criada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map((campaign: any) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{campaign.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={campaign.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {campaign.status === 'completed' ? 'Concluído' : 
                           campaign.status === 'sending' ? 'Enviando' : 
                           campaign.status === 'draft' ? 'Rascunho' : 'Falhado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="text-white text-2xl" />
                  </div>
                  <p className="font-medium text-slate-900 mb-2">
                    Plano {user.subscriptionPlan === 'active' ? 'Pro' : 'Básico'}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Status: {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    onClick={() => window.location.href = "/subscribe"}
                  >
                    Gerenciar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      <QRModal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
      />
    </div>
  );
}
