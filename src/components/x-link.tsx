import { X_URL, xReady } from "@/lib/site-config";

export function XLink({ className = "" }: { className?: string }) {
  if (!xReady) return <span className={`font-mono text-xs text-muted-foreground ${className}`}>X · coming online</span>;
  return <a href={X_URL} target="_blank" rel="noopener noreferrer" className={`font-mono text-xs text-accent hover:text-foreground ${className}`}>X</a>;
}
