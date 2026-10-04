export async function mountCharts() {
 const [d3, topojson, apex, atlas] = await Promise.all([import('d3'), import('topojson-client'), import('apexcharts'), import('us-atlas/states-10m.json')]);
 const ApexCharts = apex.default;
 const us = atlas.default;
 let disposed = false;
// ── State age data (FIPS code -> age group) ──────────────
const AGE_BY_FIPS = {
  23: "60-plus",
  50: "0-5",
  33: "60-plus",
  53: "0-5",
  30: "empty",
  38: "0-5",
  27: "0-5",
  55: "0-5",
  26: "6-17",
  36: "0-5",
  25: "0-5",
  44: "0-5",
  16: "0-5",
  56: "36-60",
  46: "36-60",
  19: "36-60",
  17: "60-plus",
  18: "0-5",
  39: "60-plus",
  42: "18-35",
  34: "36-60",
  "09": "0-5",
  41: "36-60",
  32: "18-35",
  49: "empty",
  "08": "18-35",
  31: "36-60",
  29: "0-5",
  21: "36-60",
  54: "0-5",
  51: "0-5",
  24: "0-5",
  10: "36-60",
  "06": "36-60",
  "04": "0-5",
  35: "0-5",
  20: "36-60",
  "05": "36-60",
  47: "60-plus",
  37: "36-60",
  45: "0-5",
  40: "empty",
  22: "18-35",
  28: "36-60",
  "01": "36-60",
  13: "0-5",
  48: "36-60",
  12: "18-35",
  "02": "0-5",
  15: "18-35",
};
const AGE_COLORS = {
  "0-5": "#10b981",
  "6-17": "#a855f7",
  "18-35": "#22d3ee",
  "36-60": "#f59e0b",
  "60-plus": "#fb7185",
  empty: "#0f172a",
};

// ── US Map ───────────────────────────────────────────────
const mapHost = document.getElementById("us-states-map");
if (mapHost && typeof d3 !== "undefined" && typeof topojson !== "undefined") {
  const svg = d3.select(mapHost).select("svg");
  const W = 960,
    H = 600;

  Promise.resolve(us)
    .then((us) => {
      if (disposed) return;
      const features = topojson.feature(us, us.objects.states).features;
      const projection = d3.geoAlbersUsa().fitSize([W, H], {
        type: "FeatureCollection",
        features,
      });
      const path = d3.geoPath(projection);

      svg
        .selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr(
          "fill",
          (d) =>
            AGE_COLORS[AGE_BY_FIPS[String(d.id).padStart(2, "0")]] || "#10b981",
        )
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("class", "cursor-pointer transition-opacity hover:opacity-80")
        .append("title")
        .text((d) => d.properties.name);
    })
    .catch(() => {
      mapHost.innerHTML =
        '<div class="text-center text-xs text-faint p-6">Map data unavailable</div>';
    });
}

function initPatientsChart() {
  const chartEl = document.getElementById("patients-bar-chart");
  if (!chartEl || typeof ApexCharts === "undefined") return;

  const isDark = document.documentElement.classList.contains("dark");
  // Read height from the chart's PARENT container, not the section.
  // The section contains the chart and would grow with it, creating a
  // feedback loop where the chart keeps re-rendering taller and taller.
  // The parent container is sized via CSS (fixed at narrow widths,
  // flex-1 inside a fixed-height card at md+) so it's stable.
  const CHART_H = 240;
  const calcH = () => CHART_H;
  const initialH = CHART_H;

  const buildOptions = (dark, height) => ({
    series: [
      { name: "Group A", data: [150, 105, 130] },
      { name: "Group B", data: [220, 82, 63] },
      { name: "Group C", data: [170, 110, 90] },
    ],
    chart: {
      type: "bar",
      height: height || 320,
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif",
      background: "transparent",
      animations: { enabled: true, easing: "easeinout", speed: 350 },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
        borderRadius: 4,
        borderRadiusApplication: "end",
        dataLabels: { position: "center" },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: [dark ? "#0f172a" : "#0f172a"],
      },
      offsetX: 0,
    },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: [
        ["Local", "Patients"],
        ["Foreigner", "Patients"],
        ["Referred", "Patients"],
      ],
      tickAmount: 5,
      min: 0,
      max: 250,
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: "Number of Patients",
        offsetY: 8,
        style: {
          color: dark ? "#94a3b8" : "#94a3b8",
          fontSize: "11px",
          fontWeight: 400,
        },
      },
      labels: {
        style: {
          colors: dark ? "#94a3b8" : "#64748b",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: dark ? "#cbd5e1" : "#475569",
          fontSize: "12px",
        },
        maxWidth: 120,
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: dark ? "dark" : "light",
      style: { fontSize: "12px" },
      y: { formatter: (v) => v + " patients" },
    },
    legend: { show: false },
    grid: {
      borderColor: dark ? "#334155" : "#e2e8f0",
      strokeDashArray: 4,
      padding: { left: 10, right: 20, top: 0, bottom: 0 },
    },
    colors: ["#16a34a", "#facc15", "#22d3ee"],
    responsive: [
      {
        breakpoint: 768,
        options: {
          dataLabels: { style: { fontSize: "10px" } },
          yaxis: {
            labels: { style: { fontSize: "11px" }, maxWidth: 90 },
          },
          xaxis: {
            labels: { style: { fontSize: "10px" } },
            title: { style: { fontSize: "10px" } },
          },
          grid: { padding: { left: 4, right: 12 } },
        },
      },
    ],
  });

  let chart = new ApexCharts(chartEl, buildOptions(isDark, initialH));
  chart.render();

  return () => chart.destroy();
}

 let destroyChart = initPatientsChart();
 let previousDark = document.documentElement.classList.contains('dark');
 const observer = new MutationObserver(() => { const dark = document.documentElement.classList.contains('dark'); if (dark === previousDark) return; previousDark = dark; destroyChart?.(); destroyChart = initPatientsChart(); });
 observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
 return () => { disposed = true; observer.disconnect(); destroyChart?.(); d3.select('#us-states-map svg').selectAll('path').remove(); };
}
