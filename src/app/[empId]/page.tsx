import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EmployeeDetail from "@/components/layout/EmployeeDetail";

type Employee = {
  ACHDEmpNo: string;
  name: string;
  jobtitle: string;
  workphone: string;
  number: string;
  email: string;
  unit: string;
  crew: string;
  prdept: string;
  location: string;
  reportsto: string;
};

type Props = {
  // ⬇️ Next.js 15: params is a Promise in App Router files
  params: Promise<{ empId: string }>;
};

/**
 * Build an absolute base URL from request headers (async).
 */
async function getBaseUrlFromHeaders(): Promise<string> {
  const h = await headers(); // ⬅️ Next 15 requires awaiting request-bound APIs
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export default async function EmployeeProfilePage({ params }: Props) {
  const { empId } = await params; // ✅ required in Next 15

  let employee: Employee | null = null;

  try {
    const url = `/api/employee-directory/${encodeURIComponent(empId)}`;
    console.log("[EmployeeProfilePage] fetching", { empId, url });
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (res.status === 404) notFound();

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[EmployeeProfilePage] fetch failed", {
        status: res.status,
        statusText: res.statusText,
        url,
        body: body.slice(0, 500),
      });
      throw new Error(`Employee detail fetch failed (${res.status})`);
    }

    employee = (await res.json()) as Employee;
  } catch (err) {
    console.error("Failed to load employee detail:", err);
  }

  if (!employee) {
    return (
      <main className="p-6">
        <div className="text-center text-red-500">
          Employee not found or failed to load.
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <EmployeeDetail employee={employee} avatarSize="xl" />
    </main>
  );
}
