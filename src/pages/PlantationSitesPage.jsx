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

import {
  MapContainer,
  TileLayer,
  Polygon,
  useMapEvents,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";

import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

export default function PlantationSitesPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [polygonArea, setPolygonArea] = useState("");
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([]);
  // function GeomanControls({ setPolygonCoordinates }) {
  //   const map = useMap();

  //   useEffect(() => {
  //     map.pm.addControls({
  //       position: "topleft",
  //       drawPolygon: true,
  //       drawRectangle: true,
  //       drawCircle: false,
  //       drawMarker: false,
  //       drawPolyline: false,
  //       editMode: true,
  //       dragMode: true,
  //       removalMode: true,
  //     });

  //     map.on("pm:create", (e) => {
  //       const layer = e.layer;

  //       if (layer.getLatLngs) {
  //         const coords = layer.getLatLngs()[0].map((point) => ({
  //           lat: point.lat,
  //           lng: point.lng,
  //         }));

  //         setPolygonCoordinates(coords);
  //       }
  //     });

  //     return () => {
  //       map.pm.removeControls();
  //     };
  //   }, [map]);

  //   return null;
  // }

  function GeomanControls({ setPolygonCoordinates }) {
    const map = useMap();

    useEffect(() => {
      map.pm.addControls({
        position: "topleft",
        drawPolygon: true,
        drawRectangle: true,
        drawCircle: false,
        drawMarker: false,
        drawPolyline: false,
        editMode: true,
        dragMode: true,
        removalMode: true,
      });

      const updateCoordinates = (layer) => {
        if (!layer?.getLatLngs) return;

        const coords = layer.getLatLngs()[0].map((point) => ({
          lat: point.lat,
          lng: point.lng,
        }));

        setPolygonCoordinates(coords);
      };

      // New polygon
      map.on("pm:create", (e) => {
        updateCoordinates(e.layer);
      });

      // Existing polygon edited
      map.on("pm:edit", (e) => {
        updateCoordinates(e.layer);
      });

      // Existing polygon dragged
      map.on("pm:dragend", (e) => {
        updateCoordinates(e.layer);
      });

      return () => {
        map.off("pm:create");
        map.off("pm:edit");
        map.off("pm:dragend");
        map.pm.removeControls();
      };
    }, [map]);

    return null;
  }

  function PolygonDrawer({ polygonCoordinates, setPolygonCoordinates }) {
    useMapEvents({
      click(e) {
        setPolygonCoordinates((prev) => [
          ...prev,
          {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          },
        ]);
      },
    });

    return null;
  }

  function ChangeMapView({ center }) {
    const map = useMap();

    useEffect(() => {
      map.flyTo(center, 13, {
        duration: 1.5,
      });
    }, [center, map]);

    return null;
  }
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setMapCenter([latitude, longitude]);
      },
      (error) => {
        console.error("Location error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  useEffect(() => {
    if (polygonCoordinates.length < 3) return;

    const geoCoords = polygonCoordinates.map((p) => [p.lng, p.lat]);
    geoCoords.push(geoCoords[0]);

    const polygon = turf.polygon([geoCoords]);

    const areaSqMeters = turf.area(polygon);
    const areaHa = areaSqMeters / 10000;

    setPolygonArea(areaHa.toFixed(2));

    setFormValues((prev) => ({
      ...prev,
      8: areaHa.toFixed(2),
    }));
  }, [polygonCoordinates]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    map.pm.addControls({
      position: "topleft",
      drawPolygon: true,
      drawRectangle: true,
      drawCircle: false,
      drawMarker: false,
      drawPolyline: false,
      editMode: true,
      dragMode: true,
      removalMode: true,
    });
  }, []);

  const polygonString = polygonCoordinates
    .map((point) => `${point.lat}, ${point.lng}`)
    .join(" | ");

  useEffect(() => {
    fetchSites();
    fetchStates();
    fetchSpecies();
  }, [page]);

  const getCoordinates = async (locationName) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName,
        )}&countrycodes=in&limit=1`,
      );

      const data = await res.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const fetchSpecies = async () => {
    try {
      const res = await apiService.getSpecies({ page: 1, limit: 1000 });
      const data =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      const formatted = data.map((s) => ({
        label: s.name || s.species_name || String(s),
        value: s._id || s.id || String(s),
      }));
      setSpeciesList(formatted);
    } catch (err) {
      console.error("Error fetching species:", err);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await apiService.getStates({ page: 1, limit: 1000 });
      const data = res?.data || [];
      const formatted = data.map((s) =>
        typeof s === "string"
          ? { label: s, value: s }
          : {
              label: s.state_name || s.name || String(s),
              value: s._id || s.id || String(s),
              state_name: s.state_name,
              lat: s.lat,
              lng: s.lng,
            },
      );
      setStatesList(formatted);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDistricts = async (state_name) => {
    console.log("Fetching districts for state:", state_name);
    try {
      const res = await apiService.getDistrictsLocation({
        state: state_name,
      });

      const data = res?.data || [];

      const formatted = data.map((d) => ({
        label: d.district_name,
        value: d._id,
        lat: d.lat,
        lng: d.lng,
      }));

      setDistrictsList(formatted);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };
  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPlantationSites({ page, limit: 10 });

      const siteList =
        res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
      if (res?.pagination) setTotalPages(res.pagination.pages || 1);

      const mappedRows = siteList.map((st, index) => {
        const district = st.district || "";
        const stateName = st.state_id?.state_name || st.state || "";
        const locationText = [district, stateName ? `(${stateName})` : null]
          .filter(Boolean)
          .join(" ");

        return {
          id: st.id || st._id || `PlantationSitesPage-${index}`,
          values: [
            st.site_name || "Unnamed Site",
            locationText,
            st.plantation_type || "Miyawaki",
            `${st.area || st.area_in_ha || "0"}`,
          ],
          original: st,
        };
      });
      setRows(mappedRows);
    } catch (err) {
      console.error("Error fetching plantation sites:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        (row.original.site_name || "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  const openCreate = () => {
    setEditingId(null);

    setPolygonCoordinates([]);
    setPolygonArea("");
    setFormValues({
      0: "",
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "Miyawaki",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "Active",
      12: "",
      13: "",
      14: "",
      15: "",
      16: "",
      17: "",
      18: "",
      19: "",
      20: "",
      21: "No",
      22: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);

    setFormValues({
      0: row.original.site_name || "",

      1:
        row.original.state_id?._id ||
        row.original.state_id?.id ||
        row.original.state_id ||
        "",

      2: row.original.district || "",

      3: row.original.block || "",

      4: row.original.gram_panchayat || "",

      5: row.original.village || "",

      6: row.original.plantation_type || "Miyawaki",

      7: row.original.capacity || "",

      8: row.original.area || "",

      9: row.original.site_image
        ? `${API_CONFIG.IMAGE_URL}${row.original.site_image}`
        : "",

      10: row.original.description || "",

      11: row.original.status ? "Active" : "Inactive",

      12: row.original.planted_count ?? "",

      13: row.original.remaining_trees ?? "",

      // FIX NATIVE SPECIES
      14: row.original.native_species?.map((item) => item._id) || [],

      15: row.original.project_partner_name || "",

      // FIX DATE
      17: row.original.project_start_date
        ? row.original.project_start_date.split("T")[0]
        : "",

      18: row.original.soil_type || "",

      19: row.original.rain_fall || "",

      20: row.original.maintenance || "",

      21: row.original.is_popular || "No",

      22: row.original.survival_rate || "",
    });

    setModalOpen(true);
  };

  const handlePolygonCreated = (e) => {
    const layer = e.layer;

    const coords = layer.getLatLngs()[0];

    const geoCoords = coords.map((p) => [p.lng, p.lat]);

    geoCoords.push(geoCoords[0]);

    const polygon = turf.polygon([geoCoords]);

    const areaSqMeters = turf.area(polygon);

    const areaHa = areaSqMeters / 10000;

    setPolygonArea(areaHa.toFixed(2));

    setPolygonCoordinates(
      coords.map((p) => ({
        lat: p.lat,
        lng: p.lng,
      })),
    );

    setFormValues((prev) => ({
      ...prev,
      8: areaHa.toFixed(2),
    }));
  };

  const saveRecord = async () => {
    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);
      formData.append("site_name", formValues[0] || "Unnamed Site");
      formData.append("state_id", formValues[1] || "");
      formData.append("district", formValues[2] || "");
      formData.append("block", formValues[3] || "");
      formData.append("gram_panchayat", formValues[4] || "");
      formData.append("village", formValues[5] || "");
      formData.append("plantation_type", formValues[6] || "Miyawaki");
      formData.append("capacity", formValues[7] || "0");
      formData.append("polygon", polygonString);
      formData.append("area_in_ha", formValues[8] || "0");
      formData.append("planted_count", formValues[12] || "0");
      formData.append("remaining_trees", formValues[13] || "0");
      formData.append("survival_rate", formValues[22] || "0");
      formData.append("project_start_date", formValues[17] || "");
      formData.append("project_partner_name", formValues[15] || "");
      formData.append("soil_type", formValues[18] || "");
      formData.append("native_species", formValues[14] || "");
      formData.append("rain_fall", formValues[19] || "");
      formData.append("maintenance", formValues[20] || "");
      formData.append("is_popular", formValues[21] || "");
      // if (formValues[14]) {
      //   formData.append("native_species", JSON.stringify([formValues[14]]));
      // }
      formData.append("description", formValues[10] || "");
      formData.append("status", String(formValues[11] === "Active"));

      if (formValues[9] && typeof formValues[9] === "object") {
        formData.append("site_image", formValues[9]);
      }

      if (editingId) {
        await apiService.updatePlantationSite(formData);
      } else {
        await apiService.addPlantationSite(formData);
      }

      setModalOpen(false);
      fetchSites();
    } catch (err) {
      console.error("Error saving plantation site:", err);
      alert("Failed to save plantation site.");
    }
  };

  const handleDelete = async (row) => {
    if (
      window.confirm("Are you sure you want to delete this plantation site?")
    ) {
      try {
        await apiService.deletePlantationSite({ id: row.id });
        fetchSites();
      } catch (err) {
        console.error("Error deleting plantation site:", err);
      }
    }
  };

  const handleStatusChange = async (row, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("id", row.id);
      formData.append("status", String(newStatus));
      await apiService.updatePlantationSite(formData);
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
      fetchSites();
    }
  };

  const columns = [
    {
      key: "col-0",
      label: "Site Details",
      render: (row) => {
        const district = row.original.district || "";
        const stateName =
          row.original.state_id?.state_name || row.original.state || "";
        const locationText = [district, stateName ? `(${stateName})` : null]
          .filter(Boolean)
          .join(" ");
        return (
          <EntityCell
            title={row.original.site_name || "Unnamed Site"}
            subtitle={locationText ? ` ${locationText}` : ""}
            image={
              row.original.site_image
                ? `${API_CONFIG.IMAGE_URL}${row.original.site_image}`
                : null
            }
          />
        );
      },
    },
    {
      key: "col-1",
      label: "Plantation",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-gray-800">
            {row.original.plantation_type || "Miyawaki"}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            <span className="text-pink">📣</span>{" "}
            {row.original.planted_count || 0} / {row.original.capacity || 0}{" "}
            Trees
          </span>
        </div>
      ),
    },
    {
      key: "col-2",
      label: "Land Info",
      render: (row) => (
        <div className="flex items-start gap-2.5">
          <span className="text-[#2a54b3] pt-[3px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 14 12 19 21 14 12 9" />
              <path d="M12 9V3" />
              <path d="M12 3l4 3-4 3" />
            </svg>
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-[#2a54b3]">
              {row.original.area || row.original.area_in_ha || "—"}
            </span>
            <span className="text-[12px] font-semibold text-gray-400">
              {row.original.lat && row.original.lng
                ? `${row.original.lat}, ${row.original.lng}...`
                : "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "col-3",
      label: "Status",
      render: (row) => (
        <StatusToggle
          active={row.original.status !== false}
          onChange={(newStatus) => handleStatusChange(row, newStatus)}
        />
      ),
    },
    {
      key: "col-4",
      label: "Actions",
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
        title="Plantation Sites"
        description="Detailed management of plantation areas and tree counts"
        actionLabel="ADD PLANTATION SITE"
        onAction={openCreate}
      />
      <TableCard>
        <SearchBar
          placeholder="Search Plantation Sites..."
          value={query}
          onChange={setQuery}
        />
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-semibold">
            Loading sites...
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
            editingId ? "Edit Plantation Site" : "Register New Plantation Site"
          }
          submitLabel={editingId ? "SAVE CHANGES" : "REGISTER PLANTATION SITE"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveRecord}
          wide={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Site Name"
              required
              placeholder="e.g. Green Valley Site A"
              value={formValues[0]}
              onChange={(val) => setFormValues((c) => ({ ...c, [0]: val }))}
            />
            <Field
              label="State"
              required
              type="select"
              options={
                statesList.length > 0
                  ? statesList
                  : [{ label: "Loading...", value: "" }]
              }
              value={formValues[1]}
              onChange={async (val) => {
                const selectedState = statesList.find(
                  (item) => item.value === val,
                );

                setFormValues((c) => ({
                  ...c,
                  1: val,
                  2: "",
                }));

                fetchDistricts(selectedState?.state_name);

                const coords = await getCoordinates(selectedState?.state_name);

                if (coords) {
                  setMapCenter([coords.lat, coords.lng]);
                }
              }}
            />
            <Field
              label="District"
              required
              type="select"
              options={
                districtsList.length > 0
                  ? districtsList
                  : [{ label: "Select State First", value: "" }]
              }
              value={formValues[2]}
              onChange={async (val) => {
                const selectedDistrict = districtsList.find(
                  (item) => item.value === val,
                );

                setFormValues((c) => ({
                  ...c,
                  2: val,
                }));

                const coords = await getCoordinates(
                  `${selectedDistrict.label}, India`,
                );

                if (coords) {
                  setMapCenter([coords.lat, coords.lng]);
                }
              }}
            />
            <Field
              label="Block"
              placeholder="e.g. Mulshi"
              value={formValues[3]}
              onChange={(val) => setFormValues((c) => ({ ...c, [3]: val }))}
            />
            <Field
              label="Gram Panchayat"
              placeholder="e.g. Hinjavadi"
              value={formValues[4]}
              onChange={(val) => setFormValues((c) => ({ ...c, [4]: val }))}
            />
            <Field
              label="Village"
              placeholder="e.g. Hinjavadi Site 1"
              value={formValues[5]}
              onChange={(val) => setFormValues((c) => ({ ...c, [5]: val }))}
            />
            {/* <Field
              label="Plantation Type"
              type="select"
              options={["Miyawaki", "Block Plantation", "Agroforestry"]}
              value={formValues[6]}
              onChange={(val) => setFormValues((c) => ({ ...c, [6]: val }))}
            /> */}

            <Field
              label="Plantation Type"
              type="select"
              options={["Miyawaki", "Block Plantation", "Agroforestry"]}
              value={formValues[6]}
              onChange={(val) => setFormValues((c) => ({ ...c, [6]: val }))}
            />
            <Field
              label="Project start date"
              type="date"
              placeholder="e.g. 07/16/2026"
              value={formValues[17]}
              onChange={(val) => setFormValues((c) => ({ ...c, [17]: val }))}
            />

            <Field
              label="Project partner name"
              placeholder="e.g. Green Initiative"
              type="text"
              full
              value={formValues[15]}
              onChange={(val) => setFormValues((c) => ({ ...c, [15]: val }))}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Site Polygon Boundary *
              </label>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{
                  height: "500px",
                  width: "100%",
                  borderRadius: "16px",
                }}
              >
                <ChangeMapView center={mapCenter} />

                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <GeomanControls setPolygonCoordinates={setPolygonCoordinates} />

                {polygonCoordinates.length > 0 && (
                  <Polygon
                    positions={polygonCoordinates.map((p) => [p.lat, p.lng])}
                  />
                )}
              </MapContainer>

              <p className="text-xs text-gray-500 mt-2">
                Drawing tools are on the left. Boundary is pre-filled if
                available.
              </p>
            </div>
            <Field
              label="Area (in HA)"
              placeholder="e.g. 2.5"
              value={polygonArea || formValues[8]}
              onChange={(val) => setFormValues((c) => ({ ...c, [8]: val }))}
            />
            <Field
              label="Capacity"
              placeholder="Total Capacity"
              value={formValues[7]}
              onChange={(val) => setFormValues((c) => ({ ...c, [7]: val }))}
            />
            <Field
              label="Total Trees Planted"
              placeholder=""
              value={formValues[12]}
              onChange={(val) => setFormValues((c) => ({ ...c, [12]: val }))}
            />
            <Field
              label="Trees Remaining"
              placeholder=""
              value={formValues[13]}
              onChange={(val) => setFormValues((c) => ({ ...c, [13]: val }))}
            />
            <Field
              label="Native Species"
              type="select"
              options={speciesList}
              multiple
              value={formValues[14] || []}
              onChange={(val) =>
                setFormValues((c) => ({
                  ...c,
                  14: val,
                }))
              }
            />
            <Field
              label="Soil type"
              placeholder="e.g. Alluvial, Clay, Sand"
              type="text"
              value={formValues[18]}
              onChange={(val) => setFormValues((c) => ({ ...c, [18]: val }))}
            />
            <Field
              label="Rainfall (in mm)"
              placeholder="e.g. 1000, 1500, 2000"
              type="text"
              value={formValues[19]}
              onChange={(val) => setFormValues((c) => ({ ...c, [19]: val }))}
            />
            <Field
              label="Maintanance"
              placeholder="e.g. 3 years, 5 years"
              type="text"
              value={formValues[20]}
              onChange={(val) => setFormValues((c) => ({ ...c, [20]: val }))}
            />
            <Field
              label="Popular"
              type="select"
              options={["Yes", "No"]}
              value={formValues[21]}
              onChange={(val) => setFormValues((c) => ({ ...c, [21]: val }))}
            />
            <Field
              label="survival rate(%)"
              placeholder="e.g. 70% , 80%, 96%"
              type="text"
              value={formValues[22]}
              onChange={(val) => setFormValues((c) => ({ ...c, [22]: val }))}
            />

            <Field
              label="Status"
              type="select"
              options={["Active", "Inactive"]}
              value={formValues[11]}
              onChange={(val) => setFormValues((c) => ({ ...c, [11]: val }))}
            />

            <div className="flex flex-col gap-2 md:col-span-2">
              <Field
                label="Site Image URL (Optional on Edit)"
                type="file"
                full
                onChange={(val) => setFormValues((c) => ({ ...c, [9]: val }))}
              />
              {formValues[9] && (
                <div className="flex items-center gap-3 mt-1 p-2 bg-gray-50 rounded-xl border border-gray-100 w-max pr-4">
                  <img
                    src={
                      typeof formValues[9] === "string"
                        ? formValues[9]
                        : URL.createObjectURL(formValues[9])
                    }
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-contain p-1 border border-gray-100 shadow-sm bg-white"
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeof formValues[9] === "string"
                      ? "Current Image"
                      : "New Image Selected"}
                  </span>
                </div>
              )}
            </div>

            <Field
              label="Description"
              type="textarea"
              placeholder="Optional details..."
              full
              value={formValues[10]}
              onChange={(val) => setFormValues((c) => ({ ...c, [10]: val }))}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
