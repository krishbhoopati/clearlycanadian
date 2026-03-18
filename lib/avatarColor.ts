const PALETTE = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#6366f1','#ec4899'];

export function avatarColor(name: string): string {
  return PALETTE[name.charCodeAt(0) % PALETTE.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
