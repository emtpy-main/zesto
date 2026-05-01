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
import "leaflet/dist/leaflet.css";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash, BiMapPin } from "react-icons/bi";
import Footer from "../components/Footer";

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

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

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
      className="absolute right-2 top-2 z-[1000] flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
    >
      <LuLocateFixed size={14} className="text-[#e23744]" />
      Locate Me
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
            "User-Agent": "FoodDeliveryApp/1.0",
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
   <div className="relative min-h-screen bg-gray-50 font-sans overflow-hidden">
  
  {/* Background Blobs */}
  <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl"></div>
  <div className="absolute -bottom-24 -right-12 h-[30rem] w-[30rem] rounded-full bg-blue-200/40 blur-3xl"></div>
  <div className="absolute top-1/4 left-2/3 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl"></div>

  {/* Main Content (added relative z-10 to sit above the blobs) */}
  <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 lg:py-12">
    
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      
      {/* LEFT COLUMN */}
      <div className="space-y-6 lg:col-span-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Add Address</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Tap the map to pin your exact delivery location.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative z-0 h-[350px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:h-[500px]">
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <RecenterMap lat={latitude} lng={longitude} />
            <LocationPicker setLocation={setLocation} />
            <LocateMeButton onLocate={setLocation} />

            {isLocationSelected && <Marker position={[latitude, longitude]} />}
          </MapContainer>
        </div>

        {/* Input Form */}
        <div className="space-y-4 pt-2">
          {formattedAddress ? (
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <BiMapPin className="mt-0.5 shrink-0 text-xl text-[#e23744]" />
              <p className="leading-snug text-sm font-medium text-gray-800">
                {formattedAddress}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-4 text-center text-sm font-medium text-gray-500 backdrop-blur-sm">
              No location pinned yet.
            </div>
          )}

          <input
            type="tel"
            placeholder="Receiver's Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all outline-none backdrop-blur-sm focus:border-[#e23744] focus:ring-1 focus:ring-[#e23744]"
          />

          <button
            disabled={adding || !isLocationSelected}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#c9313d] active:scale-[0.98] disabled:opacity-60"
            onClick={() => addAddress()}
          >
            {adding ? (
              <BiLoader className="animate-spin text-lg" />
            ) : (
              <BiPlus className="text-lg" />
            )}
            {adding ? "Saving..." : "Save Delivery Address"}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6 border-t border-gray-200 pt-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
        <h2 className="text-xl font-bold text-gray-900">
          Saved Locations
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <BiLoader className="animate-spin text-[#e23744]" size={32} />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-12 text-center backdrop-blur-sm">
             <BiMapPin className="mb-3 text-4xl text-gray-300" />
            <p className="text-sm text-gray-500">
              You haven't saved any addresses yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:max-h-[700px] lg:overflow-y-auto lg:pr-2">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="group flex items-start justify-between rounded-xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#e23744]/40 hover:shadow-md"
              >
                <div className="space-y-2 pr-4">
                  <p className="line-clamp-3 leading-snug text-sm font-medium text-gray-800">
                    {addr.formattedAddress}
                  </p>
                  <p className="tracking-wide text-xs font-bold uppercase text-gray-400">
                    Phone: <span className="text-gray-600">{addr.mobile}</span>
                  </p>
                </div>
                <button
                  onClick={() => deleteAddress(addr._id)}
                  disabled={deletingId === addr._id}
                  className="shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                >
                  {deletingId === addr._id ? (
                    <BiLoader size={20} className="animate-spin" />
                  ) : (
                    <BiTrash size={20} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
  <Footer/>
</div>
  );
};

export default AddAddressPage;
