import { useState } from 'react';

const defaultPreferences = {
  phone: '',
  birthday: '',
  preferredContact: 'email',
  orderUpdates: true,
  offers: false,
  shopName: '',
  businessPhone: '',
  website: '',
  businessAddress: ''
};

export default function ProfilePage({ user, updateProfile, setActiveTab }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [profile, setProfile] = useState({ ...defaultPreferences, ...(user.profile || {}) });
  const [message, setMessage] = useState('');
  const isMerchant = user.role === 'merchant';
  const setField = (field, value) => setProfile(current => ({ ...current, [field]: value }));

  const saveProfile = (event) => {
    event.preventDefault();
    const result = updateProfile(name.trim(), email.trim(), profile);
    setMessage(result?.success ? 'Your profile and preferences have been saved.' : result?.error || 'Your profile could not be saved.');
  };

  return <section className="profile-page holo-panel">
    <div className="profile-page__heading"><div>
      <p className="eyebrow">Account settings</p>
      <h1>Edit profile</h1>
      <p>Manage your contact details and {isMerchant ? 'store information' : 'shopping preferences'}.</p>
    </div>
      <button type="button" className="hud-button" onClick={() => setActiveTab(isMerchant ? 'Dashboard' : 'Shop')}>Home</button>
    </div>
    <form onSubmit={saveProfile} className="profile-form">
      <section className="profile-form__section">
        <div><h2>Personal details</h2><p>These details identify your account.</p></div>
        <div className="profile-form__grid">
          <label>Full name<input required autoComplete="name" maxLength="80" value={name} onChange={event => setName(event.target.value)} /></label>
          <label>Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label>Phone number<input type="tel" autoComplete="tel" maxLength="30" value={profile.phone} onChange={event => setField('phone', event.target.value)} placeholder="+1 555 0100" /></label>
          <label>Date of birth<input type="date" autoComplete="bday" value={profile.birthday} onChange={event => setField('birthday', event.target.value)} /></label>
        </div>
      </section>

      {isMerchant ? <section className="profile-form__section">
        <div><h2>Business details</h2><p>Help customers recognize and contact your store.</p></div>
        <div className="profile-form__grid">
          <label>Store name<input maxLength="100" value={profile.shopName} onChange={event => setField('shopName', event.target.value)} placeholder="Your shop name" /></label>
          <label>Business phone<input type="tel" maxLength="30" value={profile.businessPhone} onChange={event => setField('businessPhone', event.target.value)} /></label>
          <label>Store website<input type="url" inputMode="url" value={profile.website} onChange={event => setField('website', event.target.value)} placeholder="https://example.com" /></label>
          <label>Business address<input autoComplete="street-address" maxLength="180" value={profile.businessAddress} onChange={event => setField('businessAddress', event.target.value)} placeholder="Street, city, region" /></label>
        </div>
      </section> : <section className="profile-form__section">
        <div><h2>Communication preferences</h2><p>Choose which account messages you want to receive.</p></div>
        <div className="profile-form__grid">
          <label>Preferred contact method<select value={profile.preferredContact} onChange={event => setField('preferredContact', event.target.value)}><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label className="profile-form__check"><input type="checkbox" checked={profile.orderUpdates} onChange={event => setField('orderUpdates', event.target.checked)} /><span><strong>Order and delivery updates</strong><small>Get messages about order status and delivery.</small></span></label>
          <label className="profile-form__check"><input type="checkbox" checked={profile.offers} onChange={event => setField('offers', event.target.checked)} /><span><strong>Offers and product news</strong><small>Receive occasional promotions from this store.</small></span></label>
        </div>
      </section>}

      <div className="profile-form__actions"><button type="submit" className="neon-button">Save changes</button>{message && <p role="status" className="checkout-message">{message}</p>}</div>
    </form>
  </section>;
}
