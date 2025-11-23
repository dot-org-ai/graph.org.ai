# Business-as-Code: GraphDL Semantic Model Synthesis

## Executive Summary

This document synthesizes research from 11 business model archetypes to create a comprehensive **Business-as-Code** semantic framework using GraphDL triple notation. The goal is to model businesses at a deep semantic level, connecting them to Industries (NAICS), Occupations (O*NET), Tasks, Processes (APQC), Products, Services, and Departments.

## Business Taxonomy Overview

We have researched and will model the following business types:

### Core Business Types (4)
1. **LocalBusiness** - Physical location-based businesses serving local markets
2. **OnlineBusiness** - Digital-first businesses operating primarily online
3. **Startup** - High-growth, venture-backed companies (often overlaps with Online)
4. **Enterprise** - Large-scale, established organizations with complex hierarchies

### Online Business Subtypes (7)
5. **SaaS** - Software-as-a-Service subscription businesses
6. **APIBusiness** - Developer-focused API-first platforms
7. **Marketplace** - Two-sided platforms connecting buyers and sellers
8. **DatasetBusiness** - Data-as-a-Service businesses
9. **DirectoryBusiness** - Listing and discovery platforms
10. **ServicesBusiness** - Traditional human-delivered professional services
11. **AgenticServicesBusiness** - AI-powered services (Services-as-Software)

## Business Type Hierarchy

```graphdl
# Top-level taxonomy
Business.subClassOf.Organization

# Primary business types
LocalBusiness.subClassOf.Business
OnlineBusiness.subClassOf.Business
Startup.subClassOf.Business
Enterprise.subClassOf.Business

# Online business specializations
SaaS.subClassOf.OnlineBusiness
APIBusiness.subClassOf.OnlineBusiness
Marketplace.subClassOf.OnlineBusiness
DatasetBusiness.subClassOf.OnlineBusiness
DirectoryBusiness.subClassOf.OnlineBusiness

# Services specializations (can be Local or Online)
ServicesBusiness.subClassOf.Business
AgenticServicesBusiness.subClassOf.ServicesBusiness
AgenticServicesBusiness.subClassOf.OnlineBusiness

# Startup can be combined with other types
Startup.canBe.SaaS
Startup.canBe.Marketplace
Startup.canBe.APIBusiness
Startup.canBe.AgenticServicesBusiness
```

## Core Semantic Dimensions

Every business type will be modeled across these dimensions:

### 1. Organizational Structure
- **Departments** (universal and type-specific)
- **Roles/Occupations** (mapped to O*NET)
- **Hierarchies** (flat vs. matrix vs. hierarchical)

### 2. Processes
- **Core processes** (mapped to APQC framework)
- **Industry-specific processes**
- **Type-specific workflows**

### 3. Economic Model
- **Revenue streams**
- **Cost structure**
- **Pricing models**
- **Unit economics**

### 4. Products & Services
- **Offerings** (mapped to Products.tsv, Services.tsv)
- **Delivery mechanisms**
- **Value propositions**

### 5. Relationships
- **Customers/Users**
- **Suppliers/Partners**
- **Employees/Talent**
- **Investors/Stakeholders**

### 6. Metrics & KPIs
- **Financial metrics**
- **Operational metrics**
- **Growth metrics**
- **Type-specific KPIs**

### 7. Industry Connections
- **NAICS codes** (which industries operate as this business type)
- **Industry-specific variations**

### 8. Lifecycle & Evolution
- **Stages** (founding, growth, maturity)
- **Transformations** (e.g., Startup → Enterprise)

## Universal Business Departments

These departments exist across most business types (with variations):

```graphdl
# Universal departments
Business.hasDepartment.Executive
Business.hasDepartment.Finance
Business.hasDepartment.HumanResources
Business.hasDepartment.Marketing
Business.hasDepartment.Sales
Business.hasDepartment.Operations
Business.hasDepartment.Legal

# Department relationships to processes
Finance.executes.FinancialPlanning
Finance.executes.Accounting
Finance.executes.BudgetManagement

HumanResources.executes.TalentAcquisition
HumanResources.executes.EmployeeDevelopment
HumanResources.executes.CompensationManagement

Marketing.executes.BrandManagement
Marketing.executes.DemandGeneration
Marketing.executes.ContentMarketing

Sales.executes.LeadGeneration
Sales.executes.CustomerAcquisition
Sales.executes.AccountManagement
```

## Business Type-Specific Departments

### LocalBusiness
```graphdl
LocalBusiness.hasDepartment.Operations
LocalBusiness.hasDepartment.SalesAndCustomerService
LocalBusiness.hasDepartment.FinancialManagement
LocalBusiness.hasDepartment.Marketing
LocalBusiness.hasDepartment.HumanResources

# Industry-specific for Retail
LocalBusiness.whenIndustry.Retail.hasDepartment.Merchandising
LocalBusiness.whenIndustry.Retail.hasDepartment.InventoryManagement
LocalBusiness.whenIndustment.Retail.hasDepartment.LossPrevention

# Industry-specific for Food Service
LocalBusiness.whenIndustry.FoodService.hasDepartment.KitchenOperations
LocalBusiness.whenIndustry.FoodService.hasDepartment.MenuDevelopment
```

### OnlineBusiness
```graphdl
OnlineBusiness.hasDepartment.EngineeringAndProduct
OnlineBusiness.hasDepartment.DigitalMarketing
OnlineBusiness.hasDepartment.CustomerSuccess
OnlineBusiness.hasDepartment.DataAndAnalytics
OnlineBusiness.hasDepartment.DevOpsAndInfrastructure

# Sub-departments
EngineeringAndProduct.hasDepartment.FrontendEngineering
EngineeringAndProduct.hasDepartment.BackendEngineering
EngineeringAndProduct.hasDepartment.ProductManagement
EngineeringAndProduct.hasDepartment.DesignAndUX
```

### Startup (by stage)
```graphdl
Startup.atStage.Seed.hasDepartment.Founders
Startup.atStage.Seed.hasDepartment.Engineering

Startup.atStage.SeriesA.hasDepartment.Engineering
Startup.atStage.SeriesA.hasDepartment.Sales
Startup.atStage.SeriesA.hasDepartment.Marketing
Startup.atStage.SeriesA.hasDepartment.FinanceAndOperations

Startup.atStage.SeriesB.hasDepartment.Engineering
Startup.atStage.SeriesB.hasDepartment.Sales
Startup.atStage.SeriesB.hasDepartment.Marketing
Startup.atStage.SeriesB.hasDepartment.CustomerSuccess
Startup.atStage.SeriesB.hasDepartment.HumanResources
Startup.atStage.SeriesB.hasDepartment.Legal
Startup.atStage.SeriesB.hasDepartment.Finance
```

### Enterprise
```graphdl
Enterprise.hasDepartment.ExecutiveAndStrategy
Enterprise.hasDepartment.Finance
Enterprise.hasDepartment.HumanResources
Enterprise.hasDepartment.LegalAndCompliance
Enterprise.hasDepartment.ITAndTechnology
Enterprise.hasDepartment.Operations
Enterprise.hasDepartment.Sales
Enterprise.hasDepartment.Marketing
Enterprise.hasDepartment.ProductAndRnD
Enterprise.hasDepartment.CustomerSuccessAndSupport
Enterprise.hasDepartment.ProcurementAndSupplyChain

# Enterprise-specific sub-departments
Finance.hasDepartment.FinancialPlanningAndAnalysis
Finance.hasDepartment.Accounting
Finance.hasDepartment.Treasury
Finance.hasDepartment.Tax
Finance.hasDepartment.InternalAudit

HumanResources.hasDepartment.TalentAcquisition
HumanResources.hasDepartment.CompensationAndBenefits
HumanResources.hasDepartment.LearningAndDevelopment
HumanResources.hasDepartment.HRIS
HumanResources.hasDepartment.EmployeeRelations
```

### SaaS
```graphdl
SaaS.hasDepartment.ProductAndEngineering
SaaS.hasDepartment.CustomerSuccess
SaaS.hasDepartment.Sales
SaaS.hasDepartment.Marketing
SaaS.hasDepartment.Support
SaaS.hasDepartment.Finance
SaaS.hasDepartment.PeopleAndHR

# SaaS-specific process
CustomerSuccess.executes.Onboarding
CustomerSuccess.executes.AdoptionMonitoring
CustomerSuccess.executes.ChurnPrevention
CustomerSuccess.executes.ExpansionPlanning
CustomerSuccess.executes.RenewalManagement
```

### APIBusiness
```graphdl
APIBusiness.hasDepartment.DeveloperRelations
APIBusiness.hasDepartment.APIProductManagement
APIBusiness.hasDepartment.PlatformEngineering
APIBusiness.hasDepartment.DeveloperExperience
APIBusiness.hasDepartment.TechnicalDocumentation
APIBusiness.hasDepartment.PartnerEngineering
APIBusiness.hasDepartment.InfrastructureAndReliability

# API-specific processes
DeveloperRelations.executes.DeveloperAdvocacy
DeveloperRelations.executes.CommunityBuilding
DeveloperRelations.executes.DeveloperSupport

PlatformEngineering.executes.APIDesign
PlatformEngineering.executes.APIVersioning
PlatformEngineering.executes.RateLimiting
PlatformEngineering.executes.UsageMetering
```

### Marketplace
```graphdl
Marketplace.hasDepartment.Supply
Marketplace.hasDepartment.Demand
Marketplace.hasDepartment.TrustAndSafety
Marketplace.hasDepartment.MarketplaceOperations
Marketplace.hasDepartment.ProductAndEngineering
Marketplace.hasDepartment.PaymentsAndRisk
Marketplace.hasDepartment.CustomerSupport
Marketplace.hasDepartment.Marketing
Marketplace.hasDepartment.DataScienceAndPricing

# Marketplace-specific processes
Supply.executes.SellerAcquisition
Supply.executes.SellerOnboarding
Supply.executes.SellerVetting
Supply.executes.MerchantSuccess

Demand.executes.BuyerAcquisition
Demand.executes.BuyerActivation
Demand.executes.BuyerRetention

TrustAndSafety.executes.IdentityVerification
TrustAndSafety.executes.ReviewModeration
TrustAndSafety.executes.FraudDetection
TrustAndSafety.executes.DisputeResolution
```

### DatasetBusiness
```graphdl
DatasetBusiness.hasDepartment.DataAcquisition
DatasetBusiness.hasDepartment.DataEngineering
DatasetBusiness.hasDepartment.DataScience
DatasetBusiness.hasDepartment.DataQuality
DatasetBusiness.hasDepartment.ProductManagement
DatasetBusiness.hasDepartment.Sales
DatasetBusiness.hasDepartment.CustomerSuccess
DatasetBusiness.hasDepartment.LegalAndCompliance
DatasetBusiness.hasDepartment.PlatformEngineering

# Dataset-specific processes
DataAcquisition.executes.DataSourcing
DataAcquisition.executes.DataIngestion
DataAcquisition.executes.PartnershipDevelopment

DataEngineering.executes.DataCleaning
DataEngineering.executes.DataNormalization
DataEngineering.executes.DataEnrichment
DataEngineering.executes.PipelineManagement

DataQuality.executes.ValidationRules
DataQuality.executes.AccuracyMonitoring
DataQuality.executes.QualityAssurance
```

### DirectoryBusiness
```graphdl
DirectoryBusiness.hasDepartment.ContentAndListingsManagement
DirectoryBusiness.hasDepartment.SalesAndMonetization
DirectoryBusiness.hasDepartment.ProductAndEngineering
DirectoryBusiness.hasDepartment.MarketingAndSEO
DirectoryBusiness.hasDepartment.TrustAndSafety
DirectoryBusiness.hasDepartment.CustomerSuccess
DirectoryBusiness.hasDepartment.DataOperations

# Directory-specific processes
ContentAndListingsManagement.executes.ListingAcquisition
ContentAndListingsManagement.executes.DataVerification
ContentAndListingsManagement.executes.QualityControl

TrustAndSafety.executes.ReviewModeration
TrustAndSafety.executes.ListingVerification
TrustAndSafety.executes.SpamDetection
```

### ServicesBusiness (Traditional)
```graphdl
ServicesBusiness.hasDepartment.DeliveryAndOperations
ServicesBusiness.hasDepartment.BusinessDevelopment
ServicesBusiness.hasDepartment.AccountManagement
ServicesBusiness.hasDepartment.PracticeManagement
ServicesBusiness.hasDepartment.TalentAndRecruiting
ServicesBusiness.hasDepartment.Finance
ServicesBusiness.hasDepartment.Marketing
ServicesBusiness.hasDepartment.KnowledgeManagement

# Services-specific processes
DeliveryAndOperations.executes.ResourceAllocation
DeliveryAndOperations.executes.ProjectDelivery
DeliveryAndOperations.executes.TimeTracking
DeliveryAndOperations.executes.QualityAssurance

TalentAndRecruiting.executes.TalentAcquisition
TalentAndRecruiting.executes.SkillDevelopment
TalentAndRecruiting.executes.UtilizationManagement
```

### AgenticServicesBusiness (AI Services)
```graphdl
AgenticServicesBusiness.hasDepartment.AIAndMLEngineering
AgenticServicesBusiness.hasDepartment.ProductManagement
AgenticServicesBusiness.hasDepartment.DataOperations
AgenticServicesBusiness.hasDepartment.HumanInTheLoopOperations
AgenticServicesBusiness.hasDepartment.SalesAndGrowth
AgenticServicesBusiness.hasDepartment.CustomerSuccess
AgenticServicesBusiness.hasDepartment.ComplianceAndEthics

# Agentic-specific processes
AIAndMLEngineering.executes.AgentDevelopment
AIAndMLEngineering.executes.PromptEngineering
AIAndMLEngineering.executes.ModelTraining
AIAndMLEngineering.executes.AgentOptimization

HumanInTheLoopOperations.executes.QualityReview
HumanInTheLoopOperations.executes.EdgeCaseHandling
HumanInTheLoopOperations.executes.FeedbackCollection
HumanInTheLoopOperations.executes.ContinuousImprovement

ComplianceAndEthics.executes.SafetyMonitoring
ComplianceAndEthics.executes.BiasDetection
ComplianceAndEthics.executes.RegulatoryCompliance
```

## Industry Connections

### LocalBusiness Industries
```graphdl
LocalBusiness.operatesIn.Retail
LocalBusiness.operatesIn.FoodService
LocalBusiness.operatesIn.PersonalCare
LocalBusiness.operatesIn.ProfessionalServices
LocalBusiness.operatesIn.Healthcare
LocalBusiness.operatesIn.Entertainment
LocalBusiness.operatesIn.AutomotiveServices

# NAICS mappings
LocalBusiness.whenIndustry.Retail.hasNAICS.44-45
LocalBusiness.whenIndustry.FoodService.hasNAICS.722
LocalBusiness.whenIndustry.PersonalCare.hasNAICS.812
LocalBusiness.whenIndustry.ProfessionalServices.hasNAICS.541
LocalBusiness.whenIndustry.Healthcare.hasNAICS.621-623
```

### SaaS Industries (vertical SaaS)
```graphdl
SaaS.serves.Healthcare
SaaS.serves.FinancialServices
SaaS.serves.Retail
SaaS.serves.Manufacturing
SaaS.serves.RealEstate
SaaS.serves.Legal
SaaS.serves.Education

# Examples
SaaS.example.Veeva.serves.Pharmaceutical
SaaS.example.Toast.serves.Restaurant
SaaS.example.Procore.serves.Construction
```

### Marketplace Industries
```graphdl
Marketplace.operatesIn.ECommerce
Marketplace.operatesIn.RealEstate
Marketplace.operatesIn.Transportation
Marketplace.operatesIn.Hospitality
Marketplace.operatesIn.FreelanceServices
Marketplace.operatesIn.B2BProcurement

# Examples
Marketplace.example.Airbnb.operatesIn.Hospitality
Marketplace.example.Uber.operatesIn.Transportation
Marketplace.example.Upwork.operatesIn.FreelanceServices
```

## Occupation Mappings

### LocalBusiness Occupations
```graphdl
LocalBusiness.employs.GeneralAndOperationsManager  # O*NET 11-1021.00
LocalBusiness.employs.FirstLineSupervisor  # O*NET varies by industry
LocalBusiness.employs.RetailSalesperson  # O*NET 41-2031.00 (Retail)
LocalBusiness.employs.Cashier  # O*NET 41-2011.00
LocalBusiness.employs.Cook  # O*NET 35-2014.00 (Food Service)
LocalBusiness.employs.Waiter  # O*NET 35-3031.00 (Food Service)
LocalBusiness.employs.Hairdresser  # O*NET 39-5012.00 (Personal Care)
```

### OnlineBusiness/SaaS Occupations
```graphdl
OnlineBusiness.employs.SoftwareEngineer  # O*NET 15-1252.00
OnlineBusiness.employs.ProductManager  # O*NET 11-3021.00 (similar to Computer/IS Managers)
OnlineBusiness.employs.DataScientist  # O*NET 15-2051.00
OnlineBusiness.employs.DigitalMarketer  # O*NET 13-1161.00 (Market Research Analysts)
OnlineBusiness.employs.CustomerSuccessManager  # O*NET 11-2022.00 (Sales Managers - closest match)
OnlineBusiness.employs.DevOpsEngineer  # O*NET 15-1252.00
OnlineBusiness.employs.UXDesigner  # O*NET 15-1255.00 (Web and Digital Interface Designers)
```

### APIBusiness Occupations
```graphdl
APIBusiness.employs.DeveloperAdvocate  # O*NET 27-3043.00 (Writers and Authors - technical)
APIBusiness.employs.PlatformEngineer  # O*NET 15-1252.00
APIBusiness.employs.TechnicalWriter  # O*NET 27-3042.00
APIBusiness.employs.SolutionsArchitect  # O*NET 15-1199.09 (Information Technology Project Managers)
APIBusiness.employs.PartnerEngineer  # O*NET 15-1252.00
```

### Marketplace Occupations
```graphdl
Marketplace.employs.SupplyManager  # O*NET 11-3061.00 (Purchasing Managers)
Marketplace.employs.DemandManager  # O*NET 11-2021.00 (Marketing Managers)
Marketplace.employs.TrustAndSafetyAnalyst  # O*NET 13-1199.07 (Compliance Officers)
Marketplace.employs.MarketplaceOperationsManager  # O*NET 11-1021.00
Marketplace.employs.FraudAnalyst  # O*NET 15-2051.00 (Data Scientists)
Marketplace.employs.PricingAnalyst  # O*NET 15-2031.00 (Operations Research Analysts)
```

### AgenticServicesBusiness Occupations (New roles)
```graphdl
AgenticServicesBusiness.employs.AIProductManager  # O*NET 15-1299.08 (Computer Occupations, All Other)
AgenticServicesBusiness.employs.PromptEngineer  # O*NET 15-1252.00 (emerging specialization)
AgenticServicesBusiness.employs.AgentTrainer  # O*NET 15-2051.00 (Data Scientists)
AgenticServicesBusiness.employs.HITLOperator  # O*NET 43-9199.00 (Office and Administrative Support Workers)
AgenticServicesBusiness.employs.AISafetySpecialist  # O*NET 13-1199.07 (Compliance Officers)
AgenticServicesBusiness.employs.AIQualityAnalyst  # O*NET 13-1111.00 (Management Analysts)
```

## Process Mappings (APQC Framework)

### Universal Business Processes
```graphdl
Business.executes.DevelopVisionAndStrategy  # APQC 1.0
Business.executes.DevelopAndManageProducts  # APQC 2.0
Business.executes.MarketAndSellProducts  # APQC 3.0
Business.executes.DeliverProducts  # APQC 4.0
Business.executes.ManageCustomerService  # APQC 5.0
Business.executes.DevelopAndManageHumanCapital  # APQC 6.0
Business.executes.ManageIT  # APQC 7.0
Business.executes.ManageFinancialResources  # APQC 8.0
Business.executes.ManageEnterpriseRisk  # APQC 9.0
Business.executes.ManageExternalRelationships  # APQC 10.0
```

### SaaS-Specific Processes
```graphdl
SaaS.executes.CustomerOnboarding  # APQC 5.1 (customized for SaaS)
SaaS.executes.UserActivation  # APQC 5.1.2 (engagement)
SaaS.executes.ChurnPrevention  # APQC 5.2 (customer retention)
SaaS.executes.ExpansionRevenue  # APQC 3.5 (upsell/cross-sell)
SaaS.executes.ProductLedGrowth  # APQC 3.3 (marketing)
SaaS.executes.ContinuousDeployment  # APQC 7.4 (IT operations)
```

### Marketplace-Specific Processes
```graphdl
Marketplace.executes.SupplySideAcquisition  # APQC 10.2 (supplier relationships)
Marketplace.executes.DemandSideAcquisition  # APQC 3.2 (customer acquisition)
Marketplace.executes.LiquidityManagement  # APQC 9.5 (operational risk)
Marketplace.executes.TransactionFacilitation  # APQC 4.1 (order management)
Marketplace.executes.DisputeResolution  # APQC 5.3 (customer complaints)
Marketplace.executes.TrustAndSafety  # APQC 9.7 (compliance)
```

### AgenticServicesBusiness Processes
```graphdl
AgenticServicesBusiness.executes.AgentDevelopment  # APQC 2.1 (product development)
AgenticServicesBusiness.executes.PromptOptimization  # APQC 2.2 (product enhancement)
AgenticServicesBusiness.executes.ContinuousLearning  # APQC 7.3 (IT continuous improvement)
AgenticServicesBusiness.executes.HumanOversight  # APQC 9.7 (quality assurance)
AgenticServicesBusiness.executes.EthicsMonitoring  # APQC 9.7 (compliance)
AgenticServicesBusiness.executes.ServiceDelivery  # APQC 4.0 (automated)
```

## Products & Services Mapping

### LocalBusiness Products/Services
```graphdl
LocalBusiness.whenIndustry.Retail.offers.ConsumerProducts
LocalBusiness.whenIndustry.FoodService.offers.PreparedFood
LocalBusiness.whenIndustry.FoodService.offers.BeverageService
LocalBusiness.whenIndustry.PersonalCare.offers.HaircuttingService
LocalBusiness.whenIndustry.PersonalCare.offers.NailCareService
LocalBusiness.whenIndustry.AutomotiveServices.offers.VehicleRepair
```

### SaaS Products
```graphdl
SaaS.offers.SoftwareSubscription
SaaS.offers.CloudHostedApplication
SaaS.offers.MobileApp
SaaS.offers.WebApp
SaaS.offers.IntegrationAPI
SaaS.offers.ProfessionalServices
SaaS.offers.TechnicalSupport
```

### APIBusiness Products
```graphdl
APIBusiness.offers.APIEndpoints
APIBusiness.offers.SDK
APIBusiness.offers.Webhook
APIBusiness.offers.Documentation
APIBusiness.offers.SandboxEnvironment
APIBusiness.offers.DeveloperSupport
```

### Marketplace Services
```graphdl
Marketplace.offers.PlatformAccess
Marketplace.offers.SearchAndDiscovery
Marketplace.offers.TransactionFacilitation
Marketplace.offers.PaymentProcessing
Marketplace.offers.DisputeResolution
Marketplace.offers.TrustAndSafety
```

### DatasetBusiness Products
```graphdl
DatasetBusiness.offers.Dataset
DatasetBusiness.offers.DataFeed
DatasetBusiness.offers.DataAPI
DatasetBusiness.offers.DataVisualization
DatasetBusiness.offers.CustomDataRequest
DatasetBusiness.offers.DataConsulting
```

### AgenticServicesBusiness Services
```graphdl
AgenticServicesBusiness.offers.AIAgent
AgenticServicesBusiness.offers.AutomatedService
AgenticServicesBusiness.offers.CustomerSupport
AgenticServicesBusiness.offers.ContentGeneration
AgenticServicesBusiness.offers.DataAnalysis
AgenticServicesBusiness.offers.LegalResearch
AgenticServicesBusiness.offers.SalesDevelopment
```

## Metrics & KPIs

### Universal Business Metrics
```graphdl
Business.tracks.Revenue
Business.tracks.GrossMargin
Business.tracks.NetIncome
Business.tracks.CashFlow
Business.tracks.EmployeeCount
Business.tracks.CustomerCount

Revenue.hasFormula."TotalRevenue = Sum(RevenueStreams)"
GrossMargin.hasFormula."GrossMargin = (Revenue - COGS) / Revenue"
```

### LocalBusiness Metrics
```graphdl
LocalBusiness.tracks.FootTraffic
LocalBusiness.tracks.AverageTransactionValue
LocalBusiness.tracks.CustomerRetentionRate
LocalBusiness.tracks.InventoryTurnover
LocalBusiness.tracks.LaborCostPercentage
```

### SaaS Metrics
```graphdl
SaaS.tracks.MRR
SaaS.tracks.ARR
SaaS.tracks.CAC
SaaS.tracks.LTV
SaaS.tracks.ChurnRate
SaaS.tracks.NetRevenueRetention
SaaS.tracks.ActivationRate
SaaS.tracks.TimeToValue

MRR.hasFormula."MRR = Sum(MonthlySubscriptions)"
ARR.hasFormula."ARR = MRR * 12"
ChurnRate.hasFormula."ChurnRate = LostCustomers / TotalCustomers"
NetRevenueRetention.hasFormula."NRR = (StartingARR + Expansion - Churn) / StartingARR"
```

### Marketplace Metrics
```graphdl
Marketplace.tracks.GMV
Marketplace.tracks.TakeRate
Marketplace.tracks.ActiveBuyers
Marketplace.tracks.ActiveSellers
Marketplace.tracks.Liquidity
Marketplace.tracks.RepeatPurchaseRate
Marketplace.tracks.TimeToFirstTransaction

GMV.hasFormula."GMV = Sum(TransactionValues)"
TakeRate.hasFormula."TakeRate = Revenue / GMV"
Liquidity.hasFormula."Liquidity = SuccessfulMatches / TotalListings"
```

### APIBusiness Metrics
```graphdl
APIBusiness.tracks.APICallsPerMonth
APIBusiness.tracks.ActiveDevelopers
APIBusiness.tracks.TimeToFirstAPICall
APIBusiness.tracks.DeveloperActivationRate
APIBusiness.tracks.APILatency
APIBusiness.tracks.APIUptime
APIBusiness.tracks.RevenuePerAPICall
```

### AgenticServicesBusiness Metrics
```graphdl
AgenticServicesBusiness.tracks.TaskCompletionRate
AgenticServicesBusiness.tracks.AccuracyScore
AgenticServicesBusiness.tracks.TimeToCompletion
AgenticServicesBusiness.tracks.CustomerSatisfaction
AgenticServicesBusiness.tracks.CostPerTask
AgenticServicesBusiness.tracks.HumanEscalationRate
AgenticServicesBusiness.tracks.AgentImprovementRate
AgenticServicesBusiness.tracks.RevenuePerAgent

CostPerTask.hasFormula."CostPerTask = (InfrastructureCost + HumanOversightCost) / TotalTasks"
HumanEscalationRate.hasFormula."EscalationRate = EscalatedTasks / TotalTasks"
```

## Lifecycle & Evolution

### Startup Stages
```graphdl
Startup.hasStage.PreSeed
Startup.hasStage.Seed
Startup.hasStage.SeriesA
Startup.hasStage.SeriesB
Startup.hasStage.SeriesC

PreSeed.evolves.Seed
Seed.evolves.SeriesA
SeriesA.evolves.SeriesB
SeriesB.evolves.SeriesC

Startup.atStage.Seed.hasFunding.500000
Startup.atStage.SeriesA.hasFunding.5000000
Startup.atStage.SeriesB.hasFunding.25000000
Startup.atStage.SeriesC.hasFunding.100000000

Startup.atStage.Seed.hasEmployees.5-20
Startup.atStage.SeriesA.hasEmployees.20-50
Startup.atStage.SeriesB.hasEmployees.50-150
Startup.atStage.SeriesC.hasEmployees.150-500
```

### Business Transformations
```graphdl
Startup.canBecomeenterprise
LocalBusiness.canExpandTo.MultiLocation
ServicesBusiness.canTransformTo.AgenticServicesBusiness
SaaS.canAddModel.Marketplace
SaaS.canAddModel.API Business

# Example transformations
Stripe.wasType.Startup
Stripe.nowType.Enterprise
Stripe.primaryModel.APIBusiness
Stripe.secondaryModel.SaaS

Airbnb.wasType.Startup
Airbnb.nowType.Enterprise
Airbnb.primaryModel.Marketplace
```

## Implementation Plan

### Phase 1: Core Business Types (Weeks 1-2)
1. Define base Business entity with universal properties
2. Create LocalBusiness, OnlineBusiness, Startup, Enterprise types
3. Map universal departments, processes (APQC), and metrics
4. Connect to existing Industries (NAICS), Occupations (O*NET)

### Phase 2: Online Business Subtypes (Weeks 3-4)
1. Create SaaS, APIBusiness, Marketplace, DatasetBusiness, DirectoryBusiness types
2. Define type-specific departments and processes
3. Map type-specific occupations and metrics
4. Create subtype relationships and hierarchies

### Phase 3: Services Models (Week 5)
1. Create ServicesBusiness (traditional) type
2. Create AgenticServicesBusiness type
3. Map comparison relationships between human and AI services
4. Define transformation pathways

### Phase 4: Integration & Relationships (Week 6)
1. Connect business types to Products.tsv and Services.tsv
2. Map all business processes to APQC framework
3. Connect all occupations to O*NET codes
4. Create industry-business type matrices

### Phase 5: Lifecycle & Evolution (Week 7)
1. Model startup funding stages
2. Create business transformation pathways
3. Define evolution rules and constraints
4. Add temporal relationships

### Phase 6: Validation & Examples (Week 8)
1. Create example businesses for each type
2. Validate all triple relationships
3. Test queries across the knowledge graph
4. Document usage patterns

## Technical Implementation

### File Structure
```
.data/
  Business.Types.tsv
  Business.Departments.tsv
  Business.Processes.tsv
  Business.Metrics.tsv
  Business.Relationships.tsv
  Business.Examples.tsv

.source/Business/
  Business.Taxonomy.tsv
  Department.Definitions.tsv
  Process.Mappings.tsv  (to APQC)
  Occupation.Mappings.tsv  (to O*NET)
  Industry.Mappings.tsv  (to NAICS)
  Product.Mappings.tsv  (to Products/Services)
```

### GraphDL Schema
Create a comprehensive schema defining:
- Entity types (Business, Department, Process, Metric, etc.)
- Relationship types (hasDepartment, executes, tracks, employs, etc.)
- Cardinality constraints
- Type hierarchies
- Required vs optional properties

### Query Patterns
Enable queries like:
- "What departments does a SaaS business have?"
- "Which processes are executed by Customer Success in SaaS?"
- "What occupations are employed by Marketplace businesses?"
- "Which NAICS industries operate as LocalBusinesses?"
- "What metrics does an AgenticServicesBusiness track?"
- "How does a Startup evolve from Seed to Series A?"

## Key Insights from Research

### 1. Naming Consensus
- **"AgenticServicesBusiness"** chosen as the primary term for AI-powered services
- Alternatives: "AI-Powered Services", "Services-as-Software", "Autonomous Services"

### 2. Critical Differentiators

#### LocalBusiness
- Physical location dependency
- Geographic service area
- Direct customer relationships
- Industry-specific variations

#### OnlineBusiness
- Digital-first infrastructure
- Global accessibility
- Data-driven decision making
- Scalable architecture

#### Startup
- Growth > profitability focus
- Funding stage progression
- Flat → hierarchical evolution
- Role fluidity

#### Enterprise
- Formal governance structures
- Multiple business units
- Specialized functions
- Complex hierarchy

#### SaaS
- Customer Success as differentiator
- Subscription economics
- Retention > acquisition initially
- Continuous deployment

#### APIBusiness
- Developer-as-customer
- Developer Relations critical
- Usage-based pricing
- API-first design

#### Marketplace
- Two-sided dynamics
- Liquidity as key metric
- Trust & Safety critical
- Chicken-and-egg problem

#### DatasetBusiness
- Data quality paramount
- Privacy/compliance critical
- API + subscription hybrid
- Continuous data refresh

#### DirectoryBusiness
- SEO as growth engine
- Advertising revenue model
- Review moderation
- Listing quality

#### ServicesBusiness
- Utilization as constraint
- People-dependent scaling
- Billable hours model
- Expertise as product

#### AgenticServicesBusiness
- Software economics for services
- Human-in-the-loop hybrid
- Cost 70-90% lower than human
- Ethics and safety critical

### 3. Common Patterns

**Department Evolution**: All businesses start with founders/generalists and specialize over time

**Process Maturity**: Businesses evolve from ad-hoc to formal processes as they scale

**Metric Sophistication**: Metrics become more sophisticated and nuanced at scale

**Technology Dependency**: OnlineBusiness types are fundamentally technology-dependent

**Customer Centricity**: Modern businesses (especially SaaS, Marketplace, Agentic) are more customer-centric than traditional models

## Next Steps

1. **Review and Validate**: Review this synthesis with stakeholders
2. **Schema Design**: Create the formal GraphDL schema
3. **Script Development**: Build data generation scripts for each business type
4. **Integration**: Connect to existing data (Industries, Occupations, Processes, Products, Services)
5. **Examples**: Create real-world business examples for validation
6. **Documentation**: Update GENERATED_DATA.md with business model additions
7. **Testing**: Create test suite for business model queries

---

This synthesis provides the foundation for a comprehensive Business-as-Code semantic model that can represent any business type with deep semantic richness, connecting organizational structure, processes, occupations, products, services, metrics, and industry contexts into a unified knowledge graph.
