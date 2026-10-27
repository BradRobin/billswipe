import { useRef, useState } from 'react';
import {
  FEED, SEED_HISTORY, SEED_MY_BILLS, CATEGORIES, PAYEE_TYPES, DAILY_UPLOAD_LIMIT, REFS,
} from './data.js';

const fmt = (n) => 'KES ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const pct = (a, b) => Math.min(100, Math.round((a / b) * 100)) + '%';
const EMPTY_FORM = { photo: false, amount: '', title: '', cat: 'Rent', payeeType: 'Paybill', account: '', note: '' };
const STATUS_CLASS = { 'In review': 'review', Live: 'live', 'Partly funded': 'partly', Paid: 'paid', Expired: '' };

const Icon = {
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  ),
  x: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  check: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
  ),
  camera: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A7AC9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
  ),
  clock: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></svg>
  ),
};

export default function App() {
  const [mode, setMode] = useState('pay');
  const [payView, setPayView] = useState('feed');
  const [upView, setUpView] = useState('mybills');
  const [overlay, setOverlay] = useState(null);

  const [skipped, setSkipped] = useState([]);
  const [extra, setExtra] = useState({});
  const [reported, setReported] = useState([]);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const [pick, setPick] = useState('full');
  const [method, setMethod] = useState('mpesa');
  const [anon, setAnon] = useState(true);
  const [lastPaid, setLastPaid] = useState(null);
  const [refN, setRefN] = useState(0);
  const [history, setHistory] = useState(SEED_HISTORY);

  const [myBills, setMyBills] = useState(SEED_MY_BILLS);
  const [submittedToday, setSubmittedToday] = useState(0);
  const [form, setFormState] = useState(EMPTY_FORM);
  const setForm = (patch) => setFormState((f) => ({ ...f, ...patch }));

  // Feed
  const deck = FEED.map((b) => ({ ...b, raised: b.raised + (extra[b.id] || 0) }))
    .filter((b) => !skipped.includes(b.id) && b.raised < b.amount);
  const cur = deck[0] || null;
  const remaining = cur ? cur.amount - cur.raised : 0;

  const amtOpts = [{ key: 'full', label: 'Full balance', amt: remaining }]
    .concat([10000, 5000, 1000].filter((v) => v < remaining).map((v) => ({ key: String(v), label: 'Chip in', amt: v })))
    .slice(0, 4);
  const pickKey = amtOpts.some((o) => o.key === pick) ? pick : 'full';
  const payAmt = (amtOpts.find((o) => o.key === pickKey) || { amt: remaining }).amt;
  const isMpesa = method === 'mpesa';

  const skip = () => cur && setSkipped((s) => s.concat(cur.id));
  const openConfirm = () => { setPick('full'); setOverlay('confirm'); };

  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    setDragging(true);
  };
  const onPointerMove = (e) => { if (dragStart.current !== null) setDx(e.clientX - dragStart.current); };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    if (dx > 100) openConfirm();
    else if (dx < -100) skip();
    setDx(0);
  };

  const completePay = () => {
    if (!cur) return;
    const ref = REFS[refN % REFS.length];
    const fully = cur.raised + payAmt >= cur.amount;
    setExtra((x) => ({ ...x, [cur.id]: (x[cur.id] || 0) + payAmt }));
    setSkipped((s) => s.concat(cur.id));
    setRefN((n) => n + 1);
    setHistory((h) => [{ id: 'p' + refN, title: cur.title, payee: cur.payee, amount: payAmt, method: isMpesa ? 'M-Pesa' : 'Card', when: 'Just now', anon }].concat(h));
    setLastPaid({
      amountText: fmt(payAmt),
      headline: fully ? 'Bill fully paid' : 'Paid towards this bill',
      body: 'Sent to ' + cur.payee + '. ' + (anon ? 'The recipient has been notified. Your name stays hidden.' : 'The recipient has been notified with your name.'),
      ref: (isMpesa ? 'M-Pesa ref ' : 'Card ref ') + ref,
    });
    setOverlay('paid');
  };

  // Upload
  const left = Math.max(0, DAILY_UPLOAD_LIMIT - submittedToday);
  const valid = form.photo && Number(form.amount.replace(/,/g, '')) > 0 && form.title.trim() && form.account.trim() && left > 0;
  const accountLabel = form.payeeType === 'Paybill' ? 'Paybill and account number' : form.payeeType === 'Till' ? 'Till number' : "Landlord's M-Pesa number";
  const accountPlaceholder = form.payeeType === 'Paybill' ? 'e.g. 123456 · account no.' : form.payeeType === 'Till' ? 'e.g. 987654' : 'e.g. 07XX XXX XXX';

  const submit = () => {
    if (!valid) return;
    setMyBills((b) => [{ id: 'n' + submittedToday, title: form.title.trim(), cat: form.cat, amount: Number(form.amount.replace(/,/g, '')), raised: 0, status: 'In review' }].concat(b));
    setSubmittedToday((n) => n + 1);
    setFormState(EMPTY_FORM);
    setUpView('submitted');
  };

  const isPay = mode === 'pay';
  const tabs = isPay
    ? [{ label: 'Bill feed', on: payView === 'feed', go: () => { setPayView('feed'); setOverlay(null); } },
       { label: 'Paid history', on: payView === 'history', go: () => { setPayView('history'); setOverlay(null); } }]
    : [{ label: 'My bills', on: upView !== 'form', go: () => setUpView('mybills') },
       { label: 'New bill', on: upView === 'form', go: () => setUpView('form') }];

  const histTotal = history.reduce((a, h) => a + h.amount, 0);

  return (
    <div className="stage">
      <div className="phone">
        <header className="header">
          <div className="brand-row">
            <div className="logo">Bill<span>Swipe</span></div>
            <div className="pill-tag">Prototype · KES</div>
          </div>
          <div className="seg" role="group" aria-label="Mode">
            <button type="button" className={isPay ? 'on' : ''} onClick={() => setMode('pay')}>I'm paying</button>
            <button type="button" className={!isPay ? 'on' : ''} onClick={() => { setMode('upload'); setOverlay(null); }}>I need a bill paid</button>
          </div>
        </header>

        <main className="main">
          {isPay && payView === 'feed' && (cur ? (
            <div className="stack">
              <div className="meta-row">
                <span>{deck.length} {deck.length === 1 ? 'bill' : 'bills'} waiting</span>
                <span>Drag right to pay · left to skip</span>
              </div>
              <article
                className={'card' + (dragging ? ' dragging' : '')}
                style={{ transform: `translateX(${dx}px) rotate(${(dx / 22).toFixed(2)}deg)`, transition: dragging ? 'none' : 'transform .25s ease' }}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
              >
                <div className="stamp pay" style={{ opacity: Math.max(0, Math.min(1, dx / 100)) }}>PAY</div>
                <div className="stamp skip" style={{ opacity: Math.max(0, Math.min(1, -dx / 100)) }}>SKIP</div>
                <div className="doc">
                  <div className="doc-head"><strong>{cur.docHead}</strong><span className="redacted-tag">Auto-redacted</span></div>
                  <div className="doc-billed"><span>Billed to</span><span className="bar" style={{ width: 92 }} /><span className="bar" style={{ width: 54 }} /></div>
                  {cur.docRows.map(([l, v]) => (
                    <div className="doc-row" key={l}><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div className="doc-total"><span>TOTAL DUE</span><span>{cur.docTotal}</span></div>
                </div>
                <div className="card-body">
                  <div className="cat-row"><span className="cat">{cur.cat}</span><span>{cur.age}</span></div>
                  <div className="big-amount">{fmt(remaining)}</div>
                  <div><div className="title">{cur.title}</div><div className="sub">{cur.place}</div></div>
                  <div className="payee">{Icon.shield}<span>{cur.payeeLine}</span></div>
                  <p className="note">{cur.note}</p>
                  <div className="progress"><div style={{ width: pct(cur.raised, cur.amount) }} /></div>
                  <div className="meta-row">
                    <span>{cur.raised > 0 ? `${fmt(cur.raised)} raised of ${fmt(cur.amount)}` : 'No payments yet'}</span>
                    <span>{cur.seen} people have seen this</span>
                  </div>
                </div>
              </article>
              <div className="actions">
                <div className="action"><button type="button" className="round skip" aria-label="Skip this bill" onClick={skip}>{Icon.x}</button>Skip</div>
                <div className="action"><button type="button" className="round pay" aria-label="Pay this bill" onClick={openConfirm}>{Icon.check()}</button>Pay</div>
              </div>
              <button type="button" className="link-btn" onClick={() => !reported.includes(cur.id) && setReported((r) => r.concat(cur.id))}>
                {reported.includes(cur.id) ? 'Reported – thanks, we will review it' : 'Report this bill'}
              </button>
            </div>
          ) : (
            <div className="empty">
              <h2>You've seen every bill</h2>
              <p className="muted-p">New bills go live after review. We'll send a notification when more are waiting.</p>
              <button type="button" className="btn-primary pill" onClick={() => { setSkipped([]); setExtra({}); }}>Restart the demo feed</button>
            </div>
          ))}

          {isPay && payView === 'history' && (
            <div className="stack">
              <div className="summary">
                <div className="label">You've paid</div>
                <div className="value">{fmt(histTotal)}</div>
                <div className="label">across {history.length} bills</div>
              </div>
              <div>
                {history.map((h) => (
                  <div className="list-row" key={h.id}>
                    <div><div className="strong">{h.title}</div><div className="small">To {h.payee} · {h.method} · {h.anon ? 'Anonymous' : 'Name shown'}</div></div>
                    <div className="right"><div className="strong">{fmt(h.amount)}</div><div className="small">{h.when}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isPay && upView === 'mybills' && (
            <div className="stack">
              <button type="button" className="upload-cta" onClick={() => setUpView('form')}>{Icon.plus} Upload a bill</button>
              <div className="hint">{left} of {DAILY_UPLOAD_LIMIT} uploads left today</div>
              {myBills.map((b) => (
                <div className="bill-tile" key={b.id}>
                  <div className="top">
                    <div><div className="title" style={{ fontSize: 15 }}>{b.title}</div><div className="sub" style={{ fontSize: 12 }}>{b.cat} · {fmt(b.amount)}</div></div>
                    <span className={'status ' + (STATUS_CLASS[b.status] || '')}>{b.status}</span>
                  </div>
                  <div className="progress"><div style={{ width: pct(b.raised, b.amount) }} /></div>
                  <div className="hint">{b.status === 'In review' ? 'Goes live once checked' : b.raised > 0 ? `${fmt(b.raised)} paid to your biller` : 'Not funded'}</div>
                </div>
              ))}
            </div>
          )}

          {!isPay && upView === 'form' && (
            <div className="stack" style={{ gap: 18 }}>
              <div className="h2" style={{ fontSize: 24 }}>Upload a bill</div>
              {!form.photo ? (
                <div className="dropzone">
                  {Icon.camera}
                  <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Photo or PDF of the invoice</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn-ghost" onClick={() => setForm({ photo: true })}>Take photo</button>
                    <button type="button" className="btn-ghost" onClick={() => setForm({ photo: true })}>Choose file</button>
                  </div>
                </div>
              ) : (
                <div className="photo">
                  <div className="thumb"><div className="dark" style={{ width: '70%' }} /><div /><div /><div style={{ width: '60%' }} /><div className="dark" style={{ width: '50%' }} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>invoice.jpg</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>Auto-redacted: name, phone, ID number</div>
                    <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', padding: 0 }} onClick={() => setForm({ photo: false })}>Retake</button>
                  </div>
                </div>
              )}

              <label className="field">Amount (KES)
                <input className="input amount" type="text" inputMode="numeric" placeholder="0" value={form.amount}
                  onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 7); setForm({ amount: raw ? Number(raw).toLocaleString('en-US') : '' }); }} />
              </label>
              <label className="field">Title
                <input className="input" type="text" maxLength={60} placeholder="e.g. November rent – Kilimani" value={form.title} onChange={(e) => setForm({ title: e.target.value })} />
              </label>

              <div className="field">Category
                <div className="chips">
                  {CATEGORIES.map((c) => (
                    <button type="button" key={c} className={'chip' + (form.cat === c ? ' on' : '')} onClick={() => setForm({ cat: c })}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="field">Who gets paid?
                <div className="chips">
                  {PAYEE_TYPES.map((p) => (
                    <button type="button" key={p} className={'chip' + (form.payeeType === p ? ' on' : '')} onClick={() => setForm({ payeeType: p })}>{p}</button>
                  ))}
                </div>
              </div>
              <label className="field">{accountLabel}
                <input className="input" type="text" maxLength={40} placeholder={accountPlaceholder} value={form.account} onChange={(e) => setForm({ account: e.target.value })} />
                <span className="hint">Payers' money goes straight to the biller. Bills paid to a personal number get extra checks.</span>
              </label>

              <label className="field">Short note (optional)
                <textarea className="input" rows={3} maxLength={140} placeholder="What's it for, and why now?" value={form.note} onChange={(e) => setForm({ note: e.target.value })} />
                <span style={{ alignSelf: 'flex-end', fontSize: 12 }}>{form.note.length} / 140</span>
              </label>

              <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>Submit for review</button>
              <div className="hint" style={{ textAlign: 'center' }}>
                {left === 0 ? 'Daily upload limit reached. Try again tomorrow.' : valid ? 'Checked by our team before it goes live.' : 'Add a photo, amount, title and who gets paid to submit.'}
              </div>
              <button type="button" className="link-btn" onClick={() => setUpView('mybills')}>Cancel</button>
            </div>
          )}

          {!isPay && upView === 'submitted' && (
            <div className="empty" style={{ paddingTop: 60 }}>
              <div className="round" style={{ border: '2px solid var(--accent)', color: 'var(--accent)', width: 72, height: 72 }}>{Icon.clock}</div>
              <h2>Waiting for a swipe…</h2>
              <p className="muted-p">Every bill is checked before it goes live, usually within two hours. We'll notify you the moment someone pays.</p>
              <button type="button" className="btn-primary pill" onClick={() => setUpView('mybills')}>View my bills</button>
            </div>
          )}
        </main>

        <nav className="nav">
          {tabs.map((t) => (
            <button type="button" key={t.label} className={t.on ? 'on' : ''} onClick={t.go}>{t.label}</button>
          ))}
        </nav>

        {isPay && overlay === 'confirm' && cur && (
          <div className="backdrop" onClick={(e) => e.target === e.currentTarget && setOverlay(null)}>
            <div className="sheet" role="dialog" aria-label="Confirm payment">
              <div>
                <div className="hint">Pay towards</div>
                <div className="title" style={{ fontSize: 18 }}>{cur.title}</div>
                <div className="sub">{fmt(remaining)} still needed of {fmt(cur.amount)}</div>
              </div>
              <div className="grid2">
                {amtOpts.map((o) => (
                  <button type="button" key={o.key} className={'option' + (o.key === pickKey ? ' on' : '')} onClick={() => setPick(o.key)}>
                    <span className="l">{o.label}</span><span className="v">{fmt(o.amt)}</span>
                  </button>
                ))}
              </div>
              <div className="grid2">
                {[{ key: 'mpesa', label: 'M-Pesa', sub: 'STK push to 07•• ••• 482' }, { key: 'card', label: 'Card', sub: 'Visa ••4417 · 3-D Secure' }].map((m) => (
                  <button type="button" key={m.key} className={'option' + (method === m.key ? ' on' : '')} onClick={() => setMethod(m.key)}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{m.label}</span><span style={{ fontSize: 12, opacity: 0.85 }}>{m.sub}</span>
                  </button>
                ))}
              </div>
              <label className="toggle">
                <span>Hide my name from the recipient</span>
                <input type="checkbox" checked={anon} onChange={() => setAnon((a) => !a)} />
              </label>
              <div className="hint">The money goes straight to {cur.payee}. BillSwipe never holds the funds. Payments are final once approved.</div>
              <button type="button" className="btn-primary" onClick={() => setOverlay('stk')}>Pay {fmt(payAmt)}</button>
              <button type="button" className="link-btn" onClick={() => setOverlay(null)}>Cancel</button>
            </div>
          </div>
        )}

        {isPay && overlay === 'stk' && cur && (
          <div className="backdrop center">
            <div className="dialog" role="dialog" aria-label="Waiting for payment approval">
              <div className="spinner" />
              <div className="h2" style={{ fontSize: 24 }}>{isMpesa ? 'Check your phone' : 'Verify with your bank'}</div>
              <p className="muted-p">
                {isMpesa ? `Enter your M-Pesa PIN on the prompt to pay ${fmt(payAmt)} to ${cur.payee}.` : `Approve ${fmt(payAmt)} on your bank's 3-D Secure screen.`}
              </p>
              <button type="button" className="btn-primary" style={{ width: '100%', fontSize: 15 }} onClick={completePay}>
                {isMpesa ? 'Simulate: PIN entered' : 'Simulate: bank approved'}
              </button>
              <button type="button" className="link-btn" onClick={() => setOverlay(null)}>Cancel payment</button>
            </div>
          </div>
        )}

        {isPay && overlay === 'paid' && lastPaid && (
          <div className="success">
            <div className="check">{Icon.check(48)}</div>
            <div className="amt">{lastPaid.amountText}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{lastPaid.headline}</div>
            <p className="muted-p">{lastPaid.body}</p>
            <div className="pill-tag">{lastPaid.ref}</div>
            <button type="button" className="btn-primary pill" style={{ marginTop: 10, fontSize: 16 }} onClick={() => setOverlay(null)}>Next bill</button>
          </div>
        )}
      </div>
    </div>
  );
}
