import { useState } from 'react';

export default function ProfilePage({ user, updateProfile, setActiveTab }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState('');

  const saveProfile = (event) => {
    event.preventDefault();
    updateProfile(name.trim(), email.trim());
    setMessage('Profile updated successfully.');
  };

  return <section className="profile-page holo-panel"><div className="profile-page__heading"><div><p className="eyebrow">Account settings</p><h1>Edit profile</h1><p>Update the identity shown in your ShopMetrics workspace.</p></div><button type="button" className="hud-button" onClick={() => setActiveTab(user.role === 'customer' ? 'Shop' : 'Dashboard')}>Home</button></div><form onSubmit={saveProfile} className="profile-form"><label>Display name<input required value={name} onChange={event => setName(event.target.value)} /></label><label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} /></label><button type="submit" className="neon-button">Save profile</button>{message && <p className="checkout-message">{message}</p>}</form></section>;
}
