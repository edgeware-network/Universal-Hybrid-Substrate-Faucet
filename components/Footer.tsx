import React from 'react'

const Footer = (): React.JSX.Element => {
  return (
    <div className='max-w-[1204px] w-[90vw] fixed bottom-5 z-10 h-14 flex flex-col items-center text-wrap justify-center bg-[#1b1b1b] font-medium rounded-[10px]'>
      <p className='text-xs font-medium text-[#656565] flex items-center justify-center'>Made by Edgeware contributors</p>
      <p className='text-xs font-medium text-[#494949]'>Edgeware © 2024 - {new Date().getFullYear()}</p>
    </div>
  );
};

export default Footer;