import { LuChevronsUpDown } from "react-icons/lu";

export default function Status() {
  return (
    <div className="flex flex-col relative gap-[20px] top-[100px]">
      <form className="sm:flex hidden flex-col items-center justify-center gap-[6px] p-[4px] bg-[#131313] rounded-[12px]">
        <h3 className="text-[#9b9b9b] text-xl items-center justify-center">Recharge Faucet</h3>
        <div className="flex flex-col items-center space-y-[5px]">
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <span className="text-xs text-[#9b9b9b]">Chain</span>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-2/3 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                placeholder="Ethereum" />
              <button className="w-[120px] h-full p-2 flex gap-2 items-center justify-center bg-[rgba(0,102,255,0.1)] text-sm text-[#0066FF] font-medium rounded-md outline-none">
                <p>Switch</p>
                <LuChevronsUpDown className='h-5 w-5' />
              </button>
            </div>
            <div className="text-[#9b9b9b] text-xs">You are on Ethereum</div>
          </div>
        </div>
        <button type="submit" className="bg-[#311C31] text-[#FC72FF] w-full h-14 text-lg font-medium rounded-[10px]">Request</button>
      </form>
      <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]">
        <h3 className="text-[#9b9b9b] text-xl items-center justify-center">Faucet Balance</h3>
        <div className="h-10"></div>
      </div>
    </div>
  );
}