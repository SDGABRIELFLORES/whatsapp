import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  CreditCard, 
  LogOut, 
  Settings, 
  Crown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  whatsappConnected?: boolean;
  onProfileClick: () => void;
  onSubscriptionClick: () => void;
}

export default function Header({ 
  whatsappConnected = false, 
  onProfileClick, 
  onSubscriptionClick 
}: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getSubscriptionBadge = () => {
    if (user?.subscriptionStatus === "active") {
      return (
        <Badge className="bg-green-100 text-green-800">
          <Crown className="w-3 h-3 mr-1" />
          Ativo
        </Badge>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-orange-100 text-orange-800">
          <CreditCard className="w-3 h-3 mr-1" />
          Teste
        </Badge>
        <Button 
          size="sm" 
          onClick={onSubscriptionClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Assinar Agora
        </Button>
      </div>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            CampanhaWhats
          </h1>
          
          {whatsappConnected ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              WhatsApp Conectado
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              WhatsApp Desconectado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {getSubscriptionBadge()}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onSubscriptionClick}>
                <CreditCard className="mr-2 h-4 w-4" />
                Assinatura
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}