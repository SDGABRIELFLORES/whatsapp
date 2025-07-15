import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Smartphone, CheckCircle, X, RefreshCw } from "lucide-react";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const [connected, setConnected] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const queryClient = useQueryClient();

  const [userId] = useState(() => {
    // Obter userId do localStorage ou gerar um novo
    const saved = localStorage.getItem("whatsapp_user_id");
    if (saved) return saved;

    // Gerar um novo ID se não existir
    const newId = `user_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("whatsapp_user_id", newId);
    return newId;
  });

  // Get QR code
  const {
    data: qrData,
    isLoading: qrLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/whatsapp/qr", userId, refreshTrigger],
    queryFn: async () => {
      console.log("Buscando QR code para userId:", userId);
      const response = await fetch(`/api/whatsapp/qr?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("QR code response:", data);
      return data?.qrCode;
    },
    enabled: isOpen && !connected,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Check connection status
  const { data: connectionData, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/whatsapp/status", userId, refreshTrigger],
    queryFn: async () => {
      const response = await fetch(`/api/whatsapp/status?userId=${userId}`);
      if (!response.ok) {
        return { isConnected: false };
      }

      const data = await response.json();
      console.log("Status response:", data);
      return data;
    },
    enabled: isOpen,
    refetchInterval: 2000, // Check every 2 seconds
  });

  useEffect(() => {
    if (connectionData?.isConnected) {
      setConnected(true);
      // Removida a chamada toast.success que causou o erro

      // Close modal after 1.5 seconds if connected
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [connectionData, onClose]);

  const handleClose = () => {
    setConnected(false);
    onClose();
  };

  // Função para forçar a atualização do QR code
  const handleRefreshQR = () => {
    console.log("Forçando atualização do QR code");
    setRefreshTrigger((prev) => prev + 1); // Incrementa o contador para forçar refetch
    refetch(); // Dispara a atualização imediatamente
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Conectar WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {connected || connectionData?.isConnected ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700">
                WhatsApp Conectado!
              </h3>
              <p className="text-gray-600">
                Sua conta foi conectada com sucesso.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  {qrLoading || statusLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-gray-600">Gerando código QR...</p>
                    </div>
                  ) : qrData ? (
                    <div className="flex flex-col items-center space-y-4">
                      <img
                        src={qrData}
                        alt="QR Code"
                        className="w-48 h-48 border rounded-lg"
                        onError={() => {
                          console.error("Erro ao carregar imagem QR");
                          handleRefreshQR();
                        }}
                      />
                      <p className="text-sm text-gray-600">
                        Escaneie o código QR com seu WhatsApp
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshQR}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar QR
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <X className="w-8 h-8 text-red-500" />
                      <p className="text-red-600">Erro ao gerar QR code.</p>
                      <Button
                        onClick={handleRefreshQR}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-left space-y-2">
                  <h4 className="font-medium">Como conectar:</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Vá em Menu → Aparelhos conectados</li>
                    <li>3. Toque em "Conectar um aparelho"</li>
                    <li>4. Aponte a câmera para o código QR</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
