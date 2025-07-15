import { storage } from "../storage";

const WHATSAPP_API_BASE = "https://campanhawhats.onrender.com";

export class WhatsAppService {
  async getQRCode(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/connect?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract QR code from HTML response
      const qrMatch = html.match(/<img[^>]*src="([^"]*qr[^"]*)"[^>]*>/i);
      const qrCode = qrMatch ? qrMatch[1] : null;
      
      // Update session with QR code
      await storage.createOrUpdateWhatsappSession({
        userId,
        sessionId: userId,
        qrCode,
        isConnected: false,
      });
      
      return qrCode;
    } catch (error) {
      console.error("Error getting QR code:", error);
      return null;
    }
  }

  async checkConnection(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/?userId=${userId}`);
      
      if (!response.ok) {
        return false;
      }
      
      const html = await response.text();
      const isConnected = html.includes("conectado") || html.includes("connected");
      
      // Update session status
      await storage.updateWhatsappSession(userId, {
        isConnected,
        lastConnected: isConnected ? new Date() : undefined,
      });
      
      return isConnected;
    } catch (error) {
      console.error("Error checking connection:", error);
      return false;
    }
  }

  async sendMessage(userId: string, number: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          number,
          message,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  async sendBulkMessages(
    userId: string,
    contacts: Array<{ nome: string; numero: string }>,
    message: string,
    imageUrl?: string,
    antiBanSettings?: {
      randomDelayMin: number;
      randomDelayMax: number;
      batchSize: number;
      batchDelayMs: number;
    }
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/send-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          contatos: contacts,
          mensagemBase: message,
          imagemUrl: imageUrl,
          antiBanSettings: antiBanSettings || {
            randomDelayMin: 6000,
            randomDelayMax: 12000,
            batchSize: 10,
            batchDelayMs: 60000,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        sent: result.enviados || 0,
        failed: result.falhas || 0,
        errors: result.erros || [],
      };
    } catch (error) {
      console.error("Error sending bulk messages:", error);
      return {
        success: false,
        sent: 0,
        failed: contacts.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  async disconnect(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        // Update session status
        await storage.updateWhatsappSession(userId, {
          isConnected: false,
          qrCode: null,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error disconnecting:", error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
