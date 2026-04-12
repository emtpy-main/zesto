import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { useEffect } from "react";

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
        styles: [{ color: "#e23744", weight: 6, opacity: 0.8 }], 
      },
      addWaypoints: false,
      draggableWaypoints: false, 
      show: false,  
      fitSelectedRoutes: false,  
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
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

const UserOrderMap = ({ riderLocation, deliveryLocation }: Props) => {
  return (
    <MapContainer 
      center={riderLocation} 
      zoom={14} 
      className="h-full w-full z-0"
      zoomControl={false}  
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={riderLocation} icon={riderIcon}>
        <Popup className="font-bold">Delivery Partner</Popup>
      </Marker>
      <Marker position={deliveryLocation} icon={deliveryIcon}>
        <Popup className="font-bold">Your Location</Popup>
      </Marker>
      <Routing from={riderLocation} to={deliveryLocation} />
    </MapContainer>
  );
};

export default UserOrderMap;