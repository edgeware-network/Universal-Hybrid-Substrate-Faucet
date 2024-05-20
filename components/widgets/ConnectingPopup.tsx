import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

export default function ConnectingPopup() {
  return (
    <div className="connect-modal bg-transparent w-[432px] h-[calc(100vh-16px)] fixed left-auto right-0 mt-1 mr-2 inset-0 flex overflow-hidden rounded-[16px]">
      <div className="text-white w-[80px] hover:bg-[#4040402a] p-2"></div>
      <div className="bg-[#131313] w-full p-4 h-full flex flex-col gap-[20px] items-center border-2 border-[#252525] rounded-[12px]">
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
          <span>Connecting... </span>
        </div>
      </div>
    </div>
  );
}
