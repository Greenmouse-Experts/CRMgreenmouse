export default function AdminUserProfile() {
  return (
    <div>
      <div className="dropdown dropdown-end">
        <div className="flex gap-2 items-center">
          <button className="btn btn-circle btn size-8 ring">A</button>
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
