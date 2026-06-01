import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

export type SignedMedia = {
  id: string;
  url: string | null;
  thumbUrl: string | null;
};

/** Signed URL for a single object path. Private bucket → expires. */
export async function getSignedUrl(path: string | null, expiresSec = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresSec);
  if (error) return null;
  return data.signedUrl;
}

/** Batch-sign multiple paths in one round-trip when possible. */
export async function signMany(paths: string[], expiresSec = 3600): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, expiresSec);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const d of data) {
    if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  }
  return out;
}
