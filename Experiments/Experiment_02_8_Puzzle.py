from collections import deque

def solve_8_puzzle(start_state):
    # Define the winning goal configuration
    goal_state = (1, 2, 3, 4, 5, 6, 7, 8, 0)
    
    # Track visited states to prevent infinite loops
    visited = set()
    visited.add(start_state)
    
    # Queue stores tuple of: (current_state, path_taken_to_get_here)
    queue = deque([(start_state, [])])
    
    # Define valid index movements based on the 0-8 position in a 1D tuple
    # (Up, Down, Left, Right)
    moves = {
        0: [1, 3],       1: [0, 2, 4],    2: [1, 5],
        3: [0, 4, 6],    4: [1, 3, 5, 7], 5: [2, 4, 8],
        6: [3, 7],       7: [4, 6, 8],    8: [5, 7]
    }
    
    while queue:
        current, path = queue.popleft()
        
        # Check if we reached our destination
        if current == goal_state:
            return path + [current]
            
        # Find where the empty space (0) is located
        blank_idx = current.index(0)
        
        # Explore all valid adjacent moves
        for move_idx in moves[blank_idx]:
            # Create a mutable list copy to swap positions
            next_state = list(current)
            next_state[blank_idx], next_state[move_idx] = next_state[move_idx], next_state[blank_idx]
            next_tuple = tuple(next_state)
            
            if next_tuple not in visited:
                visited.add(next_tuple)
                queue.append((next_tuple, path + [current]))
                
    return None

def print_board(state):
    for i in range(0, 9, 3):
        print(list(state[i:i+3]))
    print()

# --- Execution Example ---
# 0 represents the blank space
initial_board = (1, 2, 3, 4, 0, 5, 7, 8, 6)

print("Starting State:")
print_board(initial_board)

solution_steps = solve_8_puzzle(initial_board)

if solution_steps:
    print(f"Solved successfully in {len(solution_steps) - 1} moves!\n")
    for step, state in enumerate(solution_steps):
        print(f"Step {step}:")
        print_board(state)
else:
    print("This configuration is unsolvable.")
