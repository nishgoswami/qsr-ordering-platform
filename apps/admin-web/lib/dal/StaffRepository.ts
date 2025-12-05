/**
 * Staff Repository
 * 
 * Data access layer for staff/users table.
 * Handles user authentication and staff management.
 */

import { BaseRepository } from './BaseRepository';

export interface Staff {
  id: string;
  restaurant_id: string;
  email: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type StaffRole = 'owner' | 'manager' | 'staff' | 'kitchen';

export class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super('staff');
  }

  /**
   * Find staff by email
   */
  async findByEmail(email: string): Promise<Staff | null> {
    return this.findOne({ email });
  }

  /**
   * Find all staff for a restaurant
   */
  async findByRestaurant(restaurantId: string): Promise<Staff[]> {
    return this.findAll({ restaurant_id: restaurantId });
  }

  /**
   * Find active staff for a restaurant
   */
  async findActiveByRestaurant(restaurantId: string): Promise<Staff[]> {
    return this.findAll({
      restaurant_id: restaurantId,
      is_active: true,
    });
  }

  /**
   * Find staff by role
   */
  async findByRole(
    restaurantId: string,
    role: StaffRole
  ): Promise<Staff[]> {
    return this.findAll({
      restaurant_id: restaurantId,
      role,
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<Staff> {
    return this.update(id, {
      last_login: new Date().toISOString(),
    } as Partial<Staff>);
  }

  /**
   * Toggle staff active status
   */
  async toggleActive(id: string): Promise<Staff> {
    const staff = await this.findById(id);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    return this.update(id, {
      is_active: !staff.is_active,
      updated_at: new Date().toISOString(),
    } as Partial<Staff>);
  }
}

export const staffRepository = new StaffRepository();
