import { useMemo, useState, useEffect } from "react";
import {
  Actions,
  Badge,
  DataTable,
  EntityCell,
  Field,
  Modal,
  PageHeader,
  SearchBar,
  StatusToggle,
  TableCard,
  Pagination,
} from "../components/ui";
import { apiService } from "../config/apiService";
import { API_CONFIG } from "../config/endpoints";

export default function CategoriesPage() {
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
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCategories({ page, limit: 10 });
      const dataList =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      if (res?.pagination) setTotalPages(res.pagination.pages || 1);

      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `CategoriesPage-${index}`,
        values: [st.name || "Unnamed", st.type || "", st.description || ""],
        original: st,
      }));
      setRows(mappedRows);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        row.values.join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const openCreate = () => {
    setEditingId(null);
    setFormValues({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormValues({
      // 0: row.original.name || '',
      1: row.original.type || "",
      2: row.original.category_image
        ? `${API_CONFIG.IMAGE_URL}${row.original.category_image}`
        : "",
      3: row.original.status !== false ? "Active" : "Inactive",
      4: row.original.description || "",
    });
    setModalOpen(true);
  };

  const saveRecord = async () => {
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);
      // formData.append('name', formValues[0] || 'New Category')
      formData.append("type", formValues[1] || "");
      formData.append("description", formValues[4] || "");

      if (formValues[2] && typeof formValues[2] === "object") {
        formData.append("category_image", formValues[2]);
      }
      formData.append("status", String(formValues[3] === "Active"));

      if (editingId) {
        await apiService.updateCategory(formData);
      } else {
        await apiService.addCategory(formData);
      }

      setModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await apiService.deleteCategory({ id: row.id });
        fetchData();
      } catch (err) {
        console.error("Error deleting category:", err);
        alert("Failed to delete category.");
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("id", row.id);
      formData.append("status", String(newStatus));
      await apiService.updateCategory(formData);
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
      fetchData();
    }
  };

  const columns = [
    {
      key: "col-0",
      label: "CATEGORY",
      render: (row) => (
        <EntityCell
          // title={row.original.name || 'Unnamed'}
          subtitle={
            <span className="text-pink">{row.original.type || ""}</span>
          }
          image={
            row.original.category_image
              ? `${API_CONFIG.IMAGE_URL}${row.original.category_image}`
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
        title="Categories"
        description="Organize trees and initiatives into reusable categories."
        actionLabel="ADD CATEGORY"
        onAction={openCreate}
      />
      <TableCard>
        <SearchBar
          placeholder="Search Categories..."
          value={query}
          onChange={setQuery}
        />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">
            Loading...
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
          title={editingId ? "Edit Categorie" : "Register New Category"}
          submitLabel={editingId ? "SAVE CHANGES" : "REGISTER CATEGORY"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <Field label="Category Name" required placeholder="e.g. Ornamental" value={formValues[0]} onChange={(val) => setFormValues(c => ({...c, [0]: val}))} /> */}
            <Field
              label="Category Type"
              required
              type="select"
              options={["Carbon", "Occasion", "Plantation"]}
              value={formValues[1]}
              onChange={(val) => setFormValues((c) => ({ ...c, [1]: val }))}
            />
            <div className="flex flex-col gap-2 md:col-span-2">
              <Field
                label="Category Image Upload (Optional on Edit)"
                type="file"
                full
                value={formValues[2]}
                onChange={(val) => setFormValues((c) => ({ ...c, [2]: val }))}
              />
              {formValues[2] && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img
                    src={
                      typeof formValues[2] === "string"
                        ? formValues[2]
                        : URL.createObjectURL(formValues[2])
                    }
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-contain p-1 border border-gray-100 shadow-sm bg-white"
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues[2] === "string"
                      ? "Current Image"
                      : "New Image Selected"}
                  </span>
                </div>
              )}
            </div>
            <Field
              label="Status"
              type="select"
              options={["Active", "Inactive"]}
              value={formValues[3]}
              onChange={(val) => setFormValues((c) => ({ ...c, [3]: val }))}
            />
            <Field
              label="Description"
              type="textarea"
              placeholder="Brief description..."
              full
              value={formValues[4]}
              onChange={(val) => setFormValues((c) => ({ ...c, [4]: val }))}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
