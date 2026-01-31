// frontend/src/components/AddProductModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import coconutImg from "../assets/FloatingCoco.png";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGE_SIZE_MB = 5;

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    type: "",
    image: null,
  });

  const [fallingCoconuts, setFallingCoconuts] = useState([]);
  const [errors, setErrors] = useState({});

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          0.75
        );
      };

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    let interval;

    const spawnCoconut = () => {
      setFallingCoconuts((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          size: 20 + Math.random() * 20,
          duration: 8 + Math.random() * 6,
        },
      ]);
    };

    spawnCoconut();
    interval = setInterval(spawnCoconut, 1200);

    return () => {
      clearInterval(interval);
      setFallingCoconuts([]);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        type: "",
        image: null,
      });
      setErrors({});
    }
  }, [isOpen]);

  // ✅ Fix: Fetch categories dynamically
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/products/categories/");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load categories", error);
        // Fallback or empty to prevent crash
        setCategories([]);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const next = {};

    if (form.name.trim().length < 3) {
      next.name = "Product name must be at least 3 characters long.";
    }
    if (form.description.trim().length < 10) {
      next.description = "Description must be at least 10 characters long.";
    }
    if (!form.price || Number(form.price) <= 0) {
      next.price = "Price is required and must be greater than 0.";
    }
    if (!form.category) {
      next.category = "Category is required.";
    }
    if (!form.type) {
      next.type = "Product type is required.";
    }
    if (!form.image) {
      next.image = "Product image is required.";
    }

    setErrors(next);
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) return;

    const token = localStorage.getItem("access");
    if (!token) {
      toast.info("Please sign in to add a product.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);

    // ✅ backend expects: category = slug (e.g. "food-items")
    formData.append("category", form.category);

    // ✅ backend expects: type (mapped to product_type)
    //    serializer uses: type = SlugRelatedField(source="product_type", slug_field="name")
    formData.append("type", form.type);

    if (form.image) formData.append("image", form.image);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to add product";

        try {
          const errorData = await response.json();

          if (errorData && typeof errorData === "object") {
            const msgs = [];

            if (errorData.name) msgs.push(`Name: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`);
            if (errorData.description) msgs.push(`Description: ${Array.isArray(errorData.description) ? errorData.description[0] : errorData.description}`);
            if (errorData.price) msgs.push(`Price: ${Array.isArray(errorData.price) ? errorData.price[0] : errorData.price}`);
            if (errorData.category) msgs.push(`Category: ${Array.isArray(errorData.category) ? errorData.category[0] : errorData.category}`);
            if (errorData.type) msgs.push(`Product Type: ${Array.isArray(errorData.type) ? errorData.type[0] : errorData.type}`);
            if (errorData.image) msgs.push(`Image: ${Array.isArray(errorData.image) ? errorData.image[0] : errorData.image}`);
            if (errorData.non_field_errors) msgs.push(...errorData.non_field_errors);

            if (msgs.length > 0) errorMessage = msgs.join("\n");
            else if (errorData.detail) errorMessage = errorData.detail;
            else if (errorData.error) errorMessage = errorData.error;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      toast.success("Product added successfully.");
      onClose?.();
      onSuccess?.();
    } catch (err) {
      console.error("Add product error:", err);
      toast.error(err.message || "Unable to add product. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />

      {/* POPUP CARD */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl
                   bg-[#fff8ee]/85 backdrop-blur-xl
                   shadow-[0_25px_80px_rgba(0,0,0,0.3)]
                   border border-white/50
                   p-8 overflow-hidden"
      >
        {/* CONTINUOUS FLOATING COCONUTS */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {fallingCoconuts.map((c) => (
            <img
              key={c.id}
              src={coconutImg}
              alt="coconut"
              className="absolute animate-coconut-drop opacity-20"
              style={{
                left: `${c.left}%`,
                width: `${c.size}px`,
                animationDuration: `${c.duration}s`,
              }}
              onAnimationEnd={() => setFallingCoconuts((prev) => prev.filter((item) => item.id !== c.id))}
            />
          ))}
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} noValidate className="relative z-10 space-y-5">
          <h2 className="text-2xl font-bold text-[#3a2a1a] text-center">Add New Product</h2>

          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            className="w-full rounded-lg px-4 py-3
                       bg-white/95 border border-[#d6c3a5]
                       text-[#2f2a24] placeholder-[#6b5e4b]
                       focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

          <textarea
            placeholder="Product description"
            rows={3}
            value={form.description}
            className="w-full rounded-lg px-4 py-3
                       bg-white/95 border border-[#d6c3a5]
                       text-[#2f2a24] placeholder-[#6b5e4b]
                       focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            onChange={(e) => updateField("description", e.target.value)}
            required
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}

          <input
            type="text"
            inputMode="decimal"
            placeholder="Price (e.g. 10.50)"
            value={form.price}
            className="w-full rounded-lg px-4 py-3
                       bg-white/95 border border-[#d6c3a5]
                       text-[#2f2a24]
                       focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(value)) updateField("price", value);
            }}
            required
          />
          {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}

          {/* ✅ Category slug must match DB */}
          <select
            className="w-full rounded-lg px-4 py-3
                       bg-white/95 border border-[#d6c3a5]
                       text-[#2f2a24]
                       focus:outline-none focus:ring-2 focus:ring-green-600"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}

          {/* ✅ ProductType.name values must match DB (Raw Materials / Processed Goods / Equipment) */}
          <select
            className="w-full rounded-lg px-4 py-3
                       bg-white/95 border border-[#d6c3a5]
                       text-[#2f2a24]
                       focus:outline-none focus:ring-2 focus:ring-green-600"
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            required
          >
            <option value="">Select Product Type</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Processed Goods">Processed Goods</option>
            <option value="Equipment">Equipment</option>
          </select>
          {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}

          <input
            type="file"
            className="text-sm text-[#3a2a1a]"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                toast.warning("Only JPG, PNG, and WEBP images are allowed.");
                e.target.value = "";
                return;
              }

              const sizeMB = file.size / (1024 * 1024);
              if (sizeMB > MAX_IMAGE_SIZE_MB) {
                toast.warning("Image size must be under 5MB.");
                e.target.value = "";
                return;
              }

              try {
                const compressed = await compressImage(file);
                updateField("image", compressed);
              } catch (err) {
                console.error("Image compression error:", err);
                toast.error("Unable to process the image. Please try another file.");
                e.target.value = "";
              }
            }}
          />
          {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}

          {form.image && (
            <p className="text-xs text-green-700">
              Image ready: {(form.image.size / 1024).toFixed(0)} KB
            </p>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg
                         bg-white/70 border border-[#cbb89a]
                         text-[#3a2a1a] hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg
                         bg-green-700 text-white font-semibold
                         hover:bg-green-800"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
