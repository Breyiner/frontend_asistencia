import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useApprenticeCreate from "../../hooks/useApprenticeCreate";

/**
 * Retorna la fecha de ayer en formato YYYY-MM-DD.
 * Se usa como valor `max` en el campo de fecha de nacimiento
 * para impedir seleccionar la fecha actual o una futura.
 */
function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Pagina de creacion de aprendices.
 *
 * Muestra un formulario dividido en dos columnas:
 *   - Izquierda: datos personales del aprendiz.
 *   - Derecha: datos del sistema (programa y ficha).
 *
 * Flujo general:
 *   1. El usuario completa el formulario.
 *   2. Al guardar, `validateAndSave` valida y envia al backend.
 *   3. Si la creacion es exitosa, navega al detalle del nuevo aprendiz.
 *
 * Los campos con options usan `combo` para permitir busqueda por texto.
 * Las fichas dependen del programa seleccionado: su catalogo se recarga
 * automaticamente cuando cambia `form.training_program_id`.
 */
export default function ApprenticesCreatePage() {
  const navigate = useNavigate();

  // Estado del formulario, errores de validacion y accion de guardado.
  const { form, errors, loading, onChange, validateAndSave } = useApprenticeCreate();

  // Catalogos: se cargan una vez y la busqueda se hace en cliente.
  const docTypesCatalog = useCatalog("document_types/select");
  const programsCatalog = useCatalog("training_programs/select");

  // Las fichas dependen del programa; el hook recarga cuando cambia el id.
  const fichasCatalog = useCatalog(`fichas/training_program/${form.training_program_id}`);

  /**
   * Llama a validateAndSave y, si la respuesta indica exito,
   * redirige al detalle del aprendiz recien creado.
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result && result.ok && result.createdId) {
      navigate(`/apprentices/${result.createdId}`);
    }
  };

  // Definicion de las secciones del grid. Cada seccion tiene columna
  // izquierda, columna derecha y botones en el footer.
  const sections = [
    {
      // Columna izquierda: informacion personal
      left: [
        {
          title: "Informacion Personal",
          content: (
            <>
              <InputField
                label="Nombres"
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                disabled={loading}
                error={errors.first_name}
              />

              <InputField
                label="Apellidos"
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                disabled={loading}
                error={errors.last_name}
              />

              {/* Tipo de documento: combobox para buscar entre las opciones del catalogo */}
              <InputField
                label="Tipo de Documento"
                name="document_type_id"
                value={form.document_type_id}
                onChange={onChange}
                options={docTypesCatalog.options}
                disabled={docTypesCatalog.loading || loading}
                error={errors.document_type_id}
                combo
              />

              <InputField
                label="Documento"
                name="document_number"
                value={form.document_number}
                onChange={onChange}
                disabled={loading}
                error={errors.document_number}
              />

              <InputField
                label="Correo"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
                error={errors.email}
              />

              <InputField
                label="Telefono"
                name="telephone_number"
                value={form.telephone_number}
                onChange={onChange}
                disabled={loading}
                error={errors.telephone_number}
              />

              {/* max=ayer impide seleccionar la fecha actual o una futura */}
              <InputField
                label="Fecha de nacimiento"
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={onChange}
                disabled={loading}
                error={errors.birth_date}
                max={yesterdayYmd()}
              />
            </>
          ),
        },
      ],

      // Columna derecha: informacion del sistema
      right: [
        {
          title: "Informacion Sistema",
          content: (
            <>
              {/* Programa de formacion: combobox para buscar entre los programas */}
              <InputField
                label="Programa de Formacion"
                name="training_program_id"
                value={form.training_program_id}
                onChange={onChange}
                options={programsCatalog.options}
                disabled={programsCatalog.loading || loading}
                error={errors.training_program_id}
                combo
              />

              {/* Ficha: se filtra segun el programa seleccionado arriba */}
              <InputField
                label="Fichas"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                combo
              />
            </>
          ),
        },
      ],

      // Botones de accion: cancelar regresa al listado, guardar ejecuta handleSave.
      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate("/apprentices")} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Aprendiz"}
          </Button>
        </>
      ),
    },
  ];

  // Panel lateral con nota informativa para el usuario.
  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios realizados se guardaran automaticamente en el sistema</p>,
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