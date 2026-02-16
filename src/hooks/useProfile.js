/**
 * useProfile - Hook COMPLETO perfil usuario + cambio contraseña.
 * Maneja 2 formularios independientes: personal + password.
 */
import { useEffect, useState } from "react";
import { getCurrentRole, getUser } from "../utils/auth";        // Zustand/localStorage
import { validarCamposReact } from "../utils/validators";
import { api } from "../services/apiClient";
import { confirm, error, success } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const personalSchema = [                                        // Validación datos personales
  { name: "firstname", type: "text", required: true, maxLength: 80 },
  { name: "lastname", type: "text", required: true, maxLength: 80 },
  { name: "document_type_id", required: true, maxLength: 40 },  // Sin type="select" (number?)
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 }
];

const passwordSchema = [                                       // Validación cambio password
  { name: "current_password", type: "password", required: true, minLength: 8 },
  { name: "new_password", type: "password", required: true, minLength: 8, maxLength: 60 },
  { name: "password_confirmation", type: "password", required: true, minLength: 8, maxLength: 60 }
];

export function useProfile() {
  const currentRole = getCurrentRole();                          // Sync desde auth store
  const currentData = getUser();                                 // Usuario logueado
  const navigate = useNavigate();                                // Logout → /login

  const [user, setUser] = useState(null);                        // Perfil completo desde /profiles/me
  const [personalLoading, setPersonalLoading] = useState(false); // Solo personal form
  const [passwordLoading, setPasswordLoading] = useState(false); // Solo password form
  const [initialLoading, setInitialLoading] = useState(true);    // Primera carga perfil
  const [logoutLoading, setLogoutLoading] = useState(false);     // Logout spinner

  const [documentTypes, setDocumentTypes] = useState([]);        // Catálogo para select
  const [documentTypesLoading, setDocumentTypesLoading] = useState(true);

  // Form personal (populado desde API)
  const [personalForm, setPersonalForm] = useState({             
    first_name: "",                                             
    last_name: "",
    document_type_id: "1",                                       // Default tipo 1
    document_number: "",
    email: "",                                                   // Read-only?
    telephone_number: "",
    role: "",                                                    // Display only
    created_at: ""                                               // Display only
  });
  const [personalErrors, setPersonalErrors] = useState({});

  const [editMode, setEditMode] = useState(false);               // Toggle edit/view personal
  const [passwordForm, setPasswordForm] = useState({             
    current_password: "",
    new_password: "",
    password_confirmation: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMode, setPasswordMode] = useState(false);       // Toggle password form

  // Carga perfil completo + catálogos al montar
  useEffect(() => {                                             
    const fetchProfile = async () => {
      try {
        setInitialLoading(true);                                 // Global spinner
        const response = await api.get("profiles/users/me");     // Perfil expandido
        
        if (response.ok) {
          setUser(response.data);                                // {user, profile, roles?}
          setPersonalForm({                                      // Popula form
            first_name: response.data.profile.first_name,
            last_name: response.data.profile.last_name,
            document_type_id: response.data.document_type_id || "1",
            document_number: response.data.document_number,
            email: response.data.email,
            telephone_number: response.data.profile.telephone_number,
            created_at: response.data.created_at,
            role: ""                                               // De auth store
          });
          
          // Catálogo tipos documento paralelo
          const dtRes = await api.get("document-types");
          if (dtRes.ok) setDocumentTypes(dtRes.data);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setInitialLoading(false);
        setDocumentTypesLoading(false);
      }
    };
    fetchProfile();
  }, []);                                                        // [] = una vez al montar

  // Handlers genéricos onChange (limpia errores)
  const onPersonalChange = (e) => {                              
    const { name, value } = e.target;
    setPersonalForm(prev => ({ ...prev, [name]: value }));
    if (personalErrors[name]) setPersonalErrors(prev => ({ ...prev, [name]: "" }));
  };

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Toggle modos edit (reset errores)
  const toggleEdit = () => {                                     
    setEditMode(!editMode);
    if (!editMode) setPersonalErrors({});                      // Limpia al entrar edit
  };

  const togglePassword = () => {
    setPasswordMode(!passwordMode);
    if (!passwordMode) {
      setPasswordErrors({});
      setPasswordForm({                                          // Reset passwords
        current_password: "",
        new_password: "",
        password_confirmation: ""
      });
    }
  };

  // Submit personal PATCH /profiles/users/me
  const savePersonal = async (e) => {                           
    e.preventDefault();                                          // Previene submit nativo
    const result = validarCamposReact(personalForm, personalSchema);
    setPersonalErrors(result.errors);
    
    if (!result.ok) return;                                      // Early return errores

    try {
      setPersonalLoading(true);
      const payload = {
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        document_type_id: Number(personalForm.document_type_id),
        document_number: personalForm.document_number.trim(),
        telephone_number: personalForm.telephone_number.trim()
      };

      const response = await api.patch("profiles/users/me", payload);
      if (response.ok) {
        await success(response.message, "Perfil Actualizado con éxito");
        setUser(response.data);                                  // Refresh state
        toggleEdit();                                            // Sale modo edit
      } else {
        await error(response.message, "No se pudo registrar el Perfil");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      const msg = error.message || "Error de conexión. Intenta de nuevo.";
      await error(msg);
    } finally {
      setPersonalLoading(false);
    }
  };

  // Submit password PATCH /users/me/password (validación match manual)
  const savePassword = async (e) => {                           
    e.preventDefault();
    
    // Validación manual confirmación
    if (passwordForm.new_password !== passwordForm.password_confirmation) {
      setPasswordErrors({ 
        password_confirmation: "Las contraseñas no coinciden" 
      });
      return;
    }

    const result = validarCamposReact(passwordForm, passwordSchema);
    setPasswordErrors(result.errors);
    if (!result.ok) return;

    try {
      setPasswordLoading(true);
      const payload = {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        password_confirmation: passwordForm.password_confirmation
      };

      const response = await api.patch("users/me/password", payload);
      if (response.ok) {
        await success(response.message, "Contraseña Actualizada con éxito");
        togglePassword();                                        // Cierra form
      } else {
        await error(response.message, "No se pudo actualizar la contraseña");
      }
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      const msg = error.message || "Error de conexión. Intenta de nuevo.";
      await error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout con confirm + navigate replace
  const handleLogout = async () => {                            
    let decision = await confirm("¿Desea cerrar sesión?");
    if (!decision.isConfirmed) return;

    try {
      setLogoutLoading(true);
      const response = await api.post("logout");                 // POST /api/logout
      if (response.ok) {
        navigate("/login", { replace: true });                   // Limpia history
        await success("Sesión cerrada correctamente");
      } else {
        await error(response.message, "Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error logout:", error);
      navigate("/login", { replace: true });                     // Force logout
      await error("Sesión cerrada");
    } finally {
      setLogoutLoading(false);
    }
  };

  // API pública completa
  return {
    user, initialLoading, personalLoading, passwordLoading,
    currentData, currentRole, editMode, passwordMode,
    personalForm, passwordForm, personalErrors, passwordErrors,
    documentTypes, documentTypesLoading,
    toggleEdit, togglePassword, onPersonalChange, onPasswordChange,
    savePersonal, savePassword, handleLogout, logoutLoading
  };
}
