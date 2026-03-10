import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  const DATA_DIR = path.join(__dirname, 'database');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

  // Helper to manage JSON files
  const getFile = (filename: string, defaultData: string = '[]') => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultData);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  };

  const saveFile = (filename: string, data: any) => {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  };

  // Policies
  const POLICIES_FILE = 'policies.json';
  const getPolicies = () => getFile(POLICIES_FILE);
  const savePolicies = (policies: any[]) => saveFile(POLICIES_FILE, policies);

  // Users
  const USERS_FILE = 'users.json';
  const getUsers = () => getFile(USERS_FILE);
  const saveUsers = (users: any[]) => saveFile(USERS_FILE, users);

  // Claims
  const CLAIMS_FILE = 'claims.json';
  const getClaims = () => getFile(CLAIMS_FILE);
  const saveClaims = (claims: any[]) => saveFile(CLAIMS_FILE, claims);

  // Payments
  const PAYMENTS_FILE = 'payments.json';
  const getPayments = () => getFile(PAYMENTS_FILE);
  const savePayments = (payments: any[]) => saveFile(PAYMENTS_FILE, payments);

  // Audit Logs
  const AUDIT_LOGS_FILE = 'audit_logs.json';
  const getAuditLogs = () => getFile(AUDIT_LOGS_FILE);
  const saveAuditLogs = (logs: any[]) => saveFile(AUDIT_LOGS_FILE, logs);

  // Admin Activity Logs
  const ADMIN_ACTIVITY_LOGS_FILE = 'admin_activity_logs.json';
  const getAdminActivityLogs = () => getFile(ADMIN_ACTIVITY_LOGS_FILE);
  const saveAdminActivityLogs = (logs: any[]) => saveFile(ADMIN_ACTIVITY_LOGS_FILE, logs);

  // Tickets
  const TICKETS_FILE = 'tickets.json';
  const getTickets = () => getFile(TICKETS_FILE);
  const saveTickets = (tickets: any[]) => saveFile(TICKETS_FILE, tickets);

  // Risk Config
  const RISK_CONFIG_FILE = 'risk_config.json';
  const getRiskConfig = () => getFile(RISK_CONFIG_FILE, '{}');
  const saveRiskConfig = (config: any) => saveFile(RISK_CONFIG_FILE, config);

  // MID Submissions
  const MID_SUBMISSIONS_FILE = 'mid_submissions.json';
  const getMidSubmissions = () => getFile(MID_SUBMISSIONS_FILE);
  const saveMidSubmissions = (subs: any[]) => saveFile(MID_SUBMISSIONS_FILE, subs);

  // Vehicle Logs
  const VEHICLE_LOGS_FILE = 'vehicle_logs.json';
  const getVehicleLogs = () => getFile(VEHICLE_LOGS_FILE);
  const saveVehicleLogs = (logs: any[]) => saveFile(VEHICLE_LOGS_FILE, logs);

  // Email sending endpoint
  app.post("/api/send-policy-email", async (req, res) => {
    const { email, pdfBase64, policyId, firstName, lastName } = req.body;
    console.log(`[EMAIL] Request to send policy email for ID: ${policyId} to ${email}`);
    
    try {
      // Configure transporter (using placeholders for now)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'mock-user',
          pass: process.env.SMTP_PASS || 'mock-pass'
        }
      });

      const mailOptions = {
        from: '"SwiftPolicy Insurance" <no-reply@swiftpolicy.co.uk>',
        to: email,
        subject: 'Your SwiftPolicy Insurance Document',
        text: `Dear ${firstName} ${lastName},\n\nThank you for choosing SwiftPolicy. Please find your generated insurance policy document attached to this email.\n\nPolicy Reference: ${policyId}\n\nBest regards,\nThe SwiftPolicy Team`,
        attachments: [
          {
            filename: `SwiftPolicy_Document_${policyId}.pdf`,
            content: pdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
            encoding: 'base64'
          }
        ]
      };

      // If SMTP is not configured, we just log it
      if (!process.env.SMTP_HOST) {
        console.log(`[EMAIL SIMULATION] To: ${email}, Subject: ${mailOptions.subject}`);
        console.log(`[EMAIL SIMULATION] Policy ID: ${policyId}`);
        return res.json({ success: true, message: "Email simulation logged" });
      }

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Email sending failed:", error);
      // We return 200 even on error to not interrupt the flow, but with success: false
      res.json({ success: false, error: "Email delivery failed" });
    }
  });

  // Policies API
  app.get("/api/policies", (req, res) => {
    res.json(getPolicies());
  });

  app.post("/api/policies", (req, res) => {
    const policies = getPolicies();
    const newPolicy = req.body;
    policies.push(newPolicy);
    savePolicies(policies);
    res.status(201).json(newPolicy);
  });

  app.patch("/api/policies/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let policies = getPolicies();
    const index = policies.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      policies[index] = { ...policies[index], ...updates, updatedAt: new Date().toISOString() };
      savePolicies(policies);
      res.json(policies[index]);
    } else {
      res.status(404).json({ error: "Policy not found" });
    }
  });

  app.delete("/api/policies/:id", (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] Attempting to remove policy ID: ${id}`);
    
    try {
      let policies = getPolicies();
      const initialLength = policies.length;
      
      policies = policies.filter((p: any) => {
        const pId = String(p.id || '').trim();
        const targetId = String(id || '').trim();
        return pId !== targetId;
      });
      
      if (policies.length < initialLength) {
        savePolicies(policies);
        res.json({ success: true, message: "Policy removed successfully" });
      } else {
        res.status(404).json({ error: "Policy not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error during deletion" });
    }
  });

  // Users API
  app.get("/api/users", (req, res) => {
    res.json(getUsers());
  });

  app.post("/api/users", (req, res) => {
    const users = getUsers();
    const newUser = req.body;
    users.push(newUser);
    saveUsers(users);
    res.status(201).json(newUser);
  });

  app.patch("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let users = getUsers();
    const index = users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveUsers(users);
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    let users = getUsers();
    const initialLength = users.length;
    users = users.filter((u: any) => u.id !== id);
    if (users.length < initialLength) {
      saveUsers(users);
      res.json({ success: true, message: "User removed successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Claims API
  app.get("/api/claims", (req, res) => {
    res.json(getClaims());
  });

  app.post("/api/claims", (req, res) => {
    const claims = getClaims();
    const newClaim = req.body;
    claims.push(newClaim);
    saveClaims(claims);
    res.status(201).json(newClaim);
  });

  app.patch("/api/claims/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let claims = getClaims();
    const index = claims.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      claims[index] = { ...claims[index], ...updates };
      saveClaims(claims);
      res.json(claims[index]);
    } else {
      res.status(404).json({ error: "Claim not found" });
    }
  });

  // Payments API
  app.get("/api/payments", (req, res) => {
    res.json(getPayments());
  });

  app.post("/api/payments", (req, res) => {
    const payments = getPayments();
    const newPayment = req.body;
    payments.push(newPayment);
    savePayments(payments);
    res.status(201).json(newPayment);
  });

  // Audit Logs API
  app.get("/api/audit-logs", (req, res) => {
    res.json(getAuditLogs());
  });

  app.post("/api/audit-logs", (req, res) => {
    const logs = getAuditLogs();
    const newLog = req.body;
    logs.unshift(newLog); // Newest first
    saveAuditLogs(logs);
    res.status(201).json(newLog);
  });

  // Admin Activity Logs API
  app.get("/api/admin-activity-logs", (req, res) => {
    res.json(getAdminActivityLogs());
  });

  app.post("/api/admin-activity-logs", (req, res) => {
    const logs = getAdminActivityLogs();
    const newLog = req.body;
    logs.unshift(newLog);
    saveAdminActivityLogs(logs);
    res.status(201).json(newLog);
  });

  // Tickets API
  app.get("/api/tickets", (req, res) => {
    res.json(getTickets());
  });

  app.post("/api/tickets", (req, res) => {
    const tickets = getTickets();
    const newTicket = req.body;
    tickets.push(newTicket);
    saveTickets(tickets);
    res.status(201).json(newTicket);
  });

  app.patch("/api/tickets/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let tickets = getTickets();
    const index = tickets.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      tickets[index] = { ...tickets[index], ...updates };
      saveTickets(tickets);
      res.json(tickets[index]);
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  });

  // Risk Config API
  app.get("/api/risk-config", (req, res) => {
    res.json(getRiskConfig());
  });

  app.post("/api/risk-config", (req, res) => {
    const config = req.body;
    saveRiskConfig(config);
    res.json(config);
  });

  // MID Submissions API
  app.get("/api/mid-submissions", (req, res) => {
    res.json(getMidSubmissions());
  });

  app.post("/api/mid-submissions", (req, res) => {
    const subs = getMidSubmissions();
    const newSub = req.body;
    subs.push(newSub);
    saveMidSubmissions(subs);
    res.status(201).json(newSub);
  });

  app.patch("/api/mid-submissions/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let subs = getMidSubmissions();
    const index = subs.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      subs[index] = { ...subs[index], ...updates };
      saveMidSubmissions(subs);
      res.json(subs[index]);
    } else {
      res.status(404).json({ error: "Submission not found" });
    }
  });

  // Vehicle Logs API
  app.get("/api/vehicle-logs", (req, res) => {
    res.json(getVehicleLogs());
  });

  app.post("/api/vehicle-logs", (req, res) => {
    const logs = getVehicleLogs();
    const newLog = req.body;
    logs.unshift(newLog);
    saveVehicleLogs(logs);
    res.status(201).json(newLog);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
