const IC = {
  logo: "M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7zM9 12l2 2 4-4",
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  pie: "M12 3v9h9A9 9 0 1112 3z",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8z",
  bars: "M5 20V10M12 20V4M19 20v-7",
  card: "M3 6h18v12H3zM3 10h18",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .5a7 7 0 00-1.5-1.5L17 5l-3-1-1 2a7 7 0 00-2 0L10 4 7 5l.5 2A7 7 0 006 8.5L4 8l-1 3 2 1a7 7 0 000 2l-2 1 1 3 2-.5A7 7 0 007.5 18L7 20l3 1 1-2a7 7 0 002 0l1 2 3-1-.5-2a7 7 0 001.5-1.5l2 .5 1-3-2-1z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5",
  bell: "M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  doc: "M6 3h9l4 4v14H6zM14 3v5h5",
  out: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
};

export default function Icon({ name, size }) {
  return (
    <svg className="i" viewBox="0 0 24 24" style={size ? { width: size, height: size } : undefined}>
      <path d={IC[name]} />
    </svg>
  );
}
