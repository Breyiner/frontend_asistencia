import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useFichaCreate from "../../hooks/useFichaCreate";

export default function FichasCreatePage() {
    const navigate = useNavigate();
    const { form, errors, loading, onChange, validateAndSave } = useFichaCreate();

    const programsCatalog = useCatalog("training_programs");
    const gestorscatalog = useCatalog("users/role/2");
    console.log(gestorscatalog);
    

    const handleSave = async () => {
        const result = await validateAndSave();
        if (result && result.ok) {
            navigate("/fichas");
        }
    };

    const sections = [

        {
            left: [
                {
                    title: "Información de la ficha",
                    content: (
                        <>
                            <InputField
                                label="Número de ficha"
                                name="ficha_number"
                                value={form.ficha_number}
                                disabled={loading}
                                onChange={onChange}
                                allow="digits"
                                error={errors.ficha_number}
                            />

                            <InputField
                                label="Programa"
                                name="training_program_id"
                                value={form.training_program_id}
                                onChange={onChange}
                                options={programsCatalog.options}
                                disabled={programsCatalog.loading || loading}
                                error={errors.training_program_id}
                                select
                            />

                            <InputField
                                label="Gestor"
                                name="gestor_id"
                                value={form.gestor_id}
                                onChange={onChange}
                                options={gestorscatalog.options}
                                disabled={gestorscatalog.loading || loading}
                                error={errors.gestor_id}
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
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/fichas")}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button variant="primary" onClick={handleSave} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar Ficha"}
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
            <UserLayout onBack={() => navigate("/fichas")} actions={null}>
                <BlocksGrid sections={sections} side={side} />
            </UserLayout>
        </div>
    );
}