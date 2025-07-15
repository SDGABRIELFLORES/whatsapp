import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, DollarSign, NotebookPen, Headphones, Bell, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/stats-card";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Fetch admin stats
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const monthlyRevenue = stats.activeUsers * 79; // Assuming average Pro plan price

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="admin-header text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-white text-2xl mr-3" />
              <span className="text-xl font-semibold">Painel Administrativo</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-red-500 text-white">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">Admin</span>
              </div>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => window.location.href = "/"}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
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
        {/* Admin Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Usuários Ativos"
            value={stats.activeUsers?.toString() || "0"}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Receita Mensal"
            value={`R$ ${monthlyRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6" />}
            valueColor="text-primary"
          />
          <StatsCard
            title="Mensagens Enviadas"
            value={stats.totalMessages?.toString() || "0"}
            icon={<NotebookPen className="h-6 w-6" />}
          />
          <StatsCard
            title="Suporte Pendente"
            value="7"
            icon={<Headphones className="h-6 w-6" />}
            valueColor="text-amber-600"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Usuários
              </CardTitle>
              <Button className="bg-primary text-white hover:bg-primary/90">
                Adicionar Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback className="bg-primary text-white">
                              {user.firstName?.[0] || user.email?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.email
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.subscriptionPlan === 'pro' ? 'default' : 'secondary'}>
                          {user.subscriptionPlan === 'pro' ? 'Pro' : 'Básico'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                        >
                          {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
