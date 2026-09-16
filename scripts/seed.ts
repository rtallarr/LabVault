import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const labTests = [
  {
    name: "Glucose",
    code: "GLU",
    category: "metabolic",
    specimen: "blood",
    unit: "mg/dL",
    reference_range_min: 70,
    reference_range_max: 99,
  },
  {
    name: "Total Cholesterol",
    code: "CHOL",
    category: "lipidic",
    specimen: "blood",
    unit: "mg/dL",
    reference_range_min: 0,
    reference_range_max: 199,
  },
  {
    name: "HDL Cholesterol",
    code: "HDL",
    category: "lipidic",
    specimen: "blood",
    unit: "mg/dL",
    reference_range_min: 40,
    reference_range_max: null,
  },
  {
    name: "LDL Cholesterol",
    code: "LDL",
    category: "lipidic",
    specimen: "blood",
    unit: "mg/dL",
    reference_range_min: 0,
    reference_range_max: 99,
  },
  {
    name: "Triglycerides",
    code: "TRIG",
    category: "lipidic",
    specimen: "blood",
    unit: "mg/dL",
    reference_range_min: 0,
    reference_range_max: 149,
  },
  {
    name: "ALT",
    code: "ALT",
    category: "hepatic",
    specimen: "blood",
    unit: "U/L",
    reference_range_min: 7,
    reference_range_max: 56,
  },
  {
    name: "AST",
    code: "AST",
    category: "hepatic",
    specimen: "blood",
    unit: "U/L",
    reference_range_min: 10,
    reference_range_max: 40,
  },
  {
    name: "Sodium",
    code: "NA",
    category: "electrolytes",
    specimen: "blood",
    unit: "mmol/L",
    reference_range_min: 135,
    reference_range_max: 145,
  },
  {
    name: "Potassium",
    code: "K",
    category: "electrolytes",
    specimen: "blood",
    unit: "mmol/L",
    reference_range_min: 3.5,
    reference_range_max: 5.1,
  },
];

async function main() {
  const { error } = await supabase
    .from("lab_tests")
    .insert(labTests);

  if (error) {
    console.error("Failed to seed lab tests:", error);
    process.exit(1);
  }

  console.log(`Seeded ${labTests.length} lab tests.`);
}

main();