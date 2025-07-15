import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Smartphone, CheckCircle, X } from "lucide-react";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const [connected, setConnected] = useState(false);

  // Get QR code
  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ["/api/whatsapp/qr"],
    enabled: isOpen && !connected,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Check connection status
  const { data: statusData } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    enabled: isOpen,
    refetchInterval: 2000, // Check every 2 seconds
  });

  useEffect(() => {
    if (statusData?.isConnected) {
      setConnected(true);
      // Close modal after 2 seconds if connected
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [statusData, onClose]);

  const handleClose = () => {
    setConnected(false);
    onClose();
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
          {connected ? (
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
                  {qrLoading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-gray-600">Gerando código QR...</p>
                    </div>
                  ) : qrData?.qrCode ? (
                    <div className="flex flex-col items-center space-y-4">
                      <img 
                        src={qrData.qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48 border rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        Escaneie o código QR com seu WhatsApp
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <X className="w-8 h-8 text-red-500" />
                      <p className="text-red-600">
                        Erro ao gerar QR code. Tente novamente.
                      </p>
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