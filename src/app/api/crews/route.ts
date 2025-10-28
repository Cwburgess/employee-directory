// src/app/api/crews/route.ts
import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const pool = await sql.connect(config);

    // Distinct crews from your Crew table (name + dept)
    const result = await pool.request().query(`
      SELECT DISTINCT
        CrewName    AS crewName,
        DepartmentName AS departmentName
      FROM tGanntCrews
      WHERE IsActive = 1
      ORDER BY CrewName, DepartmentName
    `);

    return NextResponse.json(
      { items: result.recordset },
      { headers: noStoreHeaders() }
    );
  } catch (err) {
    console.error("GET /api/crews error:", err);
    return NextResponse.json({ error: "Crew list failed" }, { status: 500 });
  }
}
