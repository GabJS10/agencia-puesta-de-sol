"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <div role="tablist" className="flex gap-1.5 overflow-x-auto border-b-[1.5px] border-border">
        {validItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active}
              aria-controls={`panel-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative min-h-[52px] cursor-pointer whitespace-nowrap px-4 text-base font-bold transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {active && (
                <motion.span
                  layoutId="plan-tab-underline"
                  className="absolute inset-x-3 -bottom-[1.5px] h-[3px] rounded-full bg-sol"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      {validItems.map((item) => {
        if (item.id !== activeTab) return null;
        return (
          <div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            className="prose prose-lg prose-slate min-h-[200px] max-w-none dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:!text-foreground prose-p:!text-foreground/85 prose-li:!text-foreground/85 prose-li:marker:text-sol prose-strong:!text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content!}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
