import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ isOpen, onClose }: QRModalProps) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<string>("Aguardando conexão...");

  // Fetch QR code when modal opens
  const { data: qrData, isLoading } = useQuery({
    queryKey: ["/api/whatsapp/qr"],
    enabled: isOpen,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Check connection status
  const { data: status } = useQuery({
    queryKey: ["/api/whatsapp/status"],
    enabled: isOpen,
    refetchInterval: 2000, // Check every 2 seconds
  });

  useEffect(() => {
    if (status?.isConnected) {
      setConnectionStatus("Conectado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/status"] });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else if (isOpen) {
      setConnectionStatus("Aguardando conexão...");
    }
  }, [status?.isConnected, isOpen, onClose, queryClient]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Conectar WhatsApp
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <div className="qr-code-container w-48 h-48 rounded-lg flex items-center justify-center mx-auto mb-4">
            {isLoading ? (
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            ) : qrData?.qrCode ? (
              <img 
                src={qrData.qrCode} 
                alt="QR Code" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <QrCode className="text-slate-400 text-6xl" />
            )}
          </div>
          
          <p className="text-slate-600 mb-4">
            Abra o WhatsApp no seu celular e escaneie o QR Code
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            {status?.isConnected ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Conectado!</span>
              </>
            ) : (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>{connectionStatus}</span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
