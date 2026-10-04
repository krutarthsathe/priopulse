export default function Navigation() { return <>
<div id="mobile-sidebar-overlay" className="fixed inset-0 bg-black/50 z-40 hidden opacity-0 transition-opacity duration-300 lg:hidden"></div>

<aside id="mobile-sidebar" className="fixed top-0 left-0 z-50 h-full w-[280px] bg-w1 shadow-2xl transform -translate-x-full transition-transform duration-300 lg:hidden flex flex-col">

<div className="h-16 flex items-center justify-between px-4 border-b border-border">
<a className="flex items-center gap-3" href="/patients">
<div className="brand-logo w-9 h-9">
<img src="/assets/images/logo.png" alt="PrioPulse Logo" />
</div>
<span className="flex flex-col leading-none">
<span className="brand-wordmark font-bold text-lg">{"PrioPulse"}</span>
<span className="text-[10px] font-medium text-faint tracking-wide">{"Medical Suite"}</span>
</span>
</a>
<button id="mobile-sidebar-close" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:bg-primary/5">
<i className="ph ph-x text-xl"></i>
</button>
</div>

<nav className="flex-1 overflow-y-auto p-4 space-y-1">
<p className="nav-section">{"Overview"}</p>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="dashboard" href="/patients">
<i className="ph ph-squares-four text-xl"></i>
<span className="font-medium">{"Dashboard"}</span>
</a>
<p className="nav-section">{"Clinical"}</p>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="doctors">
<i className="ph ph-stethoscope text-xl"></i>
<span className="font-medium flex-1 text-left">{"Doctors"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="doctors" href="/doctors">{"All Doctors"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="doctor-details" href="#">{"Doctor Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="doctor-schedule" href="#">{"Doctor Schedule"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="doctor-edit-profile" href="#">{"Edit Profile"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="patients">
<i className="ph ph-users text-xl"></i>
<span className="font-medium flex-1 text-left">{"Patients"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="patients" href="/patients">{"All Patients"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="patient-details" href="/patient-details">{"Patient Details"}</a>
</div>
</div>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="appointments" href="#">
<i className="ph ph-calendar-blank text-xl"></i>
<span className="font-medium">{"Appointments"}</span>
</a>

</nav>
</aside>

<aside id="sidebar" className="fixed top-0 left-0 z-40 h-full w-64 bg-white/70 dark:bg-w1/60 backdrop-blur-xl border-r border-border hidden lg:flex flex-col transition-all duration-300">

<div className="h-16 flex items-center px-4 border-b border-border-subtle">
<a className="flex items-center gap-3 overflow-hidden" href="/patients">
<div className="brand-logo w-9 h-9 flex-shrink-0">
<img src="/assets/images/logo.png" alt="PrioPulse" />
</div>
<span className="nav-text flex flex-col leading-none whitespace-nowrap">
<span className="brand-wordmark font-bold text-lg">{"PrioPulse"}</span>
<span className="text-[10px] font-medium text-faint tracking-wide">{"Medical Suite"}</span>
</span>
</a>
</div>

<nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
<p className="nav-section nav-text">{"Overview"}</p>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="dashboard" href="/patients">
<i className="ph ph-squares-four text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Dashboard"}</span>
</a>
<p className="nav-section nav-text">{"Clinical"}</p>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="doctors">
<i className="ph ph-stethoscope text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Doctors"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="doctors" href="/doctors">{"\n          All Doctors\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="doctor-details" href="#">{"\n          Doctor Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="doctor-schedule" href="#">{"\n          Doctor Schedule\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="doctor-edit-profile" href="#">{"\n          Edit Profile\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="patients">
<i className="ph ph-users text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Patients"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="patients" href="/patients">{"\n          All Patients\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="patient-details" href="/patient-details">{"\n          Patient Details\n        "}</a>
</div>
</div>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="appointments" href="#">
<i className="ph ph-calendar-blank text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Appointments"}</span>
</a>

</nav>

</aside>

</>; }
