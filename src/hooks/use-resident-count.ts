import { useEffect, useState } from "react";
import { getResidentCount } from "@/lib/colony.functions";

let cached: number | null = null;
let pending: Promise<number> | null = null;
const listeners = new Set<(n: number) => void>();

export function refreshResidentCount() {
  pending = getResidentCount().then((n) => { cached = n; listeners.forEach((l) => l(n)); return n; }).catch(() => cached ?? 0);
  return pending;
}

export function useResidentCount() {
  const [count, setCount] = useState<number | null>(cached);
  useEffect(() => {
    listeners.add(setCount);
    if (cached === null && !pending) void refreshResidentCount();
    else if (cached !== null) setCount(cached);
    return () => { listeners.delete(setCount); };
  }, []);
  return count;
}

export function ResidentCountLabel() {
  const count = useResidentCount();
  return <>{count === null ? "—" : count} GrokBots about</>;
}
