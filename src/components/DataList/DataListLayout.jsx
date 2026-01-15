import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import ListFilters from "../ListFilters/ListFilters";
import DataTable from "../DataTable/DataTable";
import Paginator from "../Paginator/Paginator";
import useDataList from "../../hooks/useDataList";
import { RiAddLine } from "@remixicon/react";
import "./DataList.css";

export default function DataListLayout({
  title,
  endpoint,
  createPath,
  filtersConfig,
  tableColumns,
  rowActions,
  initialFilters,
}) {
  const navigate = useNavigate();
  const { data, loading, total, filters, setFilters } = useDataList({
    endpoint,
    initialFilters,
  });

  const handleCreate = () => {
    if (createPath) navigate(createPath);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters({
      page: 1,
      per_page: 10,
      ...newFilters
    });
  };

  const handlePageChange = (page) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      page
    }));
  };

  return (
    <div className="data-list-page">
      <header className="data-list-page__header">
        <h1 className="data-list-page__title">{title}</h1>
        {createPath && (
          <Button variant="primary" onClick={handleCreate}>
            <RiAddLine size={18} />
            Nuevo
          </Button>
        )}
      </header>

      {filtersConfig?.length > 0 && (
        <ListFilters config={filtersConfig} onChange={handleFiltersChange} />
      )}

      <DataTable
        data={data}
        columns={tableColumns}
        loading={loading}
        rowActions={rowActions}
      />

      <Paginator
        page={filters.page}
        total={total}
        perPage={filters.per_page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}