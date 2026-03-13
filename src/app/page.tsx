import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlusCircle, ExternalLink, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: (session.user as any).id!,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <p className="text-gray-500">Manage your Pinterest automation projects</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <PlusCircle size={20} />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No projects found. Create your first one to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold group-hover:text-red-600 transition">
                  {project.name}
                </h2>
                <Link href={`/projects/${project.id}/edit`} className="text-gray-400 hover:text-gray-600">
                  <Settings size={18} />
                </Link>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || "No description provided."}
              </p>
              {project.website && (
                <div className="flex items-center gap-1 text-xs text-blue-600 mb-6">
                  <ExternalLink size={12} />
                  <a href={project.website} target="_blank" rel="noopener noreferrer">
                    {project.website}
                  </a>
                </div>
              )}
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex-1 text-center bg-gray-100 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  View Details
                </Link>
                <Link
                  href={`/generate?project=${project.id}`}
                  className="flex-1 text-center bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                >
                  Create Pins
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
