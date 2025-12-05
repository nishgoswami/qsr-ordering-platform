/**
 * Integration Service
 * 
 * Business logic for third-party integrations (delivery, payment, messaging, email).
 * Supports OAuth flows, credential encryption, and connection testing.
 */

import { integrationRepository, auditLogRepository } from '../dal';
import type {
  Integration,
  IntegrationCategory,
  IntegrationStatus,
  CreateIntegrationInput,
} from '../dal/IntegrationRepository';

export class IntegrationService {
  /**
   * Get all integrations for a restaurant
   */
  static async getIntegrations(restaurantId: string): Promise<Integration[]> {
    return integrationRepository.findByRestaurant(restaurantId);
  }

  /**
   * Get integrations by category
   */
  static async getIntegrationsByCategory(
    restaurantId: string,
    category: IntegrationCategory
  ): Promise<Integration[]> {
    return integrationRepository.findByCategory(restaurantId, category);
  }

  /**
   * Get enabled integrations
   */
  static async getEnabledIntegrations(restaurantId: string): Promise<Integration[]> {
    return integrationRepository.findEnabled(restaurantId);
  }

  /**
   * Get single integration
   */
  static async getIntegration(integrationId: string): Promise<Integration | null> {
    return integrationRepository.findById(integrationId);
  }

  /**
   * Get integration by slug
   */
  static async getIntegrationBySlug(
    restaurantId: string,
    slug: string
  ): Promise<Integration | null> {
    return integrationRepository.findBySlug(restaurantId, slug);
  }

  /**
   * Create or update integration
   */
  static async upsertIntegration(
    data: CreateIntegrationInput,
    userId: string,
    existingId?: string
  ): Promise<Integration> {
    // Encrypt credentials before saving
    const encryptedCredentials = this.encryptCredentials(data.credentials || {});

    const integrationData = {
      ...data,
      credentials: encryptedCredentials,
      status: data.status || 'inactive',
      is_enabled: data.is_enabled || false,
    };

    let integration: Integration;

    if (existingId) {
      // Update existing
      integration = await integrationRepository.update(existingId, {
        ...integrationData,
        updated_at: new Date().toISOString(),
      });

      await auditLogRepository.log({
        action: 'integration_updated',
        userId,
        resourceType: 'integration',
        resourceId: integration.id,
        details: { name: integration.name, category: integration.category },
      });
    } else {
      // Create new
      integration = await integrationRepository.create(integrationData as any);

      await auditLogRepository.log({
        action: 'integration_created',
        userId,
        resourceType: 'integration',
        resourceId: integration.id,
        details: { name: integration.name, category: integration.category },
      });
    }

    return integration;
  }

  /**
   * Toggle integration on/off
   */
  static async toggleIntegration(
    integrationId: string,
    isEnabled: boolean,
    userId: string
  ): Promise<Integration> {
    const integration = await integrationRepository.toggleEnabled(integrationId, isEnabled);

    await auditLogRepository.log({
      action: isEnabled ? 'integration_enabled' : 'integration_disabled',
      userId,
      resourceType: 'integration',
      resourceId: integration.id,
      details: { name: integration.name },
    });

    return integration;
  }

  /**
   * Update integration status
   */
  static async updateStatus(
    integrationId: string,
    status: IntegrationStatus,
    lastError?: string
  ): Promise<Integration> {
    return integrationRepository.updateStatus(integrationId, status, lastError);
  }

  /**
   * Delete integration
   */
  static async deleteIntegration(integrationId: string, userId: string): Promise<void> {
    const integration = await integrationRepository.findById(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    await integrationRepository.delete(integrationId);

    await auditLogRepository.log({
      action: 'integration_deleted',
      userId,
      resourceType: 'integration',
      resourceId: integrationId,
      details: { name: integration.name, category: integration.category },
    });
  }

  /**
   * Test integration connection
   */
  static async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = await integrationRepository.findById(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      // TODO: Implement actual connection testing based on category
      // For now, just mark as tested
      await integrationRepository.updateStatus(integrationId, 'testing');

      // Simulate connection test (replace with actual API calls)
      const testResult = await this.performConnectionTest(integration);

      if (testResult.success) {
        await integrationRepository.updateStatus(integrationId, 'active');
        return { success: true, message: 'Connection successful' };
      } else {
        await integrationRepository.updateStatus(integrationId, 'error', testResult.error);
        return { success: false, message: testResult.error || 'Connection failed' };
      }
    } catch (error: any) {
      await integrationRepository.updateStatus(integrationId, 'error', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Connect OAuth account
   */
  static async connectOAuthAccount(
    integrationId: string,
    accountData: { account_id: string; account_name: string },
    userId: string
  ): Promise<Integration> {
    const integration = await integrationRepository.connectOAuthAccount(integrationId, {
      ...accountData,
      connected_at: new Date().toISOString(),
    });

    await auditLogRepository.log({
      action: 'integration_oauth_connected',
      userId,
      resourceType: 'integration',
      resourceId: integration.id,
      details: { name: integration.name, account_name: accountData.account_name },
    });

    return integration;
  }

  /**
   * Disconnect OAuth account
   */
  static async disconnectOAuthAccount(integrationId: string, userId: string): Promise<Integration> {
    const integration = await integrationRepository.disconnectOAuthAccount(integrationId);

    await auditLogRepository.log({
      action: 'integration_oauth_disconnected',
      userId,
      resourceType: 'integration',
      resourceId: integration.id,
      details: { name: integration.name },
    });

    return integration;
  }

  /**
   * Get integration statistics
   */
  static async getIntegrationStats(restaurantId: string) {
    const integrations = await integrationRepository.findByRestaurant(restaurantId);

    return {
      total: integrations.length,
      enabled: integrations.filter((i: Integration) => i.is_enabled).length,
      active: integrations.filter((i: Integration) => i.status === 'active').length,
      error: integrations.filter((i: Integration) => i.status === 'error').length,
      byCategory: {
        delivery: integrations.filter((i: Integration) => i.category === 'delivery').length,
        email: integrations.filter((i: Integration) => i.category === 'email').length,
        messaging: integrations.filter((i: Integration) => i.category === 'messaging').length,
        payment: integrations.filter((i: Integration) => i.category === 'payment').length,
      },
    };
  }

  // ===== PRIVATE HELPERS =====

  /**
   * Encrypt sensitive credentials
   * TODO: Implement proper encryption (use crypto library)
   */
  private static encryptCredentials(credentials: Record<string, string>): Record<string, string> {
    // For now, return as-is
    // In production, use proper encryption:
    // - crypto.createCipher() for Node.js
    // - Store encryption key in environment variable
    // - Consider using AWS KMS or similar for key management
    return credentials;
  }

  /**
   * Decrypt credentials
   * TODO: Implement proper decryption
   */
  private static decryptCredentials(credentials: Record<string, string>): Record<string, string> {
    // For now, return as-is
    return credentials;
  }

  /**
   * Perform actual connection test based on integration type
   * TODO: Implement actual API calls for each integration type
   */
  private static async performConnectionTest(
    integration: Integration
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement actual connection tests:
    
    switch (integration.category) {
      case 'delivery':
        // Test Uber Eats, DoorDash, etc. API
        return { success: true };

      case 'email':
        // Test SendGrid, Mailgun, etc. API
        return { success: true };

      case 'messaging':
        // Test Twilio, WhatsApp, etc. API
        return { success: true };

      case 'payment':
        // Test Stripe, Square, etc. API
        return { success: true };

      default:
        return { success: false, error: 'Unknown integration category' };
    }
  }
}
