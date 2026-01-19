import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";

export default function FichasListPage() {
    return (
        <DataListLayout
            title="Listado de Fichas"
            endpoint="fichas"
            createPath="/fichas/create"
            initialFilters={{ per_page: 10 }}
            rowClickPath={(f) => `/fichas/${f.id}`}
            filtersConfig={[
                {
                    name: "ficha_number",
                    label: "Número de ficha",
                    placeholder: "Número de ficha",
                    defaultValue: "",
                    withSearchIcon: true,
                },
                {
                    name: "training_program_name",
                    label: "Programa de Formación",
                    placeholder: "Programa de Formación",
                    defaultValue: "",
                },
                {
                    name: "term_name",
                    label: "Trimestre Actual",
                    placeholder: "Trimestre Actual",
                    defaultValue: "",
                    advanced: true
                },
                {
                    name: "status_name",
                    label: "Estado",
                    placeholder: "Estado",
                    defaultValue: "",
                    advanced: true
                },
            ]}
            tableColumns={[
                { key: "ficha_number", label: "Número" },
                { key: "training_program_name", label: "Programa" },
                { 
                    key: "current_term_name",
                    label: "Trimestre Actual",
                    render: (f) => (
                        <span className={'badge badge--purple'}>
                            {f.current_term_name}
                        </span>
                    ),
                },
                { key: "apprentices_count", label: "Aprendices" },
                {
                    key: "status_name",
                    label: "Estado",
                    render: (f) => (
                        <span className={'badge'}>
                            {f.status_name}
                        </span>
                    ),
                },
            ]}
        />
    );
}