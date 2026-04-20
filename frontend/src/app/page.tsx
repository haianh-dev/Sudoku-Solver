"use client";

import { ChangeEvent, useState } from "react";

const GRID_SIZE = 9;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
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
    setStatusMessage("Da nap de mau. Ban co the bam Solve de thu.");
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
        const detail = "detail" in data && typeof data.detail === "string" ? data.detail : "Khong goi duoc API.";
        throw new Error(detail);
      }

      const solveData = data as SolveResponse;

      if (!solveData.solved || !solveData.board) {
        setErrorMessage(solveData.error ?? "Board khong co nghiem.");
        return;
      }

      const nextMask = inputGrid.map((row, rIndex) =>
        row.map((value, cIndex) => value === "" && solveData.board !== null && solveData.board[rIndex][cIndex] !== 0)
      );

      setGrid(toDisplayGrid(solveData.board));
      setSolverFilledMask(nextMask);
      setStatusMessage("Da giai xong! So ban nhap giu mau den, so may dien co mau xanh.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Da xay ra loi khi giai Sudoku.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 py-8 sm:py-12">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold sm:text-3xl">Sudoku Solver</h1>
        <p className="mb-6 text-center text-sm text-slate-600 sm:text-base">
          Nhap cac so tu 1 den 9, sau do bam Solve de gui board len backend.
        </p>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSolve}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {isLoading ? "Dang giai..." : "Solve"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleRandom}
            disabled={isLoading}
            className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Random
          </button>
        </div>

        {statusMessage && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-800">
            {errorMessage}
          </p>
        )}

        <div className="overflow-x-auto pb-1">
          <div className="mx-auto grid w-fit grid-cols-9 gap-1 rounded-2xl bg-slate-200 p-1.5">
            {grid.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const thickTop = rowIndex % 3 === 0 ? "border-t-2 border-t-slate-700" : "border-t";
              const thickLeft =
                colIndex % 3 === 0 ? "border-l-2 border-l-slate-700" : "border-l border-l-slate-300";
              const thickRight =
                colIndex === GRID_SIZE - 1
                  ? "border-r-2 border-r-slate-700"
                  : "border-r border-r-slate-300";
              const thickBottom =
                rowIndex === GRID_SIZE - 1
                  ? "border-b-2 border-b-slate-700"
                  : "border-b border-b-slate-300";
              const numberColor = solverFilledMask[rowIndex][colIndex] ? "text-sky-600" : "text-slate-900";

                return (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(event) => handleChange(rowIndex, colIndex, event)}
                    disabled={isLoading}
                    className={`h-9 w-9 rounded-md bg-white text-center text-base font-semibold outline-none transition focus:bg-sky-50 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-80 sm:h-11 sm:w-11 sm:text-lg ${numberColor} ${thickTop} ${thickLeft} ${thickRight} ${thickBottom}`}
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
