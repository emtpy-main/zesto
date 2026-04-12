import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BiUpload, BiUser, BiPhone, BiIdCard, BiMapAlt, BiCheckCircle } from "react-icons/bi";
import { riderService } from "../main"; 

interface Props {
  fetchProfile: () => Promise<void>;
}

const AddRiderProfile = ({ fetchProfile }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Safely request location only when the user submits
  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => reject("Location permission denied. Please enable it in your browser settings.")
      );
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!aadharNumber || !image || !phoneNumber || !drivingLicenceNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    let latitude, longitude;

    try {
      setSubmitting(true);
      const loc = await getLocation();
      latitude = loc.latitude;
      longitude = loc.longitude;
    } catch (err: any) {
      toast.error(err);
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("phoneNumber", phoneNumber);
    formData.append("aadharNumber", aadharNumber);
    formData.append("drivingLicenceNumber", drivingLicenceNumber);
    formData.append("latitude", String(latitude));
    formData.append("longitude", String(longitude));
    formData.append("file", image);

    try {
      await axios.post(`${riderService}/api/rider/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Profile created successfully!");
      fetchProfile();
    } catch (error: any) { 
      toast.error(error?.response?.data?.message || "Something went wrong while creating your profile.");
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
            <BiUser className="h-7 w-7 text-[#e23744]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rider Registration</h1>
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to start delivering with us.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Aadhar Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Aadhar Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiIdCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={aadharNumber}
                placeholder="34XX XXXX X903"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
                onChange={(e) => setAadharNumber(e.target.value)}
              />
            </div>
          </div> 
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Driving Licence</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiMapAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={drivingLicenceNumber}
                placeholder="DL03 2014 xxxxxxx"
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-[#e23744] focus:outline-none focus:ring-4 focus:ring-[#e23744]/10"
                onChange={(e) => setDrivingLicenceNumber(e.target.value)}
              />
            </div>
          </div> 
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Profile Photo</label>
            <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${image ? 'border-[#e23744] bg-[#e23744]/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
              {imagePreview ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#e23744] shadow-sm">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[#e23744]">
                    <BiCheckCircle className="h-4 w-4" />
                    {image?.name}
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
                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
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

          {/* Submit Button */}
          <button
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e23744] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e23744]/30 transition-all duration-200 hover:bg-[#c9313d] hover:shadow-[#e23744]/40 focus:outline-none focus:ring-4 focus:ring-[#e23744]/30 active:scale-[0.98] ${submitting ? "cursor-not-allowed opacity-70" : ""}`}
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Create Profile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRiderProfile;