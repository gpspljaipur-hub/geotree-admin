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

export default function EmissionFactorsPage() {
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
      const res = await apiService.getEmissionFactors({ page, limit: 10 });
      const dataList =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      if (res?.pagination) setTotalPages(res.pagination.pages || 1);

      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `EmissionFactorsPage-${index}`,
        values: [
          st.sub_category || st.factor_name || st.name || "Unnamed",
          st.category || "—",
          st.unit || "—",
          st.factor !== undefined ? st.factor : (st.value ?? "—"),
          st.status,
        ],
        original: st,
      }));
      setRows(mappedRows);
    } catch (err) {
      console.error("Error fetching emission factors:", err);
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
    setFormValues({
      0: "", // Name
      1: "Transport", // Category
      2: "", // Image
      3: "", // Unit
      4: "", // Factor Value
      5: "Active", // Status
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    const st = row.original;
    setFormValues({
      0: st.sub_category || "",
      1: st.category || "Transport",
      2: st.image ? `${API_CONFIG.IMAGE_URL}${st.image}` : "",
      3: st.unit || "",
      4:
        st.factor !== undefined
          ? String(st.factor)
          : st.value !== undefined
            ? String(st.value)
            : "",
      5: st.status !== false ? "Active" : "Inactive",
    });
    setModalOpen(true);
  };

  const saveRecord = async () => {
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);

      formData.append("sub_category", formValues[0]);
      formData.append("category", formValues[1]?.toLowerCase());
      formData.append("unit", formValues[3]);
      formData.append("factor", formValues[4] || "0");
      formData.append("status", String(formValues[5] === "Active"));

      if (formValues[2] && typeof formValues[2] === "object") {
        formData.append("image", formValues[2]);
      }

      if (editingId) {
        await apiService.updateEmissionFactor(formData);
      } else {
        await apiService.addEmissionFactor(formData);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving emission factor:", err);
      alert("Failed to save emission factor.");
    }
  };

  const handleDelete = async (row) => {
    if (
      window.confirm("Are you sure you want to delete this emission factor?")
    ) {
      try {
        await apiService.deleteEmissionFactor({ id: row.id });
        fetchData();
      } catch (err) {
        console.error("Error deleting emission factor:", err);
        alert("Failed to delete emission factor.");
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("id", row.id);
      formData.append("status", String(newStatus));
      await apiService.updateEmissionFactor(formData);
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
      label: "FACTOR",
      render: (row) => {
        const name = row.values[0] || "Unknown";
        const initials = name
          .split(/[\s-]+/)
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-4 py-1">
            {row.original.image ? (
              <img
                src={`${API_CONFIG.IMAGE_URL}${row.original.image}`}
                alt={name}
                className="w-[36px] h-[36px] rounded-lg object-cover bg-white border border-pink-100 p-0.5 shadow-sm"
              />
            ) : (
              <div className="w-[36px] h-[36px] rounded-lg bg-[#fff0f7] text-[#df3b91] flex items-center justify-center text-[11px] font-[850] tracking-wider">
                {initials}
              </div>
            )}
            <strong className="text-[13px] font-[850] text-gray-900 tracking-tight">
              {name}
            </strong>
          </div>
        );
      },
    },
    {
      key: "col-1",
      label: "CATEGORY",
      render: (row) => <Badge>{row.values[1]}</Badge>,
    },
    {
      key: "col-2",
      label: "UNIT",
      render: (row) => (
        <span className="text-[12px] text-gray-500 font-semibold">
          {row.values[2]}
        </span>
      ),
    },
    {
      key: "col-3",
      label: "FACTOR VALUE",
      render: (row) => (
        <div className="flex items-baseline gap-1.5">
          <strong className="text-[#df3b91] font-black text-[13px]">
            {row.values[3]}
          </strong>
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
            {row.values[2]}
          </span>
        </div>
      ),
    },
    {
      key: "col-4",
      label: "STATUS",
      render: (row) => (
        <StatusToggle
          active={row.original.status !== false}
          tone="pink"
          onChange={(newStatus) => handleStatusChange(row, newStatus)}
        />
      ),
    },
    {
      key: "col-5",
      label: "ACTIONS",
      align: "right",
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
        title="Emission Factors"
        description="Manage and update carbon emission factors and metrics."
        actionLabel="ADD EMISSION FACTOR"
        onAction={openCreate}
      />
      <TableCard>
        <SearchBar
          placeholder="Search factors..."
          value={query}
          onChange={setQuery}
          showButton={true}
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
          title={
            editingId ? "Edit Emission Factor" : "Register New Emission Factor"
          }
          submitLabel={editingId ? "SAVE CHANGES" : "REGISTER EMISSION FACTOR"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Factor Name"
              required
              value={formValues[0]}
              onChange={(val) => setFormValues((c) => ({ ...c, [0]: val }))}
            />
            <Field
              label="Category"
              type="select"
              options={[
                "Transport",
                "Energy",
                "Food",
                "Waste",
                "Manufacturing",
                "Agriculture",
              ]}
              value={formValues[1]}
              onChange={(val) => setFormValues((c) => ({ ...c, [1]: val }))}
            />

            <div className="md:col-span-2 flex flex-col gap-2">
              <Field
                label="Display Image"
                type="file"
                full
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
                    className="w-10 h-10 rounded-lg object-cover p-0 border border-gray-100 shadow-sm bg-white"
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
              label="Unit"
              required
              placeholder="e.g. kg/km, kg/kWh"
              value={formValues[3]}
              onChange={(val) => setFormValues((c) => ({ ...c, [3]: val }))}
            />
            <Field
              label="Factor Value"
              required
              type="number"
              placeholder="e.g. 0.21"
              value={formValues[4]}
              onChange={(val) => setFormValues((c) => ({ ...c, [4]: val }))}
            />
            <Field
              label="Status"
              type="select"
              options={["Active", "Inactive"]}
              value={formValues[5]}
              onChange={(val) => setFormValues((c) => ({ ...c, [5]: val }))}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
