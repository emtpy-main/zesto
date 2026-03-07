import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import AddMenuItem from "../components/AddMenuItem";
import MenuItems from "../components/MenuItems";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellerTab | "menu">("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data.restaurant || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItem,setMenuItems] = useState<IMenuItem[]>([]);
  
  const fetchMenuItems = async(restaurantId : string)=>{
    try {
      const {data} = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`,{
        headers : {
          Authorization : `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    if(restaurant?._id){
      fetchMenuItems(restaurant._id);
    }
  },[restaurant]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );
  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {
            [
              {key : "menu" , label : "Menu Items"},
              {key : "add-item" , label : "Add Item"},
              {key : "sales" , label : "Sales"},
            ].map((tab)=>(
              <button key={tab.key} onClick={()=> setActiveTab(tab.key as SellerTab)} className={`flex-1 px-4 py03 text-sm font-medium transition ${activeTab === tab.key ? "border-b-2 border-red-500 text-red-500" :"text-gray-500 hover:text-gray-700"}`}>{tab.label}</button>
            ))
          }
        </div>

        <div className="p-5">
          {
            activeTab === "menu" && <MenuItems items={menuItem} onItemDeleted ={()=>fetchMenuItems(restaurant._id)} isSeller={true} />
          }
          {
            activeTab === "add-item" && <AddMenuItem onItemAdded={()=>{fetchMenuItems(restaurant._id)}}/>
          } {
            activeTab === "sales" && <p>Sales Page</p>
          }
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
