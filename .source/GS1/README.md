# GS1 Data Sources

## Automatically Fetched

1. **EPCIS Vocabulary**: https://ref.gs1.org/epcis (JSON-LD)
   - Event types, actions, business steps, dispositions
   - Saved as: GS1.EPCIS.Vocabulary.tsv

2. **CBV (Core Business Vocabulary)**: https://ref.gs1.org/cbv (JSON-LD)
   - Business steps, dispositions, source/destination types
   - Saved as: GS1.CBV.Vocabulary.tsv

## Manual Download Required: GPC (Global Product Classification)

### GPC Structure
- 4-tier hierarchy: Segment → Family → Class → Brick
- Updated twice yearly
- Complements UNSPSC with global product classification

### How to Download GPC Data

1. **GPC Browser** (requires JavaScript):
   - Visit: https://gpc-browser.gs1.org/
   - Look for "Export" or "Download" options
   - Download as Excel/XML format

2. **Alternative**: Contact GS1
   - Official GS1 standards page: https://www.gs1.org/standards/gpc
   - GPC Browser Guide: https://www.gs1.org/sites/gs1/files/docs/gpc/GPC-Browser-Guide.pdf
   - May require GS1 membership for full data access

3. **After Download**:
   - Save the downloaded file to this directory
   - Convert to TSV format: `GS1.GPC.Hierarchy.tsv`
   - Expected columns: Segment, Family, Class, Brick, Code, Title, Definition

### Integration
Once downloaded and converted to TSV, the product generation script will automatically include GPC data.

## Additional Resources

- Documentation: https://ref.gs1.org/docs/epcis/
- Examples: https://ref.gs1.org/docs/epcis/examples
- GS1 Web Vocabulary: https://www.gs1.org/voc/
- GS1 Identifiers: https://www.gs1.org/standards/id-keys
