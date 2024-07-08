const robot = require('robotjs')
const os = require('os')
const cliProgress = require('cli-progress')
const colors = require('colors')

// Initialize the progress bar
const progressBar = new cliProgress.SingleBar(
  {
    format:
      'Mouse Movement Progress |' +
      colors.cyan('{bar}') +
      '| {percentage}% | {value}/{total} Cycles',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  },
  cliProgress.Presets.shades_classic
)

/**
 * Main function to move the mouse across the screen with random patterns and speeds.
 */
;(() => {
  console.clear()
  console.log('Mouse Mover is running. Press CTRL + C to exit.')

  const screenSize = robot.getScreenSize()
  const height = screenSize.height / 2 - 10
  const width = screenSize.width

  const startTime = Date.now()
  let cycleCount = 0
  const totalCycles = 100 // Set the total number of cycles for the progress bar
  progressBar.start(totalCycles, 0)

  /**
   * Function to format elapsed time in HH:MM:SS.
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
   * Function to format time in 12-hour format.
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

  const startTimeFormatted = format12HourTime(startTime)
  console.log(`Program started at: ${startTimeFormatted}`)

  /**
   * Function to display runtime duration, cycle count, RAM usage, and CPU usage.
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

  /**
   * Function to move the mouse in a sine wave pattern.
   */
  const moveMouseInSineWave = () => {
    const twoPI = Math.PI * 2.0
    for (let x = 0; x < width; x++) {
      const y = height * Math.sin((twoPI * x) / width) + height
      robot.moveMouse(x, y)
    }
  }

  /**
   * Function to move the mouse in a zigzag pattern.
   */
  const moveMouseInZigzag = () => {
    const step = 20
    for (let x = 0; x < width; x += step) {
      const y = (x / step) % 2 === 0 ? height - 20 : height + 20
      robot.moveMouse(x, y)
    }
  }

  /**
   * Function to move the mouse in a circular pattern.
   */
  const moveMouseInCircle = () => {
    const radius = height / 2
    const centerX = width / 2
    const centerY = height
    for (let angle = 0; angle < 360; angle++) {
      const radian = (angle * Math.PI) / 180
      const x = centerX + radius * Math.cos(radian)
      const y = centerY + radius * Math.sin(radian)
      robot.moveMouse(x, y)
    }
  }

  /**
   * Function to randomly select a movement pattern.
   */
  const getRandomPattern = () => {
    const patterns = [moveMouseInSineWave, moveMouseInZigzag, moveMouseInCircle]
    return patterns[Math.floor(Math.random() * patterns.length)]
  }

  /**
   * Main function to move the mouse with random speed and pattern.
   */
  const moveMouseRandomly = () => {
    const randomPattern = getRandomPattern()
    const randomDelay = Math.floor(Math.random() * 5) + 1 // Random delay between 1 and 5 ms
    robot.setMouseDelay(randomDelay)
    randomPattern()
    cycleCount++
    displayStats()
    progressBar.update(cycleCount)

    if (cycleCount >= totalCycles) {
      progressBar.stop()
      clearInterval(interval)
      displaySummary()
    }
  }

  // Set an interval to move the mouse and display stats every second
  const interval = setInterval(moveMouseRandomly, 1000)

  /**
   * Function to display the summary when the program is terminated.
   */
  const displaySummary = () => {
    const endTime = Date.now()
    const elapsedTime = endTime - startTime
    const endTimeFormatted = format12HourTime(endTime)
    const memoryUsage = process.memoryUsage().rss / (1024 * 1024) // Convert from bytes to MB
    const cpuUsage = os.loadavg()[0] // Get the 1-minute load average

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
})()
