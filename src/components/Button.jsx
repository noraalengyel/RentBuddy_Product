export default function Button({ children, variant = "primary" }) {
  return (
    <button className={variant === "secondary" ? "btn-secondary" : "btn-primary"}>
      {children}
    </button>
  );
}