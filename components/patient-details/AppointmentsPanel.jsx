import { RecordRows, RecordCount } from './RecordTable';
export default function AppointmentsPanel({tab, search, dense, page, pageSize, setPage, setPageSize, recordCount}) {return (<div data-tab-panel="appointment" id="panel-appointment" role="tabpanel" aria-labelledby="tab-appointment" className={tab === "appointment" ? "" : "hidden"}>
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip flex-shrink-0">
<i className="ph ph-calendar-blank"></i>
</span>
<div>
<h2 className="dash-title">{"Appointment History"}</h2>
<p className="dash-subtitle">{"\n                      View all appointments and medical visits\n                    "}</p>
</div>
</div>
<button type="button" className="h-9 px-3 rounded-xl border border-primary text-primary text-xs font-medium flex items-center gap-1.5 hover:bg-primary-soft transition-colors flex-shrink-0">
<i className="ph ph-plus-circle text-sm"></i>{"Schedule Appointment\n                "}</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-sm min-w-[860px]">
<thead>
<tr className="bg-subtle border-b border-border-subtle">
<th className="text-left px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                        Date & Time\n                        "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                        Type\n                      "}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                        Doctor\n                      "}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                        Treatment\n                      "}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"\n                        Notes\n                      "}</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                        Status\n                      "}</th>
<th className="text-right px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">{"\n                        Action\n                      "}</th>
</tr>
</thead>
<RecordRows rows={[{text:"22 Apr, 25 06:42 am Check-up Dr Guy Hawkins Ophthalmology It is a long established fact that a reader will be distracted Scheduled",content:(<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"22 Apr, 25"}</p>
<p className="text-[11px] text-faint mt-0.5">{"06:42 am"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Check-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Guy Hawkins"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Ophthalmology"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        It is a long established fact that a reader will be distracted\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-danger/30 text-danger bg-danger-soft">{"Scheduled"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"12 Feb, 25 07:38 am Check-up Dr Darrell Steward Cardiologist The point of using Lorem Ipsum is that it has a more Completed",content:(<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"12 Feb, 25"}</p>
<p className="text-[11px] text-faint mt-0.5">{"07:38 am"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Check-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Darrell Steward"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Cardiologist"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        The point of using Lorem Ipsum is that it has a more\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"07 Dec, 24 01:34 pm Follow-up Dr Robert Fox Pulmonary There are many variations of passages of Lorem Ipsum Completed",content:(<tr className="group bg-primary-soft/40 hover:bg-primary-soft/60 border-b border-border-subtle transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"07 Dec, 24"}</p>
<p className="text-[11px] text-faint mt-0.5">{"01:34 pm"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Follow-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Robert Fox"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Pulmonary"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        There are many variations of passages of Lorem Ipsum\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"22 Nov, 24 01:55 pm Follow-up Dr Jerome Bell Rhinology If you are going to use a passage of Lorem Ipsum Pending",content:(<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"22 Nov, 24"}</p>
<p className="text-[11px] text-faint mt-0.5">{"01:55 pm"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Follow-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Jerome Bell"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Rhinology"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        If you are going to use a passage of Lorem Ipsum\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">{"Pending"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"17 Sep, 24 05:36 pm Follow-up Dr Ronald Richards Psychiatry It is a long established fact that a reader will be distracted Completed",content:(<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"17 Sep, 24"}</p>
<p className="text-[11px] text-faint mt-0.5">{"05:36 pm"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Follow-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Ronald Richards"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Psychiatry"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        It is a long established fact that a reader will be distracted\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"13 Aug, 24 04:02 am Check-up Dr Wade Warren Psychiatry The point of using Lorem Ipsum is that it has a more Completed",content:(<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"13 Aug, 24"}</p>
<p className="text-[11px] text-faint mt-0.5">{"04:02 am"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Check-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Wade Warren"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Psychiatry"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        The point of using Lorem Ipsum is that it has a more\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"01 Jun, 24 02:02 am Follow-up Dr Dianne Russell Dental If you are going to use a passage of Lorem Ipsum Completed",content:(<tr className="group hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<p className="text-sm font-semibold text-heading">{"01 Jun, 24"}</p>
<p className="text-[11px] text-faint mt-0.5">{"02:02 am"}</p>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Follow-up"}</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"Dr Dianne Russell"}</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Dental"}</td>
<td className={"px-4  text-xs text-muted max-w-[220px] truncate" + (dense ? " py-2" : " py-4")}>{"\n                        If you are going to use a passage of Lorem Ipsum\n                      "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">{"Completed"}</span>
</td>
<td className={"px-5  text-right" + (dense ? " py-2" : " py-4")}>
<button className="row-btn w-8 h-8 rounded-xl border border-border bg-w1 inline-flex items-center justify-center text-faint hover:text-primary hover:border-primary/50 transition-all" data-menu="appointment" aria-haspopup="menu" aria-expanded="false" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)}]} search={search} page={page} pageSize={pageSize} />
</table>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-border-subtle bg-subtle/40">
<label className="inline-flex items-center gap-2 cursor-pointer">
<div className="relative w-11 h-6 shrink-0">
<input id="dense-btn" type="checkbox" className="sr-only peer" checked={dense} onChange={e => setDense(e.target.checked)} />
<span className="block w-full h-full rounded-full bg-border peer-checked:bg-primary transition-colors"></span>
<span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
</div>
<span className="text-xs font-medium text-text">{"Dense"}</span>
</label>
<div className="flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2 text-[11px] text-muted">
<span>{"Rows per page:"}</span>
<select className="h-7 px-2 rounded-lg bg-w1 border border-border text-xs text-text focus:outline-none focus:border-primary/50" value={pageSize} aria-label="Rows per page" onChange={e => {setPageSize(Number(e.target.value));setPage(0);}}>
<option value="7">{"07"}</option>
<option value="14">{"14"}</option>
<option value="21">{"21"}</option>
</select>
</div>
<span className="text-[11px] text-muted"><RecordCount tab={tab} search={search} page={page} pageSize={pageSize} /></span>
<div className="flex items-center gap-0.5">
<button aria-label="Previous page" className="w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors disabled:opacity-40" disabled={page === 0} onClick={() => setPage(page - 1)}>
<i className="ph ph-caret-left text-xs"></i>
</button>
<button aria-label="Next page" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-subtle transition-colors" disabled={(page + 1) * pageSize >= recordCount} onClick={() => setPage(page + 1)}>
<i className="ph ph-caret-right text-xs"></i>
</button>
</div>
</div>
</div>
</div>);}
