import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useRoleCreate from "../../hooks/useRoleCreate";

export default function RolesCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useRoleCreate();

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok) {
      // te mando al show del rol creado (mejor UX)
      navigate(`/roles/${result.createdId}`);
      // o si prefieres listado:
      // navigate("/roles");
    }
  };

  const sections = [
    {
      left: [
        {
          title: "Información del Rol",
          content: (
            <>
              <InputField
                label="Nombre"
                name="name"
                value={form.name}
                disabled={loading}
                onChange={onChange}
                error={errors.name}
              />

              <InputField
                label="Código"
                name="code"
                value={form.code}
                disabled={loading}
                onChange={onChange}
                error={errors.code}
                helper="Ej: ADMIN, COORDINADOR, INSTRUCTOR"
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "Información adicional",
          content: (
            <>
              <InputField
                label="Descripción"
                name="description"
                textarea
                rows={4}
                value={form.description}
                onChange={onChange}
                disabled={loading}
                error={errors.description}
              />
            </>
          ),
        },
      ],

      footer: (
        <>
          <Button
            variant="secondary"
            onClick={() => navigate("/roles")}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Rol"}
          </Button>
        </>
      ),
    },
  ];

  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Puedes vincular permisos después de crear el rol.</p>,
    },
  ];

  return (
    <div className="role-create">
      <UserLayout onBack={() => navigate("/roles")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
