import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import useCatalog from "../../hooks/useCatalog";
import { can } from "../../utils/auth";

export default function NoClassDaysListPage() {

    const canCreate = can("no_class_days.create");

    const fichasCatalog = useCatalog("fichas");
    const reasonsCatalog = useCatalog("no_class_reasons");
    const programsCatalog = useCatalog("training_programs");

    const filtersConfig = [
        {
            name: "date",
            label: "Fecha",
            type: "date",
            defaultValue: "",
        },
        {
            name: "ficha_id",
            label: "Ficha",
            type: "select",
            defaultValue: "",
            options: fichasCatalog.options,
            // advanced: true,
        },
        {
            name: "reason_id",
            label: "Motivo",
            type: "select",
            defaultValue: "",
            options: reasonsCatalog.options,
            advanced: true,
        },
        {
            name: "training_program_id",
            label: "Programa de Formación",
            type: "select",
            defaultValue: "",
            options: programsCatalog.options,
            advanced: true,
        },
        {
            name: "date_from",
            label: "Desde",
            type: "date",
            defaultValue: "",
            advanced: true,
        },
        {
            name: "date_to",
            label: "Hasta",
            type: "date",
            defaultValue: "",
            advanced: true,
        },
    ];

    return (
        <DataListLayout
            title="Listado de Días sin Clase"
            endpoint="no_class_days"
            createPath={canCreate ? "/no_class_days/create" : null}
            initialFilters={{ per_page: 10 }}
            rowClickPath={(c) => `/no_class_days/${c.id}`}
            filtersConfig={filtersConfig}
            tableColumns={[
                { key: "date", label: "Fecha" },
                { key: "reason_name", label: "Motivo",},
                { key: "ficha_number", label: "Ficha" },
                { key: "training_program_name", label: "Programa" },
                { key: "observations", label: "Observaciones" },
            ]}
        />
    );
}