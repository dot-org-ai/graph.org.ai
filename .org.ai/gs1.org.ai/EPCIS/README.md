---
$id: https://gs1.org.ai/EPCIS
$context: https://gs1.org.ai
name: EPCIS (Electronic Product Code Information Services)
version: "2.0"
---

# EPCIS

Electronic Product Code Information Services - the GS1 standard for supply chain visibility.

## Overview

EPCIS captures **what**, **when**, **where**, **why**, **who**, and **how** of supply chain events, enabling end-to-end visibility across trading partners.

## Event Model

### The 5W+H Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                        EPCIS EVENT                              │
├─────────────┬───────────────────────────────────────────────────┤
│ WHAT        │ Which objects were involved?                      │
│             │ epcList, quantityList, parentID, childEPCs        │
├─────────────┼───────────────────────────────────────────────────┤
│ WHEN        │ When did it happen?                               │
│             │ eventTime, recordTime, eventTimeZoneOffset        │
├─────────────┼───────────────────────────────────────────────────┤
│ WHERE       │ Where did it happen?                              │
│             │ readPoint, bizLocation, sourceList, destList      │
├─────────────┼───────────────────────────────────────────────────┤
│ WHY         │ What business context?                            │
│             │ bizStep, disposition, bizTransactionList          │
├─────────────┼───────────────────────────────────────────────────┤
│ WHO         │ Who was involved?                                 │
│             │ sourceList (owning_party, possessing_party)       │
│             │ destinationList (owning_party, possessing_party)  │
├─────────────┼───────────────────────────────────────────────────┤
│ HOW         │ How was data captured?                            │
│             │ sensorElementList, certificationInfo              │
└─────────────┴───────────────────────────────────────────────────┘
```

## Event Types

### ObjectEvent
Records observation of objects without changing their state.

```json
{
  "type": "ObjectEvent",
  "action": "OBSERVE",
  "eventTime": "2024-01-15T10:30:00Z",
  "epcList": ["urn:epc:id:sgtin:0614141.107346.1234"],
  "bizStep": "shipping",
  "disposition": "in_transit",
  "readPoint": {"id": "urn:epc:id:sgln:0614141.00001.0"},
  "bizLocation": {"id": "urn:epc:id:sgln:0614141.00001.0"}
}
```

**Actions**: `ADD`, `OBSERVE`, `DELETE`

### AggregationEvent
Records objects being added to or removed from containers.

```json
{
  "type": "AggregationEvent",
  "action": "ADD",
  "eventTime": "2024-01-15T09:00:00Z",
  "parentID": "urn:epc:id:sscc:0614141.1234567890",
  "childEPCs": [
    "urn:epc:id:sgtin:0614141.107346.1234",
    "urn:epc:id:sgtin:0614141.107346.1235"
  ],
  "bizStep": "packing"
}
```

**Actions**: `ADD`, `DELETE`, `OBSERVE`

### TransactionEvent
Associates objects with business transactions.

```json
{
  "type": "TransactionEvent",
  "action": "ADD",
  "eventTime": "2024-01-15T11:00:00Z",
  "epcList": ["urn:epc:id:sscc:0614141.1234567890"],
  "bizTransactionList": [
    {"type": "po", "bizTransaction": "urn:epc:id:gdti:0614141.00001.PO12345"},
    {"type": "inv", "bizTransaction": "urn:epc:id:gdti:0614141.00001.INV67890"}
  ]
}
```

### TransformationEvent
Records transformation of input objects into output objects.

```json
{
  "type": "TransformationEvent",
  "eventTime": "2024-01-15T14:00:00Z",
  "inputEPCList": [
    "urn:epc:id:sgtin:0614141.100001.1",
    "urn:epc:id:sgtin:0614141.100002.1"
  ],
  "outputEPCList": [
    "urn:epc:id:sgtin:0614141.200001.1"
  ],
  "bizStep": "commissioning"
}
```

## Business Steps (bizStep)

| Value | Description | Typical Events |
|-------|-------------|----------------|
| `accepting` | Accepting delivery | ObjectEvent (OBSERVE) |
| `arriving` | Arriving at location | ObjectEvent (OBSERVE) |
| `assembling` | Assembling components | TransformationEvent |
| `collecting` | Collecting from locations | ObjectEvent (OBSERVE) |
| `commissioning` | Creating new trade items | ObjectEvent (ADD) |
| `consigning` | Transferring possession | ObjectEvent (OBSERVE) |
| `creating_class_instance` | Creating class-level instance | ObjectEvent (ADD) |
| `cycle_counting` | Inventory count | ObjectEvent (OBSERVE) |
| `decommissioning` | Retiring trade items | ObjectEvent (DELETE) |
| `departing` | Leaving a location | ObjectEvent (OBSERVE) |
| `destroying` | Destroying objects | ObjectEvent (DELETE) |
| `disassembling` | Taking apart | TransformationEvent |
| `dispensing` | Dispensing (pharmacy) | ObjectEvent (OBSERVE) |
| `encoding` | Writing to RFID tag | ObjectEvent (ADD) |
| `entering_exiting` | Entering/exiting area | ObjectEvent (OBSERVE) |
| `holding` | Holding for inspection | ObjectEvent (OBSERVE) |
| `inspecting` | Quality inspection | ObjectEvent (OBSERVE) |
| `installing` | Installing in location | ObjectEvent (OBSERVE) |
| `killing` | Deactivating RFID | ObjectEvent (DELETE) |
| `loading` | Loading for transport | ObjectEvent (OBSERVE) |
| `other` | Other business step | Any |
| `packing` | Packing into container | AggregationEvent (ADD) |
| `picking` | Picking from storage | ObjectEvent (OBSERVE) |
| `receiving` | Receiving delivery | ObjectEvent (OBSERVE) |
| `removing` | Removing from service | ObjectEvent (DELETE) |
| `repackaging` | Changing packaging | AggregationEvent |
| `repairing` | Repairing objects | ObjectEvent (OBSERVE) |
| `replacing` | Replacing components | TransformationEvent |
| `reserving` | Reserving inventory | ObjectEvent (OBSERVE) |
| `retail_selling` | Retail sale | ObjectEvent (OBSERVE) |
| `shipping` | Shipping out | ObjectEvent (OBSERVE) |
| `staging_outbound` | Staging for shipment | ObjectEvent (OBSERVE) |
| `stock_taking` | Inventory audit | ObjectEvent (OBSERVE) |
| `stocking` | Placing in storage | ObjectEvent (OBSERVE) |
| `storing` | Storing | ObjectEvent (OBSERVE) |
| `transporting` | In transit | ObjectEvent (OBSERVE) |
| `unloading` | Unloading | ObjectEvent (OBSERVE) |
| `unpacking` | Removing from container | AggregationEvent (DELETE) |
| `void_shipping` | Canceling shipment | ObjectEvent (DELETE) |

## Dispositions

| Value | Description |
|-------|-------------|
| `active` | Ready for use |
| `container_closed` | Container sealed |
| `damaged` | Damaged |
| `destroyed` | Destroyed |
| `dispensed` | Dispensed |
| `disposed` | Disposed of |
| `encoded` | RFID encoded |
| `expired` | Past expiration |
| `in_progress` | Processing in progress |
| `in_transit` | Being transported |
| `inactive` | Not active |
| `no_pedigree_match` | Pedigree mismatch |
| `non_sellable_other` | Cannot be sold |
| `partially_dispensed` | Partially dispensed |
| `recalled` | Product recall |
| `reserved` | Reserved |
| `retail_sold` | Sold at retail |
| `returned` | Returned |
| `sellable_accessible` | Available for sale |
| `sellable_not_accessible` | For sale but not accessible |
| `stolen` | Reported stolen |
| `unknown` | Unknown status |

## Usage

```typescript
import { epcis } from 'gs1.org.ai'

// Create shipping event
const shipment = epcis.createObjectEvent({
  action: 'OBSERVE',
  eventTime: new Date(),
  epcList: ['urn:epc:id:sscc:0614141.1234567890'],
  bizStep: 'shipping',
  disposition: 'in_transit',
  readPoint: 'urn:epc:id:sgln:0614141.00001.0'
})

// Query events
const events = await epcis.query({
  eventType: 'ObjectEvent',
  bizStep: 'receiving',
  GE_eventTime: '2024-01-01T00:00:00Z'
})
```

## Sources

- [EPCIS 2.0 Standard](https://www.gs1.org/standards/epcis)
- [CBV 2.0 (Core Business Vocabulary)](https://www.gs1.org/standards/epcis/cbv)
