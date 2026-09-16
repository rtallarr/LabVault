import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type LabTest = {
  name: string;
  abbreviation: string;
  category: string;
  specimen: string;
  unit: string;
  reference_range_min: number | null;
  reference_range_max: number | null;
};

const dataPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "lab-tests.json",
);

const labTests: LabTest[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function main() {
  const { error } = await supabase
    .from("lab_tests")
    .upsert(labTests, {
      onConflict: "name",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Failed to seed lab tests:", error);
    process.exit(1);
  }

  console.log(`Seeded ${labTests.length} lab tests.`);
}

main();