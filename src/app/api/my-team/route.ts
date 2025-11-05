import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";
import sql from "mssql";
import { z } from "zod";

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

const BodySchema = z.object({
  // either (crewName, departmentName) or just crewName if unique in your DB
  crewName: z.string().min(1),
  departmentName: z.string().optional(), // optional if crew names are unique
  teamName: z.string().optional(), // optional; if omitted, we set only CrewID
});

/* ---------- Types for query rows ---------- */
type UserTeamRow = {
  crewName: string | null;
  departmentName: string | null;
  teamName: string | null;
};

type CrewIdRow = {
  CrewID: number;
};

type TeamIdRow = {
  TeamID: number;
};

/* ---------- Session helper without `any` ---------- */
async function getUserKey(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const email = session.user?.email?.trim();
  if (email) return email;
  const name = session.user?.name?.trim();
  return name ?? null;
}

/* ---------------- GET: return my mapping ---------------- */
export async function GET() {
  try {
    const userKey = await getUserKey();
    if (!userKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await sql.connect(config);

    const res = await pool.request().input("uk", sql.NVarChar, userKey)
      .query<UserTeamRow>(`
        SELECT
          g.CrewName       AS crewName,
          g.DepartmentName AS departmentName,
          t.TeamName       AS teamName
        FROM dbo.tUserTeams u
        JOIN dbo.tGanntCrews g ON g.CrewID = u.CrewID
        LEFT JOIN dbo.tTeams t ON t.TeamID = u.TeamID
        WHERE u.UserKey = @uk
      `);

    if (res.recordset.length === 0) {
      return NextResponse.json(
        { crewName: null, departmentName: null, teamName: null },
        { headers: noStoreHeaders() }
      );
    }

    // recordset[0] is now strongly typed as UserTeamRow
    return NextResponse.json(res.recordset[0], { headers: noStoreHeaders() });
  } catch (err) {
    console.error("GET /api/my-team error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

/* ---------------- POST: upsert my mapping ---------------- */
export async function POST(req: NextRequest) {
  try {
    const userKey = await getUserKey();
    if (!userKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { crewName, departmentName, teamName } = parsed.data;

    const pool = await sql.connect(config);

    // Resolve CrewID
    const crewReq = pool.request().input("crewName", sql.NVarChar, crewName);
    let crewSql = `SELECT CrewID FROM dbo.tGanntCrews WHERE CrewName=@crewName`;
    if (departmentName) {
      crewReq.input("dept", sql.NVarChar, departmentName);
      crewSql += ` AND DepartmentName=@dept`;
    }
    const crewRes = await crewReq.query<CrewIdRow>(crewSql + `;`);
    if (crewRes.recordset.length === 0) {
      return NextResponse.json({ error: "Crew not found" }, { status: 404 });
    }
    const crewId = crewRes.recordset[0].CrewID;

    // Resolve TeamID (optional, must belong to CrewID)
    let teamId: number | null = null;
    if (teamName && teamName.trim()) {
      const tRes = await pool
        .request()
        .input("crewId", sql.Int, crewId)
        .input("teamName", sql.NVarChar, teamName)
        .query<TeamIdRow>(
          `SELECT TeamID FROM dbo.tTeams WHERE CrewID=@crewId AND TeamName=@teamName;`
        );

      if (tRes.recordset.length === 0) {
        return NextResponse.json(
          { error: "Team not found for this crew" },
          { status: 404 }
        );
      }
      teamId = tRes.recordset[0].TeamID;
    }

    // Upsert
    await pool
      .request()
      .input("uk", sql.NVarChar, userKey)
      .input("crewId", sql.Int, crewId)
      .input("teamId", sql.Int, teamId).query(`
        MERGE dbo.tUserTeams AS tgt
        USING (SELECT @uk AS UserKey, @crewId AS CrewID, @teamId AS TeamID) AS src
        ON (tgt.UserKey = src.UserKey)
        WHEN MATCHED THEN
          UPDATE SET CrewID = src.CrewID, TeamID = src.TeamID
        WHEN NOT MATCHED THEN
          INSERT (UserKey, CrewID, TeamID) VALUES (src.UserKey, src.CrewID, src.TeamID);
      `);

    return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  } catch (err) {
    console.error("POST /api/my-team error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/* ---------------- DELETE: clear my mapping ---------------- */
export async function DELETE() {
  try {
    const userKey = await getUserKey();
    if (!userKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await sql.connect(config);
    await pool
      .request()
      .input("uk", sql.NVarChar, userKey)
      .query(`DELETE FROM dbo.tUserTeams WHERE UserKey = @uk;`);

    return NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  } catch (err) {
    console.error("DELETE /api/my-team error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
