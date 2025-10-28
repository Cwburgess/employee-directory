"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsFromMember, toEmployeePhotoSrc } from "utils/avatar";
import { getAvatarBgClass } from "utils/avatar-bg";
import { clean } from "utils/clean";
import { toExtension } from "utils/phone";

/** Match the shape you already pass in from the [empId] route */
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
 * Optional avatar size control for detail page:
 * - "md" = 48px  (h-12 w-12)
 * - "lg" = 96px  (h-24 w-24)
 * - "xl" = 128px (h-32 w-32) ← default (large avatar)
 */
type EmployeeDetailProps = {
  employee: Employee;
  avatarSize?: "md" | "lg" | "xl";
  className?: string;
};

/* ---------- Internal size maps for Avatar + fallback text ---------- */
const AVATAR_SIZE_CLASS: Record<
  NonNullable<EmployeeDetailProps["avatarSize"]>,
  string
> = {
  md: "h-12 w-12",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const FALLBACK_TEXT_CLASS: Record<
  NonNullable<EmployeeDetailProps["avatarSize"]>,
  string
> = {
  md: "text-base",
  lg: "text-2xl",
  xl: "text-3xl",
};

export default function EmployeeDetail({
  employee,
  avatarSize = "xl", // default to large avatar
  className,
}: EmployeeDetailProps) {
  // Enrich for avatar utils (preserves your existing photo URL + initials logic)
  const enrichedForAvatar = {
    name: employee.name,
    jobtitle: employee.jobtitle,
    number: employee.number,
    extension: toExtension(employee.workphone, employee.jobtitle),
  };

  const avatarClass = AVATAR_SIZE_CLASS[avatarSize];
  const fallbackTextClass = FALLBACK_TEXT_CLASS[avatarSize];

  // Pre-clean frequently displayed values to avoid repeating clean() in JSX
  const name = clean(employee.name);
  const title = clean(employee.jobtitle);
  const email = clean(employee.email);
  const unit = clean(employee.unit);
  const crew = clean(employee.crew);
  const dept = clean(employee.prdept);
  const location = clean(employee.location);
  const reportsTo = clean(employee.reportsto);
  const cell = clean(employee.number);
  const extension = enrichedForAvatar.extension;

  return (
    <Card
      className={[
        "rounded-xl shadow-sm bg-background text-foreground",
        "overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      {/* Header: large avatar + name & title */}
      <CardHeader>
        <div className="flex items-center gap-6">
          <Avatar className={avatarClass}>
            <AvatarImage
              src={toEmployeePhotoSrc(enrichedForAvatar)}
              alt={name}
            />
            <AvatarFallback
              className={`${getAvatarBgClass(
                employee.jobtitle
              )} text-white font-semibold ${fallbackTextClass} ${avatarClass}`}
            >
              {getInitialsFromMember(enrichedForAvatar)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight break-words">
              {name}
            </h1>
            <p className="text-base text-muted-foreground break-words">
              {title}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Content: details grid */}
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {/* Contact */}
          <DetailRow label="Extension" value={extension} />
          <DetailRow label="Cell" value={cell} />
          <DetailRow label="Email" value={email} isEmail />
          <DetailRow label="Location" value={location} />

          {/* Org info */}
          <DetailRow label="Department" value={dept} />
          <DetailRow label="Unit" value={unit} />
          <DetailRow label="Crew" value={crew} />
          <DetailRow label="Reports To" value={reportsTo} />
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground justify-between flex-wrap gap-2">
        <div>Employee ID: {employee.ACHDEmpNo}</div>
      </CardFooter>
    </Card>
  );
}

/* ---------- Reusable labeled value row ---------- */
function DetailRow({
  label,
  value,
  isEmail = false,
}: {
  label: string;
  value: string | null | undefined;
  isEmail?: boolean;
}) {
  const display = (value ?? "").trim();
  const hasValue = Boolean(display);

  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 font-semibold">{label}:</span>
      <span className="break-words">
        {hasValue ? (
          isEmail ? (
            <a
              href={`mailto:${display}`}
              className="underline decoration-dotted underline-offset-2 hover:text-primary"
            >
              {display}
            </a>
          ) : (
            display
          )
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    </div>
  );
}
