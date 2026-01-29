// src/components/ProductDetailsModal.jsx
import React, { useEffect, useMemo, useState } from "react";

const ProductDetailsModal = ({
  isOpen,
  product,
  API,
  user,
  access,
  verifyingId,
  onClose,
  onAddToCart,
  onVerify,
}) => {
  const [showChainDetails, setShowChainDetails] = useState(false);

  const isVerified = useMemo(() => {
    return Boolean(product?.verified_at || product?.tx_hash || product?.product_hash);
  }, [product]);

  const authorId = product?.author?.id ?? null;
  const authorName = product?.author?.name ?? "Unknown";
  const isOwner =
    Boolean(user?.id && authorId) && Number(user.id) === Number(authorId);

  const canVerify = Boolean(access && isOwner && !isVerified);
  const isVerifying = verifyingId === product?.id;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setShowChainDetails(false);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const imgSrc = product.image
    ? String(product.image).startsWith("http")
      ? product.image
      : `${API}${product.image}`
    : null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-[#fffaf3] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-black/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3b2f24] truncate">
                {product.name || "Product"}
              </h2>

              {isVerified && (
                <span className="text-[11px] bg-green-600 text-white px-2 py-1 rounded-full">
                  ✔ Verified
                </span>
              )}
            </div>

            <p className="text-sm text-green-700 mt-1">
              By <span className="font-semibold">{authorName}</span>
            </p>

            {(product.category || product.type) && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {product.category && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-[#3b2f24]">
                    Category: {String(product.category).replace(/-/g, " ")}
                  </span>
                )}
                {product.type && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-[#3b2f24]">
                    Type: {product.type}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name || "Product"}
                className="w-full h-72 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="bg-white/60 rounded-2xl p-4 border border-black/10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-[#2f3e46]">
                    ${Number(product.price || 0).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => onAddToCart?.(product.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-semibold"
                >
                  Add to Cart
                </button>
              </div>

              {/* Stock */}
              {product.stock_status && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Stock:</span> {product.stock_status}
                </p>
              )}

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Owner-only verify */}
            {canVerify && (
              <button
                onClick={() => onVerify?.(product.id)}
                disabled={isVerifying}
                className={`mt-4 w-full px-4 py-3 rounded-2xl font-semibold transition ${
                  isVerifying
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isVerifying ? "Verifying..." : "Verify on Blockchain"}
              </button>
            )}

            {user && !isOwner && !isVerified && (
              <p className="mt-3 text-[12px] text-gray-500 text-center">
                Only the owner can verify this product.
              </p>
            )}

            {/* Chain details (Tx moved here ✅) */}
            {(isVerified || product.tx_hash || product.product_hash || product.verified_at) && (
              <div className="mt-4">
                <button
                  onClick={() => setShowChainDetails((v) => !v)}
                  className="w-full text-left bg-white/60 border border-black/10 rounded-2xl px-4 py-3 hover:bg-white/80 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#3b2f24]">
                      Blockchain details
                    </p>
                    <span className="text-sm text-gray-600">
                      {showChainDetails ? "Hide" : "Show"}
                    </span>
                  </div>
                </button>

                {showChainDetails && (
                  <div className="mt-2 bg-white/60 border border-black/10 rounded-2xl p-4 space-y-2">
                    {product.verified_at && (
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Verified at:</span>{" "}
                        {String(product.verified_at)}
                      </p>
                    )}
                    {product.product_hash && (
                      <p className="text-xs text-gray-700 break-all">
                        <span className="font-semibold">Product hash:</span>{" "}
                        {String(product.product_hash)}
                      </p>
                    )}
                    {product.tx_hash && (
                      <p className="text-xs text-gray-700 break-all">
                        <span className="font-semibold">Tx hash:</span>{" "}
                        {String(product.tx_hash)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
