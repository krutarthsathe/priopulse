export default function DoctorCard({doctor,onSelect,onAction}) {return (<article className="doctor-card group flex flex-col bg-w1 hover:bg-primary/[0.02] p-5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-inset" role="button" tabIndex={0} aria-label={"View " + doctor.name} onClick={e => {if (!e.target.closest('button')) onSelect(doctor);}} onKeyDown={e => {if (e.target === e.currentTarget && ['Enter',' '].includes(e.key)) {e.preventDefault();onSelect(doctor);}}}>

<div className="flex items-center justify-between mb-4">
<span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border " + (doctor.status === "Active" ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20")}>
<span className={"w-1.5 h-1.5 rounded-full inline-block " + (doctor.status === "Active" ? "bg-primary" : "bg-warning")}></span>{doctor.status}</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-subtle text-muted border border-border">{doctor.employment}</span>
</div>

<div className="flex flex-col items-center gap-2 mb-4">
<div className="relative">
<img src={doctor.image} alt={doctor.name} className="size-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all" />
<span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-soft border-2 border-w1 flex items-center justify-center">
<i className="ph ph-stethoscope text-primary text-[9px]"></i>
</span>
</div>
<div className="text-center">
<h3 className="text-sm font-semibold text-heading group-hover:text-primary transition-colors leading-tight">{doctor.name}</h3>
<p className="text-[11px] text-muted mt-0.5">{doctor.specialty}</p>
</div>
</div>

<div className="grid grid-cols-2 gap-2 mb-4">
<div className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-subtle">
<span className="text-sm font-bold text-heading">{doctor.patients}</span>
<span className="text-[10px] text-faint">{"Patients"}</span>
</div>
<div className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-subtle">
<span className="text-sm font-bold text-heading">{doctor.experience}</span>
<span className="text-[10px] text-faint">{"Experience"}</span>
</div>
</div>

<div className="flex items-center justify-between mt-auto">
<span className="flex items-center gap-1 text-xs font-semibold text-heading"><i className="ph-fill ph-star text-warning text-sm" />{doctor.rating === null ? "—" : doctor.rating}<span className="text-[10px] text-faint font-normal">/5.0</span></span>
<div className="flex items-center gap-1">
<button data-stop="" aria-label="Call" className="w-7 h-7 rounded-lg bg-info/10 text-info hover:bg-info/20 flex items-center justify-center transition-colors cursor-pointer" type="button" onClick={() => onAction("Call is not connected in this demo.")}>
<i className="ph ph-phone text-xs"></i>
</button>
<button data-stop="" aria-label="Email" className="w-7 h-7 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center transition-colors cursor-pointer" type="button" onClick={() => onAction("Email is not connected in this demo.")}>
<i className="ph ph-envelope text-xs"></i>
</button>
<button data-stop="" aria-label="Message" className="w-7 h-7 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 flex items-center justify-center transition-colors cursor-pointer" type="button" onClick={() => onAction("Message is not connected in this demo.")}>
<i className="ph ph-chat-circle-dots text-xs"></i>
</button>
</div>
</div>
</article>);}
