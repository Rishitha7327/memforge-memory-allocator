
import { useEffect, useState } from "react";
import {
  Cpu, RefreshCw, Trash2, MemoryStick,
  CheckCircle2, Layers, Activity
} from "lucide-react";
import "./MemoryPlayground.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function MemoryPlayground() {
  const [blocks, setBlocks] = useState([]);
  const [size, setSize] = useState("256");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const addHistory = (operation, details) => {
    setHistory((previous) => [
      {
        id: Date.now() + Math.random(),
        operation,
        details,
        time: new Date().toLocaleTimeString()
      },
      ...previous
    ].slice(0, 20));
  };

  const refreshBlocks = async () => {
    try {
      const response = await fetch(`${API}/api/blocks`);
      if (!response.ok) throw new Error("Unable to fetch memory blocks");

      const data = await response.json();
      setBlocks(data.blocks);
      setError("");
      return data.blocks;
    } catch {
      setError("Backend connection failed. Start your C allocator backend.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBlocks();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();

    const requestedSize = Number(size);

    if (!Number.isInteger(requestedSize) || requestedSize <= 0) {
      setError("Enter a valid positive memory size.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/api/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: requestedSize })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Allocation failed");

      setMessage(`Successfully allocated ${requestedSize} bytes. ID: ${data.id}`);
      addHistory("ALLOCATE", `${requestedSize} bytes · Allocation #${data.id}`);

      await refreshBlocks();
    } catch (err) {
      setError(err.message);
      addHistory("ALLOCATION FAILED", err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFree = async (id) => {
    setBusy(true);
    setError("");
    setMessage("");

    const previousCount = blocks.length;

    try {
      const response = await fetch(`${API}/api/free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Free failed");

      setMessage(`Allocation #${id} freed successfully.`);
      addHistory("FREE", `Allocation #${id} released`);

      const updatedBlocks = await refreshBlocks();

      if (updatedBlocks && updatedBlocks.length < previousCount) {
        addHistory("COALESCE", "Adjacent free blocks merged successfully");
      }
    } catch (err) {
      setError(err.message);
      addHistory("FREE FAILED", err.message);
    } finally {
      setBusy(false);
    }
  };

  const allocatedBlocks = blocks.filter((block) => !block.isFree);
  const totalBlockSize = blocks.reduce((sum, block) => sum + block.size, 0);

  return (
    <section className="playground-section" id="playground">
      <div className="playground-container">

        <div className="playground-heading">
          <span className="playground-tag">
            <Cpu size={15} /> LIVE C ALLOCATOR
          </span>
          <h2>Memory Playground</h2>
          <p>
            Allocate, release and visualize memory using your actual
            C First Fit memory allocator.
          </p>
        </div>

        <div className="playground-panel">

          <div className="playground-top">
            <div>
              <h3><MemoryStick size={20} /> Memory Pool</h3>
              <span>4096 Bytes · Actual C Memory</span>
            </div>

            <button
              className="refresh-button"
              onClick={refreshBlocks}
              disabled={busy}
              type="button"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <form className="allocation-form" onSubmit={handleAllocate}>
            <div className="input-group">
              <label htmlFor="memory-size">Allocation Size (Bytes)</label>
              <input
                id="memory-size"
                type="number"
                min="1"
                max="4096"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Enter bytes"
                disabled={busy}
              />
            </div>

            <button className="allocate-button" type="submit" disabled={busy || loading}>
              {busy ? "Processing..." : "+ Allocate Memory"}
            </button>
          </form>

          {error && <div className="playground-error">{error}</div>}
          {message && <div className="playground-message">{message}</div>}

          <div className="memory-map-heading">
            <h3>Memory Block Visualization</h3>
            <span>{blocks.length} blocks</span>
          </div>

          {loading ? (
            <p className="empty-message">Loading memory blocks...</p>
          ) : (
            <div className="memory-map">
              {blocks.map((block) => {
                const width = totalBlockSize
                  ? (block.size / totalBlockSize) * 100
                  : 0;

                const showLabel = width >= 9;

                return (
                  <div
                    key={block.index}
                    className={`memory-block ${
                      block.isFree ? "free-block" : "allocated-block"
                    }`}
                    style={{ width: `${width}%` }}
                    title={`${block.isFree ? "Free" : `Allocation #${block.allocationId}`} · ${block.size} bytes`}
                  >
                    {showLabel && (
                      <>
                        <strong>
                          {block.isFree ? "FREE" : `#${block.allocationId}`}
                        </strong>
                        <span>{block.size} B</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="memory-legend">
            <span><i className="legend-free"></i> Free</span>
            <span><i className="legend-allocated"></i> Allocated</span>
          </div>

          <div className="block-details">
            <h3><Layers size={18} /> Memory Block Details</h3>

            {blocks.map((block) => (
              <div className="block-detail-item" key={block.index}>
                <div className="block-detail-left">
                  <span className={`block-dot ${block.isFree ? "dot-free" : "dot-allocated"}`}></span>
                  <div>
                    <strong>
                      {block.isFree ? "Free Block" : `Allocation #${block.allocationId}`}
                    </strong>
                    <small>Block {block.index + 1}</small>
                  </div>
                </div>

                <div className="block-detail-right">
                  <strong>{block.size} bytes</strong>
                  <span className={block.isFree ? "status-free" : "status-allocated"}>
                    {block.isFree ? "FREE" : "ALLOCATED"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="allocation-list">
            <h3>Active Allocations</h3>

            {allocatedBlocks.length === 0 ? (
              <p className="empty-message">
                No active allocations. Allocate memory to get started.
              </p>
            ) : (
              allocatedBlocks.map((block) => (
                <div className="allocation-item" key={block.allocationId}>
                  <div>
                    <strong>Allocation #{block.allocationId}</strong>
                    <span>{block.size} bytes</span>
                  </div>

                  <button
                    className="free-button"
                    onClick={() => handleFree(block.allocationId)}
                    disabled={busy}
                    type="button"
                  >
                    <Trash2 size={15} /> Free
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="operation-history">
            <div className="history-heading">
              <h3><Activity size={18} /> Operation History</h3>
              <span>{history.length} operations</span>
            </div>

            {history.length === 0 ? (
              <p className="empty-message">
                Your allocation and free operations will appear here.
              </p>
            ) : (
              history.map((item) => (
                <div className="history-item" key={item.id}>
                  <CheckCircle2 size={17} />
                  <div>
                    <strong>{item.operation}</strong>
                    <span>{item.details}</span>
                  </div>
                  <small>{item.time}</small>
                </div>
              ))
            )}
          </div>

          <div className="playground-footer">
            <span>Powered by your C First Fit allocator</span>
            <span>Splitting · Free · Coalescing</span>
          </div>

        </div>
      </div>
    </section>
  );
}

export default MemoryPlayground;
