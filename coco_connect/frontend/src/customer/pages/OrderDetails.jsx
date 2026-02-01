import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "http://127.0.0.1:8000/api";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/products/orders/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load order details");
      }

      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchOrder}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800">Order not found.</p>
        <Link to="/customer/orders" className="text-green-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-gray-600">Order: {order.order_id}</p>
        </div>
        <Link to="/customer/orders" className="text-sm text-green-700 hover:underline">
          Back to orders
        </Link>
      </div>

      <div className="bg-white rounded shadow p-5 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Date</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Status</span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {order.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  {order.currency} {item.unit_price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  {order.currency} {item.line_total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-5 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              {order.currency} {order.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>
              {order.currency} {order.tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {order.currency} {order.shipping.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>
              {order.currency} {order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
