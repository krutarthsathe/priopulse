export default function PatientRow({row, dense}) {
 switch(row.template) {
case 0: return (<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user1.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Guy Hawkins\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (201) 555-0124\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    7529 E. Pecan St.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-female text-sm text-info"></i>{"Female\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">{"Adults"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Ophthalmology"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger-soft text-danger border border-danger/20">
<span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>{"Cancelled\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
case 1: return (<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user2.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Cody Fisher\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (239) 555-0108\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    3605 Parker Rd.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-male text-sm text-primary"></i>{"Male\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20">{"Teenagers"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Cardiologist"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{"Paid\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
case 2: return (<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user3.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Arlene McCoy\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (406) 555-0120\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    8080 Railroad St.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-male text-sm text-primary"></i>{"Male\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning/10 text-warning border border-warning/20">{"Young Adults"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Pulmonary"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger-soft text-danger border border-danger/20">
<span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>{"Cancelled\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
case 3: return (<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user4.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Theresa Webb\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (319) 555-0115\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    8558 Green Rd.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-female text-sm text-info"></i>{"Female\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20">{"Teenagers"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Rhinology"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning-soft text-warning border border-warning/20">
<span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>{"Pending\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
case 4: return (<tr className="group border-b border-border-subtle hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user5.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Ronald Richards\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (270) 555-0117\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    3890 Poplar Dr.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-male text-sm text-primary"></i>{"Male\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">{"Adults"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Psychiatry"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{"Paid\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
case 5: return (<tr className="group hover:bg-primary/[0.03] transition-colors">
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-3">
<img src="/assets/images/user6.png" alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
<div>
<p className="text-sm font-semibold text-heading leading-tight">{"\n                          Kristin Watson\n                        "}</p>
<p className="text-[11px] text-faint mt-0.5">{"\n                          (603) 555-0123\n                        "}</p>
</div>
</div>
</td>
<td className={"px-4  text-xs text-muted whitespace-nowrap" + (dense ? " py-2" : " py-4")}>{"\n                    775 Rolling Green Rd.\n                  "}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1.5 text-xs text-muted">
<i className="ph ph-gender-male text-sm text-primary"></i>{"Male\n                    "}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning/10 text-warning border border-warning/20">{"Young Adults"}</span>
</td>
<td className={"px-4  text-xs text-muted" + (dense ? " py-2" : " py-4")}>{"Dental"}</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{"Paid\n                    "}</span>
</td>
<td className={"px-5 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center justify-end gap-1.5">
<button aria-label="Call" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-phone text-sm"></i>
</button>
<a className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center" href="#">
<i className="ph ph-eye text-sm"></i>
</a>
<button data-row-more="" aria-label="More" aria-expanded="false" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</td>
</tr>);
 default: return <tr className="group border-b border-border-subtle"><td className={dense ? 'px-5 py-2' : 'px-5 py-4'}><div className="font-semibold">{row.name}</div><div className="text-xs text-muted">{row.email}</div></td><td className="px-4">{row.address || '—'}</td><td className="px-4">{row.gender}</td><td className="px-4">Local</td><td className="px-4">{row.treatment}</td><td className="px-4">{row.payment}</td><td className="px-5"><button data-row-more aria-label="More" className="text-muted">•••</button></td></tr>;
 }
}
