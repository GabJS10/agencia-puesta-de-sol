"use client";

import { useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

interface TabItem {
  id: string;
  label: string;
  content: BlocksContent | null;
}

interface PlanTabsProps {
  items: TabItem[];
}

export function PlanTabs({ items }: PlanTabsProps) {
  // Filter out tabs with no content
  const validItems = items.filter((item) => item.content);

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
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:!text-foreground prose-p:!text-foreground prose-li:!text-foreground prose-strong:!text-foreground dark:prose-headings:!text-foreground dark:prose-p:!text-foreground dark:prose-li:!text-foreground dark:prose-strong:!text-foreground"
            >
              <BlocksRenderer
                content={item.content!}
                blocks={{
                  paragraph: ({ children }) => (
                    <p className="!text-foreground mb-4">
                      {children}
                    </p>
                  ),
                  heading: ({ children, level }) => {
                    const Tag = `h${level}` as React.ElementType;
                    return (
                      <Tag className="!text-foreground font-semibold my-4">
                        {children}
                      </Tag>
                    );
                  },
                  list: ({ children, format }) => {
                    const Tag = (format === "ordered" ? "ol" : "ul") as React.ElementType;
                    return (
                      <Tag className="!text-foreground list-inside my-4">
                        {children}
                      </Tag>
                    );
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
