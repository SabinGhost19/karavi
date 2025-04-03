password_table = [
    "SfBsOxPvNMDyNAhRSgsG",
    "VjYOkGDgkkXgULZUkCeh",
    "OYgUClVWJQAvOtMfBSPg",
    "UgGADoBNyIpiGNyfyuet",
    "RoSgSYiwNwAcSgnPOsMB",
    "4sGvkBZfEqfHEgvkUeUL",
    "ullIdbFSSDZrKCSAJIUz",
    "FPVZxzrNHXShDeRb1GXd",
    "RNpVNeyZRVHTOwZuNdQq",
    "VALsFVveUNPuUoDWlpXu",
    "VyNbOyZjyGBwQUiUxeSe",
    "xO2rYv2pXL3UWoDvBTDQ",
    "qCOaRDOZicRnhDSacIgc",
    "bGUTstlyoElXoIVVghRO",
    "MmNRiDVggENtBjNHvw>g",
    "MC2BCa1DjAyglyzgwQ>v",
    "LeNdcAOGPROrjrOUSiWC",
    "YQEvXfUjbEERJDEjLZcS",
    "baCAeWZGrnROqkJKchEi",
    "oLDKgG6TxDzrQu6amIlZ"
]

password = ""

for i in range(96):
    row = i % 20
    col = 2 * (i // 10)
    correct_char = chr(ord(password_table[row][col]) - 1)
    password += correct_char

print("Parola corectă:", password)