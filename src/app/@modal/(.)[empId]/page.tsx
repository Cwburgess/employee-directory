// src/app/@modal/(.)[empId]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EmployeeDialog from "@/components/EmployeeDialog"; // client wrapper
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
  // Next.js 15: params is a Promise
  params: Promise<{ empId: string }>;
};

/** Build an absolute base URL from request headers (async). */
async function getBaseUrlFromHeaders(): Promise<string> {
  const h = await headers(); // Next 15 requires awaiting request-bound APIs
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export default async function EmployeeModalPage({ params }: Props) {
  const { empId } = await params; // Next 15: await params
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || (await getBaseUrlFromHeaders());

  const res = await fetch(
    `${baseUrl}/api/employee-directory/${encodeURIComponent(empId)}`,
    { cache: "no-store", next: { revalidate: 0 } }
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

  const employee = (await res.json()) as Employee;

  // Render the dialog (client component) containing your existing detail UI
  return <EmployeeDialog employee={employee} />;
}
