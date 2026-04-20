from pysat.solvers import Glucose3
from math import isqrt


class SudokuSATSolver:
    def __init__(self, size: int) -> None:
        self.size = size
        self.block_size = isqrt(size)
        if self.block_size * self.block_size != size:
            raise ValueError(f"Invalid size {size}. Grid size must have an integer square root (e.g. 4, 9, 16).")

        self.solver = Glucose3()
        self.max_primary_var = size * size * size
        self.aux_id = self.max_primary_var + 1

    def get_x_id(self, i: int, j: int, k: int) -> int:
        return (i - 1) * self.size * self.size + (j - 1) * self.size + k

    def add_amo_sc(self, vars_list: list[int]) -> None:
        n = len(vars_list)
        if n <= 1:
            return

        s = [self.aux_id + i for i in range(n - 1)]
        self.aux_id += n - 1

        self.solver.add_clause([-vars_list[0], s[0]])

        for i in range(1, n - 1):
            self.solver.add_clause([-vars_list[i], s[i]])
            self.solver.add_clause([-s[i - 1], s[i]])
            self.solver.add_clause([-vars_list[i], -s[i - 1]])

        self.solver.add_clause([-vars_list[n - 1], -s[n - 2]])

    def solve(self, board: list[list[int]]) -> list[list[int]] | None:
        for i in range(1, self.size + 1):
            for j in range(1, self.size + 1):
                self.solver.add_clause([self.get_x_id(i, j, k) for k in range(1, self.size + 1)])

        for i in range(1, self.size + 1):
            for j in range(1, self.size + 1):
                self.add_amo_sc([self.get_x_id(i, j, k) for k in range(1, self.size + 1)])

        for i in range(1, self.size + 1):
            for k in range(1, self.size + 1):
                self.add_amo_sc([self.get_x_id(i, j, k) for j in range(1, self.size + 1)])

        for j in range(1, self.size + 1):
            for k in range(1, self.size + 1):
                self.add_amo_sc([self.get_x_id(i, j, k) for i in range(1, self.size + 1)])

        for r_st in range(1, self.size + 1, self.block_size):
            for c_st in range(1, self.size + 1, self.block_size):
                for k in range(1, self.size + 1):
                    block_vars = []
                    for i in range(r_st, r_st + self.block_size):
                        for j in range(c_st, c_st + self.block_size):
                            block_vars.append(self.get_x_id(i, j, k))
                    self.add_amo_sc(block_vars)

        for r in range(self.size):
            for c in range(self.size):
                if board[r][c] != 0:
                    self.solver.add_clause([self.get_x_id(r + 1, c + 1, board[r][c])])

        if not self.solver.solve():
            return None

        lst = self.solver.get_model()
        solved_board = [[0 for _ in range(self.size)] for _ in range(self.size)]
        for var in lst:
            if 0 < var <= self.max_primary_var:
                v_id = var - 1
                row = v_id // (self.size * self.size)
                col = (v_id // self.size) % self.size
                value = (v_id % self.size) + 1
                solved_board[row][col] = value

        return solved_board


def solve_sudoku(board: list[list[int]], size: int) -> list[list[int]] | None:
    solver = SudokuSATSolver(size=size)
    return solver.solve(board)
