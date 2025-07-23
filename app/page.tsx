import { RequestTokensForm } from "@/app/request-tokens-form";

export default async function Home() {
  return (
    <div className="pointer-events-auto flex h-full">
      <RequestTokensForm />
    </div>
  );
}
