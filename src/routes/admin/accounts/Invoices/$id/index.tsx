import SimpleTitle from "@/components/SimpleTitle";
import { useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/accounts/Invoices/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });
  return (
    <>
      <SimpleTitle backBtn title={"Invoice Details: " + id} />
      {/*<div className="text-2xl font-bold mb-4">New Invoices: {id}</div>*/}

      <div className="card bg-accent text-accent-content shadow-xl ">
        <div className="card-body p-6">
          <div className="flex items-center mb-4">
            <div className="avatar placeholder mr-4">
              <div className="bg-neutral grid place-items-center text-neutral-content rounded-full w-12">
                <span className="text-xl">M</span>
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg">Maglo</h2>
              <p className="text-sm">sales@maglo.com</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p>1333 Grey Fox Farm Road</p>
            <p>Houston, TX 77060</p>
            <p>Bloomfield Hills, Michigan(M), 48301</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100  mb-6">
        <div className="card-body p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Invoice Number</h3>
              <p>MAG 2541420</p>
              <p className="text-sm">Issued Date: 10 Apr 2022</p>
              <p className="text-sm">Due Date: 20 Apr 2022</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg mb-2">Billed to</h3>
              <p>Sajib Rahman</p>
              <p>3471 Rainy Day Drive</p>
              <p>Needham, MA 02192</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-6">
          <h3 className="font-bold text-lg mb-2">Item Details</h3>
          <p className="text-sm text-gray-500 mb-4">
            Details item with more info
          </p>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th className="text-center">ORDER/TYPE</th>
                  <th className="text-right">RATE</th>
                  <th className="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>iPhone 13 Pro Max</td>
                  <td className="text-center">01</td>
                  <td className="text-right">$244</td>
                  <td className="text-right">$244.00</td>
                </tr>
                <tr>
                  <td>Netflix Subscription</td>
                  <td className="text-center">01</td>
                  <td className="text-right">$420</td>
                  <td className="text-right">$420.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="btn btn-link text-success mt-4 justify-start">
            Add item
          </button>

          <div className="divider"></div>

          <div className="flex justify-end mt-4">
            <div className="w-1/2">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-bold">Subtotal</div>
                <div className="text-right">$664.00</div>

                <div className="font-bold">Discount</div>
                <div className="text-right text-success">Add</div>

                <div className="font-bold">Tax</div>
                <div className="text-right text-success">Add</div>

                <div className="font-bold text-lg mt-4">Total</div>
                <div className="text-right font-bold text-lg mt-4">$664.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
