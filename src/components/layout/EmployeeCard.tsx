"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsFromMember, toEmployeePhotoSrc } from "utils/avatar";
import { getAvatarBgClass } from "utils/avatar-bg";
import { clean } from "utils/clean";
import { toExtension } from "utils/phone";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
//import confetti from "canvas-confetti";

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
  birthDate?: string | null; // YYYY-MM-DD
  hireDate?: string | null; // YYYY-MM-DD  <-- added for anniversary/new hire logic
};

type EmployeeCardProps = {
  employee: Employee;
  avatarSize?: "md" | "lg";
  className?: string;
};

// -------------------- Inline helpers (no shared utils) ---------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseISODate(iso?: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function normalize(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameMonthDay(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
function adjustFeb29ToCommonYear(month: number, day: number, year: number) {
  if (month === 1 && day === 29 && !isLeapYear(year))
    return { month: 1, day: 28 };
  return { month, day };
}
function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function ordinal(n: number) {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/**
 * Observed birthday for a given year:
 * - If birthday (this year) is Sat -> observed Fri (minus 1)
 * - If Sunday -> observed Fri (minus 2)
 * - Else the actual date
 * - Feb 29 -> Feb 28 in non-leap years
 */
function observedBirthdayForYear(birth: Date, year: number): Date {
  const { month, day } = adjustFeb29ToCommonYear(
    birth.getMonth(),
    birth.getDate(),
    year
  );
  const actual = new Date(year, month, day);
  const dow = actual.getDay(); // 0 Sun, 6 Sat
  if (dow === 6) return new Date(year, month, day - 1); // Fri
  if (dow === 0) return new Date(year, month, day - 2); // Fri
  return actual;
}

/** Returns the next observed birthday date >= today (but **not** today if we pass excludeToday=true). */
function nextObservedBirthday(
  birth: Date,
  today: Date,
  excludeToday = true
): Date {
  const t0 = normalize(today);
  const y = t0.getFullYear();
  const thisYear = observedBirthdayForYear(birth, y);
  const nextYear = observedBirthdayForYear(birth, y + 1);

  const thisTime = normalize(thisYear).getTime();
  const todayTime = t0.getTime();

  if (thisTime > todayTime) return thisYear;
  if (!excludeToday && thisTime === todayTime) return thisYear;
  return nextYear;
}

/** Is *today* the observed birthday? */
function isBirthdayTodayOrObserved(today: Date, birth?: Date | null): boolean {
  if (!birth) return false;
  const t0 = normalize(today);
  const y = t0.getFullYear();
  const observed = observedBirthdayForYear(birth, y);
  return normalize(observed).getTime() === t0.getTime();
}

/** Next anniversary (actual date, no observation); can return today unless excludeToday=true */
function nextAnniversary(hire: Date, today: Date, excludeToday = true): Date {
  const t0 = normalize(today);
  const y = t0.getFullYear();
  const { month, day } = adjustFeb29ToCommonYear(
    hire.getMonth(),
    hire.getDate(),
    y
  );
  const thisYear = new Date(y, month, day);
  const nextYear = new Date(
    y + 1,
    adjustFeb29ToCommonYear(hire.getMonth(), hire.getDate(), y + 1).month,
    adjustFeb29ToCommonYear(hire.getMonth(), hire.getDate(), y + 1).day
  );

  const thisTime = normalize(thisYear).getTime();
  const todayTime = t0.getTime();

  if (thisTime > todayTime) return thisYear;
  if (!excludeToday && thisTime === todayTime) return thisYear;
  return nextYear;
}

/** Years of service on a given anniversary date */
function yearsOnDate(hire: Date, onDate: Date) {
  return onDate.getFullYear() - hire.getFullYear();
}

/** Days between two normalized dates (target - from) */
function daysUntil(from: Date, target: Date) {
  const f = normalize(from).getTime();
  const t = normalize(target).getTime();
  return Math.round((t - f) / MS_PER_DAY);
}

/** New-hire status (within last N days, inclusive of day 0..N) */
function isWithinLastNDays(today: Date, date?: Date | null, n = 30) {
  if (!date) return false;
  const diff = normalize(today).getTime() - normalize(date).getTime();
  return diff >= 0 && diff <= n * MS_PER_DAY;
}

// --------------------------------------------------------------------------

export default function EmployeeCard({
  employee,
  avatarSize = "lg",
  className,
}: EmployeeCardProps) {
  const avatarClass = avatarSize === "lg" ? "h-24 w-24" : "h-12 w-12";
  const fallbackTextClass = avatarSize === "lg" ? "text-2xl" : "text-base";

  const enrichedForAvatar = {
    name: employee.name,
    jobtitle: employee.jobtitle,
    number: employee.number,
    extension: toExtension(employee.workphone, employee.jobtitle),
  };

  const extension = enrichedForAvatar.extension;

  // Intersection Observer for animation trigger
  const { ref, inView } = useInView({ triggerOnce: true });

  // --- Derive all flags/messages here (no shared helpers) ------------------
  const {
    isBirthdayToday,
    isAnniversaryToday,
    anniversaryYearsToday,
    isNewHire,
    upcomingBirthday, // { date, days }
    upcomingAnniversary, // { date, days, years }
  } = useMemo(() => {
    const today = new Date();
    const birth = parseISODate(employee.birthDate);
    const hire = parseISODate(employee.hireDate);

    const birthdayToday = isBirthdayTodayOrObserved(today, birth);

    // Anniversary: actual date only
    let anniversaryToday = false;
    let annivYearsToday: number | null = null;
    if (hire) {
      const { month, day } = adjustFeb29ToCommonYear(
        hire.getMonth(),
        hire.getDate(),
        today.getFullYear()
      );
      const thisYearAnniv = new Date(today.getFullYear(), month, day);
      anniversaryToday =
        normalize(thisYearAnniv).getTime() === normalize(today).getTime();
      if (anniversaryToday) {
        annivYearsToday = yearsOnDate(hire, thisYearAnniv);
      }
    }

    // Upcoming windows (within 30 days), excluding "today"
    let upcomingB: { date: Date; days: number } | null = null;
    if (birth && !birthdayToday) {
      const nextB = nextObservedBirthday(birth, today, /*excludeToday*/ true);
      const days = daysUntil(today, nextB);
      if (days >= 1 && days <= 30) {
        upcomingB = { date: nextB, days };
      }
    }

    let upcomingA: { date: Date; days: number; years: number } | null = null;
    if (hire && !anniversaryToday) {
      const nextA = nextAnniversary(hire, today, /*excludeToday*/ true);
      const days = daysUntil(today, nextA);
      if (days >= 1 && days <= 14) {
        upcomingA = { date: nextA, days, years: yearsOnDate(hire, nextA) };
      }
    }

    const newHireFlag = isWithinLastNDays(today, hire, 30);

    return {
      isBirthdayToday: birthdayToday,
      isAnniversaryToday: anniversaryToday,
      anniversaryYearsToday: annivYearsToday,
      isNewHire: newHireFlag,
      upcomingBirthday: upcomingB,
      upcomingAnniversary: upcomingA,
    };
  }, [employee.birthDate, employee.hireDate]);

  // // Confetti effect when card enters viewport and it's (actual or observed) birthday or anniversary
  // useEffect(() => {
  //   if ((isBirthdayToday || isAnniversaryToday) && inView) {
  //     const screenWidth = window.innerWidth;
  //     const particleCount = Math.max(150, Math.floor(screenWidth / 10));
  //     const scalar = Math.max(1.2, Math.min(screenWidth / 1000, 2));

  //     const burst = () => {
  //       confetti({
  //         particleCount,
  //         spread: 80,
  //         origin: { y: 0.6 },
  //         scalar,
  //       });
  //     };

  //     burst();
  //     setTimeout(burst, 300);
  //     setTimeout(burst, 600);
  //   }
  // }, [isBirthdayToday, isAnniversaryToday, inView]);

  // --- Styling priorities: Birthday > Anniversary > New Hire --------------
  const baseCardClasses =
    "rounded-xl shadow-sm transition-transform duration-200 ease-in-out text-foreground hover:scale-[1.02] hover:shadow-md cursor-pointer";

  const bgClass = isBirthdayToday
    ? "bg-pink-300"
    : isAnniversaryToday
    ? "bg-[#149386] text-white" // ACHD teal
    : "bg-background";

  // Force the job title to be white on pink/teal for readability
  const jobTitleClass = [
    "text-sm truncate",
    isBirthdayToday || isAnniversaryToday
      ? "text-white/95"
      : "text-muted-foreground",
  ].join(" ");

  // New-hire glow only when not overridden by birthday/anniversary backgrounds
  const newHireGlowClass =
    isNewHire && !isBirthdayToday && !isAnniversaryToday
      ? "ring-2 ring-offset-2 ring-offset-background ring-[#FBB040] shadow-[0_0_16px_rgba(251,176,64,0.55)]"
      : "";

  // --- Anniversary day message logic (milestones 5..55) --------------------
  const anniversaryDayMessage = isAnniversaryToday
    ? (() => {
        const y = anniversaryYearsToday ?? 0;
        const hasMilestone = y >= 5 && y <= 55;
        return hasMilestone
          ? `🎉 Happy ${ordinal(y)} ACHD Anniversary!`
          : "🎉 ACHD Anniversary";
      })()
    : null;

  return (
    <Link href={`/${employee.ACHDEmpNo}`} passHref>
      <Card
        ref={ref}
        className={[
          baseCardClasses,
          bgClass,
          newHireGlowClass,
          className ?? "",
        ].join(" ")}
      >
        <CardHeader className="flex items-center gap-4">
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
            <p className={jobTitleClass}>{clean(employee.jobtitle)}</p>

            {/* Messages area */}
            <div className="mt-1 space-y-1">
              {/* Day-of Birthday */}
              {isBirthdayToday && (
                <span className="block text-xs font-bold text-pink-700">
                  🎉 Happy Birthday!
                </span>
              )}

              {/* Day-of Anniversary */}
              {anniversaryDayMessage && (
                <span
                  className={`block text-xs font-bold ${
                    isAnniversaryToday ? "text-white/90" : "text-foreground"
                  }`}
                >
                  {anniversaryDayMessage}
                </span>
              )}

              {/* New Hire (first 30 days) */}
              {isNewHire && (
                <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-[#A76500] rounded">
                  🆕 Welcome to the ACHD family!
                </span>
              )}

              {/* Upcoming Birthday (within 30 days, excludes today) */}
              {!isBirthdayToday && upcomingBirthday && (
                <span className="block text-xs font-semibold text-pink-700">
                  🎂 Birthday in {upcomingBirthday.days} day
                  {upcomingBirthday.days === 1 ? "" : "s"} (
                  {formatShortDate(upcomingBirthday.date)})
                </span>
              )}

              {/* Upcoming Anniversary (within 30 days, excludes today) */}
              {!isAnniversaryToday && upcomingAnniversary && (
                <span className="block text-xs font-semibold text-[#0F6F65]">
                  🎉 ACHD Anniversary in {upcomingAnniversary.days} day
                  {upcomingAnniversary.days === 1 ? "" : "s"} (
                  {formatShortDate(upcomingAnniversary.date)}
                  {upcomingAnniversary.years >= 5 &&
                  upcomingAnniversary.years <= 55
                    ? ` • ${ordinal(upcomingAnniversary.years)}`
                    : ""}
                  )
                </span>
              )}
            </div>
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
            <strong>Location:</strong> {clean(employee.location)}
          </div>
          <div>
            <strong>Dept:</strong> {clean(employee.unit)}
          </div>
          <div>
            <strong>Crew:</strong> {clean(employee.crew)}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <strong>Reports To:</strong> {clean(employee.reportsto)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
