import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const volunteersQuery = queryOptions({
  queryKey: ["volunteers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("volunteers").select("*").order("rating", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const requestsQuery = queryOptions({
  queryKey: ["requests"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const studentsCountQuery = queryOptions({
  queryKey: ["students-count"],
  queryFn: async () => {
    const { count, error } = await supabase.from("students").select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  },
});
