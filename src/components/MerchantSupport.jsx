import { useState } from 'react';
import { useStore } from '../context/useStore';

export default function MerchantSupport() {
  const { supportTickets, replyToSupportTicket, updateSupportTicketStatus } = useStore();
  const [selectedId, setSelectedId] = useState(supportTickets[0]?.id || '');
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('All');
  const visible = supportTickets.filter(ticket => filter === 'All' || ticket.status === filter);
  const selected = visible.find(ticket => ticket.id === selectedId) || visible[0];
  const sendReply = event => { event.preventDefault(); if (!reply.trim() || !selected) return; replyToSupportTicket(selected.id, reply.trim()); setReply(''); };
  return <div className="merchant-support-page space-y-6 animate-fadeIn">
    <div className="page-heading"><div><p className="eyebrow">CUSTOMER CARE</p><h1 className="text-2xl font-bold">Support inbox</h1><p>Reply to customer questions and track each conversation to resolution.</p></div></div>
    <div className="support-workspace"><section className="support-inbox"><div className="support-inbox__filters">{['All','Open','In progress','Resolved'].map(status=><button type="button" className={filter===status?'is-active':''} onClick={()=>setFilter(status)} key={status}>{status}</button>)}</div>{visible.length ? visible.map(ticket=><button type="button" key={ticket.id} onClick={()=>setSelectedId(ticket.id)} className={`support-ticket ${selected?.id===ticket.id?'is-selected':''}`}><span><strong>{ticket.subject}</strong><small>{ticket.customerName} · {ticket.orderId || 'General question'}</small></span><b className={`ticket-status ticket-status--${ticket.status.toLowerCase().replace(' ','-')}`}>{ticket.status}</b></button>) : <p className="support-empty">No conversations in this filter.</p>}</section>
    {selected ? <section className="support-conversation"><header><div><p className="eyebrow">{selected.id} · {selected.customerEmail}</p><h2>{selected.subject}</h2></div><select aria-label="Ticket status" value={selected.status} onChange={event=>updateSupportTicketStatus(selected.id,event.target.value)}><option>Open</option><option>In progress</option><option>Resolved</option></select></header>{selected.orderId&&<p className="support-order-ref">Related order: {selected.orderId}</p>}<div className="support-messages">{selected.messages.map((message,index)=><article key={`${message.createdAt}-${index}`} className={`support-message ${message.role==='merchant'?'is-merchant':''}`}><strong>{message.author} <small>{message.role}</small></strong><p>{message.message}</p><time>{new Date(message.createdAt).toLocaleString()}</time></article>)}</div><form className="support-reply" onSubmit={sendReply}><label htmlFor="support-reply">Write a reply</label><textarea id="support-reply" value={reply} onChange={event=>setReply(event.target.value)} required rows="3" placeholder="How can you help this customer?"/><button type="submit" className="primary-action">Send reply</button></form></section> : <section className="support-conversation support-empty"><h2>Your inbox is clear</h2><p>Customer messages will appear here.</p></section>}</div>
  </div>;
}
