import {Fragment} from 'react';
export default function TreatmentRows({rows,search,page,pageSize}) {
 const visible=rows.filter(row=>row.text.toLowerCase().includes(search.toLowerCase().trim())).slice(page*pageSize,(page+1)*pageSize);
 return <tbody>{visible.map(row=><Fragment key={row.text}>{row.content}</Fragment>)}{!visible.length&&<tr><td colSpan={7} className="p-5 text-center text-muted">No treatments found.</td></tr>}</tbody>;
}
