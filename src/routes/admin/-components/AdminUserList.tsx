import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { Link } from "@tanstack/react-router";
import { PlusCircleIcon } from "lucide-react";

export default function AdminUserList() {
  const staffs = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.person.jobTitle(),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
  }));

  const columns = [
    {
      key: "avatar",
      label: "Img",
      render: (value: string, item: any) => (
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={value} alt={`Avatar of ${item.name}`} />
          </div>
        </div>
      ),
    },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View staff:", item),
    },
  ];

  return (
    <div className="space-y-4">
      <SimpleContainer
        title="Staffs"
        actions={
          <>
            <Link to="/admin/users" className="btn btn-primary btn-sm">
              See More
            </Link>
          </>
        }
      >
        <CustomTable
          ring={false}
          data={staffs}
          columns={columns}
          actions={actions}
        />
        <div className="flex justify-center mt-4">
          <button className="btn btn-ghost">See More</button>
        </div>
      </SimpleContainer>
    </div>
  );
}
