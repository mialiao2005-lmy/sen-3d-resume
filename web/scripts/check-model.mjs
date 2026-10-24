// Checks this project's GLB integration contract; it is not a full glTF validator.
// Run from web/: npm run check:model [-- /absolute/path/to/candidate.glb]
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const webRoot = fileURLToPath(new URL('../', import.meta.url))
const modelPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(webRoot, 'public/models/me.glb')
let errors = 0
let warnings = 0

function check(ok, message) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${message}`)
  if (!ok) errors++
}

function warn(message) {
  warnings++
  console.log(`WARN ${message}`)
}

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node))) {
    node = node.expression
  }
  return node
}

async function initializer(relativePath, variable) {
  const source = ts.createSourceFile(relativePath, await readFile(path.join(webRoot, relativePath), 'utf8'), ts.ScriptTarget.Latest, true)
  let value
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variable) {
      value = unwrap(node.initializer)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (!value) throw new Error(`Cannot read ${variable} in ${relativePath}`)
  return value
}

function property(object, key) {
  const item = object && ts.isObjectLiteralExpression(object)
    ? object.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText().replace(/^['"]|['"]$/g, '') === key)
    : undefined
  return unwrap(item?.initializer)
}

function parseGlb(bytes) {
  if (bytes.length < 20 || bytes.toString('ascii', 0, 4) !== 'glTF' || bytes.readUInt32LE(4) !== 2) {
    throw new Error('Expected a binary glTF 2.0 (.glb) file')
  }
  if (bytes.readUInt32LE(8) !== bytes.length) throw new Error('GLB header length does not match file size')
  const jsonLength = bytes.readUInt32LE(12)
  if (bytes.readUInt32LE(16) !== 0x4e4f534a || jsonLength % 4 !== 0 || 20 + jsonLength > bytes.length) {
    throw new Error('Invalid GLB JSON chunk')
  }
  return JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength).trim())
}

async function main() {
  if (process.argv.length > 3) throw new Error('Usage: npm run check:model [-- path/to/candidate.glb]')
  const bytes = await readFile(modelPath)
  const gltf = parseGlb(bytes)
  const focusValue = await initializer('src/data/focusPoints.ts', 'FOCUS_POINTS')
  const frameValue = await initializer('src/data/focusPoints.ts', 'FRAMES_PER_NODE')
  if (!ts.isArrayLiteralExpression(focusValue) || !focusValue.elements.every(ts.isStringLiteral)) {
    throw new Error('FOCUS_POINTS must be a literal string array for this checker')
  }
  if (!ts.isNumericLiteral(frameValue)) throw new Error('FRAMES_PER_NODE must be a numeric literal')
  const focusPoints = focusValue.elements.map(e => e.text)
  const framesPerNode = Number(frameValue.text)
  const nodes = gltf.nodes ?? []
  const active = new Set()
  const parent = new Map()
  function visit(index, parentIndex) {
    if (active.has(index)) return
    if (!nodes[index]) throw new Error(`Scene references missing node ${index}`)
    active.add(index)
    if (parentIndex !== undefined) parent.set(index, parentIndex)
    for (const child of nodes[index].children ?? []) visit(child, index)
  }
  const scene = gltf.scenes?.[gltf.scene ?? 0]
  if (!scene) throw new Error('GLB has no loadable default scene')
  for (const index of scene.nodes ?? []) visit(index)
  const sceneNodes = [...active].map(index => nodes[index])
  const names = sceneNodes.map(node => node.name)
  console.log(`Model: ${modelPath}\nSize: ${(bytes.length / 1048576).toFixed(2)} MiB`)
  check(focusPoints.length > 0 && new Set(focusPoints).size === focusPoints.length, 'FOCUS_POINTS is non-empty and has no duplicates')
  check(framesPerNode > 0, 'FRAMES_PER_NODE is positive')
  check(names.includes('focus-start') || names.includes('focus-0'), 'Hero anchor: focus-start or focus-0')
  for (const name of focusPoints) check(names.filter(n => n === name).length === 1, `Exactly one timeline anchor: ${name}`)
  const cameraIndices = [...active].filter(i => Number.isInteger(nodes[i].camera) && gltf.cameras?.[nodes[i].camera])
  check(cameraIndices.length > 0, 'Camera belongs to the default scene')
  const cameraTargets = new Set(cameraIndices)
  for (const index of cameraIndices) {
    let current = index
    while (parent.has(current)) {
      current = parent.get(current)
      cameraTargets.add(current)
    }
  }
  const clip = gltf.animations?.find(animation => animation.name === 'CameraAction')
  check(Boolean(clip), 'Animation named CameraAction')
  if (clip) {
    check(clip.channels?.some(channel => cameraTargets.has(channel.target?.node) && ['translation', 'rotation', 'scale'].includes(channel.target?.path)), 'CameraAction animates a camera or its parent')
    const maxima = (clip.samplers ?? []).map(sampler => gltf.accessors?.[sampler.input]?.max?.[0])
    if (maxima.length && maxima.every(v => Number.isFinite(v) && v >= 0)) {
      const totalFrames = Math.max(...maxima) * 24
      console.log(`Timeline: ${totalFrames.toFixed(1)} frames at 24 fps; ${focusPoints.length} focus points`)
      check(totalFrames > focusPoints.length * framesPerNode, 'Animation has a works segment after the final timeline stop')
    } else {
      warn('Animation accessor max metadata unavailable; check duration in the editor')
    }
  }
  const resume = await initializer('src/ui/Resume.tsx', 'RESUME')
  for (const language of ['en', 'zh']) {
    const entries = property(property(resume, language), 'entries')
    if (!entries || !ts.isArrayLiteralExpression(entries)) throw new Error(`Cannot count ${language} résumé entries`)
    check(entries.elements.length === focusPoints.length, `${language} résumé entries match ${focusPoints.length} focus points`)
  }
  if (!names.includes('focus-works')) warn('No focus-works: the scene will reuse the last timeline anchor')
  const eyes = sceneNodes.filter(node => Number.isInteger(node.mesh) && /eye/i.test(node.name ?? ''))
  if (!eyes.length) warn('No eye-named mesh: mouse-following eyes will be disabled')
  else console.log(`Eye meshes: ${eyes.map(node => node.name).join(', ')}`)
  const external = [...(gltf.buffers ?? []), ...(gltf.images ?? [])].filter(asset => asset.uri && !asset.uri.startsWith('data:'))
  if (external.length) warn(`${external.length} external resources must be copied beside the GLB`)
  console.log(`\n${errors} errors, ${warnings} warnings. Check likeness, materials, eye pivots and camera framing visually.`)
  process.exitCode = errors ? 1 : 0
}

main().catch(error => {
  console.error(`FAIL ${error.message}`)
  process.exitCode = 1
})
