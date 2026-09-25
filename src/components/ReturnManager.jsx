import { useMemo, useState } from 'react';
import { useStore } from '../context/useStore';

const nextAction = { Requested: ['Approve', 'Approved'], Approved: ['Mark received', 'Received'], Received: ['Issue refund', 'Refunded'] };

export default function ReturnManager() {
  const { returnRequests, updateReturnStatus } = useStore();
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const visibleRequests = useMemo(() => returnRequests.filter(request => filter === 'All' || request.status === filter), [returnRequests, filter]);
  const move = (request, status) => {
    const result = updateReturnStatus(request.id, status);
    setMessage(result.success ? `${request.id} updated to ${status}.` : result.error);
  };

  return <div className="return-manager space-y-6 animate-fadeIn">
    <div className="page-heading"><div><p className="eyebrow">AFTER-SALES</p><h1 className="text-2xl font-bold text-slate-800">Returns & refunds</h1><p className="text-sm text-slate-500">Review requests, receive returned stock, and record refunds.</p></div></div>
    <div className="return-status-summary"><div><span>Awaiting review</span><strong>{returnRequests.filter(item => item.status === 'Requested').length}</strong></div><div><span>Approved</span><strong>{returnRequests.filter(item => item.status === 'Approved').length}</strong></div><div><span>Received</span><strong>{returnRequests.filter(item => item.status === 'Received').length}</strong></div><div><span>Refunded</span><strong>{returnRequests.filter(item => item.status === 'Refunded').length}</strong></div></div>
    <div className="return-manager-toolbar"><div className="return-manager-filter">{['All', 'Requested', 'Approved', 'Received', 'Refunded', 'Declined'].map(status => <button type="button" key={status} className={filter === status ? 'is-active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div><span>{visibleRequests.length} requests</span></div>
    {message && <p className="order-action-message" role="status">{message}</p>}
    <div className="return-request-list">{visibleRequests.length ? visibleRequests.map(request => <article className="return-request-card" key={request.id}>
      <div className="return-request-card__top"><div><p className="eyebrow">{request.id} · {request.orderId}</p><h2>{request.productName}</h2></div><span className={`return-state return-state--${request.status.toLowerCase()}`}>{request.status}</span></div>
      <div className="return-request-card__details"><span><small>Customer</small><strong>{request.customerName}</strong><em>{request.customerEmail}</em></span><span><small>Quantity</small><strong>{request.quantity}</strong></span><span><small>Refund amount</small><strong>${Number(request.refundAmount).toFixed(2)}</strong></span><span><small>Requested</small><strong>{new Date(request.createdAt).toLocaleDateString()}</strong></span></div>
      <div className="return-request-card__reason"><strong>Reason: {request.reason}</strong><p>{request.details || 'No additional details provided.'}</p></div>
      {request.status === 'Requested' && <div className="return-request-card__actions"><button type="button" className="primary-action" onClick={() => move(request, 'Approved')}>Approve return</button><button type="button" className="return-decline-button" onClick={() => { if (window.confirm('Decline this return request?')) move(request, 'Declined'); }}>Decline</button></div>}
      {nextAction[request.status] && request.status !== 'Requested' && <div className="return-request-card__actions"><button type="button" className="primary-action" onClick={() => move(request, nextAction[request.status][1])}>{nextAction[request.status][0]}</button>{request.status === 'Approved' && <span>Marking received returns the units to available stock.</span>}</div>}
      {request.status === 'Declined' && <p className="return-request-card__closed">This request was declined.</p>}
      {request.status === 'Refunded' && <p className="return-request-card__closed">Refund recorded. Returned units are back in inventory.</p>}
    </article>) : <div className="return-empty"><span>↩</span><h2>No return requests here</h2><p>Customer return requests will appear in this workspace.</p></div>}</div>
  </div>;
}
