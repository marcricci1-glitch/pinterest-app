import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Clock } from "lucide-react";
import PinActionButtons from "@/components/PinActionButtons";

export default async function ProjectPinsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) redirect("/api/auth/signin");

  const project = await prisma.project.findUnique({
    where: { id: id, userId: (session.user as any).id! },
    include: {
      pins: {
        orderBy: { createdAt: "desc" },
        include: { targetUrl: true }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href={`/projects/${project.id}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition">
        <ChevronLeft size={20} />
        Back to Project
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generated Pins</h1>
        <p className="text-gray-500">{project.name} - {project.pins.length} pins total</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {project.pins.map((pin) => (
          <div key={pin.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-[9/16] relative bg-gray-100">
               <img src={pin.imageUrl} alt={pin.title} className="w-full h-full object-cover" />
               <div className="absolute top-2 right-2">
                 {pin.status === "published" && <span className="bg-green-500 text-white p-1 rounded-full"><CheckCircle2 size={16} /></span>}
                 {pin.status === "scheduled" && <span className="bg-blue-500 text-white p-1 rounded-full"><Clock size={16} /></span>}
               </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
               <h3 className="font-bold text-sm line-clamp-1 mb-1">{pin.title}</h3>
               <p className="text-xs text-gray-500 line-clamp-2 mb-3">{pin.description}</p>
               <div className="mt-auto space-y-3">
                 <div className="text-[10px] text-gray-400 truncate">URL: {pin.targetUrl?.url}</div>
                 <PinActionButtons pinId={pin.id} status={pin.status} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
