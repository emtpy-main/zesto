import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Ensure CSS is imported
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";

// --- 🔧 Fix Leaflet Marker Icon Issue ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: string;
}

// --- 🔧 Helper: Recenter map when state changes ---
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

// 📍 Click-to-select location
const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// 🎯 Locate me button
const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied"),
    );
  };

  return (
    <button
      type="button"
      onClick={locateUser}
      className="absolute right-3 top-3 z-1000 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-md hover:bg-gray-100"
    >
      <LuLocateFixed size={16} className="text-red-500" />
      Use current location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 📋 Form state
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(28.6139); // Default: Delhi
  const [longitude, setLongitude] = useState<number>(77.209);
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  // 🌍 Reverse geocoding
  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "FoodDeliveryApp/1.0", // Required by Nominatim Policy
          },
        },
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "Unknown Location");
    } catch {
      toast.error("Failed to fetch address details");
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setIsLocationSelected(true);
    fetchFormattedAddress(lat, lng);
  };

  // 📡 Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data?.addresses || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ➕ Add address
  const addAddress = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!isLocationSelected) {
      toast.error("Please select a location on the map");
      return;
    }

    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Address saved successfully");
      setMobile("");
      setFormattedAddress("");
      setIsLocationSelected(false);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setAdding(false);
    }
  };

  // 🗑 Delete address
  const deleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Add New Address</h1>
        <p className="text-gray-500 text-sm">
          Tap on the map to pick your delivery location
        </p>
      </div>

      {/* 🗺 Map Section */}
      <div className="relative h-80 w-full overflow-hidden rounded-xl border-2 border-gray-100 shadow-inner">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <RecenterMap lat={latitude} lng={longitude} />
          <LocationPicker setLocation={setLocation} />
          <LocateMeButton onLocate={setLocation} />

          {isLocationSelected && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </div>

      {/* 📍 Selection Display */}
      <div className="space-y-4">
        {formattedAddress ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <span className="font-bold">📍 Selected Address:</span>{" "}
            {formattedAddress}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
            No location selected yet.
          </div>
        )}

        <input
          type="tel"
          placeholder="Receiver's Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all"
        />

        <button
          disabled={adding || !isLocationSelected}
          onClick={addAddress}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E23744] px-4 py-4 font-bold text-white hover:bg-[#d32f3a] disabled:opacity-50 transition-colors shadow-lg"
        >
          {adding ? (
            <BiLoader className="animate-spin" size={20} />
          ) : (
            <BiPlus size={20} />
          )}
          {adding ? "Saving..." : "Save Delivery Address"}
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* 📋 Saved Addresses List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Your Saved Locations
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <BiLoader className="animate-spin text-red-500" size={32} />
          </div>
        ) : addresses.length === 0 ? (
          <p className="text-center text-gray-400 py-6 italic border rounded-lg">
            No addresses found.
          </p>
        ) : (
          <div className="grid gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="flex items-start justify-between rounded-xl border bg-white p-4 shadow-sm hover:border-red-100 transition-all"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {addr.formattedAddress}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-medium text-gray-700">Phone:</span>{" "}
                    {addr.mobile}
                  </p>
                </div>
                <button
                  onClick={() => deleteAddress(addr._id)}
                  disabled={deletingId === addr._id}
                  className="ml-4 rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === addr._id ? (
                    <BiLoader size={18} className="animate-spin" />
                  ) : (
                    <BiTrash size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAddressPage;
