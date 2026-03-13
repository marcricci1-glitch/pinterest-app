import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, isGlobal, keywords } = body;

    const targetUrl = await prisma.targetURL.create({
      data: {
        url,
        isGlobal: isGlobal || false,
        projectId: id,
        keywords: {
          create: keywords?.map((k: string) => ({ keyword: k })) || [],
        },
      },
    });

    return NextResponse.json(targetUrl);
  } catch (error) {
    console.error("[URLS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
