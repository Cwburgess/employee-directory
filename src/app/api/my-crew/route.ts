// src/app/api/my-crew/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";
import sql from "mssql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const config: sql.config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  options: { encrypt: true, trustServerCertificate: false },
};

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  };
}

/**
 * Minimal user shape we need from NextAuth.
 * If you've extended the NextAuth session types elsewhere, this still works.
 */
type BasicUser = { name?: string | null; email?: string | null };

function getUserKey(user: BasicUser | null | undefined): string | null {
  const email = user?.email?.trim();
  if (email) return email;
  const name = user?.name?.trim();
  return name ?? null;
}

// Row shapes for each query
type MappedRow = { crew: string | null; team: string | null };
type DirectoryRow = { crew: string | null; unit: string | null };
type CrewRow = { CrewID: number; CrewName: string; DepartmentName: string };
type TeamRow = { TeamName: string };

export async function GET() {
  let pool: sql.ConnectionPool | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const displayName = session.user.name; // e.g., "Clint Burgess"
    pool = await sql.connect(config);

    // Prefer an explicit mapping first
    const userKey = getUserKey(session.user);
    if (userKey) {
      const mapped = await pool.request().input("uk", sql.NVarChar, userKey)
        .query<MappedRow>(`
          SELECT TOP 1 g.CrewName AS crew, t.TeamName AS team
          FROM dbo.tUserTeams u
          JOIN dbo.tGanntCrews g ON g.CrewID = u.CrewID
          LEFT JOIN dbo.tTeams t ON t.TeamID = u.TeamID
          WHERE u.UserKey = @uk
          ORDER BY u.CreatedAtUtc DESC
        `);

      if (mapped.recordset.length) {
        const { crew, team } = mapped.recordset[0];
        return NextResponse.json(
          { crew, unit: null, team },
          { headers: noStoreHeaders() }
        );
      }
    }

    // 1) Lookup user crew/unit from directory details
    const dir = await pool.request().input("name", sql.NVarChar, displayName)
      .query<DirectoryRow>(`
        SELECT TOP 1
          ed.Crew AS crew,
          ed.Unit AS unit
        FROM dbo.tEmployeesDetails ed
        WHERE ed.Name = @name
      `);

    if (dir.recordset.length === 0) {
      return NextResponse.json(
        { crew: null, unit: null, team: null },
        { headers: noStoreHeaders() }
      );
    }

    const crewName: string | null = dir.recordset[0].crew ?? null;
    const unit: string | null = dir.recordset[0].unit ?? null;

    if (!crewName) {
      return NextResponse.json(
        { crew: null, unit, team: null },
        { headers: noStoreHeaders() }
      );
    }

    // 2) Resolve CrewID by CrewName; if duplicate names exist across departments,
    //    we just pick TOP(1).
    const crewRow = await pool
      .request()
      .input("crewName", sql.NVarChar, crewName).query<CrewRow>(`
        SELECT TOP 1 CrewID, CrewName, DepartmentName
        FROM dbo.tGanntCrews
        WHERE CrewName = @crewName
        ORDER BY CrewID
      `);

    if (crewRow.recordset.length === 0) {
      return NextResponse.json(
        { crew: crewName, unit, team: null },
        { headers: noStoreHeaders() }
      );
    }

    const crewId = crewRow.recordset[0].CrewID;

    // 3) If Unit matches a TeamName under this CrewID, return that team
    let team: string | null = null;
    if (unit) {
      const teamRow = await pool
        .request()
        .input("crewId", sql.Int, crewId)
        .input("unit", sql.NVarChar, unit).query<TeamRow>(`
          SELECT TOP 1 TeamName
          FROM dbo.tTeams
          WHERE CrewID = @crewId AND TeamName = @unit
        `);

      if (teamRow.recordset.length > 0) {
        team = teamRow.recordset[0].TeamName;
      }
    }

    return NextResponse.json(
      {
        crew: crewName,
        unit, // the raw directory unit (useful for debugging)
        team, // normalized TeamName if it exists for crew
      },
      { headers: noStoreHeaders() }
    );
  } catch (err) {
    console.error("GET /api/my-crew error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  } finally {
    try {
      await pool?.close();
    } catch {
      /* noop */
    }
  }
}
