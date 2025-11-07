export type Employee = {
  ACHDEmpNo: string;
  name: string;
  jobtitle: string;
  workphone: string;
  number: string;
  email: string;
  unit: string;
  crew: string;
  prdept: string;
  location: string;
  reportsto: string;
  birthDate?: string | null;
  hireDate?: string | null;
};

export type CrewGroup = {
  unit: string;
  crew: string;
  members: Employee[];
};

export type EmployeeFilters = {
  units: string[];
  crews: string[];
  locations: string[];
  onlyMyCrew: boolean;
};
