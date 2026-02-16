import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useAreaCreate from "../../hooks/useAreaCreate";

export default function AreasCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useAreaCreate();

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok) {
      navigate(`/areas/${result.createdId}`);
      // o si prefieres volver al listado:
      // navigate("/areas");
    }
  };

  const sections = [
    {
      left: [
        {
          title: "Información del Área",
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
            onClick={() => navigate("/areas")}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Área"}
          </Button>
        </>
      ),
    },
  ];

  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Puedes editar la información después de crear el área.</p>,
    },
  ];

  return (
    <div className="area-create">
      <UserLayout onBack={() => navigate("/areas")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
