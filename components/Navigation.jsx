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
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="doctors" href="#">{"All Doctors"}</a>
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

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="employee">
<i className="ph ph-users-three text-xl"></i>
<span className="font-medium flex-1 text-left">{"Employee"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="employee" href="#">{"All Employee"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="employee-details" href="#">{"Employee Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="employee-schedule" href="#">{"Employee Schedule"}</a>
</div>
</div>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="prescriptions" href="#">
<i className="ph ph-pill text-xl"></i>
<span className="font-medium">{"Prescriptions"}</span>
</a>
<p className="nav-section">{"Operations"}</p>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="departments" href="#">
<i className="ph ph-buildings text-xl"></i>
<span className="font-medium">{"Departments"}</span>
</a>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="billing">
<i className="ph ph-credit-card text-xl"></i>
<span className="font-medium flex-1 text-left">{"Billing"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="invoice" href="#">{"Invoices List"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="invoice-details" href="#">{"Invoice Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="payments-history" href="#">{"Payments History"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="insurance-claims" href="#">{"Insurance Claims"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="insurance-claims-details" href="#">{"Insurance Claims Details"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="inventory">
<i className="ph ph-package text-xl"></i>
<span className="font-medium flex-1 text-left">{"Inventory"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="inventory" href="#">{"Inventory List"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="inventory" href="#">{"Stock Alerts"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="inventory" href="#">{"Supplies"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="medicine">
<i className="ph ph-first-aid text-xl"></i>
<span className="font-medium flex-1 text-left">{"Medicine"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="all-templates" href="#">{"All Templates"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="recently-used" href="#">{"Recently Used"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="my-templates" href="#">{"My Templates"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="medicine-details" href="#">{"Medicine Details"}</a>
</div>
</div>
<p className="nav-section">{"Records & Resources"}</p>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="records">
<i className="ph ph-folder-notch text-xl"></i>
<span className="font-medium flex-1 text-left">{"Records"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="birth-records" href="#">{"Birth Records"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="record-details" href="#">{"Birth Records Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="birth-audit-history" href="#">{"Birth Audit History"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="death-records" href="#">{"Death Records"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="death-record-details" href="#">{"Death Records Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="death-audit-history" href="#">{"Death Audit History"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="ambulance">
<i className="ph ph-ambulance text-xl"></i>
<span className="font-medium flex-1 text-left">{"Ambulance"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="ambulance-call-list" href="#">{"Call List"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="ambulance-call-details" href="#">{"Call Details Timeline"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="ambulance-list" href="#">{"Ambulance List"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="ambulance-details" href="#">{"Ambulance Details"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="reports">
<i className="ph ph-chart-bar text-xl"></i>
<span className="font-medium flex-1 text-left">{"Reports"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="reports-overview" href="#">{"Report Overview"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="appointment-reports" href="#">{"Appointment Report"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="financial-reports" href="#">{"Financial Report"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="inventory-reports" href="#">{"Inventory Reports"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="patient-visit-report" href="#">{"Patient Visit Report"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="bloodbank">
<i className="ph ph-drop text-xl"></i>
<span className="font-medium flex-1 text-left">{"Blood Bank"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="blood-stock" href="#">{"Blood Stock"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="blood-unit-details" href="#">{"Blood Unit Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="blood-donor" href="#">{"Blood Donor"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="blood-donor-details" href="#">{"Blood Donor Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="blood-issued" href="#">{"Blood Issued"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="add-unit-blood" href="#">{"Add Unit Blood"}</a>
</div>
</div>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="room-allotment">
<i className="ph ph-door text-xl"></i>
<span className="font-medium flex-1 text-left">{"Room Allotment"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="alloted-rooms" href="#">{"Alloted Rooms"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="alloted-room-details" href="#">{"Alloted Rooms Details"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="room-allotment" href="#">{"Room Allotment"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="rooms-by-department" href="#">{"Rooms by Department"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="add-new-room" href="#">{"Add New Room"}</a>
</div>
</div>
<p className="nav-section">{"Workspace"}</p>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="email" href="#">
<i className="ph ph-envelope text-xl"></i>
<span className="font-medium">{"Email"}</span>
</a>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="chat" href="#">
<i className="ph ph-chats text-xl"></i>
<span className="font-medium">{"Chat"}</span>
</a>

<div data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="mobile-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="settings">
<i className="ph ph-gear text-xl"></i>
<span className="font-medium flex-1 text-left">{"Settings"}</span>
<i className="ph ph-caret-down text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="hidden mt-1 ml-9 space-y-0.5" data-nav-menu="">
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="settings" href="#">{"General Settings"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="notifications" href="#">{"Notification Settings"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="working-hours" href="#">{"Working Hours"}</a>
<a className="block px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary/5 transition-colors" data-page="integrations" href="#">{"Integrations"}</a>
</div>
</div>
<a className="mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-primary/5" data-page="support" href="#">
<i className="ph ph-headset text-xl"></i>
<span className="font-medium">{"Support"}</span>
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
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="doctors" href="#">{"\n          All Doctors\n        "}</a>
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
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="employee">
<i className="ph ph-users-three text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Employee"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="employee" href="#">{"\n          All Employee\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="employee-details" href="#">{"\n          Employee Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="employee-schedule" href="#">{"\n          Employee Schedule\n        "}</a>
</div>
</div>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="prescriptions" href="#">
<i className="ph ph-pill text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Prescriptions"}</span>
</a>
<p className="nav-section nav-text">{"Operations"}</p>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="departments" href="#">
<i className="ph ph-buildings text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Departments"}</span>
</a>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="billing">
<i className="ph ph-credit-card text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Billing"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="invoice" href="#">{"\n          Invoices List\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="invoice-details" href="#">{"\n          Invoice Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="payments-history" href="#">{"\n          Payments History\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="insurance-claims" href="#">{"\n          Insurance Claims\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="insurance-claims-details" href="#">{"\n          Insurance Claims Details\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="inventory">
<i className="ph ph-package text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Inventory"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="inventory" href="#">{"\n          Inventory List\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="inventory" href="#">{"\n          Stock Alerts\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="inventory" href="#">{"\n          Supplies\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="medicine">
<i className="ph ph-first-aid text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Medicine"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="all-templates" href="#">{"\n          All Templates\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="recently-used" href="#">{"\n          Recently Used\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="my-templates" href="#">{"\n          My Templates\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="medicine-details" href="#">{"\n          Medicine Details\n        "}</a>
</div>
</div>
<p className="nav-section nav-text">{"Records & Resources"}</p>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="records">
<i className="ph ph-folder-notch text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Records"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="birth-records" href="#">{"\n          Birth Records\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="record-details" href="#">{"\n          Birth Records Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="birth-audit-history" href="#">{"\n          Birth Audit History\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="death-records" href="#">{"\n          Death Records\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="death-record-details" href="#">{"\n          Death Records Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="death-audit-history" href="#">{"\n          Death Audit History\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="ambulance">
<i className="ph ph-ambulance text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Ambulance"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="ambulance-call-list" href="#">{"\n          Call List\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="ambulance-call-details" href="#">{"\n          Call Details Timeline\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="ambulance-list" href="#">{"\n          Ambulance List\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="ambulance-details" href="#">{"\n          Ambulance Details\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="reports">
<i className="ph ph-chart-bar text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Reports"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="reports-overview" href="#">{"\n          Report Overview\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="appointment-reports" href="#">{"\n          Appointment Report\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="financial-reports" href="#">{"\n          Financial Report\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="inventory-reports" href="#">{"\n          Inventory Reports\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="patient-visit-report" href="#">{"\n          Patient Visit Report\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="bloodbank">
<i className="ph ph-drop text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Blood Bank"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="blood-stock" href="#">{"\n          Blood Stock\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="blood-unit-details" href="#">{"\n          Blood Unit Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="blood-donor" href="#">{"\n          Blood Donor\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="blood-donor-details" href="#">{"\n          Blood Donor Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="blood-issued" href="#">{"\n          Blood Issued\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="add-unit-blood" href="#">{"\n          Add Unit Blood\n        "}</a>
</div>
</div>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="room-allotment">
<i className="ph ph-door text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Room Allotment"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="alloted-rooms" href="#">{"\n          Alloted Rooms\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="alloted-room-details" href="#">{"\n          Alloted Rooms Details\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="room-allotment" href="#">{"\n          Room Allotment\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="rooms-by-department" href="#">{"\n          Rooms by Department\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="add-new-room" href="#">{"\n          Add New Room\n        "}</a>
</div>
</div>
<p className="nav-section nav-text">{"Workspace"}</p>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="email" href="#">
<i className="ph ph-envelope text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Email"}</span>
</a>
<div className="nav-group" data-nav-group="">
<button type="button" data-nav-trigger="" aria-expanded="false" className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="settings">
<i className="ph ph-gear text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap flex-1 text-left">{"Settings"}</span>
<i className="ph ph-caret-down nav-text text-xs flex-shrink-0 transition-transform"></i>
</button>
<div className="nav-text hidden mt-1 ml-9 flex flex-col gap-0.5" data-nav-menu="">
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="settings" href="#">{"\n          General Settings\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="notifications" href="#">{"\n          Notification Settings\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="working-hours" href="#">{"\n          Working Hours\n        "}</a>
<a className="nav-sub px-3 py-1.5 rounded-lg text-xs text-muted hover:text-primary hover:bg-primary-soft transition-colors" data-page="integrations" href="#">{"\n          Integrations\n        "}</a>
</div>
</div>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="support" href="#">
<i className="ph ph-headset text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Support"}</span>
</a>
<a className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" data-page="chat" href="#">
<i className="ph ph-chats text-2xl flex-shrink-0"></i>
<span className="nav-text font-medium whitespace-nowrap">{"Chat"}</span>
</a>
</nav>

<div className="sidebar-footer-mini px-3 py-4 flex flex-col items-center gap-3 border-t border-border-subtle">
<button type="button" aria-label="Help & support" className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-primary hover:bg-primary-soft transition-colors">
<i className="ph ph-question text-lg"></i>
</button>
<span className="text-[10px] font-medium text-faint">{"v1.0"}</span>
</div>

<div className="sidebar-footer-full px-3 pb-4 pt-2 border-t border-border-subtle  bg-primary-soft/60 hover:bg-primary-soft transition-colors">
<a className="flex items-center gap-3 rounded-xl p-3 group" href="#">
<span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
<i className="ph ph-lifebuoy text-lg"></i>
</span>
<span className="min-w-0">
<span className="block text-xs font-semibold text-heading">{"Need help?"}</span>
<span className="block text-[11px] text-muted truncate">{"Visit support center"}</span>
</span>
</a>
</div>
</aside>

</>; }
