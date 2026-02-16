import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useAreaShow from "../../hooks/useAreaShow";

export default function AreaShowPage() {
    const { areaId } = useParams();
    const navigate = useNavigate();

    const {
        area,
        loading,
        isEditing,
        form,
        errors,
        saving,
        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteArea,
        notFound
    } = useAreaShow(areaId);

    const sections = useMemo(
        () => [
            {
                left: [
                    {
                        title: "Información del Área",
                        content: isEditing ? (
                            <>
                                <InputField
                                    label="Nombre"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    error={errors.name}
                                    disabled={saving}
                                />
                            </>
                        ) : (
                            <>
                                <InfoRow label="Nombre" value={area?.name} />
                            </>
                        ),
                    },
                ],
                right: [
                    {
                        title: "Descripción",
                        content: isEditing ? (
                            <InputField
                                label="Descripción"
                                name="description"
                                textarea
                                rows={4}
                                value={form.description}
                                onChange={onChange}
                                disabled={saving}
                                error={errors.description}
                            />
                        ) : (
                            <>
                                <InfoRow label="Descripción" value={area?.description || "Sin descripción"} />
                            </>
                        ),
                    },
                ],
            },
        ],
        [isEditing, form, errors, onChange, area, saving]
    );

    const side = useMemo(
        () =>
            [
                !isEditing && area
                    ? {
                        title: "Información Sistema",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow label="ID" value={area.id} />
                                <InfoRow label="Fecha registro" value={area.created_at} />
                                <InfoRow label="Última actualización" value={area.updated_at} />
                            </>
                        ),
                    }
                    : null,

                // Si tu endpoint de Area devuelve training_programs_count, lo muestras aquí:
                !isEditing && area?.training_programs_count != null
                    ? {
                        title: "Estadísticas",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow
                                    label="Programas de formación"
                                    value={area.training_programs_count}
                                />
                            </>
                        ),
                    }
                    : null,

                {
                    title: "Nota",
                    variant: "info",
                    content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
                },
            ].filter(Boolean),
        [isEditing, area]
    );

    const actions = useMemo(
        () =>
            isEditing ? (
                <>
                    <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={save} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="primary" onClick={startEdit}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={deleteArea}>
                        Eliminar
                    </Button>
                </>
            ),
        [isEditing, saving, cancelEdit, save, startEdit, deleteArea]
    );

    if (loading) return <div>Cargando...</div>;
    if (notFound) return <div>No encontrado</div>;
    if (!area) return null;

    return (
        <div className="area-show">
            <UserLayout onBack={() => navigate("/areas")} actions={actions}>
                <BlocksGrid sections={sections} side={side} />
            </UserLayout>
        </div>
    );
}
