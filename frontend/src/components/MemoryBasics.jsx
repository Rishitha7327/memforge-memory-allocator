
import { Cpu, Database, ArrowDown, RefreshCw } from "lucide-react";
import "./MemoryBasics.css";

function MemoryBasics() {
  return (
    <section className="memory-basics" id="learn">

      <div className="section-heading">
        <span className="section-tag">THE BASICS</span>
        <h2>How does <span>memory management</span> work?</h2>
        <p>
          Think of computer memory as a space where programs
          keep the data they need to work.
        </p>
      </div>

      <div className="memory-explanation">

        <div className="explanation-card">
          <div className="explanation-icon">
            <Cpu size={28} />
          </div>
          <h3>What is memory?</h3>
          <p>
            Memory is the space a computer uses to temporarily
            store data and instructions while programs run.
          </p>
        </div>

        <div className="explanation-card">
          <div className="explanation-icon">
            <Database size={28} />
          </div>
          <h3>What is allocation?</h3>
          <p>
            When a program needs space, the memory allocator
            finds an available block and gives it to the program.
          </p>
        </div>

        <div className="explanation-card">
          <div className="explanation-icon">
            <RefreshCw size={28} />
          </div>
          <h3>What is deallocation?</h3>
          <p>
            When the program no longer needs that space,
            it releases the memory so it can be reused.
          </p>
        </div>

      </div>

      <div className="memory-demo">
        <div className="demo-heading">
          <div>
            <span className="section-tag">VISUAL EXAMPLE</span>
            <h3>Imagine memory as a row of boxes</h3>
            <p>Each box represents a block of available memory.</p>
          </div>
          <div className="demo-icon">
            <Database size={30} />
          </div>
        </div>

        <div className="memory-boxes">
          <div className="memory-box free">FREE</div>
          <div className="memory-box allocated">USED</div>
          <div className="memory-box free">FREE</div>
          <div className="memory-box allocated">USED</div>
          <div className="memory-box free">FREE</div>
        </div>

        <div className="memory-legend">
          <span><i className="legend-free"></i> Available memory</span>
          <span><i className="legend-used"></i> Allocated memory</span>
        </div>

        <div className="demo-note">
          <ArrowDown size={20} />
          <p>
            The allocator manages these blocks, giving memory
            when requested and making it available again when freed.
          </p>
        </div>
      </div>

    </section>
  );
}

export default MemoryBasics;
