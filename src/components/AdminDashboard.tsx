import React, { useState, useEffect } from 'react';
import { Users, FileText, Plus, Trash2, Calendar, UserPlus, Settings, Send } from 'lucide-react';
import type { Complaint, AuthUser, UserManagement } from '../types/auth';
import { uploadMultipleFiles, uploadFile } from '../lib/storage';

interface AdminDashboardProps {
  user: AuthUser;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'complaints' | 'users' | 'create-complaint'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [clients, setClients] = useState<{ id: string; email: string }[]>([]);
  const [fournisseurs, setFournisseurs] = useState<{ id: string; email: string }[]>([]);
  const [admins, setAdmins] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    role: 'client' as 'client' | 'fournisseur' | 'admin'
  });
  const [adminFormData, setAdminFormData] = useState({
    email: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintFormData, setComplaintFormData] = useState({
    title: '',
    description: '',
    fournisseur_id: '',
    claimnumber: '',
    articlenumber: '',
    articledescription: '',
    deliverynotenumber: '',
    supplier: '',
    totalquantity: 0,
    defectivequantity: 0,
    contactperson: '',
    contactname: '',
    contactemail: '',
    contactphone: '',
    errordescription: '',
    statementresponse: '',
    reportdeadline: '',
    replacement: false,
    creditnote: false,
    remarks: '',
    errorpictures: [] as File[]
  });
  const [statusUpdate, setStatusUpdate] = useState({
    complaintId: '',
    status: '',
    statusText: '',
    report8d: null as File | null
  });

  useEffect(() => {
    fetchComplaints();
    fetchUsers();
    fetchFournisseurs();
    fetchClients();
    fetchAdmins();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints?role=admin&userId=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/fournisseurs`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setFournisseurs(data.data);
      }
    } catch (error) {
      console.error('Error fetching fournisseurs:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/clients`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/admins`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const assignComplaint = async (complaintId: string, fournisseurId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            id: complaintId,
            fournisseur_id: fournisseurId,
            status: 'assigned'
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(userFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.data]);
        setUserFormData({ email: '', role: 'client' });
        setShowUserForm(false);
        if (userFormData.role === 'fournisseur') {
          fetchFournisseurs();
        } else if (userFormData.role === 'client') {
          fetchClients();
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/admins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(adminFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        setAdmins([...admins, data.data]);
        setAdminFormData({ email: '' });
        setShowAdminForm(false);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const createComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload error images if any
      const imageUrls = complaintFormData.errorpictures.length > 0
        ? await uploadMultipleFiles(complaintFormData.errorpictures, 'complaint-images', 'error-pictures')
        : [];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ...complaintFormData,
            client_id: user.id, // Admin creates complaint as themselves
            status: complaintFormData.fournisseur_id ? 'assigned' : 'pending',
            errorpictures: imageUrls
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setComplaints([data.data, ...complaints]);
        setComplaintFormData({
          title: '',
          description: '',
          fournisseur_id: '',
          claimnumber: '',
          articlenumber: '',
          articledescription: '',
          deliverynotenumber: '',
          supplier: '',
          totalquantity: 0,
          defectivequantity: 0,
          contactperson: '',
          contactname: '',
          contactemail: '',
          contactphone: '',
          errordescription: '',
          statementresponse: '',
          reportdeadline: '',
          replacement: false,
          creditnote: false,
          remarks: '',
          errorpictures: []
        });
        setActiveTab('complaints');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
    }
  };

  const deleteUser = async (userId: string, role: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/${userId}/${role}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        if (role === 'fournisseur') {
          fetchFournisseurs();
        } else if (role === 'client') {
          fetchClients();
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users/admins/${adminId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAdmins(admins.filter(a => a.id !== adminId));
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const updateComplaintStatus = async () => {
    if (!statusUpdate.complaintId || !statusUpdate.status) return;

    try {
      // Upload 8D report if provided
      let report8dUrl = '';
      if (statusUpdate.report8d) {
        const uploadResult = await uploadFile(statusUpdate.report8d, 'complaint-reports', '8d-reports');
        if (uploadResult.success && uploadResult.url) {
          report8dUrl = uploadResult.url;
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            id: statusUpdate.complaintId,
            status: statusUpdate.status,
            statusText: statusUpdate.statusText,
            report8dUrl: report8dUrl
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchComplaints();
        setStatusUpdate({ complaintId: '', status: '', statusText: '', report8d: null });
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'assigned': return 'Assignée';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
          <p className="text-gray-600">Gestion des réclamations et des utilisateurs</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'complaints'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Réclamations ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('create-complaint')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create-complaint'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Créer Réclamation
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Utilisateurs ({users.length})
          </button>
        </nav>
      </div>

      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-sm text-yellow-600">En attente</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'assigned').length}
              </p>
              <p className="text-sm text-blue-600">Assignées</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
              <p className="text-sm text-green-600">Résolues</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{complaints.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>

          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusText(complaint.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{complaint.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(complaint.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  {complaint.client && (
                    <p className="text-sm text-gray-500">Client: {complaint.client.email}</p>
                  )}
                  {complaint.fournisseur && (
                    <p className="text-sm text-gray-500">Fournisseur: {complaint.fournisseur.email}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  {complaint.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => assignComplaint(complaint.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Assigner à...</option>
                        {fournisseurs.map((f) => (
                          <option key={f.id} value={f.id}>{f.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => setStatusUpdate({ ...statusUpdate, complaintId: complaint.id })}
                    className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
                  >
                    Mettre à jour statut
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedComplaint(null)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2">{selectedComplaint.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
              {getStatusText(selectedComplaint.status)}
            </span>
            <p className="mt-4 text-gray-700">{selectedComplaint.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(selectedComplaint.created_at).toLocaleDateString('fr-FR')}
            </div>
            {selectedComplaint.client && (
              <p className="text-sm text-gray-500 mt-2">Client: {selectedComplaint.client.email}</p>
            )}
            {selectedComplaint.fournisseur && (
              <p className="text-sm text-gray-500">Fournisseur: {selectedComplaint.fournisseur.email}</p>
            )}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdate.complaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setStatusUpdate({ complaintId: '', status: '', statusText: '', report8d: null })}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Mettre à jour le statut</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau statut</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="pending">En attente</option>
                  <option value="assigned">Assignée</option>
                  <option value="resolved">Résolue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire sur le statut</label>
                <textarea
                  rows={3}
                  value={statusUpdate.statusText}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, statusText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ajouter un commentaire sur ce changement de statut..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rapport 8D (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, report8d: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {statusUpdate.report8d && (
                  <p className="text-sm text-gray-500 mt-1">
                    Fichier sélectionné: {statusUpdate.report8d.name}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={updateComplaintStatus}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mettre à jour
                </button>
                <button
                  onClick={() => setStatusUpdate({ complaintId: '', status: '', statusText: '', report8d: null })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-complaint' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une Nouvelle Réclamation</h3>
          </div>

          <form onSubmit={createComplaint} className="space-y-6 bg-white rounded-lg shadow-sm border p-6">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input
                  type="text"
                  required
                  value={complaintFormData.title}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={complaintFormData.description}
                onChange={(e) => setComplaintFormData({ ...complaintFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de réclamation</label>
                <input
                  type="text"
                  value={complaintFormData.claimnumber}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, claimnumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro d'article</label>
                <input
                  type="text"
                  value={complaintFormData.articlenumber}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, articlenumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'article</label>
                <input
                  type="text"
                  value={complaintFormData.articledescription}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, articledescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
                <input
                  type="text"
                  value={complaintFormData.supplier}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité totale</label>
                <input
                  type="number"
                  value={complaintFormData.totalquantity}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, totalquantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité défectueuse</label>
                <input
                  type="number"
                  value={complaintFormData.defectivequantity}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, defectivequantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personne de contact</label>
                <input
                  type="text"
                  value={complaintFormData.contactperson}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, contactperson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                <input
                  type="email"
                  value={complaintFormData.contactemail}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, contactemail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'erreur</label>
              <textarea
                rows={3}
                value={complaintFormData.errordescription}
                onChange={(e) => setComplaintFormData({ ...complaintFormData, errordescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigner à un fournisseur (optionnel)</label>
              <select
                value={complaintFormData.fournisseur_id}
                onChange={(e) => setComplaintFormData({ ...complaintFormData, fournisseur_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map((fournisseur) => (
                  <option key={fournisseur.id} value={fournisseur.id}>{fournisseur.email}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={complaintFormData.replacement}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, replacement: e.target.checked })}
                  className="mr-2"
                />
                Remplacement
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={complaintFormData.creditnote}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, creditnote: e.target.checked })}
                  className="mr-2"
                />
                Note de crédit
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images d'erreur</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setComplaintFormData({ ...complaintFormData, errorpictures: Array.from(e.target.files || []) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {complaintFormData.errorpictures.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {complaintFormData.errorpictures.length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarques</label>
              <textarea
                rows={3}
                value={complaintFormData.remarks}
                onChange={(e) => setComplaintFormData({ ...complaintFormData, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Créer la Réclamation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUserForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nouvel Utilisateur
              </button>
              <button
                onClick={() => setShowAdminForm(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Nouvel Admin
              </button>
            </div>
          </div>

          {showUserForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Créer un Utilisateur</h4>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="client">Client</option>
                    <option value="fournisseur">Fournisseur</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {showAdminForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Créer un Administrateur</h4>
              <form onSubmit={createAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Créer Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admins Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Administrateurs ({admins.length})</h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {admin.email !== user.email && (
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Clients et Fournisseurs ({users.length})</h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'client' ? 'Client' : 'Fournisseur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id, user.role)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}