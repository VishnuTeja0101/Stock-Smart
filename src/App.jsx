import { useMemo, useState } from 'react'
import './App.css'

const initialInventory = [
  { id: 1, name: 'Spinach', category: 'Vegetables', quantity: 120, unit: 'g', required: 250, icon: '🥬' },
  { id: 2, name: 'Brown rice', category: 'Grains', quantity: 900, unit: 'g', required: 500, icon: '🌾' },
  { id: 3, name: 'Greek yogurt', category: 'Dairy', quantity: 1, unit: 'cup', required: 3, icon: '🥛' },
  { id: 4, name: 'Bananas', category: 'Fruits', quantity: 6, unit: 'pcs', required: 4, icon: '🍌' },
  { id: 5, name: 'Chicken breast', category: 'Protein', quantity: 300, unit: 'g', required: 700, icon: '🍗' },
  { id: 6, name: 'Eggs', category: 'Protein', quantity: 8, unit: 'pcs', required: 6, icon: '🥚' },
]

const meals = [
  { day: 'MON', date: '22', title: 'Berry overnight oats', meta: 'Breakfast · 420 kcal', color: '#f0c4d4' },
  { day: 'TUE', date: '23', title: 'Chicken grain bowl', meta: 'Lunch · 610 kcal', color: '#f1cf98' },
  { day: 'WED', date: '24', title: 'Green protein pasta', meta: 'Dinner · 540 kcal', color: '#b8d9b7' },
  { day: 'THU', date: '25', title: 'Yogurt fruit parfait', meta: 'Breakfast · 380 kcal', color: '#c5d5ef' },
]

function Icon({ name }) {
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    box: '<path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5 9-5v9l-9 5-9-5V8Z"/>',
    cart: '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    spark: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  }
  return <svg className="icon" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: paths[name] }} />
}

function App() {
  const [active, setActive] = useState('Dashboard')
  const [inventory, setInventory] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [ordered, setOrdered] = useState(false)

  const shortages = useMemo(() => inventory.filter((item) => item.quantity < item.required), [inventory])
  const shoppingTotal = shortages.reduce((sum, item) => sum + Math.max(2.5, (item.required - item.quantity) / 100 * 2.2), 0)
  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))

  const addItem = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setInventory((items) => [...items, {
      id: Date.now(),
      name: form.get('name'),
      category: form.get('category'),
      quantity: Number(form.get('quantity')),
      required: Number(form.get('required')),
      unit: form.get('unit'),
      icon: '🛒',
    }])
    setShowAdd(false)
  }

  const pages = {
    Dashboard: <Dashboard inventory={inventory} shortages={shortages} setActive={setActive} />,
    'Diet Plan': <DietPlan />,
    Inventory: <Inventory items={filteredInventory} search={search} setSearch={setSearch} onAdd={() => setShowAdd(true)} />,
    'Shopping List': <ShoppingList shortages={shortages} total={shoppingTotal} ordered={ordered} onOrder={() => setOrdered(true)} />,
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>STOCK<br /><b>SMART</b></span></div>
        <nav>
          {[
            ['Dashboard', 'grid'], ['Diet Plan', 'calendar'], ['Inventory', 'box'], ['Shopping List', 'cart'],
          ].map(([label, icon]) => (
            <button className={active === label ? 'active' : ''} onClick={() => setActive(label)} key={label}>
              <Icon name={icon} />{label}{label === 'Shopping List' && shortages.length > 0 && <em>{shortages.length}</em>}
            </button>
          ))}
        </nav>
        <div className="side-card"><span>🌿</span><b>Healthy week</b><p>You are 82% stocked for your meal plan.</p></div>
        <div className="profile"><div className="avatar">VK</div><span><b>Vishnu Kumar</b><small>Personal plan</small></span><button>•••</button></div>
      </aside>

      <main>
        <header>
          <div className="mobile-brand"><span className="brand-mark">S</span><b>STOCK SMART</b></div>
          <div className="header-actions"><button aria-label="Notifications"><Icon name="bell" /><i /></button><div className="avatar">VK</div></div>
        </header>
        {pages[active]}
      </main>

      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <form className="modal" onSubmit={addItem} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowAdd(false)}><Icon name="close" /></button>
            <span className="eyebrow">INVENTORY</span><h2>Add grocery item</h2><p>Track what is available in your kitchen.</p>
            <label>Item name<input name="name" placeholder="e.g. Avocados" required /></label>
            <div className="form-row"><label>Category<select name="category"><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Dairy</option><option>Protein</option></select></label><label>Unit<select name="unit"><option>pcs</option><option>g</option><option>kg</option><option>cup</option></select></label></div>
            <div className="form-row"><label>In stock<input name="quantity" type="number" min="0" required /></label><label>Weekly need<input name="required" type="number" min="0" required /></label></div>
            <button className="primary full" type="submit">Add to inventory</button>
          </form>
        </div>
      )}
    </div>
  )
}

function Dashboard({ inventory, shortages, setActive }) {
  const stocked = inventory.length - shortages.length
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">MONDAY, 22 JUNE</span><h1>Good morning, Vishnu.</h1><p>Here is what your kitchen needs for a healthy week.</p></div><button className="primary" onClick={() => setActive('Inventory')}><Icon name="plus" /> Add inventory</button></div>
    <section className="hero-card">
      <div><span className="pill"><Icon name="spark" /> SMART INSIGHT</span><h2>Your kitchen is almost ready.</h2><p>{shortages.length} ingredients are running low for this week's diet plan. Replenish them now and stay on track.</p><button onClick={() => setActive('Shopping List')}>Review shopping list <Icon name="arrow" /></button></div>
      <div className="progress-orbit"><div><strong>{Math.round(stocked / inventory.length * 100)}%</strong><span>stocked</span></div></div>
    </section>
    <div className="stats-grid">
      <Stat icon="box" label="Pantry items" value={inventory.length} note={`${stocked} ready for the week`} tone="green" />
      <Stat icon="calendar" label="Meals planned" value="12" note="Across the next 4 days" tone="blue" />
      <Stat icon="cart" label="Items to buy" value={shortages.length} note="Based on current stock" tone="orange" />
    </div>
    <div className="content-grid">
      <section className="panel schedule"><div className="panel-title"><div><span className="eyebrow">YOUR PLAN</span><h2>Upcoming meals</h2></div><button onClick={() => setActive('Diet Plan')}>View plan <Icon name="arrow" /></button></div>{meals.slice(0, 3).map((meal) => <Meal key={meal.day} meal={meal} />)}</section>
      <section className="panel low-stock"><div className="panel-title"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>Running low</h2></div><span className="count-badge">{shortages.length}</span></div>{shortages.map((item) => <div className="stock-row" key={item.id}><span className="food-icon">{item.icon}</span><div><b>{item.name}</b><small>{item.quantity} {item.unit} left · need {item.required}</small></div><span className="low-label">LOW</span></div>)}<button className="outline full" onClick={() => setActive('Shopping List')}>Generate shopping list</button></section>
    </div>
  </div>
}

function Stat({ icon, label, value, note, tone }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}><Icon name={icon} /></span><div><small>{label}</small><strong>{value}</strong><p><Icon name="check" /> {note}</p></div></div>
}

function Meal({ meal }) {
  return <div className="meal-row"><div className="date-tile"><span>{meal.day}</span><b>{meal.date}</b></div><span className="meal-art" style={{ background: meal.color }}>🥗</span><div><b>{meal.title}</b><small>{meal.meta}</small></div><button aria-label={`Open ${meal.title}`}><Icon name="arrow" /></button></div>
}

function DietPlan() {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">PERSONALIZED NUTRITION</span><h1>Your diet plan</h1><p>A balanced high-protein plan designed for your weekly goals.</p></div><button className="primary"><Icon name="plus" /> Add meal</button></div><div className="week-strip">{['MON 22', 'TUE 23', 'WED 24', 'THU 25', 'FRI 26', 'SAT 27', 'SUN 28'].map((day, index) => <button className={index === 0 ? 'selected' : ''} key={day}><span>{day.split(' ')[0]}</span><b>{day.split(' ')[1]}</b></button>)}</div><section className="panel plan-list"><div className="panel-title"><div><span className="eyebrow">MONDAY</span><h2>Today's meals</h2></div><span className="calorie-total">1,750 kcal</span></div>{meals.slice(0, 3).map((meal, index) => <div className="plan-meal" key={meal.title}><span className="meal-art" style={{ background: meal.color }}>{['🥣', '🥗', '🍝'][index]}</span><div><small>{['08:00 · BREAKFAST', '13:00 · LUNCH', '19:30 · DINNER'][index]}</small><b>{meal.title}</b><p>{index === 0 ? 'Oats, berries, Greek yogurt and chia seeds' : index === 1 ? 'Chicken, brown rice, spinach and avocado' : 'Whole-wheat pasta, greens and cottage cheese'}</p></div><strong>{meal.meta.split('· ')[1]}</strong></div>)}</section></div>
}

function Inventory({ items, search, setSearch, onAdd }) {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">YOUR KITCHEN</span><h1>Grocery inventory</h1><p>Track stock levels and know what needs replenishing.</p></div><button className="primary" onClick={onAdd}><Icon name="plus" /> Add item</button></div><section className="panel inventory-panel"><div className="inventory-tools"><div className="search"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory" /></div><span>{items.length} items</span></div><div className="inventory-table"><div className="table-head"><span>ITEM</span><span>CATEGORY</span><span>AVAILABLE</span><span>WEEKLY NEED</span><span>STATUS</span></div>{items.map((item) => { const low = item.quantity < item.required; return <div className="table-row" key={item.id}><div><span className="food-icon">{item.icon}</span><b>{item.name}</b></div><span>{item.category}</span><b>{item.quantity} {item.unit}</b><span>{item.required} {item.unit}</span><em className={low ? 'status-low' : 'status-good'}>{low ? 'Running low' : 'In stock'}</em></div>})}</div></section></div>
}

function ShoppingList({ shortages, total, ordered, onOrder }) {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">SMART REPLENISHMENT</span><h1>Shopping list</h1><p>Generated automatically from your diet plan and pantry stock.</p></div></div>{ordered ? <section className="success-card"><span><Icon name="check" /></span><h2>Order confirmed</h2><p>Your grocery list is ready. In a production version, this would continue to your selected delivery partner.</p></section> : <div className="shopping-layout"><section className="panel shopping-items"><div className="panel-title"><div><span className="eyebrow">AUTO-GENERATED</span><h2>{shortages.length} items to replenish</h2></div></div>{shortages.map((item) => <label className="shopping-row" key={item.id}><input type="checkbox" defaultChecked /><span className="food-icon">{item.icon}</span><div><b>{item.name}</b><small>{item.category} · Need {item.required - item.quantity} {item.unit} more</small></div><strong>₹{Math.round(Math.max(180, (item.required - item.quantity) * 1.7))}</strong></label>)}</section><aside className="order-card"><span className="eyebrow">ORDER SUMMARY</span><h2>Ready to restock?</h2><div><span>Items</span><b>{shortages.length}</b></div><div><span>Estimated subtotal</span><b>₹{Math.round(total * 80)}</b></div><div><span>Delivery</span><b className="free">FREE</b></div><hr /><div className="total"><span>Estimated total</span><b>₹{Math.round(total * 80)}</b></div><p>You will always confirm before an order is placed.</p><button className="primary full" onClick={onOrder}>Confirm shopping list <Icon name="arrow" /></button></aside></div>}</div>
}

export default App
