from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from solver_logic import solve_sudoku

app = FastAPI(title="Sudoku Solver API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SolveRequest(BaseModel):
    board: list[list[int]] = Field(..., description="Sudoku board 9x9, 0 means empty")

    @field_validator("board")
    @classmethod
    def validate_board(cls, board: list[list[int]]) -> list[list[int]]:
        if len(board) != 9:
            raise ValueError("Board must have exactly 9 rows.")

        for row in board:
            if len(row) != 9:
                raise ValueError("Each row must have exactly 9 columns.")
            for value in row:
                if not isinstance(value, int) or value < 0 or value > 9:
                    raise ValueError("Board values must be integers between 0 and 9.")
        return board


class SolveResponse(BaseModel):
    solved: bool
    board: list[list[int]] | None = None
    error: str | None = None


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/solve", response_model=SolveResponse)
def solve(request: SolveRequest) -> SolveResponse:
    try:
        result = solve_sudoku(request.board)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Solver failed: {exc}") from exc

    if result is None:
        return SolveResponse(solved=False, board=None, error="Khong the giai board nay.")

    return SolveResponse(solved=True, board=result, error=None)
