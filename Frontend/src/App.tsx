import { Outlet } from "react-router";
import Header from "./components/Layouts/Header";
import Footer from "./components/Layouts/Footer";
import { Toaster } from "sonner";

const App = () => {
  document.cookie = "app_session=; Max-Age=0; path=/";
  return (
    <div className="bg-[#fffff8] font-Quick">
      {/* <div className="bg-[#F67F45] text-[#F67F45]"> */}
      <Toaster richColors position="bottom-right" />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default App;
