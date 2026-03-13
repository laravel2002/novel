import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleOptions } from '../cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      { success: true, data: categories },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error in GET /api/v1/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
