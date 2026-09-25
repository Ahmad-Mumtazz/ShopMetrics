import { useEffect, useRef, useState } from 'react';

export default function AccountMenu({ user, handleLogout, deleteAccount, onEditProfile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user.name?.trim() || user.email || 'Account';

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = event => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const confirmLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) handleLogout();
  };
  const confirmDelete = () => {
    if (window.confirm('Delete this account and its access? This cannot be undone.')) deleteAccount();
  };

  return <div className="account-menu" ref={menuRef}>
    <button type="button" className="account-menu__button" style={user.role === 'merchant' ? { color: 'var(--seller-ink, #f4fff8)' } : undefined} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(value => !value)}>
      <span className="merchant-avatar">{displayName.charAt(0).toUpperCase()}</span><span>{displayName}</span><span aria-hidden="true">⌄</span>
    </button>
    {open && <div className="account-menu__popover" id="account-menu-popover">
      <p>{user.email}</p>
      <button type="button" onClick={() => { setOpen(false); onEditProfile(); }}>Edit profile</button>
      <button type="button" onClick={confirmDelete} className="account-menu__danger">Delete account</button>
      <button type="button" onClick={confirmLogout} className="account-menu__danger">Log out</button>
    </div>}
  </div>;
}
