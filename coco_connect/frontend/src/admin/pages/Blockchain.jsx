import { useState } from "react";

export default function Blockchain() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  async function recordInvestmentOnChain() {
    setLoading(true);
    setTxHash("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/blockchain/record-investment/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investment_id: 3, amount: 7000 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");

      setTxHash(data.tx_hash);
      alert("Recorded on-chain successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl bg-white border-2 border-[#ece7e1] rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-[#6b3f23] mb-6">Blockchain</h1>

      <button
        onClick={recordInvestmentOnChain}
        disabled={loading}
        className="w-full bg-[#4caf50] hover:bg-[#66bb6a] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
      >
        {loading ? "Recording..." : "Record Investment on Chain"}
      </button>

      {txHash && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold">Transaction Hash:</p>
          <p className="break-all text-sm">{txHash}</p>
        </div>
      )}
    </div>
  );
}
