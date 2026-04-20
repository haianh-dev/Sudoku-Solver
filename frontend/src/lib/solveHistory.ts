export type PuzzleDifficulty = "Easy" | "Medium" | "Hard";

export type SolveStatus = "Solved";

export type SolveHistoryEntry = {
  timestamp: string;
  size: number;
  difficulty: PuzzleDifficulty | "Custom";
  status: SolveStatus;
  unsolvedBoard: number[][];
  solvedBoard: number[][];
};

export const SOLVE_HISTORY_STORAGE_KEY = "sudoku-recent-solves";
export const MAX_SOLVE_HISTORY = 12;

function isValidBoardShape(board: unknown): board is number[][] {
  return (
    Array.isArray(board) &&
    board.length > 0 &&
    board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === board.length &&
        row.every((value) => typeof value === "number" && value >= 0 && value <= board.length)
    )
  );
}

export function parseSolveHistory(rawValue: string | null): SolveHistoryEntry[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry) => {
        if (!entry || typeof entry !== "object") {
          return false;
        }

        const candidate = entry as Partial<SolveHistoryEntry>;
        const boardSize = candidate.unsolvedBoard?.length;
        return (
          typeof candidate.timestamp === "string" &&
          typeof boardSize === "number" &&
          boardSize > 0 &&
          (typeof candidate.size === "number" ? candidate.size === boardSize : true) &&
          (candidate.difficulty === "Easy" ||
            candidate.difficulty === "Medium" ||
            candidate.difficulty === "Hard" ||
            candidate.difficulty === "Custom") &&
          candidate.status === "Solved" &&
          isValidBoardShape(candidate.unsolvedBoard) &&
          isValidBoardShape(candidate.solvedBoard)
        );
      })
      .slice(0, MAX_SOLVE_HISTORY)
      .map((entry) => {
        const candidate = entry as SolveHistoryEntry;
        return {
          ...candidate,
          size: typeof candidate.size === "number" ? candidate.size : candidate.unsolvedBoard.length
        };
      });
  } catch {
    return [];
  }
}
