import { useAppData } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  BiLogOut, 
  BiMapPin, 
  BiPackage, 
  BiChevronRight 
} from 'react-icons/bi';
import Footer from '../components/Footer';

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logout Success");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
         
        {/* Header section */}
        <div className="mb-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your orders, addresses, and settings.
          </p>
        </div>

        {/* Identity Card - Slimmer padding (p-4), sharper corners (rounded-lg) */}
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e23744] to-[#ff6b76] text-xl font-bold text-white shadow-sm overflow-hidden border border-gray-100">
            {user?.image ? (
              <img src={user.image} alt={`${user.name} Profile`} className="h-full w-full object-cover" />
            ) : (
              firstLetter
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">
              {user?.name}
            </h2>
            <p className="text-sm font-medium text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation Card - Slimmer padding, sharper corners */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
             
            <div 
              className="group flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/orders')}
            >
              <div className="flex items-center gap-3">
                {/* Slimmer icon box (h-9 w-9) with sharper corners (rounded-md) */}
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 group-hover:bg-[#e23744]/10 group-hover:text-[#e23744] transition-colors">
                  <BiPackage className="text-lg" />
                </div>
                <span className="text-sm font-bold text-gray-800">My Orders</span>
              </div>
              <BiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div 
              className="group flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/address')}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600 group-hover:bg-[#e23744]/10 group-hover:text-[#e23744] transition-colors">
                  <BiMapPin className="text-lg" />
                </div>
                <span className="text-sm font-bold text-gray-800">Saved Addresses</span>
              </div>
              <BiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>

          </div>
        </div> 

        {/* Action Card (Logout) */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div 
            className="group flex cursor-pointer items-center justify-between p-4 hover:bg-red-50 transition-colors"
            onClick={logoutHandler}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                <BiLogOut className="text-lg" />
              </div>
              <span className="text-sm font-bold text-red-600">Log Out</span>
            </div>
          </div>
        </div>

      </div>
      <Footer/>
    </div>
  );
};

export default Account;