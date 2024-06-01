import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ParticlesComponent from "../ParticlesComponent";

export default function ConnectingPopup() {
  return (
    <>
      <ParticlesComponent />
      <div className="connect-modal w-full h-full fixed inset-0 flex items-center justify-center">
        <div className="bg-[#131313] w-[432px] p-4 h-auto flex flex-col gap-[20px] items-center border-2 border-[#252525] rounded-[12px]">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-[#eaeaea] text-base">
              Please confirm the connection...
            </h3>
          </div>
          <div className="w-full flex flex-col gap-[10px] items-center">
            <ClipLoader
              color="#FC72FF"
              loading={true}
              size={20}
              speedMultiplier={1}
              aria-label="Loading Spinner"
              data-testid="loader"
            />{" "}
            <span className="text-white">Connecting... </span>
          </div>
        </div>
      </div>
    </>
  );
}
