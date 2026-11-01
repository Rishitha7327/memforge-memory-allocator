
import { useState } from "react";
import {
  Search, Split, Trash2, Combine,
  ArrowRight, CheckCircle
} from "lucide-react";
import "./HowItWorks.css";

const steps = [
  {
    title: "First Fit Allocation",
    subtitle: "Find the first suitable block",
    description:
      "When a program requests memory, the allocator searches from the beginning and selects the first free block large enough to satisfy the request.",
    icon: Search,
    blocks: [
      ["FREE", "free"],
      ["FREE", "selected"],
      ["FREE", "free"],
    ],
    note: "The first suitable free block is selected."
  },
  {
    title: "Block Splitting",
    subtitle: "Divide memory when needed",
    description:
      "If the selected free block is larger than the requested size, the allocator splits it into an allocated block and a remaining free block.",
    icon: Split,
    blocks: [
      ["USED", "used"],
      ["FREE", "free"],
      ["FREE", "free"],
    ],
    note: "One large free block becomes smaller blocks."
  },
  {
    title: "Memory Deallocation",
    subtitle: "Release memory for reuse",
    description:
      "When a program no longer needs memory, my_free() marks its block as free so that the allocator can reuse it.",
    icon: Trash2,
    blocks: [
      ["FREE", "free"],
      ["FREE", "free"],
      ["USED", "used"],
    ],
    note: "The released block becomes available again."
  },
  {
    title: "Block Coalescing",
    subtitle: "Merge adjacent free blocks",
    description:
      "When two neighboring blocks are free, coalesce_blocks() combines them into one larger free block.",
    icon: Combine,
    blocks: [
      ["", "merged"],
      ["USED", "used"],
    ],
    note: "Adjacent free blocks become one larger block."
  }
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const Icon = step.icon;

  return (
    <section className="how-section" id="how-it-works">

      <div className="how-heading">
        <span className="section-tag">UNDER THE HOOD</span>
        <h2>How does <span>MemForge</span> work?</h2>
        <p>
          Discover the four important operations
          behind our custom C memory allocator.
        </p>
      </div>

      <div className="step-tabs">
        {steps.map((item, index) => (
          <button
            key={item.title}
            className={`step-tab ${active === index ? "active" : ""}`}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>

      <div className="how-content" key={active}>

        <div className="how-info">
          <div className="how-icon">
            <Icon size={30} />
          </div>

          <span className="step-number">
            STEP 0{active + 1} / 04
          </span>

          <h3>{step.title}</h3>
          <h4>{step.subtitle}</h4>
          <p>{step.description}</p>

          <div className="step-note">
            <CheckCircle size={19} />
            {step.note}
          </div>

          <button
            className="next-step"
            onClick={() => setActive((active + 1) % steps.length)}
          >
            Next operation <ArrowRight size={17} />
          </button>
        </div>

        <div className="how-visual">
          <div className="visual-top">
            <span>MEMORY BLOCK VISUALIZATION</span>
            <span>4096 BYTES</span>
          </div>

          <div className="demo-blocks">
            {step.blocks.map(([label, type], index) => (
              <div
                key={`${active}-${index}`}
                className={`demo-block ${type}`}
              >
                {type === "merged" ? (
                  <>
                    <Combine size={24} />
                    <b>MERGED FREE BLOCK</b>
                  </>
                ) : (
                  <>
                    <span>BLOCK 0{index + 1}</span>
                    <b>{label}</b>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="block-legend">
            <span><i className="free-dot"></i> Free</span>
            <span><i className="used-dot"></i> Allocated</span>
            <span><i className="selected-dot"></i> Selected</span>
          </div>

          <div className="visual-caption">
            <Icon size={20} />
            <p>{step.note}</p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
