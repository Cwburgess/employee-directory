//src>components>layout>DirectoryGroup
import EmployeeCard from "@/components/layout/EmployeeCard";

type Employee = {
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
};

type CrewGroup = {
  unit: string;
  crew: string;
  members: Employee[];
};

export default function DirectoryGroup({ group }: { group: CrewGroup }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold uppercase text-center">
        {group.unit}
      </h2>
      <p className="text-center text-muted-foreground capitalize mb-4">
        {group.crew}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        {group.members.map((employee, index) => (
          <div key={index} className="flex-shrink-0 w-full sm:w-[350px]">
            <EmployeeCard employee={employee} />
          </div>
        ))}
      </div>
    </section>
  );
}
