import ParticlesComponent from "@/components/ParticlesComponent";
import Balance from "@/components/Balance";

export default async function Status() {

  return (
    <main className="flex flex-col items-center min-h-screen justify-center">
      <ParticlesComponent />
      <Balance />
    </main>
  );
}
