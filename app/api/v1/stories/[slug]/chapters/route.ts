import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleOptions } from '../../../cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const skip = (page - 1) * limit;

    const story = await prisma.story.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const [chapters, totalItems] = await Promise.all([
      prisma.chapter.findMany({
        where: { storyId: story.id },
        skip,
        take: limit,
        orderBy: { chapterNum: 'asc' },
        select: {
          id: true,
          chapterNum: true,
          title: true,
          createdAt: true,
        },
      }),
      prisma.chapter.count({ where: { storyId: story.id } }),
    ]);

    const formattedChapters = chapters.map((chapter) => ({
      id: chapter.id,
      chapterNumber: chapter.chapterNum,
      title: chapter.title,
      createdAt: chapter.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json(
      { success: true, data: formattedChapters, pagination: { page, limit, totalItems, totalPages } },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/stories/[slug]/chapters:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
