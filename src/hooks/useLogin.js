import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/apiClient";
import { success, error } from "../utils/alertas";

export function useLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const login = async ({ email, password }) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("login", { email, password });
      console.log(res);
      

      if (!res.ok) {
        const msg = res.message || "No se pudo iniciar sesión";
        setErrorMsg(msg);
        await error(msg);
        return res;
      }

      await success(res.message || "Operación exitosa");
      navigate("/", { replace: true });
      return res;
    } catch (e) {
      const msg = e.message || "Error de conexión. Intenta de nuevo.";
      setErrorMsg(msg);
      await error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error: errorMsg };
}