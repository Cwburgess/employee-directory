import { NextResponse } from "next/server";
import sql from "mssql";
import { clean } from "utils/clean";

// Ensure this route runs in Node.js (required for 'mssql')
export const runtime = "nodejs";

const config: sql.config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  options: { encrypt: true, trustServerCertificate: false },
};

export async function GET(
  _request: Request,
  // ⬇️ In Next.js 15, params is a Promise in App Router files
  { params }: { params: Promise<{ empId: string }> }
) {
  try {
    const { empId } = await params; // ⬅️ required in Next.js 15

    const pool = await sql.connect(config);

    // Use a parameterized query (no string interpolation)
    const result = await pool.request().input("empId", sql.VarChar(50), empId) // change to sql.Int if PREmp is numeric
      .query(`
        SELECT 
          ed.PREmp        AS ACHDEmpNo,
          ed.Name         AS name,
          ed.JobTitle     AS jobtitle,
          ed.WorkPhone    AS workphone,
          ed.CellPhone    AS number,
          ed.Email        AS email,
          ed.Unit         AS unit,
          ed.Crew         AS crew,
          ed.PRDept       AS prdept,
          ed.Location     AS location,
          ed.Reviewer     AS reportsto
        FROM dbo.tEmployeesDetails ed
        WHERE ed.PREmp = @empId
      `);

    const employee = result.recordset[0];

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ACHDEmpNo: employee.ACHDEmpNo,
      name: clean(employee.name),
      jobtitle: clean(employee.jobtitle),
      workphone: employee.workphone,
      number: clean(employee.number),
      email: clean(employee.email),
      unit: clean(employee.unit),
      crew: clean(employee.crew),
      prdept: clean(employee.prdept),
      location: clean(employee.location),
      reportsto: clean(employee.reportsto),
    });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
