import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { whatsappService } from "./services/whatsapp";
import { excelService } from "./services/excel";
import { insertCampaignSchema, insertContactSchema } from "@shared/schema";

// MercadoPago setup
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn(
    "Warning: MERCADOPAGO_ACCESS_TOKEN not found, subscription features will be disabled",
  );
}

const mercadopago = process.env.MERCADOPAGO_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
  : null;

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido") as any, false);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // User routes
  app.get("/api/user", requireAuth, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // All routes below this point require authentication

  // Contact Lists routes
  app.post("/api/contact-lists", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, color } = req.body;

      const contactList = await storage.createContactList({
        userId,
        name,
        description,
        color,
      });

      res.json(contactList);
    } catch (error) {
      console.error("Error creating contact list:", error);
      res.status(500).json({ message: "Failed to create contact list" });
    }
  });

  app.get("/api/contact-lists", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contactLists = await storage.getContactLists(userId);
      res.json(contactLists);
    } catch (error) {
      console.error("Error fetching contact lists:", error);
      res.status(500).json({ message: "Failed to fetch contact lists" });
    }
  });

  app.put("/api/contact-lists/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listId = parseInt(req.params.id);
      const updates = req.body;

      const contactList = await storage.updateContactList(listId, updates);
      res.json(contactList);
    } catch (error) {
      console.error("Error updating contact list:", error);
      res.status(500).json({ message: "Failed to update contact list" });
    }
  });

  app.delete("/api/contact-lists/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listId = parseInt(req.params.id);

      const success = await storage.deleteContactList(listId, userId);

      if (!success) {
        return res.status(404).json({ message: "Contact list not found" });
      }

      res.json({ message: "Contact list deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact list:", error);
      res.status(500).json({ message: "Failed to delete contact list" });
    }
  });

  // NOVA ROTA: Obter contatos de uma lista específica
  app.get(
    "/api/contact-lists/contacts/:id",
    requireAuth,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const listId = parseInt(req.params.id);

        // Verifique se a lista pertence ao usuário
        const contactList = await storage.getContactList(listId, userId);
        if (!contactList) {
          return res
            .status(404)
            .json({ message: "Lista de contatos não encontrada" });
        }

        // Obter os contatos da lista
        const contacts = await storage.getContactsInList(listId);
        res.json(contacts);
      } catch (error) {
        console.error("Error fetching contacts in list:", error);
        res.status(500).json({ message: "Erro ao buscar contatos da lista" });
      }
    },
  );

  // NOVA ROTA: Atualizar contatos em uma lista
  app.put(
    "/api/contact-lists/:id/contacts",
    requireAuth,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const listId = parseInt(req.params.id);
        const { contactIds } = req.body;

        // Verifique se a lista pertence ao usuário
        const contactList = await storage.getContactList(listId, userId);
        if (!contactList) {
          return res
            .status(404)
            .json({ message: "Lista de contatos não encontrada" });
        }

        // Verifique se todos os contatos pertencem ao usuário
        const userContacts = await storage.getContacts(userId);
        const userContactIds = userContacts.map((contact) => contact.id);

        const invalidContactIds = contactIds.filter(
          (id) => !userContactIds.includes(id),
        );
        if (invalidContactIds.length > 0) {
          return res.status(400).json({
            message: "Alguns contatos selecionados não pertencem ao usuário",
            invalidIds: invalidContactIds,
          });
        }

        // Atualizar os contatos na lista
        await storage.updateContactsInList(listId, contactIds);

        res.json({
          success: true,
          message: "Contatos da lista atualizados com sucesso",
        });
      } catch (error) {
        console.error("Error updating contacts in list:", error);
        res
          .status(500)
          .json({ message: "Erro ao atualizar contatos da lista" });
      }
    },
  );

  // Campaign routes
  app.get("/api/campaigns", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post(
    "/api/campaigns",
    requireAuth,
    upload.single("image"),
    async (req: any, res) => {
      try {
        const userId = req.user.id;

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }

        // Check trial limitations
        if (user.subscriptionStatus === "trial") {
          const userCampaigns = await storage.getCampaigns(userId);
          if (userCampaigns.length >= 1) {
            return res.status(403).json({
              message:
                "Usuários em teste podem criar apenas 1 campanha. Assine um plano para criar mais.",
            });
          }
        }

        let imageUrl = null;
        if (req.file) {
          // Para simplificar, vamos salvar como base64 ou podemos implementar storage de arquivos
          imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        // Parse scheduled date if provided
        let scheduledAt = null;
        if (req.body.scheduledAt) {
          scheduledAt = new Date(req.body.scheduledAt);
        }

        const campaignData = insertCampaignSchema.parse({
          name: req.body.name,
          message: req.body.message,
          imageUrl,
          delayMin: parseInt(req.body.delayMin) || 6,
          delayMax: parseInt(req.body.delayMax) || 12,
          batchSize: parseInt(req.body.batchSize) || 10,
          batchDelay: parseInt(req.body.batchDelay) || 1,
          contactListId: req.body.contactListId
            ? parseInt(req.body.contactListId)
            : null,
          scheduledAt,
          userId,
        });

        const campaign = await storage.createCampaign(campaignData);
        res.json(campaign);
      } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ message: "Failed to create campaign" });
      }
    },
  );

  app.get("/api/campaigns/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId, userId);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.put(
    "/api/campaigns/:id",
    requireAuth,
    upload.single("image"),
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const campaignId = parseInt(req.params.id);

        // Verify ownership
        const existing = await storage.getCampaign(campaignId, userId);
        if (!existing) {
          return res.status(404).json({ message: "Campaign not found" });
        }

        // Handle image upload
        let imageUrl = existing.imageUrl; // Keep existing image if no new one
        if (req.file) {
          imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        // Parse scheduled date if provided
        let scheduledAt = existing.scheduledAt;
        if (req.body.scheduledAt) {
          scheduledAt = new Date(req.body.scheduledAt);
        }

        const updates = {
          name: req.body.name,
          message: req.body.message,
          imageUrl,
          delayMin: parseInt(req.body.delayMin) || existing.delayMin,
          delayMax: parseInt(req.body.delayMax) || existing.delayMax,
          batchSize: parseInt(req.body.batchSize) || existing.batchSize,
          batchDelay: parseInt(req.body.batchDelay) || existing.batchDelay,
          contactListId: req.body.contactListId
            ? parseInt(req.body.contactListId)
            : existing.contactListId,
          scheduledAt,
        };

        const campaign = await storage.updateCampaign(campaignId, updates);
        res.json(campaign);
      } catch (error) {
        console.error("Error updating campaign:", error);
        res.status(500).json({ message: "Failed to update campaign" });
      }
    },
  );

  app.delete("/api/campaigns/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaignId = parseInt(req.params.id);

      const success = await storage.deleteCampaign(campaignId, userId);

      if (!success) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Contact routes
  app.post(
    "/api/contacts/upload",
    requireAuth,
    upload.single("file"),
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const campaignId = req.body.campaignId
          ? parseInt(req.body.campaignId)
          : undefined;

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Get user to check subscription status
        const user = await storage.getUser(userId);

        const excelContacts = excelService.parseExcelFile(req.file.buffer);
        const { valid, invalid } = excelService.validateContacts(excelContacts);

        if (valid.length === 0) {
          return res.status(400).json({
            message: "No valid contacts found",
            invalid: invalid.length,
          });
        }

        // Check trial limitations
        if (user?.subscriptionStatus !== "active") {
          if (valid.length > 20) {
            return res.status(400).json({
              message:
                "Limite de teste atingido. Usuários em teste podem importar apenas 20 contatos por vez. Assine para contatos ilimitados.",
            });
          }

          // Check total contacts limit
          const existingContacts = await storage.getContacts(userId);
          if (existingContacts.length + valid.length > 20) {
            return res.status(400).json({
              message: `Limite de teste atingido. Você pode ter no máximo 20 contatos. Atualmente você tem ${existingContacts.length} contatos.`,
            });
          }
        }

        const contacts = excelService.convertToContacts(
          valid,
          userId,
          campaignId,
        );
        const createdContacts = await storage.createContacts(contacts);

        // Update campaign total contacts if campaignId is provided
        if (campaignId) {
          await storage.updateCampaign(campaignId, {
            totalContacts: createdContacts.length,
          });
        }

        res.json({
          message: "Contacts uploaded successfully",
          total: createdContacts.length,
          invalid: invalid.length,
          contacts: createdContacts,
        });
      } catch (error) {
        console.error("Error uploading contacts:", error);
        res.status(500).json({ message: "Failed to upload contacts" });
      }
    },
  );

  app.get("/api/contacts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaignId = req.query.campaignId
        ? parseInt(req.query.campaignId)
        : undefined;

      const contacts = await storage.getContacts(userId, campaignId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // WhatsApp routes
  app.get("/api/whatsapp/qr", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const qrCode = await whatsappService.getQRCode(userId);

      res.json({ qrCode });
    } catch (error) {
      console.error("Error getting QR code:", error);
      res.status(500).json({ message: "Failed to get QR code" });
    }
  });

  app.get("/api/whatsapp/status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const session = await storage.getWhatsappSession(userId);
      const isConnected = await whatsappService.checkConnection(userId);

      res.json({
        isConnected,
        session,
      });
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      res.status(500).json({ message: "Failed to check WhatsApp status" });
    }
  });

  app.post("/api/whatsapp/disconnect", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const success = await whatsappService.disconnect(userId);

      res.json({ success });
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      res.status(500).json({ message: "Failed to disconnect WhatsApp" });
    }
  });

  // Campaign send route
  app.post("/api/campaigns/:id/send", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaignId = parseInt(req.params.id);
      const { contactIds } = req.body;

      const campaign = await storage.getCampaign(campaignId, userId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Get selected contacts
      let contacts = await storage.getContacts(userId);
      if (contactIds && contactIds.length > 0) {
        contacts = contacts.filter((contact) =>
          contactIds.includes(contact.id),
        );
      }

      if (contacts.length === 0) {
        return res
          .status(400)
          .json({ message: "No contacts selected for this campaign" });
      }

      // Check WhatsApp connection
      const isConnected = await whatsappService.checkConnection(userId);
      if (!isConnected) {
        return res
          .status(400)
          .json({
            message: "WhatsApp not connected. Please scan the QR code first.",
          });
      }

      // INÍCIO DA MODIFICAÇÃO: Verificar se a campanha tem uma data de agendamento no futuro
      if (campaign.scheduledAt) {
        const scheduledDate = new Date(campaign.scheduledAt);
        const currentDate = new Date();

        // Se a data agendada é no futuro, apenas marcar como "scheduled"
        if (scheduledDate > currentDate) {
          // Atualizar campanha para status "scheduled"
          await storage.updateCampaign(campaignId, {
            status: "scheduled",
            scheduledContacts: contactIds,
          });

          return res.json({
            message: "Campaign scheduled successfully",
            scheduledAt: scheduledDate,
            contactCount: contacts.length,
          });
        }
      }
      // FIM DA MODIFICAÇÃO

      // Update campaign status
      await storage.updateCampaign(campaignId, { status: "sending" });

      // Prepare contacts for bulk send
      const bulkContacts = contacts.map((contact) => ({
        nome: contact.name,
        numero: contact.phone,
      }));

      // Personalize message with contact data
      let message = campaign.message;

      // Send bulk messages
      const result = await whatsappService.sendBulkMessages(
        userId,
        bulkContacts,
        message,
        campaign.imageUrl || undefined,
      );

      // Update campaign with results
      await storage.updateCampaign(campaignId, {
        status: result.success > 0 ? "completed" : "failed",
        sentCount: result.success,
        failedCount: result.failed,
      });

      // Log individual results
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const status = i < result.success ? "sent" : "failed";

        await storage.createCampaignLog({
          campaignId,
          contactId: contact.id,
          status,
          errorMessage: status === "failed" ? result.errors[0] : undefined,
          sentAt: status === "sent" ? new Date() : undefined,
        });

        // Update contact last campaign sent
        if (status === "sent") {
          await storage.updateContact(contact.id, {
            lastCampaignSent: new Date(),
            totalCampaignsSent: (contact.totalCampaignsSent || 0) + 1,
          });
        }
      }

      res.json({
        message: "Campaign sent successfully",
        sent: result.success,
        failed: result.failed,
        errors: result.errors,
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  // INÍCIO DA ADIÇÃO: Nova rota para processar campanhas agendadas
  app.post("/api/campaigns/process-scheduled", async (req, res) => {
    try {
      // Verificar o token de segurança
      const authToken = req.headers.authorization?.split(" ")[1];
      if (authToken !== process.env.SCHEDULER_SECRET_TOKEN) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Buscar todas as campanhas agendadas que já passaram da data
      const now = new Date();
      const scheduledCampaigns = await storage.getScheduledCampaigns(now);

      console.log(
        `Processing ${scheduledCampaigns.length} scheduled campaigns`,
      );

      let processed = 0;

      // Processar cada campanha agendada
      for (const campaign of scheduledCampaigns) {
        try {
          // Obter os contatos para envio
          let contacts = [];
          if (
            campaign.scheduledContacts &&
            campaign.scheduledContacts.length > 0
          ) {
            contacts = await storage.getContactsByIds(
              campaign.scheduledContacts,
            );
          } else {
            contacts = await storage.getContacts(campaign.userId);
          }

          if (contacts.length === 0) {
            await storage.updateCampaign(campaign.id, {
              status: "failed",
              errorMessage: "No contacts found for scheduled campaign",
            });
            continue;
          }

          // Verificar conexão WhatsApp
          const isConnected = await whatsappService.checkConnection(
            campaign.userId,
          );
          if (!isConnected) {
            await storage.updateCampaign(campaign.id, {
              status: "failed",
              errorMessage: "WhatsApp not connected for scheduled campaign",
            });
            continue;
          }

          // Atualizar status para "sending"
          await storage.updateCampaign(campaign.id, { status: "sending" });

          // Preparar contatos para envio
          const bulkContacts = contacts.map((contact) => ({
            nome: contact.name,
            numero: contact.phone,
          }));

          // Enviar mensagens
          const result = await whatsappService.sendBulkMessages(
            campaign.userId,
            bulkContacts,
            campaign.message,
            campaign.imageUrl || undefined,
          );

          // Atualizar resultados
          await storage.updateCampaign(campaign.id, {
            status: result.success > 0 ? "completed" : "failed",
            sentCount: result.success,
            failedCount: result.failed,
          });

          // Log dos resultados individuais
          for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const status = i < result.success ? "sent" : "failed";

            await storage.createCampaignLog({
              campaignId: campaign.id,
              contactId: contact.id,
              status,
              errorMessage: status === "failed" ? result.errors[0] : undefined,
              sentAt: status === "sent" ? new Date() : undefined,
            });

            // Atualizar último envio do contato
            if (status === "sent") {
              await storage.updateContact(contact.id, {
                lastCampaignSent: new Date(),
                totalCampaignsSent: (contact.totalCampaignsSent || 0) + 1,
              });
            }
          }

          processed++;
        } catch (error) {
          console.error(
            `Error processing scheduled campaign ${campaign.id}:`,
            error,
          );
          await storage.updateCampaign(campaign.id, {
            status: "failed",
            errorMessage: "Error processing scheduled campaign",
          });
        }
      }

      res.json({
        message: "Scheduled campaigns processed",
        total: scheduledCampaigns.length,
        processed,
      });
    } catch (error) {
      console.error("Error processing scheduled campaigns:", error);
      res
        .status(500)
        .json({ message: "Failed to process scheduled campaigns" });
    }
  });
  // FIM DA ADIÇÃO

  // MercadoPago routes
  if (mercadopago) {
    app.post("/api/create-subscription", requireAuth, async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (!user.email) {
          return res.status(400).json({ message: "No user email on file" });
        }

        const preApproval = new PreApproval(mercadopago);

        const preApprovalData = {
          reason: "Assinatura CampanhaWhats - Plano Pro",
          payer_email: user.email,
          back_url: `${req.protocol}://${req.hostname}/`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 79.0,
            currency_id: "BRL",
            repetitions: 12,
            free_trial: {
              frequency: 7,
              frequency_type: "days",
            },
          },
        };

        const result = await preApproval.create({ body: preApprovalData });

        if (result.id) {
          await storage.updateUserMercadoPagoInfo(userId, result.id);
        }

        res.json({
          subscriptionId: result.id,
          initPoint: result.init_point,
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Failed to create subscription" });
      }
    });

    // Webhook to handle payment notifications
    app.post("/api/mercadopago/webhook", async (req, res) => {
      try {
        const { type, data } = req.body;

        if (type === "payment" && data?.id) {
          const payment = new Payment(mercadopago);
          const paymentData = await payment.get({ id: data.id });

          if (paymentData.status === "approved") {
            // Update user subscription status
            const userId = paymentData.external_reference;
            if (userId) {
              await storage.updateUserSubscriptionStatus(userId, "active");
            }
          }
        }

        res.status(200).json({ received: true });
      } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Failed to process webhook" });
      }
    });
  }

  // Admin routes
  app.get("/api/admin/users", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
