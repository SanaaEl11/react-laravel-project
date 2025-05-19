import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditReclamation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:8000/api';
    
    const [formData, setFormData] = useState({
        rc: '',
        ice: '',
        nom_entreprise_post: '',
        nom_entreprise_fraud: '',
        raison: '',
        preuve_file: null
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReclamation = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_BASE_URL}/entreprise/reclamations/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    setFormData({
                        rc: response.data.data.rc || '',
                        ice: response.data.data.ice || '',
                        nom_entreprise_post: response.data.data.nom_entreprise_post || '',
                        nom_entreprise_fraud: response.data.data.nom_entreprise_fraud || '',
                        raison: response.data.data.raison || '',
                        preuve_file: null
                    });
                }
            } catch (err) {
                setError('Erreur lors du chargement: ' + (err.response?.data?.message || err.message));
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchReclamation();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                setError('Le fichier ne doit pas dépasser 2MB');
                return;
            }
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setError('Type de fichier non supporté. Utilisez PDF, JPG, JPEG ou PNG');
                return;
            }
        }
        setFormData(prev => ({
            ...prev,
            preuve_file: file || null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setMessage('');
    
        // Validation côté client plus robuste
        const errors = {};
        if (!formData.nom_entreprise_fraud?.trim()) {
            errors.nom_entreprise_fraud = "Le nom de l'entreprise frauduleuse est requis";
        } else if (formData.nom_entreprise_fraud.length > 255) {
            errors.nom_entreprise_fraud = "Le nom ne doit pas dépasser 255 caractères";
        }
    
        if (!formData.raison?.trim()) {
            errors.raison = "La raison de la réclamation est requise";
        }
    
        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors).join('\n'));
            setIsSubmitting(false);
            return;
        }
    
        try {
            const formDataToSend = new FormData();
            
            // Ajout des champs OBLIGATOIRES - même s'ils sont vides
            formDataToSend.append('nom_entreprise_fraud', formData.nom_entreprise_fraud || '');
            formDataToSend.append('raison', formData.raison || '');
            
            // Ajout des champs optionnels seulement s'ils ont une valeur
            if (formData.rc) formDataToSend.append('rc', formData.rc);
            if (formData.ice) formDataToSend.append('ice', formData.ice);
            if (formData.nom_entreprise_post) formDataToSend.append('nom_entreprise_post', formData.nom_entreprise_post);
            if (formData.preuve_file) formDataToSend.append('preuve_file', formData.preuve_file);
    
            // Ajouter les autres champs requis par le backend
            formDataToSend.append('_method', 'PUT'); // Important pour Laravel quand on utilise PUT avec FormData
    
            const response = await axios.post(
                `${API_BASE_URL}/entreprise/reclamations/${id}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
    
            if (response.data.success) {
                setMessage('Réclamation mise à jour avec succès');
                setTimeout(() => navigate('/reclamations/listsreclamation'), 2000);
            }
        } catch (err) {
            console.error('Erreur:', err.response?.data);
            
            if (err.response?.status === 422) {
                // Meilleure gestion des erreurs de validation Laravel
                const validationErrors = err.response.data.errors;
                let errorMessages = [];
                
                for (const [field, messages] of Object.entries(validationErrors)) {
                    // Traduction des noms de champs pour l'utilisateur
                    const fieldName = {
                        'nom_entreprise_fraud': 'Entreprise frauduleuse',
                        'raison': 'Raison'
                    }[field] || field;
                    
                    errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
                }
                
                setError(errorMessages.join('\n'));
            } else {
                setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 my-3">
            <ol className="breadcrumb mb-4 text-light p-3 rounded shadow-sm">
                <li className="breadcrumb-item">
                    <a href="/dashboard" className="text-warning">Dashboard</a>
                </li>
                <li className="breadcrumb-item">
                    <a href="/reclamations" className="text-warning">Réclamations</a>
                </li>
                <li className="breadcrumb-item active text-light-dark">Modifier Réclamation</li>
            </ol>

            {message && (
                <div className="alert alert-success text-center mx-auto w-50" role="alert">
                    {message}
                </div>
            )}
            {error && (
                <div className="alert alert-danger text-center mx-auto w-50" style={{ whiteSpace: 'pre-line' }} role="alert">
                    {error}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Champ RC (lecture seule) */}
                        <div className="mb-3">
                            <label htmlFor="rc" className="form-label">
                                RC
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="rc"
                                name="rc"
                                value={formData.rc}
                                readOnly
                            />
                        </div>

                        {/* Champ ICE (lecture seule) */}
                        <div className="mb-3">
                            <label htmlFor="ice" className="form-label">
                                ICE
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="ice"
                                name="ice"
                                value={formData.ice}
                                readOnly
                            />
                        </div>

                        {/* Champ Nom Entreprise Post (lecture seule) */}
                        <div className="mb-3">
                            <label htmlFor="nom_entreprise_post" className="form-label">
                                Nom de votre entreprise
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="nom_entreprise_post"
                                name="nom_entreprise_post"
                                value={formData.nom_entreprise_post}
                                readOnly
                            />
                        </div>

                        {/* Champ Entreprise Frauduleuse (modifiable) */}
                        <div className="mb-3">
                            <label htmlFor="nom_entreprise_fraud" className="form-label">
                                Entreprise Frauduleuse <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${error.includes('nom_entreprise_fraud') ? 'is-invalid' : ''}`}
                                id="nom_entreprise_fraud"
                                name="nom_entreprise_fraud"
                                value={formData.nom_entreprise_fraud}
                                onChange={handleChange}
                                required
                            />
                            {error.includes('nom_entreprise_fraud') && (
                                <div className="invalid-feedback">
                                    {error.split('\n').find(e => e.includes('nom_entreprise_fraud'))}
                                </div>
                            )}
                        </div>
                        
                        {/* Champ Raison (modifiable) */}
                        <div className="mb-3">
                            <label htmlFor="raison" className="form-label">
                                Raison <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className={`form-control ${error.includes('raison') ? 'is-invalid' : ''}`}
                                id="raison"
                                name="raison"
                                rows="3"
                                value={formData.raison}
                                onChange={handleChange}
                                required
                            />
                            {error.includes('raison') && (
                                <div className="invalid-feedback">
                                    {error.split('\n').find(e => e.includes('raison'))}
                                </div>
                            )}
                        </div>
                        
                        {/* Champ Preuve (modifiable) */}
                        <div className="mb-3">
                            <label htmlFor="preuve_file" className="form-label">Nouvelle preuve (optionnel)</label>
                            <input
                                type="file"
                                className="form-control"
                                id="preuve_file"
                                name="preuve_file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <small className="text-muted">Formats acceptés: PDF, JPG, JPEG, PNG (max 2MB)</small>
                        </div>
                        
                        <div className="d-flex justify-content-center">
                            <button 
                                type="submit" 
                                className="btn btn-warning me-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Mettre à jour'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => navigate('/reclamations')}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditReclamation;