from pysat.solvers import Glucose3


class SudokuSATSolver:
    def __init__(self) -> None:
        self.solver = Glucose3()
        self.aux_id = 730

    @staticmethod
    def get_x_id(i: int, j: int, k: int) -> int:
        return (i - 1) * 81 + (j - 1) * 9 + k

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
        for i in range(1, 10):
            for j in range(1, 10):
                self.solver.add_clause([self.get_x_id(i, j, k) for k in range(1, 10)])

        for i in range(1, 10):
            for j in range(1, 10):
                self.add_amo_sc([self.get_x_id(i, j, k) for k in range(1, 10)])

        for i in range(1, 10):
            for k in range(1, 10):
                self.add_amo_sc([self.get_x_id(i, j, k) for j in range(1, 10)])

        for j in range(1, 10):
            for k in range(1, 10):
                self.add_amo_sc([self.get_x_id(i, j, k) for i in range(1, 10)])

        for r_st in [1, 4, 7]:
            for c_st in [1, 4, 7]:
                for k in range(1, 10):
                    block3x3 = []
                    for i in range(r_st, r_st + 3):
                        for j in range(c_st, c_st + 3):
                            block3x3.append(self.get_x_id(i, j, k))
                    self.add_amo_sc(block3x3)

        for r in range(9):
            for c in range(9):
                if board[r][c] != 0:
                    self.solver.add_clause([self.get_x_id(r + 1, c + 1, board[r][c])])

        if not self.solver.solve():
            return None

        lst = self.solver.get_model()
        solved_board = [[0 for _ in range(9)] for _ in range(9)]
        for var in lst:
            if 0 < var <= 729:
                v_id = var - 1
                row = v_id // 81
                col = (v_id // 9) % 9
                value = (v_id % 9) + 1
                solved_board[row][col] = value

        return solved_board


def solve_sudoku(board: list[list[int]]) -> list[list[int]] | None:
    solver = SudokuSATSolver()
    return solver.solve(board)
