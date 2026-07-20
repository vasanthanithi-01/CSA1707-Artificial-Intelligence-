jug1 = 4
jug2 = 3

x = 0
y = 0

steps = [
    (4, 0),
    (1, 3),
    (1, 0),
    (0, 1),
    (4, 1),
    (2, 3)
]

print("Steps to get 2 Litres:\n")

for i, (x, y) in enumerate(steps, 1):
    print(f"Step {i}: ({x}, {y})")

print("\n2 Litres obtained in Jug1.")
