'use client';
import {DEMO_USERS, useCurrentUser} from '../lib/current-user';
export default function Header({search, setSearch, setPage, searchLabel = "Global patient search", searchPlaceholder = "Search patients, doctors, records…"}) { const user = useCurrentUser() ?? DEMO_USERS[0]; return <>
<header id="topbar" data-scrolled="false" className="fixed top-0 right-0 z-30 h-16 bg-white/60 dark:bg-w1/50 backdrop-blur-xl border-b border-border-subtle left-0 lg:left-64 transition-all duration-300 data-[scrolled=true]:shadow-sm">
<div className="flex items-center justify-between h-full gap-2 px-4 lg:px-6">

<div className="flex items-center gap-2 min-w-0">

<button id="sidebar-toggle" className="topbar-icon-btn flex w-10 h-10" aria-label="Toggle sidebar">
<i className="ph ph-list text-xl"></i>
</button>
<div className="topbar-divider hidden md:block mx-1"></div>

<div className="topbar-search relative hidden md:flex items-center w-64 xl:w-80 h-10 px-3 rounded-xl bg-subtle border border-transparent group">
<i className="ph ph-magnifying-glass text-faint text-lg group-focus-within:text-primary transition-colors flex-shrink-0"></i>
<input id="topbar-search" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} aria-label={searchLabel} type="text" placeholder={searchPlaceholder} className="flex-1 min-w-0 h-full bg-transparent px-2.5 text-sm text-text placeholder:text-faint focus:outline-none" />
<kbd className="kbd-hint hidden lg:inline-flex">{"/"}</kbd>
</div>
</div>

<div className="flex items-center gap-0.5 sm:gap-1">

<button id="theme-toggle" className="topbar-icon-btn size-9 md:size-10" aria-label="Toggle theme">
<i id="theme-icon" className="ph ph-moon text-xl"></i>
</button>

<button className="topbar-icon-btn hidden sm:flex w-10 h-10" aria-label="Refresh">
<i className="ph ph-arrows-clockwise text-xl"></i>
</button>

<div className="relative">
<button id="notifications-btn" className="topbar-icon-btn relative w-10 h-10" aria-label="Notifications">
<i className="ph ph-bell text-xl"></i>
<span className="topbar-badge absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-[10px] font-bold leading-none text-white flex items-center justify-center">{"3"}</span>
</button>

<div id="notifications-dropdown" className="dropdown-menu fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 bg-w1 rounded-2xl shadow-xl border border-border hidden origin-top-right z-50">
<div className="p-4 border-b border-border flex items-center justify-between">
<h3 className="font-semibold text-heading">{"Notifications"}</h3>
<button className="text-xs text-primary hover:text-primary-strong font-medium">{"\n              Mark all read\n            "}</button>
</div>
<div className="p-2 max-h-72 overflow-y-auto space-y-1">
<div className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
<div className="size-9 md:size-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-check-circle text-primary"></i>
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-heading">{"New Appointment"}</p>
<p className="text-xs text-muted mt-0.5">{"\n                  Kathryn Murphy scheduled for 10:00 AM\n                "}</p>
<p className="text-[11px] text-faint mt-1">{"2 min ago"}</p>
</div>
</div>
<div className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
<div className="size-9 md:size-10 rounded-xl bg-warning-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-warning text-warning"></i>
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-heading">{"Low Stock Alert"}</p>
<p className="text-xs text-muted mt-0.5">{"\n                  Surgical masks below minimum\n                "}</p>
<p className="text-[11px] text-faint mt-1">{"15 min ago"}</p>
</div>
</div>
<div className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
<div className="size-9 md:size-10 rounded-xl bg-info-soft dark:bg-info-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-user-plus text-info"></i>
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-heading">{"New Patient"}</p>
<p className="text-xs text-muted mt-0.5">{"Robert Johnson added"}</p>
<p className="text-[11px] text-faint mt-1">{"1 hour ago"}</p>
</div>
</div>
</div>
<div className="p-3 border-t border-border">
<button className="w-full text-center text-xs font-medium text-primary hover:text-primary-strong">{"\n              View all notifications\n            "}</button>
</div>
</div>
</div>
<div className="topbar-divider mx-1.5 hidden sm:block"></div>

<div className="relative">
<button type="button" aria-label="Profile menu" id="profile-btn" className="flex items-center gap-2 sm:gap-2.5 h-11 pl-1 pr-2 sm:pr-2.5 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer">
<div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-1 ring-offset-transparent">
<img src={user.image} alt={user.name} className="w-full h-full object-cover" />
</div>
<div className="hidden lg:block text-left leading-tight">
<p className="text-sm font-semibold text-heading">{user.name}</p>
<p className="text-[11px] text-muted">{user.title}</p>
</div>
<i className="ph ph-caret-down text-faint hidden sm:block text-sm"></i>
</button>

<div id="profile-dropdown" className="dropdown-menu fixed right-2 top-16 w-64 sm:absolute sm:right-0 sm:top-full sm:mt-3 bg-w1 rounded-2xl shadow-xl border border-border hidden origin-top-right z-50">
<div className="p-4 border-b border-border">
<div className="flex items-center gap-2 md:gap-3">
<div className="size-9 md:size-12 rounded-full overflow-hidden ring-2 ring-primary">
<img src={user.image} alt={user.name} className="w-full h-full object-cover" />
</div>
<div>
<p className="font-semibold text-heading">{user.name}</p>
<p className="text-xs text-muted">{user.email}</p>
</div>
</div>
</div>
<div className="px-4 py-3 border-b border-border bg-primary/5"><span className="inline-flex items-center gap-2 text-xs font-medium text-primary"><i className="ph ph-first-aid" /> {user.title}</span><p className="text-xs text-muted mt-1">Patient follow-up workspace</p></div>
<div className="p-2">
<a className="flex items-center gap-3 px-3 py-3 rounded-xl text-text hover:bg-primary/5 transition-colors" href="/patients"><i className="ph ph-users text-lg text-primary" /><span className="text-sm">Patient call list</span><i className="ph ph-arrow-up-right ml-auto text-faint" /></a>
<a className="flex items-center gap-3 px-3 py-3 rounded-xl text-text hover:bg-primary/5 transition-colors" href="/calls"><i className="ph ph-phone-call text-lg text-primary" /><span className="text-sm">Calls &amp; Review</span><i className="ph ph-arrow-up-right ml-auto text-faint" /></a>
<a className="flex items-center gap-3 px-3 py-3 rounded-xl text-text hover:bg-primary/5 transition-colors" href="/audit-log"><i className="ph ph-clipboard-text text-lg text-primary" /><span className="text-sm">Audit Log</span><i className="ph ph-arrow-up-right ml-auto text-faint" /></a>
</div>
</div>
</div>
</div>
</div>
</header>

</>; }
