import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useProgramCreate from "../../hooks/useProgramCreate";

export default function ProgramsCreatePage() {
    const navigate = useNavigate();
    const { form, errors, loading, onChange, validateAndSave } = useProgramCreate();

    const levelsCatalog = useCatalog("qualification_levels");
    const areasCatalog = useCatalog("areas");
    const coordinatorsCatalog = useCatalog("users/role/2", { includeEmpty: false });

    const handleSave = async () => {
        const result = await validateAndSave();
        if (result && result.ok) {
            navigate("/training_programs");
        }
    };

    const sections = [
        {
            left: [
                {
                    title: "Información del Programa",
                    content: (
                        <>
                            <InputField
                                label="Nombre del Programa"
                                name="name"
                                value={form.name}
                                disabled={loading}
                                onChange={onChange}
                                error={errors.name}
                            />

                            <InputField
                                label="Duración (meses)"
                                name="duration"
                                value={form.duration}
                                disabled={loading}
                                allow="digits"
                                onChange={onChange}
                                error={errors.duration}
                            />

                            <InputField
                                label="Nivel de Formación"
                                name="qualification_level_id"
                                value={form.qualification_level_id}
                                onChange={onChange}
                                options={levelsCatalog.options}
                                disabled={levelsCatalog.loading || loading}
                                error={errors.qualification_level_id}
                                select
                            />

                            <InputField
                                label="Área"
                                name="area_id"
                                value={form.area_id}
                                onChange={onChange}
                                options={areasCatalog.options}
                                disabled={areasCatalog.loading || loading}
                                error={errors.area_id}
                                select
                            />

                            <InputField
                                label="Coordinador"
                                name="coordinator_id"
                                value={form.coordinator_id}
                                onChange={onChange}
                                options={coordinatorsCatalog.options}
                                disabled={coordinatorsCatalog.loading || loading}
                                error={errors.coordinator_id}
                                select
                            />
                        </>
                    ),
                },
            ],

            right: [
                {
                    title: "Información Adicional",
                    content: (
                        <>
                            <InputField
                                label="Descripción"
                                name="description"
                                textarea
                                rows={4}
                                value={form.description}
                                onChange={onChange}
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
                        onClick={() => navigate("/training_programs")}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar Programa"}
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
            <UserLayout onBack={() => navigate("/training_programs")} actions={null}>
                <BlocksGrid sections={sections} side={side} />
            </UserLayout>
        </div>
    );
}