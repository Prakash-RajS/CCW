// frontend_admin/src/pages/Admin/Options.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Upload, Download,
  ToggleLeft, ToggleRight, X, Search,
  ChevronDown, AlertCircle, RefreshCw, FileText, Users, UserCheck,
  ChevronLeft, ChevronRight, Layers, Square,
} from "lucide-react";

// ── category meta ─────────────────────────────────────────────────────────────
const CREATOR_CATEGORIES = [
  { key: "creator_category", label: "Creator Category", role: "Creator", color: "#7C3AED" },
  { key: "primary_niche", label: "Primary Niche", role: "Creator", color: "#9333EA" },
  { key: "secondary_niche", label: "Secondary Niche", role: "Creator", color: "#A855F7" },
  { key: "platform", label: "Platform", role: "Creator", color: "#C084FC" },
  { key: "followers_range", label: "Followers Range", role: "Creator", color: "#D8B4FE" },
];
const COLLABORATOR_CATEGORIES = [
  { key: "skill_category", label: "Skill Category", role: "Collaborator", color: "#10B981" },
];
const PORTFOLIO_CATEGORIES = [
  { key: "portfolio_category", label: "Portfolio Category", role: "Both", color: "#0EA5E9" },
];
const ALL_CATEGORIES = [...CREATOR_CATEGORIES, ...COLLABORATOR_CATEGORIES, ...PORTFOLIO_CATEGORIES];

const ROLE_COLORS = {
  Creator: { bg: "rgba(124,58,237,0.1)", text: "#6d28d9", border: "rgba(124,58,237,0.22)" },
  Collaborator: { bg: "rgba(16,185,129,0.1)", text: "#047857", border: "rgba(16,185,129,0.22)" },
  Both: { bg: "rgba(14,165,233,0.1)", text: "#0369a1", border: "rgba(14,165,233,0.22)" },
};
const ROLE_COLORS_DARK = {
  Creator: { bg: "rgba(124,58,237,0.18)", text: "#A78BFA", border: "rgba(124,58,237,0.35)" },
  Collaborator: { bg: "rgba(16,185,129,0.18)", text: "#34D399", border: "rgba(16,185,129,0.35)" },
  Both: { bg: "rgba(14,165,233,0.18)", text: "#38BDF8", border: "rgba(14,165,233,0.35)" },
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ role, isDark }) => {
  const c = isDark ? ROLE_COLORS_DARK[role] : ROLE_COLORS[role];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {role}
    </span>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange, isDark }) => {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1); pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    }
    return pages;
  };
  if (totalPages <= 1) return null;
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
      <div className={`flex items-center gap-2 order-2 sm:order-1 ${isDark ? "text-white/80" : "text-gray-600"}`}>
        <span>Page {currentPage} of {totalPages}</span>
      </div>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDark ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"}`}>
          <ChevronLeft size={16} />
        </button>
        {getPages().map((page, idx) =>
          page === "..." ? (
            <span key={`d${idx}`} className={`px-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>…</span>
          ) : (
            <button key={page} onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 hover:scale-110 ${currentPage === page ? "text-white" : isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
              style={currentPage === page ? { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" } : {}}>
              {page}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 ${isDark ? "border-white text-white hover:bg-white/10" : "border-gray-400 text-gray-700 hover:bg-gray-100"}`}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ── CategorySelect (custom themed dropdown) ──
const CategorySelect = ({ value, onChange, isDark }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = ALL_CATEGORIES.find(c => c.key === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const groups = [
    { label: "Creator", icon: "👤", categories: CREATOR_CATEGORIES, accent: isDark ? "#A78BFA" : "#7c3aed" },
    { label: "Collaborator", icon: "🤝", categories: COLLABORATOR_CATEGORIES, accent: isDark ? "#34D399" : "#047857" },
    { label: "Portfolio", icon: "📁", categories: PORTFOLIO_CATEGORIES, accent: isDark ? "#38BDF8" : "#0369a1" },
  ];

  return (
    <div ref={ref} className="relative">
      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Category <span className="text-red-500">*</span>
      </label>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: isDark ? "#1F2937" : "#FFFFFF",
          border: `2px solid ${open ? (isDark ? "#A78BFA" : "#7c3aed") : (isDark ? "#6B7280" : "#9CA3AF")}`,
          color: isDark ? "#FFFFFF" : "#000000",
        }}>
        <div className="flex items-center gap-2">
          {selected ? (
            <>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: selected.color }} />
              <span>{selected.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={isDark
                  ? { background: "rgba(124,58,237,0.2)", color: "#A78BFA" }
                  : { background: "#f3f0ff", color: "#6d28d9" }}>
                {selected.role}
              </span>
            </>
          ) : (
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Select category…</span>
          )}
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${isDark ? "text-gray-400" : "text-gray-500"}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden shadow-lg"
          style={{
            background: isDark ? "#1F2937" : "#FFFFFF",
            border: `2px solid ${isDark ? "#6B7280" : "#9CA3AF"}`,
          }}>
          <div className="max-h-64 overflow-y-auto py-1.5">
            {groups.map((group, gi) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#ede9fe" }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: group.accent }}>
                    {group.label}
                  </span>
                  <div className="h-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#ede9fe" }} />
                </div>
                {group.categories.map(cat => {
                  const isSelected = value === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { onChange(cat.key); setOpen(false); }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-sm transition-all duration-150"
                      style={{
                        background: isSelected ? (isDark ? "rgba(124,58,237,0.3)" : "#f3f0ff") : "transparent",
                        color: isSelected ? (isDark ? "#A78BFA" : "#5b21b6") : (isDark ? "#cbd5e1" : "#374151"),
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "#faf5ff"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color, opacity: isSelected ? 1 : 0.5 }} />
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}>
                          <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
                {gi < groups.length - 1 && (
                  <div className="mx-3 my-1" style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "#ede9fe" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function OptionsPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [selectedCat, setSelectedCat] = useState(ALL_CATEGORIES[0].key);
  const [options, setOptions] = useState([]);
  const [allOptions, setAllOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState("creator");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Add modal: tab = "single" | "batch"
  const [addTab, setAddTab] = useState("single");

  // Single form
  const [form, setForm] = useState({ label: "", category: ALL_CATEGORIES[0].key });
  const [formErrors, setFormErrors] = useState({});

  // Batch
  const emptyRow = () => ({ label: "", id: Date.now() + Math.random() });
  const [batchRows, setBatchRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [batchCategory, setBatchCategory] = useState(ALL_CATEGORIES[0].key);
  const [batchErrors, setBatchErrors] = useState([]);

  // Import
  const fileRef = useRef(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Theme effect
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(isDark);
    };
    applyTheme();
    window.addEventListener("theme-change", applyTheme);
    return () => window.removeEventListener("theme-change", applyTheme);
  }, []);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try { const res = await api.get("/dropdown-options/admin/all"); setAllOptions(res.data || []); }
    catch { /* silent */ }
  }, []);

  const fetchCategory = useCallback(async (cat) => {
    setLoading(true); setCurrentPage(1);
    try { const res = await api.get(`/dropdown-options/admin/${cat}`); setOptions(res.data || []); }
    catch { toast.error("Failed to load options"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchCategory(selectedCat); setSearch(""); }, [selectedCat, fetchCategory]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const countFor = (key) => allOptions.filter(o => o.category === key).length;
  const activeCountFor = (key) => allOptions.filter(o => o.category === key && o.is_active).length;

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // ── Check if option exists ──────────────────────────────────────────────
  const checkIfOptionExists = (category, label) => {
    return allOptions.some(opt => 
      opt.category === category && 
      opt.label.toLowerCase() === label.toLowerCase()
    );
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validateLabel = (label) => {
    const trimmed = label.trim();
    if (!trimmed) return "Label is required";
    if (trimmed.length < 1) return "Label must be at least 1 character";
    if (trimmed.length > 30) return "Label cannot exceed 30 characters";
    if (!/^[a-zA-Z0-9\s\&\-\.\']+$/.test(trimmed)) {
      return "Label contains invalid characters (only letters, numbers, spaces, &, -, ., ')";
    }
    return null;
  };

  const validateForm = () => {
    const errs = {};
    const error = validateLabel(form.label);
    if (error) errs.label = error;
    return errs;
  };

  // ── ADD ───────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ label: "", category: selectedCat });
    setBatchRows([emptyRow(), emptyRow(), emptyRow()]);
    setBatchCategory(selectedCat);
    setBatchErrors([]);
    setFormErrors({});
    setAddTab("single");
    setShowAddModal(true);
  };

  const handleLabelChange = (value) => {
    setForm(f => ({ ...f, label: value }));
    if (formErrors.label) {
      setFormErrors({});
    }
  };

  const handleAddSingle = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) { 
      setFormErrors(errs); 
      return; 
    }
    
    const targetCat = form.category || selectedCat;
    const label = form.label.trim();
    
    // Check if option already exists
    if (checkIfOptionExists(targetCat, label)) {
      toast.error(`"${label}" already exists in ${ALL_CATEGORIES.find(c => c.key === targetCat)?.label}`);
      setFormErrors({ label: "This option already exists in this category" });
      return;
    }
    
    try {
      const response = await api.post("/dropdown-options/admin", {
        category: targetCat,
        label: label,
      });
      
      if (response.data.id) {
        toast.success(`"${label}" added successfully`);
        setShowAddModal(false);
        if (targetCat === selectedCat) fetchCategory(selectedCat);
        fetchAll();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to add option";
      if (errorMsg.includes("already exists")) {
        toast.error(`"${label}" already exists in this category`);
        setFormErrors({ label: "This option already exists in this category" });
      } else if (errorMsg.includes("exceed 30 characters")) {
        toast.error("Label cannot exceed 30 characters");
        setFormErrors({ label: "Label cannot exceed 30 characters" });
      } else {
        toast.error(errorMsg);
      }
    }
  };

  // Batch helpers
  const updateBatchRow = (idx, field, val) => {
    setBatchRows(rows => rows.map((r, i) => {
      if (i !== idx) return r;
      return { ...r, [field]: val };
    }));
    // Clear batch errors when editing
    if (batchErrors.length > 0) {
      setBatchErrors([]);
    }
  };
  
  const addBatchRow = () => setBatchRows(r => [...r, emptyRow()]);
  const removeBatchRow = (idx) => setBatchRows(r => r.filter((_, i) => i !== idx));

  const handleAddBatch = async () => {
    const filled = batchRows.filter(r => r.label.trim());
    if (!filled.length) { 
      toast.error("Add at least one label"); 
      return; 
    }
    
    // Validate all rows
    const errors = [];
    const validRows = [];
    
    for (const row of filled) {
      const error = validateLabel(row.label);
      if (error) {
        errors.push({ row: row.id, error });
      } else {
        validRows.push(row);
      }
    }
    
    if (errors.length > 0) {
      toast.error(`${errors.length} row(s) have validation errors`);
      setBatchErrors(errors);
      return;
    }
    
    let created = 0;
    let skipped = 0;
    const skippedLabels = [];
    
    for (const row of validRows) {
      const label = row.label.trim();
      
      // Check if option already exists
      if (checkIfOptionExists(batchCategory, label)) {
        skipped++;
        skippedLabels.push(label);
        continue;
      }
      
      try {
        await api.post("/dropdown-options/admin", {
          category: batchCategory,
          label: label,
        });
        created++;
      } catch (err) {
        skipped++;
        skippedLabels.push(label);
      }
    }
    
    if (created > 0) {
      toast.success(`${created} option${created !== 1 ? "s" : ""} added successfully`);
    }
    if (skipped > 0) {
      toast.error(`${skipped} option${skipped !== 1 ? "s" : ""} skipped: ${skippedLabels.join(", ")}`);
    }
    
    setShowAddModal(false);
    if (batchCategory === selectedCat) fetchCategory(selectedCat);
    fetchAll();
  };

  // ── EDIT ──────────────────────────────────────────────────────────────────
  const openEdit = (opt) => {
    setEditTarget(opt);
    setForm({ label: opt.label, category: opt.category });
    setFormErrors({});
    setShowEditModal(true);
  };
  
  const handleEdit = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length) { 
      setFormErrors(errs); 
      return; 
    }
    
    const label = form.label.trim();
    
    // Check if the new label already exists (excluding current item)
    if (label.toLowerCase() !== editTarget.label.toLowerCase()) {
      const exists = allOptions.some(opt => 
        opt.category === editTarget.category && 
        opt.label.toLowerCase() === label.toLowerCase() &&
        opt.id !== editTarget.id
      );
      
      if (exists) {
        toast.error(`"${label}" already exists in this category`);
        setFormErrors({ label: "This option already exists in this category" });
        return;
      }
    }
    
    try {
      await api.put(`/dropdown-options/admin/${editTarget.id}`, {
        label: label,
      });
      toast.success("Option updated successfully");
      setShowEditModal(false);
      fetchCategory(selectedCat); 
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update");
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const openDelete = (opt) => { setDeleteTarget(opt); setShowDeleteModal(true); };
  const handleDelete = async () => {
    try {
      await api.delete(`/dropdown-options/admin/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.label}" deleted successfully`);
      setShowDeleteModal(false);
      fetchCategory(selectedCat); 
      fetchAll();
    } catch { 
      toast.error("Failed to delete"); 
    }
  };

  // ── TOGGLE ────────────────────────────────────────────────────────────────
  const handleToggle = async (opt) => {
    try { 
      await api.patch(`/dropdown-options/admin/${opt.id}/toggle`); 
      const newStatus = !opt.is_active;
      toast.success(`"${opt.label}" ${newStatus ? 'activated' : 'deactivated'}`);
      fetchCategory(selectedCat); 
      fetchAll(); 
    }
    catch { toast.error("Failed to toggle"); }
  };

  // ── IMPORT ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!importFile) { toast.error("Please select a CSV file"); return; }
    setImporting(true); 
    setImportResult(null);
    try {
      const fd = new FormData(); 
      fd.append("file", importFile);
      const res = await api.post("/dropdown-options/admin/bulk-import", fd, {
        headers: { "Content-Type": "multipart/form-data" }, 
        timeout: 30000,
      });
      setImportResult(res.data);
      
      // Show appropriate toast messages
      if (res.data.created > 0) {
        toast.success(`✅ ${res.data.created} new option${res.data.created > 1 ? 's' : ''} added`);
      }
      
      if (res.data.skipped > 0) {
        toast.error(`⏭ ${res.data.skipped} duplicate(s) skipped`);
      }
      
      if (res.data.created === 0 && res.data.skipped === 0) {
        toast.success("No changes - all entries already exist");
      }
      
      fetchCategory(selectedCat); 
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Import failed";
      toast.error(msg);
      setImportResult({ created: 0, skipped: 0, errors: [msg] });
    } finally { 
      setImporting(false); 
    }
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await api.get("/dropdown-options/admin/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url; 
      link.setAttribute("download", "dropdown_options.csv");
      document.body.appendChild(link); 
      link.click(); 
      link.remove();
      toast.success("CSV exported successfully");
    } catch { 
      toast.error("Export failed"); 
    }
  };

  const downloadTemplate = () => {
    const csv = [
      "category,label",
      "creator_category,UI/UX Designer",
      "creator_category,Photography",
      "primary_niche,Art & Design",
      "skill_category,Front-end",
      "platform,Instagram",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = "options_template.csv";
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    toast.success("Template downloaded");
  };

  // Input border styles
  const inputStyle = {
    border: isDarkMode ? "1.5px solid #6B7280" : "1.5px solid #9CA3AF",
    outline: "none",
    transition: "border-color 0.15s",
  };
  const onFocusInput = (e) => {
    e.currentTarget.style.borderColor = isDarkMode ? "#A78BFA" : "#7C3AED";
  };
  const onBlurInput = (e) => {
    e.currentTarget.style.borderColor = isDarkMode ? "#6B7280" : "#9CA3AF";
  };

  const currentCat = ALL_CATEGORIES.find(c => c.key === selectedCat);

  // ── Sidebar section renderer ──
  const renderCategoryList = (categories, title, IconComp) => {
    const key = title.toLowerCase();
    const isOpen = expandedSection === key;
    const total = categories.reduce((sum, c) => sum + countFor(c.key), 0);
    return (
      <div className="mb-3">
        <button
          onClick={() => setExpandedSection(isOpen ? null : key)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}
          style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f5ff" }}>
          <div className="flex items-center gap-2">
            <IconComp size={14} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />
            <span>{title}</span>
            <span className={`text-xs font-normal ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>({total})</span>
          </div>
          <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
        </button>

        {isOpen && (
          <div className="mt-1.5 space-y-0.5 pl-1.5">
            {categories.map(cat => {
              const active = selectedCat === cat.key;
              return (
                <button key={cat.key} onClick={() => setSelectedCat(cat.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${active
                    ? "bg-gradient-to-r from-[#3b0764] to-[#6d28d9] text-white shadow-sm"
                    : isDarkMode
                      ? "text-gray-400 hover:bg-gray-100/10 hover:text-gray-200"
                      : "text-gray-600 hover:bg-violet-50 hover:text-violet-900"
                    }`}>
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: cat.color, opacity: active ? 1 : 0.35 }} />
                    <span className="leading-snug">{cat.label}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className={`text-xs font-bold leading-tight ${active ? "text-white" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {countFor(cat.key)}
                    </span>
                    <span className={`text-[9px] leading-tight ${active ? "text-white/50" : isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {activeCountFor(cat.key)} on
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Button styles
  const btnGradient = "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)";
  const btnBorderStyle = isDarkMode
    ? { borderColor: "rgba(124, 58, 237, 0.45)", color: "rgba(255,255,255,0.8)", borderWidth: "1.5px", background: "rgba(124, 58, 237, 0.08)" }
    : { borderColor: "#8b5cf6", color: "#6d28d9", background: "#faf5ff", borderWidth: "1.5px" };

  // Character counter helper
  const getCharColor = (length) => {
    if (length === 0) return "text-gray-400";
    if (length > 25 && length < 30) return "text-yellow-500";
    if (length === 30) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className={`w-full h-full ${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="px-4 md:px-6 pt-0 pb-8 max-w-full mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-2xl lg:text-[32px] font-bold tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}>
              Manage Options
            </h1>
            <p className={`text-sm mt-1 max-w-[550px] ${isDarkMode ? "text-white/70" : "text-black/70"}`}>
              Control dropdown options for creators &amp; collaborators
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: isDarkMode ? "rgba(167,139,250,0.85)" : "#6d28d9" }}>
              Language &amp; Location managed by external APIs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ borderStyle: "solid", ...btnBorderStyle }}>
              <FileText size={14} /> Template
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ borderStyle: "solid", ...btnBorderStyle }}>
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => { setImportFile(null); setImportResult(null); setShowImportModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ borderStyle: "solid", ...btnBorderStyle }}>
              <Upload size={14} /> Bulk Import
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:opacity-90"
              style={{ background: btnGradient }}>
              <Plus size={14} /> Add Option
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Sidebar ── */}
          <div className={`w-full lg:w-64 shrink-0 rounded-xl ${isDarkMode ? 'bg-[#1a1a1a] border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-4`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>CATEGORIES</p>
            {renderCategoryList(CREATOR_CATEGORIES, "Creator", Users)}
            {renderCategoryList(COLLABORATOR_CATEGORIES, "Collaborator", UserCheck)}
            {renderCategoryList(PORTFOLIO_CATEGORIES, "Portfolio", FileText)}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }}>
              <div className="flex justify-between mb-1">
                <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total options</span>
                <span className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{allOptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Active</span>
                <span className="text-xs font-bold text-emerald-500">{allOptions.filter(o => o.is_active).length}</span>
              </div>
            </div>
          </div>

          {/* ── Main panel ── */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border border-gray-800' : 'bg-white border border-gray-200'}`}>

              {/* Category Heading and Search Section */}
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b"
                style={{ borderBottomColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
                <div className="flex items-center gap-2.5">
                  <h2 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-gray-800"}`}>{currentCat?.label}</h2>
                  <Badge role={currentCat?.role} isDark={isDarkMode} />
                  <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{filtered.length} items</span>
                </div>
                <div className="relative">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search options..."
                    className={`pl-9 pr-4 py-2 rounded-full text-sm w-full sm:w-64 outline-none transition-all shadow-sm ${
                      isDarkMode
                        ? "bg-[#1F2937] text-white placeholder-gray-500 border border-gray-600 focus:border-purple-500"
                        : "bg-white text-gray-900 placeholder-gray-400 border-2 border-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                    }`}
                  />
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw size={24} className="animate-spin text-purple-500" />
                </div>
              ) : currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <AlertCircle size={28} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{search ? "No matches found" : "No options yet — click Add Option"}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr
                          className={`text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}
                          style={isDarkMode
                            ? { background: "linear-gradient(90deg, #3b0764 0%, #2e1065 100%)" }
                            : { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}>
                          <th className="py-3 pl-6 pr-2 text-left text-[12px] font-semibold">S.NO.</th>
                          <th className="py-3 px-4 text-left text-[12px] font-semibold">Label</th>
                          <th className="py-3 px-4 text-center text-[12px] font-semibold">Status</th>
                          <th className="py-3 pr-6 pl-4 text-right text-[12px] font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((opt, i) => (
                          <tr key={opt.id}
                            className={`transition-all duration-150 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-purple-50'}`}
                            style={{ borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }}>
                            <td className={`py-3 pl-6 pr-2 text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {startIndex + i + 1}
                            </td>
                            <td className={`px-4 py-3 font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>{opt.label}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => handleToggle(opt)}
                                className="flex items-center gap-1 mx-auto text-xs font-semibold transition-all duration-200 hover:scale-105"
                                style={opt.is_active ? { color: "#10b981" } : { color: isDarkMode ? "rgba(255,255,255,0.25)" : "#9ca3af" }}>
                                {opt.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                {opt.is_active ? "On" : "Off"}
                              </button>
                            </td>
                            <td className="py-3 pr-6 pl-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => openEdit(opt)}
                                  className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                                  style={isDarkMode
                                    ? { color: "rgba(255,255,255,0.7)", background: "rgba(124,58,237,0.12)", border: "1.5px solid rgba(124,58,237,0.35)" }
                                    : { color: "#6b7280", background: "#f5f3ff", border: "1.5px solid #a78bfa" }}>
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => openDelete(opt)}
                                  className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                                  style={{ color: "#ef4444", background: isDarkMode ? "rgba(239,68,68,0.12)" : "#fff1f2", border: `1.5px solid ${isDarkMode ? "rgba(239,68,68,0.35)" : "#fca5a5"}` }}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages}
                    onPageChange={setCurrentPage} isDark={isDarkMode} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal title="Add Option" onClose={() => setShowAddModal(false)} isDark={isDarkMode} wide>
          <div className="flex rounded-xl p-1 mb-5"
            style={{
              background: isDarkMode ? "rgba(15, 15, 20, 0.5)" : "#f3f0ff",
              border: `2px solid ${isDarkMode ? "rgba(124, 58, 237, 0.3)" : "#c4b5fd"}`,
            }}>
            {[
              { id: "single", icon: Square, label: "Single" },
              { id: "batch", icon: Layers, label: "Batch" },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setAddTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${addTab === id
                  ? "text-white shadow-md"
                  : isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-violet-400 hover:text-violet-700"
                  }`}
                style={addTab === id ? { background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" } : {}}>
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {addTab === "single" && (
            <div className="space-y-4">
              <CategorySelect value={form.category}
                onChange={v => setForm(f => ({ ...f, category: v }))} isDark={isDarkMode} />

              <div style={{ borderTop: `2px solid ${isDarkMode ? "rgba(124,58,237,0.2)" : "#ede9fe"}` }} />

              <div>
                <div className="flex justify-between items-center">
                  <label className={`block text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Label <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-medium ${getCharColor(form.label.length)}`}>
                    {form.label.length}/30
                  </span>
                </div>
                <input 
                  value={form.label} 
                  onChange={e => handleLabelChange(e.target.value)}
                  placeholder="e.g. UI/UX Designer"
                  maxLength={30}
                  style={inputStyle} 
                  onFocus={onFocusInput} 
                  onBlur={onBlurInput}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm mt-1.5 ${isDarkMode ? "bg-[#1F2937] text-white" : "bg-white text-gray-900"} ${
                    form.label.length > 25 && form.label.length < 30 ? "border-yellow-500" : ""
                  } ${form.label.length === 30 ? "border-red-500" : ""}`} 
                />
                {formErrors.label && (
                  <p className="text-red-500 text-xs mt-1.5 font-semibold">{formErrors.label}</p>
                )}
                {!formErrors.label && form.label.length > 25 && form.label.length < 30 && (
                  <p className="text-yellow-500 text-xs mt-1 font-semibold">
                    ⚠ {30 - form.label.length} characters remaining
                  </p>
                )}
                {!formErrors.label && form.label.length === 30 && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    ⚠ Maximum length reached
                  </p>
                )}
                {!formErrors.label && form.label.length > 0 && form.label.length <= 25 && (
                  <p className="text-green-500 text-xs mt-1 font-semibold">
                    ✓ Valid length
                  </p>
                )}
              </div>

              <ModalFooter onCancel={() => setShowAddModal(false)}
                onConfirm={handleAddSingle} confirmLabel="Add Option" isDark={isDarkMode} />
            </div>
          )}

          {addTab === "batch" && (
            <div>
              <CategorySelect value={batchCategory} onChange={setBatchCategory} isDark={isDarkMode} />
              <p className={`text-xs mt-1.5 mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>All rows will be saved under this category</p>

              <div style={{ borderTop: `2px solid ${isDarkMode ? "rgba(124,58,237,0.2)" : "#ede9fe"}`, marginBottom: "12px" }} />

              <div className="grid grid-cols-[1fr_28px] gap-2 mb-2 px-0.5">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Label</p>
                <div />
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
                {batchRows.map((row, idx) => {
                  const error = batchErrors.find(e => e.row === row.id);
                  const charColor = getCharColor(row.label.length);
                  
                  return (
                    <div key={row.id} className="grid grid-cols-[1fr_28px] gap-2 items-start">
                      <div className="relative">
                        <input 
                          value={row.label}
                          onChange={e => updateBatchRow(idx, "label", e.target.value)}
                          placeholder={`Label ${idx + 1}`}
                          maxLength={30}
                          style={inputStyle} 
                          onFocus={onFocusInput} 
                          onBlur={onBlurInput}
                          className={`w-full px-3 py-2 rounded-lg text-xs pr-14 ${isDarkMode ? "bg-[#1F2937] text-white" : "bg-white text-gray-900"} ${
                            error ? "border-red-500" : ""
                          } ${row.label.length > 25 && row.label.length < 30 ? "border-yellow-500" : ""} ${row.label.length === 30 ? "border-red-500" : ""}`} 
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${charColor}`}>
                          {row.label.length}/30
                        </span>
                        {error && (
                          <p className="text-red-500 text-[10px] mt-0.5 font-medium">{error.error}</p>
                        )}
                      </div>
                      <button onClick={() => removeBatchRow(idx)} disabled={batchRows.length === 1}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${batchRows.length === 1 ? "opacity-20 cursor-not-allowed" : "hover:scale-110"}`}
                        style={{ color: "#ef4444", background: isDarkMode ? "rgba(239,68,68,0.12)" : "#fff1f2", border: `1.5px solid ${isDarkMode ? "rgba(239,68,68,0.35)" : "#fca5a5"}` }}>
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button onClick={addBatchRow}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:opacity-80"
                style={isDarkMode
                  ? { color: "#a78bfa", background: "rgba(124,58,237,0.12)", border: "1.5px solid rgba(124,58,237,0.4)" }
                  : { color: "#5b21b6", background: "#f5f3ff", border: "1.5px solid #a78bfa" }}>
                <Plus size={12} /> Add row
              </button>

              <div className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: `2px solid ${isDarkMode ? "rgba(124,58,237,0.2)" : "#ede9fe"}` }}>
                <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {batchRows.filter(r => r.label.trim()).length} of {batchRows.length} rows filled
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`}
                    style={isDarkMode
                      ? { border: "1.5px solid rgba(255,255,255,0.15)" }
                      : { border: "1.5px solid #a78bfa" }}>
                    Cancel
                  </button>
                  <button onClick={handleAddBatch}
                    className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}>
                    Add {batchRows.filter(r => r.label.trim()).length || ""} Options
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal title="Edit Option" onClose={() => setShowEditModal(false)} isDark={isDarkMode}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className={`block text-xs font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Label <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-medium ${getCharColor(form.label.length)}`}>
                  {form.label.length}/30
                </span>
              </div>
              <input 
                value={form.label} 
                onChange={e => handleLabelChange(e.target.value)}
                placeholder="e.g. UI/UX Designer"
                maxLength={30}
                style={inputStyle} 
                onFocus={onFocusInput} 
                onBlur={onBlurInput}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm mt-1.5 ${isDarkMode ? "bg-[#1F2937] text-white" : "bg-white text-gray-900"} ${
                  form.label.length > 25 && form.label.length < 30 ? "border-yellow-500" : ""
                } ${form.label.length === 30 ? "border-red-500" : ""}`} 
              />
              {formErrors.label && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">{formErrors.label}</p>
              )}
              {!formErrors.label && form.label.length > 25 && form.label.length < 30 && (
                <p className="text-yellow-500 text-xs mt-1 font-semibold">
                  ⚠ {30 - form.label.length} characters remaining
                </p>
              )}
              {!formErrors.label && form.label.length === 30 && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  ⚠ Maximum length reached
                </p>
              )}
            </div>
          </div>
          <ModalFooter onCancel={() => setShowEditModal(false)}
            onConfirm={handleEdit} confirmLabel="Save Changes" isDark={isDarkMode} />
        </Modal>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <Modal title="Delete Option" onClose={() => setShowDeleteModal(false)} isDark={isDarkMode} small>
          <p className={`text-sm mb-3 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>You're about to permanently delete:</p>
          <div className="px-4 py-3 rounded-xl mb-4"
            style={isDarkMode
              ? { background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.35)" }
              : { background: "#fff1f2", border: "1.5px solid #fca5a5" }}>
            <p className="font-semibold text-red-500 text-sm">{deleteTarget?.label}</p>
          </div>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            This cannot be undone. Profiles using this option won't be affected.
          </p>
          <ModalFooter onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete} confirmLabel="Delete" danger isDark={isDarkMode} />
        </Modal>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <Modal title="Bulk Import via CSV" onClose={() => setShowImportModal(false)} isDark={isDarkMode}>
          <div className="rounded-xl p-4 mb-4"
            style={isDarkMode
              ? { background: "rgba(124,58,237,0.08)", border: "1.5px solid rgba(124,58,237,0.35)" }
              : { background: "#faf5ff", border: "1.5px solid #c4b5fd" }}>
            <p className={`text-xs font-bold mb-1 ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}>CSV Format</p>
            <code className={`text-xs block font-medium ${isDarkMode ? "text-purple-300/75" : "text-purple-700"}`}>
              category, label
            </code>
            <p className={`text-xs mt-2 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Duplicates will be skipped automatically.</p>
            <p className={`text-xs mt-1.5 font-semibold ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
              ⚠ Labels must be 1-30 characters
            </p>
          </div>

          <div className="mb-4">
            <p className={`text-xs font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Valid categories</p>
            <div className="flex flex-wrap gap-1">
              {ALL_CATEGORIES.map(c => (
                <code key={c.key} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                  style={isDarkMode
                    ? { background: "rgba(15,15,20,0.5)", color: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(124,58,237,0.3)" }
                    : { background: "#f3f0ff", color: "#5b21b6", border: "1.5px solid #c4b5fd" }}>
                  {c.key}
                </code>
              ))}
            </div>
          </div>

          <div className="rounded-xl flex flex-col items-center justify-center py-8 mb-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={isDarkMode
              ? { border: `2px dashed ${importFile ? "#7c3aed" : "rgba(124,58,237,0.3)"}`, background: importFile ? "rgba(124,58,237,0.08)" : "transparent" }
              : { border: `2px dashed ${importFile ? "#6d28d9" : "#a78bfa"}`, background: importFile ? "#faf5ff" : "#fdfcff" }}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={e => setImportFile(e.target.files?.[0] || null)} />
            <Upload size={22} className={importFile ? "text-purple-500" : isDarkMode ? "text-gray-500" : "text-gray-400"} />
            <p className={`text-sm font-semibold mt-2 ${importFile ? (isDarkMode ? "text-purple-300" : "text-purple-700") : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {importFile ? importFile.name : "Click to select CSV file"}
            </p>
            {importFile && <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>{(importFile.size / 1024).toFixed(1)} KB</p>}
          </div>

          {importResult && (
            <div className="rounded-xl p-4 mb-4"
              style={isDarkMode
                ? { background: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.35)" }
                : { background: "#f0fdf4", border: "1.5px solid #86efac" }}>
              <p className="font-semibold text-emerald-500 text-sm mb-2">Import complete</p>
              <div className="flex gap-5 text-xs">
                <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>✅ Added: <strong>{importResult.created || 0}</strong></span>
                <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>⏭ Skipped: <strong>{importResult.skipped || 0}</strong></span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button onClick={downloadTemplate}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-violet-600 hover:text-violet-800"}`}>
              <Download size={12} /> Download template
            </button>
            <div className="flex gap-2">
              <button onClick={() => setShowImportModal(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`}
                style={isDarkMode
                  ? { border: "1.5px solid rgba(255,255,255,0.15)" }
                  : { border: "1.5px solid #a78bfa" }}>
                Cancel
              </button>
              <button onClick={handleImport} disabled={importing || !importFile}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:opacity-90 disabled:opacity-40 flex items-center gap-2 active:scale-95"
                style={{ background: "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}>
                {importing && <RefreshCw size={12} className="animate-spin" />}
                {importing ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, isDark, small = false, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`rounded-2xl shadow-2xl w-full overflow-hidden ${small ? "max-w-sm" : wide ? "max-w-lg" : "max-w-md"}`}
        style={isDark
          ? { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }
          : { background: "white", border: "1px solid #e5e7eb" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb" }}>
          <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
          <button onClick={onClose}
            className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110`}
            style={isDark
              ? { color: "#9ca3af", border: "1.5px solid rgba(255,255,255,0.12)" }
              : { color: "#6b7280", border: "1.5px solid #c4b5fd", background: "#faf5ff" }}>
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Modal footer ──────────────────────────────────────────────────────────────
function ModalFooter({ onCancel, onConfirm, confirmLabel, danger = false, isDark }) {
  return (
    <div className="flex justify-end gap-2 mt-5 pt-4"
      style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb" }}>
      <button onClick={onCancel}
        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
        style={isDark
          ? { border: "1.5px solid rgba(255,255,255,0.15)", color: "#9ca3af" }
          : { border: "1.5px solid #a78bfa", color: "#4b5563" }}>
        Cancel
      </button>
      <button onClick={onConfirm}
        className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-95"
        style={{ background: danger ? "linear-gradient(90deg, #991b1b 0%, #dc2626 100%)" : "linear-gradient(90deg, #4C1D95 0%, #5B21B6 100%)" }}>
        {confirmLabel}
      </button>
    </div>
  );
}