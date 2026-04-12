import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { realTimeService } from "../main";
import { BiMap } from "react-icons/bi";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}
 
const createCustomIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.2); font-size: 20px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 2px solid #fff;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18], 
    className: "", 
  });
};

const riderIcon = createCustomIcon("🛵");
const deliveryIcon = createCustomIcon("📍");

const Routing = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }], // Thicker, nicer blue line
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,  
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]);
  return null;
};

interface Props {
  order: IOrder;
}

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  useEffect(() => { 
    if (!order?.deliveryAddress?.latitude || !order?.deliveryAddress?.longitude) {
      return;
    }

    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude; // Fixed typo
          setRiderLocation([latitude, longitude]);

          // Emit to socket server
          axios.post(
            `${realTimeService}/api/v1/internal/emit`,
            {
              event: "rider:location",
              room: `user:${order.userId}`,
              payload: { latitude, longitude }, // Fixed typo
            },
            {
              headers: {
                "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
              },
            }
          ).catch((err) => console.error("Failed to emit location:", err));
        },
        (err) => console.error("Location Error: ", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);
    return () => clearInterval(interval);
  }, [order]);
 
  if (!order?.deliveryAddress?.latitude || !order?.deliveryAddress?.longitude) {
    return (
      <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-[350px]">
        <p className="text-gray-500 font-medium">Invalid delivery coordinates.</p>
      </div>
    );
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];
 
  if (!riderLocation) {
    return (
      <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-[350px] shadow-sm">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <BiMap className="text-3xl text-blue-500" />
        </div>
        <p className="text-gray-900 font-bold">Acquiring GPS Signal...</p>
        <p className="text-sm text-gray-500 mt-1">Fetching your live location for routing.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white shadow-lg border border-gray-100 overflow-hidden relative z-0">
      <MapContainer 
        center={riderLocation} 
        zoom={14} 
        className="h-[350px] w-full"
        zoomControl={false} // Hides the default +/- buttons for a cleaner mobile look
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup className="font-bold">You are here</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup className="font-bold">Drop-off Location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;