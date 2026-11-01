
import MemoryBasics from "./components/MemoryBasics";
import HowItWorks from "./components/HowItWorks";
import MemoryPlayground from "./components/MemoryPlayground";

import {
  Cpu,
  Brain,
  Blocks,
  Network,
  Atom,
  Rocket,
  ArrowUpRight,
  MemoryStick
} from "lucide-react";

import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <Cpu size={25} />
          </div>
          <div>
            <h2>MemForge</h2>
            <span> // Memory, Simplified</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#learn">Learn</a>
          <a href="#explore">Explore</a>
          <a href="#playground">Playground</a>

          <a href="#playground" className="contact-btn">
            Get Started <ArrowUpRight size={16} />
          </a>
        </div>
      </nav>

      <main className="hero" id="home">
        <section className="hero-content">
          <div className="status">
            <span className="status-dot"></span>
            MEMORY LAB ONLINE // V1.0
          </div>

          <h1>
            Understand the
            <span> Memory Behind Code.</span>
          </h1>

          <p>
            Discover how computers manage memory.
            Allocate, release and visualize memory
            through an interactive experience powered
            by a custom C memory allocator.
          </p>

          <div className="hero-buttons">
            <a href="#playground" className="primary-btn">
              <Rocket size={17} /> Start Exploring
            </a>

            <a href="#learn" className="secondary-btn">
              Learn How It Works
            </a>
          </div>

          <div className="highlights">
            <div>
              <strong>4 KB</strong>
              <small>Memory Pool</small>
            </div>

            <div>
              <strong>First Fit</strong>
              <small>Allocation</small>
            </div>

            <div>
              <strong>C</strong>
              <small>Core Engine</small>
            </div>
          </div>
        </section>

        <section className="visual-card" id="explore">
          <div className="visual-heading">
            <span>MEMORY VISUALIZER</span>
            <span className="live">● LIVE</span>
          </div>

          <div className="memory-orb">
            <div className="orb-inner">
              <MemoryStick size={48} />
              <span>4096 BYTES</span>
            </div>
          </div>

          <div className="memory-label">
            MEMORY ALLOCATION ENGINE
          </div>

          <div className="feature-grid">
            <div className="feature">
              <Brain size={20} />
              <div>
                <b>First Fit</b>
                <small>Smart Allocation</small>
              </div>
            </div>

            <div className="feature">
              <Blocks size={20} />
              <div>
                <b>Block Split</b>
                <small>Memory Division</small>
              </div>
            </div>

            <div className="feature">
              <Network size={20} />
              <div>
                <b>Coalescing</b>
                <small>Block Merging</small>
              </div>
            </div>

            <div className="feature">
              <Atom size={20} />
              <div>
                <b>Memory Map</b>
                <small>Visual Tracking</small>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HowItWorks />

      <MemoryBasics />

      <MemoryPlayground />

      <footer>
        <span>MEMFORGE © 2026</span>
        <span>BUILT WITH C · REACT · LINUX MMAP</span>
      </footer>
    </div>
  );
}

export default App;
