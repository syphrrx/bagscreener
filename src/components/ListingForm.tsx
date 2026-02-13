"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { LISTING_COST_LAMPORTS, TREASURY_WALLET } from "@/lib/constants";
import { Send, Loader2 } from "lucide-react";

type FormState = "idle" | "paying" | "confirming" | "submitting" | "success" | "error";

export default function ListingForm({ onSuccess }: { onSuccess?: () => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [description, setDescription] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !sendTransaction) return;

    setError("");

    try {
      // Step 1: Send 1 SOL to treasury
      setFormState("paying");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: LISTING_COST_LAMPORTS,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);

      // Step 2: Wait for confirmation
      setFormState("confirming");
      await connection.confirmTransaction(signature, "confirmed");

      // Step 3: Submit listing to our API
      setFormState("submitting");
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenAddress,
          tokenName,
          tokenTicker,
          description,
          creatorWallet: publicKey.toBase58(),
          txSignature: signature,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create listing");
      }

      setFormState("success");
      setTokenAddress("");
      setTokenName("");
      setTokenTicker("");
      setDescription("");
      onSuccess?.();

      setTimeout(() => setFormState("idle"), 3000);
    } catch (err: unknown) {
      setFormState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClass =
    "w-full border border-vw-purple/20 bg-vw-dark/80 px-3 py-2.5 text-sm text-white placeholder-vw-purple/30 outline-none transition focus:border-vw-pink focus:shadow-[0_0_10px_rgba(255,110,199,0.2)]";

  if (!publicKey) {
    return (
      <div className="vw-card p-8 text-center">
        <p className="text-lg font-bold neon-purple">
          Connect your wallet to list a token
        </p>
        <p className="mt-2 text-sm text-vw-purple/40">
          It costs 1 SOL. Put your bags where your mouth is.
        </p>
      </div>
    );
  }

  return (
    <div className="vw-card-pink p-6">
      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-white">
          List Your Token <span className="neon-pink">(1 SOL)</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Token Address (CA)
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Enter pump.fun token address..."
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Token Name
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g. DogWifHat"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Ticker
            </label>
            <input
              type="text"
              value={tokenTicker}
              onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
              placeholder="e.g. WIF"
              required
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Description / Meme (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should anyone care about this bag?"
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-vw-hot/30 bg-vw-hot/5 px-4 py-2">
            <p className="text-sm text-vw-hot">{error}</p>
          </div>
        )}

        {formState === "success" && (
          <div className="mt-4 border border-vw-cyan/30 bg-vw-cyan/5 px-4 py-2">
            <p className="text-sm neon-cyan">
              Listing created! Your bags are on the line.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={formState !== "idle" && formState !== "error" && formState !== "success"}
          className="vw-btn mt-4 flex w-full items-center justify-center gap-2 px-6 py-3 text-sm"
        >
          {formState === "paying" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending 1 SOL...
            </>
          )}
          {formState === "confirming" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Confirming tx...
            </>
          )}
          {formState === "submitting" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating listing...
            </>
          )}
          {(formState === "idle" || formState === "error" || formState === "success") && (
            <>
              <Send className="h-4 w-4" /> Pay 1 SOL & List Token
            </>
          )}
        </button>
      </form>
    </div>
  );
}
