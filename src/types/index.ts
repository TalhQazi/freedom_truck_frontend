export type UserRole =
  | 'service_writer'
  | 'technician'
  | 'qc_technician'
  | 'office_assistant'
  | 'manager'
  | 'admin';

export interface User {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department: string;
  status: 'active' | 'inactive';
  passwordPolicyAcknowledged?: boolean;
  workstationLockedAcknowledged?: boolean;
}

export interface Customer {
  _id: string;
  customerNumber: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  status: 'active' | 'inactive' | 'vip' | 'flagged';
  registrationDate: string;
  vehicles?: Vehicle[];
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  customer: Customer | string;
  vin: string;
  licensePlate: string;
  year: number;
  make: string;
  model: string;
  subModel?: string;
  engine?: string;
  color?: string;
  currentMileage: number;
  previousMileage?: number;
  unitNumber?: string;
  registrationDetails?: {
    state?: string;
    expirationDate?: string;
  };
  outstandingIssues?: string[];
  createdAt: string;
}

export interface EstimateLineItem {
  itemType: 'part' | 'tire' | 'labor' | 'sublet' | 'fee';
  description: string;
  partNumber?: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  laborHours?: number;
  laborRatePerHour?: number;
  subtotal: number;
  markupApplied?: number;
}

export interface Estimate {
  _id: string;
  estimateNumber: string;
  version: number;
  customer: Customer;
  vehicle: Vehicle;
  repairOrder?: string | RepairOrder;
  mileageIn: number;
  customerComplaint: string;
  requestedServices: string[];
  lineItems: EstimateLineItem[];
  partsTotal: number;
  tiresTotal: number;
  laborTotal: number;
  shopSupplies: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  depositRequired: number;
  depositMet: boolean;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REVISED' | 'DECLINED';
  createdBy: User;
  notes?: string;
  createdAt: string;
}

export interface Authorization {
  _id: string;
  authorizationNumber: string;
  repairOrder: string;
  estimate: string;
  customer: Customer;
  authorizedTotal: number;
  approvedItems: string[];
  customerSignature: string;
  customerSignerName: string;
  signerPhone?: string;
  signedAt: string;
  authorizationType: 'INITIAL' | 'ADDITIONAL_WORK';
  serviceWriterWitness: User;
  termsAccepted: boolean;
  notes?: string;
}

export interface Deposit {
  _id: string;
  depositNumber: string;
  repairOrder: string;
  estimate: string;
  customer: Customer;
  requiredAmount: number;
  paidAmount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'FLEET_ACCOUNT';
  transactionReference?: string;
  collectedBy: User;
  collectedAt: string;
  status: 'PAID' | 'REFUNDED' | 'APPLIED_TO_INVOICE';
  notes?: string;
}

export type RepairOrderStatus =
  | 'INTAKE'
  | 'ESTIMATE_PENDING'
  | 'ESTIMATE_CREATED'
  | 'AUTHORIZATION_PENDING'
  | 'AUTHORIZED'
  | 'DEPOSIT_REQUIRED'
  | 'DEPOSIT_PAID'
  | 'DISPATCHED'
  | 'INSPECTION_IN_PROGRESS'
  | 'REPAIR_IN_PROGRESS'
  | 'TECH1_SIGNED'
  | 'QC_PENDING'
  | 'QC_IN_PROGRESS'
  | 'QC_DISCREPANCY'
  | 'REINSPECTED'
  | 'QC_APPROVED'
  | 'EXIT_OBSERVED'
  | 'READY_FOR_INVOICE'
  | 'INVOICED'
  | 'PAID'
  | 'RELEASED'
  | 'CLOSED';

export interface RepairOrder {
  _id: string;
  roNumber: string;
  customer: Customer;
  vehicle: Vehicle;
  mileageIn: number;
  mileageOut?: number;
  customerComplaint: string;
  requestedServices: string[];
  currentEstimate?: Estimate;
  authorization?: Authorization;
  additionalAuthorizations?: Authorization[];
  deposit?: Deposit;
  status: RepairOrderStatus;
  serviceWriter: User;
  assignedTechnician?: User;
  qcTechnician?: User;
  dispatchedAt?: string;
  worksheet?: TechnicianWorksheet | string;
  invoice?: Invoice | string;
  hasSafetyConcerns?: boolean;
  unresolvedSafetyCount?: number;
  timeline: {
    status: RepairOrderStatus;
    timestamp: string;
    performedBy: User;
    notes?: string;
  }[];
  overrideHistory?: {
    action: string;
    reason: string;
    managerId: User;
    timestamp: string;
    correctiveAction: string;
  }[];
  notes?: string;
  createdAt: string;
}

export interface InspectionItem {
  name: string;
  category: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  measurement?: string;
  findings?: string;
  recommendations?: string;
}

export interface LightingItem {
  name: string;
  status: 'GREEN' | 'YELLOW' | 'RED' | 'NA';
  notes?: string;
}

export interface FluidCheckItem {
  fluidName: string;
  specVerified: boolean;
  fluidType?: string;
  grade?: string;
  capacity?: string;
  levelOk: boolean;
  leakChecked: boolean;
  notes?: string;
}

export interface TechnicianWorksheet {
  _id: string;
  worksheetNumber: string;
  repairOrder: RepairOrder | string;
  vehicle: Vehicle;
  customer: Customer;
  recordedMileage: number;
  lightingInspection: {
    performed: boolean;
    operatorEmployee?: User;
    observerEmployee?: User;
    items: LightingItem[];
  };
  liftSafetyInspection: {
    performed: boolean;
    padsPositioned: boolean;
    locksEngaged: boolean;
    verifiedBy?: User;
    verifiedAt?: string;
  };
  fullVehicleInspection: {
    performed: boolean;
    items: InspectionItem[];
    hasRedFlags: boolean;
    redFlagCount: number;
    yellowFlagCount: number;
  };
  fluidVerification: {
    performed: boolean;
    fluids: FluidCheckItem[];
  };
  initialSignoff: {
    technician?: User;
    employeeId?: string;
    signature?: string;
    signedAt?: string;
    laborCompletedNotes?: string;
  };
  qcInspection: {
    qcTechnician?: User;
    employeeId?: string;
    workCompletedVerified: boolean;
    safetyConcernsVerified: boolean;
    fluidsVerified: boolean;
    leaksVerified: boolean;
    lightsVerified: boolean;
    tiresTorquedVerified: boolean;
    fastenersTorquedVerified: boolean;
    originalComplaintResolved: boolean;
    discrepanciesFound: boolean;
    discrepancyDetails?: string;
    correctiveActionTaken?: string;
    reinspectionResult: 'PENDING' | 'PASSED' | 'FAILED';
    reinspectedAt?: string;
    signature?: string;
    signedAt?: string;
  };
  exitObservation: {
    performed: boolean;
    observer?: User;
    observedAt?: string;
    leaksObservedOnExit: boolean;
    abnormalNoisesOrExhaust: boolean;
    exitNotes?: string;
    exitPassed: boolean;
  };
  finalReleaseVerification: {
    verified: boolean;
    serviceWriter?: User;
    verifiedAt?: string;
    bothTechSignaturesVerified: boolean;
    allSafetyIssuesResolved: boolean;
    releasePermitted: boolean;
    notes?: string;
  };
  status: 'IN_PROGRESS' | 'TECH1_COMPLETE' | 'QC_IN_PROGRESS' | 'QC_DISCREPANCY' | 'QC_PASSED' | 'RELEASE_READY';
  createdAt: string;
}

export interface InvoiceLineItem {
  itemType: 'part' | 'tire' | 'labor' | 'sublet' | 'fee';
  description: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  repairOrder: RepairOrder;
  customer: Customer;
  vehicle: Vehicle;
  lineItems: InvoiceLineItem[];
  partsTotal: number;
  tiresTotal: number;
  laborTotal: number;
  shopSupplies: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  subtotal: number;
  totalAmount: number;
  depositCredit: number;
  balanceDue: number;
  amountPaid: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  createdBy: User;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  invoice: Invoice;
  repairOrder: RepairOrder;
  customer: Customer;
  amount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'FLEET_ACCOUNT';
  referenceNumber?: string;
  processedBy: User;
  processedAt: string;
  receiptNumber: string;
  officeReceiptSigned: boolean;
  officeSignature?: string;
  notes?: string;
}

export interface PaidOutDetail {
  reason: string;
  amount: number;
  recipient: string;
  receiptNumber?: string;
}

export interface DailyCashUp {
  _id: string;
  cashUpNumber: string;
  businessDate: string;
  serviceWriter: User;
  serviceWriterName: string;
  serviceWriterEmployeeId: string;
  openingFloat: number;
  cashSales: number;
  cashRefunds: number;
  paidOuts: number;
  paidOutDetails: PaidOutDetail[];
  expectedCash: number;
  actualCountedCash: number;
  difference: number;
  cashRemovedForDeposit: number;
  closingDrawerBalance: number;
  explanationOfVariance?: string;
  employeeSignature: string;
  employeeSignedAt: string;
  requiresManagerReview: boolean;
  managerReview?: {
    reviewedBy?: User;
    managerName?: string;
    reviewedAt?: string;
    decision: 'APPROVED' | 'DISCREPANCY_ESCALATED' | 'REJECTED';
    notes?: string;
  };
  status: 'DRAFT' | 'SUBMITTED' | 'DISCREPANCY_PENDING_REVIEW' | 'APPROVED' | 'CLOSED';
}

export interface ComputerModificationRequest {
  _id: string;
  requestId: string;
  employee: User;
  employeeName: string;
  employeeIdNumber: string;
  workstationIdentifier: string;
  requestedAction: 'SOFTWARE_INSTALL' | 'SETTING_CHANGE' | 'HARDWARE_CHANGE' | 'PERMISSION_CHANGE' | 'SECURITY_OVERRIDE';
  softwareOrSettingName: string;
  description: string;
  businessReason: string;
  approver?: User;
  decision?: 'APPROVED' | 'REJECTED';
  decisionNotes?: string;
  decisionTimestamp?: string;
  implementedBy?: User;
  implementationTimestamp?: string;
  implementationNotes?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'VERIFIED';
  createdAt: string;
}

export interface SecurityIncident {
  _id: string;
  incidentId: string;
  title: string;
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  reportedBy: User;
  reporterName: string;
  workstationOrDevice: string;
  systemsImpacted: string[];
  immediateContainmentTaken?: string;
  investigationFindings?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface DailySecurityChecklist {
  _id: string;
  checklistNumber: string;
  businessDate: string;
  completedBy: User;
  employeeName: string;
  employeeIdNumber: string;
  companyAccountsOnlyVerified: boolean;
  personalEmailProhibitedVerified: boolean;
  personalCloudSyncDisabledVerified: boolean;
  noAutoLoginObserved: boolean;
  allWorkstationsLockedAtClose: boolean;
  allTerminalsSignedOut: boolean;
  businessDataStorageCompliant: boolean;
  noSharedCredentialsObserved: boolean;
  notes?: string;
  signature: string;
  signedAt: string;
  status: string;
}

export interface Task {
  _id: string;
  taskId: string;
  sopId: string;
  title: string;
  department: 'SERVICE_WRITER' | 'TECHNICIAN' | 'QC_TECHNICIAN' | 'OFFICE_ASSISTANT' | 'MANAGEMENT';
  responsibleRole: string;
  assignedTo?: User;
  assignedEmployeeName?: string;
  triggerDescription: string;
  checklist: { item: string; completed: boolean; completedAt?: string }[];
  requiredEvidence: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'BLOCKED';
  dueDate: string;
  completedBy?: User;
  completedAt?: string;
  comments: { user: User; userName: string; role: string; text: string; createdAt: string }[];
}

export interface CompanySetting {
  companyName: string;
  legalName: string;
  tagline: string;
  phone: string;
  email: string;
  licenseNumber: string;
  taxRateDefault: number;
  laborRateDefault: number;
  tireMarkupFlat: number;
  depositThreshold: number;
  depositPercentage: number;
  drawerClosingTarget: number;
  mitchellManagerIntegrationEnabled: boolean;
  electronicPartsCatalogUrl?: string;
}

export interface MarkupTier {
  minCost: number;
  maxCost: number;
  markupPercent: number;
  multiplier: number;
  marginPercent?: number;
}

export interface MarkupMatrix {
  _id: string;
  name: string;
  isActive: boolean;
  tireFlatMarkup: number;
  laborRateDefault: number;
  tiers: MarkupTier[];
}
