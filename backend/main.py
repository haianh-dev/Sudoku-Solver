from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

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
    size: int = Field(9, description="Sudoku size NxN (e.g. 4, 9)")
    board: list[list[int]] = Field(..., description="Sudoku board NxN, 0 means empty")

    @model_validator(mode="after")
    def validate_board(self) -> "SolveRequest":
        size = self.size
        board = self.board
        sqrt_size = int(size**0.5)

        if size <= 0:
            raise ValueError("Size must be a positive integer.")
        if sqrt_size * sqrt_size != size:
            raise ValueError(f"Invalid size {size}. Supported sizes require square sub-grids (e.g. 4, 9, 16).")

        if len(board) != size:
            raise ValueError(f"Board for size {size} must have exactly {size} rows.")

        for row in board:
            if len(row) != size:
                raise ValueError(f"Each row for size {size} must have exactly {size} columns.")
            for value in row:
                if not isinstance(value, int) or value < 0 or value > size:
                    raise ValueError(f"Board values for size {size} must be integers between 0 and {size}.")

        return self


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
        result = solve_sudoku(request.board, request.size)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Solver failed: {exc}") from exc

    if result is None:
        return SolveResponse(
            solved=False,
            board=None,
            error=f"Unable to solve this {request.size}x{request.size} board. Please check the input constraints."
        )

    return SolveResponse(solved=True, board=result, error=None)
