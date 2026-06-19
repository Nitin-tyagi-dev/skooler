import React, { useEffect } from "react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "500px",
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== undefined ? (
          footer && <div className="modal-footer">{footer}</div>
        ) : (
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
