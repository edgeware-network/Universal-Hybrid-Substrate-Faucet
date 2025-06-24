import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URI: z.string().min(1),
    HCAPTCHA_SECRET_KEY: z.string().min(1),
    FAUCET_ACCOUNT_SEED: z.string().min(1),
    FAUCET_EVM_ADDRESS: z.string().min(1),
    FAUCET_SUBSTRATE_PUBLIC_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URI: process.env.DATABASE_URI,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    FAUCET_ACCOUNT_SEED: process.env.FAUCET_ACCOUNT_SEED,
    FAUCET_EVM_ADDRESS: process.env.FAUCET_EVM_ADDRESS,
    FAUCET_SUBSTRATE_PUBLIC_KEY: process.env.FAUCET_SUBSTRATE_PUBLIC_KEY,
  },
});
