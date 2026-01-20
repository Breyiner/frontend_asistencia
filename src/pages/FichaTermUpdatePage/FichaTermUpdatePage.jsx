// src/pages/fichaTerms/FichaTermUpdatePage.jsx
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import InfoRow from "../../components/InfoRow/InfoRow";

import useCatalog from "../../hooks/useCatalog";
import useFichaTermUpdate from "../../hooks/useFichaTermUpdate";

export default function FichaTermUpdatePage() {
  const navigate = useNavigate();
  const { form, ficha, fichaId, errors, loading, onChange, validateAndSave } = useFichaTermUpdate();

  const termsCatalog = useCatalog("terms");
  const phasesCatalog = useCatalog("phases");

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate(`/fichas/${fichaId}`);
  };

  if (!ficha) {
    return (
      <div className="loading-center">
        <div>Cargando...</div>
      </div>
    );
  }

  const sections = [
    {
      left: [
        {
          content: (
            <>
              <InputField
                label="Trimestre"
                name="term_id"
                value={form.term_id}
                onChange={onChange}
                options={termsCatalog.options}
                disabled={termsCatalog.loading || loading}
                error={errors.term_id}
                select
              />
              <InputField
                label="Fase"
                name="phase_id"
                value={form.phase_id}
                onChange={onChange}
                options={phasesCatalog.options}
                disabled={phasesCatalog.loading || loading}
                error={errors.phase_id}
                select
              />
            </>
          ),
        },
      ],
      right: [
        {
          content: (
            <>
              <InputField
                label="Fecha Inicio"
                name="start_date"
                type="date"
                value={form.start_date}
                disabled={loading}
                onChange={onChange}
                error={errors.start_date}
              />
              <InputField
                label="Fecha Fin"
                name="end_date"
                type="date"
                value={form.end_date}
                disabled={loading}
                onChange={onChange}
                error={errors.end_date}
              />
            </>
          ),
        },
      ],
      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate(`/fichas/${fichaId}`)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Actualizar Trimestre"}
          </Button>
        </>
      ),
    },
  ];

  const side = [
    {
      title: "Información Adicional",
      variant: "default",
      content: (
        <>
          <InfoRow label="Ficha" value={ficha.ficha_number} />
          <InfoRow label="Programa de Formación" value={ficha.training_program_name} />
        </>
      ),
    },
  ];

  return (
    <div className="user-create">
      <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}