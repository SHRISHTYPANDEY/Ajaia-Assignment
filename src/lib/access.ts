export type Access = "owner" | "shared" | null;

export function resolveAccess(ownerId: number, sharedUserIds: number[], userId: number): Access {
  if (ownerId === userId) return "owner";
  if (sharedUserIds.includes(userId)) return "shared";
  return null;
}