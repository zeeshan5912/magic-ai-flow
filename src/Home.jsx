import React from "react";
import { FaBars } from "react-icons/fa";
import { useGlobalContext } from "./context";
import ReactFlowProviderContent from "./ReactFlowProviderContent";
const Home = () => {
  const { openSidebar, isSidebarOpen } = useGlobalContext();

  return (
    <div className="">
      {/* NavBar */}
      <div className="flex flex-row w-full gap-10 pb-4 shadow-sm p-[13px] ">
        
        <div className={` mt-[0.95rem]    text-3xl font-semibold text-gray-700`}  >
          
        </div>
      </div>
      <div>
        <ReactFlowProviderContent />
      </div>
    </div>
  );
};

export default Home;
