"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SOLVE_HISTORY_STORAGE_KEY, SolveHistoryEntry, parseSolveHistory } from "../../lib/solveHistory";

function getVisualBlockSize(size: number): number {
  if (size === 4) {
    return 2;
  }
  if (size === 9) {
    return 3;
  }
  const root = Math.floor(Math.sqrt(size));
  return root > 1 ? root : size;
}

function renderBoard(board: number[][]) {
  const size = board.length;
  const blockSize = getVisualBlockSize(size);
  return (
    <div
      className="grid w-fit gap-0.5 rounded-xl border border-[var(--grid-outline)] bg-[var(--grid-shell-bg)] p-1"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const thickTop = rowIndex % blockSize === 0 ? "border-t-2 border-t-[var(--grid-major-line)]" : "border-t";
          const thickLeft =
            colIndex % blockSize === 0
              ? "border-l-2 border-l-[var(--grid-major-line)]"
              : "border-l border-l-[var(--grid-minor-line)]";
          const thickRight =
            colIndex === size - 1 ? "border-r-2 border-r-[var(--grid-major-line)]" : "border-r border-r-[var(--grid-minor-line)]";
          const thickBottom =
            rowIndex === size - 1 ? "border-b-2 border-b-[var(--grid-major-line)]" : "border-b border-b-[var(--grid-minor-line)]";

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`h-7 w-7 rounded-sm bg-[var(--grid-cell-bg)] text-center text-sm font-semibold leading-7 text-[var(--text-color)] sm:h-8 sm:w-8 sm:text-base sm:leading-8 ${thickTop} ${thickLeft} ${thickRight} ${thickBottom}`}
            >
              {value === 0 ? "" : value}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [recentSolves, setRecentSolves] = useState<SolveHistoryEntry[]>([]);

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(SOLVE_HISTORY_STORAGE_KEY);
    setRecentSolves(parseSolveHistory(savedHistory));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4">
        <div>
          <h1 className="outlined-text text-2xl font-semibold">Solve History</h1>
          <p className="text-sm text-[var(--muted-text)]">Review previous runs with source puzzle and solved result.</p>
        </div>
        <Link
          href="/"
          className="control-pill outlined-text rounded-xl border border-[var(--panel-border)] bg-[var(--surface-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:bg-[var(--surface-strong)]"
        >
          Back to Solver
        </Link>
      </header>

      {recentSolves.length === 0 ? (
        <section className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6">
          <p className="text-sm text-[var(--muted-text)]">No solve history yet. Solve a puzzle first to see records here.</p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {recentSolves.map((entry, index) => (
            <article
              key={`${entry.timestamp}-${index}`}
              className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="outlined-text text-sm font-semibold text-[var(--text-color)]">
                  Time: {new Date(entry.timestamp).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded-md border border-[var(--panel-border)] bg-[var(--surface-bg)] px-2 py-1 font-semibold">
                    Size: {entry.size}x{entry.size}
                  </span>
                  <span className="rounded-md border border-[var(--panel-border)] bg-[var(--surface-bg)] px-2 py-1 font-semibold">
                    Difficulty: {entry.difficulty}
                  </span>
                  <span className="rounded-md border border-emerald-400/60 bg-emerald-500/20 px-2 py-1 font-semibold text-emerald-300">
                    {entry.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Unsolved</p>
                  {renderBoard(entry.unsolvedBoard)}
                </div>

                <div className="outlined-text text-xl font-bold text-[var(--text-color)]">-&gt;</div>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Solved</p>
                  {renderBoard(entry.solvedBoard)}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
