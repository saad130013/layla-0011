
export interface Employee {
  "NAME (ENG)": string;
  "NAME (AR)": string;
  "G": string;
  "NATIONALITY": string;
  "ID#": string | number;
  "EMP#": string | number;
  "COMPANY": string;
  "POSITION": string;
  "MRN": string | number;
  "LOCATION": string;
  "SourceSheet": string;
}

export interface RegionReference {
  id: number;
  name: string;
}

export interface RegionValidation {
  name: string;
  count: number;
}

export interface ValidationState {
  isValid: boolean;
  regions: RegionReference[];
  validationTable: RegionValidation[];
  totalRegions: number;
  errors: string[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  VALIDATION = 'VALIDATION',
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT'
}
