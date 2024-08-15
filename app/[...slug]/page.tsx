"use client";
import Faucet from "@/components/Faucet";
import ParticlesComponent from "@/components/ParticlesComponent";

export default function FaucetPage({
  params,
}: {
  params: { slug: [string, string] };
}) {
  return (
    <main className="relative z-0">
      <ParticlesComponent />
      <Faucet url={params.slug[0]} address={params.slug[1]} />
    </main>
  );
};