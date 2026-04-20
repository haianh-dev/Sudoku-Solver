"use client";

import { ChangeEvent, useEffect, useState } from "react";

const GRID_SIZE = 9;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const EMPTY_GRID = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ""));
const SAMPLE_PUZZLE: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

type SolveResponse = {
  solved: boolean;
  board: number[][] | null;
  error: string | null;
};

type ThemeMode = "light" | "dark" | "contrast";

const THEME_STORAGE_KEY = "sudoku-theme-mode";
const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "contrast", label: "High Contrast" }
];

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.8v2.4M12 18.8v2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M2.8 12h2.4M18.8 12h2.4M5.3 18.7 7 17M17 7l1.7-1.7" />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20 14.2A8.3 8.3 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.2" />
      <path d="M8 8h8M8 12h8M8 16h8" />
    </svg>
  );
}

function isValidDigit(value: string): boolean {
  return value === "" || /^[1-9]$/.test(value);
}

function toBoardPayload(grid: string[][]): number[][] {
  return grid.map((row) => row.map((value) => (value === "" ? 0 : Number(value))));
}

function toDisplayGrid(board: number[][]): string[][] {
  return board.map((row) => row.map((value) => (value === 0 ? "" : String(value))));
}

function createBooleanGrid(defaultValue: boolean): boolean[][] {
  return Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => defaultValue));
}

export default function Home() {
  const [grid, setGrid] = useState<string[][]>(EMPTY_GRID);
  const [solverFilledMask, setSolverFilledMask] = useState<boolean[][]>(createBooleanGrid(false));
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const activeThemeIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex((option) => option.value === themeMode)
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "contrast") {
      setThemeMode(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", themeMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const handleChange = (row: number, col: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.slice(-1);
    if (!isValidDigit(nextValue)) {
      return;
    }

    setGrid((prev) =>
      prev.map((r, rIndex) =>
        r.map((cell, cIndex) => {
          if (rIndex === row && cIndex === col) {
            return nextValue;
          }
          return cell;
        })
      )
    );
    setSolverFilledMask(createBooleanGrid(false));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setGrid(EMPTY_GRID.map((row) => [...row]));
    setSolverFilledMask(createBooleanGrid(false));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleRandom = () => {
    setGrid(toDisplayGrid(SAMPLE_PUZZLE));
    setSolverFilledMask(createBooleanGrid(false));
    setStatusMessage("Sample puzzle loaded. Click Solve to test the solver.");
    setErrorMessage(null);
  };

  const handleSolve = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const inputGrid = grid.map((row) => [...row]);

    try {
      const response = await fetch(`${API_BASE_URL}/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          board: toBoardPayload(inputGrid)
        })
      });

      const data = (await response.json()) as SolveResponse | { detail?: string };

      if (!response.ok) {
        const detail = "detail" in data && typeof data.detail === "string" ? data.detail : "Unable to reach the API.";
        throw new Error(detail);
      }

      const solveData = data as SolveResponse;

      if (!solveData.solved || !solveData.board) {
        setErrorMessage(solveData.error ?? "This puzzle has no valid solution.");
        return;
      }

      const nextMask = inputGrid.map((row, rIndex) =>
        row.map((value, cIndex) => value === "" && solveData.board !== null && solveData.board[rIndex][cIndex] !== 0)
      );

      setGrid(toDisplayGrid(solveData.board));
      setSolverFilledMask(nextMask);
      setStatusMessage("Success! Puzzle solved. Your entries stay dark, solver-filled cells are highlighted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred while solving the puzzle.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.24)_0%,_rgba(129,140,248,0)_72%)]" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(167,139,250,0.28)_0%,_rgba(167,139,250,0)_72%)]" />
      <div className="tech-background pointer-events-none absolute inset-0" />
      <div className="sudoku-pattern pointer-events-none absolute inset-0" />

      <section className="relative z-10 w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-8">
        <h1 className="outlined-text mb-2 text-center text-2xl font-semibold sm:text-3xl">Sudoku Solver</h1>
        <p className="mb-6 text-center text-sm text-[var(--muted-text)] sm:text-base">
          Enter numbers from 1 to 9, then click Solve to send the board to the backend.
        </p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <div className="control-frame relative inline-grid grid-cols-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-bg)] p-1 shadow-inner">
            <span
              className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-[var(--button-solid-bg)] shadow-[0_6px_18px_rgba(79,70,229,0.45)] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(calc(${activeThemeIndex} * 100%))` }}
              aria-hidden="true"
            />
            {THEME_OPTIONS.map((option) => {
              const isActive = themeMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThemeMode(option.value)}
                  className={`theme-option-label relative z-10 inline-flex min-w-28 items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "theme-option-active text-[var(--button-solid-text)]"
                      : "text-[var(--muted-text)] hover:bg-[var(--surface-strong)]"
                  }`}
                  aria-pressed={isActive}
                >
                  <ThemeIcon mode={option.value} />
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSolve}
            disabled={isLoading}
            className="control-pill outlined-text inline-flex items-center gap-2 rounded-xl bg-[var(--button-solid-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-solid-text)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--button-solid-text)]/40 border-t-[var(--button-solid-text)]" />
            )}
            {isLoading ? "Solving..." : "Solve"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="control-pill outlined-text rounded-xl border border-[var(--panel-border)] bg-[var(--surface-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-color)] transition hover:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleRandom}
            disabled={isLoading}
            className="control-pill outlined-text rounded-xl border border-[var(--accent-border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Load Sample
          </button>
        </div>

        {statusMessage && (
          <p className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-400/12 px-3 py-2 text-center text-sm text-emerald-300">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mb-4 rounded-lg border border-rose-400/40 bg-rose-400/12 px-3 py-2 text-center text-sm text-rose-300">
            {errorMessage}
          </p>
        )}

        <div className="overflow-x-auto pb-1">
          <div className="mx-auto grid w-fit grid-cols-9 gap-1 rounded-2xl border border-[var(--grid-outline)] bg-[var(--grid-shell-bg)] p-1.5">
            {grid.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const thickTop = rowIndex % 3 === 0 ? "border-t-2 border-t-[var(--grid-major-line)]" : "border-t";
                const thickLeft =
                  colIndex % 3 === 0 ? "border-l-2 border-l-[var(--grid-major-line)]" : "border-l border-l-[var(--grid-minor-line)]";
                const thickRight =
                  colIndex === GRID_SIZE - 1
                    ? "border-r-2 border-r-[var(--grid-major-line)]"
                    : "border-r border-r-[var(--grid-minor-line)]";
                const thickBottom =
                  rowIndex === GRID_SIZE - 1
                    ? "border-b-2 border-b-[var(--grid-major-line)]"
                    : "border-b border-b-[var(--grid-minor-line)]";
                const numberColor = solverFilledMask[rowIndex][colIndex]
                  ? "text-[var(--accent-text)]"
                  : "text-[var(--text-color)]";

                return (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(event) => handleChange(rowIndex, colIndex, event)}
                    disabled={isLoading}
                    className={`h-9 w-9 rounded-md bg-[var(--grid-cell-bg)] text-center text-base font-semibold outline-none transition focus:bg-[var(--grid-focus-bg)] focus:ring-2 focus:ring-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-80 sm:h-11 sm:w-11 sm:text-lg ${numberColor} ${thickTop} ${thickLeft} ${thickRight} ${thickBottom}`}
                    aria-label={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
