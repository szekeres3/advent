"use strict"

const taskElem = document.getElementById('task-today')
const dateElem = document.getElementById('task-date')
const firstDateButton = document.getElementById('first-date')
const reloadButton = document.getElementById('reload-tasks')
const modal = new bootstrap.Modal('#not-found-modal', { toggle: false })
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

const reloadSchedule = async function () {
    const data = await getSchedule()
    localStorage.setItem(appKey, JSON.stringify(data))
    schedule = data
}

reloadButton.addEventListener('click', reloadSchedule)

const getSchedule = async function () {
    const res = await fetch('https://raw.githubusercontent.com/szekeres3/advent/refs/heads/main/src/tasks/schedule.json')
    const data = await res.json()

    return data
}

const loadMd = async function (name) {
    const res = await fetch(`https://raw.githubusercontent.com/szekeres3/advent/refs/heads/main/src/tasks/${name}`)
    const data = await res.text()

    taskElem.innerHTML = md.render(data)
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