import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchOsmRestaurant, isOsmRestaurantId } from '../services/restaurantApi';
import { listingId, restaurantIdentity, supabase } from '../services/ownerMenus';
import RestaurantLocationFields, { readRestaurantLocation } from '../components/RestaurantLocationFields';
import { authErrorMessage } from '../utils/authErrorMessage';

const emptyItem = { name: '', description: '', category: '', price: '', image_url: '', available: true };
const claimFields = 'id, restaurant_name, restaurant_osm_type, restaurant_osm_id, status, address, latitude, longitude';

function OwnerSignIn() {
  const [registering, setRegistering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const credentials = { email: fields.get('email').trim(), password: fields.get('password') };
    setBusy(true);
    setStatus('');
    setError('');
    try {
      const response = registering
        ? await supabase.auth.signUp({
          ...credentials, options: { emailRedirectTo: window.location.href, data: { account_type: 'owner' } },
        })
        : await supabase.auth.signInWithPassword(credentials);
      if (response.error) throw response.error;
      if (registering && !response.data.session) setStatus('Check your email to confirm your account.');
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="owner-panel owner-form" onSubmit={submit}>
      <h2>{registering ? 'Create an owner account' : 'Sign in to your owner account'}</h2>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" minLength={registering ? 8 : undefined}
        autoComplete={registering ? 'new-password' : 'current-password'} required /></label>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
      <div className="owner-actions">
        <button className="btn btn-primary" disabled={busy}>{registering ? 'Create account' : 'Sign in'}</button>
        <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => {
          setRegistering(value => !value);
          setError('');
          setStatus('');
        }}>{registering ? 'Back to sign in' : 'Create an account'}</button>
      </div>
    </form>
  );
}

function ClaimForm({ restaurantId, onSubmit, busy }) {
  const [listing, setListing] = useState(null);
  useEffect(() => {
    if (!isOsmRestaurantId(restaurantId)) return;
    const controller = new AbortController();
    fetchOsmRestaurant(restaurantId, controller.signal).then(
      restaurant => { if (!controller.signal.aborted) setListing({ restaurant }); },
      () => { if (!controller.signal.aborted) setListing({ error: true }); }
    );
    return () => controller.abort();
  }, [restaurantId]);

  if (!isOsmRestaurantId(restaurantId)) return null;
  if (!listing) return <p role="status">Checking the Cebu City restaurant listing…</p>;
  if (!listing.restaurant) return <p role="alert">{listing.error
    ? 'The restaurant listing could not be checked. Reload to retry.'
    : 'This restaurant could not be found in Cebu City.'}</p>;

  return (
    <form className="owner-panel owner-form" onSubmit={event => {
      event.preventDefault();
      const evidence = new FormData(event.currentTarget).get('evidence').trim();
      onSubmit({
        ...restaurantIdentity(restaurantId),
        restaurant_name: listing.restaurant.name,
        evidence,
      });
    }}>
      <h2>Claim {listing.restaurant.name}</h2>
      <label>Proof you represent this restaurant
        <textarea name="evidence" minLength={20} maxLength={3000} required rows={4}
          placeholder="Include an official business website and a business contact the reviewer can use." />
      </label>
      <button className="btn btn-primary" disabled={busy}>Submit for review</button>
    </form>
  );
}

function ListingForm({ claim, run, busy, afterSubmit }) {
  const [location, setLocation] = useState(claim?.address ? claim : null);
  const id = claim ? listingId(claim) : null;
  useEffect(() => {
    if (!isOsmRestaurantId(id) || claim.address) return;
    const controller = new AbortController();
    fetchOsmRestaurant(id, controller.signal).then(restaurant => {
      if (!controller.signal.aborted && restaurant) {
        setLocation({ address: restaurant.address, latitude: restaurant.lat, longitude: restaurant.lon });
      }
    }, () => {});
    return () => controller.abort();
  }, [id, claim?.address]);

  function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    run(async () => {
      const values = readRestaurantLocation(fields);
      const { error } = claim
        ? await supabase.rpc('publish_restaurant_location', { target_claim: claim.id, ...values })
        : await supabase.rpc('submit_restaurant_listing', {
          listing_name: fields.get('name').trim(), listing_evidence: fields.get('evidence').trim(), ...values,
        });
      if (error) throw error;
      afterSubmit();
    }, claim ? 'Location published to the Cebu City map.' : 'Restaurant submitted for review.');
  }

  return (
    <form className="owner-panel owner-form" onSubmit={submit}>
      <h2>{claim ? `Location for ${claim.restaurant_name}` : 'Add a restaurant to the map'}</h2>
      {!claim && <>
        <p>For a restaurant already on the map, open its listing and claim it there.</p>
        <label>Restaurant name<input name="name" maxLength={200} required /></label>
        <label>Proof you represent this restaurant
          <textarea name="evidence" rows={3} minLength={20} maxLength={3000} required
            placeholder="Include an official business website and a business contact for the reviewer." />
        </label>
      </>}
      <p>Enter the coordinates of the restaurant entrance in Cebu City.</p>
      <RestaurantLocationFields key={location ? 'prefilled' : 'empty'} location={location} busy={busy} />
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {claim ? 'Publish location' : 'Submit restaurant for review'}
      </button>
    </form>
  );
}

function MenuEditor({ claim, run, busy }) {
  const [items, setItems] = useState(null);
  const [item, setItem] = useState(emptyItem);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    supabase.from('restaurant_menu_drafts').select('*').eq('claim_id', claim.id)
      .order('name').abortSignal(controller.signal).then(({ data, error }) => {
        if (controller.signal.aborted) return;
        if (error) setLoadError(error.message);
        else setItems(data);
      });
    return () => controller.abort();
  }, [claim.id]);

  function setField(name, value) {
    setItem(previous => ({ ...previous, [name]: value }));
  }

  function save(event) {
    event.preventDefault();
    const { id, claim_id, ...fields } = item;
    const values = {
      ...fields, name: fields.name.trim(), category: fields.category.trim(),
      description: fields.description.trim(), image_url: fields.image_url.trim() || null,
      price: Number(fields.price),
    };
    run(async () => {
      const query = id
        ? supabase.from('restaurant_menu_drafts').update(values).eq('id', id).eq('claim_id', claim.id)
        : supabase.from('restaurant_menu_drafts').insert({ ...values, claim_id: claim.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      setItems(previous => [...previous.filter(entry => entry.id !== data.id), data]
        .sort((first, second) => first.name.localeCompare(second.name)));
      setItem(emptyItem);
    }, 'Draft saved.');
  }

  function remove(id) {
    run(async () => {
      const { error } = await supabase.from('restaurant_menu_drafts').delete()
        .eq('id', id).eq('claim_id', claim.id).select('id').single();
      if (error) throw error;
      setItems(previous => previous.filter(entry => entry.id !== id));
      setItem(previous => previous.id === id ? emptyItem : previous);
    }, 'Dish removed from the draft.');
  }

  function publish(enabled) {
    run(async () => {
      const { error } = await supabase.rpc('set_restaurant_menu_published', {
        target_claim: claim.id, publish_menu: enabled,
      });
      if (error) throw error;
    }, enabled ? 'Menu published.' : 'Menu unpublished.');
  }

  if (loadError) return <p role="alert">{loadError}</p>;
  if (!items) return <p role="status">Loading menu draft…</p>;

  return (
    <section className="owner-panel owner-form" aria-label={`Menu for ${claim.restaurant_name}`}>
      <h2>{claim.restaurant_name} menu</h2>
      <p>Draft changes appear on your public listing after you publish.</p>
      <div className="owner-actions">
        <button type="button" className="btn btn-primary" disabled={busy || !items.length} onClick={() => publish(true)}>Publish menu</button>
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => publish(false)}>Unpublish menu</button>
      </div>
      <ul className="owner-list">
        {items.map(entry => (
          <li key={entry.id}>
            <span>{entry.name} · {entry.category}{!entry.available && ' · Unavailable'}</span>
            <div className="owner-actions">
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
                onClick={() => setItem({ ...entry, image_url: entry.image_url ?? '' })}>Edit</button>
              <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => remove(entry.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={save} className="owner-form">
        <h3>{item.id ? `Edit ${items.find(entry => entry.id === item.id)?.name ?? 'dish'}` : 'Add a dish'}</h3>
        <label>Dish name<input required maxLength={120} value={item.name} onChange={event => setField('name', event.target.value)} /></label>
        <label>Category<input required maxLength={80} value={item.category} onChange={event => setField('category', event.target.value)} /></label>
        <label>Price (₱)<input required type="number" min="0" max="99999999.99" step="0.01" value={item.price} onChange={event => setField('price', event.target.value)} /></label>
        <label>Description<textarea rows={3} maxLength={1500} value={item.description} onChange={event => setField('description', event.target.value)} /></label>
        <label>Photo URL<input type="url" pattern="https://.+" maxLength={2048} value={item.image_url} onChange={event => setField('image_url', event.target.value)} /></label>
        <label className="owner-checkbox"><input type="checkbox" checked={item.available} onChange={event => setField('available', event.target.checked)} /> Available</label>
        <div className="owner-actions">
          <button className="btn btn-primary" disabled={busy}>Save draft</button>
          {item.id && <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setItem(emptyItem)}>Cancel edit</button>}
        </div>
      </form>
    </section>
  );
}

function OwnerDashboard({ user, restaurantId }) {
  const [claims, setClaims] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [reviewQueue, setReviewQueue] = useState(null);
  const [addingListing, setAddingListing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    supabase.from('restaurant_claims').select(claimFields)
      .eq('owner_id', user.id).order('created_at', { ascending: false }).abortSignal(controller.signal)
      .then(({ data, error }) => {
        if (controller.signal.aborted) return;
        if (error) setError(error.message);
        else setClaims(data);
      });
    async function loadReviewQueue() {
      const { data: reviewer, error: accessError } = await supabase.from('restaurant_claim_reviewers')
        .select('user_id').eq('user_id', user.id).abortSignal(controller.signal).maybeSingle();
      if (controller.signal.aborted) return;
      if (accessError) { setError(accessError.message); return; }
      if (!reviewer) { setReviewQueue(null); return; }
      const { data, error } = await supabase.from('restaurant_claims')
        .select(claimFields + ', evidence')
        .eq('status', 'pending').neq('owner_id', user.id).order('created_at').abortSignal(controller.signal);
      if (controller.signal.aborted) return;
      if (error) setError(error.message);
      else setReviewQueue(data);
    }
    loadReviewQueue();
    return () => controller.abort();
  }, [user.id, refreshCount]);

  async function run(action, message) {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await action();
      setStatus(message);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  const approved = claims?.filter(claim => claim.status === 'approved') ?? [];
  const selected = approved.find(claim => claim.id === selectedId) ?? approved[0];
  const hasActiveClaim = claims?.some(claim => claim.status !== 'rejected' &&
    restaurantId === listingId(claim));

  function review(claim, decision) {
    run(async () => {
      const id = listingId(claim);
      if (decision === 'approved' && isOsmRestaurantId(id)) {
        const listing = await fetchOsmRestaurant(id);
        if (!listing) throw new Error('Approval requires a current Cebu City restaurant listing.');
      }
      const { error } = await supabase.from('restaurant_claims').update({ status: decision })
        .eq('id', claim.id).eq('status', 'pending').select('id').single();
      if (error) throw error;
      setReviewQueue(previous => previous.filter(entry => entry.id !== claim.id));
    }, decision === 'approved' ? 'Claim approved.' : 'Claim rejected.');
  }

  return <>
    <div className="owner-actions">
      <span>{user.email}</span>
      <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => run(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }, 'Signed out.')}>Sign out</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {status && <p role="status">{status}</p>}
    <section className="owner-panel owner-form">
      <h2>Your restaurant claims</h2>
      <p>Claim a restaurant from the Cebu City map, or submit a restaurant that hasn’t been listed yet.</p>
      <div className="owner-actions">
        <Link to="/explore?view=map" className="btn btn-secondary btn-sm">Find a restaurant</Link>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy} aria-expanded={addingListing}
          onClick={() => setAddingListing(value => !value)}>{addingListing ? 'Close new listing form' : 'Add a restaurant'}</button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy}
          onClick={() => { setError(''); setRefreshCount(value => value + 1); }}>Refresh claims</button>
      </div>
      {claims?.length === 0 && <p>No claims submitted.</p>}
      <ul className="owner-list">
        {claims?.map(claim => (
          <li key={claim.id}>
            <span>{claim.restaurant_name} · {claim.status}</span>
            {claim.status === 'approved' && <button type="button" className="btn btn-secondary btn-sm"
              disabled={busy} aria-pressed={selected?.id === claim.id} onClick={() => setSelectedId(claim.id)}>Manage menu</button>}
          </li>
        ))}
      </ul>
    </section>
    {addingListing && <ListingForm run={run} busy={busy} afterSubmit={() => {
      setAddingListing(false);
      setRefreshCount(value => value + 1);
    }} />}
    {claims && !hasActiveClaim && <ClaimForm key={restaurantId} restaurantId={restaurantId} busy={busy} onSubmit={values => run(async () => {
      const { data, error } = await supabase.from('restaurant_claims').insert(values)
        .select(claimFields).single();
      if (error) throw error;
      setClaims(previous => [data, ...previous]);
    }, 'Claim submitted for review.')} />}
    {selected && <>
      <ListingForm key={`location-${selected.id}`} claim={selected} busy={busy} run={run}
        afterSubmit={() => setRefreshCount(value => value + 1)} />
      <MenuEditor key={selected.id} claim={selected} busy={busy} run={run} />
    </>}
    {reviewQueue && (
      <section className="owner-panel owner-form">
        <h2>Claims to review</h2>
        <p>Confirm that the claimant represents the restaurant before approving.</p>
        {!reviewQueue.length && <p>No pending claims.</p>}
        <ul className="owner-list">
          {reviewQueue.map(claim => (
            <li key={claim.id}>
              <div className="owner-claim-evidence">
                <strong>{claim.restaurant_name}</strong>{' '}
                {claim.address ? <a target="_blank" rel="noreferrer"
                  href={`https://www.openstreetmap.org/?mlat=${claim.latitude}&mlon=${claim.longitude}#map=18/${claim.latitude}/${claim.longitude}`}>
                  Check map location
                </a> : <Link to={`/restaurant/${listingId(claim)}`}>View listing</Link>}
                {claim.address && <p>{claim.address}</p>}
                <p>{claim.evidence}</p>
              </div>
              <div className="owner-actions">
                <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => review(claim, 'approved')}>Approve</button>
                <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => review(claim, 'rejected')}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )}
  </>;
}

export default function OwnerPortal({ session }) {
  const [params] = useSearchParams();

  return (
    <section className="container section owner-portal">
      <h1 className="section-title">Restaurant <em>owner portal</em></h1>
      {!supabase ? <p>Owner accounts are unavailable until FoodFinder is connected to Supabase.</p>
        : session === undefined ? <p role="status">Checking your session…</p>
          : session ? <OwnerDashboard key={session.user.id} user={session.user} restaurantId={params.get('claim')} />
            : <OwnerSignIn />}
    </section>
  );
}
