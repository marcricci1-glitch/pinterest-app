"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Wand2, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

function GenerateContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [style, setStyle] = useState("pinterest style");
  const [pinCount, setPinCount] = useState(1);
  const [article, setArticle] = useState("");
  const [addWatermark, setAddWatermark] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProject(data);
          const globalUrls = data.targetUrls.filter((u: any) => u.isGlobal).map((u: any) => u.id);
          setSelectedUrls(globalUrls);
        });
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUrls.length === 0) {
      setError("Please select at least one target URL");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          selectedUrls,
          style,
          pinCount,
          article,
          addWatermark
        }),
      });

      if (res.ok) {
        router.push(`/projects/${projectId}/pins`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to generate pins");
      }
    } catch (err) {
      setError("An error occurred during generation");
    } finally {
      setGenerating(false);
    }
  };

  if (!project) return <div className="p-8 text-center">Loading project...</div>;

  const styles = ["comic", "cartoon", "minimalistic", "pinterest style", "realistic", "watercolor", "3d render"];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href={`/projects/${projectId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition">
        <ChevronLeft size={20} />
        Back to Project
      </Link>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Wand2 className="text-red-600" />
        Generate Pins for {project.name}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">1. Choose Target URLs</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto p-2">
            {project.targetUrls.map((url: any) => (
              <label key={url.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 rounded text-red-600 focus:ring-red-500"
                  checked={selectedUrls.includes(url.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUrls([...selectedUrls, url.id]);
                    } else {
                      setSelectedUrls(selectedUrls.filter(id => id !== url.id));
                    }
                  }}
                />
                <div>
                  <div className="text-sm font-medium">{url.url}</div>
                  <div className="flex gap-1 mt-1">
                    {url.keywords.map((k: any, i: number) => (
                      <span key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">#{k.keyword}</span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">2. Pin Details & Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visual Style</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md capitalize"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pins per URL</label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={pinCount}
                onChange={(e) => setPinCount(parseInt(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Article or Description (for context)</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                placeholder="Paste the full article or a detailed description here to help Gemini generate better pin content..."
                value={article}
                onChange={(e) => setArticle(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">3. Final Options</h2>
          <div className="flex items-center gap-3">
             <input
                type="checkbox"
                id="watermark"
                className="rounded text-red-600 focus:ring-red-500"
                checked={addWatermark}
                onChange={(e) => setAddWatermark(e.target.checked)}
             />
             <label htmlFor="watermark" className="text-sm font-medium">Add watermark to generated images</label>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          disabled={generating}
          type="submit"
          className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400 shadow-xl"
        >
          {generating ? "Generating..." : "Generate Pins"}
        </button>
      </form>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
