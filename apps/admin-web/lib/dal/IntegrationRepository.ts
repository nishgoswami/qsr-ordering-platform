/**
 * Integration Repository
 * 
 * Data access layer for third-party integrations (delivery, email, messaging, payment).
 */

import { BaseRepository, QueryOptions } from './BaseRepository';

export type IntegrationCategory = 'delivery' | 'email' | 'messaging' | 'payment';
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'testing';

export interface Integration {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  category: IntegrationCategory;
  description?: string;
  is_enabled: boolean;
  status: IntegrationStatus;
  is_global: boolean;
  location_id?: string;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  oauth_enabled?: boolean;
  oauth_config?: {
    provider: string;
    client_id?: string;
    redirect_uri?: string;
    scopes?: string[];
  };
  connected_account?: {
    account_id: string;
    account_name: string;
    connected_at: string;
  };
  last_tested_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIntegrationInput {
  restaurant_id: string;
  name: string;
  slug: string;
  category: IntegrationCategory;
  description?: string;
  is_enabled?: boolean;
  status?: IntegrationStatus;
  is_global?: boolean;
  location_id?: string;
  credentials?: Record<string, string>;
  settings?: Record<string, any>;
  oauth_enabled?: boolean;
  oauth_config?: Integration['oauth_config'];
}

export class IntegrationRepository extends BaseRepository<Integration> {
  constructor() {
    super('integrations');
  }

  /**
   * Find integrations by restaurant
   */
  async findByRestaurant(restaurantId: string, options?: QueryOptions): Promise<Integration[]> {
    return this.findAll({ restaurant_id: restaurantId }, options);
  }

  /**
   * Find integrations by category
   */
  async findByCategory(
    restaurantId: string,
    category: IntegrationCategory,
    options?: QueryOptions
  ): Promise<Integration[]> {
    return this.findAll({ restaurant_id: restaurantId, category }, options);
  }

  /**
   * Find enabled integrations
   */
  async findEnabled(restaurantId: string, options?: QueryOptions): Promise<Integration[]> {
    return this.findAll(
      { restaurant_id: restaurantId, is_enabled: true, status: 'active' },
      options
    );
  }

  /**
   * Find integration by slug
   */
  async findBySlug(restaurantId: string, slug: string): Promise<Integration | null> {
    return this.findOne({ restaurant_id: restaurantId, slug });
  }

  /**
   * Update integration status
   */
  async updateStatus(
    id: string,
    status: IntegrationStatus,
    lastError?: string
  ): Promise<Integration> {
    const updates: Partial<Integration> = {
      status,
      last_tested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (lastError !== undefined) {
      updates.last_error = lastError;
    }

    return this.update(id, updates);
  }

  /**
   * Toggle integration enabled status
   */
  async toggleEnabled(id: string, isEnabled: boolean): Promise<Integration> {
    return this.update(id, {
      is_enabled: isEnabled,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Update integration credentials (encrypted)
   */
  async updateCredentials(id: string, credentials: Record<string, string>): Promise<Integration> {
    return this.update(id, {
      credentials,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Connect OAuth account
   */
  async connectOAuthAccount(
    id: string,
    connectedAccount: Integration['connected_account']
  ): Promise<Integration> {
    return this.update(id, {
      connected_account: connectedAccount,
      status: 'active',
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Disconnect OAuth account
   */
  async disconnectOAuthAccount(id: string): Promise<Integration> {
    return this.update(id, {
      connected_account: null as any,
      status: 'inactive',
      updated_at: new Date().toISOString(),
    });
  }
}

export const integrationRepository = new IntegrationRepository();
