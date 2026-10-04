import { Fragment } from 'react';
import recordText from './record-text.json';
export function filterRecords(rows, search) {return rows.filter(row => row.toLowerCase().includes(search.toLowerCase().trim()));}
export function RecordRows({rows, search, page, pageSize}) {
 const filtered = rows.filter(row => row.text.toLowerCase().includes(search.toLowerCase().trim()));
 return <tbody>{filtered.slice(page * pageSize, (page + 1) * pageSize).map(row => <Fragment key={row.text}>{row.content}</Fragment>)}{!filtered.length && <tr><td colSpan={8} className="p-5 text-center text-muted">No records found.</td></tr>}</tbody>;
}
export function RecordCount({tab, rows, search, page, pageSize}) {
 const count = filterRecords(rows || recordText[tab] || [], search).length;
 return <>{count ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, count)} of {count}</>;
}
