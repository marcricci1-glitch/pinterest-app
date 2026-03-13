"use client";

import { useState } from "react";
import { Send, Calendar, CheckCircle2, Loader2 } from "lucide-react";

export default function PinActionButtons({ pinId, status }: { pinId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handlePublish = async (type: "instant" | "schedule") => {
    setLoading(true);
    setTimeout(() => {
        setCurrentStatus(type === "instant" ? "published" : "scheduled");
        setLoading(false);
    }, 1000);
  };

  if (currentStatus === "published") {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-bold py-2 bg-green-50 rounded-lg">
        <CheckCircle2 size={16} />
        Published
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => handlePublish("instant")}
        disabled={loading}
        className="flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Publish
      </button>
      <button
        onClick={() => handlePublish("schedule")}
        disabled={loading}
        className="flex items-center justify-center gap-1 bg-black text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition"
      >
        <Calendar size={14} />
        Schedule
      </button>
    </div>
  );
}
