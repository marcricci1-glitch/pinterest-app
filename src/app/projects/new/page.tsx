"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    watermark: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition"
      >
        <ChevronLeft size={20} />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            required
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Footgoal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input
            type="url"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 h-24"
            placeholder="A short description about this project..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Watermark to display on pins"
            value={formData.watermark}
            onChange={(e) => setFormData({ ...formData, watermark: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
        >
          <Save size={20} />
          {loading ? "Creating..." : "Save Project"}
        </button>
      </form>
    </div>
  );
}
