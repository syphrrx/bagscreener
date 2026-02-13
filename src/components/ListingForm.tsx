"use client";

import { useState } from "react";
import { Send, Loader2, Copy, Check } from "lucide-react";

const TREASURY_ADDRESS = "Di7ojkCcNJH8hXRgZNKXXHWuDBWhPGNKBRYNh8HpxCQs";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ListingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [description, setDescription] = useState("");
  const [creatorWallet, setCreatorWallet] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(TREASURY_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!txSignature.trim()) {
      setError("Please enter the transaction signature after sending 1 SOL.");
      return;
    }

    try {
      setFormState("submitting");
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenAddress,
          tokenName,
          tokenTicker,
          description,
          creatorWallet,
          txSignature,
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
      setCreatorWallet("");
      setTxSignature("");
      onSuccess?.();

      setTimeout(() => setFormState("idle"), 3000);
    } catch (err: unknown) {
      setFormState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClass =
    "w-full border border-vw-purple/20 bg-vw-dark/80 px-3 py-2.5 text-sm text-white placeholder-vw-purple/30 outline-none transition focus:border-vw-pink";

  return (
    <div className="vw-card-pink p-6">
      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-white">
          List Your Token <span className="neon-pink">(1 SOL)</span>
        </h2>

        {/* Step 1: Send SOL */}
        <div className="mb-5 border border-vw-purple/15 bg-vw-dark/50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-vw-purple/50">
            Step 1: Send 1 SOL to this address
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all text-sm text-vw-cyan">
              {TREASURY_ADDRESS}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              className="flex-shrink-0 border border-vw-purple/20 bg-vw-dark p-2 text-vw-purple/60 transition hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-vw-cyan" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Step 2: Fill in details */}
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-vw-purple/50">
          Step 2: Fill in your token details
        </p>

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
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should anyone care about this bag?"
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Your Wallet Address (for payout)
            </label>
            <input
              type="text"
              value={creatorWallet}
              onChange={(e) => setCreatorWallet(e.target.value)}
              placeholder="Your Solana wallet address..."
              required
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-vw-purple/50">
              Transaction Signature (after sending 1 SOL)
            </label>
            <input
              type="text"
              value={txSignature}
              onChange={(e) => setTxSignature(e.target.value)}
              placeholder="Paste your tx signature here..."
              required
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
          disabled={formState === "submitting"}
          className="vw-btn mt-4 flex w-full items-center justify-center gap-2 px-6 py-3 text-sm"
        >
          {formState === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying & creating listing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Submit Listing
            </>
          )}
        </button>
      </form>
    </div>
  );
}
