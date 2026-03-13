import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePinText, generatePinImage } from "@/lib/gemini";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { addWatermarkToImage } from "@/lib/imageProcessor";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, selectedUrls, style, pinCount, article, addWatermark } = body;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: (session.user as any).id! },
      include: { targetUrls: { include: { keywords: true } } }
    });

    if (!project) return new NextResponse("Project not found", { status: 404 });

    const results = [];

    for (const urlId of selectedUrls) {
      const targetUrl = project.targetUrls.find(u => u.id === urlId);
      if (!targetUrl) continue;

      const keywordsStr = targetUrl.keywords.map(k => k.keyword).join(", ");

      for (let i = 0; i < pinCount; i++) {
        const textPrompt = `Create a pin for ${targetUrl.url}. Keywords: ${keywordsStr}. Style focus: ${style}.`;
        const pinText = await generatePinText(textPrompt, article);

        if (!pinText) continue;

        const imagePrompt = `Subject: ${pinText.title}. Details: ${pinText.description}. Keywords: ${keywordsStr}`;
        const base64Image = await generatePinImage(imagePrompt, style);

        if (!base64Image) continue;

        const fileName = `${uuidv4()}.png`;
        const publicDir = path.join(process.cwd(), "public", "pins");
        await fs.mkdir(publicDir, { recursive: true });
        const filePath = path.join(publicDir, fileName);
        await fs.writeFile(filePath, Buffer.from(base64Image, "base64"));

        const imageUrl = `/pins/${fileName}`;

        if (addWatermark && project.watermark) {
          try {
            await addWatermarkToImage(imageUrl, project.watermark);
          } catch (error) {
            console.error("Watermarking failed", error);
          }
        }

        const pin = await prisma.pin.create({
          data: {
            projectId,
            targetUrlId: urlId,
            title: pinText.title,
            description: pinText.description,
            hashtags: pinText.hashtags.join(", "),
            imageUrl,
            status: "draft"
          }
        });

        results.push(pin);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GENERATE_POST]", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
