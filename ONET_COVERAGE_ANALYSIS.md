# ONET Coverage Analysis

## Summary
- **Source Files**: 41 ONET TSV files in `.source/ONET/`
- **Normalized Entity Files**: 11 files in `.data/`
- **Normalized Relationship Files**: 11 files in `.data/`
- **Coverage**: ~54% of ONET files have direct entity/relationship outputs

## ONET Source Files → Normalized Output Mapping

### ✅ Fully Normalized (11 files → Things)

| Source File | Output File | Type | Notes |
|------------|-------------|------|-------|
| ONET.Abilities.tsv | Abilities.tsv | Thing | Physical and cognitive abilities |
| ONET.Knowledge.tsv | Knowledge.tsv | Thing | Knowledge domains |
| ONET.Skills.tsv | Skills.tsv | Thing | Skills required for work |
| ONET.TaskStatements.tsv | Tasks.tsv | Thing | Job task statements |
| ONET.TechnologySkills.tsv | Technologies.tsv | Thing | Software/technology used |
| ONET.ToolsUsed.tsv | Tools.tsv | Thing | Physical tools used |
| ONET.WorkActivities.tsv | WorkActivities.tsv | Thing | Generalized work activities |
| ONET.WorkContext.tsv | WorkContext.tsv | Thing | Physical/social work environment |
| ONET.WorkStyles.tsv | WorkStyles.tsv | Thing | Personal characteristics needed |
| ONET.WorkValues.tsv | WorkValues.tsv | Thing | Work values/motivations |
| ONET.OccupationData.tsv | Occupations.tsv | Thing | Occupation master list |

### ✅ Relationship Files (11 files)

| Source File | Output File | Type | Notes |
|------------|-------------|------|-------|
| ONET.AbilitiesToWorkActivities.tsv | Abilities.Relationships.tsv | Relationship | Maps abilities → work activities |
| ONET.AbilitiesToWorkContext.tsv | Abilities.Relationships.tsv | Relationship | Maps abilities → work context |
| ONET.SkillsToWorkActivities.tsv | Skills.Relationships.tsv | Relationship | Maps skills → work activities |
| ONET.SkillsToWorkContext.tsv | Skills.Relationships.tsv | Relationship | Maps skills → work context |
| ONET.TaskRatings.tsv | Tasks.Relationships.tsv | Relationship | Maps tasks → occupations with ratings |
| (Various ratings files) | Occupations.Relationships.tsv | Relationship | Maps all occupation → attribute relationships |
| (Tool linkage) | Tools.Relationships.tsv | Relationship | Maps tools → occupations |
| (Technology linkage) | Technologies.Relationships.tsv | Relationship | Maps tech → occupations |
| (Work attributes) | WorkActivities.Relationships.tsv | Relationship | Maps work activities → occupations |
| (Work context) | WorkContext.Relationships.tsv | Relationship | Maps work context → occupations |
| (Work styles) | WorkStyles.Relationships.tsv | Relationship | Maps work styles → occupations |
| (Work values) | WorkValues.Relationships.tsv | Relationship | Maps work values → occupations |

### ⚠️ Partially Used (Reference/Metadata Files - 10 files)

These files provide metadata, reference data, or mappings that are embedded in other files rather than becoming standalone entities:

| Source File | Usage | Should Normalize? | Priority |
|------------|-------|-------------------|----------|
| ONET.ContentModelReference.tsv | Metadata for content model structure | Maybe → **ContentModel.tsv** | Low |
| ONET.DWAReference.tsv | Reference for Detailed Work Activities | Maybe → **DetailedWorkActivities.tsv** | Medium |
| ONET.IWAReference.tsv | Reference for Intermediate Work Activities | Maybe → **IntermediateWorkActivities.tsv** | Medium |
| ONET.ScalesReference.tsv | Reference for rating scales | Maybe → relationships metadata | Low |
| ONET.LevelScaleAnchors.tsv | Scale anchor descriptions | Maybe → relationships metadata | Low |
| ONET.UNSPSCReference.tsv | UNSPSC product codes for tools/tech | Already in Products.tsv | ✅ Done |
| ONET.TaskCategories.tsv | Task categorization | Maybe → embedded in Tasks | Low |
| ONET.WorkContextCategories.tsv | Work context categorization | Maybe → embedded in WorkContext | Low |
| ONET.JobZoneReference.tsv | Job zone definitions | Maybe → **JobZones.tsv** | Medium |
| ONET.SurveyBookletLocations.tsv | Survey structure metadata | No (internal ONET reference) | Very Low |

### ❌ Not Normalized (Should Be Things or Relationships - 20 files)

#### **High Priority - Should Become Things** (5 files)

| Source File | Proposed Output | Type | Rationale |
|------------|-----------------|------|-----------|
| **ONET.Interests.tsv** | **Interests.tsv** | Thing | RIASEC interest areas (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) |
| **ONET.JobZones.tsv** | **JobZones.tsv** | Thing | Education/experience levels (5 job zones) |
| **ONET.EducationTrainingAndExperience.tsv** | **EducationLevels.tsv** | Thing | Required education levels for occupations |
| **ONET.EducationTrainingAndExperienceCategories.tsv** | Embedded in EducationLevels | Metadata | Categories for education/training |
| **ONET.EmergingTasks.tsv** | **EmergingTasks.tsv** or merge into Tasks | Thing | New/emerging tasks for occupations |

#### **High Priority - Should Become Relationships** (8 files)

| Source File | Proposed Output | Type | Rationale |
|------------|-----------------|------|-----------|
| **ONET.RelatedOccupations.tsv** | **Occupations.Relationships.tsv** (extend) | Relationship | Maps occupation → related occupations |
| **ONET.AlternateTitles.tsv** | **Occupations.Relationships.tsv** (extend) or **AlternateTitles.tsv** | Thing/Rel | Alternate job titles for occupations |
| **ONET.SampleOfReportedTitles.tsv** | **Occupations.Relationships.tsv** (extend) or **ReportedTitles.tsv** | Thing/Rel | Real-world job titles people use |
| **ONET.InterestsIllustrativeOccupations.tsv** | **Interests.Relationships.tsv** | Relationship | Maps interests → example occupations |
| **ONET.InterestsIllustrativeActivities.tsv** | **Interests.Relationships.tsv** | Relationship | Maps interests → example activities |
| **ONET.TasksToDWAs.tsv** | **Tasks.Relationships.tsv** (extend) | Relationship | Maps tasks → detailed work activities |
| **ONET.BasicInterestsToRIASEC.tsv** | **Interests.Relationships.tsv** | Relationship | Maps basic interests → RIASEC codes |
| **ONET.RIASECKeywords.tsv** | **Interests.Relationships.tsv** | Relationship | Keywords describing each RIASEC type |

#### **Medium Priority - Reference/Lookup Data** (4 files)

| Source File | Proposed Output | Type | Notes |
|------------|-----------------|------|-------|
| ONET.OccupationLevelMetadata.tsv | Embed in Occupations | Metadata | Occupation-level metadata |
| ONET.ReadMe.tsv | Documentation only | Docs | ONET database documentation |
| ONET.ContentModelReference.tsv | Maybe ContentModel.tsv | Reference | Content model structure |
| ONET.TaskCategories.tsv | Maybe TaskCategories.tsv | Reference | Task classification |

## Missing ONET Entities to Create

### Priority 1: Core ONET Concepts (5 new entity files)

1. **Interests.tsv** (from ONET.Interests.tsv)
   - RIASEC interest areas
   - ~6 main types + subcategories
   - Namespace: `onet.org.ai`

2. **JobZones.tsv** (from ONET.JobZones.tsv)
   - 5 job zones (education/experience levels)
   - Namespace: `onet.org.ai`

3. **EducationLevels.tsv** (from ONET.EducationTrainingAndExperience.tsv)
   - Required education/training for occupations
   - Namespace: `onet.org.ai`

4. **EmergingTasks.tsv** (from ONET.EmergingTasks.tsv)
   - New tasks being added to occupations
   - Namespace: `onet.org.ai`

5. **AlternateTitles.tsv** OR extend Occupations (from ONET.AlternateTitles.tsv + ONET.SampleOfReportedTitles.tsv)
   - Alternate and reported job titles
   - Could be ~100K+ title variations
   - Namespace: `onet.org.ai`

### Priority 2: Relationship Extensions (4 new relationship files)

1. **Interests.Relationships.tsv**
   - Interests → Occupations (illustrative)
   - Interests → Activities (illustrative)
   - Basic Interests → RIASEC
   - RIASEC → Keywords

2. **JobZones.Relationships.tsv**
   - Occupations → Job Zones
   - JobZones → Education Requirements

3. **EmergingTasks.Relationships.tsv**
   - Emerging Tasks → Occupations
   - Tasks → Detailed Work Activities

4. **AlternateTitles.Relationships.tsv** (if separate file)
   - Occupations → Alternate Titles
   - Occupations → Reported Titles

## Implementation Recommendation

Based on your requirement that **every ONET file should have a 1:1 mapping to either Things or Relationships**, here's the proposed plan:

### Phase 1: Create Missing Core Entity Files (Priority 1)

```bash
# New entity files to create
.data/Interests.tsv                    # from ONET.Interests.tsv
.data/JobZones.tsv                     # from ONET.JobZones.tsv
.data/EducationLevels.tsv              # from ONET.EducationTrainingAndExperience.tsv
.data/EmergingTasks.tsv                # from ONET.EmergingTasks.tsv
.data/AlternateTitles.tsv              # from ONET.AlternateTitles.tsv + ONET.SampleOfReportedTitles.tsv
```

### Phase 2: Create/Extend Relationship Files (Priority 1)

```bash
# New relationship files to create
.data/Interests.Relationships.tsv      # from ONET.InterestsIllustrativeOccupations.tsv,
                                       #      ONET.InterestsIllustrativeActivities.tsv,
                                       #      ONET.BasicInterestsToRIASEC.tsv,
                                       #      ONET.RIASECKeywords.tsv

.data/JobZones.Relationships.tsv       # from ONET.JobZones.tsv ratings

.data/EmergingTasks.Relationships.tsv  # from ONET.EmergingTasks.tsv

.data/AlternateTitles.Relationships.tsv # from title mappings

# Extend existing files
.data/Occupations.Relationships.tsv    # add ONET.RelatedOccupations.tsv
.data/Tasks.Relationships.tsv          # add ONET.TasksToDWAs.tsv
```

### Phase 3: Reference/Metadata Files (Priority 2)

```bash
# Optional - create if treating as first-class entities
.data/DetailedWorkActivities.tsv       # from ONET.DWAReference.tsv
.data/IntermediateWorkActivities.tsv   # from ONET.IWAReference.tsv
.data/ContentModel.tsv                 # from ONET.ContentModelReference.tsv
.data/TaskCategories.tsv               # from ONET.TaskCategories.tsv
```

## Current ONET Files Without 1:1 Mapping (20 files)

**These 20 ONET source files do NOT have a direct 1:1 mapping:**

1. ONET.Interests.tsv → ❌ Missing
2. ONET.JobZones.tsv → ❌ Missing
3. ONET.EducationTrainingAndExperience.tsv → ❌ Missing
4. ONET.EducationTrainingAndExperienceCategories.tsv → ❌ Missing
5. ONET.EmergingTasks.tsv → ❌ Missing
6. ONET.AlternateTitles.tsv → ❌ Missing
7. ONET.SampleOfReportedTitles.tsv → ❌ Missing
8. ONET.RelatedOccupations.tsv → ❌ Missing
9. ONET.InterestsIllustrativeOccupations.tsv → ❌ Missing
10. ONET.InterestsIllustrativeActivities.tsv → ❌ Missing
11. ONET.TasksToDWAs.tsv → ❌ Missing
12. ONET.BasicInterestsToRIASEC.tsv → ❌ Missing
13. ONET.RIASECKeywords.tsv → ❌ Missing
14. ONET.DWAReference.tsv → ❌ Missing (maybe)
15. ONET.IWAReference.tsv → ❌ Missing (maybe)
16. ONET.ContentModelReference.tsv → ❌ Missing (maybe)
17. ONET.TaskCategories.tsv → ❌ Missing (maybe)
18. ONET.WorkContextCategories.tsv → ❌ Missing (maybe)
19. ONET.OccupationLevelMetadata.tsv → ❌ Missing (embedded?)
20. ONET.JobZoneReference.tsv → ❌ Missing (reference)

## Estimated Impact

| Category | New Entity Files | New Relationship Files | Estimated Records |
|----------|------------------|----------------------|-------------------|
| High Priority | 5 | 4 | ~150K (mostly titles) |
| Medium Priority | 4 | 0 | ~500 |
| **Total** | **9** | **4** | **~150K** |

## Next Steps

1. ✅ Create `Interests.tsv` + `Interests.Relationships.tsv`
2. ✅ Create `JobZones.tsv` + `JobZones.Relationships.tsv`
3. ✅ Create `EducationLevels.tsv`
4. ✅ Create `EmergingTasks.tsv` + `EmergingTasks.Relationships.tsv`
5. ✅ Create `AlternateTitles.tsv` + `AlternateTitles.Relationships.tsv`
6. ⚠️ Extend `Occupations.Relationships.tsv` with `RelatedOccupations`
7. ⚠️ Extend `Tasks.Relationships.tsv` with `TasksToDWAs`
8. 🤔 Decide on DWA/IWA reference files (maybe create entities)

This achieves 100% 1:1 coverage of all 41 ONET source files!
