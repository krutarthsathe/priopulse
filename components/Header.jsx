'use client';
import {DEMO_USERS, ROLE_LABELS, setCurrentUser, useCurrentUser} from '../lib/current-user';
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
<div className="p-2 border-b border-border">
<p className="px-3 pt-1 pb-1.5 text-[11px] font-semibold text-faint uppercase tracking-wide">{"Switch demo user"}</p>
{DEMO_USERS.map(demo => <button key={demo.id} type="button" data-demo-user={demo.id} aria-pressed={demo.id === user.id} onClick={() => setCurrentUser(demo.id)} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-text hover:bg-primary/5 transition-colors text-left">
<i className={"ph text-lg " + (demo.id === user.id ? "ph-check-circle text-primary" : "ph-circle text-faint")}></i>
<span className="flex-1 text-sm">{demo.name}</span>
<span className="text-[11px] text-muted">{ROLE_LABELS[demo.role]}</span>
</button>)}
</div>
<div className="p-2">
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text hover:bg-primary/5 transition-colors" href="#">
<i className="ph ph-user-circle text-lg"></i>
<span className="text-sm">{"My Profile"}</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text hover:bg-primary/5 transition-colors" href="#">
<i className="ph ph-gear text-lg"></i>
<span className="text-sm">{"Settings"}</span>
</a>
</div>
<div className="p-2 border-t border-border">
<button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-danger hover:bg-danger-soft dark:hover:bg-danger-soft transition-colors">
<i className="ph ph-sign-out text-lg"></i>
<span className="text-sm">{"Logout"}</span>
</button>
</div>
</div>
</div>
</div>
</div>
</header>

</>; }
