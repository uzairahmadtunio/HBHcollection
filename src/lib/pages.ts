import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  updated_at: string;
};

export type JobRow = {
  id: string;
  title: string;
  type: string;
  location: string | null;
  requirements: string | null;
  is_active: boolean;
  display_order: number;
};

export function pageQuery(slug: string) {
  return queryOptions({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as PageRow | null;
    },
    staleTime: 60 * 1000,
  });
}

export const allPagesQuery = queryOptions({
  queryKey: ["pages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("pages").select("*").order("slug");
    if (error) throw error;
    return (data ?? []) as PageRow[];
  },
});

export const jobsQuery = queryOptions({
  queryKey: ["jobs", "active"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (error) throw error;
    return (data ?? []) as JobRow[];
  },
  staleTime: 60 * 1000,
});

export const allJobsQuery = queryOptions({
  queryKey: ["jobs", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("jobs").select("*").order("display_order");
    if (error) throw error;
    return (data ?? []) as JobRow[];
  },
});

/* ---------- markdown-lite parsing ---------- */

export type Block =
  | { kind: "heading"; text: string }
  | { kind: "note"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "para"; text: string };

export function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };
  for (const raw of (content ?? "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "heading", text: line.slice(3) });
    } else if (line.startsWith("_") && line.endsWith("_") && line.length > 2) {
      flush();
      blocks.push({ kind: "note", text: line.slice(1, -1) });
    } else if (/^([•\-*]|\d+\.)\s/.test(line)) {
      list.push(line.replace(/^([•\-*]|\d+\.)\s/, ""));
    } else {
      flush();
      blocks.push({ kind: "para", text: line });
    }
  }
  flush();
  return blocks;
}

export type FaqSection = { title: string; items: { q: string; a: string }[] };

export function parseFaq(content: string): FaqSection[] {
  const sections: FaqSection[] = [];
  let current: FaqSection | null = null;
  let q: string | null = null;
  let a: string[] = [];

  const pushQa = () => {
    if (current && q) current.items.push({ q, a: a.join("\n").trim() });
    q = null;
    a = [];
  };

  for (const raw of (content ?? "").split("\n")) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      pushQa();
      current = { title: line.slice(3), items: [] };
      sections.push(current);
    } else if (/^Q:\s*/.test(line)) {
      pushQa();
      q = line.replace(/^Q:\s*/, "");
    } else if (/^A:\s*/.test(line)) {
      a = [line.replace(/^A:\s*/, "")];
    } else if (line && q) {
      a.push(line);
    }
  }
  pushQa();
  return sections.filter((s) => s.items.length);
}
