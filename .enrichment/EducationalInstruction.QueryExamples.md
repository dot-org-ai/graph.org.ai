# Educational Instruction Scores - Query Examples & Use Cases

## File Reference
**Source**: `EducationalInstruction.DigitalScores.tsv`
**Covers**: SOC major group 25-0000 (68 occupations, 54 scored entities)

## Example Queries

### 1. Find All "Highly Digital" Education Occupations (≥0.75)

**Query**:
```
WHERE actionScore >= 0.75 AND codes LIKE "25-%"
```

**Results** (14 occupations):
1. Computer Science Teachers (25-1021.00): 0.85
2. Economics Teachers (25-1063.00): 0.85
3. Archivists (25-4011.00): 0.85
4. Mathematical Science Teachers (25-1022.00): 0.80
5. History Teachers (25-1125.00): 0.80
6. Architecture Teachers (25-1031.00): 0.80
7. Business Teachers (25-1011.00): 0.80
8. Law Teachers (25-1112.00): 0.80
9. Psychology Teachers (25-1066.00): 0.80
10. Librarians (25-4022.00): 0.80
11. Instructional Coordinators (25-9031.00): 0.75
12. Library Technicians (25-4031.00): 0.75
13. Adult Education Instructors (25-3011.00): 0.70
14. Instructional Coordinators (25-9031.00): 0.75

**Interpretation**: These roles have highest automation potential and remote work viability

---

### 2. Find K-12 Classroom Teachers (Traditional Teaching)

**Query**:
```
WHERE codes LIKE "25-2.*"
```

**Results** (8 occupations):
- Preschool Teachers: 0.40
- Kindergarten Teachers: 0.45
- Elementary School Teachers: 0.55
- Middle School Teachers: 0.58
- Secondary School Teachers: 0.60
- Career/Technical Secondary: 0.50
- Special Education Teachers: 0.52
- Average: 0.54

**Interpretation**: K-12 requires significant in-person classroom presence despite digital tools

---

### 3. Compare STEM vs. Humanities Postsecondary

**STEM Postsecondary Teachers**:
```
Computer Science (25-1021.00): 0.85
Mathematical Science (25-1022.00): 0.80
Architecture (25-1031.00): 0.80
Engineering (25-1032.00): 0.75
Average: 0.80
```

**Humanities Postsecondary Teachers**:
```
Music (25-1121.00): 0.45
Art/Drama (25-1121.00): 0.50
Foreign Language (25-1124.00): 0.70
English (25-1123.00): 0.75
History (25-1125.00): 0.80
Average: 0.64
```

**Gap**: 0.16 points (STEM 25% more digital than humanities)

---

### 4. Identify Teaching Support vs. Teaching Roles

**Teaching Roles (25-1.*, 25-2.*, 25-3.*)**:
```
Postsecondary Teachers: 0.72
Adult/Alternative: 0.61
K-12 Teachers: 0.54
Average: 0.62
```

**Support Roles (25-9.* - excluding coordinators)**:
```
Teaching Assistants (avg): 0.52
Teaching Assistants, Special Ed: 0.48
Average: 0.50
```

**Gap**: 0.12 points (teaching roles 24% more digital than support)

---

### 5. Find Remote Work Viable Occupations

**Fully Remote (0.70+)**: 
- Adult Education Instructors
- All postsecondary >= 0.70
- Librarians & Archivists
- Instructional Coordinators

**Hybrid Model (0.55-0.65)**:
- Secondary school teachers
- Middle school teachers
- Most K-12

**In-Person Preferred (<0.55)**:
- Preschool teachers
- Kindergarten teachers
- Special education assistants

---

### 6. Subject Matter Digital Maturity Analysis

**Highest Digital Content** (0.85):
- Computer Science
- Economics

**High Digital Content** (0.80):
- Mathematics
- Architecture
- Business
- Law
- History
- Psychology

**Moderate Digital Content** (0.70-0.75):
- Engineering
- Social Sciences
- Communications
- Foreign Language
- Education

**Lower Digital Content** (0.60-0.65):
- Science (with labs)
- Health Specialties
- Biology

**Physical/Hands-On** (0.45-0.60):
- Music
- Art/Drama
- Career/Technical

---

### 7. Transformation Opportunity Analysis

**Highest Transformation Opportunity** (largest room for digital growth):
- Preschool (0.40 → 0.55 potential)
- Kindergarten (0.45 → 0.60 potential)
- Elementary (0.55 → 0.70 potential)
- K-12 general (0.54 → 0.65 potential by 2030)

**Moderate Transformation Opportunity**:
- Special Education (0.52 → 0.65 potential)
- K-12 Support (0.50 → 0.60 potential)

**Lower Transformation Opportunity** (already highly digital):
- STEM postsecondary (0.80 → 0.90 potential)
- Archivists (0.85 → 0.90 potential)
- Librarians (0.80 → 0.90 potential)

---

## Use Cases

### Use Case 1: AI Training Prioritization

**Scenario**: Developing AI tutoring systems for different education levels

**Query**: Find occupations that can most benefit from AI support
```
WHERE actionScore < 0.65 AND codes LIKE "25-%"
ORDER BY actionScore
```

**Recommendation Priority**:
1. **Preschool (0.40)**: Limited AI use (developmental needs), focus on admin support
2. **Kindergarten (0.45)**: Limited AI use, focus on activity planning
3. **Elementary (0.55)**: Moderate AI potential for grading, lesson prep
4. **Secondary (0.60)**: Higher AI potential for personalized learning
5. **Postsecondary (0.70+)**: Highest potential for AI tutoring and automated grading

---

### Use Case 2: Remote Teaching Infrastructure Investment

**Scenario**: Deciding which education sectors to invest in for remote capability

**High Investment ROI**:
```
Adult Education (0.70): Many programs already remote-capable
Secondary Teachers (0.60): Can shift to hybrid with tools
```

**Lower ROI / Not Viable**:
```
Preschool (0.40): Fundamentally in-person activity
Kindergarten (0.45): Developmental work requires presence
```

**Moderate ROI**:
```
Elementary (0.55): Hybrid possible, but in-person preferred
K-12 General (0.54): Tools help, but replace limited
```

---

### Use Case 3: Occupational Transition Planning

**Scenario**: Helping educators transition to higher-digital roles

**Forward Transitions** (low digital → higher digital):
```
Preschool (0.40) → Elementary (0.55) → Secondary (0.60) → Higher Ed (0.72)
Music (0.45) → Communications (0.75) → Business (0.80) → CS (0.85)
```

**Backward Transitions** (high digital → lower digital - not typical):
```
CS Teachers (0.85) → Regular Teachers (0.60) - Career shift down
Archivists (0.85) → Curators (0.70) - Moving to hands-on work
```

---

### Use Case 4: Industry Digital Maturity Index

**Scenario**: Calculate overall digitalization for education sector

**Weighted Average** (assuming equal employment):
```
Postsecondary (38 occ) × 0.72 = 27.4
K-12 (8 occ) × 0.54 = 4.3
Adult/Alt (4 occ) × 0.61 = 2.4
Library (5 occ) × 0.74 = 3.7
Support (9 occ) × 0.59 = 5.3
―――――――――――――――――
EDUCATION INDUSTRY SCORE: 0.62
```

**Interpretation**: Education sector is 62% digital - below IT (95%), above trades (15%)

---

### Use Case 5: Skills Gap Analysis

**Scenario**: Identifying which occupations need most digital upskilling

**High Skills Gap** (score < 0.50):
- Preschool teachers
- Kindergarten teachers
- Music teachers
- Special education assistants

**Moderate Skills Gap** (score 0.50-0.65):
- Elementary/secondary teachers
- Health instructors
- Teaching assistants
- Self-enrichment instructors

**Lower Skills Gap** (score 0.65+):
- Postsecondary teachers
- Librarians
- Adult educators

---

### Use Case 6: Pandemic Resilience Assessment

**Scenario**: Evaluating which education roles weathered COVID-19 disruptions

**Most Resilient** (≥0.70 remote capability):
- Postsecondary STEM (0.80)
- Adult education (0.70)
- Librarians (0.80)
- Archivists (0.85)

**Moderately Resilient** (0.55-0.65):
- Secondary teachers (0.60)
- Middle school (0.58)
- Elementary (0.55)

**Least Resilient** (<0.55):
- Preschool (0.40) - Majority in-person required
- Kindergarten (0.45) - Developmental needs not met remotely
- K-12 support (0.50) - Required for classroom management

---

### Use Case 7: Future-Proofing Education Careers

**Scenario**: Advising students on education careers most likely to remain relevant

**Most Future-Proof** (highest digital scores):
1. Computer Science Teachers (0.85) - Tech always in demand
2. Economics Teachers (0.85) - Data analysis increasingly important
3. Archivists (0.85) - Digital preservation growing field
4. Mathematics Teachers (0.80) - STEM always valued

**Moderately Future-Proof** (0.70-0.80):
- History, Business, Law, Psychology teachers
- Librarians

**Requires Continuous Adaptation** (<0.60):
- Preschool, kindergarten - Must adapt to digital learning
- K-12 general - Must embrace hybrid/personalized learning
- Music/art - Must integrate digital creation tools

---

### Use Case 8: Credentialing Program Prioritization

**Scenario**: Developing digital competency certifications for educators

**High Priority** (currently underequipped):
```
K-12 Teachers (0.54): Need LMS, digital assessment, online collaboration
- LMS training
- Digital assessment design
- Virtual classroom management
- Online tools integration
```

**Moderate Priority** (improving but gaps remain):
```
Postsecondary (0.72): Could improve in specific areas
- Online course design
- Digital lab simulations
- Virtual student engagement
```

**Specialized Priority**:
```
Librarians (0.80): Need advanced digital skills
- Digital collections management
- Information security
- Advanced cataloging systems
```

---

## Integration Queries

### Query 1: Score All O*NET 25-0000 Occupations

```sql
SELECT 
    o.occupation_code,
    o.occupation_title,
    ds.actionScore,
    ds.activityScore,
    ds.resultScore,
    ds.notes
FROM occupations o
JOIN digital_scores ds ON (
    o.occupation_code = ds.codes OR
    o.occupation_code LIKE CONCAT(SUBSTRING_INDEX(ds.codes, '.', 1), '%')
)
WHERE o.occupation_code LIKE '25-%'
ORDER BY ds.actionScore DESC
```

### Query 2: Find Score Gaps (Scores Below Average)

```sql
SELECT 
    entity,
    codes,
    actionScore,
    (SELECT AVG(actionScore) FROM digital_scores WHERE codes LIKE '25-%') as avg_score,
    ((SELECT AVG(actionScore) FROM digital_scores WHERE codes LIKE '25-%') - actionScore) as gap
FROM digital_scores
WHERE codes LIKE '25-%' AND actionScore < (SELECT AVG(actionScore) FROM digital_scores WHERE codes LIKE '25-%')
ORDER BY actionScore
```

### Query 3: Group by Digital Affinity

```sql
SELECT 
    CASE 
        WHEN actionScore >= 0.80 THEN 'High Digital'
        WHEN actionScore >= 0.70 THEN 'Digital-Leaning'
        WHEN actionScore >= 0.60 THEN 'Hybrid'
        WHEN actionScore >= 0.50 THEN 'Hands-On'
        ELSE 'Very Hands-On'
    END as digital_affinity,
    COUNT(*) as occupation_count,
    AVG(actionScore) as avg_score,
    GROUP_CONCAT(DISTINCT entity) as occupations
FROM digital_scores
WHERE codes LIKE '25-%'
GROUP BY digital_affinity
ORDER BY actionScore DESC
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Occupations Scored** | 54 |
| **Average Action Score** | 0.62 |
| **Median Action Score** | 0.60 |
| **Highest Score** | 0.85 (CS Teachers, Economists, Archivists) |
| **Lowest Score** | 0.40 (Preschool Teachers) |
| **Score Range** | 0.45 (0.85 - 0.40) |
| **Occupations ≥0.75** | 14 (26%) |
| **Occupations 0.50-0.75** | 38 (70%) |
| **Occupations <0.50** | 6 (11%) |
| **All Event Scores** | 1.0 (100%) |

