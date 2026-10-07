import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { MainLayout } from '../layouts/MainLayout';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { HealthCheckPage } from '../pages/HealthCheckPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { RolesManagementPage } from '../pages/RolesManagementPage';
import { SessionExpiredPage } from '../pages/SessionExpiredPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Admin Foundation Pages
import { UsersPage } from '../pages/admin/UsersPage';
import { CompanyProfilePage } from '../pages/admin/CompanyProfilePage';
import { BranchesWarehousesPage } from '../pages/admin/BranchesWarehousesPage';
import { NumberSeriesPage } from '../pages/admin/NumberSeriesPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';

// Product Management Pages
import { ProductsListPage } from '../pages/products/ProductsListPage';
import { CategoriesBrandsPage } from '../pages/products/CategoriesBrandsPage';
import { PriceListsPage } from '../pages/products/PriceListsPage';
import { BomPage } from '../pages/products/BomPage';

// CRM / Customer Pages
import { CustomersListPage } from '../pages/customers/CustomersListPage';
import { Customer360Page } from '../pages/customers/Customer360Page';

// Lead & Follow-up Pages
import { LeadsListPage } from '../pages/leads/LeadsListPage';
import { LeadKanbanPage } from '../pages/leads/LeadKanbanPage';
import { FollowupsPage } from '../pages/leads/FollowupsPage';

// Quotation & Retail POS Pages
import { QuotationsListPage } from '../pages/sales/QuotationsListPage';
import { QuotationBuilderPage } from '../pages/sales/QuotationBuilderPage';
import { QuotationDetailPage } from '../pages/sales/QuotationDetailPage';
import { ChannelPartnersPage } from '../pages/sales/ChannelPartnersPage';
import { RetailPosPage } from '../pages/sales/RetailPosPage';

// Sales Orders Pages
import { SalesOrdersListPage } from '../pages/sales/orders/SalesOrdersListPage';
import { CreateSalesOrderPage } from '../pages/sales/orders/CreateSalesOrderPage';
import { OrderDetailPage } from '../pages/sales/orders/OrderDetailPage';
import { PendingOrdersPage } from '../pages/sales/orders/PendingOrdersPage';
import { OrderProcessingPage } from '../pages/sales/orders/OrderProcessingPage';

// Inventory (Module 11)
import { InventoryDashboardPage } from '../pages/inventory/InventoryDashboardPage';
import { StockSummaryPage } from '../pages/inventory/StockSummaryPage';
import { StockLedgerPage } from '../pages/inventory/StockLedgerPage';
import { StockTransfersPage } from '../pages/inventory/StockTransfersPage';
import { StockAdjustmentsPage } from '../pages/inventory/StockAdjustmentsPage';
import { BatchesPage } from '../pages/inventory/BatchesPage';
import { StockReservationsPage } from '../pages/inventory/StockReservationsPage';

// Purchase (Module 08)
import { PurchaseDashboardPage } from '../pages/purchase/PurchaseDashboardPage';
import { SuppliersListPage } from '../pages/purchase/SuppliersListPage';
import { PurchaseRequisitionsPage } from '../pages/purchase/PurchaseRequisitionsPage';
import { PurchaseOrdersListPage } from '../pages/purchase/PurchaseOrdersListPage';
import { PurchaseOrderDetailPage } from '../pages/purchase/PurchaseOrderDetailPage';
import { GrnListPage } from '../pages/purchase/GrnListPage';
import { GrnDetailPage } from '../pages/purchase/GrnDetailPage';
import { PurchaseInvoicesPage } from '../pages/purchase/PurchaseInvoicesPage';
import { PurchaseReturnsPage } from '../pages/purchase/PurchaseReturnsPage';

// Production (Module 09)
import { ProductionDashboardPage } from '../pages/production/ProductionDashboardPage';
import { WorkOrdersListPage } from '../pages/production/WorkOrdersListPage';
import { WorkOrderDetailPage } from '../pages/production/WorkOrderDetailPage';
import { MaterialAvailabilityPage } from '../pages/production/MaterialAvailabilityPage';
import { MaterialIssuePage } from '../pages/production/MaterialIssuePage';
import { ProductionLogsPage } from '../pages/production/ProductionLogsPage';
import { ScrapRecordsPage } from '../pages/production/ScrapRecordsPage';

// Quality Control (QC)
import { QcDashboardPage } from '../pages/qc/QcDashboardPage';
import { QcInspectionsListPage } from '../pages/qc/QcInspectionsListPage';
import { QcParametersPage } from '../pages/qc/QcParametersPage';
import { QcTemplatesPage } from '../pages/qc/QcTemplatesPage';
import { ReworkScrapPage } from '../pages/qc/ReworkScrapPage';

// Dispatch (Module 10)
import { DispatchListPage } from '../pages/dispatch/DispatchListPage';
import { DispatchDetailPage } from '../pages/dispatch/DispatchDetailPage';
import { DeliveryTrackingPage } from '../pages/dispatch/DeliveryTrackingPage';
import { TransportersPage } from '../pages/dispatch/TransportersPage';
import { SalesReturnsPage } from '../pages/dispatch/SalesReturnsPage';

// Invoices (Module 12)
import { InvoiceDashboardPage } from '../pages/invoices/InvoiceDashboardPage';
import { InvoiceListPage } from '../pages/invoices/InvoiceListPage';
import { InvoiceDetailPage } from '../pages/invoices/InvoiceDetailPage';
import { InvoicePrintPage } from '../pages/invoices/InvoicePrintPage';
import { CreditDebitNotesPage } from '../pages/invoices/CreditDebitNotesPage';
import { InvoiceAgeingPage } from '../pages/invoices/InvoiceAgeingPage';

// GST / Tax (Module 13)
import { GstDashboardPage } from '../pages/tax/GstDashboardPage';
import { Gstr1Page } from '../pages/tax/Gstr1Page';
import { Gstr3bPage } from '../pages/tax/Gstr3bPage';
import { ItcRegisterPage } from '../pages/tax/ItcRegisterPage';
import { TaxLedgerPage } from '../pages/tax/TaxLedgerPage';
import { TaxRatesMasterPage } from '../pages/tax/TaxRatesMasterPage';

// Finance & Accounts (Module 14)
import { FinanceDashboardPage } from '../pages/finance/FinanceDashboardPage';
import { ChartOfAccountsPage } from '../pages/finance/ChartOfAccountsPage';
import { JournalEntriesPage } from '../pages/finance/JournalEntriesPage';
import { ReceiptsPage } from '../pages/finance/ReceiptsPage';
import { PaymentsPage } from '../pages/finance/PaymentsPage';
import { ReceivablesPayablesPage } from '../pages/finance/ReceivablesPayablesPage';
import { BankAccountsPage } from '../pages/finance/BankAccountsPage';
import { FinancialStatementsPage } from '../pages/finance/FinancialStatementsPage';

// Expenses & Owner Capital (Modules 15 & 16)
import { ExpensesPage } from '../pages/expenses/ExpensesPage';
import { BudgetsPage } from '../pages/expenses/BudgetsPage';
import { OwnerCapitalPage } from '../pages/owner/OwnerCapitalPage';
import { SafeToWithdrawPage } from '../pages/owner/SafeToWithdrawPage';

// Customer Service & Support (Module 17)
import { TicketsListPage } from '../pages/support/TicketsListPage';
import { CapaPage } from '../pages/support/CapaPage';
import { CustomerFeedbackPage } from '../pages/support/CustomerFeedbackPage';

// Commercial Intelligence & Marketing (Modules 04, 05, 06)
import { RepeatOrdersPage } from '../pages/intelligence/RepeatOrdersPage';
import { UpsellPage } from '../pages/intelligence/UpsellPage';
import { MarketingCampaignsPage } from '../pages/marketing/MarketingCampaignsPage';

// Performance, Profitability & Forecasting (Modules 18, 19, 20, 21)
import { TargetsPage } from '../pages/performance/TargetsPage';
import { LeaderboardPage } from '../pages/performance/LeaderboardPage';
import { ProfitabilityPage } from '../pages/profitability/ProfitabilityPage';
import { ForecastsPage } from '../pages/profitability/ForecastsPage';

// Executive Cockpits (Modules 22, 23, 24)
import { CeoCockpitPage } from '../pages/executive/CeoCockpitPage';
import { FounderDecisionsPage } from '../pages/executive/FounderDecisionsPage';
import { AssistantAgendaPage } from '../pages/executive/AssistantAgendaPage';

// Productivity & Collaboration (Modules 25, 26, 27)
import { MeetingsPage } from '../pages/productivity/MeetingsPage';
import { TasksKanbanPage } from '../pages/productivity/TasksKanbanPage';
import { CalendarPage } from '../pages/productivity/CalendarPage';

// Organization Foundation
import { OrganizationTreePage } from '../pages/organization/OrganizationTreePage';
import { DepartmentsPage } from '../pages/organization/DepartmentsPage';
import { PositionsPage } from '../pages/organization/PositionsPage';

// Human Resources (HR) Suite
import { HrDashboardPage } from '../pages/hr/HrDashboardPage';
import { EmployeesListPage } from '../pages/hr/EmployeesListPage';
import { EmployeeFormPage } from '../pages/hr/EmployeeFormPage';
import { EmployeeDetailPage } from '../pages/hr/EmployeeDetailPage';
import { RecruitmentPage } from '../pages/hr/RecruitmentPage';
import { JobOpeningsPage } from '../pages/hr/JobOpeningsPage';
import { CandidatesPage } from '../pages/hr/CandidatesPage';
import { InterviewsPage } from '../pages/hr/InterviewsPage';
import { OnboardingPage } from '../pages/hr/OnboardingPage';
import { AttendancePage } from '../pages/hr/AttendancePage';
import { LeavePage } from '../pages/hr/LeavePage';
import { PayrollPage } from '../pages/hr/PayrollPage';
import { TrainingPage } from '../pages/hr/TrainingPage';
import { PerformancePage } from '../pages/hr/PerformancePage';
import { GoalsPage } from '../pages/hr/GoalsPage';
import { EngagementPage } from '../pages/hr/EngagementPage';
import { PoliciesPage } from '../pages/hr/PoliciesPage';
import { DocumentsPage } from '../pages/hr/DocumentsPage';

// Technology Suite
import { TechDashboardPage } from '../pages/technology/TechDashboardPage';
import { IntegrationsPage } from '../pages/technology/IntegrationsPage';
import { AutomationPage } from '../pages/technology/AutomationPage';
import { ProcessAutomationPage } from '../pages/technology/ProcessAutomationPage';
import { WhatsAppAutoPage } from '../pages/technology/WhatsAppAutoPage';
import { AiTechPage } from '../pages/technology/AiTechPage';
import { BiReportsPage } from '../pages/technology/BiReportsPage';
import { CustomerPortalPage } from '../pages/technology/CustomerPortalPage';
import { ErpMonitoringPage } from '../pages/technology/ErpMonitoringPage';
import { CrmTechPage } from '../pages/technology/CrmTechPage';
import { SystemHealthTechPage } from '../pages/technology/SystemHealthTechPage';

// R&D / NPD Suite
import { RndDashboardPage } from '../pages/rnd/RndDashboardPage';
import { MarketResearchPage } from '../pages/rnd/MarketResearchPage';
import { CompetitorsPage } from '../pages/rnd/CompetitorsPage';
import { OpportunitiesPage } from '../pages/rnd/OpportunitiesPage';
import { ProductDevelopmentPage } from '../pages/rnd/ProductDevelopmentPage';
import { SamplesPage } from '../pages/rnd/SamplesPage';
import { TestingPage } from '../pages/rnd/TestingPage';
import { ImprovementsPage } from '../pages/rnd/ImprovementsPage';
import { CustomerResearchPage } from '../pages/rnd/CustomerResearchPage';
import { FeedbackPage } from '../pages/rnd/FeedbackPage';
import { ProblemSolvingPage } from '../pages/rnd/ProblemSolvingPage';

// Operations Suite
import { OperationsDashboardPage } from '../pages/operations/OperationsDashboardPage';
import { PrintingJobsPage } from '../pages/operations/PrintingJobsPage';
import { EmbroideryJobsPage } from '../pages/operations/EmbroideryJobsPage';
import { PackingJobsPage } from '../pages/operations/PackingJobsPage';
import { LogisticsJobsPage } from '../pages/operations/LogisticsJobsPage';
import { SupplyChainPage } from '../pages/operations/SupplyChainPage';
import { MerchandisingPage } from '../pages/operations/MerchandisingPage';
import { VendorManagementPage } from '../pages/operations/VendorManagementPage';

// Commercial Sales Extensions
import { B2BSalesPage } from '../pages/sales/B2BSalesPage';
import { ChannelSalesPage } from '../pages/sales/ChannelSalesPage';
import { RetailSalesPage } from '../pages/sales/RetailSalesPage';
import { InsideSalesPage } from '../pages/sales/InsideSalesPage';
import { KeyAccountsPage } from '../pages/sales/KeyAccountsPage';

// Marketing Extensions
import { BrandPage } from '../pages/marketing/BrandPage';
import { DigitalMarketingPage } from '../pages/marketing/DigitalMarketingPage';
import { PerformanceMarketingPage } from '../pages/marketing/PerformanceMarketingPage';
import { ContentMarketingPage } from '../pages/marketing/ContentMarketingPage';
import { SocialMediaMarketingPage } from '../pages/marketing/SocialMediaMarketingPage';
import { PhotoVideoPage } from '../pages/marketing/PhotoVideoPage';
import { PhysicalMarketingPage } from '../pages/marketing/PhysicalMarketingPage';
import { CataloguePage } from '../pages/marketing/CataloguePage';
import { CorporateBrandingPage } from '../pages/marketing/CorporateBrandingPage';

// Finance Extensions
import { CostingPage } from '../pages/finance/CostingPage';
import { BudgetingPage } from '../pages/finance/BudgetingPage';
import { CashFlowProjectionPage } from '../pages/finance/CashFlowProjectionPage';
import { MisReportingPage } from '../pages/finance/MisReportingPage';

// Executive Cockpits (9 C-Level Cockpits)
import { FounderDashboardPage } from '../pages/dashboards/FounderDashboardPage';
import { CeoDashboardPage } from '../pages/dashboards/CeoDashboardPage';
import { CroDashboardPage } from '../pages/dashboards/CroDashboardPage';
import { CmoDashboardPage } from '../pages/dashboards/CmoDashboardPage';
import { CooDashboardPage } from '../pages/dashboards/CooDashboardPage';
import { CfoDashboardPage } from '../pages/dashboards/CfoDashboardPage';
import { ChroDashboardPage } from '../pages/dashboards/ChroDashboardPage';
import { CtoDashboardPage } from '../pages/dashboards/CtoDashboardPage';
import { RndExecutiveDashboardPage } from '../pages/dashboards/RndExecutiveDashboardPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Guest Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Session Expired Notice Route */}
        <Route path="/session-expired" element={<SessionExpiredPage />} />

        {/* Dedicated Full-Screen Print Canvas (Bypasses MainLayout sidebar and header) */}
        <Route
          path="/invoices/:id/print"
          element={
            <ProtectedRoute>
              <PermissionGuard module="finance" action="can_view">
                <InvoicePrintPage />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected ERP Workspace Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="health" element={<HealthCheckPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />

          {/* Module 00: Admin Foundation */}
          <Route
            path="roles"
            element={
              <PermissionGuard module="roles" action="can_view">
                <RolesManagementPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/users"
            element={
              <PermissionGuard module="users" action="can_view">
                <UsersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/company"
            element={
              <PermissionGuard module="settings" action="can_view">
                <CompanyProfilePage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/locations"
            element={
              <PermissionGuard module="settings" action="can_view">
                <BranchesWarehousesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/number-series"
            element={
              <PermissionGuard module="settings" action="can_view">
                <NumberSeriesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <PermissionGuard module="settings" action="can_view">
                <AuditLogsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/settings"
            element={
              <PermissionGuard module="settings" action="can_view">
                <SystemSettingsPage />
              </PermissionGuard>
            }
          />

          {/* Module 07: Product Management */}
          <Route
            path="products"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <ProductsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="products/:id"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <ProductsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="products/masters"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <CategoriesBrandsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="products/price-lists"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <PriceListsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="products/bom"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <BomPage />
              </PermissionGuard>
            }
          />

          {/* Module 02: CRM / Customer Management */}
          <Route
            path="customers"
            element={
              <PermissionGuard module="sales" action="can_view">
                <CustomersListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="customers/:id"
            element={
              <PermissionGuard module="sales" action="can_view">
                <Customer360Page />
              </PermissionGuard>
            }
          />
          <Route
            path="customers/:id/360"
            element={
              <PermissionGuard module="sales" action="can_view">
                <Customer360Page />
              </PermissionGuard>
            }
          />

          {/* Module 01: Lead & Follow-up Management */}
          <Route
            path="leads"
            element={
              <PermissionGuard module="marketing" action="can_view">
                <LeadsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="leads/kanban"
            element={
              <PermissionGuard module="marketing" action="can_view">
                <LeadKanbanPage />
              </PermissionGuard>
            }
          />
          <Route
            path="leads/followups"
            element={
              <PermissionGuard module="marketing" action="can_view">
                <FollowupsPage />
              </PermissionGuard>
            }
          />

          {/* Module 03: Sales Quotations & Retail POS */}
          <Route
            path="sales/quotations"
            element={
              <PermissionGuard module="sales" action="can_view">
                <QuotationsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/quotations/new"
            element={
              <PermissionGuard module="sales" action="can_create">
                <QuotationBuilderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/quotations/create"
            element={
              <PermissionGuard module="sales" action="can_create">
                <QuotationBuilderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/quotations/:id/edit"
            element={
              <PermissionGuard module="sales" action="can_edit">
                <QuotationBuilderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/quotations/:id"
            element={
              <PermissionGuard module="sales" action="can_view">
                <QuotationDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/channel-partners"
            element={
              <PermissionGuard module="sales" action="can_view">
                <ChannelPartnersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/pos"
            element={
              <PermissionGuard module="sales" action="can_create">
                <RetailPosPage />
              </PermissionGuard>
            }
          />

          {/* Sales Orders */}
          <Route
            path="sales/orders"
            element={
              <PermissionGuard module="sales" action="can_view">
                <SalesOrdersListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/orders/new"
            element={
              <PermissionGuard module="sales" action="can_create">
                <CreateSalesOrderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/orders/create"
            element={
              <PermissionGuard module="sales" action="can_create">
                <CreateSalesOrderPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/orders/pending"
            element={
              <PermissionGuard module="sales" action="can_view">
                <PendingOrdersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/orders/processing"
            element={
              <PermissionGuard module="sales" action="can_view">
                <OrderProcessingPage />
              </PermissionGuard>
            }
          />
          <Route
            path="sales/orders/:id"
            element={
              <PermissionGuard module="sales" action="can_view">
                <OrderDetailPage />
              </PermissionGuard>
            }
          />

          {/* Module 11: Inventory */}
          <Route
            path="inventory"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <InventoryDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/summary"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <StockSummaryPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/ledger"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <StockLedgerPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/transfers"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <StockTransfersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/adjustments"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <StockAdjustmentsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/batches"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <BatchesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="inventory/reservations"
            element={
              <PermissionGuard module="inventory" action="can_view">
                <StockReservationsPage />
              </PermissionGuard>
            }
          />

          {/* Module 08: Procurement / Purchase */}
          <Route
            path="purchase"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/suppliers"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <SuppliersListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/requisitions"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseRequisitionsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/orders"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseOrdersListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/orders/:id"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseOrderDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/grn"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <GrnListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/grn/:id"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <GrnDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/invoices"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseInvoicesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="purchase/returns"
            element={
              <PermissionGuard module="procurement" action="can_view">
                <PurchaseReturnsPage />
              </PermissionGuard>
            }
          />

          {/* Module 09: Production */}
          <Route
            path="production"
            element={
              <PermissionGuard module="production" action="can_view">
                <ProductionDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/work-orders"
            element={
              <PermissionGuard module="production" action="can_view">
                <WorkOrdersListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/work-orders/:id"
            element={
              <PermissionGuard module="production" action="can_view">
                <WorkOrderDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/material-check"
            element={
              <PermissionGuard module="production" action="can_view">
                <MaterialAvailabilityPage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/material-issue"
            element={
              <PermissionGuard module="production" action="can_view">
                <MaterialIssuePage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/logs"
            element={
              <PermissionGuard module="production" action="can_view">
                <ProductionLogsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="production/scrap"
            element={
              <PermissionGuard module="production" action="can_view">
                <ScrapRecordsPage />
              </PermissionGuard>
            }
          />

          {/* Quality Control (QC) */}
          <Route
            path="qc"
            element={
              <PermissionGuard module="quality" action="can_view">
                <QcDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="qc/inspections"
            element={
              <PermissionGuard module="quality" action="can_view">
                <QcInspectionsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="qc/incoming"
            element={
              <PermissionGuard module="quality" action="can_view">
                <QcInspectionsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="qc/parameters"
            element={
              <PermissionGuard module="quality" action="can_view">
                <QcParametersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="qc/templates"
            element={
              <PermissionGuard module="quality" action="can_view">
                <QcTemplatesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="qc/rework"
            element={
              <PermissionGuard module="quality" action="can_view">
                <ReworkScrapPage />
              </PermissionGuard>
            }
          />

          {/* Module 10: Dispatch & Logistics */}
          <Route
            path="dispatch"
            element={
              <PermissionGuard module="sales" action="can_view">
                <DispatchListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="dispatch/tracking"
            element={
              <PermissionGuard module="sales" action="can_view">
                <DeliveryTrackingPage />
              </PermissionGuard>
            }
          />
          <Route
            path="dispatch/transporters"
            element={
              <PermissionGuard module="sales" action="can_view">
                <TransportersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="dispatch/returns"
            element={
              <PermissionGuard module="sales" action="can_view">
                <SalesReturnsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="dispatch/:id"
            element={
              <PermissionGuard module="sales" action="can_view">
                <DispatchDetailPage />
              </PermissionGuard>
            }
          />

          {/* Module 12: Invoicing & Billing */}
          <Route
            path="invoices"
            element={
              <PermissionGuard module="finance" action="can_view">
                <InvoiceDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="invoices/list"
            element={
              <PermissionGuard module="finance" action="can_view">
                <InvoiceListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="invoices/notes"
            element={
              <PermissionGuard module="finance" action="can_view">
                <CreditDebitNotesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="invoices/ageing"
            element={
              <PermissionGuard module="finance" action="can_view">
                <InvoiceAgeingPage />
              </PermissionGuard>
            }
          />
          <Route
            path="invoices/:id"
            element={
              <PermissionGuard module="finance" action="can_view">
                <InvoiceDetailPage />
              </PermissionGuard>
            }
          />

          {/* Module 13: GST / Tax */}
          <Route
            path="tax"
            element={
              <PermissionGuard module="finance" action="can_view">
                <GstDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="tax/gstr-1"
            element={
              <PermissionGuard module="finance" action="can_view">
                <Gstr1Page />
              </PermissionGuard>
            }
          />
          <Route
            path="tax/gstr-3b"
            element={
              <PermissionGuard module="finance" action="can_view">
                <Gstr3bPage />
              </PermissionGuard>
            }
          />
          <Route
            path="tax/itc-register"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ItcRegisterPage />
              </PermissionGuard>
            }
          />
          <Route
            path="tax/ledger"
            element={
              <PermissionGuard module="finance" action="can_view">
                <TaxLedgerPage />
              </PermissionGuard>
            }
          />
          <Route
            path="tax/rates"
            element={
              <PermissionGuard module="finance" action="can_view">
                <TaxRatesMasterPage />
              </PermissionGuard>
            }
          />

          {/* Module 14: Finance & General Ledger */}
          <Route
            path="finance"
            element={
              <PermissionGuard module="finance" action="can_view">
                <FinanceDashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/chart-of-accounts"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ChartOfAccountsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/journals"
            element={
              <PermissionGuard module="finance" action="can_view">
                <JournalEntriesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/receipts"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ReceiptsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/payments"
            element={
              <PermissionGuard module="finance" action="can_view">
                <PaymentsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/receivables-payables"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ReceivablesPayablesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/bank-accounts"
            element={
              <PermissionGuard module="finance" action="can_view">
                <BankAccountsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="finance/statements"
            element={
              <PermissionGuard module="finance" action="can_view">
                <FinancialStatementsPage />
              </PermissionGuard>
            }
          />

          {/* Module 15: Expenses & Module 16: Owner Capital */}
          <Route
            path="expenses"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ExpensesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="expenses/budgets"
            element={
              <PermissionGuard module="finance" action="can_view">
                <BudgetsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="owner/capital"
            element={
              <PermissionGuard module="finance" action="can_view">
                <OwnerCapitalPage />
              </PermissionGuard>
            }
          />
          <Route
            path="owner/safe-to-withdraw"
            element={
              <PermissionGuard module="finance" action="can_view">
                <SafeToWithdrawPage />
              </PermissionGuard>
            }
          />

          {/* Module 17: Customer Service & CAPA */}
          <Route
            path="support/tickets"
            element={
              <PermissionGuard module="support" action="can_view">
                <TicketsListPage />
              </PermissionGuard>
            }
          />
          <Route
            path="support/capa"
            element={
              <PermissionGuard module="support" action="can_view">
                <CapaPage />
              </PermissionGuard>
            }
          />
          <Route
            path="support/feedback"
            element={
              <PermissionGuard module="support" action="can_view">
                <CustomerFeedbackPage />
              </PermissionGuard>
            }
          />

          {/* Modules 04 & 06: Commercial Intelligence */}
          <Route
            path="intelligence/repeat-orders"
            element={
              <PermissionGuard module="sales" action="can_view">
                <RepeatOrdersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="intelligence/upsell"
            element={
              <PermissionGuard module="sales" action="can_view">
                <UpsellPage />
              </PermissionGuard>
            }
          />

          {/* Module 05: Marketing & Attribution */}
          <Route
            path="marketing/campaigns"
            element={
              <PermissionGuard module="marketing" action="can_view">
                <MarketingCampaignsPage />
              </PermissionGuard>
            }
          />

          {/* Modules 20 & 21: Targets & Leaderboard */}
          <Route
            path="performance/targets"
            element={
              <PermissionGuard module="reports" action="can_view">
                <TargetsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="performance/leaderboard"
            element={
              <PermissionGuard module="reports" action="can_view">
                <LeaderboardPage />
              </PermissionGuard>
            }
          />

          {/* Modules 18 & 19: Profitability Engine & Forecasts */}
          <Route
            path="profitability"
            element={
              <PermissionGuard module="finance" action="can_view">
                <ProfitabilityPage />
              </PermissionGuard>
            }
          />
          <Route
            path="profitability/forecasts"
            element={
              <PermissionGuard module="reports" action="can_view">
                <ForecastsPage />
              </PermissionGuard>
            }
          />

          {/* Modules 22, 23, 24: Executive Cockpits */}
          <Route
            path="executive/ceo"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <CeoCockpitPage />
              </PermissionGuard>
            }
          />
          <Route
            path="executive/founder"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <FounderDecisionsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="executive/assistant"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <AssistantAgendaPage />
              </PermissionGuard>
            }
          />

          {/* Modules 25, 26, 27: Productivity & Collaboration */}
          <Route
            path="productivity/meetings"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <MeetingsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="productivity/tasks"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <TasksKanbanPage />
              </PermissionGuard>
            }
          />
          <Route
            path="productivity/calendar"
            element={
              <PermissionGuard module="dashboard" action="can_view">
                <CalendarPage />
              </PermissionGuard>
            }
          />

          {/* Organization Foundation */}
          <Route path="organization/tree" element={<PermissionGuard module="organization" action="can_view"><OrganizationTreePage /></PermissionGuard>} />
          <Route path="organization/departments" element={<PermissionGuard module="organization" action="can_view"><DepartmentsPage /></PermissionGuard>} />
          <Route path="organization/positions" element={<PermissionGuard module="organization" action="can_view"><PositionsPage /></PermissionGuard>} />

          {/* Human Resources (HR) Suite */}
          <Route path="hr/dashboard" element={<PermissionGuard module="hr" action="can_view"><HrDashboardPage /></PermissionGuard>} />
          <Route path="hr/employees" element={<PermissionGuard module="hr" action="can_view"><EmployeesListPage /></PermissionGuard>} />
          <Route path="hr/employees/new" element={<PermissionGuard module="hr" action="can_create"><EmployeeFormPage /></PermissionGuard>} />
          <Route path="hr/employees/create" element={<PermissionGuard module="hr" action="can_create"><EmployeeFormPage /></PermissionGuard>} />
          <Route path="hr/employees/:id/edit" element={<PermissionGuard module="hr" action="can_edit"><EmployeeFormPage /></PermissionGuard>} />
          <Route path="hr/employees/:id" element={<PermissionGuard module="hr" action="can_view"><EmployeeDetailPage /></PermissionGuard>} />
          <Route path="hr/recruitment" element={<PermissionGuard module="hr" action="can_view"><RecruitmentPage /></PermissionGuard>} />
          <Route path="hr/job-openings" element={<PermissionGuard module="hr" action="can_view"><JobOpeningsPage /></PermissionGuard>} />
          <Route path="hr/candidates" element={<PermissionGuard module="hr" action="can_view"><CandidatesPage /></PermissionGuard>} />
          <Route path="hr/interviews" element={<PermissionGuard module="hr" action="can_view"><InterviewsPage /></PermissionGuard>} />
          <Route path="hr/onboarding" element={<PermissionGuard module="hr" action="can_view"><OnboardingPage /></PermissionGuard>} />
          <Route path="hr/attendance" element={<PermissionGuard module="hr" action="can_view"><AttendancePage /></PermissionGuard>} />
          <Route path="hr/leave" element={<PermissionGuard module="hr" action="can_view"><LeavePage /></PermissionGuard>} />
          <Route path="hr/leaves" element={<PermissionGuard module="hr" action="can_view"><LeavePage /></PermissionGuard>} />
          <Route path="hr/payroll" element={<PermissionGuard module="hr" action="can_view"><PayrollPage /></PermissionGuard>} />
          <Route path="hr/training" element={<PermissionGuard module="hr" action="can_view"><TrainingPage /></PermissionGuard>} />
          <Route path="hr/performance" element={<PermissionGuard module="hr" action="can_view"><PerformancePage /></PermissionGuard>} />
          <Route path="hr/goals" element={<PermissionGuard module="hr" action="can_view"><GoalsPage /></PermissionGuard>} />
          <Route path="hr/engagement" element={<PermissionGuard module="hr" action="can_view"><EngagementPage /></PermissionGuard>} />
          <Route path="hr/policies" element={<PermissionGuard module="hr" action="can_view"><PoliciesPage /></PermissionGuard>} />
          <Route path="hr/documents" element={<PermissionGuard module="hr" action="can_view"><DocumentsPage /></PermissionGuard>} />

          {/* Technology & Automation Suite */}
          <Route path="technology/dashboard" element={<PermissionGuard module="technology" action="can_view"><TechDashboardPage /></PermissionGuard>} />
          <Route path="technology/integrations" element={<PermissionGuard module="technology" action="can_view"><IntegrationsPage /></PermissionGuard>} />
          <Route path="technology/automation" element={<PermissionGuard module="technology" action="can_view"><AutomationPage /></PermissionGuard>} />
          <Route path="technology/process-automation" element={<PermissionGuard module="technology" action="can_view"><ProcessAutomationPage /></PermissionGuard>} />
          <Route path="technology/whatsapp-auto" element={<PermissionGuard module="technology" action="can_view"><WhatsAppAutoPage /></PermissionGuard>} />
          <Route path="technology/ai-tech" element={<PermissionGuard module="technology" action="can_view"><AiTechPage /></PermissionGuard>} />
          <Route path="technology/bi-reports" element={<PermissionGuard module="technology" action="can_view"><BiReportsPage /></PermissionGuard>} />
          <Route path="technology/customer-portal" element={<PermissionGuard module="technology" action="can_view"><CustomerPortalPage /></PermissionGuard>} />
          <Route path="technology/erp-monitoring" element={<PermissionGuard module="technology" action="can_view"><ErpMonitoringPage /></PermissionGuard>} />
          <Route path="technology/crm-tech" element={<PermissionGuard module="technology" action="can_view"><CrmTechPage /></PermissionGuard>} />
          <Route path="technology/system-health" element={<PermissionGuard module="technology" action="can_view"><SystemHealthTechPage /></PermissionGuard>} />

          {/* R&D / NPD Suite */}
          <Route path="rnd/dashboard" element={<PermissionGuard module="rnd" action="can_view"><RndDashboardPage /></PermissionGuard>} />
          <Route path="rnd/market-research" element={<PermissionGuard module="rnd" action="can_view"><MarketResearchPage /></PermissionGuard>} />
          <Route path="rnd/competitors" element={<PermissionGuard module="rnd" action="can_view"><CompetitorsPage /></PermissionGuard>} />
          <Route path="rnd/opportunities" element={<PermissionGuard module="rnd" action="can_view"><OpportunitiesPage /></PermissionGuard>} />
          <Route path="rnd/product-development" element={<PermissionGuard module="rnd" action="can_view"><ProductDevelopmentPage /></PermissionGuard>} />
          <Route path="rnd/samples" element={<PermissionGuard module="rnd" action="can_view"><SamplesPage /></PermissionGuard>} />
          <Route path="rnd/testing" element={<PermissionGuard module="rnd" action="can_view"><TestingPage /></PermissionGuard>} />
          <Route path="rnd/improvements" element={<PermissionGuard module="rnd" action="can_view"><ImprovementsPage /></PermissionGuard>} />
          <Route path="rnd/customer-research" element={<PermissionGuard module="rnd" action="can_view"><CustomerResearchPage /></PermissionGuard>} />
          <Route path="rnd/feedback" element={<PermissionGuard module="rnd" action="can_view"><FeedbackPage /></PermissionGuard>} />
          <Route path="rnd/problem-solving" element={<PermissionGuard module="rnd" action="can_view"><ProblemSolvingPage /></PermissionGuard>} />

          {/* Operations Suite */}
          <Route path="operations/dashboard" element={<PermissionGuard module="operations" action="can_view"><OperationsDashboardPage /></PermissionGuard>} />
          <Route path="operations/supply-chain" element={<PermissionGuard module="operations" action="can_view"><SupplyChainPage /></PermissionGuard>} />
          <Route path="operations/merchandising" element={<PermissionGuard module="operations" action="can_view"><MerchandisingPage /></PermissionGuard>} />
          <Route path="operations/vendors" element={<PermissionGuard module="operations" action="can_view"><VendorManagementPage /></PermissionGuard>} />
          <Route path="operations/printing" element={<PermissionGuard module="operations" action="can_view"><PrintingJobsPage /></PermissionGuard>} />
          <Route path="operations/embroidery" element={<PermissionGuard module="operations" action="can_view"><EmbroideryJobsPage /></PermissionGuard>} />
          <Route path="operations/packing" element={<PermissionGuard module="operations" action="can_view"><PackingJobsPage /></PermissionGuard>} />
          <Route path="operations/logistics" element={<PermissionGuard module="operations" action="can_view"><LogisticsJobsPage /></PermissionGuard>} />

          {/* Commercial Sales Extensions */}
          <Route path="sales/b2b" element={<PermissionGuard module="sales" action="can_view"><B2BSalesPage /></PermissionGuard>} />
          <Route path="sales/channel" element={<PermissionGuard module="sales" action="can_view"><ChannelSalesPage /></PermissionGuard>} />
          <Route path="sales/retail" element={<PermissionGuard module="sales" action="can_view"><RetailSalesPage /></PermissionGuard>} />
          <Route path="sales/inside" element={<PermissionGuard module="sales" action="can_view"><InsideSalesPage /></PermissionGuard>} />
          <Route path="sales/key-accounts" element={<PermissionGuard module="sales" action="can_view"><KeyAccountsPage /></PermissionGuard>} />

          {/* Marketing Extensions */}
          <Route path="marketing/brand" element={<PermissionGuard module="marketing" action="can_view"><BrandPage /></PermissionGuard>} />
          <Route path="marketing/digital" element={<PermissionGuard module="marketing" action="can_view"><DigitalMarketingPage /></PermissionGuard>} />
          <Route path="marketing/performance" element={<PermissionGuard module="marketing" action="can_view"><PerformanceMarketingPage /></PermissionGuard>} />
          <Route path="marketing/content" element={<PermissionGuard module="marketing" action="can_view"><ContentMarketingPage /></PermissionGuard>} />
          <Route path="marketing/social" element={<PermissionGuard module="marketing" action="can_view"><SocialMediaMarketingPage /></PermissionGuard>} />
          <Route path="marketing/photo-video" element={<PermissionGuard module="marketing" action="can_view"><PhotoVideoPage /></PermissionGuard>} />
          <Route path="marketing/physical" element={<PermissionGuard module="marketing" action="can_view"><PhysicalMarketingPage /></PermissionGuard>} />
          <Route path="marketing/catalogues" element={<PermissionGuard module="marketing" action="can_view"><CataloguePage /></PermissionGuard>} />
          <Route path="marketing/corporate-branding" element={<PermissionGuard module="marketing" action="can_view"><CorporateBrandingPage /></PermissionGuard>} />

          {/* Finance Extensions */}
          <Route path="finance/costing" element={<PermissionGuard module="finance" action="can_view"><CostingPage /></PermissionGuard>} />
          <Route path="finance/budgeting" element={<PermissionGuard module="finance" action="can_view"><BudgetingPage /></PermissionGuard>} />
          <Route path="finance/cash-flow" element={<PermissionGuard module="finance" action="can_view"><CashFlowProjectionPage /></PermissionGuard>} />
          <Route path="finance/mis-reports" element={<PermissionGuard module="finance" action="can_view"><MisReportingPage /></PermissionGuard>} />

          {/* 9 Executive C-Level Cockpits */}
          <Route path="dashboards/founder" element={<PermissionGuard module="dashboards" action="can_view"><FounderDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/ceo" element={<PermissionGuard module="dashboards" action="can_view"><CeoDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/cro" element={<PermissionGuard module="dashboards" action="can_view"><CroDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/cmo" element={<PermissionGuard module="dashboards" action="can_view"><CmoDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/coo" element={<PermissionGuard module="dashboards" action="can_view"><CooDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/cfo" element={<PermissionGuard module="dashboards" action="can_view"><CfoDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/chro" element={<PermissionGuard module="dashboards" action="can_view"><ChroDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/cto" element={<PermissionGuard module="dashboards" action="can_view"><CtoDashboardPage /></PermissionGuard>} />
          <Route path="dashboards/rnd" element={<PermissionGuard module="dashboards" action="can_view"><RndExecutiveDashboardPage /></PermissionGuard>} />

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
