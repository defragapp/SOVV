export type StoredArtifact = {
  id: string;
  type: "audio" | "video";
  title: string;
  createdAt: number;
  payload: any;
};

const KEY = "sovereign_artifacts_v1";

export function loadArtifacts(): StoredArtifact[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveArtifact(a: StoredArtifact) {
  const items = loadArtifacts();
  items.unshift(a);
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
}
