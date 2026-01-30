// src/components/ProductDetailsModal.jsx
import React, { useEffect, useMemo } from "react";

function formatVerifiedTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;

  // Example: Jan 29, 2026 • 8:18 PM
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
  const isVerified = useMemo(() => Boolean(product?.verified_at), [product]);
  const verifiedTime = useMemo(
    () => (product?.verified_at ? formatVerifiedTime(product.verified_at) : ""),
    [product]
  );

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
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-[#fffaf3] rounded-2xl shadow-2xl overflow-hidden border border-black/10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-black/10 bg-white/70">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2b221a] truncate">
                {product.name || "Product"}
              </h2>

              {isVerified && (
                <span className="text-[11px] bg-green-600 text-white px-2 py-1 rounded-full">
                  ✔ Verified
                </span>
              )}
            </div>

            <p className="text-sm text-green-800 mt-1">
              By <span className="font-semibold">{authorName}</span>
            </p>

            {(product.category || product.type) && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {product.category && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-[#2b221a]">
                    Category: {String(product.category).replace(/-/g, " ")}
                  </span>
                )}
                {product.type && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-[#2b221a]">
                    Type: {product.type}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ✅ Visible Close button */}
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full bg-red-600 border border-red-700 hover:bg-red-700 transition flex items-center justify-center text-white"
            aria-label="Close"
            title="Close"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center border border-black/10">
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
              <div className="w-full h-72 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="bg-white/70 rounded-2xl p-4 border border-black/10">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-600">Price</p>
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

              {product.stock_status && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Stock:</span> {product.stock_status}
                </p>
              )}

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* ✅ Non-tech proof wording, only show time */}
              {isVerified && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-semibold text-green-800">
                    Authenticity confirmed
                  </p>
                  <p className="text-xs text-green-900/80 mt-1">
                    Verified on: <span className="font-semibold">{verifiedTime}</span>
                  </p>
                  <p className="text-[11px] text-green-900/70 mt-1">
                    This means the product details were checked and confirmed by the seller.
                  </p>
                </div>
              )}
            </div>

            {/* Owner-only verify */}
            {canVerify && (
              <button
                onClick={() => onVerify?.(product.id)}
                disabled={isVerifying}
                className={`mt-4 w-full px-4 py-3 rounded-2xl font-semibold transition ${
                  isVerifying
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isVerifying ? "Confirming..." : "Confirm Authenticity"}
              </button>
            )}

            {user && !isOwner && !isVerified && (
              <p className="mt-3 text-[12px] text-gray-600 text-center">
                Only the owner can confirm authenticity.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex justify-end gap-2">
          {/*<button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/20 text-black bg-white hover:bg-black/5 transition"
          >
            Close
          </button>*/}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
