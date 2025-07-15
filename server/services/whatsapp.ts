export class WhatsAppService {
  private readonly apiUrl = "https://campanhawhats.onrender.com";

  async getQRCode(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/connect?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // A API agora retorna JSON
      const data = await response.json();

      // Se já está conectado
      if (data.isConnected === true || data.connected === true) {
        return null;
      }

      // Retorna o QR Code base64 se estiver disponível
      return data.qrCode || null;
    } catch (error) {
      console.error("Erro ao obter QR Code:", error);
      return null;
    }
  }

  async checkConnection(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/?userId=${userId}`);
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isConnected === true;
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      return false;
    }
  }

  async sendMessage(
    userId: string,
    number: string,
    message: string,
  ): Promise<boolean> {
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
      console.error("Erro ao enviar mensagem:", error);
      return false;
    }
  }

  async sendBulkMessages(
    userId: string,
    contacts: Array<{ nome: string; numero: string }>,
    mensagemBase: string,
    imagemUrl?: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const response = await fetch(`${this.apiUrl}/send-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          contatos: contacts,
          mensagemBase,
          imagemUrl,
          antiBanSettings: {
            randomDelayMin: 6000,
            randomDelayMax: 9000,
            batchSize: 10,
            batchDelayMs: 60000,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.enviados || 0,
          failed: (data.total || 0) - (data.enviados || 0),
          errors: data.erros?.map((e) => `${e.nome}: ${e.erro}`) || [],
        };
      }

      const errorText = await response.text();
      return {
        success: 0,
        failed: contacts.length,
        errors: [errorText],
      };
    } catch (error) {
      console.error("Erro ao enviar mensagens em lote:", error);
      return {
        success: 0,
        failed: contacts.length,
        errors: [error.message],
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
      console.error("Erro ao desconectar:", error);
      return false;
    }
  }

  async getSessions(): Promise<
    Array<{ userId: string; isConnected: boolean; hasQrCode: boolean }>
  > {
    try {
      const response = await fetch(`${this.apiUrl}/sessions`);
      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao obter sessões:", error);
      return [];
    }
  }
}

export const whatsappService = new WhatsAppService();
