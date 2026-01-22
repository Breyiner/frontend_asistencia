import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import useCatalog from "../../hooks/useCatalog";

export default function RealClassesListPage() {

    const instructorsCatalog = useCatalog("users/role/3");
    const fichasCatalog = useCatalog("fichas");
    const programsCatalog = useCatalog("training_programs");
    const termsCatalog = useCatalog("terms");

    console.log(fichasCatalog);
    

    return (
        <DataListLayout
            title="Listado de Clases"
            endpoint="real_classes"
            createPath="/real_classes/create"
            initialFilters={{ per_page: 10 }}
            rowClickPath={(f) => `/fichas/${f.id}`}
            filtersConfig={[
                {
                    name: "date",
                    label: "Fecha",
                    type: "date",
                    defaultValue: "",
                },
                {
                    name: "instructor_id",
                    label: "Instructor",
                    type: "select",
                    defaultValue: "",
                    options: instructorsCatalog.options,
                },
                {
                    name: "ficha_id",
                    label: "Ficha",
                    type: "select",
                    defaultValue: "",
                    options: fichasCatalog.options,
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
                    name: "term_id",
                    label: "Trimestre",
                    type: "select",
                    defaultValue: "",
                    options: termsCatalog.options,
                    advanced: true,
                },
            ]}
            tableColumns={[
                { key: "class_date", label: "Fecha" },

                {
                    key: "schedule",
                    label: "Horario",
                    render: (row) => (
                        <span>
                            {row.start_hour?.slice(0, 5)} - {row.end_hour?.slice(0, 5)}
                        </span>
                    ),
                },

                { key: "ficha_number", label: "Ficha" },
                { key: "training_program_name", label: "Programa" },

                {
                    key: "term_name",
                    label: "Trimestre",
                    render: (row) => <span className="badge badge--purple">{row.term_name || "Sin trimestre"}</span>,
                },

                {
                    key: "instructor_name",
                    label: "Instructor",
                    render: (row) => <span>{row.instructor_name || "Sin instructor"}</span>,
                },

                {
                    key: "attendance_ratio",
                    label: "Asistencias",
                    render: (row) => <span className="badge badge--green">{row.attendance_ratio ?? "0/0"}</span>,
                },
            ]}
        />
    );
}
