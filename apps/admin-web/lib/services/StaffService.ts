/**
 * Staff Service
 * Business logic for staff/user management
 */

import { staffRepository, Staff, StaffRole } from '../dal/StaffRepository';
import { auditLogRepository } from '../dal/AuditLogRepository';

interface StaffPermissions {
  can_manage_orders?: boolean;
  can_manage_menu?: boolean;
  can_view_reports?: boolean;
}

class StaffService {
  /**
   * Get all staff members for a restaurant
   */
  async getStaffMembers(restaurantId: string): Promise<Staff[]> {
    return await staffRepository.findByRestaurant(restaurantId);
  }

  /**
   * Get staff member by ID
   */
  async getStaffById(staffId: string): Promise<Staff | null> {
    return await staffRepository.findById(staffId);
  }

  /**
   * Get staff member by email
   */
  async getStaffByEmail(email: string): Promise<Staff | null> {
    return await staffRepository.findByEmail(email);
  }

  /**
   * Get staff members by role
   */
  async getStaffByRole(restaurantId: string, role: StaffRole): Promise<Staff[]> {
    return await staffRepository.findByRole(restaurantId, role);
  }

  /**
   * Update staff permissions
   */
  async updatePermissions(
    staffId: string,
    permissions: StaffPermissions,
    updatedBy: string
  ): Promise<Staff> {
    // Validate permissions
    this.validatePermissions(permissions);

    // Update staff using base update method
    const updatedStaff = await staffRepository.update(staffId, permissions as Partial<Staff>);

    return updatedStaff;
  }

  /**
   * Update staff role
   */
  async updateRole(
    staffId: string,
    newRole: StaffRole,
    updatedBy: string
  ): Promise<Staff> {
    // Get current staff member
    const currentStaff = await staffRepository.findById(staffId);
    if (!currentStaff) {
      throw new Error('Staff member not found');
    }

    // Update role
    const updatedStaff = await staffRepository.update(staffId, { role: newRole } as Partial<Staff>);

    return updatedStaff;
  }

  /**
   * Update staff profile
   */
  async updateProfile(
    staffId: string,
    profileData: {
      name?: string;
      email?: string;
    },
    updatedBy: string
  ): Promise<Staff> {
    // Validate email if provided
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already taken
      const existingStaff = await staffRepository.findByEmail(profileData.email);
      if (existingStaff && existingStaff.id !== staffId) {
        throw new Error('Email already in use');
      }
    }

    return await staffRepository.update(staffId, profileData as Partial<Staff>);
  }

  /**
   * Get staff statistics
   */
  async getStats(restaurantId: string): Promise<{
    totalStaff: number;
    admins: number;
    staff: number;
    activeThisMonth: number;
  }> {
    const allStaff = await staffRepository.findByRestaurant(restaurantId);
    return {
      totalStaff: allStaff.length,
      admins: allStaff.filter(s => s.role === 'owner' || s.role === 'manager').length,
      staff: allStaff.filter(s => s.role === 'staff').length,
      activeThisMonth: allStaff.filter(s => s.is_active).length,
    };
  }

  /**
   * Search staff members
   */
  async searchStaff(restaurantId: string, query: string): Promise<Staff[]> {
    if (!query || query.trim().length < 2) {
      return await this.getStaffMembers(restaurantId);
    }

    // Simple search implementation
    const allStaff = await staffRepository.findByRestaurant(restaurantId);
    const searchLower = query.trim().toLowerCase();
    return allStaff.filter(s => 
      s.name?.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get staff activity summary
   */
  async getActivitySummary(staffId: string): Promise<{
    ordersManaged: number;
    menuItemsCreated: number;
    lastActive: string | null;
  }> {
    // Get audit logs for this staff member
    const logs = await auditLogRepository.findByUser(staffId, { limit: 100 });

    const ordersManaged = logs.filter(
      log => log.resource_type === 'order'
    ).length;

    const menuItemsCreated = logs.filter(
      log => log.resource_type === 'menu_item' && log.action === 'create'
    ).length;

    const lastActive = logs.length > 0 ? logs[0].created_at : null;

    return {
      ordersManaged,
      menuItemsCreated,
      lastActive,
    };
  }

  /**
   * Validate permissions object
   */
  private validatePermissions(permissions: StaffPermissions): void {
    const validKeys = ['can_manage_orders', 'can_manage_menu', 'can_view_reports'];
    
    for (const key of Object.keys(permissions)) {
      if (!validKeys.includes(key)) {
        throw new Error(`Invalid permission key: ${key}`);
      }
      
      const value = permissions[key as keyof StaffPermissions];
      if (typeof value !== 'boolean') {
        throw new Error(`Permission ${key} must be a boolean`);
      }
    }
  }

  /**
   * Bulk update permissions for multiple staff members
   */
  async bulkUpdatePermissions(
    staffIds: string[],
    permissions: StaffPermissions,
    updatedBy: string
  ): Promise<Staff[]> {
    this.validatePermissions(permissions);

    const results: Staff[] = [];

    for (const staffId of staffIds) {
      try {
        const updated = await this.updatePermissions(staffId, permissions, updatedBy);
        results.push(updated);
      } catch (error) {
        console.error(`Failed to update permissions for staff ${staffId}:`, error);
        // Continue with other staff members
      }
    }

    return results;
  }

  /**
   * Deactivate staff member
   */
  async deactivateStaff(
    staffId: string,
    deactivatedBy: string
  ): Promise<void> {
    // Prevent self-deactivation
    if (staffId === deactivatedBy) {
      throw new Error('Cannot deactivate yourself');
    }

    // Toggle active status
    await staffRepository.toggleActive(staffId);

    // Log deactivation
    await auditLogRepository.create({
      action: 'deactivate',
      user_id: deactivatedBy,
      resource_type: 'user',
      resource_id: staffId,
      details: { status: 'deactivated' },
    });
  }
}

export const staffService = new StaffService();
