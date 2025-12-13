import pandas as pd
import gspread
from google.oauth2.service_account import Credentials

print("Script starting...")

CSV_PATH = r"C:\Users\alexa\OneDrive\Desktop\Central Celulares\backend\Data-Migration\products_rows.csv"
print(f"Loading CSV from: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)
print(f"CSV loaded. Shape: {df.shape}")

# 2) Google Sheets auth
CREDENTIALS_FILE = r"C:\Users\alexa\OneDrive\Desktop\Central Celulares\backend\Data-Migration\credentials.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
print(f"Using credentials file: {CREDENTIALS_FILE}")
creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
client = gspread.authorize(creds)
print("Authenticated with Google.")

# 3) Create the spreadsheet
sheet_title = "CentralCelulares Products"
print(f"Creating spreadsheet with title: {sheet_title}")
spreadsheet = client.create(sheet_title)
print(f"Spreadsheet created with ID: {spreadsheet.id}")

# 4) Write data
worksheet = spreadsheet.sheet1
print("Updating worksheet with data...")
worksheet.update([df.columns.tolist()] + df.values.tolist())
print("Worksheet updated.")

# 5) Print URL and pause
edit_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet.id}/edit"
print("Spreadsheet edit URL:", edit_url)

input("Press Enter to close...")
