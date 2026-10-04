export async function mountBillingCharts() {
 const {default: ApexCharts}=await import('apexcharts');
 const charts=[];
    var P = "#0b8c00"; // primary
    var I = "#0ea5e9"; // info

    var FF = "Inter, system-ui, sans-serif";
    var SPARK = {
      sparkline: { enabled: true },
      animations: { enabled: false },
      fontFamily: FF,
    };
    var TIP = {
      fixed: { enabled: false },
      x: { show: false },
      marker: { show: false },
    };

    function mountBars(elId, data, color, opts) {
      var el = document.getElementById(elId);
      if (!el) return;
      const chart = new ApexCharts(el, {
        series: [{ data: data }],
        chart: Object.assign({ type: "bar", height: 88, width: "100%" }, SPARK),
        plotOptions: {
          bar: {
            borderRadius: 2,
            borderRadiusApplication: "end",
            columnWidth: "55%",
            distributed: true,
          },
        },
        colors: data.map(function (_, i) {
          if (opts && opts.highlightIdx === i) return color;
          // Alternate dim/full bars
          return i % 2 === 0 ? color + "80" : color;
        }),
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: TIP,
      });
      charts.push(chart);
      chart.render();
    }

    function mountArea(elId, data, color) {
      var el = document.getElementById(elId);
      if (!el) return;
      const chart = new ApexCharts(el, {
        series: [{ data: data }],
        chart: Object.assign(
          { type: "area", height: 88, width: "100%" },
          SPARK,
        ),
        stroke: { curve: "smooth", width: 2 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.02,
            stops: [0, 100],
          },
        },
        colors: [color],
        dataLabels: { enabled: false },
        tooltip: TIP,
      });
      charts.push(chart);
      chart.render();
    }

    function build() {


      // 1. Total Billed — bars, alternating dim/full primary
      mountBars("bill-total-chart", [40, 64, 48, 80, 56, 92, 68, 100], P);

      // 2. Insurance Covered — smooth area chart, primary
      mountArea(
        "bill-insurance-chart",
        [22, 30, 24, 38, 30, 46, 38, 52, 44, 60, 50, 68],
        P,
      );

      // 3. Patient Paid — bars with one highlighted, info-blue
      mountBars("bill-paid-chart", [40, 32, 56, 44, 64, 100, 52, 60], I, {
        highlightIdx: 5,
      });

      // 4. Outstanding Balance — area chart trending up, primary
      mountArea(
        "bill-outstanding-chart",
        [10, 18, 14, 26, 22, 32, 38, 30, 44, 50, 56, 64],
        P,
      );
    }


 build();
 return ()=>charts.forEach(chart=>chart.destroy());
}
