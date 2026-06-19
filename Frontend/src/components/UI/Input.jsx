import React from "react";

const Input = ({
  label,
  id,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required = false,
  className = "",
  rows = 3,
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: "var(--accent-error)" }}>*</span>}
        </label>
      )}
      
      {type === "textarea" ? (
        <textarea
          id={id}
          rows={rows}
          className={`form-control ${error ? "form-control-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={`form-control ${error ? "form-control-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
      )}

      {error && <span className="form-error">{error}</span>}
      <style>{`
        .form-control-error {
          border-color: var(--accent-error) !important;
        }
      `}</style>
    </div>
  );
};

export default Input;
