export default function UserInfo() {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start px-4 py-6 bg-base-100 shadow rounded-md gap-6">
      <figure className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
        <img
          src="https://github.com/shadcn.png" // Replace with the actual path to the image
          alt="Amber Leary"
          className="object-cover w-full h-full"
        />
      </figure>
      <div className="card-body p-0 text-center sm:text-left">
        <h2 className="card-title text-2xl font-bold mb-1">Amber Leary</h2>
        <p className="text-gray-500 text-sm mb-4">Engineer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div className="font-semibold">Date of Birth</div>
          <div>06/16/1988</div>
          <div className="font-semibold">Work Phone</div>
          <div>555-221-1011</div>
          <div className="font-semibold">Email</div>
          <div className="break-all">clear@emailprovider.com</div>
        </div>
      </div>
    </div>
  );
}
