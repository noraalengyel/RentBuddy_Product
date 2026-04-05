import Logo from "../components/Logo";
import Button from "../components/Button";
import FeatureCard from "../components/FeatureCard";
import "../styles/home.css";
import { Shield, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <div className="page-container home-page">
      <header className="home-header">
        <Logo />
      </header>

      <main className="home-main">
        <section className="hero">
          <h1>RentBuddy</h1>
          <p>See the real cost of renting before you move in.</p>
        </section>

        <section className="features-grid">
          <FeatureCard
            icon={<Shield size={24} />}
            title="Anonymous Reviews"
            text="Share your honest rental experiences"
          />
          <FeatureCard
            icon={<DollarSign size={24} />}
            title="Real Costs"
            text="See utilities and hidden fees upfront"
          />
        </section>

        <section className="home-actions">
          <Button>Sign Up</Button>
          <Button variant="secondary">Log In</Button>
        </section>
      </main>

      <footer className="home-footer">
        © 2026 RentBuddy. Rental transparency for everyone.
      </footer>
    </div>
  );
}