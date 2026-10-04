import { RecordRows, RecordCount } from './RecordTable';
export default function BillingPanel({tab, search, dense, page, pageSize, setPage, setPageSize, recordCount}) {return (<div data-tab-panel="billing" id="panel-billing" role="tabpanel" aria-labelledby="tab-billing" className={tab === "billing" ? "" : "hidden"}>

<div className="dash-panel overflow-hidden">
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip is-warning flex-shrink-0"><i className="ph ph-credit-card"></i></span>
<div>
<h2 className="dash-title">{"Payment Summary"}</h2>
<p className="dash-subtitle">{"Overview of patient's payment history"}</p>
</div>
</div>
<button type="button" className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-medium flex items-center gap-1.5 hover:bg-primary-soft transition-colors flex-shrink-0">
<i className="ph ph-plus-circle text-sm"></i>{"New Invoice\n                  "}</button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-5">

<div className="rounded-2xl border border-border bg-w1 p-4 flex flex-col gap-3">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
<i className="ph ph-currency-dollar text-primary text-sm"></i>
</span>
<p className="text-[11px] font-semibold text-muted">{"Total Billed"}</p>
</div>
<div className="flex items-end justify-between gap-2">
<div>
<p className="text-xl font-bold text-heading leading-none mb-1">{"$65.25K"}</p>
<p className="text-[10px] text-primary font-medium flex items-center gap-0.5"><i className="ph ph-arrow-up-right text-[10px]"></i>{"30.2 AVG"}</p>
</div>
<div id="bill-total-chart" className="w-20 h-[72px] shrink-0"></div>
</div>
</div>

<div className="rounded-2xl border border-border bg-w1 p-4 flex flex-col gap-3">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
<i className="ph ph-shield-check text-info text-sm"></i>
</span>
<p className="text-[11px] font-semibold text-muted">{"Insurance Covered"}</p>
</div>
<div className="flex items-end justify-between gap-2">
<div>
<p className="text-xl font-bold text-heading leading-none mb-1">{"$32.16K"}</p>
<p className="text-[10px] text-primary font-medium flex items-center gap-0.5"><i className="ph ph-arrow-up-right text-[10px]"></i>{"60.2 AVG"}</p>
</div>
<div id="bill-insurance-chart" className="w-20 h-[72px] shrink-0"></div>
</div>
</div>

<div className="rounded-2xl border border-border bg-w1 p-4 flex flex-col gap-3">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
<i className="ph ph-check-circle text-success text-sm"></i>
</span>
<p className="text-[11px] font-semibold text-muted">{"Patient Paid"}</p>
</div>
<div className="flex items-end justify-between gap-2">
<div>
<p className="text-xl font-bold text-heading leading-none mb-1">{"$12.45K"}</p>
<p className="text-[10px] text-primary font-medium flex items-center gap-0.5"><i className="ph ph-arrow-up-right text-[10px]"></i>{"25.5 AVG"}</p>
</div>
<div id="bill-paid-chart" className="w-20 h-[72px] shrink-0"></div>
</div>
</div>

<div className="rounded-2xl border border-border bg-w1 p-4 flex flex-col gap-3">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
<i className="ph ph-warning-circle text-warning text-sm"></i>
</span>
<p className="text-[11px] font-semibold text-muted">{"Outstanding Balance"}</p>
</div>
<div className="flex items-end justify-between gap-2">
<div>
<p className="text-xl font-bold text-heading leading-none mb-1">{"$21.74K"}</p>
<p className="text-[10px] text-warning font-medium flex items-center gap-0.5"><i className="ph ph-arrow-up-right text-[10px]"></i>{"40.4 AVG"}</p>
</div>
<div id="bill-outstanding-chart" className="w-20 h-[72px] shrink-0"></div>
</div>
</div>
</div>
</div>

<div className="dash-panel p-0 overflow-hidden">
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip flex-shrink-0"><i className="ph ph-receipt"></i></span>
<div>
<h2 className="dash-title">{"Billing History"}</h2>
<p className="dash-subtitle">{"View all billing and payment information"}</p>
</div>
</div>
<div className="flex items-center gap-2">
<button type="button" className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-medium flex items-center gap-1.5 hover:bg-primary-soft transition-colors"><i className="ph ph-plus-circle text-sm"></i>{"New Invoice"}</button>
<button type="button" className="h-9 px-3 rounded-xl border border-border text-muted text-xs font-medium flex items-center gap-1.5 hover:bg-subtle transition-colors"><i className="ph ph-export text-sm"></i>{"Export"}</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-sm min-w-[860px]">
<thead>
<tr className="bg-subtle border-b border-border-subtle">
<th className="text-left px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"Date & Time"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Description"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Amount"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Insurance"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"Patient Responsibility"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Status"}</th>
<th className="text-right px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Action"}</th>
</tr>
</thead>
<RecordRows rows={[{text:"22 Apr, 2506:42 amCo-Pay payment$102.00$0.79$104.29Pending",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"22 Apr, 25"}</p><p className="text-[11px] text-faint mt-0.5">{"06:42 am"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Co-Pay payment"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$102.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.79"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$104.29"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">{"Pending"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"12 Feb, 2507:38 amTop-up Fee$90.00$0.46$45.83Paid",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"12 Feb, 25"}</p><p className="text-[11px] text-faint mt-0.5">{"07:38 am"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Top-up Fee"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$90.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.46"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$45.83"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"07 Dec, 2401:34 pmLab E-Lipid$3,082.71$9.32$132.31Paid",content:(<tr className="bg-primary-soft/40 hover:bg-primary-soft/60 transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"07 Dec, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"01:34 pm"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Lab E-Lipid"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$3,082.71"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$9.32"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$132.31"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"22 Nov, 2401:55 pmRegular Office/visit Top-up$808.00$0.44$285.85Paid",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"22 Nov, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"01:55 pm"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Regular Office/visit Top-up"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$808.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.44"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$285.85"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"17 Sep, 2405:36 pmApply and check up$3,800.00$0.79$184.30Paid",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"17 Sep, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"05:36 pm"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Apply and check up"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$3,800.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.79"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$184.30"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"13 Aug, 2404:02 amVice receipt$4,005.00$0.36$184.81Paid",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"13 Aug, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"04:02 am"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Vice receipt"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$4,005.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.36"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$184.81"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)},{text:"01 Jun, 2402:02 amCheck out$150.00$0.04$27.83Paid",content:(<tr className="hover:bg-primary/[0.03] transition-colors"><td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"01 Jun, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"02:02 am"}</p></td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Check out"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$150.00"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$0.04"}</td><td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"$27.83"}</td><td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Paid"}</span></td><td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button type="button" className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="billing" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td></tr>)}]} search={search} page={page} pageSize={pageSize} />
</table>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-border-subtle bg-subtle/40">
<div className="flex items-center gap-2 text-[11px] text-muted">
<span>{"Rows per page:"}</span>
<select className="h-7 px-2 rounded-lg bg-w1 border border-border text-xs text-text focus:outline-none focus:border-primary/50" value={pageSize} aria-label="Rows per page" onChange={e => {setPageSize(Number(e.target.value));setPage(0);}}>
<option value="7">{"07"}</option>
<option value="14">{"14"}</option>
<option value="21">{"21"}</option>
</select>
</div>
<div className="flex flex-wrap items-center gap-4">
<span className="text-[11px] text-muted"><RecordCount tab={tab} search={search} page={page} pageSize={pageSize} /></span>
<div className="flex items-center gap-0.5">
<button className="w-7 h-7 rounded-lg flex items-center justify-center text-faint opacity-40" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}><i className="ph ph-caret-left text-xs"></i></button>
<button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-subtle transition-colors" aria-label="Next page" disabled={(page + 1) * pageSize >= recordCount} onClick={() => setPage(page + 1)}><i className="ph ph-caret-right text-xs"></i></button>
</div>
</div>
</div>
</div>
</div>);}
