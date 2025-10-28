export function getAvatarBgClass(jobtitle: string): string {
  const title = jobtitle.toLowerCase();

  if (title.includes("manager")) return "bg-blue-600";
  if (title.includes("supervisor")) return "bg-green-600";
  if (title.includes("coordinator")) return "bg-purple-600";
  if (title.includes("technician")) return "bg-orange-600";
  if (title.includes("engineer")) return "bg-teal-600";
  if (title.includes("director")) return "bg-red-600";
  if (title.includes("analyst")) return "bg-yellow-600";

  // Default fallback
  return "bg-gray-500";
}
