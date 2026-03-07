import { useState } from "react";
import type { IRestaurant } from "../types";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import axios from "axios";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}
const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        {
          status: !isOpen,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        {
          name,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden">
      {restaurant.image && (
        <img
          src={restaurant.image}
          alt="restaurant photo"
          className="h-48 w-full object-cover"
        />
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {editMode ? (
              // EDIT MODE: Shows the input field
              <input
                value={name}
                className="w-full rounded border px-2 py-1 text-lg font-semibold"
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              // VIEW MODE: Shows the Name AND the Location
              <div>
                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                <h2 className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <BiMapPin className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="truncate">
                    {restaurant.autoLocation?.formattedAddress ||
                      "Location unavailable"}
                  </span>
                </h2>
              </div>
            )}
          </div>

          {/* Only show the Edit button if the user is the seller */}
          {isSeller && (
            <button
              className="text-gray-500 hover:text-black mt-1"
              onClick={() => setEditMode(!editMode)}
            >
              <BiEdit size={18} />
            </button>
          )}
        </div>

        {/* Description Section */}
        {editMode ? (
          <textarea
            value={description}
            className="w-full rounded border px-3 py-2 text-sm"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        ) : (
          <p className="text-sm text-gray-600">
            {description || "No description added"}
          </p>
        )}

        {/* Status & Actions Section */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span
            className={`text-sm font-medium ${
              isOpen ? "text-green-600" : "text-red-600"
            }`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>

          <div className="flex gap-3">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                <BiSave size={16} />
                Save
              </button>
            )}
            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white ${
                  isOpen
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Created on {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
