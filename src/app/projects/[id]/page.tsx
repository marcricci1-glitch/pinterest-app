import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Globe, ExternalLink, Calendar, Settings as SettingsIcon } from "lucide-react";
import UrlList from "@/components/UrlList";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: id,
      userId: (session.user as any).id!,
    },
    include: {
      targetUrls: {
        include: {
          keywords: true,
        },
      },
      pinterestConfigs: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition"
      >
        <ChevronLeft size={20} />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 max-w-2xl">{project.description}</p>
        </div>
        <Link
          href={`/generate?project=${project.id}`}
          className="bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Generate New Pins
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe size={20} className="text-blue-500" />
                Target URLs
              </h2>
            </div>

            <UrlList projectId={project.id} initialUrls={project.targetUrls as any} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={18} />
              Settings
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 block">Website</span>
                <a href={project.website || "#"} target="_blank" className="text-blue-600 flex items-center gap-1">
                  {project.website || "Not set"}
                  {project.website && <ExternalLink size={12} />}
                </a>
              </div>
              <div>
                <span className="text-gray-500 block">Watermark</span>
                <span className="font-medium">{project.watermark || "None"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Created</span>
                <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              href={`/projects/${project.id}/edit`}
              className="mt-6 block text-center w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              Edit Project Details
            </Link>
          </section>

          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600">
              <Calendar size={18} />
              Pinterest Connection
            </h2>
            {project.pinterestConfigs.length > 0 ? (
              <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Connected
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No Pinterest account connected for this project.</p>
            )}
            <Link
              href={`/projects/${id}/settings`}
              className="block text-center w-full mt-2 bg-black text-white py-2 rounded-md text-sm font-bold hover:bg-gray-800 transition"
            >
              API Credentials
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
