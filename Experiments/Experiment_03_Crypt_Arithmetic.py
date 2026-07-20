from itertools import permutations

letters = ('S', 'E', 'N', 'D', 'M', 'O', 'R', 'Y')

for p in permutations(range(10), 8):
    S, E, N, D, M, O, R, Y = p

    if S == 0 or M == 0:
        continue

    SEND = S*1000 + E*100 + N*10 + D
    MORE = M*1000 + O*100 + R*10 + E
    MONEY = M*10000 + O*1000 + N*100 + E*10 + Y

    if SEND + MORE == MONEY:
        print("Solution Found")
        print(f"S={S}, E={E}, N={N}, D={D}")
        print(f"M={M}, O={O}, R={R}, Y={Y}")
        print(f"\n{SEND} + {MORE} = {MONEY}")
        break
