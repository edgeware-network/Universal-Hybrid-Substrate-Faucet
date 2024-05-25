import React from "react";

interface ToastProps {
  t: any;
  className: string;
  message: string;
  Icon : React.ElementType; 
};
const Toast = ({ t, Icon, className, message }: ToastProps): React.JSX.Element => {
  return (
    <div
    className={`${
      t.visible ? "animate-enter" : "animate-leave"
    } max-w-[540px] w-full bg-[#050505] shadow-lg text-[#ffffff] rounded-lg items-center border border-[#303030] justify-start pointer-events-auto flex ring-1 p-4 ring-black ring-opacity-5`}
  >
    <Icon className={className} />
    <span className="h-2 w-2 mr-2 block shrink-0" />
      <p className="text-sm text-[#9b9b9b]">{message}</p>
  </div>
  );
};

export default Toast;