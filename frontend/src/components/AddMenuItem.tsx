import { useState } from "react";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  BiUpload, 
  BiDish, 
  BiRupee, 
  BiAlignLeft, 
  BiCheckCircle,
  BiFoodMenu
} from "react-icons/bi";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      toast.error("Name, Price, and Image are required.");
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Item added successfully!");
      resetForm();
      onItemAdded();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-xl shadow-gray-200/50 border border-gray-100 font-sans">
      
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e23744]/10">
          <BiFoodMenu className="h-5 w-5 text-[#e23744]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Add Menu Item</h2>
          <p className="text-xs text-gray-500">Create a new dish for your restaurant</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Item Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <BiDish className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="e.g. Garlic Butter Naan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Price</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <BiRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
          <div className="relative">
            <div className="absolute top-3 left-0 flex items-start pl-3 pointer-events-none">
              <BiAlignLeft className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              placeholder="Brief description of the item..."
              value={description}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10 resize-none"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Item Image</label>
          <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all duration-200 ${image ? 'border-[#e23744] bg-[#e23744]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
            {imagePreview ? (
              <div className="flex w-full items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e23744] shadow-sm">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#e23744]">
                    <BiCheckCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate">{image?.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">Click to replace</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm mb-1">
                  <BiUpload className="h-4 w-4 text-[#e23744]" />
                </div>
                <p className="text-sm font-medium text-gray-700">Upload food photo</p>
                <p className="text-[10px] text-gray-500">JPG, PNG up to 5MB</p>
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

        {/* Submit Button */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e23744] py-3 text-sm font-bold text-white shadow-lg shadow-[#e23744]/30 transition-all duration-200 hover:bg-[#c9313d] hover:shadow-[#e23744]/40 focus:outline-none focus:ring-4 focus:ring-[#e23744]/30 active:scale-[0.98] ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Item...
            </>
          ) : (
            "Add to Menu"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddMenuItem;