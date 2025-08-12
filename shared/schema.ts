import { z } from "zod";

// User types
export interface User {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: Date;
  campaignCount?: number;
  contactCount?: number;
  mercadopagoSubscriptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpsertUser {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: Date;
  campaignCount?: number;
  contactCount?: number;
  mercadopagoSubscriptionId?: string;
}

// Campaign types
export interface Campaign {
  id: number;
  userId: string;
  name: string;
  message: string;
  imageUrl?: string;
  status?: string;
  totalContacts?: number;
  sentCount?: number;
  failedCount?: number;
  delayMin?: number;
  delayMax?: number;
  batchSize?: number;
  batchDelay?: number;
  scheduledAt?: Date;
  contactListId?: number;
  scheduledContactsData?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  scheduledContacts?: number[];
}

export interface InsertCampaign {
  userId: string;
  name: string;
  message: string;
  imageUrl?: string;
  status?: string;
  totalContacts?: number;
  sentCount?: number;
  failedCount?: number;
  delayMin?: number;
  delayMax?: number;
  batchSize?: number;
  batchDelay?: number;
  scheduledAt?: Date;
  contactListId?: number;
  scheduledContactsData?: string;
  errorMessage?: string;
}

// Contact types
export interface Contact {
  id: number;
  userId: string;
  campaignId?: number;
  contactListId?: number;
  name: string;
  phone: string;
  email?: string;
  lastCampaignSent?: Date;
  totalCampaignsSent?: number;
  customData?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertContact {
  userId: string;
  campaignId?: number;
  contactListId?: number;
  name: string;
  phone: string;
  email?: string;
  lastCampaignSent?: Date;
  totalCampaignsSent?: number;
  customData?: any;
}

// Campaign Log types
export interface CampaignLog {
  id: number;
  campaignId: number;
  contactId: number;
  status: string;
  errorMessage?: string;
  sentAt?: Date;
  createdAt?: Date;
}

export interface InsertCampaignLog {
  campaignId: number;
  contactId: number;
  status: string;
  errorMessage?: string;
  sentAt?: Date;
}

// WhatsApp Session types
export interface WhatsappSession {
  id: number;
  userId: string;
  sessionId: string;
  isConnected?: boolean;
  qrCode?: string;
  lastConnected?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertWhatsappSession {
  userId: string;
  sessionId: string;
  isConnected?: boolean;
  qrCode?: string;
  lastConnected?: Date;
}

// Contact List types
export interface ContactList {
  id: number;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  contactCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertContactList {
  userId: string;
  name: string;
  description?: string;
  color?: string;
  contactCount?: number;
}

// Validation schemas
export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  isAdmin: z.boolean().optional(),
  subscriptionStatus: z.string().optional(),
  trialEndsAt: z.date().optional(),
  campaignCount: z.number().optional(),
  contactCount: z.number().optional(),
  mercadopagoSubscriptionId: z.string().optional(),
});

export const insertCampaignSchema = z.object({
  userId: z.string(),
  name: z.string(),
  message: z.string(),
  imageUrl: z.string().optional(),
  status: z.string().optional(),
  totalContacts: z.number().optional(),
  sentCount: z.number().optional(),
  failedCount: z.number().optional(),
  delayMin: z.number().optional(),
  delayMax: z.number().optional(),
  batchSize: z.number().optional(),
  batchDelay: z.number().optional(),
  scheduledAt: z.date().optional(),
  contactListId: z.number().optional(),
  scheduledContactsData: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const insertContactSchema = z.object({
  userId: z.string(),
  campaignId: z.number().optional(),
  contactListId: z.number().optional(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  lastCampaignSent: z.date().optional(),
  totalCampaignsSent: z.number().optional(),
  customData: z.any().optional(),
});

export const insertCampaignLogSchema = z.object({
  campaignId: z.number(),
  contactId: z.number(),
  status: z.string(),
  errorMessage: z.string().optional(),
  sentAt: z.date().optional(),
});

export const insertWhatsappSessionSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  isConnected: z.boolean().optional(),
  qrCode: z.string().optional(),
  lastConnected: z.date().optional(),
});

export const insertContactListSchema = z.object({
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  contactCount: z.number().optional(),
});