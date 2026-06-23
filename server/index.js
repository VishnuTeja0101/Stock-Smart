import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const DATA_PATH = path.join(process.cwd(), 'data', 'Cleaned_Indian_Food_Dataset.csv')
const CACHE_PATH = path.join(process.cwd(), 'server', 'cache.json')

function parseCsv(raw) {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i]
    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      current.push(field)
      field = ''
      continue
    }
    if (ch === '\n') {
      current.push(field)
      rows.push(current)
      current = []
      field = ''
      continue
    }
    if (ch === '\r') continue
    field += ch
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }
  const header = rows.shift() || []
  const normalizedHeader = header.map((col) => col.trim())
  return rows
    .filter((row) => row.length === normalizedHeader.length)
    .map((row) => Object.fromEntries(row.map((value, index) => [normalizedHeader[index], value.trim()])))
}

let recipeDataset = []
let datasetIngredientCatalog = []
try {
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  const rows = parseCsv(raw)
  recipeDataset = rows.map((row) => ({
    name: row.TranslatedRecipeName,
    cuisine: row.Cuisine,
    time: Number(row.TotalTimeInMins) || 0,
    instructions: row.TranslatedInstructions,
    ingredients: String(row['Cleaned-Ingredients'] || '')
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean),
  }))
  datasetIngredientCatalog = Array.from(
    new Map(recipeDataset.flatMap((r) => r.ingredients.map((ing) => [ing.toLowerCase(), ing]))).values()
  )
  console.log('Loaded', recipeDataset.length, 'recipes')
} catch (err) {
  console.warn('Could not load dataset:', err.message)
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function createIngredientItem(name) {
  return { name, unit: 'unit', baseQty: 1, icon: '🍴', keywords: [name.toLowerCase()] }
}

function guessIngredientsFromText(text) {
  const lower = normalize(text)
  const matched = new Set()
  datasetIngredientCatalog.forEach((ingredient) => {
    if (lower.includes(ingredient.toLowerCase())) matched.add(ingredient)
  })
  if (matched.size > 0) return Array.from(matched).map(createIngredientItem)
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean)
  const fallback = datasetIngredientCatalog.filter((ing) => tokens.some((t) => ing.toLowerCase().includes(t))).slice(0, 6)
  return Array.from(new Set(fallback)).map(createIngredientItem)
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeCache(cache) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  } catch (err) {
    console.warn('Failed to write cache:', err.message)
  }
}

app.post('/api/analyze', (req, res) => {
  const { text = '', members = 1, pattern = 'average', inventory = [] } = req.body || {}
  const key = normalize(text)
  const cache = readCache()
  if (cache[key]) {
    return res.json({ ...cache[key], source: 'cache' })
  }

  const datasetMatches = recipeDataset.filter((r) => r.name.toLowerCase().includes(key) || key.includes(r.name.toLowerCase()))
  let items = []
  let source = 'ai'
  if (datasetMatches.length > 0) {
    source = 'database'
    const ingredientNames = Array.from(new Set(datasetMatches.flatMap((r) => r.ingredients)))
    items = ingredientNames.map(createIngredientItem)
  } else {
    items = guessIngredientsFromText(text)
  }

  const factorMap = { light: 0.9, average: 1, heavy: 1.3, athletic: 1.5 }
  const factor = factorMap[pattern] || 1
  const familySize = Math.max(1, Number(members) || 1)

  const computed = items.map((ingredient) => {
    const required = Math.max(1, Math.round(ingredient.baseQty * familySize * factor))
    const invMatch = inventory.find((it) => it.name.toLowerCase().includes(ingredient.name.toLowerCase()))
    const available = invMatch ? Number(invMatch.quantity) : 0
    return { ...ingredient, required, available, shortage: Math.max(0, required - available), inInventory: Boolean(invMatch) }
  })

  const shortages = computed.filter((i) => i.shortage > 0)
  const coverage = computed.length === 0 ? 0 : Math.round((computed.reduce((s, it) => s + Math.min(it.available, it.required), 0) / computed.reduce((s, it) => s + it.required, 0)) * 100)

  const result = { items: computed, shortages, coverage, totalShortage: shortages.reduce((s, it) => s + it.shortage, 0), datasetMatches, recipeName: text, source }

  if (source === 'ai') {
    cache[key] = { ...result, cachedAt: Date.now() }
    try { writeCache(cache) } catch {}
  }

  return res.json(result)
})

app.get('/api/recipes', (req, res) => {
  res.json({ count: recipeDataset.length, sample: recipeDataset.slice(0, 10) })
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => console.log('API server listening on', PORT))
