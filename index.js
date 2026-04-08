const { mouse, screen, Point } = require('@nut-tree-fork/nut-js')
const os = require('os')
const cliProgress = require('cli-progress')
const colors = require('colors')

// Mouse movement speed config
mouse.config.mouseSpeed = 2000
mouse.config.autoDelayMs = 0
const MOVE_DELAY = 5 // ms delay between each step (higher = slower)

// Initialize the progress bar
const progressBar = new cliProgress.SingleBar(
  {
    format: `Mouse Movement Progress |{bar}| {percentage}% | {value}/{total} Steps`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  },
  cliProgress.Presets.shades_classic
)

/**
 * Get a random color from the colors package.
 * @returns {function} A color function from the colors package.
 */
const getRandomColor = () => {
  const colorList = [
    colors.red,
    colors.green,
    colors.yellow,
    colors.blue,
    colors.magenta,
    colors.cyan,
    colors.white,
  ]
  return colorList[Math.floor(Math.random() * colorList.length)]
}

let currentColor = getRandomColor() // Initialize the color for the progress bar

/**
 * Format elapsed time in HH:MM:SS.
 * @param {number} milliseconds - Time in milliseconds.
 * @returns {string} Formatted time string.
 */
const formatElapsedTime = milliseconds => {
  let totalSeconds = Math.floor(milliseconds / 1000)
  let hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  let minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format time in 12-hour format.
 * @param {number} milliseconds - Time in milliseconds.
 * @returns {string} Formatted time string.
 */
const format12HourTime = milliseconds => {
  const date = new Date(milliseconds)
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
}

const startTime = Date.now()
const startTimeFormatted = format12HourTime(startTime)
let cycleCount = 0

/**
 * Display runtime duration, cycle count, RAM usage, and CPU usage.
 */
const displayStats = () => {
  const currentTime = Date.now()
  const elapsedTime = currentTime - startTime
  const memoryUsage = process.memoryUsage().rss / (1024 * 1024) // Convert from bytes to MB
  const cpuUsage = os.loadavg()[0] // Get the 1-minute load average

  console.clear()
  console.log('Mouse Mover is running. Press CTRL + C to exit.')
  console.log(`Program started at: ${startTimeFormatted}`)
  console.log(`Elapsed Time: ${formatElapsedTime(elapsedTime)}`)
  console.log(`Mouse Cycles: ${cycleCount}`)
  console.log(`Memory Usage: ${memoryUsage.toFixed(2)} MB`)
  console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Move the mouse graphing the digits of Pi.
 * Each digit (3.14159265358979...) becomes a height on screen.
 */
const moveMouseInPiGraph = async (width, height) => {
  const piDigits = '3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647'
  const totalDigits = piDigits.length
  const segmentWidth = width / totalDigits
  const totalSteps = totalDigits * Math.floor(segmentWidth)
  const maxDigit = 9
  const margin = 50

  progressBar.start(totalSteps, 0)
  let stepCount = 0

  for (let d = 0; d < totalDigits; d++) {
    const digit = parseInt(piDigits[d])
    const nextDigit = d < totalDigits - 1 ? parseInt(piDigits[d + 1]) : digit

    const yFrom = margin + ((maxDigit - digit) / maxDigit) * (height - margin)
    const yTo = margin + ((maxDigit - nextDigit) / maxDigit) * (height - margin)

    const stepsInSegment = Math.floor(segmentWidth)
    for (let s = 0; s < stepsInSegment; s++) {
      const t = s / stepsInSegment
      const x = d * segmentWidth + s
      const y = yFrom + (yTo - yFrom) * t // smooth interpolation between digits
      await mouse.setPosition(new Point(Math.round(x), Math.round(y)))
      stepCount++
      progressBar.update(stepCount)
      await sleep(MOVE_DELAY)
    }
  }

  progressBar.stop()
  cycleCount++
  displayStats()
}

/**
 * Main function to move the mouse with Pi pattern.
 */
const moveMouseCycle = async (width, height) => {
  currentColor = getRandomColor()
  progressBar.barCompleteChar = currentColor('\u2588')

  await moveMouseInPiGraph(width, height)
}

/**
 * Display the summary when the program is terminated.
 */
const displaySummary = () => {
  const endTime = Date.now()
  const elapsedTime = endTime - startTime
  const endTimeFormatted = format12HourTime(endTime)
  const memoryUsage = process.memoryUsage().rss / (1024 * 1024) // Convert from bytes to MB
  const cpuUsage = os.loadavg()[0] // Get the 1-minute load average

  console.clear()
  console.log('\nSummary:')
  console.log(`Start Time: ${startTimeFormatted}`)
  console.log(`End Time: ${endTimeFormatted}`)
  console.log(`Elapsed Time: ${formatElapsedTime(elapsedTime)}`)
  console.log(`Mouse Cycles: ${cycleCount}`)
  console.log(`Memory Usage: ${memoryUsage.toFixed(2)} MB`)
  console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`)
  process.exit()
}

// Listen for the program termination (CTRL + C)
process.on('SIGINT', displaySummary)

// Main entry point
async function main() {
  const screenWidth = await screen.width()
  const screenHeight = await screen.height()
  const height = screenHeight / 2 - 10
  const width = screenWidth

  displayStats()

  // Run mouse movement loop every 2 seconds
  const loop = async () => {
    while (true) {
      await moveMouseCycle(width, height)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  loop()
}

main().catch(console.error)
