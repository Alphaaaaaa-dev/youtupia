import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Package,
  Heart,
  LogOut
} from "lucide-react";
import { useStore } from "../contexts/StoreContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { products, series, creators, cart } = useStore();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "hsl(var(--background))",
          borderBottom: "1px solid hsl(var(--border))",
          zIndex: 100
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            style={{
              fontWeight: 900,
              fontSize: 20,
              textDecoration: "none",
              color: "inherit"
            }}
          >
            YOUTUPIA
          </Link>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link to="/wishlist">
            <Heart size={20} />
          </Link>

          <Link to="/cart" style={{ position: "relative" }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -8,
                  fontSize: 11,
                  background: "#ff0000",
                  color: "#fff",
                  borderRadius: 50,
                  padding: "2px 6px"
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <Link to={user ? "/account" : "/login"}>
            <User size={20} />
          </Link>
        </div>
      </header>

      {/* SIDEBAR */}
      {open && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 200
            }}
          />

          {/* Sidebar */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: 300,
              height: "100vh",
              background: "hsl(var(--background))",
              borderRight: "1px solid hsl(var(--border))",
              zIndex: 300,
              padding: 24,
              overflowY: "auto"
            }}
          >
            {/* Close */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20
              }}
            >
              <strong>Menu</strong>

              <button
                onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "none" }}
              >
                <X />
              </button>
            </div>

            {/* Navigation */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Link to="/" onClick={() => setOpen(false)}>
                Home
              </Link>

              <Link to="/shop" onClick={() => setOpen(false)}>
                Shop
              </Link>

              <Link to="/catalogue" onClick={() => setOpen(false)}>
                Catalogue
              </Link>

              <Link to="/series" onClick={() => setOpen(false)}>
                Series ({series.length})
              </Link>

              <Link to="/creators" onClick={() => setOpen(false)}>
                Creators ({creators.length})
              </Link>

              <Link to="/products" onClick={() => setOpen(false)}>
                All Products ({products.length})
              </Link>

              <Link to="/orders" onClick={() => setOpen(false)}>
                <Package size={16} style={{ marginRight: 6 }} />
                Orders
              </Link>
            </nav>

            {/* User Section */}
            {user && (
              <div style={{ marginTop: 30 }}>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  style={{
                    border: "none",
                    background: "#ff0000",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  <LogOut size={16} style={{ marginRight: 6 }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
