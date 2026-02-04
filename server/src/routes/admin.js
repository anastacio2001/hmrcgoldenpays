import express from 'express';
import { verifyToken } from './auth.js';
import { inquiries } from './contact.js';

const router = express.Router();

// All admin routes require authentication
router.use(verifyToken);

// In-memory data for clients and projects
let clients = [];
let projects = [];

// GET /api/admin/inquiries
router.get('/inquiries', (req, res) => {
  const { status } = req.query;
  
  let filteredInquiries = inquiries;
  if (status && status !== 'all') {
    filteredInquiries = inquiries.filter(inq => inq.status === status);
  }
  
  res.status(200).json({
    success: true,
    data: filteredInquiries,
    total: filteredInquiries.length
  });
});

// GET /api/admin/inquiries/:id
router.get('/inquiries/:id', (req, res) => {
  const inquiry = inquiries.find(inq => inq.id === req.params.id);
  
  if (!inquiry) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Inquiry not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: inquiry
  });
});

// PATCH /api/admin/inquiries/:id
router.patch('/inquiries/:id', (req, res) => {
  const index = inquiries.findIndex(inq => inq.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Inquiry not found'
    });
  }
  
  inquiries[index] = { ...inquiries[index], ...req.body };
  
  res.status(200).json({
    success: true,
    data: inquiries[index]
  });
});

// DELETE /api/admin/inquiries/:id
router.delete('/inquiries/:id', (req, res) => {
  const index = inquiries.findIndex(inq => inq.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Inquiry not found'
    });
  }
  
  inquiries.splice(index, 1);
  
  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully'
  });
});

// GET /api/admin/clients
router.get('/clients', (req, res) => {
  res.status(200).json({
    success: true,
    data: clients,
    total: clients.length
  });
});

// POST /api/admin/clients
router.post('/clients', (req, res) => {
  const newClient = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  clients.push(newClient);
  
  res.status(201).json({
    success: true,
    data: newClient
  });
});

// GET /api/admin/projects
router.get('/projects', (req, res) => {
  res.status(200).json({
    success: true,
    data: projects,
    total: projects.length
  });
});

// POST /api/admin/projects
router.post('/projects', (req, res) => {
  const newProject = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  
  res.status(201).json({
    success: true,
    data: newProject
  });
});

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalInquiries: inquiries.length,
      newInquiries: inquiries.filter(i => i.status === 'new').length,
      totalClients: clients.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      revenue: '£127,500'
    }
  });
});

export default router;
