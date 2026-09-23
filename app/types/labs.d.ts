export type Measurement = {
  id: string;
  value: number;
  measured_at: string;
};

export type LabTest = {
  id: string;
  name: string;
  abbreviation: string | null;
  specimen: string | null;
  unit: string | null;
  reference_range_min: number | null;
  reference_range_max: number | null;
  measurements: Measurement[];
};

export type LabCategory = {
  category: string;
  tests: LabTest[];
};

export type LabSpecimen = {
  specimen: string;
  categories: LabCategory[];
};