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
import Icon from "../components/Icon";
import { apiService } from "../config/apiService";
import { API_CONFIG } from "../config/endpoints";

export default function OccasionsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});

  const [configureOpen, setConfigureOpen] = useState(false);
  const [configuringRow, setConfiguringRow] = useState(null);
  const [formFields, setFormFields] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getOccasions({ page, limit: 10 });
      const dataList =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      if (res?.pagination) setTotalPages(res.pagination.pages || 1);

      const mappedRows = dataList.map((st, index) => ({
        id: st._id || st.id || `OccasionsPage-${index}`,
        values: [st.name || "Unnamed"],
        original: st,
      }));
      setRows(mappedRows);
    } catch (err) {
      console.error("Error fetching occasions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        (row.original.name || "").toLowerCase().includes(query.toLowerCase()),
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
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    const st = row.original;
    setFormValues({
      0: st.name || "",
      1: st.occasion_image ? `${API_CONFIG.IMAGE_URL}${st.occasion_image}` : "",
      2: st.status !== false ? "Active" : "Inactive",
      3: st.description || "",
    });
    setModalOpen(true);
  };

  const saveRecord = async () => {
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);

      formData.append("name", formValues[0] || "New Occasion");
      formData.append("status", String(formValues[2] === "Active"));
      formData.append("description", formValues[3] || "");

      if (formValues[1] && typeof formValues[1] === "object") {
        formData.append("image", formValues[1]);
      }

      if (editingId) {
        await apiService.updateOccasion(formData);
      } else {
        await apiService.addOccasion(formData);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving occasion:", err);
      alert("Failed to save occasion.");
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this occasion?")) {
      try {
        await apiService.deleteOccasion({ id: row.id });
        fetchData();
      } catch (err) {
        console.error("Error deleting occasion:", err);
        alert("Failed to delete occasion.");
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("id", row.id);
      formData.append("status", String(newStatus));
      await apiService.updateOccasion(formData);
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

  const openConfigure = (row) => {
    setConfiguringRow(row);
    setFormFields(row.original.form_fields || []);
    setConfigureOpen(true);
  };

  const updateField = (index, key, value) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFormFields(newFields);
  };

  const removeField = (index) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  const addField = () => {
    setFormFields([
      ...formFields,
      {
        label: "",
        type: "Text Input",
        required: false,
        key: "name",
        options: "",
      },
    ]);
  };

  const saveConfiguration = async () => {
    try {
      const formattedFields = formFields.map((field) => ({
        label: field.label.trim(),

        field_type:
          field.type === "Dropdown"
            ? "dropdown"
            : field.type.toLowerCase().replace(/\s+/g, "_"),

        is_required: field.required,

        key: "name",

        options:
          field.type === "Dropdown"
            ? (field.options || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
      }));
      const formData = new FormData();
      formData.append("id", configuringRow.id);
      formData.append("form_fields", JSON.stringify(formattedFields));
      await apiService.updateOccasion(formData);
      await apiService.generateForm(); // Regenerate form endpoint to handle form field updates and data consistency

      setRows((current) =>
        current.map((r) =>
          r.id === configuringRow.id
            ? {
                ...r,
                original: {
                  ...r.original,
                  form_fields: formattedFields,
                },
              }
            : r,
        ),
      );
      setConfigureOpen(false);
    } catch (err) {
      console.error("Error saving configuration:", err);
      alert("Failed to save configuration.");
    }
  };
  // const saveConfiguration = async () => {
  //   try {
  //     const formattedFields = formFields.map((field) => ({
  //       ...field,
  //       key: "name",
  //     }));

  //     const formData = new FormData();
  //     formData.append("id", configuringRow.id);
  //     formData.append("form_fields", JSON.stringify(formattedFields));

  //     await apiService.updateOccasion(formData);
  //     await apiService.generateForm();

  //     setRows((current) =>
  //       current.map((r) =>
  //         r.id === configuringRow.id
  //           ? {
  //               ...r,
  //               original: {
  //                 ...r.original,
  //                 form_fields: formattedFields,
  //               },
  //             }
  //           : r,
  //       ),
  //     );

  //     setConfigureOpen(false);
  //   } catch (err) {
  //     console.error("Error saving configuration:", err);
  //     alert("Failed to save configuration.");
  //   }
  // };

  const columns = [
    {
      key: "col-0",
      label: "OCCASION DETAILS",
      render: (row) => (
        <EntityCell
          title={row.original.name || "Unnamed"}
          subtitle={row.original.description || ""}
          image={
            row.original.occasion_image
              ? `${API_CONFIG.IMAGE_URL}${row.original.occasion_image}`
              : null
          }
        />
      ),
    },
    {
      key: "col-1",
      label: "BOOKING FORM",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md tracking-wider">
            {row.original.form_fields?.length || 0} FIELDS
          </span>
          <button
            className="text-[10px] font-black text-pink tracking-widest uppercase hover:text-[#d01568] transition-colors bg-transparent border-0 cursor-pointer"
            onClick={() => openConfigure(row)}
          >
            CONFIGURE
          </button>
        </div>
      ),
    },
    {
      key: "col-2",
      label: "STATUS",
      render: (row) => (
        <StatusToggle
          active={row.original.status !== false}
          onChange={(newStatus) => handleStatusChange(row, newStatus)}
        />
      ),
    },
    {
      key: "col-3",
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
        title="Occasions"
        description="Configure special moments for meaningful tree plantations."
        actionLabel="ADD OCCASION"
        onAction={openCreate}
      />
      <TableCard>
        <SearchBar
          placeholder="Search Occasions..."
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
          title={editingId ? "Edit Occasion" : "Register New Occasion"}
          submitLabel={editingId ? "SAVE CHANGES" : "REGISTER OCCASION"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Occasion Name"
              required
              placeholder="e.g. Birthday, Anniversary"
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
                label="Display Image Upload (Optional on Edit)"
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
              placeholder="Enter occasion details..."
              full
              value={formValues[3]}
              onChange={(val) => setFormValues((c) => ({ ...c, [3]: val }))}
            />
          </div>
        </Modal>
      )}

      {configureOpen && configuringRow && (
        <div
          className="fixed inset-0 z-[60] p-4 md:p-8 grid place-items-center bg-slate-900/60 backdrop-blur-md overflow-y-auto"
          role="presentation"
          onMouseDown={() => setConfigureOpen(false)}
        >
          <section
            className="relative w-full max-w-[800px] bg-white rounded-[24px] shadow-2xl flex flex-col max-h-full"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="m-0 text-[20px] font-black text-gray-900 tracking-tight">
                Configure Form: {configuringRow.original.name || "Achievement"}
              </h3>
              <button
                className="p-2 border-0 bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                onClick={() => setConfigureOpen(false)}
                type="button"
              >
                <Icon name="x" size={24} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4">
              {formFields.map((field, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#f9fafb] border border-gray-100 rounded-[20px]"
                >
                  {/* Top Row */}
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Number */}
                    <div className="flex-shrink-0 w-[42px] h-[42px] rounded-full border-2 border-gray-200 flex items-center justify-center text-[14px] font-black text-gray-400 bg-white">
                      {index + 1}
                    </div>

                    {/* Label + Type */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      {/* FIELD LABEL */}
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          FIELD LABEL
                        </span>

                        <input
                          type="text"
                          className="h-[46px] px-4 bg-white border border-gray-200 rounded-[12px] text-[14px] font-bold text-gray-800 outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all"
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, "label", e.target.value)
                          }
                          placeholder="e.g. Your Name"
                        />
                      </label>

                      {/* TYPE */}
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          TYPE
                        </span>

                        <div className="relative">
                          <select
                            className="w-full h-[46px] px-4 pr-10 bg-white border border-gray-200 rounded-[12px] text-[14px] font-bold text-gray-800 outline-none focus:border-pink focus:ring-4 focus:ring-pink/20 transition-all appearance-none cursor-pointer"
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, "type", e.target.value)
                            }
                          >
                            <option value="Text Input">Text Input</option>
                            <option value="Number">Number</option>
                            <option value="Date">Date</option>
                            <option value="Email">Email</option>
                            <option value="Textarea">Textarea</option>
                            <option value="Dropdown">Dropdown</option>
                          </select>

                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Icon name="chevron-down" size={16} />
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Required + Delete */}
                    <div className="flex items-center gap-6 h-[46px]">
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                        <div
                          className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                            field.required ? "bg-indigo-500" : "bg-gray-200"
                          }`}
                          onClick={() =>
                            updateField(index, "required", !field.required)
                          }
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                              field.required ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>

                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          REQUIRED
                        </span>
                      </label>

                      <button
                        className="w-11 h-11 rounded-[12px] border border-gray-200 bg-white text-gray-500 flex items-center justify-center hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer shadow-sm"
                        type="button"
                        onClick={() => removeField(index)}
                      >
                        <Icon name="trash" size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {field.type === "Dropdown" && (
                    <div className="mt-6">
                      <label className="flex flex-col gap-2">
                        <span className="text-[12px] font-black uppercase tracking-widest text-pink-500">
                          Dropdown Options (Comma Separated)
                        </span>

                        <input
                          type="text"
                          value={field.options || ""}
                          onChange={(e) =>
                            updateField(index, "options", e.target.value)
                          }
                          placeholder="test1, test2, test3"
                          className="h-[46px] px-4 bg-white border border-pink-200 rounded-[12px] text-[14px] font-bold text-gray-800 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-gray-100 bg-white">
              <button
                className="inline-flex items-center justify-center gap-2 h-[46px] px-6 border-[1.5px] border-dashed border-gray-300 rounded-[12px] bg-white text-[11px] font-bold tracking-widest uppercase text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer w-full sm:w-auto"
                type="button"
                onClick={addField}
              >
                <Icon name="plus" size={16} /> ADD NEW FIELD
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  className="h-[46px] px-8 border border-gray-200 rounded-[12px] bg-white text-[11px] font-bold tracking-widest uppercase text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto"
                  type="button"
                  onClick={() => setConfigureOpen(false)}
                >
                  CANCEL
                </button>
                <button
                  className="h-[46px] px-8 border-0 rounded-[12px] bg-[#224ab4] text-[11px] font-bold tracking-widest uppercase text-white hover:bg-indigo transition-colors cursor-pointer w-full sm:w-auto shadow-md shadow-blue/20"
                  type="button"
                  onClick={saveConfiguration}
                >
                  SAVE CONFIGURATION
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
