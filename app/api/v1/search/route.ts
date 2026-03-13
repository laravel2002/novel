import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleOptions } from '../cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    if (!q.trim()) {
      return NextResponse.json(
        { success: true, data: [], pagination: { page, limit, totalItems: 0, totalPages: 0 } },
        { headers: corsHeaders() }
      );
    }

    const skip = (page - 1) * limit;

    const whereClause = {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { author: { contains: q, mode: 'insensitive' as const } },
      ]
    };

    const [stories, totalItems] = await Promise.all([
      prisma.story.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          coverUrl: true,
          author: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.story.count({ where: whereClause }),
    ]);

    const formattedStories = stories.map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      coverImage: story.coverUrl,
      author: story.author,
      status: story.status,
      updatedAt: story.updatedAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json(
      { success: true, data: formattedStories, pagination: { page, limit, totalItems, totalPages } },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error in GET /api/v1/search:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
