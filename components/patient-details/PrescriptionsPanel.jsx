import { RecordRows, RecordCount } from './RecordTable';
export default function PrescriptionsPanel({tab, search, dense, page, pageSize, setPage, setPageSize, recordCount}) {return (<div data-tab-panel="prescriptions" id="panel-prescriptions" role="tabpanel" aria-labelledby="tab-prescriptions" className={tab === "prescriptions" ? "" : "hidden"}>
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip is-info flex-shrink-0">
<i className="ph ph-pill"></i>
</span>
<div>
<h2 className="dash-title">{"Prescriptions"}</h2>
<p className="dash-subtitle">{"\n                      View all medications and prescriptions\n                    "}</p>
</div>
</div>
<button type="button" className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-medium flex items-center gap-1.5 hover:bg-primary-soft transition-colors flex-shrink-0">
<i className="ph ph-plus-circle text-sm"></i>{"Add Prescriptions\n                "}</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-sm min-w-[860px]">
<thead>
<tr className="bg-subtle border-b border-border-subtle">
<th className="text-left px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"Date Range"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Medication"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"Dosage & Frequency"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"Doctor"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Treatment"}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Status"}</th>
<th className="text-right px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Action"}</th>
</tr>
</thead>
<RecordRows rows={[{text:"22 Apr, 25to 22 Apr, 25 Lisinopril 10mg, Once daily Dr Guy Hawkins Ophthalmology Active",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"22 Apr, 25"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Lisinopril"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"10mg, Once daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Guy Hawkins"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Ophthalmology"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Active"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"12 Feb, 25to 22 Apr, 25 Metformin 20mg, Once daily at bedtime Dr Darrell Steward Cardiologist Completed",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"12 Feb, 25"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Metformin"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"20mg, Once daily at bedtime"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Darrell Steward"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Cardiologist"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"07 Dec, 24to 22 Apr, 25 Atorvastatin 500mg, Twice daily Dr Robert Fox Pulmonary Completed",content:(<tr className="bg-primary-soft/40 hover:bg-primary-soft/60 transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"07 Dec, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Atorvastatin"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"500mg, Twice daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Robert Fox"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Pulmonary"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"22 Nov, 24to 22 Apr, 25 Atorvastatin 81mg, Once daily Dr Jerome Bell Rhinology Pending",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"22 Nov, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Atorvastatin"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"81mg, Once daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Jerome Bell"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Rhinology"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">{"Pending"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"17 Sep, 24to 22 Apr, 25 Aspirin 20mg, Once daily Dr Ronald Richards Psychiatry Completed",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"17 Sep, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Aspirin"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"20mg, Once daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Ronald Richards"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Psychiatry"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"13 Aug, 24to 22 Apr, 25 Metformin 40mg, Once daily Dr Wade Warren Psychiatry Completed",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"13 Aug, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Metformin"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"40mg, Once daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Wade Warren"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Psychiatry"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)},{text:"01 Jun, 24to 22 Apr, 25 Lisinopril 15mg, Once daily Dr Dianne Russell Dental Completed",content:(<tr className="hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}><p className="text-sm font-semibold text-heading">{"01 Jun, 24"}</p><p className="text-[11px] text-faint mt-0.5">{"to 22 Apr, 25"}</p></td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Lisinopril"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"15mg, Once daily"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Dianne Russell"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Dental"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span></td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}><button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="prescription" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions"><i className="ph ph-dots-three-vertical text-sm"></i></button></td>
</tr>)}]} search={search} page={page} pageSize={pageSize} />
</table>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-border-subtle bg-subtle/40">
<span className="text-[11px] text-muted"><RecordCount tab={tab} search={search} page={page} pageSize={pageSize} /></span>
<div className="flex items-center gap-0.5">
<button className="w-7 h-7 rounded-lg flex items-center justify-center text-faint opacity-40" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}><i className="ph ph-caret-left text-xs"></i></button>
<button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-subtle transition-colors" aria-label="Next page" disabled={(page + 1) * pageSize >= recordCount} onClick={() => setPage(page + 1)}><i className="ph ph-caret-right text-xs"></i></button>
</div>
</div>
</div>);}
