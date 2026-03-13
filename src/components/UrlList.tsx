"use client";

import { useState } from "react";
import { Plus, Trash2, Tag as TagIcon, Globe } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
}

interface TargetURL {
  id: string;
  url: string;
  isGlobal: boolean;
  keywords: Keyword[];
}

export default function UrlList({
  projectId,
  initialUrls
}: {
  projectId: string;
  initialUrls: TargetURL[]
}) {
  const [urls, setUrls] = useState(initialUrls);
  const [newUrl, setNewUrl] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setLoading(true);

    try {
      const keywordsArray = newKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "");

      const res = await fetch(`/api/projects/${projectId}/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newUrl,
          isGlobal,
          keywords: keywordsArray,
        }),
      });

      if (res.ok) {
        const addedUrl = await res.json();
        setUrls([addedUrl, ...urls]);
        setNewUrl("");
        setNewKeywords("");
        setIsGlobal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddUrl} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target URL</label>
            <input
              type="url"
              placeholder="https://example.com/page-1"
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keywords (comma separated)</label>
            <input
              type="text"
              placeholder="football, goals, highlights"
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isGlobal"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <label htmlFor="isGlobal" className="text-sm text-gray-700">Set as Global/Homepage URL</label>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            <Plus size={18} />
            Add URL
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {urls.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm italic">No target URLs added yet.</p>
        ) : (
          urls.map((url) => (
            <div key={url.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-start hover:bg-gray-50 transition">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <span className="font-medium text-sm truncate max-w-md">{url.url}</span>
                  {url.isGlobal && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">Global</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {url.keywords?.map((k, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <TagIcon size={10} />
                      {k.keyword}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-gray-300 hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
