/**
 * PATCH /api/staff/[id]/role
 * Update staff member role
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { staffService } from '@/lib/services/StaffService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const staffId = params.id;
    const body = await request.json();

    const updatedStaff = await staffService.updateRole(
      staffId,
      body.role,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedStaff,
    });
  } catch (error) {
    console.error('PATCH /api/staff/[id]/role error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update role' },
      { status: 500 }
    );
  }
}
