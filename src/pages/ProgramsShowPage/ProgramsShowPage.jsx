import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useProgramShow from "../../hooks/useProgramShow";

export default function ProgramShowPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        program,
        loading,
        isEditing,
        form,
        errors,
        saving,
        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteProgram,
    } = useProgramShow(id);

    const levelsCatalog = useCatalog("qualification_levels");
    const areasCatalog = useCatalog("areas");

    const left = useMemo(
        () => [
            {
                title: "Información del Programa",
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
                        <InputField
                            label="Duración (meses)"
                            name="duration"
                            value={form.duration}
                            onChange={onChange}
                            error={errors.duration}
                            disabled={saving}
                        />
                        <InputField
                            label="Nivel de Formación"
                            name="qualification_level_id"
                            value={form.qualification_level_id}
                            onChange={onChange}
                            options={levelsCatalog.options}
                            disabled={levelsCatalog.loading || saving}
                            error={errors.qualification_level_id}
                            select
                        />
                        <InputField
                            label="Área"
                            name="area_id"
                            value={form.area_id}
                            onChange={onChange}
                            options={areasCatalog.options}
                            disabled={areasCatalog.loading || saving}
                            error={errors.area_id}
                            select
                        />
                    </>
                ) : (
                    <>
                        <InfoRow label="Nombre" value={program?.name} />
                        <InfoRow label="Duración" value={program?.duration + " meses"} />
                        <InfoRow label="Nivel" value={program?.qualification_level_name} />
                        <InfoRow label="Área" value={program?.area_name} />
                    </>
                ),
            },
        ],
        [isEditing, form, errors, onChange, program, levelsCatalog.options, areasCatalog.options, levelsCatalog.loading, areasCatalog.loading, saving]
    );

    const right = useMemo(
        () => [
            {
                title: "Información Adicional",
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
                        <InfoRow label="Descripción" value={program?.description} />
                    </>
                ),
            },
        ],
        [isEditing, form.description, errors.description, onChange, program?.description]
    );

    const side = useMemo(
        () =>
            [
                !isEditing && program
                    ? {
                        title: "Información Sistema",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow label="ID" value={program.id} />
                                <InfoRow label="Fecha registro" value={program.created_at} />
                                <InfoRow label="Última actualización" value={program.updated_at} />
                            </>
                        ),
                    }
                    : null,

                !isEditing && program
                    ? {
                        title: "Estadísticas",
                        variant: "default",
                        content: (
                            <>
                                <InfoRow label="Fichas Relacionadas" value={program.fichas_count} />
                                <InfoRow label="Aprendices Inscritos" value={program.apprentices_count} />
                                <InfoRow label="Trimestres Lectiva" value={program?.trimesters_lective} />
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
        [isEditing, program]
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
                    <Button variant="danger" onClick={deleteProgram}>
                        Eliminar
                    </Button>
                </>
            ),
        [isEditing, saving, cancelEdit, save, startEdit, deleteProgram]
    );

    if (loading) return <div>Cargando...</div>;
    if (!program) return <div>No encontrado</div>;

    return (
        <div className="program-show">
            <UserLayout onBack={() => navigate("/training_programs")} actions={actions}>
                <BlocksGrid left={left} right={right} side={side} />
            </UserLayout>
        </div>
    );
}
