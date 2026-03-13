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
    const { clientId, clientSecret, boardId } = body;

    const existingConfig = await prisma.pinterestConfig.findFirst({ where: { projectId: id } });

    const config = await prisma.pinterestConfig.upsert({
      where: {
        id: existingConfig?.id || "new"
      },
      update: {
        clientId,
        clientSecret,
        boardId,
      },
      create: {
        projectId: id,
        clientId,
        clientSecret,
        boardId,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[PINTEREST_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
