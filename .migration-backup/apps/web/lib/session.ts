export type ThreadItem =
  | { id: string; type: "user"; text: string }
  | { id: string; type: "system"; payload: any };

export function uid() {
  return crypto.randomUUID();
}
