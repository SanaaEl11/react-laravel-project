import React, { useState, useEffect } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ListTechnicien.css';

const ListTechnicien = () => {
  const API_BASE_URL = 'http://localhost:8000/api';
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Récupérer les techniciens depuis l'API
  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/entreprise/techniciens`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log("Réponse complète de l'API:", response); // Ajoutez ce log
        
        if (response.data.success) {
          setTechniciens(response.data.data);
        } else {
          console.error("Structure de réponse inattendue:", response.data);
        }
      } catch (err) {
        console.error("Erreur détaillée:", err.response || err.message);
        setError("Erreur lors du chargement des techniciens");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTechniciens();
  }, []);
  const handleEdit = (technicien) => {
    setEditingId(technicien.id);
    setEditForm({
      cin: technicien.cin,
      nom: technicien.nom,
      adresse: technicien.adresse,
      email: technicien.email,
      telephone: technicien.telephone,
      id_secteur: technicien.id_secteur
    });
  };

  const handleSave = async (id) => {
    try {
        // Ajoutez l'id_entreprise aux données envoyées
        const technicienToUpdate = techniciens.find(t => t.id === id);
        const dataToSend = {
            ...editForm,
            id_entreprise: technicienToUpdate.id_entreprise // Conservez l'entreprise d'origine
        };

        const response = await axios.put(
            `${API_BASE_URL}/entreprise/techniciens/${id}`,
            dataToSend,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (response.data.success) {
            setTechniciens(techniciens.map(t => 
                t.id === id ? { ...t, ...editForm } : t
            ));
            setEditingId(null);
            setEditForm({});
            setMessage('Technicien mis à jour avec succès');
            setTimeout(() => setMessage(''), 5000);
        }
    } catch (err) {
        console.error("Erreur détaillée:", err.response?.data || err.message);
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        setTimeout(() => setError(''), 5000);
    }
};

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ?")) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/entreprise/techniciens/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setTechniciens(techniciens.filter(t => t.id !== id));
          setMessage('Technicien supprimé avec succès');
        }
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="text-center my-5">Chargement en cours...</div>;
  }

  return (
    <main>
      <div className="container-fluid px-4 my-3">
        <ol className="breadcrumb mb-4 text-light p-3 rounded shadow-sm">
          <li className="breadcrumb-item">
            <a href="#" className="text-warning">
              Dashboard
            </a>
          </li>
          <li className="breadcrumb-item active text-light-dark">
            Listes Techniciens
          </li>
        </ol>

        {message && (
          <div className="alert alert-success text-center mx-auto w-50" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger text-center mx-auto w-50" role="alert">
            {error}
          </div>
        )}

        <div className="col-lg-12 grid-margin stretch-card my-3">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">CIN</th>
                      <th className="p-4">Nom</th>
                      <th className="p-4">Adresse</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Secteur</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techniciens.length > 0 ? (
                      techniciens.map((technicien) => (
                        <tr key={technicien.id} className="border-t">
                          <td className="p-4">{technicien.id}</td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <input
                                type="text"
                                name="cin"
                                value={editForm.cin || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            ) : (
                              technicien.cin
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <input
                                type="text"
                                name="nom"
                                value={editForm.nom || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            ) : (
                              technicien.nom
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <input
                                type="text"
                                name="adresse"
                                value={editForm.adresse || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            ) : (
                              technicien.adresse
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <input
                                type="text"
                                name="email"
                                value={editForm.email || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            ) : (
                              technicien.email
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <input
                                type="text"
                                name="telephone"
                                value={editForm.telephone || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            ) : (
                              technicien.telephone
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === technicien.id ? (
                              <select
                                name="id_secteur"
                                value={editForm.id_secteur || ""}
                                onChange={handleInputChange}
                                className="form-control"
                              >
                                {/* Options des secteurs */}
                              </select>
                            ) : (
                              technicien.secteur_nom
                            )}
                          </td>
                          <td className="p-4 d-flex justify-content-center">
                            {editingId === technicien.id ? (
                              <button
                                onClick={() => handleSave(technicien.id)}
                                className="btn btn-success me-2"
                              >
                                <i className="bi bi-check"></i>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(technicien)}
                                className="btn btn-primary me-2"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(technicien.id)}
                              className="btn btn-danger"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-4 text-center">
                          Aucun technicien trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ListTechnicien;