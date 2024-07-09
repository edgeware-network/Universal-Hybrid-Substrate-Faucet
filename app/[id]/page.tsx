"use client";
import Faucet from "@/components/Faucet";
import ParticlesComponent from "@/components/ParticlesComponent";

export default function FaucetPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="relative z-0">
      <ParticlesComponent />
      <Faucet url={params.id} />
    </main>
  );
};