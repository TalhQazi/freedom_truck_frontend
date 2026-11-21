import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Shield,
  Wrench,
  FileText,
  ChevronRight,
  MessageSquare,
  Send,
  Eye,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { taskApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export default function TaskManagement() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected task for drawer/modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [checklistState, setChecklistState] = useState<any[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [departmentFilter, statusFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (departmentFilter !== 'ALL') params.department = departmentFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      
      const res = await taskApi.getTasks(params);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    setChecklistState(task.checklist || []);
    setEvidenceNotes(task.evidenceNotes || '');
    setSupervisorNotes(task.supervisorReview?.notes || '');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleToggleChecklistItem = (index: number) => {
    const updated = [...checklistState];
    updated[index].completed = !updated[index].completed;
    if (updated[index].completed) {
      updated[index].completedBy = user?.name;
      updated[index].completedAt = new Date().toISOString();
    } else {
      updated[index].completedBy = undefined;
      updated[index].completedAt = undefined;
    }
    setChecklistState(updated);
  };

  const handleSaveProgress = async (newStatus?: string) => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      setActionSuccess(null);
      setActionError(null);

      const payload: any = {
        checklist: checklistState,
        evidenceNotes,
      };

      if (newStatus) {
        payload.status = newStatus;
      }

      const res = await taskApi.updateStatus(selectedTask._id, payload);
      setSelectedTask(res.data.task);
      setActionSuccess(`Task ${res.data.task.sopId} successfully updated.`);
      fetchTasks();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupervisorReview = async (approved: boolean) => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      setActionSuccess(null);
      setActionError(null);

      const res = await taskApi.reviewTask(selectedTask._id, {
        approved,
        notes: supervisorNotes,
      });

      setSelectedTask(res.data.task);
      setActionSuccess(
        approved
          ? `SOP ${selectedTask.sopId} verified & approved.`
          : `SOP ${selectedTask.sopId} flagged for revision.`
      );
      fetchTasks();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Review action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    try {
      const res = await taskApi.addComment(selectedTask._id, { text: newComment });
      setSelectedTask({
        ...selectedTask,
        comments: res.data.comments,
      });
      setNewComment('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.sopId?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.taskId?.toLowerCase().includes(q)
    );
  });

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'SERVICE_WRITER':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'TECHNICIAN':
      case 'QC_TECHNICIAN':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'OFFICE_ASSISTANT':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      default:
        return <CheckSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  const isSupervisor = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Standard Operating Procedure (SOP) Task Management
                <span className="text-sm px-2 py-0.5 rounded-md bg-white text-slate-500 border border-slate-200">
                  {filteredTasks.length} Tracked
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time execution, verification, and supervisory signoff of SW-001..015, TECH-001..013, and OFF-001..012.
              </p>
            </div>
          </div>
        </div>

        {/* Department Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
          {[
            { id: 'ALL', label: 'All SOPs' },
            { id: 'SERVICE_WRITER', label: 'Service Writer' },
            { id: 'TECHNICIAN', label: 'Technician' },
            { id: 'QC_TECHNICIAN', label: 'QC Tech' },
            { id: 'OFFICE_ASSISTANT', label: 'Office/Security' },
            { id: 'MANAGEMENT', label: 'Management' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDepartmentFilter(tab.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                departmentFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Task List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Table / List */}
        <div className={`space-y-4 ${selectedTask ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SOP ID (e.g. SW-004, TECH-002)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                    <th className="py-3 px-3">SOP ID</th>
                    <th className="py-3 px-3">Standard Operating Procedure</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Checklist</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Supervisor Review</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent mr-2" />
                        Loading SOP tasks...
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No tasks match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => {
                      const completedCount = t.checklist?.filter((c: any) => c.completed).length || 0;
                      const totalCount = t.checklist?.length || 0;
                      const isSelected = selectedTask?._id === t._id;

                      return (
                        <tr
                          key={t._id}
                          onClick={() => handleSelectTask(t)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border-l-2 border-l-indigo-500'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-indigo-600">
                              {t.sopId}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {t.taskId}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-900 line-clamp-1">{t.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                              {getDepartmentIcon(t.department)}
                              {t.department?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    completedCount === totalCount ? 'bg-emerald-500' : 'bg-indigo-500'
                                  }`}
                                  style={{
                                    width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {completedCount}/{totalCount}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {t.supervisorReview?.reviewedAt ? (
                              t.supervisorReview.approved ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <Check className="w-3.5 h-3.5" /> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <X className="w-3.5 h-3.5" /> Needs Rev
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-500">Unreviewed</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTask(t);
                              }}
                              className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Task Workspace / Detail Pane */}
        {selectedTask && (
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-5 sticky top-20">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {selectedTask.sopId}
                  </span>
                  <span className="text-sm text-slate-500">
                    {selectedTask.taskId}
                  </span>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1.5">
                  {selectedTask.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTask.description}
                </p>
              </div>

              <button aria-label="Close"
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications / Messages */}
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{actionError}</span>
              </div>
            )}

            {/* SOP Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Mandatory SOP Checklist Steps
                </h3>
                <span className="text-sm text-slate-500">
                  {checklistState.filter((c) => c.completed).length} / {checklistState.length} Done
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {checklistState.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklistItem(idx)}
                    className={`p-2.5 rounded-md border text-sm cursor-pointer flex items-start gap-2.5 transition-all ${
                      step.completed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => {}}
                      className="mt-0.5 rounded-md border-slate-200 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className={`block ${step.completed ? 'line-through text-slate-500' : ''}`}>
                        {step.stepText}
                      </span>
                      {step.completed && (
                        <span className="text-xs text-emerald-400/80 block mt-0.5">
                          Verified by {step.completedBy || user?.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & Completion Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Execution Evidence & Work Notes
              </label>
              <textarea
                rows={2}
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Record compliance evidence, part serial numbers, invoice # or authorization notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons for Worker */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveProgress('IN_PROGRESS')}
                className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-600 text-slate-900 text-sm font-semibold disabled:opacity-50"
              >
                Mark In Progress
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveProgress('COMPLETED')}
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Complete SOP Task
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveProgress()}
                className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold ml-auto"
              >
                Save Draft
              </button>
            </div>

            {/* Supervisor Review Section (Managers / Admins only) */}
            {isSupervisor && (
              <div className="p-4 bg-slate-50 rounded-lg border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-600 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Supervisor SOP Verification (Rule Enforcement)
                  </h4>
                  {selectedTask.supervisorReview?.reviewedAt && (
                    <span className="text-xs text-slate-500">
                      Reviewed by {selectedTask.supervisorReview.reviewerName}
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Supervisor review notes, verification findings, or revision requirements..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSupervisorReview(true)}
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold rounded-md flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Sign Off
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSupervisorReview(false)}
                    className="flex-1 py-1.5 bg-red-800 hover:bg-red-700 text-white text-sm font-bold rounded-md flex items-center justify-center gap-1 disabled:opacity-50 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* Comments Thread */}
            <div className="space-y-3 border-t border-slate-200 pt-3">
              <h4 className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                SOP Activity & Operational Notes ({selectedTask.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedTask.comments?.length > 0 ? (
                  selectedTask.comments.map((c: any, i: number) => (
                    <div key={i} className="p-2 rounded-md bg-slate-50 border border-slate-200 text-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{c.userName} ({c.role})</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No notes recorded yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add handoff note or query..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { TaskManagement };

