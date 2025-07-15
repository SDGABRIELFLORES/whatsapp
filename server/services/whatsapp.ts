export class WhatsAppService {
  private readonly apiUrl = "https://campanhawhats.onrender.com";

  async getQRCode(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/connect?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      // Extract QR code from HTML if present
      const qrMatch = html.match(/<img[^>]+src="([^"]+)"/);
      if (qrMatch) {
        return qrMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error("Error getting QR code:", error);
      return null;
    }
  }

  async checkConnection(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/?userId=${userId}`);
      if (!response.ok) {
        return false;
      }
      
      const html = await response.text();
      return html.includes("conectado") || html.includes("connected");
    } catch (error) {
      console.error("Error checking connection:", error);
      return false;
    }
  }

  async sendMessage(userId: string, number: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/send`, {
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
    contacts: { nome: string; numero: string }[],
    message: string,
    imageUrl?: string,
    options?: {
      randomDelayMin?: number;
      randomDelayMax?: number;
      batchSize?: number;
      batchDelayMs?: number;
    }
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const payload = {
        userId,
        contatos: contacts,
        mensagemBase: message,
        imagemUrl: imageUrl,
        antiBanSettings: {
          randomDelayMin: options?.randomDelayMin || 6000,
          randomDelayMax: options?.randomDelayMax || 12000,
          batchSize: options?.batchSize || 10,
          batchDelayMs: options?.batchDelayMs || 60000,
        },
      };

      const response = await fetch(`${this.apiUrl}/send-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        sent: result.sent || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error("Error sending bulk messages:", error);
      return {
        success: false,
        sent: 0,
        failed: contacts.length,
        errors: [(error as Error).message],
      };
    }
  }

  async disconnect(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error("Error disconnecting:", error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();