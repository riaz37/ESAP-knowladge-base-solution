import { CollectionData } from "../../types/db-knowladge.type";
import DatabaseIcon from "@/icons/sidebar/DatabaseIcon";
import DashboardIcon from "@/icons/sidebar/DashboardIcon";
import SalesKnowledgeIcon from "@/icons/sidebar/SalesKnowledgeIcon";
import HrKnowledgeIcon from "@/icons/sidebar/HrKnowledgeIcon";
import SupportKnowledgeIcon from "@/icons/sidebar/supportIcon";
export const collections = [
  {
    key: "dashboard",
    name: "Dashboard",
    icon: "🏠",
    sidebarIcon: DashboardIcon,
  },
  {
    key: "db",
    name: "DB Knowledge",
    icon: "🔒",
    sidebarIcon: DatabaseIcon,
  },
  {
    key: "File system",
    name: "File system",
    icon: "🗂️",
    sidebarIcon: SalesKnowledgeIcon,
  },

  {
    key: "hr",
    name: "HR Knowledge",
    icon: "👥",
    sidebarIcon: HrKnowledgeIcon,
  },
  {
    key: "support Team",
    name: "Support Team",
    icon: "🛠️",
    sidebarIcon: SupportKnowledgeIcon,
  },
];

export const collectionData: Record<string, CollectionData> = {
  dashboard: {
    title: "Dashboard",
    icon: "🏠",
    documents: [],
    cards: [
      {
        type: "stat",
        title: "Total Queries",
        value: 1247,
        subtext: "This month",
      },
      {
        type: "progress",
        title: "System Health",
        value: 98,
        subtext: "All systems operational",
      },
      {
        type: "list",
        title: "Recent Activity",
        items: [
          "DB Knowledge accessed",
          "Sales report generated",
          "HR data updated",
        ],
      },
    ],
  },
  "File system": {
    title: "File system",
    icon: "📈",
    documents: [
      {
        icon: "📊",
        name: "Campaign Results",
        status: "Verified",
        statusColor: "green",
        size: "45 pages",
        owner: "Alice Smith",
        ownerAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
        lastSync: "1 day ago",
      },
      {
        icon: "📄",
        name: "Ad Spend Report",
        status: "Outdated",
        statusColor: "red",
        size: "12 pages",
        owner: "Bob Lee",
        ownerAvatar: "https://randomuser.me/api/portraits/men/23.jpg",
        lastSync: "2 months ago",
      },
    ],
    cards: [
      {
        type: "stat",
        title: "Active Campaigns",
        value: 5,
        subtext: "Running now",
      },
      {
        type: "graph",
        title: "Leads (last 7d)",
        data: [10, 20, 15, 30, 25, 40, 35],
        subtext: "+15% this week",
      },
      {
        type: "progress",
        title: "Budget Used",
        value: 85,
        subtext: "$8,500 of $10,000",
      },
      {
        type: "list",
        title: "Upcoming Launches",
        items: ["Spring Sale", "New Product X"],
      },
    ],
  },
  db: {
    title: "Database Knowledge",
    icon: "🔒",
    documents: [
      {
        icon: "🗂️",
        name: "Sprinter Software Group",
        status: "Verified",
        statusColor: "green",
        size: "207 pages",
        owner: "Jason Fleming",
        ownerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        lastSync: "3 days ago",
      },
      {
        icon: "📄",
        name: "Previous RFPs",
        status: "Outdated",
        statusColor: "red",
        size: "88 pages",
        owner: "Sophie Zhang",
        ownerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        lastSync: "6 months ago",
      },
      {
        icon: "📊",
        name: "Client list",
        status: "Verified",
        statusColor: "green",
        size: "64 pages",
        owner: "Miguel Rivera",
        ownerAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        lastSync: "Syncing",
      },
      {
        icon: "📝",
        name: "Client meeting minutes",
        status: "To verify",
        statusColor: "yellow",
        size: "13 pages",
        owner: "Jason Fleming",
        ownerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        lastSync: "2 days ago",
      },
    ],
    cards: [
      {
        type: "stat",
        title: "Total Deals",
        value: 32,
        subtext: "Closed this year",
      },
      {
        type: "progress",
        title: "Revenue Target",
        value: 60,
        subtext: "$120,000 of $200,000",
      },
      {
        type: "graph",
        title: "Monthly Revenue",
        data: [10, 20, 30, 25, 40, 50, 60],
        subtext: "+10% this month",
      },
      {
        type: "list",
        title: "Pending Approvals",
        items: ["PO #1234", "Contract Z"],
      },
    ],
  },
  hr: {
    title: "HR Knowledge",
    icon: "👥",
    documents: [
      {
        icon: "📋",
        name: "Employee Handbook",
        status: "Verified",
        statusColor: "green",
        size: "30 pages",
        owner: "Priya Singh",
        ownerAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
        lastSync: "1 week ago",
      },
      {
        icon: "🗃️",
        name: "Leave Records",
        status: "To verify",
        statusColor: "yellow",
        size: "15 pages",
        owner: "Kai Tanak",
        ownerAvatar: "https://randomuser.me/api/portraits/men/56.jpg",
        lastSync: "3 days ago",
      },
    ],
    cards: [
      { type: "stat", title: "Employees", value: 58 },
      {
        type: "progress",
        title: "Reviews Complete",
        value: 75,
        subtext: "42 of 56 done",
      },
      {
        type: "list",
        title: "Upcoming Interviews",
        items: ["Sarah (Mon)", "Ahmed (Wed)"],
      },
      {
        type: "graph",
        title: "Hires (last 6m)",
        data: [2, 3, 1, 4, 2, 5],
        subtext: "+2 new this month",
      },
    ],
  },
  support: {
    title: "Support Team Knowledge",
    icon: "🛠️",
    documents: [
      {
        icon: "💬",
        name: "FAQ",
        status: "Verified",
        statusColor: "green",
        size: "22 pages",
        owner: "Sophie Zhang",
        ownerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        lastSync: "2 days ago",
      },
      {
        icon: "📄",
        name: "Ticket Templates",
        status: "Verified",
        statusColor: "green",
        size: "10 pages",
        owner: "Miguel Rivera",
        ownerAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        lastSync: "Yesterday",
      },
    ],
    cards: [
      { type: "stat", title: "Tickets Today", value: 34 },
      { type: "progress", title: "SLA Met", value: 92, subtext: "Goal: 95%" },
      {
        type: "list",
        title: "Open Tickets",
        items: ["#4567: Login issue", "#4568: Payment error"],
      },
      {
        type: "graph",
        title: "Avg. Response Time (min)",
        data: [30, 28, 25, 22, 20, 18, 15],
        subtext: "Improved this week",
      },
    ],
  },
};

// Sample data for testing charts
export const sampleChartData = [
  {
    id: 1,
    name: "Product A",
    category: "Electronics",
    price: 299.99,
    sales: 150,
    date: "2024-01-15",
  },
  {
    id: 2,
    name: "Product B",
    category: "Clothing",
    price: 89.99,
    sales: 200,
    date: "2024-01-16",
  },
  {
    id: 3,
    name: "Product C",
    category: "Electronics",
    price: 199.99,
    sales: 75,
    date: "2024-01-17",
  },
  {
    id: 4,
    name: "Product D",
    category: "Books",
    price: 24.99,
    sales: 300,
    date: "2024-01-18",
  },
  {
    id: 5,
    name: "Product E",
    category: "Clothing",
    price: 129.99,
    sales: 120,
    date: "2024-01-19",
  },
  {
    id: 6,
    name: "Product F",
    category: "Electronics",
    price: 499.99,
    sales: 50,
    date: "2024-01-20",
  },
  {
    id: 7,
    name: "Product G",
    category: "Books",
    price: 19.99,
    sales: 250,
    date: "2024-01-21",
  },
  {
    id: 8,
    name: "Product H",
    category: "Clothing",
    price: 79.99,
    sales: 180,
    date: "2024-01-22",
  },
];
