import { supabase } from './supabase';
import { restaurantRepository, staffRepository, locationRepository, menuItemRepository } from './dal';

export interface SignUpData {
  email: string;
  password: string;
  restaurantName: string;
  ownerFirstName: string;
  ownerLastName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Sign up a new restaurant owner
 * Creates: auth user, restaurant, staff record, default location
 */
export async function signUp(data: SignUpData) {
  console.log('🚀 Starting signup process...', { email: data.email, restaurant: data.restaurantName });
  
  try {
    // 0. Check if user already exists using repository
    console.log('🔍 Checking if user already exists...');
    const existingRestaurants = await restaurantRepository.findAll({ email: data.email });

    if (existingRestaurants.length > 0) {
      throw new Error('An account with this email already exists. Please use a different email or try logging in.');
    }

    // 1. Create auth user
    console.log('📝 Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.ownerFirstName,
          last_name: data.ownerLastName,
          phone: data.phone,
        },
      },
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw authError;
    }
    if (!authData.user) {
      console.error('❌ No user returned from auth');
      throw new Error('User creation failed');
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Verify auth user exists by querying it back
    let userExists = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      const { data: { user: verifyUser } } = await supabase.auth.getUser();
      if (verifyUser && verifyUser.id === authData.user.id) {
        console.log('✅ Auth user verified in database');
        userExists = true;
        break;
      }
      console.log(`⏳ Waiting for auth user (attempt ${attempt}/10)...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!userExists) {
      throw new Error('Auth user not found after creation - please try again');
    }

    // 2. Create restaurant slug from name with unique suffix
    const baseSlug = data.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    console.log('📝 Step 2: Creating restaurant record...', { slug });

    // 3. Create restaurant record using repository
    const restaurant = await restaurantRepository.create({
      name: data.restaurantName,
      slug: slug,
      email: data.email,
      phone: data.phone,
      is_active: false, // Inactive until approved
    } as any);

    console.log('✅ Restaurant created:', restaurant.id);

    // 4. Create staff record using repository
    console.log('📝 Step 3: Creating staff record...');
    await staffRepository.create({
      restaurant_id: restaurant.id,
      email: data.email,
      name: `${data.ownerFirstName} ${data.ownerLastName}`,
      role: 'owner',
      is_active: true,
    } as any);

    console.log('✅ Staff record created');

    // 5. Create default location using repository
    console.log('📝 Step 4: Creating default location...');
    await locationRepository.create({
      restaurant_id: restaurant.id,
      name: 'Main Location',
      slug: 'main',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip_code: data.zipCode || '',
      phone: data.phone,
      email: data.email,
      is_active: true,
      business_hours: {
        monday: { open: '09:00', close: '21:00', closed: false },
        tuesday: { open: '09:00', close: '21:00', closed: false },
        wednesday: { open: '09:00', close: '21:00', closed: false },
        thursday: { open: '09:00', close: '21:00', closed: false },
        friday: { open: '09:00', close: '21:00', closed: false },
        saturday: { open: '09:00', close: '21:00', closed: false },
        sunday: { open: '09:00', close: '21:00', closed: false },
      },
    });

    console.log('✅ Location created');
    console.log('🎉 Signup complete!');

    return {
      success: true,
      user: authData.user,
      restaurant,
      message: 'Account created successfully!',
    };
  } catch (error: any) {
    console.error('💥 Signup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account',
    };
  }
}

/**
 * Log in existing user
 */
export async function login(data: LoginData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Invalid email or password',
    };
  }
}

/**
 * Log out current user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to log out',
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

/**
 * Get current user's restaurant and staff details
 */
export async function getUserRestaurant() {
  try {
    const { user } = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Get staff record (which links to restaurant)
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select(
        `
        *,
        restaurant:restaurants (*)
      `
      )
      .eq('user_id', user.id)
      .single();

    if (staffError) throw staffError;

    return {
      success: true,
      staff,
      restaurant: staff.restaurant,
    };
  } catch (error: any) {
    console.error('Get restaurant error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get restaurant details',
    };
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding() {
  try {
    const { restaurant } = await getUserRestaurant();
    
    if (!restaurant) return false;

    // Check if restaurant has at least one menu item using repository
    const menuItems = await menuItemRepository.findActive(restaurant.id);

    return menuItems.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password reset email sent!',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email',
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password updated successfully!',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update password',
    };
  }
}
