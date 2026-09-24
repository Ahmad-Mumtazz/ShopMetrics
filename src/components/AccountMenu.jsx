import { useState } from 'react';

export default function AccountMenu({ user, handleLogout, deleteAccount, onEditProfile }) {
  const [open, setOpen] = useState(false);

  const confirmLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) handleLogout();
  };
  const confirmDelete = () => {
    if (window.confirm('Delete this account and its access? This cannot be undone.')) deleteAccount();
  };

  return <div className="account-menu"><button type="button" className="account-menu__button" onClick={() => setOpen(value => !value)}><span className="merchant-avatar">{user.name.charAt(0)}</span><span>{user.name}</span><span>⌄</span></button>{open && <div className="account-menu__popover"><p>{user.email}</p><button type="button" onClick={() => { setOpen(false); onEditProfile(); }}>Edit profile</button><button type="button" onClick={confirmDelete} className="account-menu__danger">Delete account</button><button type="button" onClick={confirmLogout} className="account-menu__danger">Log out</button></div>}</div>;
}
