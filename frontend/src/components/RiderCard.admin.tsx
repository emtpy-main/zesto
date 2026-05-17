import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";

const AdminRiderCard = ({
  rider,
  onVerify,
}: {
  user: any;
  rider: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.put(
        `${adminService}/api/v1/admin/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Rider successfully verified!");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify rider.");
    }
  };
 
  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`, { icon: "📋" });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative flex flex-col items-center bg-gray-50 px-5 pt-6 pb-4">
        <div className="absolute top-3 right-3 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
          Pending
        </div>

        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-sm">
          <img
            src={rider.picture || "https://placehold.co/150x150/png?text=Rider"}
            alt="Rider Photo"
            className="h-full w-full object-cover"
          />
        </div>
        {/* <h3 className="mt-3 text-lg font-bold text-gray-900">
          {rider.name || user?.name || "Unknown Rider"}
        </h3> */}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-3 flex-1 text-sm">
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500">Contact:</span>
            <span className="font-medium text-gray-800">
              {rider.phoneNumber}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="text-gray-500">Driving License No:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium uppercase text-gray-800">
                {rider.drivinLicenseNumber || "N/A"}
              </span>
              {rider.drivinLicenseNumber && (
                <button
                  onClick={() =>
                    copyToClipboard(rider.drivinLicenseNumber, "License")
                  }
                  className="text-gray-400 hover:text-[#e23744] transition-colors"
                  title="Copy License"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-500">Gov ID (Aadhar Number):</span>
            <div className="flex items-center gap-2">
              <span className="font-medium tracking-wide text-gray-800">
                {rider.aadharNumber || "Not Uploaded"}
              </span>
              {rider.aadharNumber && (
                <button
                  onClick={() => copyToClipboard(rider.aadharNumber, "Aadhar")}
                  className="text-gray-400 hover:text-[#e23744] transition-colors"
                  title="Copy Aadhar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={verify}
          className="mt-6 w-full rounded-lg bg-[#e23744] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c92f3b] focus:outline-none focus:ring-2 focus:ring-[#e23744] focus:ring-offset-2"
        >
          Approve Rider
        </button>
      </div>
    </div>
  );
};

export default AdminRiderCard;
