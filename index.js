const cp = require('child_process')
const PAGE_SIZE = 4096

function physicalMemory() {
  let res = cp.execSync('sysctl hw.memsize').toString()
  res = res.trim().split(' ')[1]
  return parseInt(res)
}

function vmStats() {

  // TODO extend to all
  let mappings = {
    'Anonymous pages'              : 'app',
    'Pages wired down'             : 'wired',
    'Pages active'                 : 'active',
    'Pages inactive'               : 'inactive',
    'Pages occupied by compressor' : 'compressed'
  }

  let ret = {}
  let res = cp.execSync('vm_stat').toString()
  let lines = res.split('\n')
  lines = lines.filter(x => x !== '')

  lines.forEach(x => {
    let parts = x.split(':')
    let key = parts[0]
    let val = parts[1].replace('.', '').trim()
    if (mappings[key]) {
      let k = mappings[key]
      ret[k] = val * PAGE_SIZE
    }
  })
  return ret
}

function memory() {
  let total = physicalMemory()
  let stats = vmStats()
  // This appears to be contested 
  // not clear what apple is using for "Memory Used" in app
  let used = (stats.wired + stats.active + stats.inactive)
  return { used: used, total: total }
}

module.exports = memory 
