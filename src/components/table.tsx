import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import FilterIcon from "@/icons/sidebar/filterIcon";
import { useTheme } from "@/store/theme-store";

export type TableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
};

export type TableProps = {
  columns?: TableColumn[];
  allKeys?: string[];
  data?: Record<string, any>[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  Pending: { color: "#EAB308", bg: "rgba(234, 179, 8, 0.12)" },
  Active: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.12)" },
  Approved: { color: "#06B6D4", bg: "rgba(6, 182, 212, 0.12)" },
  Reject: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" },
};

function StatusPill({ status }: { status: string }) {
  const { color, bg } = STATUS_COLORS[status] || STATUS_COLORS["Pending"];
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 72,
        padding: "6px 20px",
        borderRadius: 999,
        fontWeight: 600,
        fontSize: 16,
        color,
        background: bg,
        textAlign: "center",
        letterSpacing: 0.2,
      }}
    >
      {status}
    </span>
  );
}

export default function FigmaTableDemo({
  columns = [],
  allKeys,
  data = [],
  pageSizeOptions = [7, 10, 20, 30],
  defaultPageSize = 7,
}: TableProps) {
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Filtering logic
  const filteredData = useMemo(() => {
    let filtered = data;
    // Global search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    // Per-column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });
    return filtered;
  }, [data, searchTerm, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Row selection logic
  const rowKey =
    columns.find((col) => col.key.toLowerCase().includes("id"))?.key ||
    columns[0]?.key ||
    "id";
  const allChecked =
    currentData.length > 0 &&
    currentData.every((row) => selectedRows.includes(String(row[rowKey])));
  const toggleAll = () => {
    if (allChecked) {
      setSelectedRows(
        selectedRows.filter(
          (id) => !currentData.some((row) => String(row[rowKey]) === id)
        )
      );
    } else {
      setSelectedRows([
        ...selectedRows,
        ...currentData
          .map((row) => String(row[rowKey]))
          .filter((id) => !selectedRows.includes(id)),
      ]);
    }
  };
  const toggleRow = (id: string) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Filter out columns that have no data
  const columnsWithData = useMemo(() => {
    if (!data || data.length === 0) return columns;

    return columns.filter((col) => {
      // Check if any row has non-empty data for this column
      return data.some((row) => {
        const value = row[col.key];
        return (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          String(value).trim() !== ""
        );
      });
    });
  }, [columns, data]);

  // TanStack Table setup
  const tableColumns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            style={{
              width: 18,
              height: 18,
              marginRight: 8,
              background: "transparent",
              border:
                theme === "dark" ? "2px solid #ffffff63" : "2px solid #d1d5db",
              borderRadius: 6,
              appearance: "none",
              outline: "none",
              display: "inline-block",
              verticalAlign: "middle",
              cursor: "pointer",
            }}
          />
        ),
        cell: (info: any) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(String(info.row.original[rowKey]))}
            onChange={() => toggleRow(String(info.row.original[rowKey]))}
            style={{
              width: 18,
              height: 18,
              marginRight: 8,
              background: "transparent",
              border:
                theme === "dark" ? "2px solid #ffffff63" : "2px solid #d1d5db",
              borderRadius: 6,
              appearance: "none",
              outline: "none",
              display: "inline-block",
              verticalAlign: "middle",
              cursor: "pointer",
            }}
          />
        ),
        size: 48,
      },
      ...columnsWithData.map((col) => ({
        accessorKey: col.key,
        header: col.label,
        cell: (info: any) =>
          col.key.toLowerCase() === "status" ? (
            <StatusPill status={info.getValue()} />
          ) : (
            String(info.getValue() ?? "")
          ),
        enableSorting: col.sortable,
      })),
      {
        id: "menu",
        header: "",
        cell: () => (
          <span
            style={{
              marginLeft: 16,
              cursor: "pointer",
              fontSize: 22,
              color: "#64748B",
            }}
          >
            &#8942;
          </span>
        ),
        size: 48,
      },
    ],
    [columnsWithData, selectedRows, allChecked, theme]
  );

  const table = useReactTable({
    data: currentData,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "auto",
        padding: 24,
        borderRadius: "32px",
        border:
          theme === "dark"
            ? "3px solid rgba(0, 191, 111, 0.27)"
            : "1.5px solid #e1f4ea",
        background:
          theme === "dark"
            ? "linear-gradient(180deg, rgba(0, 191, 111, 0.025) -100%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
            : "#fff",
        backdropFilter: theme === "dark" ? "blur(32px)" : undefined,
        margin: "0 auto",
        overflow: "visible",
        boxShadow: theme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* Filter Toggle */}
      <div
        style={{
          width: "100%",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          className="filter-toggle-button"
          onClick={() => setShowFilters((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: theme === "dark" ? "rgba(255,255,255,0.10)" : "#f0f9f5",
            border: theme === "dark" ? "none" : "1.5px solid #e1f4ea",
            borderRadius: 8,
            padding: "10px 16px",
            color: theme === "dark" ? "#fff" : "#1a2b22",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow:
              theme === "dark"
                ? "0 1px 4px 0 rgba(0,0,0,0.04)"
                : "0 1px 3px 0 rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>
            <FilterIcon fill={theme === "dark" ? "#fff" : "#000"} />
          </span>{" "}
          {showFilters ? "Hide Filter" : "Show Filter"}
        </button>
      </div>
      {/* Filters Row */}
      {showFilters && (
        <div
          className="space-y-4 p-4 rounded-xl mb-3 w-[97%]"
          style={{
            background: theme === "dark" ? "rgba(255,255,255,0.10)" : "#f0f9f5",
            border: theme === "dark" ? "none" : "1.5px solid #e1f4ea",
          }}
        >
          {/* Global Search */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search in all columns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 max-w-sm bg-white/50 dark:bg-green-300/10 border-[#e1f4ea] dark:border-[#5b8277] text-gray-700 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[#f0f9f5]/50 dark:hover:bg-[#012920]/50"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Column Filters */}
          <div className="flex flex-wrap gap-2">
            {columnsWithData.map((col) => (
              <div key={col.key} className="flex items-center gap-2">
                <Input
                  placeholder={`Filter ${col.label}...`}
                  value={filters[col.key] || ""}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      [col.key]: e.target.value,
                    }));
                    setCurrentPage(1);
                  }}
                  className="w-40 bg-white/50 dark:bg-slate-300/20 border-[#e1f4ea] dark:border-[#5b8277] text-gray-700 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                {filters[col.key] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters((prev) => {
                        const newFilters = { ...prev };
                        delete newFilters[col.key];
                        return newFilters;
                      });
                      setCurrentPage(1);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[#f0f9f5]/50 dark:hover:bg-[#012920]/50"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto w-full rounded-2xl max-w-[74vw]">
        <table
          className="min-w-full"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{
                  background:
                    theme === "dark" ? "rgba(255,255,255,0.07)" : "#f0f9f5",
                  borderRadius: 32,
                  boxShadow:
                    theme === "dark"
                      ? "0 2px 12px 0 rgba(0,0,0,0.10)"
                      : "0 1px 3px 0 rgba(0,0,0,0.06)",
                  height: 64,
                  marginBottom: 16,
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  display: "table-row",
                }}
              >
                {headerGroup.headers.map((header, i) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "0 24px",
                      fontWeight: 600,
                      fontSize: 15,
                      textAlign: "left",
                      verticalAlign: "middle",
                      letterSpacing: 1,
                      color: theme === "dark" ? "#fff" : "#1a2b22",
                      background:
                        theme === "dark" ? "rgba(255,255,255,0.07)" : "#f0f9f5",
                      borderTopLeftRadius: i === 0 ? 32 : 0,
                      borderBottomLeftRadius: i === 0 ? 32 : 0,
                      borderTopRightRadius:
                        i === headerGroup.headers.length - 1 ? 32 : 0,
                      borderBottomRightRadius:
                        i === headerGroup.headers.length - 1 ? 32 : 0,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span
                        style={{
                          fontSize: 14,
                          marginLeft: 4,
                          cursor: "pointer",
                          color: theme === "dark" ? "#fff" : "#1a2b22",
                        }}
                      >
                        {header.column.getIsSorted() === "asc"
                          ? "↓"
                          : header.column.getIsSorted() === "desc"
                          ? "↑"
                          : ""}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom:
                    theme === "dark"
                      ? "1px solid rgba(0,191,111,0.10)"
                      : "1px solid #f1f5f9",
                  height: 60,
                  color: theme === "dark" ? "#fff" : "#1a2b22",
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: "0 24px",
                      fontSize: 12,
                      textAlign: "left",
                      wordBreak: "break-word",
                      color: theme === "dark" ? "#fff" : "#1a2b22",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div
        className="pagination-controls"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 15,
              color: theme === "dark" ? "#fff" : "#1a2b22",
            }}
          >
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              border:
                theme === "dark"
                  ? "1.5px solid rgba(0,191,111,0.18)"
                  : "1.5px solid #e1f4ea",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 15,
              background: theme === "dark" ? "rgba(35,36,53,0.85)" : "#fff",
              color: theme === "dark" ? "#fff" : "#1a2b22",
              outline: "none",
              boxShadow:
                theme === "dark"
                  ? "0 2px 8px 0 rgba(0,0,0,0.10)"
                  : "0 1px 3px 0 rgba(0,0,0,0.06)",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            className="focus:ring-2 focus:ring-[#00bf6f] focus:border-[#00bf6f]"
          >
            {pageSizeOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                style={{
                  background: theme === "dark" ? "#232435" : "#fff",
                  color: theme === "dark" ? "#fff" : "#1a2b22",
                }}
              >
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            style={{
              fontSize: 15,
              color: theme === "dark" ? "#fff" : "#1a2b22",
            }}
          >
            {filteredData.length === 0
              ? "0"
              : `${startIndex + 1}-${Math.min(
                  endIndex,
                  filteredData.length
                )} of ${filteredData.length}`}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 18px",
              borderRadius: 8,
              border:
                theme === "dark"
                  ? "1.5px solid rgba(0,191,111,0.18)"
                  : "1.5px solid #e1f4ea",
              background:
                currentPage === 1
                  ? theme === "dark"
                    ? "rgba(255,255,255,0.10)"
                    : "#f1f5f9"
                  : theme === "dark"
                  ? "#232435"
                  : "#fff",
              color: theme === "dark" ? "#fff" : "#1a2b22",
              fontSize: 15,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            style={{
              padding: "6px 18px",
              borderRadius: 8,
              border:
                theme === "dark"
                  ? "1.5px solid rgba(0,191,111,0.18)"
                  : "1.5px solid #e1f4ea",
              background:
                currentPage === totalPages || totalPages === 0
                  ? theme === "dark"
                    ? "rgba(255,255,255,0.10)"
                    : "#f1f5f9"
                  : theme === "dark"
                  ? "#232435"
                  : "#fff",
              color: theme === "dark" ? "#fff" : "#1a2b22",
              fontSize: 15,
              cursor:
                currentPage === totalPages || totalPages === 0
                  ? "not-allowed"
                  : "pointer",
              opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
