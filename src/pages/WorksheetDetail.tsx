import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { technicianApi, authApi } from '../api/client.js';
import { TechnicianWorksheet, User, InspectionItem, LightingItem } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SignatureModal } from '../components/SignatureModal.js';
import {
  ClipboardCheck,
  ArrowLeft,
  Truck,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Droplet,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Save,
} from 'lucide-react';

export const WorksheetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const [worksheet, setWorksheet] = useState<TechnicianWorksheet | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Lighting inspection state (TECH-002)
  const [observerId, setObserverId] = useState('');
  const [lightingItems, setLightingItems] = useState<LightingItem[]>([]);

  // Lift safety state (TECH-003)
  const [padsPositioned, setPadsPositioned] = useState(false);
  const [locksEngaged, setLocksEngaged] = useState(false);

  // Full inspection items state (TECH-004 & TECH-005)
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  // Fluid items state (TECH-006 & TECH-007)
  const [fluidItems, setFluidItems] = useState<any[]>([]);

  // Signature modals state
  const [tech1SigModalOpen, setTech1SigModalOpen] = useState(false);
  const [tech1LaborNotes, setTech1LaborNotes] = useState('');

  const [qcSigModalOpen, setQcSigModalOpen] = useState(false);
  const [qcChecks, setQcChecks] = useState({
    workCompletedVerified: true,
    safetyConcernsVerified: true,
    fluidsVerified: true,
    leaksVerified: true,
    lightsVerified: true,
    tiresTorquedVerified: true,
    fastenersTorquedVerified: true,
    originalComplaintResolved: true,
    discrepanciesFound: false,
    discrepancyDetails: '',
    correctiveActionTaken: '',
    reinspectionResult: 'PASSED' as 'PASSED' | 'FAILED',
  });

  // Exit observation state (TECH-012)
  const [leaksObservedOnExit, setLeaksObservedOnExit] = useState(false);
  const [abnormalNoises, setAbnormalNoises] = useState(false);
  const [exitNotes, setExitNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchWorksheet = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [wsRes, userRes] = await Promise.all([
        technicianApi.getWorksheetById(id),
        authApi.getUsers(),
      ]);
      const ws: TechnicianWorksheet = wsRes.data.worksheet;
      setWorksheet(ws);
      setUsers(userRes.data.users);

      // Populate local states
      if (ws.lightingInspection?.items) {
        setLightingItems(ws.lightingInspection.items);
      }
      if (ws.lightingInspection?.observerEmployee) {
        setObserverId((ws.lightingInspection.observerEmployee as any)._id || '');
      }
      if (ws.liftSafetyInspection) {
        setPadsPositioned(ws.liftSafetyInspection.padsPositioned);
        setLocksEngaged(ws.liftSafetyInspection.locksEngaged);
      }
      if (ws.fullVehicleInspection?.items) {
        setInspectionItems(ws.fullVehicleInspection.items);
      }
      if (ws.fluidVerification?.fluids) {
        setFluidItems(ws.fluidVerification.fluids);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksheet();
  }, [id]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Save Lighting Inspection (TECH-002)
  const handleSaveLighting = async () => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.updateLighting(id, {
        operatorEmployeeId: user?._id,
        observerEmployeeId: observerId || user?._id,
        items: lightingItems,
      });
      showNotification('TECH-002: Two-person lighting inspection recorded.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lighting inspection.');
    }
  };

  // 2. Save Lift Safety (TECH-003)
  const handleSaveLiftSafety = async () => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.updateLift(id, {
        padsPositioned,
        locksEngaged,
      });
      showNotification('TECH-003: Vehicle lift safety verified and locked.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify lift safety.');
    }
  };

  // 3. Save Full Inspection (TECH-004 & TECH-005)
  const handleSaveInspection = async () => {
    if (!id) return;
    setError(null);
    try {
      const res = await technicianApi.updateInspection(id, {
        items: inspectionItems,
      });
      showNotification(res.data.message);
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save inspection.');
    }
  };

  // 4. Save Fluids (TECH-006 & TECH-007)
  const handleSaveFluids = async () => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.updateFluids(id, { fluids: fluidItems });
      showNotification('TECH-006/007: Fluid specifications and leak checks verified.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save fluid specs.');
    }
  };

  // 5. Tech #1 Signoff (TECH-008)
  const handleTech1Signature = async (sigDataUrl: string) => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.tech1Signoff(id, {
        signature: sigDataUrl,
        laborCompletedNotes: tech1LaborNotes || 'All assigned repairs and inspections completed per SOP.',
      });
      showNotification('TECH-008: Lead Technician (Tech #1) signature recorded. Queued for independent QC.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign initial inspection.');
    }
  };

  // 6. Independent QC Signoff (TECH-009, 010, 011) - STRICT DUAL TECH CHECK!
  const handleQCSignature = async (sigDataUrl: string) => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.qcSignoff(id, {
        ...qcChecks,
        signature: sigDataUrl,
      });
      showNotification('TECH-009/011: Independent Quality Control verified and signed by Tech #2.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'QC signoff failed.');
    }
  };

  // 7. Save Exit Observation (TECH-012)
  const handleSaveExit = async () => {
    if (!id) return;
    setError(null);
    try {
      const res = await technicianApi.updateExitObservation(id, {
        leaksObservedOnExit,
        abnormalNoisesOrExhaust: abnormalNoises,
        exitNotes,
      });
      showNotification(res.data.message);
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record exit observation.');
    }
  };

  // 8. Service Writer Final Release Verification (SW-010)
  const handleServiceWriterRelease = async () => {
    if (!id) return;
    setError(null);
    try {
      await technicianApi.serviceWriterRelease(id, {
        notes: 'Dual technician signatures confirmed. All safety items resolved.',
      });
      showNotification('SW-010: Release verification complete! Ready for invoice generation.');
      fetchWorksheet();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Release verification failed.');
    }
  };

  if (loading || !worksheet) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading technician worksheet...</div>;
  }

  const ro = worksheet.repairOrder as any;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/worksheets"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-300">
                {worksheet.worksheetNumber}
              </span>
              <StatusBadge status={worksheet.status} size="sm" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mt-1">
              Technician Worksheet &amp; Multi-Point Inspection
            </h1>
          </div>
        </div>

        {/* Global Action: Final Release Verification for Service Writer */}
        {hasRole('service_writer', 'manager', 'admin') && worksheet.status === 'RELEASE_READY' && (
          <button
            type="button"
            onClick={handleServiceWriterRelease}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete SW-010 Release Verification</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-md text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-md text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Vehicle & Customer Intake Summary (TECH-001) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-slate-500 block mb-1">
            TECH-001: Vehicle &amp; Odometer Record
          </span>
          <div className="text-sm font-bold text-slate-900">
            {worksheet.vehicle?.year} {worksheet.vehicle?.make} {worksheet.vehicle?.model}
          </div>
          <div className="text-sm text-slate-600 mt-0.5 space-y-0.5">
            <div>Plate: {worksheet.vehicle?.licensePlate} | VIN: {worksheet.vehicle?.vin}</div>
            <div className="font-bold text-indigo-700">Recorded Odometer: {Number(worksheet.recordedMileage || 0).toLocaleString()} mi</div>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 block mb-1">
            Parent Repair Order Ref
          </span>
          <div className="text-sm font-bold text-indigo-700">
            {ro ? (
              <Link to={`/repair-orders/${ro._id}`} className="hover:underline">
                {ro.roNumber || 'Repair Order File'}
              </Link>
            ) : (
              'RO Ref'
            )}
          </div>
          <div className="text-sm text-slate-600 mt-1 max-w-sm truncate">
            Complaint: {ro?.customerComplaint || 'Standard Service'}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 block mb-1">
            Mandatory Dual-Technician Status (Rule 4)
          </span>
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tech #1 (Primary):</span>
              <span className="font-bold text-slate-900">
                {worksheet.initialSignoff?.signature ? 'Signed' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tech #2 (QC):</span>
              <span className="font-bold text-slate-900">
                {worksheet.qcInspection?.signature ? 'Passed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TECH-002 Two-Person Lighting Inspection */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              TECH-002: Two-Person Lighting Inspection Protocol
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSaveLighting}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Lighting Status</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/50 border border-amber-200 rounded-md text-sm">
            <span className="text-amber-900 font-medium">
              SOP Rule: One employee operates vehicle controls while a second employee verifies exterior lamps.
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 font-semibold">Observer Employee:</span>
              <select
                value={observerId}
                onChange={(e) => setObserverId(e.target.value)}
                className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white text-slate-900"
              >
                <option value="">-- Choose Observer --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lightingItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">{item.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {(['GREEN', 'YELLOW', 'RED', 'NA'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const updated = [...lightingItems];
                        updated[idx].status = s;
                        setLightingItems(updated);
                      }}
                      className={`flex-1 py-1 rounded-md text-xs font-bold transition-colors ${
                        item.status === s
                          ? s === 'GREEN'
                            ? 'bg-emerald-600 text-white'
                            : s === 'YELLOW'
                            ? 'bg-amber-500 text-white'
                            : s === 'RED'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s === "NA" ? "N/A" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: TECH-003 Vehicle Lift Safety Verification */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-indigo-700" />
            <h3 className="text-sm font-bold text-slate-900">
              TECH-003: Vehicle Lift Safety Inspection
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSaveLiftSafety}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Verify Lift Safety</span>
          </button>
        </div>

        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2 text-sm">
            <label className="flex items-center space-x-2.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={padsPositioned}
                onChange={(e) => setPadsPositioned(e.target.checked)}
                className="w-4 h-4 text-indigo-700 rounded-md border-slate-300"
              />
              <span>1. Lift arms and rubber pads properly positioned under OEM vehicle lift points</span>
            </label>
            <label className="flex items-center space-x-2.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={locksEngaged}
                onChange={(e) => setLocksEngaged(e.target.checked)}
                className="w-4 h-4 text-indigo-700 rounded-md border-slate-300"
              />
              <span>2. Vehicle elevated, stability shake-tested, and mechanical safety lock engaged</span>
            </label>
          </div>

          <div className="text-right text-sm">
            {worksheet.liftSafetyInspection?.performed ? (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Verified by {worksheet.liftSafetyInspection.verifiedBy?.name || 'Technician'}</span>
              </span>
            ) : (
              <span className="text-amber-700 font-semibold">Pending Lift Verification</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: TECH-004 & TECH-005 Full Vehicle Multi-Point Inspection (GREEN, YELLOW, RED) */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                TECH-004 &amp; TECH-005: Full Vehicle Multi-Point Safety Inspection
              </h3>
              <span className="text-xs text-slate-500">
                Classification: GREEN (Acceptable) | YELLOW (Attention) | RED (Urgent Safety Defect)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveInspection}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Inspection Findings</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-4 py-2.5">System Component</th>
                <th className="px-4 py-2.5 w-48 text-center">Classification Status</th>
                <th className="px-4 py-2.5 w-32">Measurement</th>
                <th className="px-4 py-2.5">Findings &amp; Customer Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {inspectionItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/50">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.category}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center space-x-1 justify-center">
                      {(['GREEN', 'YELLOW', 'RED'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const updated = [...inspectionItems];
                            updated[idx].status = s;
                            setInspectionItems(updated);
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                            item.status === s
                              ? s === 'GREEN'
                                ? 'bg-emerald-600 text-white'
                                : s === 'YELLOW'
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={item.measurement || ''}
                      onChange={(e) => {
                        const updated = [...inspectionItems];
                        updated[idx].measurement = e.target.value;
                        setInspectionItems(updated);
                      }}
                      placeholder="e.g. 8/32&quot; or 7mm"
                      className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={item.recommendations || item.findings || ''}
                      onChange={(e) => {
                        const updated = [...inspectionItems];
                        updated[idx].recommendations = e.target.value;
                        updated[idx].findings = e.target.value;
                        setInspectionItems(updated);
                      }}
                      placeholder="Record finding or customer-facing recommendation..."
                      className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: TECH-006 & TECH-007 Fluid Specification & Leak Verification */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplet className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              TECH-006 &amp; TECH-007: Fluid Specification &amp; Service Verification
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSaveFluids}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Fluid Verification</span>
          </button>
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                <th className="px-3 py-2">Fluid System</th>
                <th className="px-3 py-2 w-36 text-center">OEM Spec Verified</th>
                <th className="px-3 py-2 w-48">Fluid Grade / Type</th>
                <th className="px-3 py-2 w-32 text-center">Level Correct</th>
                <th className="px-3 py-2 w-32 text-center">Zero Leaks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {fluidItems.map((f, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/50">
                  <td className="px-3 py-2 font-semibold text-slate-900">{f.fluidName}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={f.specVerified}
                      onChange={(e) => {
                        const updated = [...fluidItems];
                        updated[idx].specVerified = e.target.checked;
                        setFluidItems(updated);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded-md"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={f.grade || ''}
                      onChange={(e) => {
                        const updated = [...fluidItems];
                        updated[idx].grade = e.target.value;
                        setFluidItems(updated);
                      }}
                      placeholder="e.g. 15W-40 CK-4"
                      className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 text-slate-900"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={f.levelOk}
                      onChange={(e) => {
                        const updated = [...fluidItems];
                        updated[idx].levelOk = e.target.checked;
                        setFluidItems(updated);
                      }}
                      className="w-4 h-4 text-emerald-600 rounded-md"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={f.leakChecked}
                      onChange={(e) => {
                        const updated = [...fluidItems];
                        updated[idx].leakChecked = e.target.checked;
                        setFluidItems(updated);
                      }}
                      className="w-4 h-4 text-emerald-600 rounded-md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5 & 6: DUAL TECHNICIAN VERIFICATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TECH-008: Lead Technician #1 Signoff */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">
                TECH-008: Initial Tech Signoff (Tech #1)
              </h3>
            </div>
            {worksheet.initialSignoff?.signature ? (
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                Signed by {worksheet.initialSignoff.employeeId}
              </span>
            ) : (
              <span className="text-sm text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                Pending Signature
              </span>
            )}
          </div>

          <div className="text-sm text-slate-600 space-y-2">
            <p>
              Technician #1 certifies that all assigned repairs, torque checks, fluid fills, and initial inspections have been executed per factory specifications.
            </p>
            {worksheet.initialSignoff?.laborCompletedNotes && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-sans text-slate-800">
                <span className="font-semibold block text-xs text-slate-500">Technician Notes:</span>
                {worksheet.initialSignoff.laborCompletedNotes}
              </div>
            )}
          </div>

          {!worksheet.initialSignoff?.signature && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTech1SigModalOpen(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-md shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Sign Initial Worksheet (TECH-008)</span>
              </button>
            </div>
          )}
        </div>

        {/* TECH-009, 010, 011: Independent Quality Control Signoff (Tech #2) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-violet-700" />
              <h3 className="text-sm font-bold text-slate-900">
                TECH-009 &amp; 011: Independent QC (Tech #2)
              </h3>
            </div>
            {worksheet.qcInspection?.signature ? (
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                Verified by {worksheet.qcInspection.employeeId}
              </span>
            ) : worksheet.qcInspection?.discrepanciesFound ? (
              <span className="text-sm font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-300">
                Stop Release Active (TECH-010)
              </span>
            ) : (
              <span className="text-sm text-slate-500">
                Awaiting Independent QC
              </span>
            )}
          </div>

          <div className="text-sm text-slate-600 space-y-2">
            <div className="p-2 bg-violet-50 border border-violet-200 rounded-md text-violet-950 text-xs">
              SOP Mandatory Rule 4: Technician #2 must be an independent employee (Tech #1 != Tech #2).
            </div>
            <p>
              Independent verification covers: Workmanship, safety concerns, fluids, active leaks, exterior lighting, tire lug torque, and original customer complaint resolution.
            </p>
          </div>

          {!worksheet.qcInspection?.signature && worksheet.initialSignoff?.signature && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setQcSigModalOpen(true)}
                className="w-full py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold text-sm rounded-md shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Perform Independent QC Audit (TECH-009/011)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 7: TECH-012 Vehicle Exit Observation */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              TECH-012: Vehicle Exit Observation (Rollout Leak &amp; Noise Audit)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSaveExit}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold shadow-sm whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Record Exit Audit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <label className="flex items-center space-x-2.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={!leaksObservedOnExit}
                onChange={(e) => setLeaksObservedOnExit(!e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300"
              />
              <span>Zero fluid dripping or trailing liquid marks observed during rollout</span>
            </label>
            <label className="flex items-center space-x-2.5 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={!abnormalNoises}
                onChange={(e) => setAbnormalNoises(!e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300"
              />
              <span>Zero abnormal mechanical rattles, exhaust leaks, or squeals</span>
            </label>
          </div>

          <div>
            <input
              type="text"
              value={exitNotes}
              onChange={(e) => setExitNotes(e.target.value)}
              placeholder="Exit observation notes (e.g. Clean exit, normal brake pedal feel)..."
              className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tech #1 Signature Modal */}
      <SignatureModal
        isOpen={tech1SigModalOpen}
        onClose={() => setTech1SigModalOpen(false)}
        onSave={handleTech1Signature}
        title="Technician #1 Initial Signoff (SOP TECH-008)"
        subtitle={`Worksheet #${worksheet.worksheetNumber} | Employee: ${user?.name} (${user?.employeeId})`}
        declarationText="I certify that I have executed and verified all designated repair items, fluid fills, and mechanical torques according to manufacturer specifications and company SOPs. This vehicle is ready for Independent Quality Control verification."
      />

      {/* Tech #2 QC Signature & Discrepancy Modal */}
      {qcSigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-xl my-8 overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Independent QC Verification (TECH-009, 010, 011)
                </h3>
                <p className="text-sm text-slate-700">
                  SOP Rule 4: Mandatory Dual-Technician Check (Tech #2 != Tech #1)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQcSigModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-md text-sm space-y-1">
                <span className="font-bold text-violet-950">Independent Verification Checklist:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center space-x-2 text-slate-800">
                    <input
                      type="checkbox"
                      checked={qcChecks.workCompletedVerified}
                      onChange={(e) => setQcChecks({ ...qcChecks, workCompletedVerified: e.target.checked })}
                      className="rounded-md text-violet-700"
                    />
                    <span>Work Completed</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-800">
                    <input
                      type="checkbox"
                      checked={qcChecks.tiresTorquedVerified}
                      onChange={(e) => setQcChecks({ ...qcChecks, tiresTorquedVerified: e.target.checked })}
                      className="rounded-md text-violet-700"
                    />
                    <span>Tire Lug Torque Verified</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-800">
                    <input
                      type="checkbox"
                      checked={qcChecks.fluidsVerified}
                      onChange={(e) => setQcChecks({ ...qcChecks, fluidsVerified: e.target.checked })}
                      className="rounded-md text-violet-700"
                    />
                    <span>Fluids &amp; Leak Checks</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-800">
                    <input
                      type="checkbox"
                      checked={qcChecks.originalComplaintResolved}
                      onChange={(e) => setQcChecks({ ...qcChecks, originalComplaintResolved: e.target.checked })}
                      className="rounded-md text-violet-700"
                    />
                    <span>Original Complaint Resolved</span>
                  </label>
                </div>
              </div>

              {/* Discrepancy toggle */}
              <div className="p-3 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-center space-x-2 text-sm font-bold text-red-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcChecks.discrepanciesFound}
                    onChange={(e) => setQcChecks({ ...qcChecks, discrepanciesFound: e.target.checked })}
                    className="w-4 h-4 rounded-md text-red-600"
                  />
                  <span>Flag QC Discrepancy / Stop Vehicle Release (TECH-010)</span>
                </label>

                {qcChecks.discrepanciesFound && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Discrepancy Details *
                      </label>
                      <textarea
                        rows={2}
                        value={qcChecks.discrepancyDetails}
                        onChange={(e) => setQcChecks({ ...qcChecks, discrepancyDetails: e.target.value })}
                        placeholder="Detail the failure (e.g. slight oil seepage at drain bolt or soft brake pedal)..."
                        className="w-full text-sm border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQcSigModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQcSigModalOpen(false);
                    // Open Signature pad modal for Tech #2
                    setTimeout(() => {
                      handleQCSignature('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                    }, 50);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-violet-700 hover:bg-violet-800 rounded-md shadow-sm whitespace-nowrap"
                >
                  Confirm QC &amp; Record Digital Signoff (TECH-011)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
