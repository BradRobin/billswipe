// Demo data for the prototype. Replace with API calls when the backend exists.

export const FEED = [
  {
    id: 'b1', cat: 'School fees', title: 'Term 3 school fees', place: 'Grade 4 · Kasarani',
    amount: 38500, raised: 12000, payee: 'the school',
    payeeLine: 'Paid straight to the school paybill · verified',
    note: 'Term starts Monday. The balance has to be cleared before my daughter can sit her end-of-year exams.',
    seen: 12, age: '2h ago', docHead: 'FEE STATEMENT',
    docRows: [['Tuition, Term 3', '28,000'], ['Lunch program', '6,500'], ['Activity fee', '4,000']],
    docTotal: '38,500',
  },
  {
    id: 'b2', cat: 'Utilities', title: 'Power arrears before disconnection', place: 'Postpaid account · Umoja',
    amount: 6200, raised: 0, payee: 'Kenya Power',
    payeeLine: 'Paid straight to Kenya Power · verified',
    note: 'Disconnection notice for Friday. Short this month after my salary came late.',
    seen: 31, age: '40m ago', docHead: 'ELECTRICITY BILL',
    docRows: [['Arrears brought forward', '4,150'], ['Current charges', '2,050']],
    docTotal: '6,200',
  },
  {
    id: 'b3', cat: 'Medical', title: 'Maternity bill balance', place: 'Private hospital · Nairobi',
    amount: 72000, raised: 31500, payee: 'the hospital',
    payeeLine: 'Paid straight to the hospital paybill · verified',
    note: 'Our baby came by C-section. The hospital releases us once the balance is cleared.',
    seen: 58, age: '5h ago', docHead: 'INTERIM INVOICE',
    docRows: [['Theatre & surgeon', '48,000'], ['Ward, 3 nights', '18,000'], ['Pharmacy', '6,000']],
    docTotal: '72,000',
  },
  {
    id: 'b4', cat: 'Business', title: 'Duka restock – flour & cooking oil', place: 'Kawangware',
    amount: 15000, raised: 0, payee: 'the supplier',
    payeeLine: 'Paid straight to the supplier till · verified',
    note: 'My supplier gives 30 days but I fell behind last month. Restocking keeps the shop open.',
    seen: 7, age: '20m ago', docHead: 'PROFORMA INVOICE',
    docRows: [['Maize flour 2kg × 24', '5,760'], ['Cooking oil 3L × 12', '7,440'], ['Sugar 1kg × 12', '1,800']],
    docTotal: '15,000',
  },
  {
    id: 'b5', cat: 'Rent', title: 'November rent', place: '1-bedroom · Kilimani',
    amount: 45000, raised: 20000, payee: 'the landlord',
    payeeLine: 'Paid to the landlord account · verified',
    note: 'Between contracts. My new role starts in December.',
    seen: 19, age: '1d ago', docHead: 'RENT INVOICE',
    docRows: [['Rent, November', '42,000'], ['Service charge', '3,000']],
    docTotal: '45,000',
  },
];

export const SEED_HISTORY = [
  { id: 'h1', title: 'Power arrears', payee: 'Kenya Power', amount: 4800, method: 'M-Pesa', when: 'Yesterday', anon: true },
  { id: 'h2', title: 'Outpatient clinic invoice', payee: 'clinic paybill', amount: 3500, method: 'Card', when: '3 days ago', anon: false },
];

export const SEED_MY_BILLS = [
  { id: 'm1', title: 'November rent – Kilimani', cat: 'Rent', amount: 45000, raised: 20000, status: 'Partly funded' },
  { id: 'm2', title: 'Power arrears', cat: 'Utilities', amount: 6200, raised: 6200, status: 'Paid' },
  { id: 'm3', title: 'Clinic follow-up invoice', cat: 'Medical', amount: 9800, raised: 0, status: 'Expired' },
];

export const CATEGORIES = ['Rent', 'School fees', 'Medical', 'Utilities', 'Business', 'Other'];
export const PAYEE_TYPES = ['Paybill', 'Till', 'Landlord M-Pesa'];
export const DAILY_UPLOAD_LIMIT = 3;
export const REFS = ['SKT4H2LQ9P', 'SKT7M1PQ2X', 'SKT9A3RV8K', 'SKU2C6WN4D', 'SKU5F8TB1J'];
