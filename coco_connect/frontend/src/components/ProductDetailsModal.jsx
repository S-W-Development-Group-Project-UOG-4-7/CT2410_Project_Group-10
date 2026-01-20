import React from "react";

const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  // User from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access");
    if (!user || !token) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      if (response.ok) {
        alert("Product added to cart!");
        if (onClose) onClose();
      } else {
        const textStr = await response.text();
        try {
          const errorData = JSON.parse(textStr);
          const errorMessage = errorData.detail || errorData.error || "Unknown error occurred";

          if (response.status === 401) {
            alert("Session expired. Please login again.");
          } else {
            alert(`Failed to add to cart: ${errorMessage}`);
          }
        } catch (e) {
          console.error("Non-JSON error response:", textStr);
          alert(`Server error (${response.status}): The server returned an invalid response. Check console for details.`);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(`Network error: ${error.message}. Ensure backend is running.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal */}
      <div className="bg-[#faf0e6] max-w-3xl w-full mx-4 rounded-xl shadow-xl relative animate-fadeIn">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

          {/* Image */}
          <div>
            {product.image ? (
              <img
                src={
                  product.image.startsWith("http")
                    ? product.image
                    : `http://127.0.0.1:8000${product.image}`
                }
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                No Image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h2 className="text-black text-2xl font-semibold mb-2">
              {product.name}
            </h2>

            <p className="text-sm text-green-700 mb-1">
              By {product.author || "Unknown"}
            </p>

            <p className="text-xl font-bold text-[#4b3b2a] mb-4">
              ${Number(product.price).toFixed(2)}
            </p>

            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              {product.description || "No description available."}
            </p>

            <button
              onClick={handleAddToCart}
              className="mt-auto bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
