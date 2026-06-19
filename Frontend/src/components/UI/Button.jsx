import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "secondary":
        return "btn-secondary";
      case "danger":
        return "btn-danger";
      case "primary":
      default:
        return "btn-primary";
    }
  };

  const getSizeClass = () => {
    return size === "sm" ? "btn-sm" : "";
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="gap-8">
          <svg
            className="animate-spin"
            style={{ animation: "spin 1s linear infinite" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
