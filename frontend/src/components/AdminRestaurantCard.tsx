import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try { 
      await axios.put(
        `${adminService}/api/v1/admin/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, 
          },
        }
      );
      toast.success(`${restaurant.name} successfully verified!`);
      onVerify();
    } catch (error) {
      toast.error("Failed to verify restaurant.");
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image || "https://placehold.co/600x400/png?text=No+Image"}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 backdrop-blur-sm">
          Pending
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900">{restaurant.name}</h3>
        
        <div className="mt-4 space-y-2 flex-1 text-sm">
          <div className="flex justify-between border-b border-gray-50 pb-2">
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium text-gray-800">{restaurant.phone}</span>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-gray-500">Location:</span>
            <span className="line-clamp-2 text-gray-800">
              {restaurant.autoLocation?.formattedAddress || "Address not provided"}
            </span>
          </div>
        </div>

        <button
          onClick={verify}
          className="mt-6 w-full rounded-lg bg-[#e23744] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c92f3b] focus:outline-none focus:ring-2 focus:ring-[#e23744] focus:ring-offset-2"
        >
          Approve Restaurant
        </button>
      </div>
    </div>
  );
};

export default AdminRestaurantCard;