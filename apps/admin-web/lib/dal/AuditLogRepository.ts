/**
 * Audit Log Repository
 * 
 * Data access layer for audit_logs table.
 * Handles audit trail and activity logging.
 */

import { BaseRepository, QueryOptions } from './BaseRepository';

export interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  created_at: string;
}

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super('audit_logs');
  }

  /**
   * Create audit log entry
   */
  async log(log: {
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
  }): Promise<AuditLog> {
    return this.create({
      action: log.action,
      user_id: log.userId,
      resource_type: log.resourceType,
      resource_id: log.resourceId,
      details: log.details,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Find logs by resource
   */
  async findByResource(
    resourceType: string,
    resourceId: string,
    options?: QueryOptions
  ): Promise<AuditLog[]> {
    return this.findAll(
      {
        resource_type: resourceType,
        resource_id: resourceId,
      },
      options || {
        orderBy: { column: 'created_at', ascending: false },
      }
    );
  }

  /**
   * Find logs by user
   */
  async findByUser(
    userId: string,
    options?: QueryOptions
  ): Promise<AuditLog[]> {
    return this.findAll(
      { user_id: userId },
      options || {
        orderBy: { column: 'created_at', ascending: false },
      }
    );
  }

  /**
   * Find logs by action type
   */
  async findByAction(
    action: string,
    options?: QueryOptions
  ): Promise<AuditLog[]> {
    return this.findAll(
      { action },
      options || {
        orderBy: { column: 'created_at', ascending: false },
      }
    );
  }

  /**
   * Find recent logs
   */
  async findRecent(limit: number = 50): Promise<AuditLog[]> {
    return this.findAll(undefined, {
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
