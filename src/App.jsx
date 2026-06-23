import { useMemo, useState, useEffect } from 'react'
import Login from './components/Login'
import './App.css'

const initialInventory = [
  { id: 1, name: 'Spinach', category: 'Vegetables', quantity: 120, unit: 'g', required: 250, icon: '🥬' },
  { id: 2, name: 'Brown rice', category: 'Grains', quantity: 900, unit: 'g', required: 500, icon: '🌾' },
  { id: 3, name: 'Greek yogurt', category: 'Dairy', quantity: 1, unit: 'cup', required: 3, icon: '🥛' },
  { id: 4, name: 'Bananas', category: 'Fruits', quantity: 6, unit: 'pcs', required: 4, icon: '🍌' },
  { id: 5, name: 'Chicken breast', category: 'Protein', quantity: 300, unit: 'g', required: 700, icon: '🍗' },
  { id: 6, name: 'Eggs', category: 'Protein', quantity: 8, unit: 'pcs', required: 6, icon: '🥚' },
]

const initialMenu = [
  { id: 1, day: 'MON', date: '22', title: 'Berry overnight oats', meta: 'Breakfast · 420 kcal', color: '#f0c4d4' },
  { id: 2, day: 'TUE', date: '23', title: 'Chicken grain bowl', meta: 'Lunch · 610 kcal', color: '#f1cf98' },
  { id: 3, day: 'WED', date: '24', title: 'Green protein pasta', meta: 'Dinner · 540 kcal', color: '#b8d9b7' },
  { id: 4, day: 'THU', date: '25', title: 'Yogurt fruit parfait', meta: 'Breakfast · 380 kcal', color: '#c5d5ef' },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [active, setActive] = useState('Dashboard')
  const [inventory, setInventory] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [weeklyMenu, setWeeklyMenu] = useState(initialMenu)
  const [dietPlan, setDietPlan] = useState({
    created: false,
    members: 1,
    items: [{ id: 1, name: 'Vegetable stew', quantityPerPerson: 1 }],
    notes: '',
    completed: false,
    verification: {
      checkedItems: [],
      notes: '',
      date: '',
    },
  })

  const shortages = useMemo(() => inventory.filter((item) => item.quantity < item.required), [inventory])
  const shoppingTotal = shortages.reduce((sum, item) => sum + Math.max(2.5, (item.required - item.quantity) / 100 * 2.2), 0)
  const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))

  const handleLogin = (email, password) => {
    console.log('Login successful:', { email, password })
    setIsLoggedIn(true)
    setActive('Diet Plan')
  }

  const handleCreateDietPlan = (planData) => {
    setDietPlan({
      created: true,
      members: planData.members,
      items: planData.items,
      notes: planData.notes,
      completed: false,
      verification: {
        checkedItems: [],
        notes: '',
        date: '',
      },
    })
    setActive('Diet Plan')
  }

  const handleUpdateDietPlan = (updatedPlan) => {
    setDietPlan((current) => ({
      ...current,
      ...updatedPlan,
      created: true,
    }))
  }

  const handleVerifyDietPlan = (checkedItems, notes) => {
    setDietPlan((current) => ({
      ...current,
      completed: true,
      verification: {
        checkedItems,
        notes,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    }))
  }

  const updateWeeklyMenu = (menu) => {
    setWeeklyMenu(menu)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

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
    Dashboard: <Dashboard inventory={inventory} shortages={shortages} setActive={setActive} weeklyMenu={weeklyMenu} />,
    'Diet Plan': <DietPlan dietPlan={dietPlan} weeklyMenu={weeklyMenu} onUpdateWeeklyMenu={updateWeeklyMenu} onCreate={handleCreateDietPlan} onUpdate={handleUpdateDietPlan} onVerify={handleVerifyDietPlan} />,
    Inventory: <Inventory items={filteredInventory} search={search} setSearch={setSearch} onAdd={() => setShowAdd(true)} />,
    'Shopping List': <ShoppingList shortages={shortages} total={shoppingTotal} ordered={ordered} onOrder={() => setOrdered(true)} />,
  }

  useEffect(() => {
    if (!isLoggedIn && showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isLoggedIn, showSplash])

  if (!isLoggedIn) {
    if (showSplash) {
      return <div className="splash" />
    }

    return <Login onLogin={handleLogin} />
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
        <div className="profile"><div className="avatar">VK</div><span><b>Vishnu Kumar</b><small>Personal plan</small></span><button onClick={handleLogout}>•••</button></div>
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
            <div className="form-row"><label>Category<select name="category"><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Dairy</option><option>Protein</option></select></label><label>Unit<input name="unit" placeholder="e.g. g, pcs, cup" required /></label></div>
            <div className="form-row"><label>In stock<input name="quantity" type="number" min="0" required /></label><label>Weekly need<input name="required" type="number" min="0" required /></label></div>
            <button className="primary full" type="submit">Add to inventory</button>
          </form>
        </div>
      )}
    </div>
  )
}

function Dashboard({ inventory, shortages, setActive, weeklyMenu }) {
  const stocked = inventory.length - shortages.length
  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">MONDAY, 22 JUNE</span><h1>Good morning, Vishnu.</h1><p>Here is what your kitchen needs for a healthy week.</p></div><button className="primary"><Icon name="plus" /> New item</button></div>
    <section className="hero-card">
      <div><span className="pill"><Icon name="spark" /> SMART INSIGHT</span><h2>Your kitchen is almost ready.</h2><p>{shortages.length} ingredients are running low for this week's diet plan. Replace them to stick to your plan.</p></div>
      <div className="progress-orbit"><div><strong>{Math.round(stocked / inventory.length * 100)}%</strong><span>stocked</span></div></div>
    </section>
    <div className="stats-grid">
      <Stat icon="box" label="Pantry items" value={inventory.length} note={`${stocked} ready for the week`} tone="green" />
      <Stat icon="calendar" label="Meals planned" value={weeklyMenu.length} note="Across the next week" tone="blue" />
      <Stat icon="cart" label="Items to buy" value={shortages.length} note="Based on current stock" tone="orange" />
    </div>
    <div className="content-grid">
      <section className="panel schedule"><div className="panel-title"><div><span className="eyebrow">YOUR PLAN</span><h2>Weekly menu</h2></div><button onClick={() => setActive('Diet Plan')}>View plan <Icon name="arrow" /></button></div>{weeklyMenu.map((meal) => <Meal key={meal.id} meal={meal} />)}</section>
      <section className="panel low-stock"><div className="panel-title"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>Running low</h2></div><span className="count-badge">{shortages.length}</span></div>{shortages.map((item) => <div key={item.id} className="item-row"><span className="icon-label">{item.icon} {item.name}</span><span className="meta">{item.quantity} {item.unit} of {item.required}</span></div>)}</section>
    </div>
  </div>
}

function Stat({ icon, label, value, note, tone }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}><Icon name={icon} /></span><div><small>{label}</small><strong>{value}</strong><p><Icon name="check" /> {note}</p></div></div>
}

function Meal({ meal }) {
  return <div className="meal-row"><div className="date-tile"><span>{meal.day}</span><b>{meal.date}</b></div><span className="meal-art" style={{ background: meal.color }}>🥗</span><div><b>{meal.title}</b><p>{meal.meta}</p></div></div>
}

function DietPlan({ dietPlan, weeklyMenu, onUpdateWeeklyMenu, onCreate, onUpdate, onVerify }) {
  const [mode, setMode] = useState(dietPlan.created ? 'summary' : 'create')
  const [members, setMembers] = useState(dietPlan.members)
  const [items, setItems] = useState(dietPlan.items)
  const [notes, setNotes] = useState(dietPlan.notes)
  const [verifyNotes, setVerifyNotes] = useState(dietPlan.verification.notes)
  const [checkedItems, setCheckedItems] = useState(dietPlan.verification.checkedItems)
  const [menuItems, setMenuItems] = useState(weeklyMenu)

  useEffect(() => {
    setMode(dietPlan.created ? 'summary' : 'create')
    setMembers(dietPlan.members)
    setItems(dietPlan.items)
    setNotes(dietPlan.notes)
    setVerifyNotes(dietPlan.verification.notes)
    setCheckedItems(dietPlan.verification.checkedItems)
  }, [dietPlan])

  useEffect(() => {
    setMenuItems(weeklyMenu)
  }, [weeklyMenu])

  const totalConsumption = items.reduce((sum, item) => sum + Number(item.quantityPerPerson || 0) * Number(members || 0), 0)
  const completedCount = checkedItems.filter(Boolean).length

  const handleItemChange = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    setItems((current) => [...current, { id: Date.now(), name: '', quantityPerPerson: 1 }])
  }

  const handleRemoveItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!members || members < 1 || items.every((item) => !item.name.trim())) {
      return
    }
    onCreate({ members: Number(members), items, notes })
  }

  const handleSavePlan = (event) => {
    event.preventDefault()
    onUpdate({ members: Number(members), items, notes })
    setMode('summary')
  }

  const handleMenuChange = (id, field, value) => {
    setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleAddMenuItem = () => {
    setMenuItems((current) => [...current, { id: Date.now(), day: 'NEW', date: '', title: '', meta: '', color: '#dfece2' }])
  }

  const handleSaveMenu = () => {
    onUpdateWeeklyMenu(menuItems)
  }

  const handleVerifySubmit = (event) => {
    event.preventDefault()
    onVerify(checkedItems, verifyNotes)
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DIET PLAN ONBOARDING</span>
          <h1>{dietPlan.created ? 'Your daily diet plan' : 'Create your first plan'}</h1>
          <p>{dietPlan.created
            ? 'Adjust members, update meals, and verify what was completed at the end of the day.'
            : 'Tell us how many people you are planning for and what meals you will make today.'}
          </p>
        </div>
        {dietPlan.created && (
          <button className="outline" type="button" onClick={() => setMode('create')}>
            Edit plan
          </button>
        )}
      </div>

      {(mode === 'create' || !dietPlan.created) && (
        <>
          <form className="plan-form" onSubmit={dietPlan.created ? handleSavePlan : handleSubmit}>
            <div className="plan-group">
              <label>Number of people</label>
              <input
                type="number"
                min="1"
                value={members}
                onChange={(e) => setMembers(Number(e.target.value) || 1)}
              />
              <small>Set the member count for this diet plan and update anytime.</small>
            </div>

            <div className="plan-group plan-items">
              <div className="group-header">
                <div>
                  <label>Daily food items</label>
                  <p>Enter the meals or ingredients you will prepare today.</p>
                </div>
                <button type="button" className="outline" onClick={handleAddItem}>
                  <Icon name="plus" /> Add item
                </button>
              </div>

              <div className="item-list">
                {items.map((item, index) => (
                  <div className="plan-item" key={item.id}>
                    <div>
                      <input
                        type="text"
                        placeholder={`Food item ${index + 1}`}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={item.quantityPerPerson}
                        onChange={(e) => handleItemChange(item.id, 'quantityPerPerson', Number(e.target.value) || 0)}
                      />
                      <small>Qty per person</small>
                    </div>
                    <button type="button" className="item-remove" onClick={() => handleRemoveItem(item.id)}>
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="plan-group">
              <label>Notes for today</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note: preferences, allergies, or focus for today"
              />
            </div>

            <div className="plan-summary">
              <div className="metric-card">
                <span>Members</span>
                <strong>{members}</strong>
              </div>
              <div className="metric-card">
                <span>Items planned</span>
                <strong>{items.length}</strong>
              </div>
              <div className="metric-card">
                <span>Total consumption</span>
                <strong>{totalConsumption}</strong>
              </div>
            </div>

            <button className="primary" type="submit">
              {dietPlan.created ? 'Save changes' : 'Create plan'}
            </button>
          </form>

          <div className="panel weekly-menu-panel">
            <div className="section-heading"><h2>Weekly menu</h2><button type="button" className="outline" onClick={handleAddMenuItem}><Icon name="plus" /> Add menu item</button></div>
            <div className="item-list">
              {menuItems.map((item, index) => (
                <div className="plan-item" key={item.id}>
                  <div>
                    <input
                      type="text"
                      placeholder="Day"
                      value={item.day}
                      onChange={(e) => handleMenuChange(item.id, 'day', e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Menu"
                      value={item.title}
                      onChange={(e) => handleMenuChange(item.id, 'title', e.target.value)}
                    />
                  </div>
                  <button type="button" className="item-remove" onClick={() => setMenuItems((current) => current.filter((menuItem) => menuItem.id !== item.id))}>
                    <Icon name="close" />
                  </button>
                </div>
              ))}
            </div>
            <button className="primary" type="button" onClick={handleSaveMenu}>Save weekly menu</button>
          </div>
        </>
      )}

      {dietPlan.created && mode === 'summary' && (
        <div className="plan-dashboard">
          <section className="panel plan-card">
            <div className="section-heading"><h2>Plan summary</h2><span>{members} people</span></div>
            <div className="plan-table">
              {items.map((item) => (
                <div key={item.id} className="plan-row">
                  <div>
                    <strong>{item.name || 'Untitled item'}</strong>
                    <small>{item.quantityPerPerson} per person</small>
                  </div>
                  <strong>{item.quantityPerPerson * members}</strong>
                </div>
              ))}
            </div>
            <p className="info-note">{notes || 'No additional notes were added for today.'}</p>
          </section>

          <section className="panel verify-panel">
            <div className="section-heading"><h2>End of day verification</h2><span>{completedCount}/{items.length} completed</span></div>
            <form onSubmit={handleVerifySubmit}>
              <div className="verify-list">
                {items.map((item, index) => (
                  <label className="checkbox-row" key={item.id}>
                    <input
                      type="checkbox"
                      checked={Boolean(checkedItems[index])}
                      onChange={(e) => {
                        const next = [...checkedItems]
                        next[index] = e.target.checked
                        setCheckedItems(next)
                      }}
                    />
                    <span>{item.name || `Item ${index + 1}`}</span>
                  </label>
                ))}
              </div>

              <div className="plan-group">
                <label>Completion notes</label>
                <textarea
                  rows="3"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Describe what was completed or what changed today"
                />
              </div>

              <button className="primary" type="submit">
                Mark day complete
              </button>
            </form>

            {dietPlan.completed && (
              <div className="verification-summary">
                <p><strong>Verified on:</strong> {dietPlan.verification.date}</p>
                <p>{dietPlan.verification.notes || 'No verification notes were recorded.'}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function Inventory({ items, search, setSearch, onAdd }) {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">YOUR KITCHEN</span><h1>Grocery inventory</h1><p>Track stock levels and know what needs replenishing.</p></div><button className="primary" onClick={onAdd}><Icon name="plus" /> Add item</button></div><div className="search-box"><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." /></div><div className="inventory-list">{items.map((item) => <div key={item.id} className="inventory-item"><span className="icon-label">{item.icon} {item.name}</span><span className="meta">{item.category}</span><span className="quantity">{item.quantity}/{item.required} {item.unit}</span></div>)}</div></div>
}

function ShoppingList({ shortages, total, ordered, onOrder }) {
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">SMART REPLENISHMENT</span><h1>Shopping list</h1><p>Generated automatically from your diet plan and pantry stock.</p></div><button className="primary" onClick={onOrder} disabled={ordered}>{ordered ? 'Ordered ✓' : 'Order now'}</button></div><div className="shopping-items">{shortages.map((item) => <div key={item.id} className="shopping-item"><span className="icon-label">{item.icon} {item.name}</span><span className="meta">Need {item.required - item.quantity} {item.unit}</span></div>)}</div><div className="shopping-total"><strong>Estimated total: ${total.toFixed(2)}</strong></div></div>
}

export default App
