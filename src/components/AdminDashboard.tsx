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
            client_id: user.id,
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

          {/* Complaints Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réclamation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détails Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantités
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{complaint.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            N° Réclamation: {complaint.claimnumber || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Créé: {new Date(complaint.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          {complaint.client && (
                            <div className="text-xs text-blue-600">Client: {complaint.client.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div><strong>Article:</strong> {complaint.articlenumber || 'N/A'}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {complaint.articledescription || 'Pas de description'}
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>Fournisseur:</strong> {complaint.supplier || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>Bon de livraison:</strong> {complaint.deliverynotenumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div><strong>Total:</strong> {complaint.totalquantity || 0}</div>
                          <div className="text-red-600"><strong>Défectueuse:</strong> {complaint.defectivequantity || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div><strong>Personne:</strong> {complaint.contactperson || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{complaint.contactemail || 'Pas d\'email'}</div>
                          <div className="text-xs text-gray-500">{complaint.contactphone || 'Pas de téléphone'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                          {complaint.fournisseur && (
                            <div className="text-xs text-green-600">
                              Assigné à: {complaint.fournisseur.email}
                            </div>
                          )}
                          {complaint.reportdeadline && (
                            <div className="text-xs text-orange-600">
                              Rapport: {complaint.reportdeadline}
                            </div>
                          )}
                          <div className="flex space-x-1">
                            {complaint.replacement && (
                              <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Remplacement</span>
                            )}
                            {complaint.creditnote && (
                              <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Crédit</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                          >
                            Voir détails
                          </button>
                          {complaint.status === 'pending' && (
                            <select
                              onChange={(e) => assignComplaint(complaint.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1 py-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Assigner...</option>
                              {fournisseurs.map((f) => (
                                <option key={f.id} value={f.id}>{f.email}</option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => setStatusUpdate({ ...statusUpdate, complaintId: complaint.id })}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors"
                          >
                            Statut
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {complaints.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réclamation</h3>
                <p className="text-gray-600">Aucune réclamation n'a été soumise pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative mx-4">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedComplaint(null)}
            >
              ×
            </button>
            
            <div className="pr-8">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedComplaint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                  {getStatusText(selectedComplaint.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informations de base</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Description:</strong> {selectedComplaint.description}</p>
                      <p><strong>N° Réclamation:</strong> {selectedComplaint.claimnumber || 'N/A'}</p>
                      <p><strong>Date de création:</strong> {new Date(selectedComplaint.created_at).toLocaleDateString('fr-FR')}</p>
                      {selectedComplaint.client && (
                        <p><strong>Client:</strong> {selectedComplaint.client.email}</p>
                      )}
                      {selectedComplaint.fournisseur && (
                        <p><strong>Fournisseur assigné:</strong> {selectedComplaint.fournisseur.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Article Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Détails de l'article</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>N° Article:</strong> {selectedComplaint.articlenumber || 'N/A'}</p>
                      <p><strong>Description:</strong> {selectedComplaint.articledescription || 'N/A'}</p>
                      <p><strong>Fournisseur:</strong> {selectedComplaint.supplier || 'N/A'}</p>
                      <p><strong>N° Bon de livraison:</strong> {selectedComplaint.deliverynotenumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Contact & Quantities */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Personne de contact:</strong> {selectedComplaint.contactperson || 'N/A'}</p>
                      <p><strong>Nom:</strong> {selectedComplaint.contactname || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedComplaint.contactemail || 'N/A'}</p>
                      <p><strong>Téléphone:</strong> {selectedComplaint.contactphone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quantités</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Quantité totale:</strong> {selectedComplaint.totalquantity || 0}</p>
                      <p><strong>Quantité défectueuse:</strong> <span className="text-red-600">{selectedComplaint.defectivequantity || 0}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Error Description */}
              {selectedComplaint.errordescription && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description de l'erreur</h4>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-800">{selectedComplaint.errordescription}</p>
                  </div>
                </div>
              )}
              
              {/* Requests */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Demandes</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedComplaint.statementresponse && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Stellungnahme</span>
                    )}
                    {selectedComplaint.reportdeadline && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">
                        Rapport {selectedComplaint.reportdeadline}
                      </span>
                    )}
                    {selectedComplaint.replacement && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Remplacement</span>
                    )}
                    {selectedComplaint.creditnote && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">Note de crédit</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Remarks */}
              {selectedComplaint.remarks && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Remarques</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedComplaint.remarks}</p>
                  </div>
                </div>
              )}
              
              {/* Error Pictures */}
              {selectedComplaint.errorpictures && selectedComplaint.errorpictures !== '[]' && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Images d'erreur</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Images disponibles (voir données brutes)</p>
                  </div>
                </div>
              )}
              
              {/* 8D Report */}
              {selectedComplaint.report_8d_url && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Rapport 8D</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <a
                      href={selectedComplaint.report_8d_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📄 Télécharger Rapport 8D
                    </a>
                  </div>
                </div>
              )}
            </div>
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