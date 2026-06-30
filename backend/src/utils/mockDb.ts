import { Application } from "../models/Application";
import { Subscription } from "../models/Subscription";
import { License } from "../models/License";
import { User } from "../models/User";
import { Token } from "../models/Token";

export const applications: Application[] = [];
export const subscriptions: Subscription[] = [];
export const licenses: License[] = [];
export const users: User[] = [];
export const tokens: Token[] = [];

export interface LogEntry {
  id: string;
  timestamp: string;
  pcuser: string;
  message: string;
  appId: string;
}

export interface WebhookEntry {
  id: string;
  name: string;
  url: string;
  events: string;
  status: 'Active' | 'Inactive';
  appId: string;
}

export interface VariableEntry {
  id: string;
  name: string;
  value: string;
  appId: string;
}

export interface SessionEntry {
  sessionId: string;
  appId: string;
  userName: string;
  ip: string;
  startedAt: string;
  status: 'Active' | 'Expired';
}

export const logs: LogEntry[] = [];
export const webhooks: WebhookEntry[] = [];
export const variables: VariableEntry[] = [];
export const sessions: SessionEntry[] = [];
