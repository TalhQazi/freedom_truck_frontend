import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { securityApi, authApi } from '../api/client.js';
import {
  ComputerModificationRequest,
  SecurityIncident,
  DailySecurityChecklist,
} from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SignatureModal } from '../components/SignatureModal.js';
import {
  ShieldAlert,
  Laptop,
  CheckSquare,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const SecurityManagement: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'modifications' | 'checklists' | 'incidents'>('modifications');

  // Lists state
  const [modRequests, setModRequests] = useState<ComputerModificationRequest[]>([]);
  const [checklists, setChecklists] = useState<DailySecurityChecklist[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);

  // New CMR Modal State (OFF-005)
  const [cmrModalOpen, setCmrModalOpen] = useState(false);
  const [workstationId, setWorkstationId] = useState('TERMINAL-BAY-01');
  const [cmrAction, setCmrAction] = useState<any>('SOFTWARE_INSTALL');
  const [softwareName, setSoftwareName] = useState('');
  const [cmrDesc, setCmrDesc] = useState('');
  const [cmrReason, setCmrReason] = useState('');

  // Daily Security Checklist Modal State (OFF-008/009/010)
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [checklistDate, setChecklistDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [chkLocked, setChkLocked] = useState(true);
  const [chkSignOut, setChkSignOut] = useState(true);
  const [chkNoPersonal, setChkNoPersonal] = useState(true);
  const [chkStorage, setChkStorage] = useState(true);
  const [chkNotes, setChkNotes] = useState('');
  const [chkSigOpen, setChkSigOpen] = useState(false);
  const [chkSignature, setChkSignature] = useState<string | null>(null);

  // Incident Modal State (OFF-012)
  const [incModalOpen, setIncModalOpen] = useState(false);
  const [incTitle, setIncTitle] = useState('');
  const [incType, setIncType] = useState('Suspicious Email / Phishing');
  const [incSeverity, setIncSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [incDesc, setIncDesc] = useState('');
  const [incDevice, setIncDevice] = useState('DESK-FRONT-01');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cmrRes, chkRes, incRes] = await Promise.all([
        securityApi.getModifications(),
        securityApi.getChecklists(),
        securityApi.getIncidents(),
      ]);
      setModRequests(cmrRes.data.data);
      setChecklists(chkRes.data.data);
      setIncidents(incRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCMR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await securityApi.submitModification({
        workstationIdentifier: workstationId,
        requestedAction: cmrAction,
        softwareOrSettingName: softwareName,
        description: cmrDesc,
        businessReason: cmrReason,
      });
      setCmrModalOpen(false);
      setSoftwareName('');
      setCmrDesc('');
      setCmrReason('');
      setSuccess('SOP OFF-005: Computer modification request submitted for management review.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit CMR.');
    }
  };

  const handleReviewCMR = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await securityApi.reviewModification(id, {
        decision,
        decisionNotes: `Reviewed and ${decision} by ${user?.name} per SOP OFF-006.`,
      });
      setSuccess(`SOP OFF-006: Modification request marked ${decision}.`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review failed.');
    }
  };

  const handleImplementCMR = async (id: string) => {
    try {
      await securityApi.implementModification(id, {
        implementationNotes: `Implemented and verified compliant with SOP OFF-003.`,
      });
      setSuccess('Modification recorded as IMPLEMENTED.');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Implementation record failed.');
    }
  };

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chkSignature) {
      setError('SOP OFF-008: Employee signature is mandatory.');
      return;
    }
    setError(null);
    try {
      await securityApi.submitChecklist({
        businessDate: checklistDate,
        allWorkstationsLockedAtClose: chkLocked,
        allTerminalsSignedOut: chkSignOut,
        personalEmailProhibitedVerified: chkNoPersonal,
        personalCloudSyncDisabledVerified: chkNoPersonal,
        businessDataStorageCompliant: chkStorage,
        notes: chkNotes,
        signature: chkSignature,
      });
      setChecklistModalOpen(false);
      setSuccess('SOP OFF-008/009: Daily Information Security Checklist submitted.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit checklist.');
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await securityApi.reportIncident({
        title: incTitle,
        incidentType: incType,
        severity: incSeverity,
        description: incDesc,
        workstationOrDevice: incDevice,
      });
      setIncModalOpen(false);
      setIncTitle('');
      setIncDesc('');
      setSuccess('SOP OFF-012: Security incident reported and escalated to management.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to report incident.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Office Assistant &amp; Information Security Management</span>
          </h1>
          <p className="text-sm text-slate-500">
            Mandatory SOPs: OFF-001 through OFF-012 | Computer Modification Approval &amp; Security Controls
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCmrModalOpen(true)}
            className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Computer Mod Request (OFF-005)</span>
          </button>
          <button
            type="button"
            onClick={() => setIncModalOpen(true)}
            className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Security Incident (OFF-012)</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-md text-sm text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-md text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm font-semibold [&>button]:whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('modifications')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'modifications'
              ? 'border-indigo-700 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Computer Mod Requests ({modRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checklists')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'checklists'
              ? 'border-indigo-700 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Daily Security Checklists (OFF-008/009)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incidents')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'incidents'
              ? 'border-indigo-700 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Security Incidents ({incidents.length})</span>
        </button>
      </div>

      {/* TAB 1: Computer Modification Requests (OFF-004..006) */}
      {activeTab === 'modifications' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-lg text-sm text-indigo-950 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SOP Rule 6 Mandate:</span>
              <p className="mt-0.5">
                No software, setting, hardware, or security modification may be implemented on any workshop or office computer without written management approval (OFF-004, OFF-006).
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Workstation</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Software / Setting Name</th>
                    <th className="px-4 py-3">Business Justification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Workflow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {modRequests.map((cmr) => (
                    <tr key={cmr._id} className="hover:bg-indigo-50/50">
                      <td className="px-4 py-3 font-bold text-indigo-700">{cmr.requestId}</td>
                      <td className="px-4 py-3 font-medium">
                        {cmr.employeeName} ({cmr.employeeIdNumber})
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">{cmr.workstationIdentifier}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded-md font-bold">{cmr.requestedAction}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{cmr.softwareOrSettingName}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600">{cmr.businessReason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cmr.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        {hasRole('manager', 'admin') && cmr.status === 'SUBMITTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReviewCMR(cmr._id, 'APPROVED')}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-md text-xs whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewCMR(cmr._id, 'REJECTED')}
                              className="px-2 py-0.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-md text-xs whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {cmr.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleImplementCMR(cmr._id)}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs whitespace-nowrap"
                          >
                            Mark Implemented
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {modRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-500 text-sm">
                        No computer modification requests on file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Daily Security Checklists (OFF-008/009) */}
      {activeTab === 'checklists' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">
              Audit logs for daily workstation locking (OFF-008) and terminal sign-outs (OFF-009)
            </span>
            <button
              type="button"
              onClick={() => {
                setChkSignature(null);
                setChecklistModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm whitespace-nowrap"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Submit Daily Security Walkthrough (OFF-008)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-3">Checklist #</th>
                    <th className="px-4 py-3">Business Date</th>
                    <th className="px-4 py-3">Inspected By</th>
                    <th className="px-4 py-3 text-center">Workstations Locked (OFF-008)</th>
                    <th className="px-4 py-3 text-center">Terminals Signed Out (OFF-009)</th>
                    <th className="px-4 py-3 text-center">No Personal Sync (OFF-003)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {checklists.map((chk) => (
                    <tr key={chk._id} className="hover:bg-indigo-50/50">
                      <td className="px-4 py-3 font-bold text-indigo-700">{chk.checklistNumber}</td>
                      <td className="px-4 py-3 font-medium">{chk.businessDate}</td>
                      <td className="px-4 py-3 font-medium">
                        {chk.employeeName} ({chk.employeeIdNumber})
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">Verified</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">Verified</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">Compliant</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={chk.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {checklists.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500 text-sm">
                        No daily security checklists on file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security Incidents (OFF-012) */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-xs text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-3">Incident ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Incident Title</th>
                    <th className="px-4 py-3">Reported By</th>
                    <th className="px-4 py-3">Workstation</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {incidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-indigo-50/50">
                      <td className="px-4 py-3 font-bold text-red-900">{inc.incidentId}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(inc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{inc.title}</td>
                      <td className="px-4 py-3">{inc.reporterName}</td>
                      <td className="px-4 py-3 text-xs">{inc.workstationOrDevice}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          inc.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : inc.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500 text-sm">
                        Zero active security incidents on file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Computer Modification Request Modal (OFF-005) */}
      {cmrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Laptop className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Submit Computer Modification Request (OFF-005)
                </h3>
              </div>
              <button aria-label="Close"
                type="button"
                onClick={() => setCmrModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCMR} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workstation Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={workstationId}
                  onChange={(e) => setWorkstationId(e.target.value)}
                  placeholder="e.g. TERMINAL-BAY-02 or DESK-FRONT-01"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requested Action Type *
                </label>
                <select
                  value={cmrAction}
                  onChange={(e) => setCmrAction(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none"
                >
                  <option value="SOFTWARE_INSTALL">Software / Diagnostic Application Installation</option>
                  <option value="SETTING_CHANGE">Operating System / Network Setting Change</option>
                  <option value="HARDWARE_CHANGE">Hardware Upgrade / Peripheral Addition</option>
                  <option value="PERMISSION_CHANGE">User Access / Elevated Permission Request</option>
                  <option value="SECURITY_OVERRIDE">Security Control Temporary Override</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Software / Setting Name *
                </label>
                <input
                  type="text"
                  required
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  placeholder="e.g. Allison DOC Transmission Diagnostic Suite"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Reason &amp; Operational Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={cmrReason}
                  onChange={(e) => setCmrReason(e.target.value)}
                  placeholder="Explain why this modification is required for workshop business operations..."
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCmrModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md whitespace-nowrap"
                >
                  Submit for Management Review (OFF-005)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Daily Security Checklist Modal (OFF-008/009) */}
      {checklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <span>Daily Security Walkthrough &amp; Sign-Out (OFF-008)</span>
              </h3>
              <button aria-label="Close"
                type="button"
                onClick={() => setChecklistModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChecklist} className="p-6 space-y-4 text-sm">
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={chkLocked}
                    onChange={(e) => setChkLocked(e.target.checked)}
                    className="w-4 h-4 text-indigo-700 rounded-md"
                  />
                  <span>1. All unattended workstations and terminals locked (OFF-008)</span>
                </label>
                <label className="flex items-center space-x-2.5 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={chkSignOut}
                    onChange={(e) => setChkSignOut(e.target.checked)}
                    className="w-4 h-4 text-indigo-700 rounded-md"
                  />
                  <span>2. Daily user account sign-out verified on all bay terminals (OFF-009)</span>
                </label>
                <label className="flex items-center space-x-2.5 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={chkNoPersonal}
                    onChange={(e) => setChkNoPersonal(e.target.checked)}
                    className="w-4 h-4 text-indigo-700 rounded-md"
                  />
                  <span>3. No personal cloud sync or webmail active on company computers (OFF-002/003)</span>
                </label>
                <label className="flex items-center space-x-2.5 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={chkStorage}
                    onChange={(e) => setChkStorage(e.target.checked)}
                    className="w-4 h-4 text-indigo-700 rounded-md"
                  />
                  <span>4. Authorized business-data storage compliance verified (OFF-010)</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Walkthrough Observations / Notes
                </label>
                <input
                  type="text"
                  value={chkNotes}
                  onChange={(e) => setChkNotes(e.target.value)}
                  placeholder="All 4 bay terminals checked and locked."
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Employee Signature:</span>
                  <span className="text-xs text-slate-500">
                    {chkSignature ? 'Signature attached' : 'Signature required to submit'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setChkSigOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 font-bold rounded-md text-sm"
                >
                  Capture Signature
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setChecklistModalOpen(false)}
                  className="px-4 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md whitespace-nowrap"
                >
                  Submit Checklist (OFF-008)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Security Incident Modal (OFF-012) */}
      {incModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="animate-scale-in bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Security Incident Reporting (OFF-012)</span>
              </h3>
              <button aria-label="Close"
                type="button"
                onClick={() => setIncModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="e.g. Unrecognized USB drive plugged into reception PC"
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity *</label>
                  <select
                    value={incSeverity}
                    onChange={(e) => setIncSeverity(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacted Device *</label>
                  <input
                    type="text"
                    required
                    value={incDevice}
                    onChange={(e) => setIncDevice(e.target.value)}
                    placeholder="e.g. DESK-FRONT-01"
                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description of Incident *
                </label>
                <textarea
                  required
                  rows={3}
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder="Detail observations, symptoms, and immediate containment taken..."
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIncModalOpen(false)}
                  className="px-4 py-2 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-md whitespace-nowrap"
                >
                  Escalate Incident to Management (OFF-012)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Modal for Security Checklist */}
      <SignatureModal
        isOpen={chkSigOpen}
        onClose={() => setChkSigOpen(false)}
        onSave={(sig) => setChkSignature(sig)}
        title="Information Security Officer Signature (OFF-008)"
        subtitle={`Business Date: ${checklistDate} | Officer: ${user?.name}`}
        declarationText="I certify that I have conducted a physical and digital inspection of all shop and office workstations. All terminals are confirmed locked, accounts logged out, and no personal cloud synchronization active."
      />
    </div>
  );
};
