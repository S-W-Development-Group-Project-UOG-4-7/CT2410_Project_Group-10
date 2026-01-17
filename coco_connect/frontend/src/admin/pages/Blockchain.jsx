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
        body: JSON.stringify({ investment_id: 3, amount: 7000 }), // change investment_id dynamically later
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blockchain</h1>

      <button
        onClick={recordInvestmentOnChain}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
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
