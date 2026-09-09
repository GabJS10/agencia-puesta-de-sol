"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  content: string | null;
}

interface PlanTabsProps {
  items: TabItem[];
}

export function PlanTabs({ items }: PlanTabsProps) {
  // Filter out tabs with no content
  const validItems = items.filter((item) => item.content && item.content.trim());

  const [activeTab, setActiveTab] = useState(validItems[0]?.id);

  if (validItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* Tabs Header */}
      <div className="border-b border-border">
        <div className="flex gap-8 overflow-x-auto">
          {validItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "pb-4 text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer",
                activeTab === item.id
                  ? "text-primary font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground",
              )}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
        {validItems.map((item) => {
          if (item.id !== activeTab) return null;
          return (
            <div
              key={item.id}
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:!text-foreground prose-p:!text-foreground prose-li:!text-foreground prose-strong:!text-foreground"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content!}
              </ReactMarkdown>
            </div>
          );
        })}
      </div>
    </div>
  );
}
