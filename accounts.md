# paeasybooks Accounts Page - Comprehensive Specification
## Production-Grade Financial Accounting Interface

## Page Overview

The **Accounts Page** (`/app/[tenantId]/accounts`) is the financial nerve center of paeasybooks, managing the complete double-entry accounting system. It provides accountants and admins with tools to:

1. **Manage Chart of Accounts** - Create, organize, and maintain all GL accounts
2. **Record Transactions** - Create journal entries and view all ledger transactions
3. **View & Reconcile** - Real-time account balances and transaction history
4. **Generate Reports** - P&L, Balance Sheet, Trial Balance, Cash Flow
5. **Audit & Compliance** - Complete transaction history with drill-down capability

---

## Section 1: Chart of Accounts Management

### 1.1 Purpose & Business Logic

The Chart of Accounts (COA) is the master list of all GL accounts used to categorize financial transactions. Following accounting principles (GAAP), accounts are organized hierarchically by type:

**Account Types:**
- **Assets** (1000-1999): Cash, Accounts Receivable, Inventory, Fixed Assets
- **Liabilities** (2000-2999): Accounts Payable, Short-term Debt, Long-term Debt
- **Equity** (3000-3999): Owner's Capital, Retained Earnings, Stock
- **Revenue** (4000-4999): Sales Revenue, Service Revenue, Other Income
- **Expenses** (5000-5999): COGS, Operating Expenses, Depreciation, Interest

### 1.2 Chart of Accounts Interface - Main View

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ CHART OF ACCOUNTS                                               │
├─────────────────────────────────────────────────────────────────┤
│ [+ Add Account] [Import COA] [Export COA]  |  Search... [Filter] │
├─────────────────────────────────────────────────────────────────┤
│ Account Type Filter: [All ▼] Currency: [USD ▼]                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ► ASSETS (Debit balance)                           Balance       │
│   ├─ 1000 Cash                                    $45,230.00     │
│   ├─ 1100 Bank Accounts                          $120,450.00    │
│   │   ├─ 1101 Checking Account                    $85,300.00     │
│   │   └─ 1102 Savings Account                     $35,150.00     │
│   ├─ 1200 Accounts Receivable                     $67,890.00     │
│   ├─ 1300 Inventory                             $234,560.00     │
│   └─ 1500 Fixed Assets (Net)                    $156,780.00     │
│                                                                  │
│ ► LIABILITIES (Credit balance)                                  │
│   ├─ 2000 Accounts Payable                        $45,670.00     │
│   ├─ 2100 Short-term Debt                        $30,000.00     │
│   └─ 2200 Long-term Debt                        $100,000.00     │
│                                                                  │
│ ► EQUITY (Credit balance)                                       │
│   ├─ 3000 Owner's Capital                       $350,000.00     │
│   └─ 3100 Retained Earnings                      $98,670.00     │
│                                                                  │
│ ► REVENUE (Credit balance)                                      │
│   ├─ 4000 Product Sales                         $567,890.00     │
│   └─ 4100 Service Revenue                        $45,670.00     │
│                                                                  │
│ ► EXPENSES (Debit balance)                                      │
│   ├─ 5000 Cost of Goods Sold                    $234,560.00     │
│   ├─ 5100 Payroll Expense                       $123,450.00     │
│   ├─ 5200 Rent Expense                           $24,000.00     │
│   └─ 5300 Utilities Expense                       $8,900.00     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**

**1. Collapsible Hierarchy**
- Account types collapsed/expanded by clicking "►"
- Sub-accounts nested under parent accounts
- Visual indentation shows hierarchy level
- Expand all / Collapse all buttons at top

**2. Balance Display**
- Real-time running balance for each account
- Color-coded: Green (healthy), Yellow (warning), Red (concern)
- Debit/Credit indicators (D/C) next to account type
- Total assets, liabilities, equity at bottom (should balance)

**3. Filtering & Search**
- Search by account code (e.g., "1000"), name, or description
- Filter by account type (Assets, Liabilities, Equity, Revenue, Expenses)
- Filter by active/inactive accounts
- Sort by code, name, or balance

**4. Account Actions**
- **View** - Click account to see transaction history
- **Edit** - Edit account name, description, disabled status
- **Delete** - Soft-delete (archive) unused accounts
- **Inactive Toggle** - Mark account inactive (no new transactions)

### 1.3 Add/Edit Account Modal

**Form Fields:**

```
Account Code (required)
  - Format: 4-digit number (e.g., 1200)
  - Validation: Unique within tenant, must be in correct range
  - Placeholder: "1200"
  - Help: "Must be between 1000-5999"

Account Name (required)
  - Text input, 2-100 characters
  - Example: "Accounts Receivable"
  
Account Type (required, dropdown)
  - Options: Asset, Liability, Equity, Revenue, Expense
  - Locked if account has transactions (can't change type)
  
Parent Account (optional, dropdown)
  - For creating sub-accounts
  - Only shows accounts of same type
  - Example: "1100 Bank Accounts" as parent of "1101 Checking Account"

Account Description (optional, textarea)
  - Free text describing account purpose
  - Max 500 characters
  - Help text: "e.g., Contains all customer receivables"

Is Active (required, toggle)
  - Active = Can record new transactions
  - Inactive = No new transactions, but historical data remains
  - Warning: "Inactive accounts appear dimmed in UI"

Account Status
  - Read-only display: "Has X transactions"
  - Shows if account can be deleted (needs 0 transactions)

Display Order (optional, number)
  - Numeric value for custom sorting within account type
  - Default: 100, 200, 300, etc.
```

**Validation Rules:**

```
✓ Account Code uniqueness: error if duplicate
✓ Account Code range: 1000-1999 (Assets), 2000-2999 (Liabilities), etc.
✓ Cannot change account type if transactions exist
✓ Cannot delete account with transactions (soft-delete instead)
✓ Cannot set parent account to sub-account (prevents circular reference)
✓ Parent account must be same type
✓ Code must be numeric 4-digit
✓ Name must not be empty
```

**Success Path:**
1. Fill required fields
2. Click "Save Account"
3. Account added to COA
4. Toast: "Account created successfully"
5. Modal closes, new account appears in tree

**Default COA Template:**

On first tenant setup, auto-create standard chart:

```
ASSETS (1000-1999)
  1000 Cash and Cash Equivalents
    1001 Cash on Hand
    1002 Bank Account - Operating
  1200 Accounts Receivable
  1300 Inventory
  1500 Equipment
    1501 Equipment - Cost
    1502 Equipment - Depreciation

LIABILITIES (2000-2999)
  2000 Accounts Payable
  2100 Short-term Debt
  2200 Long-term Debt

EQUITY (3000-3999)
  3000 Owner's Capital
  3100 Retained Earnings

REVENUE (4000-4999)
  4000 Product Sales
  4100 Service Revenue
  4200 Other Income

EXPENSES (5000-5999)
  5000 Cost of Goods Sold
  5100 Payroll Expense
  5200 Rent Expense
  5300 Utilities Expense
  5400 Office Supplies
```

---

## Section 2: General Ledger & Transaction Recording

### 2.1 General Ledger View

**Purpose:** Display all transactions recorded in double-entry format, with drill-down capability to invoices, purchases, and journal entries.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ GENERAL LEDGER                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [+ New Journal Entry]  [Import Transactions]  |  Search... [Filter]
├─────────────────────────────────────────────────────────────────┤
│ Date Range: [From ▼] [To ▼]  Account: [All ▼]                 │
│ Transaction Type: [All ▼]  Source: [All ▼]                     │
├─────────────────────────────────────────────────────────────────┤
│
│ Date       | Reference    | Description        | Account      | Debit    | Credit   | Balance
│ ──────────────────────────────────────────────────────────────────────────────────────
│ 2024-01-15 | INV-001      | Invoice from Sale  | 1000 Cash    | 500.00   |          | 500.00
│            |              |                    | 4000 Revenue |          | 500.00   |
│ 2024-01-16 | JE-001       | Manual entry       | 1100 Bank    |          | 1000.00  | 500.00
│            |              |                    | 1000 Cash    | 1000.00  |          |
│ 2024-01-17 | EXP-002      | Expense recorded   | 5200 Rent    | 2000.00  |          | 2000.00
│            |              |                    | 2000 AP      |          | 2000.00  |
│
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**

**1. Transaction Display**
- Two-line format showing debit and credit sides
- Date, Reference (INV-001, JE-001, EXP-002), Description
- Account name and code, Debit/Credit amounts
- Running balance (cumulative as you scroll down)
- Color: Debits in black, Credits in gray/muted

**2. Filtering**
- Date range picker (From/To)
- Filter by account (dropdown with COA)
- Filter by transaction type: Invoice Sale, Invoice Purchase, Journal Entry, Expense, Stock Adjustment
- Filter by source: Sales Module, Inventory Module, Expense Module, Manual Entry
- Filter by status: Posted, Unposted, Voided

**3. Search**
- Full-text search on description, reference number, account name
- Auto-complete as user types
- Highlight matches

**4. Transaction Actions**
- **View** - Click row to see full transaction details
- **Drill Down** - Click reference (INV-001) to see original invoice
- **Edit** - Edit journal entries (if not posted)
- **Void** - Void posted entries (creates reversing entry)
- **Export** - Export visible transactions to CSV/Excel

**5. Balance Verification**
- Display "Total Debits" and "Total Credits" at bottom
- Must equal each other (if not, data issue warning)
- Show Debit/Credit balance per account section

### 2.2 Transaction Detail View

**When User Clicks on Transaction:**

```
┌──────────────────────────────────────────────────────────────┐
│ TRANSACTION DETAILS                                          │
├──────────────────────────────────────────────────────────────┤
│ Reference: INV-001           | Posted: ✓ Yes                │
│ Type: Invoice Sale           | Date: 2024-01-15              │
│ Description: Sale to Customer| Entered By: John Smith        │
│                              | Posted By: Sarah Jones        │
│                              | Posted At: 2024-01-15 14:35   │
├──────────────────────────────────────────────────────────────┤
│ Entries:                                                     │
│                                                              │
│ Line 1:                                                      │
│  Account: 1000 Cash and Cash Equivalents                     │
│  Debit: $500.00                                              │
│  Description: Payment received                               │
│  Cost Center: Default                                        │
│                                                              │
│ Line 2:                                                      │
│  Account: 4000 Product Sales                                 │
│  Credit: $500.00                                             │
│  Description: Revenue from sale                              │
│  Cost Center: Default                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Status: POSTED (Locked)                                     │
│ Total Debits: $500.00  |  Total Credits: $500.00 ✓ Balanced │
│                                                              │
│ [Drill to Invoice]  [View Audit Trail]  [Print]  [Close]    │
└──────────────────────────────────────────────────────────────┘
```

**Details Shown:**
- Transaction reference and type
- Date, entered by, posted by, posted timestamp
- All line items with account, amount, description
- Debit/Credit balance check (✓ or ✗)
- Status (Posted = Locked, Unposted = Editable)
- Buttons: Drill to source, audit trail, print, close

### 2.3 Journal Entry Creation

**When User Clicks "+ New Journal Entry":**

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE JOURNAL ENTRY                                        │
├─────────────────────────────────────────────────────────────┤
│ Entry Date: [2024-01-15]                                    │
│ Description: [_____________]                                │
│ Reference: [JE-XXX] (auto-generated)                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ ENTRIES (Debit side / Credit side)                          │
│                                                              │
│ # | Account                    | Debit      | Credit | Memo │
│ ──────────────────────────────────────────────────────────  │
│ 1 | [Select Account ▼]        | [_______] | [____] | [  ] │
│ 2 | [Select Account ▼]        | [_______] | [____] | [  ] │
│ 3 | [Select Account ▼]        | [_______] | [____] | [  ] │
│ 4 | [+ Add Another Entry]     |           |       |       │
│                                                              │
│ Totals:                        | $0.00     | $0.00 |       │
│                                | ⚠️ Unbalanced     |       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ [Save as Draft]  [Post & Close]  [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

**1. Entry Input**
- Date picker (defaults to today)
- Description field (for narrative)
- Reference auto-generated (JE-001, JE-002, etc.)
- Multiple line items, minimum 2, no maximum

**2. Line Item Entry**
- Account selector (dropdown with COA, searchable)
- Debit or Credit amount (separate fields)
- Memo (optional, per-line description)
- Add/Remove line buttons
- Delete any line

**3. Real-Time Validation**
- As user enters amounts, update totals
- Show "Balanced ✓" when debits = credits
- Show "Unbalanced ⚠️" when not equal
- Disable "Post" button until balanced
- Prevent users from posting unbalanced entries

**4. Save Options**
- **Save as Draft** - Save but don't post to ledger
- **Post & Close** - Post to ledger immediately (locked after posting)
- **Cancel** - Discard entry

**5. Posting Process**
- When "Post & Close" clicked:
  - Validate entry is balanced
  - Create audit log entry
  - Mark as posted with timestamp
  - Ledger entries become immutable
  - Toast: "Journal entry posted successfully"
  - Redirect to General Ledger view

### 2.4 Automatic Journal Entries from Other Modules

**Auto-Creation Rules:**

```
SALES INVOICE CREATED:
  → Creates two GL entries automatically:
  Debit: 1000 Cash (or AR if credit sale)
  Credit: 4000 Product Sales
  Reference: INV-001 (linked)
  Status: Auto-posted

EXPENSE RECORDED:
  → Creates two GL entries automatically:
  Debit: 5XXX Expense Account
  Credit: 2000 Accounts Payable (or Cash)
  Reference: EXP-001 (linked)
  Status: Auto-posted

STOCK ADJUSTMENT:
  → Creates two GL entries for inventory valuation:
  Debit: 1300 Inventory
  Credit: 5000 COGS (if damaged/loss)
  Reference: STK-001 (linked)
  Status: Auto-posted

CUSTOMER PAYMENT RECEIVED:
  → Creates two GL entries:
  Debit: 1000 Cash
  Credit: 1200 Accounts Receivable
  Reference: PMT-001 (linked)
  Status: Auto-posted
```

---

## Section 3: Account Balances & Trial Balance

### 3.1 Account Balances Report

**Purpose:** Show current balance for each GL account at any point in time.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ ACCOUNT BALANCES as of 2024-01-31                           │
├──────────────────────────────────────────────────────────────┤
│ [As of Date ▼]  [Account Type ▼]  [Export] [Print]         │
├──────────────────────────────────────────────────────────────┤
│
│ ASSETS (Expected Debit Balance)
│ ─────────────────────────────────
│ 1000 Cash                                      $45,230.00
│ 1100 Bank Accounts                           $120,450.00
│ 1200 Accounts Receivable                      $67,890.00
│ 1300 Inventory                               $234,560.00
│ 1500 Fixed Assets (Net)                      $156,780.00
│ ─────────────────────────────────
│ Total Assets                                 $624,910.00
│
│ LIABILITIES (Expected Credit Balance)
│ ────────────────────────────────────
│ 2000 Accounts Payable                         $45,670.00 CR
│ 2100 Short-term Debt                         $30,000.00 CR
│ 2200 Long-term Debt                         $100,000.00 CR
│ ────────────────────────────────────
│ Total Liabilities                           $175,670.00 CR
│
│ EQUITY
│ ───────
│ 3000 Owner's Capital                        $350,000.00 CR
│ 3100 Retained Earnings                       $98,670.00 CR
│ ───────
│ Total Equity                                $448,670.00 CR
│
│ REVENUE
│ ───────
│ 4000 Product Sales                          $567,890.00 CR
│ 4100 Service Revenue                         $45,670.00 CR
│ ───────
│ Total Revenue                               $613,560.00 CR
│
│ EXPENSES
│ ────────
│ 5000 Cost of Goods Sold                     $234,560.00
│ 5100 Payroll Expense                        $123,450.00
│ 5200 Rent Expense                            $24,000.00
│ 5300 Utilities Expense                        $8,900.00
│ ────────
│ Total Expenses                              $390,910.00
│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Date picker to view balances as of any date
- Filter by account type
- Running totals for each section
- CR (Credit) indicator for liability/equity/revenue accounts
- Verify: Total Assets = Total Liabilities + Equity
- Click account to drill into transaction history

### 3.2 Trial Balance Report

**Purpose:** Verify that total debits equal total credits (accounting equation foundation).

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ TRIAL BALANCE as of 2024-01-31                              │
├──────────────────────────────────────────────────────────────┤
│ [As of Date ▼]  [View Unadjusted/Adjusted ▼]  [Export]     │
├──────────────────────────────────────────────────────────────┤
│
│ Account                              Debit         Credit
│ ────────────────────────────────────────────────────────────
│ 1000 Cash                           $45,230.00
│ 1100 Bank Accounts                 $120,450.00
│ 1200 Accounts Receivable            $67,890.00
│ 1300 Inventory                     $234,560.00
│ 1500 Fixed Assets (Net)            $156,780.00
│ 2000 Accounts Payable                             $45,670.00
│ 2100 Short-term Debt                             $30,000.00
│ 2200 Long-term Debt                            $100,000.00
│ 3000 Owner's Capital                           $350,000.00
│ 3100 Retained Earnings                          $98,670.00
│ 4000 Product Sales                             $567,890.00
│ 4100 Service Revenue                            $45,670.00
│ 5000 COGS                          $234,560.00
│ 5100 Payroll                       $123,450.00
│ 5200 Rent                           $24,000.00
│ 5300 Utilities                       $8,900.00
│ ────────────────────────────────────────────────────────────
│ TOTALS                           $1,118,850.00  $1,118,850.00
│                                         ✓ BALANCED
│ ────────────────────────────────────────────────────────────
│
│ Accounting Equation Check:
│ Assets ($624,910) = Liabilities ($175,670) + Equity ($448,670)
│ Status: ✓ IN BALANCE
│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Unadjusted vs. Adjusted toggle
- Debit/Credit columns
- Totals must be equal
- Visual indicator: ✓ BALANCED or ⚠️ OUT OF BALANCE
- Accounting equation verification
- Click account to drill into transactions

---

## Section 4: Financial Statements

### 4.1 Income Statement (P&L)

**Purpose:** Show revenue, expenses, and profit for a period.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ PROFIT & LOSS STATEMENT                                     │
│ For the Period Ending 2024-01-31                            │
├──────────────────────────────────────────────────────────────┤
│ [Period ▼: This Month]  [Compare to ▼: Last Month]  [Export]│
├──────────────────────────────────────────────────────────────┤
│
│ REVENUE
│   Product Sales                 $567,890.00  (100%)
│   Service Revenue                $45,670.00  (8%)
│ ─────────────────────────────────
│ Total Revenue                   $613,560.00
│
│ COST OF GOODS SOLD
│   COGS                          $234,560.00  (38%)
│ ─────────────────────────────────
│ Gross Profit                    $379,000.00  (62%)
│
│ OPERATING EXPENSES
│   Payroll                       $123,450.00  (20%)
│   Rent                           $24,000.00  (4%)
│   Utilities                       $8,900.00  (1%)
│   Office Supplies                 $4,500.00  (1%)
│   Depreciation                    $2,000.00  (0%)
│ ─────────────────────────────────
│ Total Operating Expenses        $162,850.00  (27%)
│
│ OPERATING INCOME                $216,150.00  (35%)
│
│ OTHER INCOME/EXPENSES
│   Interest Income                   $500.00
│   Interest Expense               ($1,200.00)
│ ─────────────────────────────────
│ Total Other Income/Expense      ($700.00)
│
│ ─────────────────────────────────
│ NET INCOME                      $215,450.00  (35%)
│ ═════════════════════════════════
│
│ [View Details]  [Print]  [Export to Excel]
│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Period selector (This Month, Last Month, Year-to-Date, Custom Range)
- Comparison to previous period (%)
- Percentage of revenue shown for each line
- Drill-down by clicking line items
- Visual chart below (optional)
- Export to PDF/Excel
- Print-friendly formatting

**Drill-Down Example:**
- Click "Payroll" → Shows breakdown by payroll expense accounts
- Click amount → Shows GL transactions for that line

### 4.2 Balance Sheet

**Purpose:** Show assets, liabilities, and equity as of a date.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ BALANCE SHEET                                               │
│ As of 2024-01-31                                            │
├──────────────────────────────────────────────────────────────┤
│ [As of Date ▼]  [Compare to ▼: 2023-12-31]  [Export]       │
├──────────────────────────────────────────────────────────────┤
│
│ ASSETS
│   Current Assets
│     Cash                                     $45,230.00
│     Bank Accounts                          $120,450.00
│     Accounts Receivable                     $67,890.00
│     Inventory                              $234,560.00
│   ─────────────────────────────────────────
│   Total Current Assets                     $468,130.00
│
│   Fixed Assets
│     Equipment (Cost)                       $200,000.00
│     Less: Depreciation                    ($43,220.00)
│   ─────────────────────────────────────────
│   Net Fixed Assets                        $156,780.00
│
│ ─────────────────────────────────────────
│ TOTAL ASSETS                              $624,910.00
│ ═════════════════════════════════════════
│
│ LIABILITIES
│   Current Liabilities
│     Accounts Payable                        $45,670.00
│     Short-term Debt                        $30,000.00
│   ─────────────────────────────────────────
│   Total Current Liabilities                $75,670.00
│
│   Long-term Liabilities
│     Long-term Debt                       $100,000.00
│   ─────────────────────────────────────────
│   Total Long-term Liabilities            $100,000.00
│
│ ─────────────────────────────────────────
│ TOTAL LIABILITIES                        $175,670.00
│ ═════════════════════════════════════════
│
│ EQUITY
│   Owner's Capital                        $350,000.00
│   Retained Earnings                       $98,670.00
│   Current Year Net Income                $215,450.00 (YTD)
│ ─────────────────────────────────────────
│ TOTAL EQUITY                             $664,120.00
│
│ ─────────────────────────────────────────
│ TOTAL LIABILITIES & EQUITY               $839,790.00
│ ═════════════════════════════════════════
│
│ ⚠️ Balance Sheet Out of Balance!
│ Assets $624,910 ≠ Liabilities + Equity $839,790
│ Difference: $214,880 (investigate immediately)
│
│ [View Reconciliation Guide]  [Print]  [Export]
│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Organized by asset/liability/equity classifications
- Current vs. long-term separation for assets/liabilities
- Totals with visual hierarchy
- Out-of-balance warning with difference amount
- Comparison to previous date
- Drill-down capability
- Export options

**Verification:**
- Display: Assets = Liabilities + Equity
- If not balanced: Show warning with investigation guide
- Link to: Reconciliation checklist, audit trail

### 4.3 Cash Flow Statement

**Purpose:** Track cash in, cash out, and net cash position.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ CASH FLOW STATEMENT                                         │
│ For the Period 2024-01-01 to 2024-01-31                    │
├──────────────────────────────────────────────────────────────┤
│ [Period ▼]  [View Method ▼: Direct/Indirect]  [Export]     │
├──────────────────────────────────────────────────────────────┤
│
│ OPERATING ACTIVITIES
│   Net Income                               $215,450.00
│   Adjustments:
│     Depreciation                             $2,000.00
│     Change in AR                           ($20,000.00)
│     Change in Inventory                    ($15,000.00)
│     Change in AP                             $5,000.00
│ ─────────────────────────────────────────
│ Cash from Operations                      $187,450.00
│
│ INVESTING ACTIVITIES
│   Equipment Purchase                      ($50,000.00)
│   Asset Sales                               $10,000.00
│ ─────────────────────────────────────────
│ Cash from Investing                       ($40,000.00)
│
│ FINANCING ACTIVITIES
│   Loan Proceeds                           $100,000.00
│   Loan Rep