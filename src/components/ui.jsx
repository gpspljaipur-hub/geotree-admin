import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";

export function PageHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h2 className="text-[28px] font-black tracking-tight text-gray-900 m-0">
          {title}
        </h2>
        <p className="text-[13px] font-bold text-gray-400 mt-2 m-0">
          {description}
        </p>
      </div>
      {actionLabel && (
        <button
          className="inline-flex items-center gap-2 min-h-[46px] px-6 text-[11px] font-[850] tracking-[1.5px] uppercase text-white bg-pink rounded-[13px] shadow-[0_6px_20px_rgba(223,59,145,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(223,59,145,0.45)] cursor-pointer border-0"
          onClick={onAction}
          type="button"
        >
          <Icon name="plus" size={19} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  showButton = false,
}) {
  return (
    <div className="flex items-center gap-3 w-full max-w-[400px] h-[52px] pl-5 pr-2 py-2 bg-white border border-gray-100 rounded-[15px] shadow-[0_4px_15px_rgba(15,25,40,0.04)] mb-6 focus-within:border-[#244ea3] focus-within:shadow-[0_0_0_4px_rgba(36,78,163,0.08)] transition-all">
      <div className="text-gray-400">
        <Icon name="search" size={18} />
      </div>
      <input
        className="flex-1 bg-transparent border-0 outline-none text-[13px] font-medium text-gray-800 placeholder:text-gray-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {showButton && (
        <button className="h-full px-5 bg-[#0f1928] text-white text-[10px] font-black tracking-widest uppercase rounded-[10px] border-0 cursor-pointer hover:bg-[#1a2b42] transition-colors">
          SEARCH
        </button>
      )}
    </div>
  );
}

export function StatusToggle({
  active: initialActive = true,
  tone = "green",
  onChange,
}) {
  const [active, setActive] = useState(initialActive);

  useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  const isPink = tone === "pink";

  const bgClass = active
    ? isPink
      ? "bg-[#fff0f7] text-[#df3b91]"
      : "bg-green-50 text-green-700"
    : "bg-gray-100 text-gray-500";
  const toggleBgClass = active
    ? isPink
      ? "bg-[#df3b91]"
      : "bg-green-500"
    : "bg-gray-300";
  const textClass = active
    ? isPink
      ? "text-[#df3b91]"
      : "text-green-700"
    : "text-gray-500";

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);
    if (onChange) onChange(newState);
  };

  return (
    <span
      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-[9px] font-[850] uppercase tracking-wider cursor-pointer transition-colors ${active && isPink ? "bg-transparent" : bgClass}`}
      onClick={handleToggle}
    >
      <i
        className={`relative w-[34px] h-[18px] rounded-full transition-colors ${toggleBgClass}`}
      >
        <b
          className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform ${active ? "left-[18px]" : "left-[2px]"}`}
        />
      </i>
      <span className={textClass}>{active ? "ACTIVE" : "INACTIVE"}</span>
    </span>
  );
}

export function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    pink: "bg-[#fff0f7] text-[#df3b91] border border-[#ffe0ef]",
    green: "bg-green-50 text-green-700 border border-green-100",
    gray: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  const toneClass = tones[tone] || tones.blue;
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-[850] tracking-wide ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Avatar({ name = "?", color = "pink", src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 p-1 shadow-sm"
      />
    );
  }
  const initials =
    name === "?"
      ? "?"
      : name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2);
  return (
    <span className="grid place-items-center w-10 h-10 rounded-full text-xs font-bold bg-pink-100 text-pink-700 uppercase">
      {initials}
    </span>
  );
}

export function Actions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-0 bg-transparent"
        onClick={onEdit}
        aria-label="Edit"
        type="button"
      >
        <Icon name="edit" size={18} />
      </button>
      <button
        className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
        onClick={onDelete}
        aria-label="Delete"
        type="button"
      >
        <Icon name="trash" size={18} />
      </button>
    </div>
  );
}

export function DataTable({ columns, rows, emptyText = "No records found" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`pb-4 px-4 border-b border-gray-100 text-[10px] font-bold tracking-widest text-gray-400 uppercase ${column.align === "right" ? "text-right" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                className="py-10 text-center text-sm font-medium text-gray-400"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id || index}
                className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-4 px-4 text-[13px] font-semibold text-gray-700 ${column.align === "right" ? "text-right" : ""}`}
                  >
                    {column.render
                      ? column.render(row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableCard({ children }) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_rgba(20,30,50,0.02)] border border-gray-100">
      {children}
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  submitLabel = "SAVE",
  onSubmit,
  wide = false,
  buttonTone = "blue",
}) {
  const isPink = buttonTone === "pink";
  return (
    <div
      className="fixed inset-0 z-50 p-4 md:p-8 grid place-items-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`relative bg-white rounded-[24px] shadow-2xl overflow-y-auto w-full ${wide ? "max-w-[980px]" : "max-w-[760px]"} max-h-[calc(100vh-60px)]`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between min-h-[76px] px-8 border-b border-gray-100">
          <h3 className="text-[21px] font-black tracking-tight text-gray-900 m-0">
            {title}
          </h3>
          <button
            className="p-2 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <Icon name="x" size={24} />
          </button>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="p-8">{children}</div>
          <footer className="flex justify-end gap-3 px-8 pb-8 pt-4 border-t border-gray-50">
            <button
              className="min-h-[46px] px-6 text-[11px] font-bold tracking-widest uppercase text-gray-600 bg-white border border-gray-200 rounded-[13px] hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={onClose}
              type="button"
            >
              CANCEL
            </button>
            <button
              className={`min-h-[46px] px-8 text-[11px] font-bold tracking-widest uppercase text-white rounded-[13px] transition-colors cursor-pointer border-0 shadow-lg ${isPink ? "bg-[#df3b91] hover:bg-[#c6287c] shadow-pink-500/20" : "bg-blue hover:bg-indigo shadow-blue/20"}`}
              type="submit"
            >
              {submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

// export function Field({
//   label,
//   required,
//   type = "text",
//   placeholder,
//   options,
//   full = false,
//   value,
//   onChange,
// }) {
//   const isFile = type === "file";
//   const props = {
//     onChange: (event) =>
//       onChange?.(isFile ? event.target.files[0] : event.target.value),
//   };
//   if (!isFile) {
//     props.value = value ?? "";
//   }

//   const inputClass =
//     "w-full min-h-[48px] px-4 bg-white border border-gray-200 rounded-[11px] text-[14px] font-medium text-gray-900 outline-none transition-all focus:border-pink focus:ring-4 focus:ring-pink/10";

//   return (
//     <label className={`flex flex-col gap-2 ${full ? "col-span-full" : ""}`}>
//       <span className="text-[12px] font-[800] uppercase tracking-wider text-gray-600">
//         {label} {required && <b className="text-pink">*</b>}
//       </span>
//       {type === "textarea" ? (
//         <textarea
//           className={`${inputClass} py-3 min-h-[88px] resize-y`}
//           placeholder={placeholder}
//           {...props}
//         />
//       ) : type === "select" ? (
//         <select className={inputClass} {...props}>
//           <option value="">{placeholder || `Select ${label}`}</option>
//           {(options || []).map((option) => {
//             const isObj = typeof option === "object" && option !== null;
//             const val = isObj ? option.value : option;
//             const text = isObj ? option.label : option;
//             return (
//               <option value={val} key={val}>
//                 {text}
//               </option>
//             );
//           })}
//         </select>
//       ) : (
//         <input
//           className={inputClass}
//           type={type}
//           placeholder={placeholder}
//           {...props}
//         />
//       )}
//     </label>
//   );
// }

export function Field({
  label,
  required,
  type = "text",
  placeholder,
  options,
  full = false,
  value,
  onChange,
  multiple = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const inputClass =
    "w-full min-h-[48px] px-4 bg-white border border-gray-200 rounded-[11px] text-[14px] font-medium text-gray-900 outline-none transition-all focus:border-pink focus:ring-4 focus:ring-pink/10";

  const getLabel = (id) => {
    const found = options?.find((item) =>
      typeof item === "object" ? item.value === id : item === id,
    );

    return typeof found === "object" ? found.label : found;
  };

  const toggleSelect = (id) => {
    const current = Array.isArray(value) ? value : [];

    if (current.includes(id)) {
      onChange(current.filter((x) => x !== id));
    } else {
      onChange([...current, id]);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 relative ${full ? "col-span-full" : ""}`}
    >
      <span className="text-[12px] font-[800] uppercase tracking-wider text-gray-600">
        {label} {required && <b className="text-pink">*</b>}
      </span>

      {type === "select" && multiple ? (
        <div ref={dropdownRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className={`${inputClass} flex flex-wrap items-center gap-2 cursor-pointer`}
          >
            {Array.isArray(value) && value.length > 0 ? (
              value.map((id) => (
                <span
                  key={id}
                  className="
                  bg-pink/10
                  text-pink
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-bold
                  "
                >
                  {getLabel(id)}

                  <button
                    type="button"
                    className="ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSelect(id);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400">Select {label}</span>
            )}
          </div>

          {open && (
            <div
              className="
              absolute
              bg-white
              border
              rounded-xl
              shadow-xl
              mt-2
              z-50
              w-full
              max-h-60
              overflow-auto
            "
            >
              {options?.map((option) => {
                const id = typeof option === "object" ? option.value : option;

                const text = typeof option === "object" ? option.label : option;

                const selected = value?.includes(id);

                return (
                  <div
                    key={id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(id);
                    }}
                    className="
                    px-4
                    py-3
                    flex
                    justify-between
                    cursor-pointer
                    hover:bg-gray-100
                    "
                  >
                    {text}

                    {selected && <span>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : type === "select" ? (
        <select
          className={inputClass}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder || `Select ${label}`}</option>

          {options?.map((option) => {
            const val = typeof option === "object" ? option.value : option;

            const text = typeof option === "object" ? option.label : option;

            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          className={inputClass}
          type={type}
          placeholder={placeholder}
          value={type === "file" ? undefined : (value ?? "")}
          onChange={(e) => {
            if (type === "file") {
              onChange(e.target.files[0]);
            } else {
              onChange(e.target.value);
            }
          }}
        />
      )}
    </div>
  );
}

export function EntityCell({ title, subtitle, avatar = true, image }) {
  return (
    <div className="flex items-center gap-4">
      {avatar && <Avatar name={title} src={image} />}
      <div className="flex flex-col">
        <strong className="text-[14px] font-bold text-gray-800">{title}</strong>
        {subtitle && (
          <small className="text-[12px] font-semibold text-gray-400">
            {subtitle}
          </small>
        )}
      </div>
    </div>
  );
}

export function Tabs({ items, active, onChange }) {
  return (
    <div className="flex overflow-x-auto w-max max-w-full p-1 bg-gray-100 rounded-2xl shadow-inner mb-8">
      {items.map((item) => (
        <button
          className={`flex items-center gap-2 min-h-[40px] px-6 border-0 rounded-xl text-[10px] font-extrabold tracking-wider whitespace-nowrap cursor-pointer transition-all ${
            item.id === active
              ? "text-blue-700 bg-white shadow-md shadow-blue-900/10"
              : "text-gray-400 bg-transparent hover:text-gray-600 hover:bg-gray-200/50"
          }`}
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.icon && <Icon name={item.icon} size={18} />}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <span className="text-[13px] font-semibold text-gray-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 text-[11px] font-[850] uppercase tracking-wider text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer border-0 transition-colors"
        >
          Previous
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-4 py-2 text-[11px] font-[850] uppercase tracking-wider text-gray-600 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer border-0 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
