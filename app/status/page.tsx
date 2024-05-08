export default function Status() {
  return (
    <div className="flex flex-col relative gap-[20px] top-[100px]">
      <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]">
        <h3 className="text-[#9b9b9b] text-xl items-center justify-center">Faucet Balance</h3>
        <div className="h-10"></div>
      </div>
    </div>
  );
}