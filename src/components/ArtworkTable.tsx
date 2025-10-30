import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import type { PaginatorPageChangeEvent } from "primereact/paginator"; // ✅ type-only import
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { fetchArtworksPage } from "../api";
import type { Artwork } from "../api"; // ✅ type-only import
import "./ArtworkTable.css";


type SelectedMap = Map<number, true>;
const PAGE_SIZE = 12;

const ArtworkTable: React.FC = () => {
  const [rows, setRows] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const selectedIdsRef = useRef<SelectedMap>(new Map());
  const [currentPageSelection, setCurrentPageSelection] = useState<number[]>([]);

  useEffect(() => {
    loadPage(page);
  }, [page]);

  async function loadPage(p: number) {
    setLoading(true);
    try {
    const { data, pagination } = await fetchArtworksPage(p, PAGE_SIZE);
setRows(data);
      setTotalRecords(pagination.total ?? pagination.total_pages * PAGE_SIZE);
     const selectedOnPage = (data as Artwork[])
  .filter((r: Artwork) => selectedIdsRef.current.has(r.id))
  .map((r: Artwork) => r.id);
      setCurrentPageSelection(selectedOnPage);
    } catch (err) {
      console.error("fetch error", err);
      setRows([]);
      setCurrentPageSelection([]);
    } finally {
      setLoading(false);
    }
  }

  const onRowToggle = (rowId: number, checked: boolean) => {
    if (checked) selectedIdsRef.current.set(rowId, true);
    else selectedIdsRef.current.delete(rowId);

    const newSelected = rows
      .filter((r) => selectedIdsRef.current.has(r.id))
      .map((r) => r.id);
    setCurrentPageSelection(newSelected);
  };

  const headerCheckbox = () => {
    const allSelectedOnPage =
      rows.length > 0 && rows.every((r) => selectedIdsRef.current.has(r.id));

    const onToggleAll = (e: any) => {
      const checked = e.checked;
      if (checked) rows.forEach((r) => selectedIdsRef.current.set(r.id, true));
      else rows.forEach((r) => selectedIdsRef.current.delete(r.id));

      const newSelected = rows
        .filter((r) => selectedIdsRef.current.has(r.id))
        .map((r) => r.id);
      setCurrentPageSelection(newSelected);
    };

    return <Checkbox checked={allSelectedOnPage} onChange={onToggleAll} />;
  };

  const selectionBodyTemplate = (rowData: Artwork) => {
    const checked = selectedIdsRef.current.has(rowData.id);
    const onChange = (e: any) => onRowToggle(rowData.id, e.checked);
    return <Checkbox checked={checked} onChange={onChange} />;
  };

  const SelectionPanel = () => {
    const selectedIdsArray = Array.from(selectedIdsRef.current.keys());
    const clearSelected = () => {
      selectedIdsRef.current.clear();
      setCurrentPageSelection([]);
    };
    const deselectId = (id: number) => {
      selectedIdsRef.current.delete(id);
      setCurrentPageSelection((prev) => prev.filter((x) => x !== id));
    };

    return (
      <div className="selection-panel p-shadow-2">
        <div className="p-d-flex p-jc-between p-ai-center">
          <div>
            <strong>Selected:</strong> {selectedIdsArray.length}
          </div>
          <Button
            label="Clear All"
            onClick={clearSelected}
            className="p-button-text p-button-sm"
          />
        </div>
        <div style={{ marginTop: 8 }}>
          {selectedIdsArray.length === 0 ? (
            <small>No selections yet.</small>
          ) : (
            selectedIdsArray.map((id) => (
              <div
                key={id}
                className="p-d-flex p-ai-center p-jc-between selection-item"
              >
                <span>#{id}</span>
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-text p-button-sm"
                  onClick={() => deselectId(id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    setPage(e.page + 1);
  };

  const dateRangeTemplate = (row: Artwork) => {
    if (!row.date_start && !row.date_end) return "";
    if (row.date_start === row.date_end) return `${row.date_start}`;
    return `${row.date_start ?? ""} — ${row.date_end ?? ""}`;
  };

  return (
    <div>
      <SelectionPanel />
      <DataTable value={rows} loading={loading} responsiveLayout="scroll">
        <Column header={headerCheckbox} body={selectionBodyTemplate} />
        <Column field="id" header="ID" sortable />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column header="Date Range" body={(row) => dateRangeTemplate(row as Artwork)} />
      </DataTable>

      <Paginator
        first={(page - 1) * PAGE_SIZE}
        rows={PAGE_SIZE}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ArtworkTable;
