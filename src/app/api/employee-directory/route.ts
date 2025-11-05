// src/app/api/employee-directory/route.ts
import { NextResponse } from "next/server";
import sql from "mssql";
import { clean } from "utils/clean";
import { toExtension } from "utils/phone";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  options: { encrypt: true, trustServerCertificate: false },
};

type EmployeeRow = {
  ACHDEmpNo: number | string;
  name: string | null;
  jobtitle: string | null;
  workphone: string | null;
  number: string | null; // cell
  email: string | null;
  unit: string | null;
  crew: string | null;
  prdept: string | null;
  location: string | null;
  reportsto: string | null;
  birthDate: string | null; // <-- NEW
  hireDate: string | null; // <-- NEW
};

type DirectoryMember = {
  ACHDEmpNo: string;
  name: string;
  firstName: string;
  lastName: string;
  jobtitle: string | null;
  workphone: string | null;
  extension: string | null;
  number: string | null;
  email: string | null;
  unit: string;
  crew: string;
  prdept: string | null;
  location: string | null;
  reportsto: string | null;
  birthDate: string | null; // <-- NEW
  hireDate: string | null; // <-- NEW
};

type Group = {
  unit: string;
  crew: string;
  members: DirectoryMember[];
};

const digitsOnly = (s?: string | null) => (s ?? "").replace(/\D+/g, "");

export async function GET(req: Request) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const searchRaw = searchParams.get("search")?.trim() ?? "";
    const search = searchRaw.toLowerCase();
    const searchDigits = digitsOnly(searchRaw);

    pool = await sql.connect(config);

    const request = pool.request();
    request.input("search", sql.NVarChar(sql.MAX), search);
    request.input("searchDigits", sql.NVarChar(64), searchDigits);

    const result = await request.query<EmployeeRow>(`
      SELECT 
        ed.PREmp     AS ACHDEmpNo,
        ed.Name      AS name,
        ed.JobTitle  AS jobtitle,
        ed.WorkPhone AS workphone,
        ed.CellPhone AS number,
        ed.Email     AS email,
        ed.Unit      AS unit,
        ed.Crew      AS crew,
        ed.PRDept    AS prdept,
        ed.Location  AS location,
        ed.Reviewer  AS reportsto,
        ed.BirthDate AS birthDate,  -- <-- NEW COLUMN
        ed.HireDate AS hireDate  -- <-- NEW COLUMN
      FROM dbo.tEmployeesDetails ed
      WHERE ed.Name NOT LIKE '%test%' 
        AND ed.Name NOT LIKE '%wireless%'
        AND (
          @search = '' OR
          LOWER(ed.Name)     LIKE '%' + @search + '%' OR
          LOWER(ed.JobTitle) LIKE '%' + @search + '%' OR
          LOWER(ed.PRDept)   LIKE '%' + @search + '%' OR
          LOWER(ed.Email)    LIKE '%' + @search + '%' OR
          LOWER(ed.Unit)     LIKE '%' + @search + '%' OR
          LOWER(ed.Crew)     LIKE '%' + @search + '%' OR
          LOWER(ed.Location) LIKE '%' + @search + '%' OR
          (
            @searchDigits <> '' AND
            (
              REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(ed.WorkPhone,''),'(',''),')',''),'-',''),' ','')
                LIKE '%' + @searchDigits + '%' OR
              REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(ed.CellPhone,''),'(',''),')',''),'-',''),' ','')
                LIKE '%' + @searchDigits + '%'
            )
          )
        )
      ORDER BY ed.Unit, ed.Crew, ed.Name;
    `);

    const rows = result.recordset;

    const groupsMap = new Map<string, Group>();

    const suffixes = new Set<string>([
      "jr",
      "jr.",
      "sr",
      "sr.",
      "ii",
      "iii",
      "iv",
      "v",
    ]);
    const splitName = (full = ""): { first: string; last: string } => {
      const s = (full || "").trim().replace(/\s+/g, " ");
      if (!s) return { first: "", last: "" };
      if (s.includes(",")) {
        const [last, first] = s.split(",", 2).map((t) => t.trim());
        return { first: first || "", last: last || "" };
      }
      const parts = s.split(" ");
      const tail = parts.at(-1)?.toLowerCase();
      const cleanedParts =
        tail && suffixes.has(tail) ? parts.slice(0, -1) : parts;
      if (cleanedParts.length === 1)
        return { first: "", last: cleanedParts[0] };
      return {
        first: cleanedParts.slice(0, -1).join(" "),
        last: cleanedParts.at(-1) || "",
      };
    };

    for (const r of rows) {
      const unit = clean(r.unit) || "Unassigned";
      const crew = clean(r.crew) || "Unassigned";
      const key = `${unit}|||${crew}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, { unit, crew, members: [] });
      }
      const { first, last } = splitName(clean(r.name));

      const member: DirectoryMember = {
        ACHDEmpNo: String(r.ACHDEmpNo),
        name: clean(r.name),
        firstName: first,
        lastName: last,
        jobtitle: clean(r.jobtitle),
        workphone: r.workphone ?? null,
        extension: toExtension(r.workphone, r.jobtitle) ?? null,
        number: clean(r.number) || null,
        email: clean(r.email) || null,
        unit,
        crew,
        prdept: clean(r.prdept),
        location: clean(r.location),
        reportsto: clean(r.reportsto),
        birthDate: r.birthDate
          ? new Date(r.birthDate).toISOString().split("T")[0]
          : null, // <-- formatted date

        hireDate: r.hireDate
          ? new Date(r.hireDate).toISOString().split("T")[0]
          : null, // <-- NEW
      };

      groupsMap.get(key)!.members.push(member);
    }

    const groups: Group[] = Array.from(groupsMap.values());

    groups.sort(
      (a, b) =>
        a.unit.localeCompare(b.unit, undefined, { sensitivity: "base" }) ||
        a.crew.localeCompare(b.crew, undefined, { sensitivity: "base" })
    );

    for (const g of groups) {
      g.members.sort((a, b) => {
        const aL = splitName(a.name).last.toLowerCase();
        const bL = splitName(b.name).last.toLowerCase();
        if (aL !== bL) return aL.localeCompare(bL);
        const aF = splitName(a.name).first.toLowerCase();
        const bF = splitName(b.name).first.toLowerCase();
        return aF.localeCompare(bF);
      });
    }

    return NextResponse.json(groups, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  } finally {
    try {
      await pool?.close();
    } catch {
      /* noop */
    }
  }
}
