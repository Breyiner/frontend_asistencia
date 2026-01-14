import { useEffect, useState } from "react";
import { getCurrentRole, getUser } from "../utils/auth";
import { validarCamposReact } from "../utils/validators";
import { api } from "../services/apiClient";
import { confirm, error, success } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const personalSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "document_type_id", required: true, maxLength: 40 },
  {
    name: "document_number",
    type: "text",
    required: true,
    minLength: 6,
    maxLength: 20,
  },
  {
    name: "telephone_number",
    type: "text",
    required: true,
    minLength: 7,
    maxLength: 20,
  },
];

const passwordSchema = [
  { name: "current_password", type: "password", required: true, minLength: 8 },
  {
    name: "new_password",
    type: "password",
    required: true,
    minLength: 8,
    maxLength: 60,
  },
  {
    name: "password_confirmation",
    type: "password",
    required: true,
    minLength: 8,
    maxLength: 60,
  },
];

export function useProfile() {
  const currentRole = getCurrentRole();
  const currentData = getUser();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypesLoading, setDocumentTypesLoading] = useState(true);

  const [personalForm, setPersonalForm] = useState({
    first_name: "",
    last_name: "",
    document_type_id: 1,
    document_number: "",
    email: "",
    telephone_number: "",
    role: "",
    created_at: "",
  });
  const [personalErrors, setPersonalErrors] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMode, setPasswordMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get("profiles/users/me");
        console.log(response);

        if (response.ok) {
          setUser(response.data);
          setPersonalForm({
            first_name: response.data.profile.first_name || "",
            last_name: response.data.profile.last_name || "",
            document_type_id: response.data.document_type_id || 1,
            document_number: response.data.document_number || "",
            email: response.data.email || "",
            telephone_number: response.data.profile.telephone_number || "",
            created_at: response.data.created_at || "",
          });

          const dtRes = await api.get("document_types");
          if (dtRes.ok) {
            setDocumentTypes(dtRes.data);
          }
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setInitialLoading(false);
        setDocumentTypesLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onPersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
    if (personalErrors[name])
      setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name])
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleEdit = () => {
    setEditMode(!editMode);
    if (!editMode) setPersonalErrors({});
  };

  const togglePassword = () => {
    setPasswordMode(!passwordMode);
    if (!passwordMode) {
      setPasswordErrors({});
      setPasswordForm({
        current_password: "",
        new_password: "",
        password_confirmation: "",
      });
    }
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    const result = validarCamposReact(personalForm, personalSchema);
    setPersonalErrors(result.errors);

    if (!result.ok) return;

    try {
      setPersonalLoading(true);
      const payload = {
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        document_type_id: Number(personalForm.document_type_id),
        document_number: personalForm.document_number.trim(),
        telephone_number: personalForm.telephone_number.trim(),
      };

      const response = await api.patch("profiles/users/me", payload);
      if (response.ok) {
        console.log("Perfil actualizado:", response.data);
        success(response.message || "Perfil Actualizado con éxito");
        setUser(response.data);
        toggleEdit();
      } else {
        await error(response.message || "No se pudo registrar el Perfil");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      const msg = e.message || "Error de conexión. Intenta de nuevo.";
      await error(msg);
    } finally {
      setPersonalLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.password_confirmation) {
      setPasswordErrors({
        password_confirmation: "Las contraseñas no coinciden",
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
        new_password_confirmation: passwordForm.password_confirmation,
      };

      const response = await api.patch("users/me/password", payload);
      if (response.ok) {
        console.log("Contraseña actualizada");
        success(response.message || "Contraseña Actualizada con éxito");
        togglePassword();
      } else {
        console.log(response);

        await error(response.message || "No se pudo actualizar la contraseña");
      }
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      const msg = e.message || "Error de conexión. Intenta de nuevo.";
      await error(msg || "Error de conexión. Intenta de nuevo.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    let decision = await confirm("¿Desea cerrar sesión?");

    if (!decision.isConfirmed) return;

    try {
      setLogoutLoading(true);
      const response = await api.post("logout");

      if (response.ok) {
        navigate("/login", { replace: true });

        await success("Sesión cerrada correctamente");
      } else {
        await error(response.message || "Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error logout:", error);
      navigate("/login", { replace: true });
      await error("Sesión cerrada");
    } finally {
      setLogoutLoading(false);
    }
  };

  return {
    user,
    initialLoading,
    personalLoading,
    passwordLoading,
    currentData,
    currentRole,
    editMode,
    passwordMode,
    personalForm,
    passwordForm,
    personalErrors,
    passwordErrors,
    documentTypes,
    documentTypesLoading,
    toggleEdit,
    togglePassword,
    onPersonalChange,
    onPasswordChange,
    savePersonal,
    savePassword,
    handleLogout,
    logoutLoading,
  };
}
