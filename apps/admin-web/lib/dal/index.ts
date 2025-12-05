/**
 * Data Access Layer (DAL) Index
 * 
 * Centralized export for all repositories.
 * Import from here to access any repository.
 * 
 * @example
 * import { orderRepository, menuItemRepository } from '@/lib/dal';
 * 
 * const orders = await orderRepository.findByRestaurant(restaurantId);
 * const menuItems = await menuItemRepository.findActive(restaurantId);
 */

export * from './BaseRepository';
export * from './OrderRepository';
export * from './OrderItemRepository';
export * from './MenuItemRepository';
export * from './CategoryRepository';
export * from './RestaurantRepository';
export * from './LocationRepository';
export * from './AuditLogRepository';
export * from './StaffRepository';
export * from './IntegrationRepository';

// Re-export repository instances for convenience
export { orderRepository } from './OrderRepository';
export { orderItemRepository } from './OrderItemRepository';
export { menuItemRepository } from './MenuItemRepository';
export { categoryRepository } from './CategoryRepository';
export { restaurantRepository } from './RestaurantRepository';
export { locationRepository } from './LocationRepository';
export { auditLogRepository } from './AuditLogRepository';
export { staffRepository } from './StaffRepository';
export { integrationRepository } from './IntegrationRepository';
