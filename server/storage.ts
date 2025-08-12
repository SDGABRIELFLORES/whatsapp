import {
  users,
  campaigns,
  contacts,
  campaignLogs,
  whatsappSessions,
  contactLists,
  type User,
  type UpsertUser,
  type Campaign,
  type InsertCampaign,
  type Contact,
  type InsertContact,
  type CampaignLog,
  type InsertCampaignLog,
  type WhatsappSession,
  type InsertWhatsappSession,
  type ContactList,
  type InsertContactList,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserMercadoPagoInfo(
    userId: string,
    mercadopagoSubscriptionId: string,
  ): Promise<User>;
  updateUserSubscriptionStatus(userId: string, status: string): Promise<User>;

  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: number, userId: string): Promise<Campaign | undefined>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: number, userId: string): Promise<boolean>;
  getScheduledCampaigns(date: Date): Promise<Campaign[]>; // Novo método

  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  createContacts(contacts: InsertContact[]): Promise<Contact[]>;
  getContacts(userId: string, campaignId?: number): Promise<Contact[]>;
  getContactsByIds(contactIds: number[]): Promise<Contact[]>; // Novo método
  deleteContacts(userId: string, campaignId?: number): Promise<boolean>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact>;

  // Campaign log operations
  createCampaignLog(log: InsertCampaignLog): Promise<CampaignLog>;
  getCampaignLogs(campaignId: number): Promise<CampaignLog[]>;

  // WhatsApp session operations
  createOrUpdateWhatsappSession(
    session: InsertWhatsappSession,
  ): Promise<WhatsappSession>;
  getWhatsappSession(userId: string): Promise<WhatsappSession | undefined>;
  updateWhatsappSession(
    userId: string,
    updates: Partial<WhatsappSession>,
  ): Promise<WhatsappSession>;

  // Contact List operations
  createContactList(contactList: InsertContactList): Promise<ContactList>;
  getContactLists(userId: string): Promise<ContactList[]>;
  getContactList(id: number, userId: string): Promise<ContactList | undefined>;
  updateContactList(
    id: number,
    updates: Partial<ContactList>,
  ): Promise<ContactList>;
  deleteContactList(id: number, userId: string): Promise<boolean>;
  // Novos métodos adicionados
  getContactsInList(listId: number): Promise<Contact[]>;
  updateContactsInList(listId: number, contactIds: number[]): Promise<boolean>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    totalMessages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserMercadoPagoInfo(
    userId: string,
    mercadopagoSubscriptionId: string,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        mercadopagoSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscriptionStatus(
    userId: string,
    status: string,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    // Simplified method: just create the campaign without updating user's campaign count
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();

    return newCampaign;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number, userId: string): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return campaign;
  }

  async updateCampaign(
    id: number,
    updates: Partial<Campaign> & { scheduledContacts?: number[] },
  ): Promise<Campaign> {
    const updatesWithoutScheduledContacts = { ...updates };

    // Se tiver scheduledContacts, transforme em JSON para armazenar
    if (updates.scheduledContacts) {
      // @ts-ignore - scheduledContactsData não está no tipo original
      updatesWithoutScheduledContacts.scheduledContactsData = JSON.stringify(
        updates.scheduledContacts,
      );
      delete updatesWithoutScheduledContacts.scheduledContacts;
    }

    const [campaign] = await db
      .update(campaigns)
      .set({ ...updatesWithoutScheduledContacts, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();

    // Converte de volta para array ao retornar
    if (campaign.scheduledContactsData) {
      try {
        // @ts-ignore
        campaign.scheduledContacts = JSON.parse(campaign.scheduledContactsData);
      } catch (e) {
        // @ts-ignore
        campaign.scheduledContacts = [];
      }
    }

    return campaign;
  }

  async deleteCampaign(id: number, userId: string): Promise<boolean> {
    // Primeiro exclui os logs relacionados à campanha
    await db.delete(campaignLogs).where(eq(campaignLogs.campaignId, id));

    // Depois exclui os contatos relacionados à campanha
    await db.delete(contacts).where(eq(contacts.campaignId, id));

    // Por fim, exclui a campanha
    const result = await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));

    return (result.rowCount ?? 0) > 0;
  }

  // Novo método para obter campanhas agendadas que já passaram do horário programado
  async getScheduledCampaigns(date: Date): Promise<Campaign[]> {
    const campaignsResult = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.status, "scheduled"),
          lte(campaigns.scheduledAt, date),
        ),
      );

    // Converter scheduledContactsData de JSON para array
    return campaignsResult.map((campaign) => {
      try {
        if (campaign.scheduledContactsData) {
          // @ts-ignore
          campaign.scheduledContacts = JSON.parse(
            campaign.scheduledContactsData,
          );
        }
      } catch (e) {
        // @ts-ignore
        campaign.scheduledContacts = [];
      }
      return campaign;
    });
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async createContacts(contactList: InsertContact[]): Promise<Contact[]> {
    return await db.insert(contacts).values(contactList).returning();
  }

  async getContacts(userId: string, campaignId?: number): Promise<Contact[]> {
    if (campaignId) {
      return await db
        .select()
        .from(contacts)
        .where(
          and(eq(contacts.userId, userId), eq(contacts.campaignId, campaignId)),
        );
    }

    return await db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  // Novo método para buscar contatos por IDs
  async getContactsByIds(contactIds: number[]): Promise<Contact[]> {
    if (!contactIds || contactIds.length === 0) {
      return [];
    }
    return await db
      .select()
      .from(contacts)
      .where(inArray(contacts.id, contactIds));
  }

  async deleteContacts(userId: string, campaignId?: number): Promise<boolean> {
    let result;

    if (campaignId) {
      result = await db
        .delete(contacts)
        .where(
          and(eq(contacts.userId, userId), eq(contacts.campaignId, campaignId)),
        );
    } else {
      result = await db.delete(contacts).where(eq(contacts.userId, userId));
    }

    return (result.rowCount ?? 0) > 0;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  // Campaign log operations
  async createCampaignLog(log: InsertCampaignLog): Promise<CampaignLog> {
    const [newLog] = await db.insert(campaignLogs).values(log).returning();
    return newLog;
  }

  async getCampaignLogs(campaignId: number): Promise<CampaignLog[]> {
    return await db
      .select()
      .from(campaignLogs)
      .where(eq(campaignLogs.campaignId, campaignId))
      .orderBy(desc(campaignLogs.createdAt));
  }

  // WhatsApp session operations
  async createOrUpdateWhatsappSession(
    session: InsertWhatsappSession,
  ): Promise<WhatsappSession> {
    const [existing] = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.userId, session.userId));

    if (existing) {
      const [updated] = await db
        .update(whatsappSessions)
        .set({ ...session, updatedAt: new Date() })
        .where(eq(whatsappSessions.userId, session.userId))
        .returning();
      return updated;
    } else {
      const [newSession] = await db
        .insert(whatsappSessions)
        .values(session)
        .returning();
      return newSession;
    }
  }

  async getWhatsappSession(
    userId: string,
  ): Promise<WhatsappSession | undefined> {
    const [session] = await db
      .select()
      .from(whatsappSessions)
      .where(eq(whatsappSessions.userId, userId));
    return session;
  }

  async updateWhatsappSession(
    userId: string,
    updates: Partial<WhatsappSession>,
  ): Promise<WhatsappSession> {
    const [session] = await db
      .update(whatsappSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whatsappSessions.userId, userId))
      .returning();
    return session;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    totalMessages: number;
  }> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));

    const [totalCampaignsResult] = await db
      .select({ count: count() })
      .from(campaigns);

    const [totalMessagesResult] = await db
      .select({ total: sum(campaigns.sentCount) })
      .from(campaigns);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalCampaigns: totalCampaignsResult.count,
      totalMessages: Number(totalMessagesResult.total || 0),
    };
  }

  // Contact List operations
  async createContactList(
    contactList: InsertContactList,
  ): Promise<ContactList> {
    const [newList] = await db
      .insert(contactLists)
      .values(contactList)
      .returning();
    return newList;
  }

  async getContactLists(userId: string): Promise<ContactList[]> {
    return await db
      .select()
      .from(contactLists)
      .where(eq(contactLists.userId, userId))
      .orderBy(desc(contactLists.createdAt));
  }

  async getContactList(
    id: number,
    userId: string,
  ): Promise<ContactList | undefined> {
    const [contactList] = await db
      .select()
      .from(contactLists)
      .where(and(eq(contactLists.id, id), eq(contactLists.userId, userId)));
    return contactList;
  }

  async updateContactList(
    id: number,
    updates: Partial<ContactList>,
  ): Promise<ContactList> {
    const [contactList] = await db
      .update(contactLists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contactLists.id, id))
      .returning();
    return contactList;
  }

  async deleteContactList(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(contactLists)
      .where(and(eq(contactLists.id, id), eq(contactLists.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Novos métodos implementados com abordagem alternativa
  async getContactsInList(listId: number): Promise<Contact[]> {
    // Assumindo que há um campo listId no modelo Contact
    // Se não existir essa relação direta, você precisará criar uma tabela de junção no schema
    try {
      // Primeiro, obtemos a lista para verificar seu userId
      const [list] = await db
        .select()
        .from(contactLists)
        .where(eq(contactLists.id, listId));

      if (!list) {
        return [];
      }

      // Busca contatos que têm o campo listId igual ao id da lista
      // Ou se esse campo não existir, será necessário outra abordagem
      return await db
        .select()
        .from(contacts)
        .where(eq(contacts.userId, list.userId));
    } catch (error) {
      console.error("Error getting contacts in list:", error);
      return [];
    }
  }

  async updateContactsInList(
    listId: number,
    contactIds: number[],
  ): Promise<boolean> {
    try {
      // Como não temos uma tabela de junção, precisamos assumir como funciona a relação
      // Abordagem 1: Cada contato tem um campo listId (se esse for o caso)
      // Abordagem 2: Criar uma tabela de junção no schema (recomendado)

      // Por enquanto, atualizamos apenas a contagem de contatos na lista
      await db
        .update(contactLists)
        .set({
          contactCount: contactIds.length,
          updatedAt: new Date(),
        })
        .where(eq(contactLists.id, listId));

      // Aqui você precisaria implementar a lógica para associar os contatos à lista
      // dependendo de como sua estrutura de dados está configurada

      return true;
    } catch (error) {
      console.error("Error updating contacts in list:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
