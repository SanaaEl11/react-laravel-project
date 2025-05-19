import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ListReclamation.css';

const ListReclamation = () => {
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8000/api';
  
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Récupérer les réclamations depuis l'API
  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/entreprise/reclamations/check`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setReclamations(response.data.data.reclamations);
          setTotalPages(response.data.data.pagination.last_page);
        }
      } catch (err) {
        setError("Erreur lors du chargement des réclamations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReclamations();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/entreprise/reclamations/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setReclamations(reclamations.filter(reclamation => reclamation.id !== id));
        setMessage('Réclamation supprimée avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement en cours...</div>;
  }

  return (
    <div className="container-fluid px-4 my-3">
      <ol className="breadcrumb mb-2 text-light p-3 rounded shadow-sm">
        <li className="breadcrumb-item">
          <a href="/dashboard" className="text-warning">Dashboard</a>
        </li>
        <li className="breadcrumb-item active text-light-dark">Réclamations</li>
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
                    <th className="text-center">ID</th>
                    <th className="text-center">Entreprise</th>
                    <th className="text-center">Entreprise Frauduleuse</th>
                    <th className="text-center">Raison</th>
                    <th className="text-center">Preuve</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reclamations.map((reclamation) => {
                    const fileExtension = reclamation.preuve_file
                      ? reclamation.preuve_file.split('.').pop().toLowerCase()
                      : '';
                    return (
                      <tr key={reclamation.id}>
                        <td className="text-center pt-4">{reclamation.id}</td>
                        <td className="text-center pt-4">{reclamation.nom_entreprise_post}</td>
                        <td className="text-center pt-4">{reclamation.nom_entreprise_fraud}</td>
                        <td className="text-center pt-4">{reclamation.raison}</td>
                        <td className="text-center pt-4">
                          {reclamation.preuve_file ? (
                            <a 
                              href={`${API_BASE_URL}/files/${reclamation.preuve_file}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? (
                                <i className="bi bi-images text-dark fs-3"></i>
                              ) : (
                                <i className="bi bi-file-earmark-pdf text-danger fs-3"></i>
                              )}
                            </a>
                          ) : (
                            'Aucune preuve'
                          )}
                        </td>
                        <td className="text-center pt-4">
                          <span className={`badge ${
                            reclamation.status === 'en attente' ? 'bg-warning text-dark' :
                            reclamation.status === 'rejeté' ? 'bg-danger' :
                            'bg-success'
                          }`}>
                            {reclamation.status}
                          </span>
                        </td>
                        <td className="text-center pt-4">
                          {new Date(reclamation.date_publication).toLocaleDateString()}
                        </td>
                        <td className="text-center pt-4">
  {reclamation.status === 'en attente' ? (
    <>
      <button 
        className="btn btn-primary btn-sm me-2"
        onClick={() => navigate(`/reclamations/edit/${reclamation.id}`)}
      >
        <i className="bi bi-pencil-square"></i>
      </button>
      <button 
        className="btn btn-danger btn-sm"
        onClick={() => handleDelete(reclamation.id)}
      >
        <i className="bi bi-trash3"></i>
      </button>
    </>
  ) : (
    <div className="btn-group" style={{ opacity: 0.5 }}>
      <button 
        className="btn btn-secondary btn-sm me-2"
        disabled
        style={{ cursor: 'not-allowed' }}
      >
        <i className="bi bi-pencil-square"></i>
      </button>
      <button 
        className="btn btn-secondary btn-sm"
        disabled
        style={{ cursor: 'not-allowed' }}
      >
        <i className="bi bi-trash3"></i>
      </button>
    </div>
  )}
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <nav aria-label="Pagination">
                  <ul className="pagination justify-content-center mt-3">
                    {currentPage > 1 && (
                      <li className="page-item">
                        <button 
                          className="page-link bg-warning text-dark"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          «
                        </button>
                      </li>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <button 
                          className="page-link bg-warning text-dark"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    {currentPage < totalPages && (
                      <li className="page-item">
                        <button 
                          className="page-link bg-warning text-dark"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          »
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListReclamation;