# ArunaDoc
## Functional Requirements Document (FRD)

---

# 1. Purpose

ArunaDoc is a secure private-practice clinical automation platform designed for UK consultants.

It enables:

- Consultation recording and AI transcription
- Structured clinical note generation
- Automated letter drafting
- Secure clinical communication
- Insurance billing via Healthcode
- Secure patient messaging
- Full audit logging and compliance

Primary User: Consultant  
Secondary User (Phase 2): Secretary/Admin  
External Users: Patients  

---

# 2. System Overview

ArunaDoc consists of seven core modules:

1. Consultation Intelligence Engine  
2. Clinical Documentation Generator  
3. Secure Clinical Delivery (Egress)  
4. Billing Engine (Healthcode)  
5. Patient Communication Portal  
6. Approval Workflow Engine  
7. Compliance & Audit Layer  

---

# 3. MODULE 1 – Consultation Intelligence Engine

## 3.1 Audio Capture
- Secure recording (desktop/mobile)
- Manual start/stop
- Encrypted storage

## 3.2 Transcription
- Medical-grade transcription
- Speaker separation
- Structured data extraction

## 3.3 Structured Output

System extracts:

- Presenting complaint  
- History  
- Examination findings  
- Diagnosis  
- Treatment plan  
- Follow-up plan  
- Billing triggers  
- Letters required  

Output stored in structured format.

---

# 4. MODULE 2 – Clinical Documentation Generator

System generates:

- SOAP notes  
- Consultation summary  
- Patient letter  
- GP letter  
- Referral letter  
- Insurance justification letter  

All documents:

- Default to Draft
- Editable
- Version controlled
- Linked to patient record

---

# 5. MODULE 3 – Secure Clinical Delivery

All clinical communications must be sent via Egress.

No PHI is allowed through standard email.

## 5.1 Supported Communications

- Patient letters  
- Clinical summaries  
- Reports  
- Documents sent to Spire Healthcare  
- Attachments containing health information  

## 5.2 Functional Requirements

- API-based integration
- Encrypted attachments
- Delivery tracking:
  - Draft
  - Sent
  - Delivered
  - Opened
  - Failed
  - Expired
- Store Egress message ID
- No fallback to insecure email

---

# 6. MODULE 4 – Billing Engine

All invoices submitted via Healthcode.

## 6.1 Invoice Data Requirements

- Patient details
- Insurance provider
- Membership number
- Authorisation number
- CCSD procedure codes
- Consultation type
- Fee
- Date of service

## 6.2 Invoice Status Tracking

- Draft
- Submitted
- Accepted
- Rejected
- Paid
- Partially paid

## 6.3 Important Rule

Invoices go through Healthcode.  
If an invoice copy is sent directly to a patient, that copy must go via Egress.

---

# 7. MODULE 5 – Patient Communication Portal

## 7.1 Purpose

Allows patients to contact the consultant without:

- Revealing personal email
- Revealing personal phone number
- Using unsecured channels

## 7.2 Access

- Secure login
- Two-factor authentication
- Invited after first consultation

## 7.3 Message Categories

Patient must select:

- Results query  
- Follow-up question  
- Prescription query  
- Appointment request  
- Administrative query  

## 7.4 Doctor Actions

- Reply securely
- Attach documents
- Delegate to secretary
- Convert to billable remote consultation

## 7.5 Emergency Disclaimer

Banner must state:

"This system is not monitored for emergencies. Call 999."

---

# 8. MODULE 6 – Approval Workflow Engine

Nothing AI-generated can be sent automatically.

## 8.1 Required Approval

Consultant must approve:

- Clinical notes
- Letters
- Reports
- Invoices
- Messages

## 8.2 Review Interface

Side-by-side view:

- Transcript
- Structured extraction
- Generated documents
- Invoice

Buttons:

- Edit
- Approve
- Regenerate
- Reject

Approval logged with timestamp.

---

# 9. MODULE 7 – Compliance & Security

## 9.1 GDPR Compliance
- UK/EU data residency
- Encryption at rest
- TLS in transit
- Data processing agreements

## 9.2 Audit Trail

Log:

- Logins
- Edits
- Approvals
- Sends
- Billing submissions
- Patient messages

## 9.3 Access Control

- Role-based access
- Consultant-only clinical editing
- Admin limited access (Phase 2)

## 9.4 Data Retention

Configurable retention policy.

---

# 10. Data Model Overview (High-Level)

Core entities:

- Patient  
- Consultation  
- Transcript  
- ClinicalDocument  
- SecureMessage  
- Invoice  
- BillingSubmission  
- PatientMessage  
- AuditEntry  

All entities linked via patient ID and consultation ID.

---

# 11. Non-Functional Requirements

- 99.9% uptime
- < 3 second document generation
- Scalable to multi-doctor tenancy (Phase 3)
- Dockerised deployment
- CI/CD pipeline
- Secure API key management

---

# 12. Phase Plan

## Phase 1 – MVP

- Consultation recording
- Transcription
- SOAP note generation
- One letter template
- Healthcode invoice submission
- Egress sending
- Basic patient portal
- Full audit logging

## Phase 2

- Multiple templates
- Admin role
- Payment tracking
- Remote consultation billing toggle
- Advanced search

## Phase 3

- Multi-consultant support
- Secure patient document vault
- Smart billing automation
- Reporting & analytics

---

# Final Architecture Flow

Consultation  
→ AI structure  
→ Draft documents + invoice  
→ Consultant approval  
→  
   - Clinical docs → Egress  
   - Invoice → Healthcode  
→ Audit log  
→ Status tracking  
