/**
 * GET /api/staff
 * Get all staff members for the authenticated restaurant
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { staffService } from '@/lib/services/StaffService';

export async function GET(request: Request) {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as any;
    const search = searchParams.get('search');

    let staff;

    if (search) {
      staff = await staffService.searchStaff(user.id, search);
    } else if (role) {
      staff = await staffService.getStaffByRole(user.id, role);
    } else {
      staff = await staffService.getStaffMembers(user.id);
    }

    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error('GET /api/staff error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}
