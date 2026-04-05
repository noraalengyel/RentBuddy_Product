import { House } from "lucide-react";

export default function Logo() {
  return (
    <div className="logo">
      <div className="logo-icon">
        <House size={16} />
      </div>
      <span className="logo-text">RentBuddy</span>
    </div>
  );
}