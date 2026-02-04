import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useApprenticeCreate from "../../hooks/useApprenticeCreate";

function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ApprenticesCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useApprenticeCreate();

  const docTypesCatalog = useCatalog("document_types");
  const programsCatalog = useCatalog("training_programs/select");
  const fichasCatalog = useCatalog(`fichas/training_program/${form.training_program_id}`);

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok && result.createdId) {
      navigate(`/apprentices/${result.createdId}`);
    }
  };

  const sections = [

    {

      left: [
        {
          title: "Información Personal",
          content: (
            <>
              <InputField label="Nombres" name="first_name" value={form.first_name} disabled={loading} onChange={onChange} error={errors.first_name} />
              <InputField label="Apellidos" name="last_name" value={form.last_name} disabled={loading} onChange={onChange} error={errors.last_name} />

              <InputField
                label="Tipo de Documento"
                name="document_type_id"
                value={form.document_type_id}
                onChange={onChange}
                options={docTypesCatalog.options}
                disabled={docTypesCatalog.loading || loading}
                error={errors.document_type_id}
                select
              />

              <InputField label="Documento" name="document_number" value={form.document_number} disabled={loading} onChange={onChange} error={errors.document_number} />

              <InputField label="Correo" name="email" value={form.email} disabled={loading} onChange={onChange} error={errors.email} />

              <InputField label="Teléfono" name="telephone_number" value={form.telephone_number} disabled={loading} onChange={onChange} error={errors.telephone_number} />

              <InputField
                label="Fecha de nacimiento"
                name="birth_date"
                type="date"
                value={form.birth_date}
                disabled={loading}
                onChange={onChange}
                error={errors.birth_date}
                max={yesterdayYmd()}
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "Información Sistema",
          content: (
            <>
              <InputField
                label="Programa de Formación"
                name="training_program_id"
                value={form.training_program_id}
                onChange={onChange}
                options={programsCatalog.options}
                disabled={programsCatalog.loading || loading}
                error={errors.training_program_id}
                select
              />

              <InputField
                label="Fichas"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                select
              />
            </>
          ),
        },
      ],

      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate("/apprentices")} disabled={loading}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Aprendiz"}
          </Button>
        </>
      )

    }

  ];

  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="user-create">
      <UserLayout onBack={() => navigate("/apprentices")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}