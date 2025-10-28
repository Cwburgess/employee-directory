// src/components/EmployeeDialog.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
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

export default function EmployeeDialog({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) router.back();
      }}
    >
      <DialogContent
        className={cn(
          // mobile: full-screen sheet
          "p-0 gap-0 w-[100vw] h-[100dvh] max-w-none rounded-none",
          // desktop: classic modal
          "md:w-full md:h-auto md:max-w-3xl md:rounded-xl md:overflow-hidden"
        )}
      >
        {/* ACHD-branded header */}
        <DialogHeader
          className={cn(
            "sticky top-0 z-10 px-4 py-3",
            "bg-gradient-to-r from-[#149386] via-[#144577] to-[#004C23]",
            "text-white shadow-sm",
            "border-b border-[#FBB040]/70" // subtle orange accent
          )}
        >
          <DialogTitle className="text-base md:text-lg">
            {employee.name}
          </DialogTitle>
          <DialogDescription className="text-white/80 text-xs md:text-sm">
            {employee.jobtitle}
          </DialogDescription>

          {/* Close button (keeps router.back() via onOpenChange) */}
          <DialogClose
            className={cn(
              "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md",
              "text-white/85 hover:text-white",
              "hover:bg-white/10 active:bg-white/15 focus:outline-none focus-visible:ring-2",
              "focus-visible:ring-white/60 focus-visible:ring-offset-0"
            )}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <span className="text-xl leading-none">&times;</span>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="h-[calc(100dvh-3rem)] overflow-y-auto md:h-auto md:max-h-[85vh] bg-background">
          <div className="p-4 md:p-6">
            <EmployeeDetail employee={employee} avatarSize="xl" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
