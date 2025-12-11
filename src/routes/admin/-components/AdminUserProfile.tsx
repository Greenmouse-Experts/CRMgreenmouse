export default function AdminUserProfile() {
  return (
    <div className="flex items-center border-l pl-4 ml-2 border-current/30">
      <div className="mr-2 md:flex flex-col text-sm text-right hidden font-semibold">
        Admin User
        <span className="text-base-content/70 text-xs">Super Admin</span>
      </div>
      <div className="dropdown dropdown-end">
        <div className="flex gap-2 items-center">
          <button className="btn btn-circle  size-8 ring">
            <img
              src="https://github.com/shadcn.png"
              className="rounded-full"
              alt=""
            />
          </button>
        </div>
        <ul className="dropdown-content rounded-box bg-base-100 shadow min-w-[180px] w-auto menu m-1">
          <li>
            <a href="">Profile</a>
          </li>
          <li>
            <a href="">Settings</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
