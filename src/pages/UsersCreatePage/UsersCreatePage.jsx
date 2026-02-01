import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useUserCreate from "../../hooks/useUserCreate";

export default function UsersCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useUserCreate();

  const rolesCatalog = useCatalog("roles/selectable", { includeEmpty: false });
  const areasCatalog = useCatalog("areas", { includeEmpty: false });
  const docTypesCatalog = useCatalog("document_types");

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok && result.createdId) {
      navigate(`/users/${result.createdId}`);
    }
  };

  const sections = [
    {
      left: [
        {
          title: "Información Personal",
          content: (
            <>
              <InputField
                label="Nombres"
                name="first_name"
                value={form.first_name}
                disabled={loading}
                onChange={onChange}
                error={errors.first_name}
              />
              <InputField
                label="Apellidos"
                name="last_name"
                value={form.last_name}
                disabled={loading}
                onChange={onChange}
                error={errors.last_name}
              />
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
              <InputField
                label="Documento"
                name="document_number"
                value={form.document_number}
                disabled={loading}
                onChange={onChange}
                error={errors.document_number}
              />
              <InputField
                label="Correo"
                name="email"
                value={form.email}
                disabled={loading}
                onChange={onChange}
                error={errors.email}
              />
              <InputField
                label="Teléfono"
                name="telephone_number"
                value={form.telephone_number}
                disabled={loading}
                onChange={onChange}
                error={errors.telephone_number}
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
                label="Roles"
                name="roles"
                value={form.roles}
                onChange={onChange}
                options={rolesCatalog.options}
                multiple
                size={4}
                disabled={rolesCatalog.loading || loading}
                error={errors.roles}
                select
              />

              <InputField
                label="Áreas"
                name="areas"
                value={form.areas}
                onChange={onChange}
                options={areasCatalog.options}
                multiple
                size={6}
                disabled={areasCatalog.loading || loading}
                error={errors.areas}
                select
              />
            </>
          ),
        },
      ],
      footer: (
        <>
          <Button
            variant="secondary"
            onClick={() => navigate("/users")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </>
      ),
    },
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
      <UserLayout onBack={() => navigate("/users")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}