import React from "react";

// Inline CSS styles
const spinnerStyle: React.CSSProperties = {
  border: "4px solid rgba(0, 0, 0, 0.1)",
  borderLeftColor: "#09f",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;
document.head.appendChild(styleSheet);

type LoadingProps = {
  overlay?: boolean;
};

const Loading: React.FC<LoadingProps> = ({ overlay = true }) => {
  const content = <div style={spinnerStyle}></div>;
  return overlay ? <div style={overlayStyle}>{content}</div> : content;
};

export default Loading;
