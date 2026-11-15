"use strict"

const taskElem = document.getElementById('task-today')
const dateElem = document.getElementById('task-date')
const firstDateButton = document.getElementById('first-date')
const reloadButton = document.getElementById('reload-tasks')
const importButton = document.getElementById('import-tasks')
const importFileInput = document.getElementById('import-taskfile')
const modal = new bootstrap.Modal('#not-found-modal', { toggle: false })
const imodal = new bootstrap.Modal('#import-modal', { toggle: false })
const appKey = 'advent-elte'

let schedule = {}
let md = null

const changeMd = function (pickDate) {
    if (!(schedule[pickDate])) {
        modal.show()
    } else {
        const fileName = schedule[pickDate][0]
        loadMd(fileName)
    }
}

firstDateButton.addEventListener('click', function () {
    const pickDate = '2026-12-01'
    dateElem.value = pickDate
    changeMd(pickDate)
})

dateElem.addEventListener('change', function (event) {
    const pickDate = event.target.value
    changeMd(pickDate)
})

const reloadSchedule = async function (force = false) {
    const data = await getSchedule(force)
    localStorage.setItem(appKey, JSON.stringify(data))
    schedule = data
}

const importTempTask = async function () {
    imodal.show()
}

const handleTaskFile = async function (event) { // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    const file = event.target.files[0]

    if (!file) {
        return
    }

    const reader = new FileReader()

    reader.readAsText(file)

    reader.onload = function () {
        displayMd(reader.result)
        imodal.hide()
    }
}

reloadButton.addEventListener('click', () => reloadSchedule(true))
importButton.addEventListener('click', importTempTask)
importFileInput.addEventListener('change', handleTaskFile)

const getSchedule = async function (force = false) {
    const res = await fetch('https://raw.githubusercontent.com/szekeres3/advent/refs/heads/main/src/tasks/schedule.json', {
        cache: force ? 'no-cache' : 'default'
    })
    const data = await res.json()

    return data
}

const displayMd = function (htmlDt) {
    taskElem.innerHTML = md.render(htmlDt)
}

const loadMd = async function (name) {
    const res = await fetch(`https://raw.githubusercontent.com/szekeres3/advent/refs/heads/main/src/tasks/${name}`)
    const data = await res.text()

    displayMd(data)
}


const main = async function () {
    md = new markdownit()

    const sstore = localStorage.getItem(appKey)
    if (!sstore) {
        await reloadSchedule()
    } else {
        schedule = JSON.parse(sstore)
    }

    const kfile = schedule['2026-12-01'][0]
    loadMd(kfile)
}

main()