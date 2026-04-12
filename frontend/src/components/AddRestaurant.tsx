import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  BiMapPin, 
  BiUpload, 
  BiStore, 
  BiPhone, 
  BiInfoCircle, 
  BiCheckCircle,
  BiCurrentLocation
} from "react-icons/bi"; 
import { restaurantService } from "../main"; 

interface Props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name || !image || !location || !phone || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Restaurant added successfully!");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong while adding the restaurant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e23744]/10 mb-4">
            <BiStore className="h-7 w-7 text-[#e23744]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Your Restaurant</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your restaurant details to get listed on the platform.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-5">
          {/* Restaurant Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Restaurant Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiStore className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                placeholder="e.g. The Spicy Kitchen"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <div className="relative">
              <div className="absolute top-3 left-0 flex items-start pl-3 pointer-events-none">
                <BiInfoCircle className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={description}
                rows={3}
                placeholder="Tell customers about your restaurant's specialties..."
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10 resize-none"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* File Upload (Drag & Drop styling) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Cover Image</label>
            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${image ? 'border-[#e23744] bg-[#e23744]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
              {imagePreview ? (
                <div className="flex flex-col items-center space-y-3 w-full">
                  <div className="relative h-32 w-full max-w-[200px] overflow-hidden rounded-lg border-2 border-[#e23744] shadow-sm">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#e23744]">
                    <BiCheckCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[200px]">{image?.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">Click to change photo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <BiUpload className="h-5 w-5 text-[#e23744]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">High-quality JPG or PNG recommended</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Location Display Card */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                {loadingLocation ? (
                  <BiCurrentLocation className="h-4 w-4 animate-pulse text-[#e23744]" />
                ) : (
                  <BiMapPin className="h-4 w-4 text-[#e23744]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Restaurant Location
                </p>
                <p className="text-sm text-gray-800 leading-snug">
                  {loadingLocation 
                    ? "Detecting your current location..." 
                    : location?.formattedAddress || "Location access is required to add a restaurant."}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e23744] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e23744]/30 transition-all duration-200 hover:bg-[#c9313d] hover:shadow-[#e23744]/40 focus:outline-none focus:ring-4 focus:ring-[#e23744]/30 active:scale-[0.98] ${submitting ? "cursor-not-allowed opacity-70" : ""}`}
            disabled={submitting || loadingLocation}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Add Restaurant"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;