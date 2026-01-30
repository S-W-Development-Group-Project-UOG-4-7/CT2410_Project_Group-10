import { useState } from "react";

export default function Blockchain() {
  const [investmentId, setInvestmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");

  async function recordInvestmentOnChain() {
    if (!investmentId || !amount) {
      setMessage("Please enter both Investment ID and Amount.");
      return;
    }

    setLoading(true);
    setTxHash("");
    setMessage("");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/blockchain/record-investment/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investment_id: Number(investmentId),
            amount: Number(amount),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Blockchain transaction failed");

      setTxHash(data.tx_hash);
      setMessage("Investment successfully recorded on blockchain.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyTxHash() {
    navigator.clipboard.writeText(txHash);
    setMessage("Transaction hash copied to clipboard.");
  }

  return (
    <div className="p-6 max-w-xl bg-white border-2 border-[#ece7e1] rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-[#6b3f23] mb-4">
        Blockchain Investment Recording
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        This action permanently records an investment on the blockchain and
        stores the transaction hash for verification.
      </p>

      {/* Investment ID */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Investment ID</label>
        <input
          type="number"
          value={investmentId}
          onChange={(e) => setInvestmentId(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="e.g. 4"
        />
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="e.g. 7000"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={recordInvestmentOnChain}
        disabled={loading}
        className="w-full bg-[#4caf50] hover:bg-[#66bb6a] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
      >
        {loading ? "Recording on Blockchain..." : "Record Investment on Chain"}
      </button>

      {/* Status Message */}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold mb-1">Transaction Hash</p>
          <p className="break-all text-xs mb-2">{txHash}</p>
          <button
            onClick={copyTxHash}
            className="text-sm text-blue-600 hover:underline"
          >
            Copy txHash
          </button>
        </div>
      )}
    </div>
  );
}
