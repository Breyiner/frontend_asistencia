import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import { can, getCurrentRoleCode } from "../../utils/auth";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

export default function FichasListPage() {
    const roleCode = getCurrentRoleCode();
    const isInstructor = roleCode === "INSTRUCTOR";

    const canCreate = can("fichas.create");

    const filtersConfig = [
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

        ...(!isInstructor
            ? [
                {
                    name: "term_name",
                    label: "Trimestre Actual",
                    placeholder: "Trimestre Actual",
                    defaultValue: "",
                    advanced: true,
                },
                {
                    name: "status_name",
                    label: "Estado",
                    placeholder: "Estado",
                    defaultValue: "",
                    advanced: true,
                },
            ]
            : []),
    ];

    return (
        <DataListLayout
            title="Listado de Fichas"
            endpoint="fichas"
            createPath={canCreate ? "/fichas/create" : null}
            initialFilters={{ per_page: 10 }}
            rowClickPath={(f) => `/fichas/${f.id}`}
            filtersConfig={filtersConfig}
            tableColumns={[
                { key: "ficha_number", label: "Número" },
                { key: "training_program_name", label: "Programa" },
                {
                    key: "shift_name",
                    label: "Jornada",
                    render: (f) => (
                        <BadgesCompact items={[f.shift_name]} maxVisible={1} badgeClassName="badge badge--brown" />
                    ),
                },
                {
                    key: "current_term_name",
                    label: "Trimestre Actual",
                    render: (f) => (
                        <BadgesCompact items={[f.current_term_name]} maxVisible={1} badgeClassName="badge badge--purple" />
                    ),
                },
                { key: "apprentices_count", label: "Aprendices" },
                {
                    key: "status_name",
                    label: "Estado",
                    render: (f) => (
                        <BadgesCompact items={[f.status_name]} maxVisible={1} badgeClassName="badge" />
                    ),
                },
            ]}
        />
    );
}
