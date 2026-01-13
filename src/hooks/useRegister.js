import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/apiClient";
import { success, error, info } from "../utils/alertas";

export function useRegister() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const register = async (data) => {
        setLoading(true);
        setErrorMsg("");

        const payload = {
            first_name: (data.first_name).trim(),
            last_name: (data.last_name).trim(),

            document_type_id: Number.parseInt(String(data.document_type_id), 10),

            document_number: String(data.document_number).trim(),
            telephone_number: String(data.telephone_number).trim(),

            email: (data.email).trim(),
            password: String(data.password),
        };

        try {
            const res = await api.post("register", payload);

            if (!res.ok) {
                const msg = res.message || "No se pudo registrar";
                setErrorMsg(msg);
                await error(msg);
                console.log(res);

                return res;
            }

            await success(res.message || "Registro exitoso");

            await info("Te enviamos un correo de verificación. Confirma tu cuenta para poder iniciar sesión. Revisa spam si no aparece en unos minutos.");


            navigate("/login", { replace: true });
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

    return { register, loading, error: errorMsg };
}