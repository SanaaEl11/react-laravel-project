import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBlacklist.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const MyBlacklist = () => {
    const [blacklistData, setBlacklistData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        per_page: 10,
        last_page: 1
    });

    const fetchBlacklistData = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/blacklists?page=${page}`);
            
            setBlacklistData(response.data.data);
            setPagination({
                current_page: response.data.meta.current_page,
                total: response.data.meta.total,
                per_page: response.data.meta.per_page,
                last_page: response.data.meta.last_page
            });
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
            console.error('Error fetching blacklist data:', err);
        }
    };

    useEffect(() => {
        fetchBlacklistData();
    }, []);

    const getProofLink = (file) => {
        if (!file) return <span className="text-muted">Aucune preuve</span>;

        const fileExtension = file.split('.').pop().toLowerCase();
        const filePath = `${API_BASE_URL}/storage/${file}`;

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return (
                <a href={filePath} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-image-fill text-primary me-2"></i>
                    Voir l'image
                </a>
            );
        } else if (fileExtension === 'pdf') {
            return (
                <a href={filePath} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                    Voir le PDF
                </a>
            );
        } else {
            return (
                <a href={filePath} download className="text-decoration-none">
                    <i className="bi bi-download text-dark me-2"></i>
                    Télécharger
                </a>
            );
        }
    };

    if (loading && blacklistData.length === 0) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement en cours...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    Erreur lors du chargement des données: {error}
                    <button 
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => fetchBlacklistData()}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Liste Noire</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item">
                        <a href="/dashboard">Tableau de bord</a>
                    </li>
                    <li className="breadcrumb-item active">Liste Noire</li>
                </ol>
                
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i className="fas fa-table me-1"></i>
                            Entreprises signalées
                        </div>
                        <div>
                            <span className="badge bg-primary">
                                Total: {pagination.total}
                            </span>
                        </div>
                    </div>
                    
                    <div className="card-body">
                        {blacklistData.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>ID</th>
                                                <th>Signalé par</th>
                                                <th>Entreprise</th>
                                                <th>Raison</th>
                                                <th>Preuve</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blacklistData.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td>{entry.id}</td>
                                                    <td>{entry.nom_entreprise_post}</td>
                                                    <td className="fw-bold text-danger">{entry.nom_entreprise_fraud}</td>
                                                    <td>{entry.raison}</td>
                                                    <td>{getProofLink(entry.preuve_file)}</td>
                                                    <td>{new Date(entry.post_date).toLocaleDateString('fr-FR')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => fetchBlacklistData(pagination.current_page - 1)}
                                            >
                                                Précédent
                                            </button>
                                        </li>
                                        
                                        {[...Array(pagination.last_page).keys()].map(num => (
                                            <li key={num + 1} className={`page-item ${pagination.current_page === num + 1 ? 'active' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => fetchBlacklistData(num + 1)}
                                                >
                                                    {num + 1}
                                                </button>
                                            </li>
                                        ))}
                                        
                                        <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => fetchBlacklistData(pagination.current_page + 1)}
                                            >
                                                Suivant
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </>
                        ) : (
                            <div className="alert alert-info text-center">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Aucune entreprise n'a été signalée pour le moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MyBlacklist;