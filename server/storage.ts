import {
  users,
  campaigns,
  contacts,
  campaignLogs,
  whatsappSessions,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum } from "drizzle-orm";

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

  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  createContacts(contacts: InsertContact[]): Promise<Contact[]>;
  getContacts(userId: string, campaignId?: number): Promise<Contact[]>;
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
    updates: Partial<Campaign>,
  ): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
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
}

export const storage = new DatabaseStorage();
