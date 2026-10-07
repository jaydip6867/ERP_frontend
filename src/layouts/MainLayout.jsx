import {
  Activity,
  Boxes,
  Briefcase,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Key,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
  Building2,
  GitBranch,
  Hash,
  History,
  Package,
  Tag,
  Calculator,
  Target,
  Kanban,
  Clock,
  FileText,
  ShoppingBag,
  ShoppingCart,
  Truck,
  PackageCheck,
  Factory,
  CheckSquare,
  Receipt,
  FileSpreadsheet,
  Percent,
  Landmark,
  Users2,
  Plus,
  Search,
  Wallet,
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  LifeBuoy,
  Zap,
  Award,
  Calendar as CalendarIcon,
  Trophy,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  X,
  Cpu,
  Microscope,
  Beaker,
  Printer,
  Scissors,
  Crown,
  BookOpen,
  Heart,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { authService } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';
import { NotificationBell } from '../components/common/NotificationBell';

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    module: 'dashboard',
  },

  // 1. Procurement & Purchasing
  {
    header: 'Procurement & Purchasing',
  },
  {
    name: 'Purchase Dashboard',
    path: '/purchase',
    icon: ShoppingBag,
    module: 'procurement',
  },
  {
    name: 'Suppliers Directory',
    path: '/purchase/suppliers',
    icon: Building2,
    module: 'procurement',
  },
  {
    name: 'Purchase Orders',
    path: '/purchase/orders',
    icon: FileText,
    module: 'procurement',
  },
  {
    name: 'Goods Receipts (GRN)',
    path: '/purchase/grn',
    icon: PackageCheck,
    module: 'procurement',
  },
  {
    name: 'Supplier Invoices',
    path: '/purchase/invoices',
    icon: Receipt,
    module: 'procurement',
  },

  // 2. Inventory & Operations
  {
    header: 'Inventory & Operations',
  },
  {
    name: 'Inventory Dashboard',
    path: '/inventory',
    icon: Boxes,
    module: 'inventory',
  },
  {
    name: 'Stock Summary',
    path: '/inventory/summary',
    icon: Layers,
    module: 'inventory',
  },
  {
    name: 'Stock Ledger',
    path: '/inventory/ledger',
    icon: History,
    module: 'inventory',
  },
  {
    name: 'Stock Transfers',
    path: '/inventory/transfers',
    icon: GitBranch,
    module: 'inventory',
  },
  {
    name: 'Batches & Expiry',
    path: '/inventory/batches',
    icon: Hash,
    module: 'inventory',
  },
  {
    name: 'Product Catalog',
    path: '/products',
    icon: Package,
    module: 'inventory',
  },
  {
    name: 'Bill of Materials (BOM)',
    path: '/products/bom',
    icon: Calculator,
    module: 'inventory',
  },

  // 3. Manufacturing & Operations
  {
    header: 'Manufacturing & Operations',
  },
  {
    name: 'Operations Command',
    path: '/operations/dashboard',
    icon: Factory,
    module: 'operations',
    badge: 'Ops',
  },
  {
    name: 'Work Orders',
    path: '/production/work-orders',
    icon: Factory,
    module: 'production',
  },
  {
    name: 'Quality Inspections',
    path: '/qc/inspections',
    icon: CheckSquare,
    module: 'quality',
  },
  {
    name: 'Supply Chain (S&OP)',
    path: '/operations/supply-chain',
    icon: Layers,
    module: 'operations',
  },
  {
    name: 'Product Merchandising',
    path: '/operations/merchandising',
    icon: Package,
    module: 'operations',
  },
  {
    name: 'Subcontractor & Mill Network',
    path: '/operations/vendors',
    icon: Building2,
    module: 'operations',
  },
  {
    name: 'Printing Workstation',
    path: '/operations/printing',
    icon: Printer,
    module: 'operations',
  },
  {
    name: 'Embroidery Workstation',
    path: '/operations/embroidery',
    icon: Scissors,
    module: 'operations',
  },
  {
    name: 'Finishing & Packaging',
    path: '/operations/packing',
    icon: PackageCheck,
    module: 'operations',
  },
  {
    name: 'Outbound Logistics',
    path: '/operations/logistics',
    icon: Truck,
    module: 'operations',
  },
  {
    name: 'R&D Innovation Hub',
    path: '/rnd/dashboard',
    icon: Microscope,
    module: 'rnd',
    badge: 'NPD',
  },
  {
    name: 'NPD Stage-Gate Projects',
    path: '/rnd/product-development',
    icon: Beaker,
    module: 'rnd',
  },
  {
    name: 'Prototype Lab Samples',
    path: '/rnd/samples',
    icon: Boxes,
    module: 'rnd',
  },
  {
    name: 'Quality Lab Testing',
    path: '/rnd/testing',
    icon: CheckSquare,
    module: 'rnd',
  },
  {
    name: 'Product Kaizen (CIP)',
    path: '/rnd/improvements',
    icon: TrendingUp,
    module: 'rnd',
  },
  {
    name: '8D Problem Solving',
    path: '/rnd/problem-solving',
    icon: ShieldAlert,
    module: 'rnd',
  },

  // 4. Commercial & Sales
  {
    header: 'Commercial & Sales',
  },
  {
    name: 'Leads Directory',
    path: '/leads',
    icon: Target,
    module: 'marketing',
  },
  {
    name: 'Pipeline Kanban',
    path: '/leads/kanban',
    icon: Kanban,
    module: 'marketing',
  },
  {
    name: 'Sales Follow-ups',
    path: '/leads/followups',
    icon: Clock,
    module: 'marketing',
  },
  {
    name: 'Customers & CRM',
    path: '/customers',
    icon: Users,
    module: 'sales',
  },
  {
    name: 'Quotations & Rates',
    path: '/sales/quotations',
    icon: FileText,
    module: 'sales',
  },
  {
    name: 'Sales Orders',
    path: '/sales/orders',
    icon: ShoppingCart,
    module: 'sales',
    badge: 'Live',
  },
  {
    name: 'Channel Partners',
    path: '/sales/channel-partners',
    icon: Users2,
    module: 'sales',
  },
  {
    name: 'Dispatch & Delivery',
    path: '/dispatch',
    icon: Truck,
    module: 'sales',
  },
  {
    name: 'Retail POS Terminal',
    path: '/sales/pos',
    icon: ShoppingBag,
    module: 'sales',
    badge: 'POS',
  },

  // 5. Customer Service & CAPA
  {
    header: 'Customer Service & CAPA',
  },
  {
    name: 'Helpdesk Tickets',
    path: '/support/tickets',
    icon: LifeBuoy,
    module: 'support',
  },
  {
    name: 'Root Cause & CAPA',
    path: '/support/capa',
    icon: ShieldAlert,
    module: 'support',
  },
  {
    name: 'Feedback & NPS',
    path: '/support/feedback',
    icon: Award,
    module: 'support',
  },

  // 6. Finance & GST Compliance
  {
    header: 'Finance & GST Compliance',
  },
  {
    name: 'Invoices Dashboard',
    path: '/invoices',
    icon: DollarSign,
    module: 'finance',
  },
  {
    name: 'Tax Invoices List',
    path: '/invoices/list',
    icon: Receipt,
    module: 'finance',
  },
  {
    name: 'Credit / Debit Notes',
    path: '/invoices/notes',
    icon: FileSpreadsheet,
    module: 'finance',
  },
  {
    name: 'Invoice Ageing Analysis',
    path: '/invoices/ageing',
    icon: Clock,
    module: 'finance',
  },
  {
    name: 'GST Center & Returns',
    path: '/tax',
    icon: Percent,
    module: 'finance',
    badge: 'GST',
  },
  {
    name: 'ITC Register',
    path: '/tax/itc-register',
    icon: Landmark,
    module: 'finance',
  },
  {
    name: 'Tax Rates Master',
    path: '/tax/rates',
    icon: Tag,
    module: 'finance',
  },

  // 7. General Ledger & Accounts
  {
    header: 'General Ledger & Accounts',
  },
  {
    name: 'Finance Dashboard',
    path: '/finance',
    icon: Landmark,
    module: 'finance',
  },
  {
    name: 'Chart of Accounts',
    path: '/finance/chart-of-accounts',
    icon: Layers,
    module: 'finance',
  },
  {
    name: 'General Journal',
    path: '/finance/journals',
    icon: Scale,
    module: 'finance',
  },
  {
    name: 'Customer Receipts',
    path: '/finance/receipts',
    icon: ArrowDownLeft,
    module: 'finance',
  },
  {
    name: 'Supplier Payments',
    path: '/finance/payments',
    icon: ArrowUpRight,
    module: 'finance',
  },
  {
    name: 'Receivables & Payables',
    path: '/finance/receivables-payables',
    icon: Clock,
    module: 'finance',
  },
  {
    name: 'Bank & Liquidity',
    path: '/finance/bank-accounts',
    icon: Wallet,
    module: 'finance',
  },
  {
    name: 'Financial Statements',
    path: '/finance/statements',
    icon: FileSpreadsheet,
    module: 'finance',
    badge: 'GAAP',
  },

  // 8. Expenses & Owner Capital
  {
    header: 'Expenses & Owner Capital',
  },
  {
    name: 'Operating Expenses',
    path: '/expenses',
    icon: DollarSign,
    module: 'finance',
  },
  {
    name: 'Budgets & Variance',
    path: '/expenses/budgets',
    icon: Target,
    module: 'finance',
  },
  {
    name: 'Owner Capital & Equity',
    path: '/owner/capital',
    icon: Landmark,
    module: 'finance',
  },
  {
    name: 'Safe-to-Withdraw',
    path: '/owner/safe-to-withdraw',
    icon: ShieldCheck,
    module: 'finance',
    badge: 'Formula',
  },

  // 9. Account & Security
  {
    header: 'Account & Security',
  },
  {
    name: 'Users Management',
    path: '/admin/users',
    icon: Users,
    module: 'users',
  },
  {
    name: 'Roles & Permissions',
    path: '/roles',
    icon: Shield,
    module: 'roles',
    badge: 'RBAC',
  },
  {
    name: 'Audit Trail & Compliance',
    path: '/admin/audit-logs',
    icon: History,
    module: 'settings',
  },
  {
    name: 'My Profile',
    path: '/profile',
    icon: User,
  },
  {
    name: 'Change Password',
    path: '/change-password',
    icon: Key,
  },

  // 10. Human Resources (HR)
  {
    header: 'Human Resources (HR)',
  },
  {
    name: 'HR Command Dashboard',
    path: '/hr/dashboard',
    icon: Users,
    module: 'hr',
    badge: 'HR',
  },
  {
    name: 'Employees Directory',
    path: '/hr/employees',
    icon: User,
    module: 'hr',
  },
  {
    name: 'Recruitment & ATS',
    path: '/hr/recruitment',
    icon: Briefcase,
    module: 'hr',
  },
  {
    name: 'Job Requisitions',
    path: '/hr/job-openings',
    icon: FileText,
    module: 'hr',
  },
  {
    name: 'Candidate Database',
    path: '/hr/candidates',
    icon: Users2,
    module: 'hr',
  },
  {
    name: 'Interview Schedule',
    path: '/hr/interviews',
    icon: CalendarIcon,
    module: 'hr',
  },
  {
    name: 'Onboarding Induction',
    path: '/hr/onboarding',
    icon: CheckSquare,
    module: 'hr',
  },
  {
    name: 'Shift Attendance',
    path: '/hr/attendance',
    icon: Clock,
    module: 'hr',
  },
  {
    name: 'Leave Applications',
    path: '/hr/leaves',
    icon: CalendarIcon,
    module: 'hr',
  },
  {
    name: 'Payroll Processing',
    path: '/hr/payroll',
    icon: DollarSign,
    module: 'hr',
    badge: 'Auto',
  },
  {
    name: 'Training & Development',
    path: '/hr/training',
    icon: Award,
    module: 'hr',
  },
  {
    name: 'Performance Reviews',
    path: '/hr/performance',
    icon: Trophy,
    module: 'hr',
  },
  {
    name: 'Goals & OKRs',
    path: '/hr/goals',
    icon: Target,
    module: 'hr',
  },
  {
    name: 'Culture & Engagement',
    path: '/hr/engagement',
    icon: Heart,
    module: 'hr',
  },
  {
    name: 'Corporate Policies',
    path: '/hr/policies',
    icon: BookOpen,
    module: 'hr',
  },
  {
    name: 'Employee Document Vault',
    path: '/hr/documents',
    icon: FileText,
    module: 'hr',
  },

  // 11. Organization Architecture
  {
    header: 'Organization Architecture',
  },
  {
    name: 'Organization Tree',
    path: '/organization/tree',
    icon: GitBranch,
    module: 'organization',
    badge: 'Chart',
  },
  {
    name: 'Company Profile',
    path: '/admin/company',
    icon: Building2,
    module: 'settings',
  },
  {
    name: 'Branches & Warehouses',
    path: '/admin/locations',
    icon: GitBranch,
    module: 'settings',
  },
  {
    name: 'Departments',
    path: '/organization/departments',
    icon: Building2,
    module: 'organization',
  },
  {
    name: 'Positions & Designations',
    path: '/organization/positions',
    icon: Briefcase,
    module: 'organization',
  },

  // 12. Administration & System
  {
    header: 'Administration & System',
  },
  {
    name: 'Number Series',
    path: '/admin/number-series',
    icon: Hash,
    module: 'settings',
  },
  {
    name: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    module: 'settings',
  },
  {
    name: 'System Health',
    path: '/health',
    icon: Activity,
    badge: 'Live',
  },

  // 13. Technology & Automation
  {
    header: 'Technology & Automation',
  },
  {
    name: 'Tech Operations Command',
    path: '/technology/dashboard',
    icon: Server,
    module: 'technology',
    badge: 'Ops',
  },
  {
    name: 'API Connectors',
    path: '/technology/integrations',
    icon: Layers,
    module: 'technology',
  },
  {
    name: 'Event Automation Rules',
    path: '/technology/automation',
    icon: Zap,
    module: 'technology',
  },
  {
    name: 'Process Orchestration',
    path: '/technology/process-automation',
    icon: Activity,
    module: 'technology',
  },
  {
    name: 'WhatsApp Bot Automations',
    path: '/technology/whatsapp-auto',
    icon: Zap,
    module: 'technology',
  },
  {
    name: 'AI & Predictive Suite',
    path: '/technology/ai-tech',
    icon: Sparkles,
    module: 'technology',
    badge: 'AI',
  },
  {
    name: 'BI Analytics & PowerBI',
    path: '/technology/bi-reports',
    icon: TrendingUp,
    module: 'technology',
  },
  {
    name: 'B2B Customer Portal',
    path: '/technology/customer-portal',
    icon: Users,
    module: 'technology',
  },
  {
    name: 'ERP Health Telemetry',
    path: '/technology/erp-monitoring',
    icon: Activity,
    module: 'technology',
  },
  {
    name: 'CRM Telephony (CTI)',
    path: '/technology/crm-tech',
    icon: Target,
    module: 'technology',
  },
  {
    name: 'Infrastructure Health',
    path: '/technology/system-health',
    icon: Server,
    module: 'technology',
  },

  // 14. Productivity & Collaboration
  {
    header: 'Productivity & Collaboration',
  },
  {
    name: 'Meetings & MOM',
    path: '/productivity/meetings',
    icon: Users,
    module: 'dashboard',
  },
  {
    name: 'Task Kanban',
    path: '/productivity/tasks',
    icon: Kanban,
    module: 'dashboard',
  },
  {
    name: 'Calendar',
    path: '/productivity/calendar',
    icon: CalendarIcon,
    module: 'dashboard',
  },

  // 15. Commercial Intelligence & Analytics
  {
    header: 'Commercial Intelligence & Analytics',
  },
  {
    name: 'Repeat Orders Schedule',
    path: '/intelligence/repeat-orders',
    icon: Clock,
    module: 'sales',
    badge: 'Predict',
  },
  {
    name: 'Upsell & Cross-sell',
    path: '/intelligence/upsell',
    icon: Zap,
    module: 'sales',
  },
  {
    name: 'Marketing Campaigns',
    path: '/marketing/campaigns',
    icon: Target,
    module: 'marketing',
    badge: 'ROI',
  },
  {
    name: 'Market Research',
    path: '/rnd/market-research',
    icon: Search,
    module: 'rnd',
  },
  {
    name: 'Competitor Dossiers',
    path: '/rnd/competitors',
    icon: Shield,
    module: 'rnd',
  },
  {
    name: 'Opportunity Radar',
    path: '/rnd/opportunities',
    icon: Sparkles,
    module: 'rnd',
  },
  {
    name: 'Customer Discovery',
    path: '/rnd/customer-research',
    icon: Users,
    module: 'rnd',
  },
  {
    name: 'VoC Feedback',
    path: '/rnd/feedback',
    icon: Award,
    module: 'rnd',
  },

  // 16. Performance & Profitability
  {
    header: 'Performance & Profitability',
  },
  {
    name: 'Targets & Goals',
    path: '/performance/targets',
    icon: Target,
    module: 'reports',
  },
  {
    name: 'Sales Leaderboard',
    path: '/performance/leaderboard',
    icon: Trophy,
    module: 'reports',
  },
  {
    name: 'Net Profitability Engine',
    path: '/profitability',
    icon: TrendingUp,
    module: 'finance',
    badge: '9-Factor',
  },
  {
    name: 'Demand Forecasts',
    path: '/profitability/forecasts',
    icon: Sparkles,
    module: 'reports',
  },

  // 17. Executive & C-Suite Cockpits
  {
    header: 'Executive & C-Suite Cockpits',
  },
  {
    name: 'Founder Sovereign Cockpit',
    path: '/dashboards/founder',
    icon: Crown,
    module: 'dashboards',
    badge: 'Board',
  },
  {
    name: 'CEO Command Cockpit',
    path: '/dashboards/ceo',
    icon: LayoutDashboard,
    module: 'dashboards',
    badge: 'CEO',
  },
  {
    name: 'CRO Revenue Cockpit',
    path: '/dashboards/cro',
    icon: TrendingUp,
    module: 'dashboards',
  },
  {
    name: 'CMO Brand Cockpit',
    path: '/dashboards/cmo',
    icon: Target,
    module: 'dashboards',
  },
  {
    name: 'COO Operations Cockpit',
    path: '/dashboards/coo',
    icon: Layers,
    module: 'dashboards',
  },
  {
    name: 'CFO Treasury Cockpit',
    path: '/dashboards/cfo',
    icon: DollarSign,
    module: 'dashboards',
  },
  {
    name: 'CHRO People Cockpit',
    path: '/dashboards/chro',
    icon: Heart,
    module: 'dashboards',
  },
  {
    name: 'CTO Tech Cockpit',
    path: '/dashboards/cto',
    icon: Cpu,
    module: 'dashboards',
  },
  {
    name: 'R&D Innovation Cockpit',
    path: '/dashboards/rnd',
    icon: Microscope,
    module: 'dashboards',
  },

  // 18. Executive Cockpits
  {
    header: 'Executive Cockpits',
  },
  {
    name: 'CEO Cockpit',
    path: '/executive/ceo',
    icon: LayoutDashboard,
    module: 'dashboard',
    badge: 'Exec',
  },
  {
    name: 'Founder Decisions',
    path: '/executive/founder',
    icon: ShieldCheck,
    module: 'dashboard',
  },
  {
    name: 'Assistant Agenda',
    path: '/executive/assistant',
    icon: CheckSquare,
    module: 'dashboard',
  },
];

const SECTION_ICONS = {
  'Procurement & Purchasing': ShoppingBag,
  'Inventory & Operations': Boxes,
  'Manufacturing & Operations': Factory,
  'Commercial & Sales': ShoppingCart,
  'Customer Service & CAPA': LifeBuoy,
  'Finance & GST Compliance': Receipt,
  'General Ledger & Accounts': Landmark,
  'Expenses & Owner Capital': DollarSign,
  'Account & Security': Shield,
  'Human Resources (HR)': Users,
  'Organization Architecture': GitBranch,
  'Administration & System': Settings,
  'Technology & Automation': Cpu,
  'Productivity & Collaboration': CheckSquare,
  'Commercial Intelligence & Analytics': Zap,
  'Performance & Profitability': Trophy,
  'Executive & C-Suite Cockpits': Crown,
  'Executive Cockpits': LayoutDashboard,
};

export const MainLayout = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen, user, logout } = useAppStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // On mobile/tablet, auto-close sidebar when switching routes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Set initial sidebar state on mount according to screen size
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Global search Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await authService.logout();
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Superuser check: Owner or Admin has access to all menus
  const roleCode = user?.role_id?.role_code || (typeof user?.role_id === 'string' ? '' : '');
  const isSuper =
    roleCode === 'OWNER' ||
    roleCode === 'ADMIN' ||
    roleCode === 'SUPER_ADMIN' ||
    roleCode === 'BOARD_FOUNDER' ||
    roleCode === 'FOUNDER' ||
    roleCode === 'CEO' ||
    user?.email === 'admin@danzaerp.com';

  // Dynamic menu filtering based on module permissions
  const visibleNavItems = navigationItems.filter((item) => {
    if (item.header) return true;
    if (!item.module) return true;
    if (isSuper) return true;
    const perm = (user?.permissions || []).find((p) => p.module === item.module);
    return Boolean(perm?.can_view);
  });

  // Group navigation items into standalone items and accordion groups
  const menuGroups = React.useMemo(() => {
    const groups = [];
    let currentGroup = null;

    for (const item of visibleNavItems) {
      if (item.header) {
        currentGroup = {
          id: item.header.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: item.header,
          icon: SECTION_ICONS[item.header] || Layers,
          items: [],
        };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.items.push(item);
      } else {
        // Standalone item before headers (e.g. Dashboard)
        groups.push({
          isStandalone: true,
          ...item,
        });
      }
    }
    // Filter out empty accordion groups if user lacks permissions for all its child items
    return groups.filter((g) => g.isStandalone || g.items.length > 0);
  }, [visibleNavItems]);

  // Accordion state: map of groupId -> boolean
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    let currentHeaderId = null;
    for (const item of navigationItems) {
      if (item.header) {
        currentHeaderId = item.header.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      } else if (currentHeaderId && item.path) {
        const isCurrent =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path));
        if (isCurrent) {
          initial[currentHeaderId] = true;
        }
      }
    }
    return initial;
  });

  // Automatically keep current route's accordion group open
  useEffect(() => {
    for (const group of menuGroups) {
      if (!group.isStandalone) {
        const hasActive = group.items.some(
          (sub) =>
            location.pathname === sub.path ||
            (sub.path !== '/' && location.pathname.startsWith(sub.path))
        );
        if (hasActive) {
          setOpenSections((prev) => (prev[group.id] ? prev : { ...prev, [group.id]: true }));
          break;
        }
      }
    }
  }, [location.pathname, menuGroups]);

  const toggleSection = (groupId) => {
    setOpenSections((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const accordionGroups = menuGroups.filter((g) => !g.isStandalone);
  const allExpanded =
    accordionGroups.length > 0 && accordionGroups.every((g) => Boolean(openSections[g.id]));

  const toggleAllSections = () => {
    if (allExpanded) {
      setOpenSections({});
    } else {
      const next = {};
      accordionGroups.forEach((g) => {
        next[g.id] = true;
      });
      setOpenSections(next);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-6 h-16 flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 text-inherit no-underline">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shadow-indigo-200">
              D
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Danza ERP</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Global ERP Search (Ctrl+K)"
          >
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search ERP...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* In-App Notifications Bell */}
          <NotificationBell />

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Gateway v1: Online</span>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-800 leading-tight">
                  {user?.full_name || 'Logged In User'}
                </div>
                <div className="text-slate-500 leading-tight">
                  {user?.designation || user?.department || 'Staff'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <Badge variant="indigo" className="mt-1 text-[10px] py-0 px-1.5">
                    {user?.user_code || 'EMP'}
                  </Badge>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/roles"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Roles & Permissions</span>
                  </Link>

                  <Link
                    to="/change-password"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Key className="w-4 h-4 text-slate-400" />
                    <span>Change Password</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Body */}
      <div className="flex flex-1 relative min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 print:hidden',
            // On desktop (lg+): fixed height strictly equal to (100vh - 4rem), sticky at top-16, stays in normal flow
            'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30',
            // On mobile (< lg): fixed overlay drawer spanning full viewport height
            'fixed top-0 bottom-0 left-0 h-screen z-50 shadow-2xl lg:shadow-none',
            sidebarOpen
              ? 'translate-x-0 w-72 lg:w-64'
              : '-translate-x-full lg:translate-x-0 lg:w-20'
          )}
        >
          {/* Mobile Drawer Header with Close Button */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                D
              </div>
              <span className="font-bold text-slate-900 text-base">Danza ERP</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Fixed height with smooth internal scrolling) */}
          <div className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 overscroll-contain">
            {sidebarOpen ? (
              <>
                {/* Accordion Quick Action Control */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">
                  <span>Modules</span>
                  <button
                    type="button"
                    onClick={toggleAllSections}
                    className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer capitalize"
                  >
                    {allExpanded ? 'Collapse all' : 'Expand all'}
                  </button>
                </div>

                {menuGroups.map((group) => {
                  if (group.isStandalone) {
                    const Icon = group.icon;
                    return (
                      <NavLink
                        key={group.path}
                        to={group.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                          )
                        }
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            location.pathname === group.path ? 'text-indigo-600' : 'text-slate-500'
                          )}
                        />
                        <div className="flex items-center justify-between flex-1">
                          <span>{group.name}</span>
                          {group.badge && (
                            <Badge variant="indigo" className="text-[10px] px-1.5 py-0">
                              {group.badge}
                            </Badge>
                          )}
                        </div>
                      </NavLink>
                    );
                  }

                  const GroupIcon = group.icon;
                  const isOpen = Boolean(openSections[group.id]);
                  const hasActiveChild = group.items.some(
                    (sub) =>
                      location.pathname === sub.path ||
                      (sub.path !== '/' && location.pathname.startsWith(sub.path))
                  );

                  return (
                    <div key={group.id} className="flex flex-col mb-0.5">
                      {/* Accordion Header Button */}
                      <button
                        type="button"
                        onClick={() => toggleSection(group.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none text-left',
                          isOpen
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : hasActiveChild
                            ? 'bg-indigo-50/60 text-indigo-900 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GroupIcon
                            className={cn(
                              'w-4 h-4 shrink-0 transition-colors',
                              hasActiveChild
                                ? 'text-indigo-600'
                                : isOpen
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            )}
                          />
                          <span className="truncate">{group.title}</span>
                          {hasActiveChild && !isOpen && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0"
                              title="Active page inside"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <span className="text-[10px] text-slate-400 font-normal">
                            {group.items.length}
                          </span>
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                              isOpen && 'rotate-180 text-slate-700'
                            )}
                          />
                        </div>
                      </button>

                      {/* Accordion Sub-items List */}
                      {isOpen && (
                        <div className="mt-0.5 ml-3 pl-2.5 border-l-2 border-slate-100 flex flex-col gap-0.5 py-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {group.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                className={({ isActive }) =>
                                  cn(
                                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                                    isActive
                                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                  )
                                }
                              >
                                <SubIcon
                                  className={cn(
                                    'w-3.5 h-3.5 shrink-0',
                                    location.pathname.startsWith(subItem.path) && subItem.path !== '/'
                                      ? 'text-indigo-600'
                                      : location.pathname === '/' && subItem.path === '/'
                                      ? 'text-indigo-600'
                                      : 'text-slate-400'
                                  )}
                                />
                                <div className="flex items-center justify-between flex-1 truncate">
                                  <span className="truncate">{subItem.name}</span>
                                  {subItem.badge && (
                                    <Badge
                                      variant="indigo"
                                      className="text-[9px] px-1 py-0 ml-1 shrink-0"
                                    >
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </div>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              /* Collapsed Sidebar (Icon-only mode) */
              <>
                {menuGroups.map((group) => {
                  if (group.isStandalone) {
                    const Icon = group.icon;
                    return (
                      <NavLink
                        key={group.path}
                        to={group.path}
                        title={group.name}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-center p-2.5 rounded-lg transition-colors',
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          )
                        }
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </NavLink>
                    );
                  }

                  const GroupIcon = group.icon;
                  const hasActiveChild = group.items.some(
                    (sub) =>
                      location.pathname === sub.path ||
                      (sub.path !== '/' && location.pathname.startsWith(sub.path))
                  );

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setSidebarOpen(true);
                        setOpenSections((prev) => ({ ...prev, [group.id]: true }));
                      }}
                      title={`${group.title} (${group.items.length} items)`}
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-lg transition-colors relative cursor-pointer',
                        hasActiveChild
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <GroupIcon
                        className={cn(
                          'w-5 h-5 shrink-0',
                          hasActiveChild ? 'text-indigo-600' : 'text-slate-500'
                        )}
                      />
                      {hasActiveChild && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Sidebar Footer with Sign Out */}
          {sidebarOpen ? (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{user?.email || 'Logged In'}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-100 flex justify-center shrink-0">
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden print:p-0 print:m-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default MainLayout;
