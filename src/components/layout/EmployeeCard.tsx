"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsFromMember, toEmployeePhotoSrc } from "utils/avatar";
import { getAvatarBgClass } from "utils/avatar-bg";
import { clean } from "utils/clean";
import { toExtension } from "utils/phone";

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

/**
 * Optional avatar size control.
 * - "lg": 96px (h-24 w-24) — recommended (your request: double the size)
 * - "md": 48px (h-12 w-12) — original size
 */
type EmployeeCardProps = {
  employee: Employee;
  avatarSize?: "md" | "lg";
  className?: string;
};

export default function EmployeeCard({
  employee,
  avatarSize = "lg", // default large so both layouts show big avatars
  className,
}: EmployeeCardProps) {
  // Map avatar size to Tailwind utility classes used by shadcn Avatar
  const avatarClass = avatarSize === "lg" ? "h-24 w-24" : "h-12 w-12";
  // Only adjust text size on the fallback (it already fills the Avatar)
  const fallbackTextClass = avatarSize === "lg" ? "text-2xl" : "text-base";

  // Enrich for avatar utils (keeps your existing photo URL + initials logic intact)
  const enrichedForAvatar = {
    name: employee.name,
    jobtitle: employee.jobtitle,
    number: employee.number,
    extension: toExtension(employee.workphone, employee.jobtitle),
  };

  // Compute once for display to avoid double work in JSX
  const extension = enrichedForAvatar.extension;

  return (
    <Link href={`/${employee.ACHDEmpNo}`} passHref>
      <Card
        className={[
          "rounded-xl shadow-sm transition-transform duration-200 ease-in-out",
          "bg-background text-foreground hover:scale-[1.02] hover:shadow-md cursor-pointer",
          className ?? "",
        ].join(" ")}
      >
        <CardHeader className="flex items-center gap-4">
          {/* Avatar size controlled by avatarSize prop */}
          <Avatar className={avatarClass}>
            <AvatarImage
              src={toEmployeePhotoSrc(enrichedForAvatar)}
              alt={employee.name}
            />
            <AvatarFallback
              className={`${getAvatarBgClass(
                employee.jobtitle
              )} text-white font-semibold ${fallbackTextClass}`}
            >
              {getInitialsFromMember(enrichedForAvatar)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">
              {clean(employee.name)}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {clean(employee.jobtitle)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
          <div>
            <strong>Extension:</strong> {extension}
          </div>
          <div>
            <strong>Cell:</strong> {clean(employee.number)}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <strong>Email:</strong> {clean(employee.email)}
          </div>
          <div>
            <strong>Unit:</strong> {clean(employee.unit)}
          </div>
          <div>
            <strong>Crew:</strong> {clean(employee.crew)}
          </div>
          <div>
            <strong>Dept:</strong> {clean(employee.prdept)}
          </div>
          <div>
            <strong>Location:</strong> {clean(employee.location)}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <strong>Reports To:</strong> {clean(employee.reportsto)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
