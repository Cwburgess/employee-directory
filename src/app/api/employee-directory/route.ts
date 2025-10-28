// src/app/api/employee-directory/route.ts
import { NextResponse } from "next/server";
import sql from "mssql";
import { clean } from "utils/clean";
import { toExtension } from "utils/phone";

// Avoid route caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

const config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  options: { encrypt: true, trustServerCertificate: false },
};

export async function GET(req: Request) {
  let pool: sql.ConnectionPool | null = null;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

    pool = await sql.connect(config);

    const result = await pool.request().query(`
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
        ed.Reviewer  AS reportsto
      FROM dbo.tEmployeesDetails ed
      WHERE ed.Name NOT LIKE '%test%' 
        AND ed.Name NOT LIKE '%wireless%'
      ORDER BY ed.Unit, ed.Crew, ed.Name
    `);

    const rows = result.recordset as any[];

    // Apply search filter client-side

    const filteredRows = search
      ? rows.filter((r) => {
          const name = String(r.name || "").toLowerCase();
          const job = String(r.jobtitle || "").toLowerCase();
          const dept = String(r.prdept || "").toLowerCase();
          const email = String(r.email || "").toLowerCase();
          return (
            name.includes(search) ||
            job.includes(search) ||
            dept.includes(search) ||
            email.includes(search)
          );
        })
      : rows;

    const groupsMap = new Map<
      string,
      { unit: string; crew: string; members: any[] }
    >();

    const suffixes = new Set([
      "jr",
      "jr.",
      "sr",
      "sr.",
      "ii",
      "iii",
      "iv",
      "v",
    ]);
    const splitName = (full = "") => {
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

    for (const r of filteredRows) {
      const unit = clean(r.unit) || clean(r.prdept) || "Unassigned";
      const crew = clean(r.crew) || "Unassigned";
      const key = `${unit}|||${crew}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, { unit, crew, members: [] });
      }

      groupsMap.get(key)!.members.push({
        ACHDEmpNo: String(r.ACHDEmpNo),
        name: clean(r.name),
        jobtitle: clean(r.jobtitle),
        workphone: r.workphone ?? null,
        extension: toExtension(r.workphone, r.jobtitle),
        number: clean(r.number),
        email: clean(r.email),
        unit,
        crew,
        prdept: clean(r.prdept),
        location: clean(r.location),
        reportsto: clean(r.reportsto),
      });
    }

    const groups = Array.from(groupsMap.values());

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
