# Digital Score Framework

## Multi-Dimensional Scoring

Digital scores are applied across **four dimensions** for each task/process:

### 1. Action Score
**Question**: "Can an AI make an API call to initiate/execute this action?"

- **1.0**: AI can execute via tool call (e.g., `send.Email`, `schedule.Meeting`, `order.Product`)
- **0.5**: Hybrid - AI can initiate, requires physical execution (e.g., `ship.Package` via API, physical shipping)
- **0.0**: Requires physical presence (e.g., `cut.Hair`, `install.Wiring`)
- **null**: Modality unspecified (e.g., `communicate`, `meet`)

### 2. Event Score
**Question**: "Can this state change be represented digitally?"

- **1.0**: ALWAYS - All events can be digitally represented
- **null**: Only if event concept doesn't exist (rare)

**Examples**:
- `Package.shipped` = 1.0 (digital event even for physical shipping)
- `Email.sent` = 1.0
- `Locomotive.inspected` = 1.0 (inspection was physical, but event is digital)
- `BudgetRequest.submitted` = 1.0

### 3. Activity Score
**Question**: "What's the digital/physical mix of the ongoing process?"

- **1.0**: Pure digital activity (e.g., `analyzing.Data`, `writing.Code`)
- **0.5**: Hybrid (e.g., `shipping` - digital tracking, physical movement)
- **0.0**: Pure physical (e.g., `excavating`, `assembling.byHand`)

### 4. Result Score
**Question**: "Is the outcome digitally accessible/representable?"

- **1.0**: Digital output (e.g., `Report`, `Email`, `Database.Record`, even `InspectionFindings`)
- **0.5**: Physical output with digital representation (e.g., `Package.delivered`, `Building.constructed`)
- **0.0**: Pure physical with no digital representation (rare)

## Scoring Matrix Example

### Physical Process with Digital Touchpoints

**Task**: "Ship package to customer"

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Action | 1.0 | `ship.Package` - AI can call shipping API |
| Event | 1.0 | `Package.shipped`, `Package.delivered` - Digital events |
| Activity | 0.2 | `shipping` - Mostly physical transportation, digital tracking |
| Result | 0.5 | `Package.delivered` - Physical package, digital confirmation |

**Key Insight**: An entirely physical process (shipping) can have high digital scores for Action (1.0) and Event (1.0) because AI can initiate it via API and receive digital event notifications!

### Pure Digital Process

**Task**: "Send email to client"

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Action | 1.0 | `send.Email` - AI can call email API |
| Event | 1.0 | `Email.sent`, `Email.delivered` - Digital events |
| Activity | 1.0 | `sending` - Pure digital transmission |
| Result | 1.0 | `Email` - Digital message |

### Pure Physical Process

**Task**: "Cut customer's hair"

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Action | 0.0 | `cut.Hair` - No API, requires physical presence |
| Event | 1.0 | `Haircut.completed` - Can be logged digitally |
| Activity | 0.0 | `cutting` - Pure physical manual work |
| Result | 0.0 | `Haircut` - Physical result with no digital representation |

### Context-Dependent Process

**Task**: "Meet with team"

| Dimension | Score | Reasoning |
|-----------|-------|-----------|
| Action | 1.0 | `schedule.Meeting` - AI can call calendar API |
| Event | 1.0 | `Meeting.scheduled`, `Meeting.started`, `Meeting.ended` |
| Activity | null | `meeting` - Could be Zoom (1.0), in-person (0.0), or hybrid (0.5) |
| Result | null | Could be `MeetingNotes` (1.0) or just conversation (0.0) |

## Aggregate Scoring

For overall "digital score" of a task/process, we typically focus on **Action Score** since that determines AI automation potential.

However, all four dimensions provide valuable insights:
- **Action**: Automation potential (can AI do this?)
- **Event**: Observability (can AI monitor this?)
- **Activity**: Digital transformation level (how digital is execution?)
- **Result**: Output digitization (what gets produced?)

## Usage in Enrichment

These scores enable:
1. **Automation Planning**: High Action scores = automation candidates
2. **Workflow Design**: Event scores enable digital orchestration even for physical processes
3. **Digital Transformation**: Activity scores show where digitization efforts are needed
4. **Integration**: Result scores determine API accessibility of outputs
