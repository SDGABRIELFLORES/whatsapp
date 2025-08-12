import { supabase } from "./db";
import type {
  User,
  UpsertUser,
  Campaign,
  InsertCampaign,
  Contact,
  InsertContact,
  CampaignLog,
  InsertCampaignLog,
  WhatsappSession,
  InsertWhatsappSession,
  ContactList,
  InsertContactList,
} from "@shared/schema";

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
  getScheduledCampaigns(date: Date): Promise<Campaign[]>;

  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  createContacts(contacts: InsertContact[]): Promise<Contact[]>;
  getContacts(userId: string, campaignId?: number): Promise<Contact[]>;
  getContactsByIds(contactIds: number[]): Promise<Contact[]>;
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

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      console.error('Error fetching user by email:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    
    return data as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error upserting user: ${error.message}`);
    }
    
    return data as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
    
    return data as User;
  }

  async updateUserMercadoPagoInfo(
    userId: string,
    mercadopagoSubscriptionId: string,
  ): Promise<User> {
    return this.updateUser(userId, {
      mercadopagoSubscriptionId,
    });
  }

  async updateUserSubscriptionStatus(
    userId: string,
    status: string,
  ): Promise<User> {
    return this.updateUser(userId, {
      subscriptionStatus: status,
    });
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating campaign: ${error.message}`);
    }
    
    return data as Campaign;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching campaigns: ${error.message}`);
    }
    
    return data as Campaign[];
  }

  async getCampaign(id: number, userId: string): Promise<Campaign | undefined> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error fetching campaign:', error);
      return undefined;
    }
    
    return data as Campaign;
  }

  async updateCampaign(
    id: number,
    updates: Partial<Campaign> & { scheduledContacts?: number[] },
  ): Promise<Campaign> {
    const updateData = { ...updates };
    
    if (updates.scheduledContacts) {
      updateData.scheduledContactsData = JSON.stringify(updates.scheduledContacts);
      delete updateData.scheduledContacts;
    }
    
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating campaign: ${error.message}`);
    }
    
    const campaign = data as Campaign;
    
    // Convert scheduledContactsData back to array
    if (campaign.scheduledContactsData) {
      try {
        (campaign as any).scheduledContacts = JSON.parse(campaign.scheduledContactsData);
      } catch (e) {
        (campaign as any).scheduledContacts = [];
      }
    }
    
    return campaign;
  }

  async deleteCampaign(id: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
    
    return true;
  }

  async getScheduledCampaigns(date: Date): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', date.toISOString());
    
    if (error) {
      throw new Error(`Error fetching scheduled campaigns: ${error.message}`);
    }
    
    return (data as Campaign[]).map(campaign => {
      if (campaign.scheduledContactsData) {
        try {
          (campaign as any).scheduledContacts = JSON.parse(campaign.scheduledContactsData);
        } catch (e) {
          (campaign as any).scheduledContacts = [];
        }
      }
      return campaign;
    });
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating contact: ${error.message}`);
    }
    
    return data as Contact;
  }

  async createContacts(contactList: InsertContact[]): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactList)
      .select();
    
    if (error) {
      throw new Error(`Error creating contacts: ${error.message}`);
    }
    
    return data as Contact[];
  }

  async getContacts(userId: string, campaignId?: number): Promise<Contact[]> {
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching contacts: ${error.message}`);
    }
    
    return data as Contact[];
  }

  async getContactsByIds(contactIds: number[]): Promise<Contact[]> {
    if (!contactIds || contactIds.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds);
    
    if (error) {
      throw new Error(`Error fetching contacts by IDs: ${error.message}`);
    }
    
    return data as Contact[];
  }

  async deleteContacts(userId: string, campaignId?: number): Promise<boolean> {
    let query = supabase
      .from('contacts')
      .delete()
      .eq('user_id', userId);
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('Error deleting contacts:', error);
      return false;
    }
    
    return true;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating contact: ${error.message}`);
    }
    
    return data as Contact;
  }

  // Campaign log operations
  async createCampaignLog(log: InsertCampaignLog): Promise<CampaignLog> {
    const { data, error } = await supabase
      .from('campaign_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating campaign log: ${error.message}`);
    }
    
    return data as CampaignLog;
  }

  async getCampaignLogs(campaignId: number): Promise<CampaignLog[]> {
    const { data, error } = await supabase
      .from('campaign_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching campaign logs: ${error.message}`);
    }
    
    return data as CampaignLog[];
  }

  // WhatsApp session operations
  async createOrUpdateWhatsappSession(
    session: InsertWhatsappSession,
  ): Promise<WhatsappSession> {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        ...session,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating/updating WhatsApp session: ${error.message}`);
    }
    
    return data as WhatsappSession;
  }

  async getWhatsappSession(
    userId: string,
  ): Promise<WhatsappSession | undefined> {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error fetching WhatsApp session:', error);
      return undefined;
    }
    
    return data as WhatsappSession;
  }

  async updateWhatsappSession(
    userId: string,
    updates: Partial<WhatsappSession>,
  ): Promise<WhatsappSession> {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating WhatsApp session: ${error.message}`);
    }
    
    return data as WhatsappSession;
  }

  // Contact List operations
  async createContactList(
    contactList: InsertContactList,
  ): Promise<ContactList> {
    const { data, error } = await supabase
      .from('contact_lists')
      .insert(contactList)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating contact list: ${error.message}`);
    }
    
    return data as ContactList;
  }

  async getContactLists(userId: string): Promise<ContactList[]> {
    const { data, error } = await supabase
      .from('contact_lists')
      .select(`
        *,
        contact_count:contact_list_members(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching contact lists: ${error.message}`);
    }
    
    return data.map(list => ({
      ...list,
      contactCount: list.contact_count?.[0]?.count || 0
    })) as ContactList[];
  }

  async getContactList(
    id: number,
    userId: string,
  ): Promise<ContactList | undefined> {
    const { data, error } = await supabase
      .from('contact_lists')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error fetching contact list:', error);
      return undefined;
    }
    
    return data as ContactList;
  }

  async updateContactList(
    id: number,
    updates: Partial<ContactList>,
  ): Promise<ContactList> {
    const { data, error } = await supabase
      .from('contact_lists')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating contact list: ${error.message}`);
    }
    
    return data as ContactList;
  }

  async deleteContactList(id: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('contact_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting contact list:', error);
      return false;
    }
    
    return true;
  }

  async getContactsInList(listId: number): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contact_list_members')
      .select(`
        contacts (*)
      `)
      .eq('contact_list_id', listId);
    
    if (error) {
      throw new Error(`Error fetching contacts in list: ${error.message}`);
    }
    
    return data.map(item => item.contacts).filter(Boolean) as Contact[];
  }

  async updateContactsInList(
    listId: number,
    contactIds: number[],
  ): Promise<boolean> {
    try {
      // Remove existing members
      await supabase
        .from('contact_list_members')
        .delete()
        .eq('contact_list_id', listId);
      
      // Add new members
      if (contactIds.length > 0) {
        const members = contactIds.map(contactId => ({
          contact_list_id: listId,
          contact_id: contactId,
        }));
        
        const { error } = await supabase
          .from('contact_list_members')
          .insert(members);
        
        if (error) {
          throw error;
        }
      }
      
      // Update contact count
      await supabase
        .from('contact_lists')
        .update({
          contact_count: contactIds.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);
      
      return true;
    } catch (error) {
      console.error('Error updating contacts in list:', error);
      return false;
    }
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
    
    return data as User[];
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    totalMessages: number;
  }> {
    const [totalUsersResult, activeUsersResult, totalCampaignsResult, totalMessagesResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('sent_count'),
    ]);

    const totalMessages = totalMessagesResult.data?.reduce((sum, campaign) => 
      sum + (campaign.sent_count || 0), 0) || 0;

    return {
      totalUsers: totalUsersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      totalCampaigns: totalCampaignsResult.count || 0,
      totalMessages,
    };
  }
}

export const storage = new SupabaseStorage();