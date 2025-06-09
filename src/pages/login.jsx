import React, { useState } from "react";
import "@/components/script.jsx";

export const Login = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`w-screen h-screen flex justify-between items-center gradient ${isHovered ? 'active' : ''}`}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <button 
          className="bg-blanco justify-center items-center rounded-[10px] hover:bg-[#000] transition-all duration-400 sombra z-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h3 className="fondo2 hover:text-[#b60000] py-3 px-4 flex text-center transition-all duration-400">
            <span className="letter">C</span>
            <span className="letter">L</span>
            <span className="letter">I</span>
            <span className="letter">C</span>
            <span className="letter">K</span>
            <span className="letter ml-2.5">M</span>
            <span className="letter">E</span>
          </h3>
        </button>
      </div>
    </div>
  );
};

export default Login;
