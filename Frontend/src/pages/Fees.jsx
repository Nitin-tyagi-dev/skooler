import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  CreditCard,
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  UserCheck
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const Fees = () => {
  const { user, academicYear } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'record', 'structures', 'ledger', 'pending'
  
  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [structures, setStructures] = useState([]); // local cache or built list
  const [students, setStudents] = useState([]);
  
  // Loader & Feedbacks
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [errorMsg, setErrorMsg] = useState("");

  // Record Payment inputs
  const [payClass, setPayClass] = useState("");
  const [payStudentId, setPayStudentId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payBalance, setPayBalance] = useState(0);

  // Fee Structure inputs
  const [structClass, setStructClass] = useState("");
  const [structComponents, setStructComponents] = useState([{ name: "", amount: "" }]);

  // Ledger Lookup inputs
  const [ledgerClass, setLedgerClass] = useState("");
  const [ledgerStudentId, setLedgerStudentId] = useState("");
  const [activeLedger, setActiveLedger] = useState(null);

  const isAdmin = user && user.role === "school_admin";
  const isAccountant = user && (user.role === "school_admin" || user.role === "accountant");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  // Pre-load essential reference data (like all students for selectors)
  const loadReferenceData = async () => {
    try {
      const res = await api.students.getAll();
      setStudents(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load reference student lists.");
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.fees.getDashboard(academicYear);
      setDashboardData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load billing dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.fees.getPending(academicYear);
      setPendingStudents(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to fetch pending balance list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboard();
    } else if (activeTab === "pending") {
      fetchPending();
    }
    setErrorMsg("");
  }, [activeTab, academicYear]);

  // Payment Recording Handlers
  const handlePayClassChange = (e) => {
    const val = e.target.value;
    setPayClass(val);
    setPayStudentId("");
    setPayBalance(0);
  };

  const handlePayStudentChange = async (e) => {
    const val = e.target.value;
    setPayStudentId(val);
    setPayBalance(0);
    if (!val) return;

    try {
      // Look up student ledger balance
      const ledger = await api.fees.getLedger(val, academicYear);
      if (ledger && ledger.ledger) {
        const total = ledger.ledger.totalFee;
        const paid = ledger.payments.reduce((sum, p) => sum + (p.type === "refund" ? -p.amount : p.amount), 0);
        setPayBalance(total - paid);
      }
    } catch (err) {
      setPayBalance(0);
      showNotification("danger", "No fee structure assigned to this class level yet.");
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!payStudentId || !payAmount) return;
    setLoading(true);
    setErrorMsg("");

    try {
      await api.fees.addPayment({
        studentId: payStudentId,
        academicYear,
        amount: parseFloat(payAmount),
      });
      showNotification("success", "Payment recorded successfully.");
      setPayAmount("");
      // Refresh balance
      handlePayStudentChange({ target: { value: payStudentId } });
    } catch (err) {
      setErrorMsg(err.message || "Failed to record payment. Check amount rule.");
    } finally {
      setLoading(false);
    }
  };

  // Fee Structure Handlers
  const addComponentRow = () => {
    setStructComponents((prev) => [...prev, { name: "", amount: "" }]);
  };

  const removeComponentRow = (index) => {
    if (structComponents.length === 1) return;
    setStructComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index, field, value) => {
    setStructComponents((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const submitStructure = async (e) => {
    e.preventDefault();
    if (!structClass) return;
    setLoading(true);
    setErrorMsg("");

    // Format components payload
    const formattedComponents = structComponents.map((comp) => ({
      name: comp.name,
      amount: parseFloat(comp.amount),
    }));

    try {
      await api.fees.createStructure({
        className: structClass,
        academicYear,
        components: formattedComponents,
      });
      showNotification("success", "Fee structure created for Class " + structClass);
      setStructClass("");
      setStructComponents([{ name: "", amount: "" }]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create fee structure.");
    } finally {
      setLoading(false);
    }
  };

  // Ledger Lookup Handlers
  const handleLedgerClassChange = (e) => {
    setLedgerClass(e.target.value);
    setLedgerStudentId("");
    setActiveLedger(null);
  };

  const handleLedgerStudentChange = async (e) => {
    const val = e.target.value;
    setLedgerStudentId(val);
    setActiveLedger(null);
    if (!val) return;

    setLoading(true);
    try {
      const ledger = await api.fees.getLedger(val, academicYear);
      setActiveLedger(ledger);
    } catch (err) {
      showNotification("danger", err.message || "Failed to retrieve student ledger details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (receiptNumber) => {
    if (!window.confirm("Verify: Do you want to process a full refund for Receipt #" + receiptNumber + "?")) return;
    setLoading(true);
    try {
      await api.fees.refundPayment({
        studentId: ledgerStudentId,
        academicYear,
        receiptNumber,
      });
      showNotification("success", "Refund processed successfully.");
      // Refresh ledger
      const ledger = await api.fees.getLedger(ledgerStudentId, academicYear);
      setActiveLedger(ledger);
    } catch (err) {
      showNotification("danger", err.message || "Failed to process refund request.");
    } finally {
      setLoading(false);
    }
  };

  // Class and Student dynamic helper queries
  const classesList = [...new Set(students.map((s) => s.className))].sort();
  
  const paymentStudents = students.filter(
    (s) => s.className === payClass && s.active
  );
  
  const ledgerStudents = students.filter(
    (s) => s.className === ledgerClass && s.active
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fees & Financials</h1>
          <p className="page-subtitle">Configure fee rules, register collections and process ledger summaries</p>
        </div>
      </div>

      {/* Floating notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type === "success" ? "success" : "default"}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tabs">
        <button onClick={() => setActiveTab("dashboard")} className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}>
          Collections Dashboard
        </button>
        <button onClick={() => setActiveTab("record")} className={`tab-btn ${activeTab === "record" ? "active" : ""}`}>
          Collect Payment
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab("structures")} className={`tab-btn ${activeTab === "structures" ? "active" : ""}`}>
            Set Fee Structures
          </button>
        )}
        <button onClick={() => setActiveTab("ledger")} className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}>
          Student Ledger Lookup
        </button>
        <button onClick={() => setActiveTab("pending")} className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}>
          Pending Balances
        </button>
      </div>

      {errorMsg && (
        <div className="alert-box alert-danger">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Contents */}

      {/* 1. Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div>
          {loading ? (
            <div>Loading billing analytics...</div>
          ) : dashboardData ? (
            <div>
              <div className="stats-grid">
                <div className="card stat-card">
                  <span className="stat-label">Total Billings Expected</span>
                  <span className="stat-value">${dashboardData.summary?.totalExpected?.toLocaleString() || 0}</span>
                  <span className="stat-desc">Based on structure mappings</span>
                </div>

                <div className="card stat-card">
                  <span className="stat-label">Total Fees Collected</span>
                  <span className="stat-value" style={{ color: "var(--accent-success)" }}>
                    ${dashboardData.summary?.totalCollected?.toLocaleString() || 0}
                  </span>
                  <span className="stat-desc">Cash & Bank collections</span>
                </div>

                <div className="card stat-card">
                  <span className="stat-label">Total Balances Outstanding</span>
                  <span className="stat-value" style={{ color: "var(--accent-warning)" }}>
                    ${dashboardData.summary?.totalPending?.toLocaleString() || 0}
                  </span>
                  <span className="stat-desc">Awaiting payments</span>
                </div>
              </div>

              {/* Collections by Class Aggregate */}
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Class Collections Aggregates</h3>
                {dashboardData.byClass && dashboardData.byClass.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Total Expected</th>
                          <th>Total Collected</th>
                          <th>Collection Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.byClass.map((c) => {
                          const rate = c.expected > 0 ? Math.round((c.collected / c.expected) * 100) : 0;
                          return (
                            <tr key={c.className}>
                              <td style={{ fontWeight: 600 }}>Class {c.className}</td>
                              <td>${c.expected.toLocaleString()}</td>
                              <td style={{ color: "var(--accent-success)", fontWeight: 600 }}>${c.collected.toLocaleString()}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-accent)", borderRadius: "3px", overflow: "hidden", minWidth: "100px" }}>
                                    <div style={{ height: "100%", backgroundColor: "var(--primary)", width: `${rate}%` }} />
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 700 }}>{rate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <span style={{ fontSize: "13px" }}>No class fee structures initialized yet.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span>Financial analytics data not loaded. Check connection.</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Record Payment Tab */}
      {activeTab === "record" && (
        <div className="card" style={{ maxWidth: "600px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>Record Fee Payment Transaction</h3>
          
          <form onSubmit={submitPayment}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Student Class</label>
                <select className="form-control" value={payClass} onChange={handlePayClassChange} required>
                  <option value="">Select Class</option>
                  {classesList.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Student Name</label>
                <select className="form-control" value={payStudentId} onChange={handlePayStudentChange} disabled={!payClass} required>
                  <option value="">Select Student</option>
                  {paymentStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            {payStudentId && (
              <div 
                style={{ 
                  margin: "12px 0 24px 0", 
                  padding: "16px", 
                  backgroundColor: "var(--bg-secondary)", 
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Active Academic Year</span>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>{academicYear}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>Pending Balance</span>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: payBalance > 0 ? "var(--accent-warning)" : "var(--accent-success)" }}>
                    ${payBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <Input
              label="Payment Amount ($)"
              id="payAmount"
              type="number"
              min="0.01"
              step="any"
              placeholder="Enter collected amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              disabled={!payStudentId || payBalance <= 0}
              required
            />

            <Button 
              type="submit" 
              loading={loading} 
              disabled={!payStudentId || payBalance <= 0 || !payAmount}
              style={{ width: "100%", marginTop: "8px" }}
            >
              Post Payment
            </Button>
          </form>
        </div>
      )}

      {/* 3. Fee Structures Tab (Admin Only) */}
      {activeTab === "structures" && isAdmin && (
        <div className="card" style={{ maxWidth: "700px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Configure Class Fee Structure</h3>
          
          <form onSubmit={submitStructure}>
            <div className="form-group" style={{ maxWidth: "250px" }}>
              <label className="form-label">Target Class Level</label>
              <input
                type="text"
                className="form-control"
                placeholder="E.g. 10"
                value={structClass}
                onChange={(e) => setStructClass(e.target.value)}
                required
              />
            </div>

            <div style={{ margin: "24px 0 16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Structure Subcomponents</span>
                <Button variant="secondary" size="sm" onClick={addComponentRow} className="gap-8">
                  <Plus size={12} /> Add Component
                </Button>
              </div>

              {structComponents.map((comp, idx) => (
                <div key={idx} className="grid-2 mb-16" style={{ gridTemplateColumns: "2fr 1fr auto", alignItems: "flex-end" }}>
                  <Input
                    label={idx === 0 ? "Fee Item Description" : ""}
                    id={`comp-name-${idx}`}
                    placeholder="E.g. Tuition Fee"
                    value={comp.name}
                    onChange={(e) => handleComponentChange(idx, "name", e.target.value)}
                    required
                  />
                  <Input
                    label={idx === 0 ? "Amount ($)" : ""}
                    id={`comp-amount-${idx}`}
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={comp.amount}
                    onChange={(e) => handleComponentChange(idx, "amount", e.target.value)}
                    required
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeComponentRow(idx)}
                    disabled={structComponents.length === 1}
                    style={{ marginBottom: "20px", height: "42px", display: "flex", alignSelf: "flex-end", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" loading={loading} style={{ width: "100%" }}>
              Save Fee Structure
            </Button>
          </form>
        </div>
      )}

      {/* 4. Ledger Lookup Tab */}
      {activeTab === "ledger" && (
        <div>
          <div className="card mb-16" style={{ display: "flex", gap: "16px" }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Search Student Class</label>
              <select className="form-control" value={ledgerClass} onChange={handleLedgerClassChange}>
                <option value="">Select Class</option>
                {classesList.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Student Profile</label>
              <select className="form-control" value={ledgerStudentId} onChange={handleLedgerStudentChange} disabled={!ledgerClass}>
                <option value="">Select Student</option>
                {ledgerStudents.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div>Retrieving student ledger...</div>
          ) : activeLedger ? (
            <div className="grid-2">
              {/* Ledger Summary */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700 }}>Fee Structure Components</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Year: {academicYear}</span>
                </div>
                
                {activeLedger.ledger?.structure?.components && activeLedger.ledger.structure.components.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {activeLedger.ledger.structure.components.map((c, i) => (
                      <div key={i} className="flex-between" style={{ fontSize: "14px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
                        <span style={{ fontWeight: 600 }}>${c.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex-between" style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color)", fontWeight: 700 }}>
                      <span>Total Expected Fee</span>
                      <span>${activeLedger.ledger.totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">No structures configured for this class context.</div>
                )}
              </div>

              {/* Transactions Ledger */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700 }}>Transaction History</h4>
                  <FileText size={16} className="text-muted" />
                </div>

                {activeLedger.payments && activeLedger.payments.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto" }}>
                    {activeLedger.payments.map((p) => (
                      <div 
                        key={p._id} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          padding: "10px 12px",
                          backgroundColor: p.type === "refund" ? "rgba(243, 18, 96, 0.05)" : "var(--bg-secondary)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-color)"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>
                              {p.type === "refund" ? "REFUND" : "PAYMENT"}
                            </span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              #{p.receiptNumber}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            {new Date(p.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontWeight: 800, color: p.type === "refund" ? "var(--accent-error)" : "var(--accent-success)" }}>
                            {p.type === "refund" ? "-" : "+"}${p.amount.toLocaleString()}
                          </span>
                          {isAdmin && p.type !== "refund" && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleRefund(p.receiptNumber)}
                              style={{ padding: "4px 8px", fontSize: "10px", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "20px" }}>
                    <span style={{ fontSize: "12px" }}>No transactions logged for this ledger.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span>Select a student class and profile to view billing ledgers.</span>
            </div>
          )}
        </div>
      )}

      {/* 5. Defaulters / Pending Balances Tab */}
      {activeTab === "pending" && (
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Outstanding Balances Report</h3>
          
          {loading ? (
            <div>Generating outstanding balance list...</div>
          ) : pendingStudents.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Expected</th>
                    <th>Total Paid</th>
                    <th>Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map((s) => (
                    <tr key={s.studentId?._id || s.studentId}>
                      <td style={{ fontWeight: 700 }}>{s.studentId?.rollNumber || "—"}</td>
                      <td style={{ fontWeight: 600 }}>{s.studentId?.name || "Student"}</td>
                      <td>Class {s.studentId?.className} - {s.studentId?.section?.toUpperCase()}</td>
                      <td>${s.totalFee.toLocaleString()}</td>
                      <td style={{ color: "var(--accent-success)", fontWeight: 500 }}>
                        ${s.totalPaid.toLocaleString()}
                      </td>
                      <td style={{ color: "var(--accent-warning)", fontWeight: 700 }}>
                        ${(s.totalFee - s.totalPaid).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span style={{ fontSize: "13px" }}>No outstanding balances detected for Academic Year {academicYear}!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Fees;
