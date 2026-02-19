import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

/**
 * Schema de validación para actualización de tipos de documento.
 *
 * @constant
 * @type {Array<Object>}
 */
const documentTypeUpdateSchema = [
  { name: "name",    type: "text", required: true,  maxLength: 100 },
  { name: "acronym", type: "text", required: true,  maxLength: 10  },
];

/**
 * Mapea los datos del tipo de documento a formato de formulario.
 *
 * @param {Object|null} documentType
 * @returns {Object}
 */
function mapDocumentTypeToForm(documentType) {
  return {
    name:    documentType?.name    || "",
    acronym: documentType?.acronym || "",
  };
}

/**
 * Hook personalizado para ver y editar un tipo de documento específico.
 *
 * @hook
 * @param {number|string} id - ID del tipo de documento a cargar
 *
 * @returns {Object}
 */
export default function useDocumentTypeShow(id) {
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [form, setForm]                 = useState(mapDocumentTypeToForm(null));
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);

  const fetchDocumentType = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(false);
      setDocumentType(null);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const res = await api.get(`document_types/${id}`);

      if (!res.ok) {
        setDocumentType(null);
        setNotFound(true);
        setIsEditing(false);
        return;
      }

      setDocumentType(res.data);
    } catch (e) {
      setDocumentType(null);
      setNotFound(false);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocumentType();
  }, [fetchDocumentType]);

  useEffect(() => {
    if (!documentType) return;
    if (!isEditing) setForm(mapDocumentTypeToForm(documentType));
  }, [documentType, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapDocumentTypeToForm(documentType));
  }, [documentType]);

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapDocumentTypeToForm(documentType));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const save = async () => {
    const result = validarCamposReact(form, documentTypeUpdateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      const payload = {
        name:    form.name?.trim(),
        acronym: form.acronym?.trim(),
      };

      const res = await api.patch(`document_types/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el tipo de documento.");
        return false;
      }

      await success(res.message || "Tipo de documento actualizado con éxito.");
      setIsEditing(false);
      await fetchDocumentType();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteDocumentType = async () => {
    const confirmed = await confirm("¿Eliminar este tipo de documento permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`document_types/${id}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar el tipo de documento.");
        return false;
      }

      await success("Tipo de documento eliminado!");
      navigate("/document_types");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    documentType,
    loading,
    notFound,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteDocumentType,
    refetch: fetchDocumentType,
  };
}