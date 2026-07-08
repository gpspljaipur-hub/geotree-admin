import { useMemo, useState, useEffect } from "react";
import {
  Actions,
  Badge,
  DataTable,
  EntityCell,
  Field,
  Modal,
  PageHeader,
  Pagination,
  SearchBar,
  StatusToggle,
  TableCard,
} from "../components/ui";
import { apiService } from "../config/apiService";
import { API_CONFIG } from "../config/endpoints";

export default function StateSelectionPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStates();
  }, [page]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const res = await apiService.getStates({ page, limit: 10 });

      const stateList = res?.data || [];

      if (res?.pagination) {
        setTotalPages(res.pagination.pages || 1);
      }

      const mappedRows = stateList.map((st, index) => ({
        id: st._id || st.id || `StateSelectionPage-${index}`,
        values: [],
        original: st,
      }));
      setRows(mappedRows);
    } catch (err) {
      console.error("Error fetching states:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        (row.original.state_name || "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const openCreate = () => {
    setEditingId(null);
    setFormValues({
      0: "",
      1: "",
      2: "Active",
      3: "",
      4: "",
      5: "Yes",
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormValues({
      0: row.original.state_name || "",
      1: row.original.state_image
        ? `${API_CONFIG.IMAGE_URL}${row.original.state_image}`
        : "",
      2: row.original.status !== false ? "Active" : "Inactive",
      3: row.original.description || "",
      4: row.original.total_count || "",
      5: row.original.popular === true ? "Yes" : "No",
    });
    setModalOpen(true);
  };

  const saveRecord = async () => {
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);
      formData.append("state_name", formValues[0] || "New State");
      formData.append("description", formValues[3] || "");
      formData.append("status", String(formValues[2] === "Active"));
      formData.append("total_count", formValues[4] || "");
      formData.append("popular", String(formValues[5] === "Yes"));

      if (formValues[1] && typeof formValues[1] === "object") {
        formData.append("state_image", formValues[1]);
      }

      if (editingId) {
        await apiService.updateState(formData);
      } else {
        await apiService.addState(formData);
      }

      setModalOpen(false);
      fetchStates(); // Refresh list
    } catch (err) {
      console.error("Error saving state:", err);
      alert("Failed to save state.");
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      try {
        await apiService.deleteState({ id: row.id });
        fetchStates();
      } catch (err) {
        console.error("Error deleting state:", err);
        alert("Failed to delete state.");
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("id", row.id);
      formData.append("status", String(newStatus));
      await apiService.updateState(formData);
      setRows((current) =>
        current.map((r) =>
          r.id === row.id
            ? { ...r, original: { ...r.original, status: newStatus } }
            : r,
        ),
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
      fetchStates();
    }
  };

  const columns = [
    {
      key: "col-0",
      label: "STATE",
      render: (row) => (
        <EntityCell
          title={row.original.state_name || "Unnamed State"}
          subtitle={
            <span className="text-pink text-xs">
              {row.original.description || ""}
            </span>
          }
          image={
            row.original.state_image
              ? `${API_CONFIG.IMAGE_URL}${row.original.state_image}`
              : null
          }
        />
      ),
    },
    {
      key: "col-1",
      label: "STATUS",
      render: (row) => (
        <StatusToggle
          active={row.original.status !== false}
          onChange={(newStatus) => handleStatusChange(row, newStatus)}
        />
      ),
    },
    {
      key: "col-2",
      label: "ACTIONS",
      render: (row) => (
        <Actions
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="State Selection"
        description="Manage states, regions, and plantation availability."
        actionLabel="ADD STATE"
        onAction={openCreate}
      />
      <TableCard>
        <SearchBar
          placeholder="Search States..."
          value={query}
          onChange={setQuery}
        />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">
            Loading states...
          </div>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredRows} />
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </>
        )}
      </TableCard>
      {modalOpen && (
        <Modal
          title={editingId ? "Edit State Selection" : "Register New State"}
          submitLabel={editingId ? "SAVE CHANGES" : "REGISTER STATE"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="State Name"
              required
              placeholder="e.g. Maharashtra"
              value={formValues[0]}
              onChange={(val) => setFormValues((c) => ({ ...c, [0]: val }))}
            />
            <Field
              label="Status"
              type="select"
              options={["Active", "Inactive"]}
              value={formValues[2]}
              onChange={(val) => setFormValues((c) => ({ ...c, [2]: val }))}
            />

            <div className="flex flex-col gap-2 md:col-span-2">
              <Field
                label="State Image Upload (Optional on Edit)"
                type="file"
                full
                onChange={(val) => setFormValues((c) => ({ ...c, [1]: val }))}
              />
              {formValues[1] && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img
                    src={
                      typeof formValues[1] === "string"
                        ? formValues[1]
                        : URL.createObjectURL(formValues[1])
                    }
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-contain p-1 border border-gray-100 shadow-sm bg-white"
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues[1] === "string"
                      ? "Current Image"
                      : "New Image Selected"}
                  </span>
                </div>
              )}
            </div>

            <Field
              label="Description"
              type="textarea"
              placeholder="Enter regional details..."
              full
              value={formValues[3]}
              onChange={(val) => setFormValues((c) => ({ ...c, [3]: val }))}
            />
            <Field
              label="Total Count"
              type="input"
              placeholder="Total number of plantations"
              value={formValues[4]}
              onChange={(val) => setFormValues((c) => ({ ...c, [4]: val }))}
            />

            <Field
              label="Popular"
              type="select"
              options={["Yes", "No"]}
              value={formValues[5]}
              onChange={(val) => setFormValues((c) => ({ ...c, [5]: val }))}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
