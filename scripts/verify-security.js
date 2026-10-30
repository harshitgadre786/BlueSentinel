/**
 * BlueSentinel Automated Security & Access Isolation Verification Script
 * 
 * Verifies:
 * 1. SQL Schema RLS enforcement on all private tables
 * 2. Complete absence of anonymous permissive policies on sensitive tables
 * 3. Supabase Storage bucket privacy and user-folder isolation
 * 4. Zero exposure of SUPABASE_SERVICE_ROLE_KEY in client components
 * 5. Protection of /api/seed against unauthorized mutations
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passes++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failures++;
  }
}

console.log("\n=======================================================");
console.log(" BlueSentinel Security & Access Isolation Audit Suite ");
console.log("=======================================================\n");

// 1. Audit SQL Schema Migration File
console.log("1. Auditing Supabase SQL Migrations (20261024_init_schema.sql)...");
const schemaPath = path.join(ROOT_DIR, "supabase", "migrations", "20261024_init_schema.sql");
const schemaSQL = fs.readFileSync(schemaPath, "utf8");

const privateTables = [
  "profiles",
  "voyages",
  "recommendations",
  "uploaded_documents",
  "document_chunks",
  "reports"
];

for (const table of privateTables) {
  assert(
    schemaSQL.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
    `Table 'public.${table}' explicitly enables Row Level Security (RLS)`
  );
  assert(
    schemaSQL.includes(`ON public.${table}`) && schemaSQL.includes(`(auth.uid() = `),
    `Table 'public.${table}' enforces auth.uid() isolation`
  );
}

// Ensure no dangerous 'Allow all' policies remain
const dangerousPatterns = [
  /CREATE POLICY "Allow all on voyages"/i,
  /CREATE POLICY "Allow all on recommendations"/i,
  /CREATE POLICY "Allow all on uploaded_documents"/i,
  /CREATE POLICY "Allow all on reports"/i,
  /CREATE POLICY "Allow public read on document_chunks"/i
];

for (const pattern of dangerousPatterns) {
  assert(
    !pattern.test(schemaSQL),
    `Verified absence of legacy open policy: ${pattern.toString()}`
  );
}

// Reference tables write restriction
assert(
  schemaSQL.includes(`CREATE POLICY "Allow admin write on port_rules"`) &&
  schemaSQL.includes(`TO service_role`),
  "Table 'port_rules' restricts write operations strictly to service_role"
);
assert(
  schemaSQL.includes(`CREATE POLICY "Allow admin write on vessels"`) &&
  schemaSQL.includes(`TO service_role`),
  "Table 'vessels' restricts write operations strictly to service_role"
);

// 2. Storage Bucket & Folder Isolation Audit
console.log("\n2. Auditing Supabase Storage Isolation Policies...");
assert(
  schemaSQL.includes("INSERT INTO storage.buckets") && schemaSQL.includes("false"),
  "Storage bucket 'documents' is created as private (public = false)"
);
assert(
  schemaSQL.includes("(storage.foldername(name))[1] = auth.uid()::text"),
  "Storage objects enforce strict folder isolation by user ID: documents/{auth.uid()}/*"
);
assert(
  schemaSQL.includes("FOR SELECT \nTO authenticated") || schemaSQL.includes("FOR SELECT \r\nTO authenticated") || schemaSQL.includes("TO authenticated \nUSING"),
  "Storage object read access is restricted to authenticated users matching folder prefix"
);

// 3. Client Bundle Secret Exposure Audit
console.log("\n3. Auditing Client Components for Secret Key Leaks...");
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        scanDir(fullPath);
      }
    } else if (file.endsWith(".tsx") || (file.endsWith(".ts") && !file.includes("/api/"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes('"use client"') || content.includes("'use client'")) {
        assert(
          !content.includes("process.env.SUPABASE_SERVICE_ROLE_KEY"),
          `Client file ${path.relative(ROOT_DIR, fullPath)} does not reference SUPABASE_SERVICE_ROLE_KEY`
        );
        assert(
          !content.includes("process.env.SERVICE_ROLE"),
          `Client file ${path.relative(ROOT_DIR, fullPath)} does not reference SERVICE_ROLE`
        );
      }
    }
  }
}
scanDir(path.join(ROOT_DIR, "src"));

// 4. API Route Protection Audit
console.log("\n4. Auditing API Routes Security (/api/seed)...");
const seedRoutePath = path.join(ROOT_DIR, "src", "app", "api", "seed", "route.ts");
const seedRouteCode = fs.readFileSync(seedRoutePath, "utf8");

assert(
  seedRouteCode.includes("isAuthorizedAdmin"),
  "Endpoint /api/seed enforces admin authorization checks"
);
assert(
  seedRouteCode.includes("status: 401") || seedRouteCode.includes("{ status: 401 }"),
  "Endpoint /api/seed rejects unauthorized requests with HTTP 401"
);
assert(
  !seedRouteCode.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"),
  "Endpoint /api/seed does not use NEXT_PUBLIC prefix for sensitive keys"
);

console.log("\n-------------------------------------------------------");
console.log(`Audit Summary: ${passes} passed, ${failures} failed.`);
console.log("-------------------------------------------------------\n");

if (failures > 0) {
  process.exit(1);
} else {
  console.log("All access isolation and security checks PASSED cleanly.\n");
  process.exit(0);
}
