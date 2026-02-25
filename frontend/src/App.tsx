import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import NavBar from "./components/NavBar";
import Account from "./pages/Account";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <NavBar/>
        <Routes>
          <Route element={<PublicRoute/>}>
             <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute/>}>
              <Route path="/" element={<Home />} />
              <Route path="/select-role" element={<SelectRole/>}/>
              <Route path="/account" element={<Account/>}/>
          </Route>
        </Routes>
        <Toaster/>
      </BrowserRouter>
    </>
  );
};

export default App;
