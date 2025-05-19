import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReclamationRefuser.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ReclamationRefuser = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [showResendPopup, setShowResendPopup] = useState(false);
    const [selectedReclamation, setSelectedReclamation] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const API_BASE_URL = 'http://localhost:8000/api';

    useEffect(() => {
        fetchReclamationsRejetees();
    }, []);

    const fetchReclamationsRejetees = async () => {
        try {
            setLoading(true);
            
            const response = await axios.get(
                `${API_BASE_URL}/entreprise/reclamations/check`,
                { timeout: 10000 }
            );
    
            if (response.data.success) {
                const reclamationsRejetees = response.data.data.reclamations.filter(
                    rec => ['refusé', 'rejeté'].includes(rec.status)
                );
                setPublications(reclamationsRejetees);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleShowMessage = (reclamation) => {
        setPopupMessage(reclamation || "Aucune observation disponible.");
        setShowPopup(true);
    };

    const handleResend = (reclamation) => {
        setSelectedReclamation(reclamation);
        setShowResendPopup(true);
    };

    const confirmResend = async () => {
        setIsProcessing(true);
        
        try {
            // Vérification basique sans token
            if (!selectedReclamation?.id) {
                throw new Error("Aucune réclamation sélectionnée");
            }
    
            const response = await axios.post(
                `${API_BASE_URL}/entreprise/reclamations/${selectedReclamation.id}/resend`,
                {},
                {
                    timeout: 10000 // Timeout de 10 secondes
                }
            );
    
            if (response.data?.success) {
                // 1. Fermer la popup de confirmation
                setShowResendPopup(false);
                
                // 2. Rafraîchir la liste
                await fetchReclamationsRejetees();
                
                // 3. Afficher message de succès
                setPopupMessage("Réclamation renvoyée avec succès !");
                setShowPopup(true);
                
                // 4. Fermer après 3s
                setTimeout(() => setShowPopup(false), 3000);
            } else {
                throw new Error(response.data?.message || "Erreur inconnue");
            }
        } catch (err) {
            console.error("Erreur:", err);
            setPopupMessage(`Échec: ${err.message}`);
            setShowPopup(true);
        } finally {
            setIsProcessing(false);
        }
    };
    


    const closePopup = () => {
        setShowPopup(false);
        setShowResendPopup(false);
        setPopupMessage("");
    };

    const getFileIcon = (filename) => {
        if (!filename) return null;

        const extension = filename.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return <i className="bi bi-images"></i>;
        } else if (extension === 'pdf') {
            return <i className="bi bi-file-earmark-pdf"></i>;
        } else {
            return <i className="bi bi-download"></i>;
        }
    };

    if (loading) {
        return <div className="text-center my-5">Chargement en cours...</div>;
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <main className="p-6">
            <div>
                <div className="container-fluid px-4">
                    <ol className="breadcrumb text-light p-3 rounded shadow-sm">
                        <li className="breadcrumb-item">
                            <a href="/dashboard" className="text-warning">
                                Dashboard
                            </a>
                        </li>
                        <li className="breadcrumb-item active text-light-dark">Listes des réclamations rejetées</li>
                    </ol>
                    <div className="card-body">
                        <div className="table-container">
                            <div className="table-wrapper">
                                <div className="table-scroll">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Entreprise Réclamante</th>
                                                <th>Entreprise Frauduleuse</th>
                                                <th>Raison</th>
                                                <th>Preuve</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {publications.length > 0 ? (
                                                publications.map((publication) => (
                                                    <tr key={publication.id}>
                                                        <td className="id">{publication.id}</td>
                                                        <td>{publication.nom_entreprise_post}</td>
                                                        <td>{publication.nom_entreprise_fraud}</td>
                                                        <td>{publication.raison}</td>
                                                        <td>
                                                            {publication.preuve_file ? (
                                                                <a 
                                                                    href={`${API_BASE_URL}/files/${publication.preuve_file}`}
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="proof-link"
                                                                >
                                                                    {getFileIcon(publication.preuve_file)}
                                                                </a>
                                                            ) : (
                                                                <span className="no-proof">Aucune preuve</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge bg-${publication.status === 'rejeté' || publication.status === 'refusé' ? 'danger' : 'warning'}`}>
                                                                {publication.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="actions">
                                                                <button 
                                                                    onClick={() => handleShowMessage(publication.reclamation)}
                                                                    className="show-message"
                                                                    title="Voir observation">
                                                                    <i className="bi bi-question-circle"></i>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleResend(publication)}
                                                                    className="resend-btn ms-2"
                                                                    title="Renvoyer la réclamation">
                                                                    <i className="bi bi-arrow-repeat text-dark"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="no-data">
                                                        Aucune réclamation rejetée trouvée.
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

                {/* Popup Overlay pour les observations */}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup">
                            <span className="close-btn" onClick={closePopup}>×</span>
                            <p>{popupMessage}</p>
                            <button 
                                onClick={closePopup}
                                className="btn btn-primary mt-3"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Popup Overlay pour la confirmation de renvoi */}
                {showResendPopup && (
    <div className="popup-overlay">
        <div className="popup">
            <h5>Confirmation</h5>
            <p>Voulez-vous vraiment renvoyer cette réclamation ?</p>
            
            <div className="d-flex justify-content-end gap-2 mt-3">
                <button 
                    onClick={confirmResend}
                    className="btn btn-primary"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'En cours...' : 'Confirmer'}
                </button>
                <button 
                    onClick={closePopup}
                    className="btn btn-outline-secondary"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
)}
                {/* Overlay de chargement */}
                {isProcessing && (
                    <div className="overlay-loader">
                        <div className="loader"></div>
                    </div>
                )}
            </div> 
        </main>
    );
};

export default ReclamationRefuser;