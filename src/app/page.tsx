import { Suspense } from "react";
import EmployeeDirectoryClient from "./EmployeeDirectoryClient";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div className="p-4">Loading directory…</div>}>
        <EmployeeDirectoryClient />
      </Suspense>
    </div>
  );
}
