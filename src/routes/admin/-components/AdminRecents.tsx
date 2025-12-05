import { faker } from "@faker-js/faker";
import CustomTable from "@/components/tables/CustomTable";

type columnType = {
  key: string;
  label: string;
  render?: (value: any, item: any) => any;
};

export default function AdminRecents() {
  const recentUsers = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    registeredAt: faker.date.past().toLocaleDateString(),
  }));

  const userColumns: columnType[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "registeredAt", label: "Registered At" },
  ];

  return (
    <div className="w-full">
      <Card title="Recent Users" data={recentUsers} columns={userColumns} />
    </div>
  );
}

const Card = ({
  title,
  data,
  columns,
}: {
  title: string;
  data: any[];
  columns: columnType[];
}) => {
  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body p-4">
        <h2 className="card-title text-lg font-semibold mb-4">{title}</h2>
        <div className="overflow-x-auto">
          {" "}
          {/* Added for responsiveness */}
          <CustomTable data={data} columns={columns} />
        </div>
      </div>
    </div>
  );
};
