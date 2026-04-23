// AdminDashboard.tsx
// FINAL CLEAN VERSION — drops, dropId, and voting system removed

import { useState } from "react";
import { useStore } from "../contexts/StoreContext";
import { Product } from "../contexts/StoreContext";

const label = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #333",
  background: "#111",
  color: "white",
};

const ProductModal = ({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Product | null;
}) => {
  const { addProduct, updateProduct, series } = useStore();

  const [form, setForm] = useState<any>({
    name: editing?.name || "",
    price: editing?.price || 0,
    originalPrice: editing?.originalPrice || 0,
    seriesId: editing?.seriesId || "",
    description: editing?.description || "",
    images: editing?.images || [""],
    variants: editing?.variants || [{ size: "M", stock: 0 }],
    limitedEdition: editing?.limitedEdition || false,
  });

  const setField = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveProduct = () => {
    if (editing) {
      updateProduct(editing.id, form);
    } else {
      addProduct(form);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "620px",
          background: "#0a0a0a",
          padding: "28px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ marginBottom: "22px", fontWeight: 900 }}>
          {editing ? "Edit Product" : "Create Product"}
        </h2>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <div style={{ ...label, marginBottom: "6px" }}>PRODUCT NAME</div>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>PRICE</div>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setField("price", Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>ORIGINAL PRICE</div>
            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) =>
                setField("originalPrice", Number(e.target.value))
              }
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>SERIES</div>
            <select
              value={form.seriesId}
              onChange={(e) => setField("seriesId", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select series</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>DESCRIPTION</div>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              style={{ ...inputStyle, minHeight: "90px" }}
            />
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>IMAGE URL</div>
            <input
              value={form.images[0]}
              onChange={(e) => setField("images", [e.target.value])}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ ...label, marginBottom: "6px" }}>LIMITED EDITION</div>
            <input
              type="checkbox"
              checked={form.limitedEdition}
              onChange={(e) => setField("limitedEdition", e.target.checked)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={saveProduct}
              style={{
                flex: 1,
                padding: "12px",
                background: "#ff0000",
                border: "none",
                borderRadius: "6px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              SAVE PRODUCT
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "#222",
                border: "none",
                borderRadius: "6px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { products } = useStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 900 }}>Admin Dashboard</h1>

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        style={{
          marginTop: "20px",
          padding: "12px 18px",
          background: "#ff0000",
          border: "none",
          borderRadius: "6px",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        CREATE PRODUCT
      </button>

      <div style={{ marginTop: "30px", display: "grid", gap: "12px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "14px",
              border: "1px solid #222",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.6 }}>₹{p.price}</div>
            </div>

            <button
              onClick={() => {
                setEditing(p);
                setOpen(true);
              }}
              style={{
                padding: "6px 12px",
                background: "#222",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              EDIT
            </button>
          </div>
        ))}
      </div>

      <ProductModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
};

export default AdminDashboard;
