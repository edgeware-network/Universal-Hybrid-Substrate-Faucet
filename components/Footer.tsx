import React from "react";

const Footer = (): React.JSX.Element => {
  return (
    <div className="max-w-[1204px] w-[90vw] fixed bottom-5 h-14 flex flex-col items-center text-wrap justify-center bg-[#1b1b1b] font-medium rounded-[10px]">
      <p className="text-xs font-medium text-[#656565] flex items-center justify-center">
        Made with&nbsp;
        <span className="text-pink-600 animate-pulse text-lg">💓</span>&nbsp;by
        Edgeware contributors
      </p>

      <p className="text-xs text-[#E6007A] font-bold">
        Funded by Polkadot Treasury - {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default Footer;
