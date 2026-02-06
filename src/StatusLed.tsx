import { CSSProperties } from "react";
export default function StatusLed({
  label,
  active,
  color,
  isError,
}: {
  label: string;
  active: boolean;
  color: string;
  isError?: boolean;
}) {
  const ledStyle: CSSProperties = {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    backgroundColor: active ? color : "#334155",
    boxShadow: active ? `0 0 12px ${color}` : "none",
    transition: "all 0.3s ease",
    opacity: active && isError ? 0.8 : 1,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={ledStyle} />
      <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>{label}</span>
    </div>
  );
}