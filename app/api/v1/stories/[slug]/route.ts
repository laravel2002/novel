import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsHeaders, handleOptions } from '../../cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const story = await prisma.story.findUnique({
      where: { slug },
      include: {
        StoryCategory: {
          include: {
            Category: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const categories = story.StoryCategory.map((sc) => ({
      slug: sc.Category.slug,
      name: sc.Category.name,
    }));

    const formattedStory = {
      id: story.id,
      slug: story.slug,
      title: story.title,
      coverImage: story.coverUrl,
      author: story.author,
      description: story.description,
      status: story.status,
      views: story.views,
      chapterCount: story.chapterCount,
      rating: story.rating,
      votes: story.votes,
      updatedAt: story.updatedAt,
      categories,
    };

    return NextResponse.json(
      { success: true, data: formattedStory },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error(`Error in GET /api/v1/stories/[slug]:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
