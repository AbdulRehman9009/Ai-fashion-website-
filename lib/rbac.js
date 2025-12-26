export const RolePaths = {
  USER: ["/dashboard/user"],
  TAILOR: ["/dashboard/tailor"],
  DELIVERY: ["/dashboard/delivery"],
  SHOPKEEPER: ["/dashboard/shopkeeper"],
  ADMIN: ["/dashboard/admin"],
};

export function canAccessPath(role, path) {
  const allowed = RolePaths[role] || [];
  return allowed.some((p) => path.startsWith(p));
}

