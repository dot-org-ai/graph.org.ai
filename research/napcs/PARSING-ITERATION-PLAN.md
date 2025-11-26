# Service Parsing - Iteration Plan

## Validation Results

**Total services**: 83,117
**Suspected errors**: 18,132 (22%)
**Current test pass rate**: 1/13 (8%)

## Issues by Frequency & Impact

### 1. Minimal Length Change / Duplicates - 13,447 cases (16%)
**Impact**: Medium (creates duplicates, wastes space)
**Effort**: Low

**Examples**:
- "Propane and propane mixes" → "Propane mixes", "propane mixes" (duplicate!)
- "Light and medium crude oil" → "Light oil", "medium crude oil"

**Root Cause**:
- Case sensitivity creating duplicates
- Not detecting when modifier already appears in compound

**Fix**:
- Deduplicate expansions (case-insensitive)
- Detect and handle "X and X Y" patterns (where modifier repeats)

---

### 2. Information Loss - 4,625 cases (5.6%)
**Impact**: High (losing important context)
**Effort**: Medium

**Examples**:
- "Hardwood logs and bolts (except fuel wood and pulpwood)"
  → "Hardwood logs", "Hardwood bolts" (-51% chars!)
- "Logs and bolts of Douglas fir and Western larch (except...)"
  → "Logs and bolts", "Douglas fir", "Western larch" (-52% chars!)

**Root Cause**:
- Expansion drops exclusion clauses
- "of X and Y" splitting too aggressively

**Fix**:
- Ensure exclusions preserved in ALL expansions
- Handle "X of Y and Z" as "(X of Y) and (X of Z)" not "X of (Y and Z)"

---

### 3. Over-Expansion (Nonsensical Combinations)
**Impact**: High (creates garbage data)
**Effort**: High

**Examples**:
- "+228%: Rental and operating leasing services of commercial and industrial machinery and equipment"
  → 6 expansions but many nonsensical

- "+200%: Highway and road sign or guardrail construction and repair service"
  → 12 expansions: "Highway sign", "Highway construction", "Highway service" (nonsense!)

- "+172%: Medical or surgical equipment or implant rental and shipping fee"
  → 12 expansions: "Medical rental", "Medical fee" (nonsense!)

**Root Cause**:
- Not respecting semantic boundaries
- "(A or B) (C or D) (E and F)" creating A×B×C×D×E×F when should be (A or B)×(C or D)×(E and F)
- Modifiers being treated as standalone items

**Fix**:
- Better boundary detection - identify modifier vs. noun vs. activity
- Proper grouping: "(Medical or surgical) (equipment or implant) (rental and shipping) fee"
- Don't create expansions that drop the main noun

---

### 4. Missed Expansions - 60 cases (0.07%)
**Impact**: Low (small number)
**Effort**: Low

**Examples**:
- "Thermal generation electricity (except nuclear and geothermal)"
  - Not expanding "(except X and Y)"

**Fix**:
- Expand compounds inside parenthetical clauses

---

## Iteration Strategy

### Iteration 1: Low-Hanging Fruit (deduplicate)
**Target**: Fix 13,447 duplicate cases
**Effort**: 1 hour
**Expected**: Test pass rate 2/13 → 4/13 (30%)

**Changes**:
1. Add case-insensitive deduplication to `expandServiceStatement()`
2. Detect "X and X Y" patterns and simplify

**Test**:
- "Propane and propane mixes" → ["Propane", "propane mixes"]
- Run validation, expect "Minimal length change" count to drop significantly

---

### Iteration 2: Preserve Exclusions (information loss)
**Target**: Fix 4,625 information loss cases
**Effort**: 2 hours
**Expected**: Test pass rate 4/13 → 6/13 (46%)

**Changes**:
1. Ensure exclusions appended to ALL expansions
2. Handle "X and Y of Z" properly → "X of Z and Y of Z"
3. Handle "X of Y and Z" → "X of Y and X of Z"

**Test**:
- "Hardwood logs and bolts (except...)" → both preserve exclusion
- "Logs of Douglas fir and Western larch" → 2 expansions not 3
- Run validation, expect "Information loss" count to drop

---

### Iteration 3: Boundary Detection (over-expansion)
**Target**: Fix top delta% cases
**Effort**: 4-6 hours
**Expected**: Test pass rate 6/13 → 10/13 (77%)

**Changes**:
1. Implement proper phrase boundary detection
2. Group modifiers with their nouns: "(Medical or surgical) (equipment or implant)"
3. Don't expand in ways that lose the main noun
4. Validate expansions: does it make sense?

**Test**:
- "Highway and road sign or guardrail construction and repair service" → 8 valid expansions
- "Medical or surgical equipment or implant rental and shipping fee" → 8 valid expansions
- Run validation, expect top delta% cases to have sensible expansions

---

### Iteration 4: Edge Cases
**Target**: Remaining test failures
**Effort**: 2-3 hours
**Expected**: Test pass rate 10/13 → 13/13 (100%)

**Changes**:
1. Handle compound noun phrases (medical terms)
2. Expand parenthetical compounds
3. Any remaining edge cases

---

## Success Metrics

After each iteration, measure:
1. **Test pass rate** (target: 100%)
2. **Validation error count** (target: <5%)
3. **Delta % distribution** (target: reasonable expansions, <100% for most)
4. **Manual spot checks** (20 random samples, all sensible)

## Timeline

- Iteration 1: 1 hour
- Iteration 2: 2 hours
- Iteration 3: 4-6 hours
- Iteration 4: 2-3 hours

**Total**: ~10-12 hours for robust parsing

## Current Status

✅ Baseline established (8% pass rate)
⏳ Iteration 1: Pending
⏳ Iteration 2: Pending
⏳ Iteration 3: Pending
⏳ Iteration 4: Pending
