import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useNoClassDayCreate from "../../hooks/useNoClassDayCreate";

export default function NoClassDayCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useNoClassDayCreate();

  const fichasCatalog = useCatalog("fichas");
  const reasonsCatalog = useCatalog("no_class_reasons");

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate("/no_class_days");
  };

  const sections = [
    {
      left: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Ficha"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                select
              />

              <InputField
                label="Fecha"
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                disabled={loading}
                error={errors.date}
              />
            </>
          ),
        },
      ],

      right: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Motivo"
                name="reason_id"
                value={form.reason_id}
                onChange={onChange}
                options={reasonsCatalog.options}
                disabled={reasonsCatalog.loading || loading}
                error={errors.reason_id}
                select
              />

              <InputField
                label="Observaciones"
                name="observations"
                textarea
                value={form.observations}
                onChange={onChange}
                disabled={loading}
                error={errors.observations}
              />
            </>
          ),
        },
      ],

      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate("/no_class_days")} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Día sin Clase"}
          </Button>
        </>
      ),
    },
  ];

  const side = [
    {
      title: "Información",
      variant: "info",
      content: (
        <p>
          Los días sin clase no se contabilizan como ausencias para los aprendices 
          y afectan el cálculo de asistencias de la ficha.
        </p>
      ),
    },
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="no-class-day-create">
      <UserLayout onBack={() => navigate("/no_class_days")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}