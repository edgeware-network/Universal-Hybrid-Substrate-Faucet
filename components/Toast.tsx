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
    } max-w-[512px] w-full bg-[#202020] shadow-lg rounded-lg items-center border-[#404040] justify-center gap-[10px] pointer-events-auto flex ring-1 p-4 ring-black ring-opacity-5`}
  >
    <Icon className={className} />
    <span className="h-2 w-2 mr-2 block shrink-0" />
      <p className="text-sm">{message}</p>
  </div>
  );
};

export default Toast;