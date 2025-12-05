/**
 * Base Repository
 * 
 * Generic data access layer for database operations.
 * All repositories extend this base class for common CRUD operations.
 * 
 * @module BaseRepository
 */

import { supabase } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface QueryOptions {
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  [key: string]: any;
}

/**
 * Base Repository Class
 * Provides common database operations for all entities
 */
export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find all records with optional filters and options
   */
  async findAll(
    filters?: FilterOptions,
    options?: QueryOptions
  ): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError(error, 'findAll');
    }

    return (data as T[]) || [];
  }

  /**
   * Find single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw this.handleError(error, 'findById');
    }

    return data as T;
  }

  /**
   * Find single record by filters
   */
  async findOne(filters: FilterOptions): Promise<T | null> {
    let query = supabase.from(this.tableName).select('*');

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw this.handleError(error, 'findOne');
    }

    return data as T;
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>): Promise<T> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw this.handleError(error, 'create');
    }

    return created as T;
  }

  /**
   * Create multiple records
   */
  async createMany(records: Partial<T>[]): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(records)
      .select();

    if (error) {
      throw this.handleError(error, 'createMany');
    }

    return (data as T[]) || [];
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw this.handleError(error, 'update');
    }

    return updated as T;
  }

  /**
   * Update multiple records by filters
   */
  async updateMany(
    filters: FilterOptions,
    data: Partial<T>
  ): Promise<T[]> {
    let query = supabase.from(this.tableName).update(data);

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }

    const { data: updated, error } = await query.select();

    if (error) {
      throw this.handleError(error, 'updateMany');
    }

    return (updated as T[]) || [];
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw this.handleError(error, 'delete');
    }
  }

  /**
   * Delete multiple records by filters
   */
  async deleteMany(filters: FilterOptions): Promise<void> {
    let query = supabase.from(this.tableName).delete();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }

    const { error } = await query;

    if (error) {
      throw this.handleError(error, 'deleteMany');
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: FilterOptions): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    const { count, error } = await query;

    if (error) {
      throw this.handleError(error, 'count');
    }

    return count || 0;
  }

  /**
   * Check if record exists
   */
  async exists(filters: FilterOptions): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  /**
   * Execute raw SQL query (use sparingly)
   */
  protected async executeRawQuery<R = any>(
    query: string,
    params?: any[]
  ): Promise<R[]> {
    const { data, error } = await supabase.rpc('execute_sql', {
      query,
      params,
    });

    if (error) {
      throw this.handleError(error, 'executeRawQuery');
    }

    return data as R[];
  }

  /**
   * Handle and format database errors
   */
  protected handleError(error: PostgrestError, operation: string): Error {
    const message = `Database error in ${this.tableName}.${operation}: ${error.message}`;
    
    console.error(message, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    // Map common error codes to user-friendly messages
    switch (error.code) {
      case '23505': // Unique violation
        return new Error('A record with this value already exists');
      case '23503': // Foreign key violation
        return new Error('Referenced record does not exist');
      case '23502': // Not null violation
        return new Error('Required field is missing');
      case 'PGRST116': // Not found
        return new Error('Record not found');
      default:
        return new Error(message);
    }
  }
}
