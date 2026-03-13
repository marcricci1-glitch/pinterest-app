"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Lock } from "lucide-react";
import Link from "next/link";

export default function PinterestSettings({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    boardId: "",
  });

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.pinterestConfigs && data.pinterestConfigs[0]) {
          setConfig({
            clientId: data.pinterestConfigs[0].clientId,
            clientSecret: data.pinterestConfigs[0].clientSecret,
            boardId: data.pinterestConfigs[0].boardId || "",
          });
        }
      });
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/pinterest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={`/projects/${projectId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition">
        <ChevronLeft size={20} />
        Back to Project
      </Link>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Lock className="text-red-600" />
        Pinterest API Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">
          Configure your Pinterest App credentials for this specific project.
          You can find these in your Pinterest Developer portal.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Client ID</label>
          <input
            required
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Client Secret</label>
          <input
            required
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Board ID (Optional)</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., 123456789"
            value={config.boardId}
            onChange={(e) => setConfig({ ...config, boardId: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save API Credentials"}
        </button>
      </form>
    </div>
  );
}
