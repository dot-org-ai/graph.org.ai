# Knowledge Graph Data Sources

Comprehensive list of free, bulk-downloadable datasets for graph.org.ai

## ✅ Already Ingested

1. **TLDs** - 1,438 top-level domains (IANA)
2. **Airports** - 83,798 airports, 9,068 with IATA codes (OurAirports)
3. **Currency Codes** - 445 ISO 4217 codes
4. **SEC Companies** - 10,215 US public companies with CIK/ticker mapping

## 📊 Reference Data

### Geographic & Infrastructure
- **Countries** - ISO 3166 codes (already in GeoNames)
- **Cities/Places** - GeoNames (12M+ locations)
- **Timezones** - IANA timezone database
- **Postal Codes** - GeoNames postal codes
- **Airports** - ✅ OurAirports CSV
- **Cloud Regions**:
  - AWS: https://ip-ranges.amazonaws.com/ip-ranges.json
  - Azure: `az account list-locations --output json`
  - GCP: https://cloud.google.com/compute/docs/regions-zones
  - Cloudflare: https://speed.cloudflare.com/locations

### Network & Internet
- **TLDs** - ✅ IANA (https://data.iana.org/TLD/tlds-alpha-by-domain.txt)
- **ASN** - RIPE NCC (https://ftp.ripe.net/ripe/asnames/)
- **AS Organizations** - ARIN Bulk WHOIS (https://www.arin.net/reference/research/bulkwhois/)
- **BGP Data** - RouteViews, CAIDA

### Standards & Classifications
- **Currency Codes** - ✅ ISO 4217
- **Stock Exchanges** - ISO 10383 MIC codes (https://github.com/datasets/exchange-codes)
- **Industry Codes** - NAICS, SIC
- **Occupation Codes** - O*NET, SOC
- **Product/Service Codes** - UNSPSC, HS codes

## 🏢 Business & Financial Data

### Companies & Securities
- **Public Companies** - ✅ SEC CIK/Ticker (https://www.sec.gov/files/company_tickers.json)
- **SEC EDGAR Filings** - Daily indices (https://www.sec.gov/Archives/edgar/daily-index/)
- **Stock Exchanges** - ISO MIC codes
- **OpenCorporates** - 200M+ companies worldwide (API available)

### Market Data
- **Stock Prices**:
  - FRED (https://fred.stlouisfed.org)
  - Yahoo Finance (unofficial CSV downloads)
  - Alpha Vantage (free tier)
  - Nasdaq Data Link (formerly Quandl)
- **Commodity Prices**:
  - FRED API (gold, oil, gas, agriculture)
  - World Bank Pink Sheet
  - IMF Primary Commodity Prices

### Economic Indicators

#### Federal Reserve (FRED)
- **URL**: https://fred.stlouisfed.org/docs/api/fred/
- **Coverage**: 830,000+ time series
- **Categories**:
  - GDP, GNI, Personal Income
  - Unemployment, Labor Force
  - Interest Rates, Exchange Rates
  - CPI, PPI, Inflation
  - Industrial Production
  - Trade Balance
  - Money Supply (M1, M2)
  - Regional/State/Metro data

#### World Bank Open Data
- **URL**: https://api.worldbank.org
- **Coverage**: 1,600+ indicators, 217 countries
- **Categories**:
  - GDP, GNI per capita
  - Poverty, Income Distribution
  - Population, Demographics
  - Education, Health
  - Infrastructure (electricity, internet, roads)
  - Environment, Climate
  - Trade, Investment
  - Governance
- **Special Datasets**:
  - Commodity Prices (Pink Sheet)
  - Doing Business Rankings
  - Enterprise Surveys
  - Poverty and Equity Database

### Employment & Labor
- **BLS (Bureau of Labor Statistics)**:
  - Occupational Employment Statistics (OES)
  - Current Employment Statistics (CES)
  - Job Openings and Labor Turnover (JOLTS)
  - Consumer Expenditure Survey
- **O*NET** - Occupational data (skills, tasks, wages)

## 🔬 Intellectual Property

### USPTO Patents
- **Bulk Data**: https://bulkdata.uspto.gov/
- **Patent Grants** - XML, 1976-present, ~2TB total
- **Patent Applications** - XML, 2001-present
- **PatentsView API** - https://patentsview.org/apis/api-endpoints
  - Patents, inventors, assignees, citations
  - JSON REST API, no key required
- **Patent Assignments** - Ownership transfers
- **Patent Classifications** - CPC hierarchy

### USPTO Trademarks
- **Daily Case Files**: https://bulkdata.uspto.gov/data/trademark/dailyxml/applications/
  - XML and JSON formats
  - Daily incremental + weekly full
- **Trademark Search API** - Requires free API key
- **TSDR** - Individual trademark lookup

## 📚 Knowledge & Content

### Wikimedia Projects
- **Wikipedia** - Articles, ~22GB decompressed
- **Wiktionary** - Dictionary (via kaikki.org JSONL - better than XML)
- **Wikidata** - Structured knowledge (JSONL dumps)
- **Wikinews** - News articles
- **Wikiquote** - Quotations
- **Wikibooks** - Educational textbooks
- **Wikiversity** - Learning materials

### Academic & Research
- **arXiv** - Scientific papers (bulk metadata)
- **PubMed** - Biomedical literature
- **Semantic Scholar** - Academic paper corpus
- **CrossRef** - DOI metadata

## 🌐 Web & Digital

### Common Crawl
- **URL**: https://commoncrawl.org/
- **Coverage**: 250B+ web pages
- **Monthly crawls** - WARC, WAT, WET formats
- **Columnar Index** - Parquet format for analysis

### Internet Archive
- **Wayback Machine CDX** - URL index
- **Book Metadata** - Open Library

## 🗺️ Schema & Ontologies

### Schema.org
- **Types** - Hierarchical vocabulary
- **Properties** - Relationships
- **Already ingested** - TSV format

### Industry Ontologies
- **NAICS** - North American Industry Classification
- **APQC** - Process Classification Framework
- **UNSPSC** - Products and Services codes

## 📖 Language & Linguistics

### Dictionaries & Thesauri
- **WordNet** - Lexical database
- **Wiktionary** - ✅ Via kaikki.org
- **ConceptNet** - Common sense knowledge

### Translation & i18n
- **CLDR** - Unicode locale data
- **ISO 639** - Language codes
- **Ethnologue** - 7,000+ languages

## 🏛️ Government Data

### US Government
- **Data.gov** - 300,000+ datasets
- **Census Bureau** - Demographics, economic
- **IRS** - Tax statistics
- **FEC** - Campaign finance
- **USA Spending** - Federal contracts/grants

### International
- **UN Data** - Global statistics
- **Eurostat** - European statistics
- **OECD** - Economic cooperation data

## 🔧 Implementation Status

### Completed Scripts
1. `.scripts/ingest-tlds.ts` - TLD data
2. `.scripts/ingest-airports.ts` - Airport data
3. `.scripts/ingest-currencies.ts` - Currency codes
4. `.scripts/ingest-sec-companies.ts` - Public companies

### Pending Scripts
- Cloud regions (AWS, Azure, GCP, Cloudflare)
- ASN and AS organization data
- Stock exchanges (ISO MIC codes)
- FRED economic data
- World Bank indicators
- USPTO patents (PatentsView API)
- USPTO trademarks (daily JSON feed)
- Common Crawl (columnar index)

## 🎯 Priority Recommendations

**Phase 1 (Easy, High Value):**
1. Stock Exchanges - Small, standardized
2. ASN/AS Org - Network infrastructure
3. FRED Series - Start with popular indicators
4. USPTO Trademarks - Daily JSON feed

**Phase 2 (Medium Effort):**
1. World Bank Indicators - API-based
2. PatentsView - REST API for patents
3. Cloud Regions - Mix of APIs and scraping
4. BLS Employment Data - Large but structured

**Phase 3 (Large Scale):**
1. USPTO Patent Bulk - 2TB of XML
2. Common Crawl - 250B pages
3. Wikipedia Full History - Temporal data
4. Academic Papers - arXiv, PubMed

## 📝 Notes

- Most datasets have **free APIs** with no keys required
- **ClickHouse direct streaming** (`url()` function) works for many sources
- **GitHub Actions** can run heavy ingestion jobs
- **Incremental updates** available for most time-series data
- **Rate limits** vary - check documentation
- **User-Agent** header recommended for bulk downloads

## 🔗 Key Resources

- FRED API: https://fred.stlouisfed.org/docs/api/fred/
- World Bank API: https://api.worldbank.org
- USPTO Bulk Data: https://bulkdata.uspto.gov/
- PatentsView: https://patentsview.org/apis/api-endpoints
- SEC EDGAR: https://www.sec.gov/os/accessing-edgar-data
- Common Crawl: https://commoncrawl.org/
- Schema.org: https://schema.org/
- GeoNames: https://www.geonames.org/
